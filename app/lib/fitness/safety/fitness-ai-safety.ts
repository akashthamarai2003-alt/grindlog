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

  // 2. Equipment Safety (Basic Keyword Checks)
  // E.g., if home and no equipment, reject "Barbell"
  const equipment = (profile.equipment || []).map(e => e.toLowerCase());
  const hasNoEquipment = equipment.length === 0 || equipment.includes("none") || equipment.includes("bodyweight only");
  
  if (hasNoEquipment) {
    for (const workout of plan.workouts) {
      for (const exercise of workout.exercises) {
        const name = exercise.name.toLowerCase();
        if (name.includes("barbell") || name.includes("dumbbell") || name.includes("cable") || name.includes("machine")) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' requires equipment you do not have.` };
        }
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

  return { safe: true };
}
