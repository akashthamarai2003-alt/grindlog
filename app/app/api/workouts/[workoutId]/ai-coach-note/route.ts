import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase, getCachedUser } from "@/lib/services/supabase/server";
import { AiWorkoutCoachService } from "@/lib/services/ai/ai-workout-coach-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params;
    const { data: { user } } = await getCachedUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServerSupabase();

    // Fetch coach note, user profile, and workout info concurrently
    const [note, { data: profile }, { data: workout }] = await Promise.all([
      AiWorkoutCoachService.getOrGenerateCoachNote(user.id, workoutId),
      supabase
        .from("fitness_os_profiles")
        .select("goal, target_physique, fitness_level, training_location, equipment, workout_duration_minutes, weight, target_weight, training_days_per_week, preferred_training_time")
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("fitness_os_workouts")
        .select("name, duration_minutes")
        .eq("id", workoutId)
        .maybeSingle()
    ]);

    // 1. Goal
    const goalStr = profile?.goal
      ? (profile.target_physique ? `${profile.goal} (${profile.target_physique})` : profile.goal)
      : "General Fitness";

    // 2. Fitness Level
    const levelStr = profile?.fitness_level || "Beginner";

    // 3. Equipment
    let equipStr = "Gym Access (Barbells, Cables, Dumbbells)";
    if (profile?.training_location === "Home") {
      equipStr = profile.equipment?.length ? profile.equipment.slice(0, 3).join(", ") : "Home Gym";
    } else if (profile?.equipment && Array.isArray(profile.equipment) && profile.equipment.length > 0) {
      if (profile.equipment.length <= 3) {
        equipStr = profile.equipment.join(", ");
      } else {
        equipStr = "Full Gym Access (Barbells, Cables, Dumbbells)";
      }
    }

    // 4. Duration
    const durationStr = `${profile?.workout_duration_minutes || workout?.duration_minutes || 45} min optimized`;

    // 5. Recovery tailored to workout muscle group
    const workoutName = (workout?.name || "").toLowerCase();
    let recoveryStr = "Target muscle groups fully recovered";
    if (workoutName.includes("chest") || workoutName.includes("push") || workoutName.includes("shoulder") || workoutName.includes("tricep")) {
      recoveryStr = "Chest, shoulders & triceps fully recovered";
    } else if (workoutName.includes("back") || workoutName.includes("pull") || workoutName.includes("bicep") || workoutName.includes("lat")) {
      recoveryStr = "Back, lats & biceps fully recovered";
    } else if (workoutName.includes("leg") || workoutName.includes("lower") || workoutName.includes("squat")) {
      recoveryStr = "Quads, hamstrings & glutes fully recovered";
    } else if (workoutName.includes("core") || workoutName.includes("ab")) {
      recoveryStr = "Core & stabilizing muscles fully recovered";
    }

    // 6. Progress
    let progressStr = "Progressive overload applied";
    if (profile?.weight && profile?.target_weight) {
      progressStr = `Progressive overload • ${profile.weight} kg → ${profile.target_weight} kg target`;
    }

    // 7. Preferences
    let prefStr = "Customized to your routine";
    if (profile?.training_days_per_week) {
      prefStr = `${profile.training_days_per_week} days/week${profile.preferred_training_time ? ` • ${profile.preferred_training_time}` : ""}`;
    }

    const insights = [
      { icon: "Target", label: "Goal", value: goalStr },
      { icon: "Activity", label: "Fitness Level", value: levelStr },
      { icon: "Dumbbell", label: "Available Equipment", value: equipStr },
      { icon: "Clock", label: "Duration", value: durationStr },
      { icon: "HeartPulse", label: "Recovery", value: recoveryStr },
      { icon: "TrendingUp", label: "Progress", value: progressStr },
      { icon: "Settings2", label: "Preferences", value: prefStr },
    ];

    return NextResponse.json({ note, insights });
  } catch (error: any) {
    console.error(`GET /api/workouts/[workoutId]/ai-coach-note error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch coach note" }, { status: 500 });
  }
}
