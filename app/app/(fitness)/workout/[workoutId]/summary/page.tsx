import { createServerSupabase } from "@/lib/services/supabase/server";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { WorkoutComplete } from "@/components/fitness/workout/workout-complete";
import { redirect } from "next/navigation";
import { WorkoutService } from "@/lib/services/fitness/workout-service";

export default async function WorkoutSummaryPage({ params }: { params: Promise<{ workoutId: string }> }) {
  const { workoutId } = await params;
  
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect(`/auth/signin?redirect=${encodeURIComponent(`/workout/${workoutId}/summary`)}`);
  }

  if (workoutId === "mock") {
    const mockWorkout = {
      id: "mock",
      name: "Upper Body",
      duration_minutes: 48,
    };
    return (
      <FitnessGuard>
        <div className="min-h-screen bg-[#0A1108] text-white flex flex-col justify-center">
          <WorkoutComplete 
            workout={mockWorkout as any}
            exerciseCount={6}
            completedSets={18}
            totalSets={18}
            actualDuration={48}
            actualCalories={312}
            userName="Athlete"
          />
        </div>
      </FitnessGuard>
    );
  }

  // Fetch full workout data including exercise names and sessions
  const { data: workout, error } = await supabase
    .from("fitness_os_workouts")
    .select(`
      *,
      fitness_os_exercises (
        id,
        name,
        fitness_os_sets (completed, weight_kg, actual_reps, completed_at)
      ),
      fitness_os_workout_sessions (*)
    `)
    .eq("id", workoutId)
    .single();

  if (error || !workout) {
    console.error("WorkoutSummaryPage query error:", error);
    redirect("/workout");
  }

  if (workout.user_id !== user.id) {
    redirect("/workout");
  }

  // Ensure workout and session status are completed in database
  if (workout.status !== "completed") {
    const activeSession = workout.fitness_os_workout_sessions?.find(
      (s: any) => s.status === "active" || s.status === "paused"
    );
    if (activeSession) {
      await WorkoutService.completeSession(user.id, activeSession.id).catch(console.error);
    } else {
      await supabase
        .from("fitness_os_workouts")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", workoutId);
    }
  }

  const exerciseCount = workout.fitness_os_exercises?.length || 0;
  const exerciseNames: string[] = workout.fitness_os_exercises?.map((ex: any) => ex.name).filter(Boolean) || [];
  
  let completedSets = 0;
  let totalSets = 0;
  let totalVolumeKg = 0;
  let recordsCount = 0;
  
  workout.fitness_os_exercises?.forEach((ex: any) => {
    let exerciseHasWeight = false;
    ex.fitness_os_sets?.forEach((set: any) => {
      totalSets++;
      if (set.completed) {
        completedSets++;
        if (set.weight_kg && set.actual_reps) {
          totalVolumeKg += (set.weight_kg * set.actual_reps);
          exerciseHasWeight = true;
        }
      }
    });
    if (exerciseHasWeight) {
      recordsCount++;
    }
  });

  // Calculate real-world, physiologically accurate workout duration
  let rawDurationMin = workout.duration_minutes || 0;
  let durationMin = rawDurationMin;

  // Real-world safeguard: If session was left open for > 3 hours (e.g. 15.6 hours = 936 min)
  // or not recorded, estimate active lifting time based on completed sets (~3.5 min/set)
  if (rawDurationMin > 180 || rawDurationMin < 5) {
    durationMin = completedSets > 0 ? Math.round(completedSets * 3.5) : 45;
    
    // Update the workout record with realistic duration
    supabase
      .from("fitness_os_workouts")
      .update({ duration_minutes: durationMin })
      .eq("id", workoutId)
      .then(() => {});
  }

  // Realistic strength training calories (~5.5 to 6.5 kcal/min, capped realistically)
  const caloriesBurned = Math.min(850, Math.max(120, Math.round(durationMin * 6.2)));

  // Extract session ID and previous feedback for feedback logging
  const sessions = workout.fitness_os_workout_sessions || [];
  let latestSession = [...sessions].sort(
    (a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
  )[0];

  if (!latestSession) {
    const { data: createdSession } = await supabase
      .from("fitness_os_workout_sessions")
      .insert({
        user_id: user.id,
        workout_id: workoutId,
        started_at: workout.started_at || new Date().toISOString(),
        completed_at: workout.completed_at || new Date().toISOString(),
        duration_seconds: durationMin * 60,
        status: "completed"
      })
      .select()
      .single();
    latestSession = createdSession;
  }
  const sessionId = latestSession?.id;

  let initialFeedback: { difficulty?: string | null; feel?: string | null; pain?: string | null; painLocation?: string | null } | undefined;
  if (latestSession?.notes) {
    try {
      const parsedNotes = JSON.parse(latestSession.notes);
      if (parsedNotes && typeof parsedNotes === "object") {
        initialFeedback = {
          difficulty: parsedNotes.difficulty || latestSession.difficulty || null,
          feel: parsedNotes.feel || latestSession.feeling || null,
          pain: parsedNotes.pain || null,
          painLocation: parsedNotes.painLocation || null,
        };
      }
    } catch {
      // notes wasn't JSON
    }
  } else if (latestSession?.difficulty || latestSession?.feeling) {
    initialFeedback = {
      difficulty: latestSession.difficulty || null,
      feel: latestSession.feeling || null,
      pain: null,
      painLocation: null,
    };
  }

  const userName = user.user_metadata?.first_name || 
    user.user_metadata?.full_name?.split(' ')[0] || 
    user.user_metadata?.name?.split(' ')[0] || 
    "Athlete";

  return (
    <FitnessGuard>
      <div className="min-h-screen bg-[#0A1108] text-white flex flex-col justify-center">
        <WorkoutComplete 
          workout={workout as any}
          exerciseCount={exerciseCount}
          completedSets={completedSets}
          totalSets={totalSets}
          actualVolume={totalVolumeKg}
          actualCalories={caloriesBurned}
          actualDuration={durationMin}
          recordsBroken={recordsCount > 0 ? recordsCount : 1}
          exerciseNames={exerciseNames}
          sessionId={sessionId}
          userName={userName}
          initialFeedback={initialFeedback}
        />
      </div>
    </FitnessGuard>
  );
}
