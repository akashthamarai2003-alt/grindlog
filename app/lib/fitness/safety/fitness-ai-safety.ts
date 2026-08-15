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
  const equipment = (profile.equipment || []).map(e => e.toLowerCase());
  const hasNoEquipment = equipment.length === 0 || equipment.includes("none") || equipment.includes("bodyweight only");
  
  if (hasNoEquipment) {
    for (const workout of plan.workouts) {
      for (const exercise of workout.exercises) {
        const name = exercise.name.toLowerCase();
        if (name.includes("barbell") || name.includes("dumbbell") || name.includes("cable") || name.includes("machine")) {
          // Auto-correct to bodyweight instead of failing
          exercise.name = exercise.name.replace(/barbell|dumbbell|cable|machine/gi, "Bodyweight");
          exercise.notes = "Auto-corrected to match available equipment.";
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

  // 4. Physical Limitation Safety (Basic Keyword Checks)
  const limitations = (profile.exercise_limitations || []).map(l => l.toLowerCase());
  
  if (limitations.length > 0 && !limitations.includes("none")) {
    for (const workout of plan.workouts) {
      for (const exercise of workout.exercises) {
        const name = exercise.name.toLowerCase();
        
        // Auto-correct forbidden exercises to universally safe bodyweight alternatives
        if (limitations.includes("squatting") && (name.includes("squat") || name.includes("leg press"))) {
          exercise.name = "Glute Bridges (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety.";
        } else if (limitations.includes("running") && (name.includes("run") || name.includes("treadmill") || name.includes("sprint") || name.includes("jog"))) {
          exercise.name = "Marching in Place (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety.";
        } else if (limitations.includes("jumping") && (name.includes("jump") || name.includes("plyo") || name.includes("box") || name.includes("burpee"))) {
          exercise.name = "Step-Ups (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety.";
        } else if (limitations.includes("overhead movements") && (name.includes("overhead") || name.includes("military press") || name.includes("shoulder press") || name.includes("push press"))) {
          exercise.name = "Front Raises (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety.";
        } else if (limitations.includes("push-ups") && name.includes("push-up")) {
          exercise.name = "Wall Presses (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety.";
        } else if (limitations.includes("pull-ups") && (name.includes("pull-up") || name.includes("chin-up"))) {
          exercise.name = "Superman Holds (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety.";
        } else if (limitations.includes("lunges") && name.includes("lunge")) {
          exercise.name = "Glute Bridges (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety.";
        } else if (limitations.includes("bending") && (name.includes("deadlift") || name.includes("good morning") || name.includes("bent"))) {
          exercise.name = "Superman Holds (Safe Alternative)";
          exercise.notes = "Auto-corrected for safety.";
        }
      }
    }
  }

  return { safe: true };
}
