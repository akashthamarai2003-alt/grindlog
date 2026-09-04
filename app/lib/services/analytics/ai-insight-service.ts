import { createServerSupabase } from "@/lib/services/supabase/server";
import { ProgressAnalyticsService } from "./progress-service";
import { generateAIResponseJSON, generateAIResponse } from "@/lib/services/groq/client";
import { AnalyticsPeriod, AIProgressReview, AggregatedProgressPayload } from "@/types/fitness/analytics";

interface RawAIReview {
  summary: string;
  status: "on_track" | "improving" | "plateau" | "inconsistent";
  strengths: string[];
  weaknesses: string[];
  recommendations: {
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[];
  metrics: {
    weight_change: number;
    workout_consistency: number;
    protein_consistency: number;
  };
}

// Prevent concurrent duplicate executions per user
const activeUserGenerations = new Set<string>();

function getLocalDateString(date: Date, timezoneOffsetMinutes?: number): string {
  if (typeof timezoneOffsetMinutes === 'number' && !isNaN(timezoneOffsetMinutes)) {
    // Subtract timezoneOffsetMinutes to convert UTC to local time
    const localTime = new Date(date.getTime() - timezoneOffsetMinutes * 60 * 1000);
    return localTime.toISOString().split('T')[0];
  }
  return date.toISOString().split('T')[0];
}

export interface DailyLimitCheckResult {
  hasGeneratedToday: boolean;
  canGenerateToday: boolean;
  latestReview: AIProgressReview | null;
  generatedAt: string | null;
  todayDate: string;
}

export interface GenerateReviewResult {
  review: AIProgressReview | null;
  limitReached: boolean;
  canGenerateToday: boolean;
  error?: string;
}

export class AIInsightService {
  
  /**
   * Check if a user has already generated an AI review today.
   * Compares the user's local date or UTC date against the latest insight in fitness_os_ai_insights.
   */
  static async checkDailyGenerationLimit(
    userId: string,
    clientDate?: string,
    timezoneOffset?: number
  ): Promise<DailyLimitCheckResult> {
    const supabase = await createServerSupabase();
    const now = new Date();
    const todayDateStr = (clientDate && /^\d{4}-\d{2}-\d{2}$/.test(clientDate))
      ? clientDate
      : getLocalDateString(now, timezoneOffset);

    const { data: latest } = await supabase
      .from('fitness_os_ai_insights')
      .select('*')
      .eq('user_id', userId)
      .eq('insight_type', 'progress_review')
      .order('generated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!latest) {
      return {
        hasGeneratedToday: false,
        canGenerateToday: true,
        latestReview: null,
        generatedAt: null,
        todayDate: todayDateStr,
      };
    }

    const genDate = new Date(latest.generated_at);
    const genLocalDateStr = getLocalDateString(genDate, timezoneOffset);
    const genUtcDateStr = genDate.toISOString().split('T')[0];
    const nowUtcDateStr = now.toISOString().split('T')[0];

    // Check if the review was generated today (local date, client date, or UTC date)
    const hasGeneratedToday =
      genLocalDateStr === todayDateStr ||
      genUtcDateStr === nowUtcDateStr ||
      (clientDate ? genUtcDateStr === clientDate : false);

    const mappedReview: AIProgressReview = {
      summary: latest.summary,
      strengths: latest.strengths || [],
      weaknesses: latest.weaknesses || [],
      recommendations: latest.recommendations || [],
      generatedAt: latest.generated_at,
      canGenerateToday: !hasGeneratedToday,
    };

    return {
      hasGeneratedToday,
      canGenerateToday: !hasGeneratedToday,
      latestReview: mappedReview,
      generatedAt: latest.generated_at,
      todayDate: todayDateStr,
    };
  }

