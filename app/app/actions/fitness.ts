"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { OnboardingSchema, OnboardingData } from "@/types/fitness/onboarding";
import { 
  StartWorkoutSchema, 
  CompleteSetSchema, 
  SessionActionSchema 
} from "@/types/fitness/workout";
import { revalidatePath } from "next/cache";

export async function saveFitnessOnboardingAction(payload: Partial<OnboardingData>) {
  const supabase = await createServerSupabase();
  
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Server-side Zod Validation
  const result = OnboardingSchema.safeParse(payload);
  
  if (!result.success) {
    console.error("Fitness Onboarding Validation Error:", result.error.format());
    return { success: false, error: "Invalid data provided" };
  }

  const validData = result.data;

  let bmi = null;
  if (validData.height && validData.weight) {
    const heightInMeters = validData.height / 100;
    bmi = parseFloat((validData.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  let baseline_calories = null;
  if (validData.weight && validData.height && validData.age && validData.gender) {
    let bmr = 0;
    if (validData.gender === "Male") {
      bmr = 10 * validData.weight + 6.25 * validData.height - 5 * validData.age + 5;
    } else if (validData.gender === "Female") {
      bmr = 10 * validData.weight + 6.25 * validData.height - 5 * validData.age - 161;
    } else {
      bmr = 10 * validData.weight + 6.25 * validData.height - 5 * validData.age - 78;
    }

    const activityMultipliers: Record<string, number> = {
      "Mostly sedentary": 1.2,
      "Lightly active": 1.375,
      "Moderately active": 1.55,
      "Very active": 1.725
    };
    const multiplier = validData.activity_level ? (activityMultipliers[validData.activity_level] || 1.2) : 1.2;
    baseline_calories = Math.round(bmr * multiplier);
  }

  let initial_protein_target = null;
  if (validData.weight) {
    let proteinMultiplier = 1.6;
    if (validData.goal === "Build Muscle" || validData.goal === "Gain Weight" || validData.goal === "Lose Fat + Build Muscle") {
      proteinMultiplier = 2.0;
    } else if (validData.goal === "Build Strength") {
      proteinMultiplier = 1.8;
    }
    initial_protein_target = Math.round(validData.weight * proteinMultiplier);
  }

  const weight_trend_baseline = validData.weight || null;

  // Insert or Update logic based on UNIQUE user_id
  const { error: upsertError } = await supabase
    .from("fitness_os_profiles")
    .upsert(
      { 
        user_id: user.id, 
        ...validData,
        bmi,
        baseline_calories,
        initial_protein_target,
        weight_trend_baseline,
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    console.error("Failed to save fitness profile:", upsertError);
    return { success: false, error: "Failed to save profile. Please try again." };
  }

  revalidatePath("/fitness");
  revalidatePath("/fitness/profile");
  return { success: true };
}

export async function updateFitnessProfilePartialAction(payload: Record<string, any>) {
  const supabase = await createServerSupabase();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return { success: false, error: "Not authenticated" };
  }

  // Calculate BMI if height and weight updated
  let updates: Record<string, any> = { ...payload };
  if (updates.height && updates.weight) {
    const heightInMeters = updates.height / 100;
    updates.bmi = parseFloat((updates.weight / (heightInMeters * heightInMeters)).toFixed(1));
  }

  updates.updated_at = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("fitness_os_profiles")
    .update(updates)
    .eq("user_id", user.id);

  if (updateError) {
    console.error("Failed to update profile:", updateError);
    return { success: false, error: "Failed to update details" };
  }

  revalidatePath("/fitness");
  revalidatePath("/fitness/profile");
  return { success: true };
}

export async function startWorkoutSessionAction(payload: { workoutId: string }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = StartWorkoutSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: "Invalid workout ID" };
  const { workoutId } = parsed.data;

  // Verify workout ownership and startability
  const { data: workout, error: workoutError } = await supabase
    .from("fitness_os_workouts")
    .select("status, user_id")
    .eq("id", workoutId)
    .single();

  if (workoutError || !workout) return { success: false, error: "Workout not found" };
  if (workout.user_id !== user.id) return { success: false, error: "Unauthorized" };
  if (workout.status === "completed") return { success: false, error: "Workout already completed" };

  // Check duplicate active session
  const { data: existingSession } = await supabase
    .from("fitness_os_workout_sessions")
    .select("id")
    .eq("workout_id", workoutId)
    .eq("user_id", user.id)
    .in("status", ["active", "paused"])
    .maybeSingle();

  if (existingSession) {
    return { success: true, data: { sessionId: existingSession.id } };
  }

  const now = new Date().toISOString();

  // Create session
  const { data: newSession, error: sessionError } = await supabase
    .from("fitness_os_workout_sessions")
    .insert({
      user_id: user.id,
      workout_id: workoutId,
      started_at: now,
      status: "active"
    })
    .select("id")
    .single();

  if (sessionError || !newSession) {
    console.error(sessionError);
    return { success: false, error: "Failed to create session" };
  }

  // Update workout
  await supabase
    .from("fitness_os_workouts")
    .update({ status: "in_progress", started_at: now })
    .eq("id", workoutId);

  revalidatePath(`/fitness/workout/${workoutId}`);
  return { success: true, data: { sessionId: newSession.id } };
}

export async function completeSetAction(payload: { setId: string; actualReps?: number | null; weightKg?: number | null; durationSeconds?: number | null }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = CompleteSetSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: "Invalid data provided" };
  const { setId, actualReps, weightKg, durationSeconds } = parsed.data;

  // 1. Verify set + exercise + workout ownership
  const { data: setRecord, error: setError } = await supabase
    .from("fitness_os_sets")
    .select(`
      id, completed,
      fitness_os_exercises!inner(
        workout_id,
        fitness_os_workouts!inner(
          user_id, status
        )
      )
    `)
    .eq("id", setId)
    .single();

  if (setError || !setRecord) return { success: false, error: "Set not found" };

  // Type assertion for Supabase joined response
  const exercise = setRecord.fitness_os_exercises as any;
  const workout = exercise?.fitness_os_workouts as any;

  if (workout?.user_id !== user.id) return { success: false, error: "Unauthorized" };
  if (workout?.status === "completed") return { success: false, error: "Workout is already completed" };
  if (setRecord.completed) return { success: false, error: "Set already completed." };

  const now = new Date().toISOString();

  const { error: updateError } = await supabase
    .from("fitness_os_sets")
    .update({
      completed: true,
      completed_at: now,
      actual_reps: actualReps ?? null,
      weight_kg: weightKg ?? null,
      duration_seconds: durationSeconds ?? null
    })
    .eq("id", setId);

  if (updateError) {
    console.error(updateError);
    return { success: false, error: "Failed to complete set" };
  }

  revalidatePath(`/fitness/workout/${exercise.workout_id}`);
  return { success: true };
}

export async function pauseWorkoutSessionAction(payload: { sessionId: string }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = SessionActionSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: "Invalid session ID" };
  const { sessionId } = parsed.data;

  const { data: session } = await supabase
    .from("fitness_os_workout_sessions")
    .select("user_id, status, workout_id")
    .eq("id", sessionId)
    .single();

  if (!session) return { success: false, error: "Session not found" };
  if (session.user_id !== user.id) return { success: false, error: "Unauthorized" };
  if (session.status !== "active") return { success: false, error: "Session is not active" };

  const now = new Date().toISOString();
  await supabase
    .from("fitness_os_workout_sessions")
    .update({ status: "paused", paused_at: now })
    .eq("id", sessionId);

  revalidatePath(`/fitness/workout/${session.workout_id}`);
  return { success: true };
}

