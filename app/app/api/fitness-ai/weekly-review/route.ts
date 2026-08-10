import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/services/supabase/server";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import { WeeklyReviewSchema, WeeklyReviewData } from "@/lib/fitness/ai/schemas";
import { WEEKLY_REVIEW_SYSTEM_PROMPT, buildWeeklyReviewPrompt } from "@/lib/fitness/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authData.user.id;

    // Check rate limit
    const limitCheck = await checkFitnessAILimit(supabase, userId);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "Fitness AI daily limit reached." }, { status: 429 });
    }

    // Determine week bounds (last 7 days vs previous 7 days)
    // For simplicity, let's analyze the last 7 days ending today.
    const today = new Date();
    const weekEndStr = today.toISOString().split("T")[0];
    
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split("T")[0];

    // Check if we already reviewed this exact period today to prevent spam
    const { data: existingReview } = await supabase
      .from("fitness_os_progress_reviews")
      .select("id")
      .eq("user_id", userId)
      .eq("week_end", weekEndStr)
      .limit(1)
      .single();

    if (existingReview) {
      return NextResponse.json({ error: "You have already generated a review for this week. Please wait until tomorrow." }, { status: 400 });
    }

    // 1. Fetch Planned Workouts in range
    const { data: workouts } = await supabase
      .from("fitness_os_workouts")
      .select("id, status")
      .eq("user_id", userId)
      .gte("workout_date", weekStartStr)
      .lte("workout_date", weekEndStr);

    const workoutsPlanned = workouts?.length || 0;
    const workoutsCompleted = workouts?.filter(w => w.status === "completed").length || 0;

    // 2. Fetch Completed Sessions
    const { data: sessions } = await supabase
      .from("fitness_os_workout_sessions")
      .select("duration_seconds")
      .eq("user_id", userId)
      .gte("created_at", weekStart.toISOString())
      .lte("created_at", today.toISOString());

    const totalWorkoutMinutes = sessions?.reduce((acc, s) => acc + (s.duration_seconds ? Math.round(s.duration_seconds / 60) : 0), 0) || 0;

    // 3. Fetch Completed Sets (for exercises inside completed workouts)
    let setsCompleted = 0;
    if (workoutsCompleted > 0) {
      const completedWorkoutIds = workouts!.filter(w => w.status === "completed").map(w => w.id);
      
      const { data: exercises } = await supabase
        .from("fitness_os_exercises")
        .select("id")
        .in("workout_id", completedWorkoutIds);
        
      if (exercises && exercises.length > 0) {
        const exerciseIds = exercises.map(e => e.id);
        const { count } = await supabase
          .from("fitness_os_sets")
          .select("id", { count: "exact", head: true })
          .in("exercise_id", exerciseIds)
          .eq("completed", true);
        
        setsCompleted = count || 0;
      }
    }

    // Build Deterministic Statistics String
    const statsContext = `
Period: ${weekStartStr} to ${weekEndStr}
Workouts Planned: ${workoutsPlanned}
Workouts Completed: ${workoutsCompleted}
Completion Rate: ${workoutsPlanned > 0 ? Math.round((workoutsCompleted / workoutsPlanned) * 100) : 0}%
Sets Completed: ${setsCompleted}
Total Time Training: ${totalWorkoutMinutes} minutes
`;

    // Call AI
    const userPrompt = buildWeeklyReviewPrompt(statsContext);
    
    const aiResponse = await generateAIResponseJSON<WeeklyReviewData>({
      systemPrompt: WEEKLY_REVIEW_SYSTEM_PROMPT,
      userPrompt,
      model: "fast",
      maxTokens: 500,
    });

    // Validate Response
    const validatedData = WeeklyReviewSchema.parse(aiResponse);

    // Persist Review
    const { data: savedReview, error: saveError } = await supabase
      .from("fitness_os_progress_reviews")
      .insert({
        user_id: userId,
        week_start: weekStartStr,
        week_end: weekEndStr,
        workouts_completed: workoutsCompleted,
        workouts_planned: workoutsPlanned,
        sets_completed: setsCompleted,
        total_workout_minutes: totalWorkoutMinutes,
        ai_summary: validatedData.summary,
        ai_highlights: validatedData.highlights,
        ai_recommendations: validatedData.recommendations
      })
      .select("*")
      .single();

    if (saveError) {
      console.error("Failed to save progress review", saveError);
      throw new Error("Failed to save review");
    }

    // Log Usage
    await logFitnessAIUsage(userId, "weekly_review", userPrompt, JSON.stringify(validatedData), "fast", 500);

    return NextResponse.json({ success: true, review: savedReview });

  } catch (error: any) {
    console.error("Weekly Review API Error:", error);
    return NextResponse.json({ error: "An unexpected error occurred while analyzing your week." }, { status: 500 });
  }
}