  static async generateWeeklyReview(
    userId: string,
    period: AnalyticsPeriod = '30D',
    forceRefresh = false,
    clientDate?: string,
    timezoneOffset?: number
  ): Promise<GenerateReviewResult> {
    const supabase = await createServerSupabase();
    const now = new Date();

    // 1. Strictly enforce 1-use-per-day rate limit per user
    const limitCheck = await this.checkDailyGenerationLimit(userId, clientDate, timezoneOffset);
    if (limitCheck.hasGeneratedToday) {
      return {
        review: limitCheck.latestReview,
        limitReached: true,
        canGenerateToday: false,
        error: "Daily limit reached. You can generate 1 AI progress review per day. Next review available tomorrow.",
      };
    }

    // 2. If not forceRefresh and we already have a review cached, return it
    if (!forceRefresh && limitCheck.latestReview) {
      return {
        review: limitCheck.latestReview,
        limitReached: false,
        canGenerateToday: true,
      };
    }

    // 3. Prevent duplicate in-flight requests from the same user
    if (activeUserGenerations.has(userId)) {
      return {
        review: limitCheck.latestReview,
        limitReached: false,
        canGenerateToday: false,
        error: "An AI review generation is already in progress. Please wait a moment.",
      };
    }

    activeUserGenerations.add(userId);

    try {
      const startDate = new Date(now.getTime());
      let periodDays = 30;
      switch (period) {
        case '7D': startDate.setDate(now.getDate() - 7); periodDays = 7; break;
        case '30D': startDate.setDate(now.getDate() - 30); periodDays = 30; break;
        case '3M': startDate.setMonth(now.getMonth() - 3); periodDays = 90; break;
        case '6M': startDate.setMonth(now.getMonth() - 6); periodDays = 180; break;
        case 'ALL': startDate.setFullYear(2000); periodDays = 365; break;
      }

      const startDateStr = startDate.toISOString().split('T')[0];
      const nowStr = now.toISOString().split('T')[0];

      // Fetch Analytics for Current and Previous Period in parallel
      const previousDate = new Date(startDate.getTime());
      const [current, previous] = await Promise.all([
        ProgressAnalyticsService.getAggregatedProgress(userId, period),
        ProgressAnalyticsService.getAggregatedProgress(userId, period, previousDate)
      ]);

      // Build Context String
      const contextPrompt = `
      USER GOAL:
      Starting Weight: ${current.transformation.startingWeight || 'N/A'} kg
      Current Weight: ${current.transformation.currentWeight || 'N/A'} kg
      Target Weight: ${current.transformation.targetWeight || 'N/A'} kg
      Transformation Day: ${current.transformation.transformationDay}

      CURRENT PERIOD (${periodDays} days):
      Workouts: ${current.workout.completedWorkouts}/${current.workout.totalWorkouts} (${current.workout.completionRate.toFixed(0)}%)
      Volume: ${current.workout.trainingVolumeKg} kg
      Nutrition: ${current.nutrition.averageCalories} avg cals, ${current.nutrition.averageProtein}g protein (Target: ${current.nutrition.proteinTarget}g)
      Steps: ${current.activity.averageDailySteps} (Target: ${current.activity.stepTarget})
      Sleep: ${current.recovery.averageSleepHours} hrs/night (Quality: ${current.recovery.averageSleepQuality}%)

      PREVIOUS PERIOD DELTAS (vs previous ${periodDays} days):
      Weight Change vs Prev: ${((current.transformation.currentWeight || 0) - (previous.transformation.currentWeight || 0)).toFixed(1)} kg
      Workout Volume Diff: ${current.workout.trainingVolumeKg - previous.workout.trainingVolumeKg} kg
      Steps Diff: ${current.activity.averageDailySteps - previous.activity.averageDailySteps} steps
    `;

      const systemPrompt = `You are GrindLog's elite AI Fitness Coach. 
You are reviewing the user's progress analytics.
Your job is to identify what is going well, what is limiting progress, and what they should prioritize next.
Keep recommendations concise, highly actionable, and grounded ONLY in the provided metrics.
Do NOT invent numbers. Do NOT make medical claims or diagnose injuries. If the user reports pain (not provided here, but generally), recommend stopping the activity.
You MUST output perfectly formatted JSON matching this exact structure:
{
  "summary": "2-3 sentences summarizing progress.",
  "status": "on_track | improving | plateau | inconsistent",
  "strengths": ["string", "string"],
  "weaknesses": ["string"],
  "recommendations": [
    { "title": "...", "description": "...", "priority": "high | medium | low" }
  ],
  "metrics": {
    "weight_change": number,
    "workout_consistency": number,
    "protein_consistency": number
  }
}`;

      // Exclusively call Groq AI with optimized token limits
      const response = await generateAIResponseJSON<RawAIReview>({
        systemPrompt,
        userPrompt: contextPrompt,
        model: "fast",
        maxTokens: 800,
        temperature: 0.2
      });

      // Map recommendations safely whether array of objects or array of strings
      const rawRecs = Array.isArray(response?.recommendations) ? response.recommendations : [];
      const recommendationsList = rawRecs.map((r: any) => {
        if (typeof r === 'string') return r;
        if (r && typeof r === 'object') {
          if (r.title && r.description) return `${r.title}: ${r.description}`;
          if (r.title) return r.title;
          if (r.description) return r.description;
        }
        return String(r || '');
      }).filter(Boolean);

      const strengthsList = (Array.isArray(response?.strengths) ? response.strengths : [])
        .map((s: any) => typeof s === 'string' ? s : JSON.stringify(s))
        .filter(Boolean);

      const weaknessesList = (Array.isArray(response?.weaknesses) ? response.weaknesses : [])
        .map((w: any) => typeof w === 'string' ? w : JSON.stringify(w))
        .filter(Boolean);

      // Save to database
      const { data: inserted, error } = await supabase
        .from('fitness_os_ai_insights')
        .insert({
          user_id: userId,
          period_start: startDateStr,
          period_end: nowStr,
          insight_type: 'progress_review',
          summary: response.summary,
          strengths: strengthsList,
          weaknesses: weaknessesList,
          recommendations: recommendationsList
        })
        .select()
        .single();

      if (error) {
        console.error("Failed to save AI insight:", error);
      }

      const generatedReview: AIProgressReview = {
        summary: response.summary,
        strengths: strengthsList,
        weaknesses: weaknessesList,
        recommendations: recommendationsList,
        generatedAt: inserted?.generated_at || new Date().toISOString(),
        canGenerateToday: false,
      };

      return {
        review: generatedReview,
        limitReached: true,
        canGenerateToday: false,
      };
    } catch (error: any) {
      console.error("AI Insight Generation Failed:", error);
      return {
        review: null,
        limitReached: false,
        canGenerateToday: true,
        error: error.message || "AI insight generation failed",
      };
    } finally {
      activeUserGenerations.delete(userId);
    }
  }

