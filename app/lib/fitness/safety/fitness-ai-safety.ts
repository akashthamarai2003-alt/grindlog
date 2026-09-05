import { GeneratedPlanData } from "../ai/schemas";
import { OnboardingData } from "@/types/fitness/onboarding";

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/[\u2013\u2014]/g, "-");
}

function hasChoice(values: string[], choice: string): boolean {
  const target = normalise(choice);
  return values.some((value) => normalise(value) === target);
}

function matchesExercise(name: string, pattern: RegExp): boolean {
  return pattern.test(normalise(name));
}

export function runFitnessAISafetyCheck(plan: GeneratedPlanData, profile: Partial<OnboardingData>): { safe: boolean; reason?: string } {
  const painSeverity = profile.current_pain_severity;

  // A severe current pain report is a medical-clearance case, not a normal
  // workout-generation case. Do not silently rewrite the model's exercises.
  if (typeof painSeverity === "number" && painSeverity >= 7 && plan.workouts.length > 0) {
    return {
      safe: false,
      reason: "Current pain is severe. Workouts must remain paused until a qualified clinician clears training.",
    };
  }

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
  const equipment = (profile.equipment || []).map(normalise);
  const hasFullGym = equipment.some((item) =>
    item.includes("full commercial gym"),
  );
  const hasNoEquipment =
    equipment.length === 0 ||
    equipment.some((item) => item === "none" || item.includes("no equipment") || item.includes("bodyweight only"));
  const hasTreadmill = equipment.some(e => e.includes("treadmill"));
  
  for (const workout of plan.workouts) {
    // Check workout titles for cardio terminology if they lack a treadmill
    if (!hasTreadmill && /cardio/i.test(workout.title)) {
      workout.title = workout.title.replace(/cardio/ig, "Active Recovery");
    }

    for (const exercise of workout.exercises) {
      const name = normalise(exercise.name);
      
      const isBodyweight = /(?:push[- ]?up|plank|mountain climber|bodyweight|jumping jack|burpee|air squat|bodyweight squat|crunch|sit[- ]?up|glute bridge|lunges?|high knees?|wall sit)/i.test(name);

      if (hasNoEquipment) {
        if (
          name.includes("barbell") ||
          name.includes("dumbbell") ||
          name.includes("cable") ||
          name.includes("machine") ||
          name.includes("kettlebell") ||
          /bench press|\bbench dip\b/.test(name) ||
          (!isBodyweight && /incline|decline/.test(name))
        ) {
          return { safe: false, reason: `Exercise '${exercise.name}' requires equipment that is not in the saved profile.` };
        }
      }

      const requiredEquipment = [
        { label: "barbell", pattern: /barbell/, accepted: ["barbell", "squat rack"] },
        { label: "dumbbell", pattern: /dumbbell/, accepted: ["dumbbell"] },
        { label: "cable", pattern: /cable/, accepted: ["cable"] },
        { label: "machine", pattern: /machine/, accepted: ["machine", "full commercial gym"] },
        { label: "kettlebell", pattern: /kettlebell/, accepted: ["kettlebell"] },
        { label: "resistance band", pattern: /resistance band|banded/, accepted: ["resistance band", "band"] },
        { label: "pull-up bar", pattern: /pull[- ]?up bar|hanging/, accepted: ["pull-up bar", "park benches & bars", "full commercial gym"] },
        {
          label: "bench",
          pattern: /(?:bench press|bench dip|incline (?:bench|dumbbell|barbell|chest|press|fly|curl)|decline (?:bench|dumbbell|barbell|chest|press|fly))/,
          accepted: ["bench", "adjustable bench", "park benches", "full commercial gym"],
        },
        { label: "treadmill", pattern: /treadmill/, accepted: ["treadmill", "treadmill / cardio", "full commercial gym"] },
        { label: "exercise bike", pattern: /exercise bike|stationary bike|spin bike|cycling/, accepted: ["exercise bike", "treadmill / exercise bike", "treadmill / cardio", "full commercial gym"] },
        { label: "rowing machine", pattern: /rowing machine|rower/, accepted: ["rowing machine", "treadmill / cardio", "full commercial gym"] },
        { label: "stair climber", pattern: /stair climber|stair machine/, accepted: ["stair climber", "treadmill / cardio", "full commercial gym"] },
        { label: "jump rope", pattern: /jump rope|skipping rope/, accepted: ["jump rope", "full commercial gym"] },
        { label: "medicine ball", pattern: /medicine ball|slam ball/, accepted: ["medicine ball", "full commercial gym"] },
        { label: "exercise box", pattern: /plyo box|exercise box/, accepted: ["step / plyo box", "full commercial gym"] },
      ];
      if (!hasFullGym) {
        const missingEquipment = requiredEquipment.find(
          (requirement) => requirement.pattern.test(name) && !equipment.some((item) => requirement.accepted.some((token) => item.includes(token))),
        );
        if (missingEquipment) {
          return { safe: false, reason: `Exercise '${exercise.name}' requires ${missingEquipment.label}, which is not in the saved profile.` };
        }
      }

      if (!hasTreadmill && name.includes("treadmill")) {
        return { safe: false, reason: "The plan includes treadmill work, but no treadmill is available in the saved profile." };
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

  // 4. Physical Limitation and Injury Safety.
  // Reject a conflicting exercise instead of auto-replacing it. Automatic
  // substitutions can change the movement's loading, balance, or medical risk.
  const limitations = (profile.exercise_limitations || []).map(normalise);
  const problems = (profile.physical_problems || []).map(normalise);
  
  if (limitations.length > 0 && !hasChoice(limitations, "none")) {
    for (const workout of plan.workouts) {
      for (const exercise of workout.exercises) {
        const name = normalise(exercise.name);
        
        if (hasChoice(limitations, "squatting") && matchesExercise(name, /squat|leg press|hack press/)) {
          return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved squatting limitation.` };
        }
        if (hasChoice(limitations, "running") && matchesExercise(name, /\brun\b|running|treadmill|sprint|jog/)) {
          return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved running limitation.` };
        }
        if (hasChoice(limitations, "jumping") && matchesExercise(name, /jump|plyo|box jump|jump rope|burpee/)) {
          return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved jumping limitation.` };
        }
        if (hasChoice(limitations, "overhead movements") && matchesExercise(name, /overhead|military press|shoulder press|push press|overhead triceps|lat pulldown/)) {
          return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved overhead-movement limitation.` };
        }
        if (hasChoice(limitations, "push-ups") && matchesExercise(name, /push[- ]?ups?/)) {
          return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved push-up limitation.` };
        }
        if (hasChoice(limitations, "pull-ups") && matchesExercise(name, /pull[- ]?ups?|chin[- ]?ups?|muscle[- ]?ups?/)) {
          return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved pull-up limitation.` };
        }
        if (hasChoice(limitations, "lunges") && matchesExercise(name, /lunge|split squat/)) {
          return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved lunge limitation.` };
        }
        if (hasChoice(limitations, "bending") && matchesExercise(name, /deadlift|good morning|bent[- ]over|kettlebell swing/)) {
          return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved bending limitation.` };
        }
      }
    }
  }

  const injuryRules: Array<{ label: string; active: boolean; pattern: RegExp }> = [
    {
      label: "back pain",
      active: hasChoice(problems, "back pain"),
      pattern: /deadlift|good morning|bent[- ]over row|barbell squat|back extension|heavy kettlebell swing/,
    },
    {
      label: "knee pain",
      active: hasChoice(problems, "knee pain"),
      pattern: /squat|lunge|leg press|leg extension|jump|plyo|box jump|run|sprint|jog/,
    },
    {
      label: "shoulder pain",
      active: hasChoice(problems, "shoulder pain"),
      pattern: /overhead|military press|shoulder press|push press|dips?|upright row|behind[- ]neck|barbell bench press/,
    },
    {
      label: "wrist pain",
      active: hasChoice(problems, "wrist pain"),
      pattern: /barbell bench press|barbell overhead press|skull crusher/,
    },
    {
      label: "elbow pain",
      active: hasChoice(problems, "elbow pain"),
      pattern: /barbell bench press|barbell overhead press|skull crusher/,
    },
    {
      label: "ankle\/foot pain",
      active: hasChoice(problems, "ankle/foot pain"),
      pattern: /run|sprint|jog|jump|plyo|box jump|jump rope/,
    },
    {
      label: "hip pain",
      active: hasChoice(problems, "hip pain"),
      pattern: /deep squat|squat|lunge|split squat|step[- ]?up|heavy leg press/,
    },
    {
      label: "neck pain",
      active: hasChoice(problems, "neck pain"),
      pattern: /barbell squat|back squat|overhead|military press|shrug|neck bridge|behind[- ]neck/,
    },
  ];

  for (const workout of plan.workouts) {
    for (const exercise of workout.exercises) {
      const rule = injuryRules.find((candidate) => candidate.active && matchesExercise(exercise.name, candidate.pattern));
      if (rule) {
        return { safe: false, reason: `Exercise '${exercise.name}' conflicts with the saved ${rule.label} profile.` };
      }
    }
  }

  return { safe: true };
}
