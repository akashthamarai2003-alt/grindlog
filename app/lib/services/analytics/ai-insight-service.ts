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

export class AIInsightService {
  
  static async generateWeeklyReview(userId: string, period: AnalyticsPeriod = '30D', forceRefresh = false): Promise<AIProgressReview | null> {
    const supabase = await createServerSupabase();
    const now = new Date();
    const startDate = new Date(now.getTime());
    
    // Calculate period length
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

    // Check cache
    if (!forceRefresh) {
      const { data: cached } = await supabase
        .from('fitness_os_ai_insights')
        .select('*')
        .eq('user_id', userId)
        .eq('period_start', startDateStr)
        .eq('period_end', nowStr)
        .eq('insight_type', 'progress_review')
        .order('generated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cached) {
        // Only return if it's less than 24 hours old
        const ageHours = (now.getTime() - new Date(cached.generated_at).getTime()) / (1000 * 60 * 60);
        if (ageHours < 24) {
          return {
            summary: cached.summary,
            strengths: cached.strengths || [],
            weaknesses: cached.weaknesses || [],
            recommendations: cached.recommendations || [],
            generatedAt: cached.generated_at
          };
        }
      }
    }

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

    try {
      const response = await generateAIResponseJSON<RawAIReview>({
        systemPrompt,
        userPrompt: contextPrompt,
        model: "fast"
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

      return {
        summary: response.summary,
        strengths: strengthsList,
        weaknesses: weaknessesList,
        recommendations: recommendationsList,
        generatedAt: inserted?.generated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error("AI Insight Generation Failed:", error);
      return null;
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