export async function resumeWorkoutSessionAction(payload: { sessionId: string }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = SessionActionSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: "Invalid session ID" };
  const { sessionId } = parsed.data;

  const { data: session } = await supabase
    .from("fitness_os_workout_sessions")
    .select("user_id, status, started_at, paused_at, duration_seconds, workout_id")
    .eq("id", sessionId)
    .single();

  if (!session) return { success: false, error: "Session not found" };
  if (session.user_id !== user.id) return { success: false, error: "Unauthorized" };
  if (session.status !== "paused") return { success: false, error: "Session is not paused" };

  // Calculate elapsed pause time and adjust duration internally if needed.
  // We'll calculate total active duration dynamically or update `started_at` to shift it forward.
  // An easy server-side approach: Shift `started_at` forward by the paused duration.
  const pausedAt = new Date(session.paused_at as string).getTime();
  const nowMs = Date.now();
  const pauseDurationMs = nowMs - pausedAt;
  
  const originalStartedAt = new Date(session.started_at).getTime();
  const newStartedAt = new Date(originalStartedAt + pauseDurationMs).toISOString();

  await supabase
    .from("fitness_os_workout_sessions")
    .update({ 
      status: "active", 
      started_at: newStartedAt, 
      paused_at: null 
    })
    .eq("id", sessionId);

  revalidatePath(`/fitness/workout/${session.workout_id}`);
  return { success: true };
}

export async function finishWorkoutSessionAction(payload: { sessionId: string }) {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const parsed = SessionActionSchema.safeParse(payload);
  if (!parsed.success) return { success: false, error: "Invalid session ID" };
  const { sessionId } = parsed.data;

  const { data: session } = await supabase
    .from("fitness_os_workout_sessions")
    .select("user_id, status, started_at, paused_at, workout_id")
    .eq("id", sessionId)
    .single();

  if (!session) return { success: false, error: "Session not found" };
  if (session.user_id !== user.id) return { success: false, error: "Unauthorized" };
  if (session.status === "completed" || session.status === "cancelled") {
    return { success: false, error: "Session already ended" };
  }

  const nowMs = Date.now();
  let durationSeconds = 0;
  
  if (session.status === "paused" && session.paused_at) {
    const pausedAtMs = new Date(session.paused_at).getTime();
    const startedAtMs = new Date(session.started_at).getTime();
    durationSeconds = Math.floor((pausedAtMs - startedAtMs) / 1000);
  } else {
    const startedAtMs = new Date(session.started_at).getTime();
    durationSeconds = Math.floor((nowMs - startedAtMs) / 1000);
  }

  const durationMinutes = Math.floor(durationSeconds / 60);
  const now = new Date(nowMs).toISOString();

  // Complete session
  await supabase
    .from("fitness_os_workout_sessions")
    .update({
      status: "completed",
      completed_at: now,
      duration_seconds: durationSeconds
    })
    .eq("id", sessionId);

  // Complete workout
  await supabase
    .from("fitness_os_workouts")
    .update({
      status: "completed",
      completed_at: now,
      duration_minutes: durationMinutes
    })
    .eq("id", session.workout_id);

  revalidatePath(`/fitness/workout`);
  revalidatePath(`/fitness/workout/${session.workout_id}`);
  revalidatePath(`/fitness/workout/history`);
  
  return { success: true };
}
