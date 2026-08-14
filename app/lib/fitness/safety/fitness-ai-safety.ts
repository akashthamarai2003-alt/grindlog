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

  // 4. Physical Limitation Safety (Basic Keyword Checks)
  const limitations = (profile.exercise_limitations || []).map(l => l.toLowerCase());
  
  if (limitations.length > 0 && !limitations.includes("none")) {
    for (const workout of plan.workouts) {
      for (const exercise of workout.exercises) {
        const name = exercise.name.toLowerCase();
        
        // Basic mapping of limitations to common exercise keywords
        if (limitations.includes("squatting") && (name.includes("squat") || name.includes("leg press"))) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' violates your limitation: Squatting.` };
        }
        if (limitations.includes("running") && (name.includes("run") || name.includes("treadmill") || name.includes("sprint") || name.includes("jog"))) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' violates your limitation: Running.` };
        }
        if (limitations.includes("jumping") && (name.includes("jump") || name.includes("plyo") || name.includes("box") || name.includes("burpee"))) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' violates your limitation: Jumping.` };
        }
        if (limitations.includes("overhead movements") && (name.includes("overhead") || name.includes("military press") || name.includes("shoulder press") || name.includes("push press"))) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' violates your limitation: Overhead movements.` };
        }
        if (limitations.includes("push-ups") && name.includes("push-up")) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' violates your limitation: Push-ups.` };
        }
        if (limitations.includes("pull-ups") && (name.includes("pull-up") || name.includes("chin-up"))) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' violates your limitation: Pull-ups.` };
        }
        if (limitations.includes("lunges") && name.includes("lunge")) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' violates your limitation: Lunges.` };
        }
        if (limitations.includes("bending") && (name.includes("deadlift") || name.includes("good morning") || name.includes("bent"))) {
          return { safe: false, reason: `Generated exercise '${exercise.name}' violates your limitation: Bending.` };
        }
      }
    }
  }

  return { safe: true };
}