  static async askProgressQuestion(userId: string, messages: {role: "user"|"assistant", content: string}[]): Promise<string> {
    const current = await ProgressAnalyticsService.getAggregatedProgress(userId, '30D');
    
    const contextPrompt = `
      USER CONTEXT (Last 30 Days):
      Weight: ${current.transformation.currentWeight || 'N/A'} kg (Target: ${current.transformation.targetWeight || 'N/A'} kg)
      Workouts: ${current.workout.completedWorkouts}/${current.workout.totalWorkouts} (${current.workout.completionRate.toFixed(0)}%)
      Volume: ${current.workout.trainingVolumeKg} kg
      Nutrition: ${current.nutrition.averageCalories} avg cals, ${current.nutrition.averageProtein}g protein (Target: ${current.nutrition.proteinTarget}g)
      Steps: ${current.activity.averageDailySteps} (Target: ${current.activity.stepTarget})
      Sleep: ${current.recovery.averageSleepHours} hrs/night
    `;

    const systemPrompt = `You are GrindLog's elite AI Fitness Coach answering a specific user question about their progress.
    Use the provided analytics context to inform your answer. 
    IMPORTANT: If a metric is 0, missing, or N/A (e.g. 0 hours of sleep, 0 calories), it simply means the user hasn't logged that data yet today. DO NOT comment on it, do not assume they slept 0 hours, and do not offer advice based on 0 values. Only reference metrics that have real data.
    Keep your response extremely concise, conversational, and direct (1-3 sentences max unless the user asks for a detailed plan). 
    Do NOT list out all metrics or provide a full review unless specifically asked. If the user just says "hi", greet them back briefly.
    Keep your response supportive, highly specific, and actionable. Use markdown for bolding (**bold**) or bullet points if needed.
    Do NOT give medical advice or diagnose injuries.\n\n${contextPrompt}`;

    try {
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })) as { role: "system" | "user" | "assistant"; content: string }[];

      const finalMessages = [
        { role: "system" as const, content: systemPrompt },
        ...formattedMessages
      ];

      const responseText = await generateAIResponse({
        messages: finalMessages,
        model: "primary"
      });
      return responseText;
    } catch (error) {
      console.error("Ask Progress AI Failed:", error);
      return "I'm having trouble analyzing your progress right now. Please try again in a moment.";
    }
  }
}
