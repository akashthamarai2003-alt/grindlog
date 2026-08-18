import { GeneratedPlanData } from "../ai/schemas";
import { OnboardingData } from "@/types/fitness/onboarding";

export function runFitnessAISafetyCheck(plan: GeneratedPlanData, profile: Partial<OnboardingData>): { safe: boolean; reason?: string } {
  // 1. Calorie Safety
  if (plan.nutrition?.daily_calories) {
    const isMinor = (profile.age || 20) < 18;
    const calories = plan.nutrition.daily_calories;
    const goal = profile.goal || "";

    if (isMinor) {
      if (goal.includes("lose") && calories < 1800) {
         return { safe: false, reason: "Aggressive calorie targets are not permitted for minors." };
      }
      if (calories < 1500) {
        return { safe: false, reason: "Calorie targets below 1500 are unsafe for minors." };
      }
    } else {
      // Adult basic safety (BMR approximation checks can be more complex, but a hard limit of 1000 is generally considered a medical fast line)
      if (calories < 1000) {
        return { safe: false, reason: "Generated calories are dangerously low (<1000). Medical supervision required." };
      }
    }
  }

  // 3. Equipment Safety (Basic Keyword Checks)
  const equipment = (profile.equipment || []).map(e => e.toLowerCase());
  const hasNoEquipment = equipment.length === 0 || equipment.includes("none") || equipment.includes("bodyweight only");
  const hasTreadmill = equipment.some(e => e.includes("treadmill"));
  
  for (const workout of plan.workouts) {
    // Check workout titles for cardio terminology if they lack a treadmill
    if (!hasTreadmill && /cardio/i.test(workout.title)) {
      workout.title = workout.title.replace(/cardio/ig, "Active Recovery");
    }

    for (const exercise of workout.exercises) {
      const name = exercise.name.toLowerCase();
      
      if (hasNoEquipment) {
        if (name.includes("barbell") || name.includes("dumbbell") || name.includes("cable") || name.includes("machine")) {
          // Auto-correct to bodyweight instead of failing
          exercise.name = exercise.name.replace(/barbell|dumbbell|cable|machine/gi, "Bodyweight");
          exercise.notes = "Auto-corrected to match available equipment.";
        }
      }

      if (!hasTreadmill && name.includes("treadmill")) {
        exercise.name = exercise.name.replace(/treadmill/ig, "Brisk Walking (Outdoors)");
        exercise.notes = "Auto-corrected to outdoor walking as no treadmill is available.";
      }
    }
  }

  // 3. Volume Safety
  for (const workout of plan.workouts) {
    let totalSets = 0;
    for (const exercise of workout.exercises) {
      totalSets += exercise.sets;
    }
    // Prevent ridiculous generation
    if (totalSets > 50) {
      return { safe: false, reason: `Workout '${workout.title}' has too many sets (${totalSets}), risking overtraining.` };
    }
  }

  // 4. Physical Limitation Safety (Basic Keyword Checks)
  const limitations = (profile.exercise_limitations || []).map(l => l.toLowerCase());
  
  if (limitations.length > 0 && !limitations.includes("none")) {
    for (const workout of plan.workouts) {
      for (const exercise of workout.exercises) {
        const name = exercise.name.toLowerCase();
        
        // Auto-correct forbidden exercises to universally safe rehab/bodyweight alternatives
        if (limitations.includes("squatting") && (/squat|leg press|hack press/i.test(name))) {
          exercise.name = "Glute Bridges (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety to avoid deep knee bending.";
        } else if (limitations.includes("running") && (/run|treadmill|sprint|jog/i.test(name))) {
          exercise.name = "Marching in Place (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety to avoid high-impact cardio.";
        } else if (limitations.includes("jumping") && (/jump|plyo|box|burpee/i.test(name))) {
          exercise.name = "Step-Ups (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety to avoid impact.";
        } else if (limitations.includes("overhead movements") && (/overhead|military press|shoulder press|push press/i.test(name))) {
          exercise.name = "Front Raises (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety to avoid vertical pressing.";
        } else if (limitations.includes("push-ups") && (/push[-\s]?up/i.test(name))) {
          exercise.name = "Wall Presses (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety to reduce chest/wrist load.";
        } else if (limitations.includes("pull-ups") && (/pull[-\s]?up|chin[-\s]?up|muscle[-\s]?up/i.test(name))) {
          exercise.name = "Reverse Snow Angels (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety to avoid vertical pulling.";
        } else if (limitations.includes("lunges") && (/lunge|split squat/i.test(name))) {
          exercise.name = "Glute Bridges (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety to avoid unilateral knee strain.";
        } else if (limitations.includes("bending") && (/deadlift|good morning|bent[-\s]?over/i.test(name))) {
          exercise.name = "Bird-Dog (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety to avoid spinal loading.";
        }
      }
    }
  }

  return { safe: true };
}
