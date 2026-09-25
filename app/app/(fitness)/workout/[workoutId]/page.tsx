import { getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { WorkoutSessionManager } from "@/components/fitness/workout/workout-session-manager";
import { WorkoutSkeleton } from "@/components/fitness/workout/workout-skeleton";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function PaidAccessGate({ featureName }: { featureName: string }) {
  return (
    <div className="min-h-[100dvh] bg-[#0A1108] px-6 py-16 text-white">
      <div className="mx-auto flex max-w-md flex-col items-center rounded-3xl border border-[#ADFF00]/25 bg-[linear-gradient(145deg,rgba(173,255,0,0.10),rgba(18,30,18,1)_48%)] p-6 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ADFF00]/15 text-[#ADFF00]">
          <LockKeyhole size={26} />
        </div>
        <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">Active Plan Required</p>
        <h1 className="mt-2 text-2xl font-black">Unlock {featureName}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">
          You are currently exploring GrindLog in Free Preview Mode. Upgrade to Core or Pro to record live workouts, track nutrition, and log progress.
        </p>
        <Link
          href="/payment?returnTo=/&intent=upgrade_plan"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ADFF00] py-3.5 text-sm font-extrabold text-black transition-colors hover:bg-[#c4ff33]"
        >
          View Plans & Unlock <ArrowRight size={17} />
        </Link>
        <Link href="/workout" className="mt-4 text-xs font-bold text-gray-500 hover:text-white">Back to workouts</Link>
      </div>
    </div>
  );
}

async function ActiveWorkoutContent({ 
  workoutId,
  activeExerciseId
}: { 
  workoutId: string;
  activeExerciseId?: string;
}) {
  const { data: { user } } = await getCachedUser();
  
  if (!user) {
    redirect(`/auth/signin?redirect=${encodeURIComponent(`/workout/${workoutId}`)}`);
  }

  if (workoutId === "mock") {
    const mockWorkout = {
      id: "mock",
      name: "Upper Body",
      user_id: user.id,
      status: "in_progress",
      fitness_os_exercises: [
        {
          id: '1', name: "Bench Press", target_muscles: ["Chest"], target_sets: 3, target_reps: "8–10", rest_seconds: 90,
          fitness_os_sets: [
            { id: 's1', set_number: 1, target_reps: 10, weight_kg: 60, completed: false },
            { id: 's2', set_number: 2, target_reps: 10, weight_kg: 60, completed: false },
            { id: 's3', set_number: 3, target_reps: 8, weight_kg: 60, completed: false }
          ]
        },
        {
          id: '2', name: "Incline Dumbbell Press", target_muscles: ["Upper Chest"], target_sets: 3, target_reps: "10-12", rest_seconds: 90,
          fitness_os_sets: [
            { id: 's4', set_number: 1, target_reps: 12, weight_kg: 16, completed: false },
            { id: 's5', set_number: 2, target_reps: 10, weight_kg: 16, completed: false },
            { id: 's6', set_number: 3, target_reps: 10, weight_kg: 16, completed: false }
          ]
        }
      ],
      fitness_os_workout_sessions: [{ id: "mock-session", status: "active", started_at: new Date().toISOString() }]
    };

    return (
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
          <WorkoutSessionManager
            workout={mockWorkout as any}
            sessionId="mock-session"
            startedAt={mockWorkout.fitness_os_workout_sessions[0].started_at}
            isPaused={false}
            avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
            showAiCoach={false}
            isEarlyStart={false}
            initialExerciseId={activeExerciseId}
          />
        </div>
      </div>
    );
  }

  const admin = createAdminClient();

  // Run independent database and plan fetches in parallel
  const [
    { data: workout, error },
    { data: profile },
    subscriptionPlan,
    cachedNoteRes
  ] = await Promise.all([
    admin
      .from("fitness_os_workouts")
      .select(`
        *,
        fitness_os_exercises (
          *,
          fitness_os_sets (*)
        ),
        fitness_os_workout_sessions (*)
      `)
      .eq("id", workoutId)
      .single(),
    admin.from("profiles").select("timezone").eq("id", user.id).maybeSingle(),
    getFitnessPlan(user.id),
    admin
      .from("workout_ai_notes")
      .select("note")
      .eq("workout_id", workoutId)
      .maybeSingle()
  ]);

  if (error || !workout) {
    redirect("/workout");
  }

  if (workout.user_id !== user.id) {
    redirect("/workout");
  }

  if (workout.status === "completed") {
    redirect(`/workout/${workoutId}/summary`);
  }

  if (!subscriptionPlan || subscriptionPlan.id === "free") {
    return <PaidAccessGate featureName="Live Workout Sessions" />;
  }

  const cachedCoachNote = cachedNoteRes?.data?.note || null;

  // Reading or prefetching this page must never start a workout. The explicit
  // Start/Continue action owns session creation, expiry, and timer changes.
  // Otherwise revalidation after Discard can immediately recreate the session.
  const activeSession = workout.status === "in_progress" && workout.fitness_os_workout_sessions
    ?.filter((s: any) => s.status === "active" || s.status === "paused")
    ?.sort((a: any, b: any) => new Date(b.started_at || 0).getTime() - new Date(a.started_at || 0).getTime())[0];

  if (!activeSession) {
    redirect("/workout");
  }

  const timezone = profile?.timezone || "UTC";
  const todayInTimezone = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const isEarlyStart = typeof workout.workout_date === "string" && workout.workout_date > todayInTimezone;
  const scheduledDateLabel = typeof workout.workout_date === "string"
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date(`${workout.workout_date}T12:00:00Z`))
    : undefined;

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-5 pt-8 pb-8">
        <WorkoutSessionManager
          workout={workout as any}
          sessionId={activeSession.id}
          startedAt={activeSession.started_at}
          isPaused={activeSession.status === "paused"}
          avatarUrl={user.user_metadata?.avatar_url || user.user_metadata?.picture}
          showAiCoach={subscriptionPlan?.id === "pro"}
          isEarlyStart={isEarlyStart}
          scheduledDateLabel={scheduledDateLabel}
          initialExerciseId={activeExerciseId}
          initialCoachNote={cachedCoachNote || null}
        />
      </div>
    </div>
  );
}

export default async function ActiveWorkoutPage({ 
  params,
  searchParams
}: { 
  params: Promise<{ workoutId: string }>,
  searchParams: Promise<{ exercise?: string }>
}) {
  const { workoutId } = await params;
  const { exercise: activeExerciseId } = await searchParams;

  return (
    <Suspense fallback={<WorkoutSkeleton />}>
      <ActiveWorkoutContent workoutId={workoutId} activeExerciseId={activeExerciseId} />
    </Suspense>
  );
}
