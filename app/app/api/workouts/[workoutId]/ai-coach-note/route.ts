import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AiWorkoutCoachService } from "@/lib/services/ai/ai-workout-coach-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workoutId: string }> }
) {
  try {
    const { workoutId } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const note = await AiWorkoutCoachService.getOrGenerateCoachNote(user.id, workoutId);
    
    // Fetch user profile to construct dynamic insights
    const { data: profile } = await supabase
      .from("fitness_os_profiles")
      .select("fitness_goal, fitness_level, available_equipment, workout_duration")
      .eq("user_id", user.id)
      .single();

    // Map equipment array back to a friendly string
    const equipmentMapping: Record<string, string> = {
      dumbbells: "Dumbbells",
      barbell: "Barbell & Weights",
      pullup_bar: "Pull-up Bar",
      treadmill: "Treadmill",
      kettlebells: "Kettlebells",
      resistance_bands: "Resistance Bands",
      paid_gym: "Paid Gym Only (No Treadmill)",
      full_gym: "Full Gym Access",
      home_gym: "Home Gym",
      none: "No Equipment (Bodyweight)"
    };

    let equipmentStr = "Mixed Equipment";
    if (profile?.available_equipment && Array.isArray(profile.available_equipment)) {
      if (profile.available_equipment.length === 0) {
        equipmentStr = "No Equipment";
      } else {
        equipmentStr = profile.available_equipment.map((e: string) => equipmentMapping[e] || e).join(", ");
      }
    } else if (typeof profile?.available_equipment === "string") {
      equipmentStr = equipmentMapping[profile.available_equipment] || profile.available_equipment;
    }

    const durationStr = profile?.workout_duration === "15" ? "15-30 min optimized" 
      : profile?.workout_duration === "30" ? "30-45 min optimized"
      : profile?.workout_duration === "45" ? "45-60 min optimized"
      : profile?.workout_duration === "60" ? "60+ min optimized"
      : `${profile?.workout_duration || 45} min optimized`;

    const insights = [
      { icon: "Target", label: "Goal", value: profile?.fitness_goal || "General Fitness" },
      { icon: "Activity", label: "Fitness Level", value: profile?.fitness_level || "Intermediate" },
      { icon: "Dumbbell", label: "Available Equipment", value: equipmentStr },
      { icon: "Clock", label: "Duration", value: durationStr },
      { icon: "HeartPulse", label: "Recovery", value: "Muscle groups recovered" },
      { icon: "TrendingUp", label: "Progress", value: "Progressive overload applied" },
      { icon: "Settings2", label: "Preferences", value: "Tailored to your needs" },
    ];

    return NextResponse.json({ note, insights });
  } catch (error: any) {
    console.error(`GET /api/workouts/[workoutId]/ai-coach-note error:`, error);
    return NextResponse.json({ error: error.message || "Failed to fetch coach note" }, { status: 500 });
  }
}
