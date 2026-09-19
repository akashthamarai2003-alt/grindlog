/**
 * Exercise Animation & Demonstration Registry
 * Maps workout exercises to high-quality animated form GIFs hosted on global CDN
 * with zero-latency resolution and 100% fallback coverage.
 */

export interface ExerciseAnimationInfo {
  name: string;
  gifUrl: string;
  secondaryGifUrl: string;
  targetMuscle: string;
  equipment: string;
  isFallback?: boolean;
}

const CDN_BASE = "https://cdn.jsdelivr.net/gh/JahelCuadrado/ExerciseGymGifsDB@v1.1.0";
const RAW_BASE = "https://raw.githubusercontent.com/JahelCuadrado/ExerciseGymGifsDB/main";

// Core Muscle Group Fallback Animations (Guaranteed 100% visual demonstration)
export const MUSCLE_FALLBACKS: Record<string, { file: string; target: string; equipment: string }> = {
  chest: { file: "pectorals/lever-chest-press.gif", target: "Chest", equipment: "Machine" },
  pectorals: { file: "pectorals/lever-chest-press.gif", target: "Chest", equipment: "Machine" },
  back: { file: "lats/cable-lat-pulldown-full-range-of-motion.gif", target: "Lats / Upper Back", equipment: "Cable" },
  lats: { file: "lats/cable-lat-pulldown-full-range-of-motion.gif", target: "Lats", equipment: "Cable" },
  shoulders: { file: "delts/dumbbell-lateral-raise.gif", target: "Shoulders", equipment: "Dumbbells" },
  delts: { file: "delts/dumbbell-lateral-raise.gif", target: "Shoulders", equipment: "Dumbbells" },
  biceps: { file: "biceps/barbell-curl.gif", target: "Biceps", equipment: "Barbell" },
  triceps: { file: "triceps/cable-pushdown.gif", target: "Triceps", equipment: "Cable" },
  arms: { file: "biceps/barbell-curl.gif", target: "Arms", equipment: "Barbell" },
  quads: { file: "quads/lever-leg-extension.gif", target: "Quadriceps", equipment: "Machine" },
  quadriceps: { file: "quads/lever-leg-extension.gif", target: "Quadriceps", equipment: "Machine" },
  hamstrings: { file: "hamstrings/lever-lying-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  glutes: { file: "glutes/barbell-deadlift.gif", target: "Glutes & Hamstrings", equipment: "Barbell" },
  legs: { file: "quads/lever-leg-extension.gif", target: "Legs", equipment: "Machine" },
  calves: { file: "calves/standing-calf-raise.gif", target: "Calves", equipment: "Bodyweight" },
  abs: { file: "abs/front-plank.gif", target: "Core / Abs", equipment: "Bodyweight" },
  abdominals: { file: "abs/front-plank.gif", target: "Core / Abs", equipment: "Bodyweight" },
  core: { file: "abs/front-plank.gif", target: "Core", equipment: "Bodyweight" },
  cardio: { file: "cardio/cycle-cross-trainer.gif", target: "Cardio", equipment: "Machine" },
  traps: { file: "traps/dumbbell-shrug.gif", target: "Trapezius", equipment: "Dumbbells" },
  trapezius: { file: "traps/dumbbell-shrug.gif", target: "Trapezius", equipment: "Dumbbells" },
  forearms: { file: "forearms/barbell-wrist-curl.gif", target: "Forearms", equipment: "Barbell" },
};

// Curated Canonical Exercise Dictionary
const CANONICAL_EXERCISES: Record<string, { file: string; target: string; equipment: string }> = {
  // CHEST / PECTORALS
  "machine chest press": { file: "pectorals/lever-chest-press.gif", target: "Chest", equipment: "Machine" },
  "lever chest press": { file: "pectorals/lever-chest-press.gif", target: "Chest", equipment: "Machine" },
  "chest press machine": { file: "pectorals/lever-chest-press.gif", target: "Chest", equipment: "Machine" },
  "chest press": { file: "pectorals/lever-chest-press.gif", target: "Chest", equipment: "Machine" },
  "seated chest press": { file: "pectorals/lever-chest-press.gif", target: "Chest", equipment: "Machine" },
  "barbell bench press": { file: "pectorals/barbell-bench-press.gif", target: "Chest", equipment: "Barbell" },
  "bench press": { file: "pectorals/barbell-bench-press.gif", target: "Chest", equipment: "Barbell" },
  "flat bench press": { file: "pectorals/barbell-bench-press.gif", target: "Chest", equipment: "Barbell" },
  "barbell incline bench press": { file: "pectorals/barbell-incline-bench-press.gif", target: "Upper Chest", equipment: "Barbell" },
  "incline bench press": { file: "pectorals/barbell-incline-bench-press.gif", target: "Upper Chest", equipment: "Barbell" },
  "incline barbell press": { file: "pectorals/barbell-incline-bench-press.gif", target: "Upper Chest", equipment: "Barbell" },
  "incline dumbbell press": { file: "pectorals/dumbbell-incline-bench-press.gif", target: "Upper Chest", equipment: "Dumbbell" },
  "dumbbell incline bench press": { file: "pectorals/dumbbell-incline-bench-press.gif", target: "Upper Chest", equipment: "Dumbbell" },
  "dumbbell incline press": { file: "pectorals/dumbbell-incline-bench-press.gif", target: "Upper Chest", equipment: "Dumbbell" },
  "dumbbell bench press": { file: "pectorals/dumbbell-bench-press.gif", target: "Chest", equipment: "Dumbbell" },
  "flat dumbbell press": { file: "pectorals/dumbbell-bench-press.gif", target: "Chest", equipment: "Dumbbell" },
  "dumbbell press": { file: "pectorals/dumbbell-bench-press.gif", target: "Chest", equipment: "Dumbbell" },
  "barbell decline bench press": { file: "pectorals/barbell-decline-bench-press.gif", target: "Lower Chest", equipment: "Barbell" },
  "decline bench press": { file: "pectorals/barbell-decline-bench-press.gif", target: "Lower Chest", equipment: "Barbell" },
  "push up": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "pushup": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "push ups": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "pushups": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "chest dip": { file: "pectorals/chest-dip.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "dips": { file: "pectorals/chest-dip.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "dip": { file: "pectorals/chest-dip.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "dumbbell fly": { file: "pectorals/dumbbell-fly.gif", target: "Chest", equipment: "Dumbbell" },
  "dumbbell flyes": { file: "pectorals/dumbbell-fly.gif", target: "Chest", equipment: "Dumbbell" },
  "cable fly": { file: "pectorals/cable-standing-fly.gif", target: "Chest", equipment: "Cable" },
  "cable crossover": { file: "pectorals/cable-standing-fly.gif", target: "Chest", equipment: "Cable" },
  "cable crossovers": { file: "pectorals/cable-standing-fly.gif", target: "Chest", equipment: "Cable" },
  "pec deck": { file: "pectorals/lever-seated-fly.gif", target: "Chest", equipment: "Machine" },
  "machine fly": { file: "pectorals/lever-seated-fly.gif", target: "Chest", equipment: "Machine" },
  "pec fly": { file: "pectorals/lever-seated-fly.gif", target: "Chest", equipment: "Machine" },

  // BACK / LATS
  "lat pulldown": { file: "lats/cable-lat-pulldown-full-range-of-motion.gif", target: "Lats", equipment: "Cable" },
  "cable lat pulldown": { file: "lats/cable-lat-pulldown-full-range-of-motion.gif", target: "Lats", equipment: "Cable" },
  "wide grip lat pulldown": { file: "lats/cable-lat-pulldown-full-range-of-motion.gif", target: "Lats", equipment: "Cable" },
  "close grip lat pulldown": { file: "lats/band-close-grip-pulldown.gif", target: "Lats", equipment: "Cable" },
  "pull up": { file: "lats/pull-up.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "pullup": { file: "lats/pull-up.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "pull ups": { file: "lats/pull-up.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "pullups": { file: "lats/pull-up.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "chin up": { file: "biceps/chin-ups.gif", target: "Lats & Biceps", equipment: "Bodyweight" },
  "chinup": { file: "biceps/chin-ups.gif", target: "Lats & Biceps", equipment: "Bodyweight" },
  "seated cable row": { file: "back/cable-seated-row.gif", target: "Middle Back", equipment: "Cable" },
  "cable row": { file: "back/cable-seated-row.gif", target: "Middle Back", equipment: "Cable" },
  "seated row": { file: "back/cable-seated-row.gif", target: "Middle Back", equipment: "Cable" },
  "barbell row": { file: "back/barbell-bent-over-row.gif", target: "Upper Back", equipment: "Barbell" },
  "barbell bent over row": { file: "back/barbell-bent-over-row.gif", target: "Upper Back", equipment: "Barbell" },
  "bent over row": { file: "back/barbell-bent-over-row.gif", target: "Upper Back", equipment: "Barbell" },
  "dumbbell row": { file: "back/dumbbell-bent-over-row.gif", target: "Middle Back", equipment: "Dumbbell" },
  "one arm dumbbell row": { file: "back/dumbbell-bent-over-row.gif", target: "Middle Back", equipment: "Dumbbell" },
  "single arm dumbbell row": { file: "back/dumbbell-bent-over-row.gif", target: "Middle Back", equipment: "Dumbbell" },
  "t bar row": { file: "back/lever-t-bar-row.gif", target: "Middle Back", equipment: "Machine" },
  "lever t bar row": { file: "back/lever-t-bar-row.gif", target: "Middle Back", equipment: "Machine" },
  "hyperextension": { file: "back/hyperextension.gif", target: "Lower Back", equipment: "Machine" },
  "back extension": { file: "back/hyperextension.gif", target: "Lower Back", equipment: "Machine" },
  "face pull": { file: "delts/cable-rear-delt-row-stirrups.gif", target: "Rear Delts & Traps", equipment: "Cable" },
  "cable face pull": { file: "delts/cable-rear-delt-row-stirrups.gif", target: "Rear Delts & Traps", equipment: "Cable" },

  // SHOULDERS / DELTS
  "barbell standing military press": { file: "delts/barbell-standing-wide-military-press.gif", target: "Shoulders", equipment: "Barbell" },
  "military press": { file: "delts/barbell-standing-wide-military-press.gif", target: "Shoulders", equipment: "Barbell" },
  "overhead press": { file: "delts/barbell-standing-wide-military-press.gif", target: "Shoulders", equipment: "Barbell" },
  "shoulder press": { file: "delts/barbell-standing-wide-military-press.gif", target: "Shoulders", equipment: "Barbell" },
  "barbell shoulder press": { file: "delts/barbell-standing-wide-military-press.gif", target: "Shoulders", equipment: "Barbell" },
  "dumbbell shoulder press": { file: "delts/dumbbell-seated-shoulder-press.gif", target: "Shoulders", equipment: "Dumbbell" },
  "seated dumbbell press": { file: "delts/dumbbell-seated-shoulder-press.gif", target: "Shoulders", equipment: "Dumbbell" },
  "seated dumbbell shoulder press": { file: "delts/dumbbell-seated-shoulder-press.gif", target: "Shoulders", equipment: "Dumbbell" },
  "dumbbell lateral raise": { file: "delts/dumbbell-lateral-raise.gif", target: "Side Delts", equipment: "Dumbbell" },
  "lateral raise": { file: "delts/dumbbell-lateral-raise.gif", target: "Side Delts", equipment: "Dumbbell" },
  "side lateral raise": { file: "delts/dumbbell-lateral-raise.gif", target: "Side Delts", equipment: "Dumbbell" },
  "side raises": { file: "delts/dumbbell-lateral-raise.gif", target: "Side Delts", equipment: "Dumbbell" },
  "cable lateral raise": { file: "delts/cable-one-arm-lateral-raise.gif", target: "Side Delts", equipment: "Cable" },
  "dumbbell front raise": { file: "delts/dumbbell-front-raise.gif", target: "Front Delts", equipment: "Dumbbell" },
  "front raise": { file: "delts/dumbbell-front-raise.gif", target: "Front Delts", equipment: "Dumbbell" },
  "rear delt fly": { file: "delts/lever-seated-reverse-fly.gif", target: "Rear Delts", equipment: "Machine" },
  "reverse fly": { file: "delts/lever-seated-reverse-fly.gif", target: "Rear Delts", equipment: "Machine" },
  "reverse pec deck": { file: "delts/lever-seated-reverse-fly.gif", target: "Rear Delts", equipment: "Machine" },
  "dumbbell shrug": { file: "traps/dumbbell-shrug.gif", target: "Traps", equipment: "Dumbbell" },
  "dumbbell shrugs": { file: "traps/dumbbell-shrug.gif", target: "Traps", equipment: "Dumbbell" },
  "shrugs": { file: "traps/dumbbell-shrug.gif", target: "Traps", equipment: "Dumbbell" },

  // LEGS / LOWER BODY
  "barbell squat": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Barbell" },
  "back squat": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Barbell" },
  "squat": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Barbell" },
  "squats": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Barbell" },
  "barbell front squat": { file: "glutes/barbell-front-squat.gif", target: "Quads", equipment: "Barbell" },
  "front squat": { file: "glutes/barbell-front-squat.gif", target: "Quads", equipment: "Barbell" },
  "goblet squat": { file: "quads/dumbbell-goblet-squat.gif", target: "Quads", equipment: "Dumbbell" },
  "dumbbell goblet squat": { file: "quads/dumbbell-goblet-squat.gif", target: "Quads", equipment: "Dumbbell" },
  "leg press": { file: "glutes/sled-45-leg-press.gif", target: "Quads & Glutes", equipment: "Machine" },
  "sled 45 leg press": { file: "glutes/sled-45-leg-press.gif", target: "Quads & Glutes", equipment: "Machine" },
  "45 degree leg press": { file: "glutes/sled-45-leg-press.gif", target: "Quads & Glutes", equipment: "Machine" },
  "leg extension": { file: "quads/lever-leg-extension.gif", target: "Quads", equipment: "Machine" },
  "lever leg extension": { file: "quads/lever-leg-extension.gif", target: "Quads", equipment: "Machine" },
  "quad extension": { file: "quads/lever-leg-extension.gif", target: "Quads", equipment: "Machine" },
  "dumbbell lunge": { file: "quads/dumbbell-lunge.gif", target: "Quads & Glutes", equipment: "Dumbbell" },
  "walking lunges": { file: "quads/dumbbell-lunge.gif", target: "Quads & Glutes", equipment: "Dumbbell" },
  "lunges": { file: "quads/dumbbell-lunge.gif", target: "Quads & Glutes", equipment: "Dumbbell" },
  "lunge": { file: "quads/dumbbell-lunge.gif", target: "Quads & Glutes", equipment: "Dumbbell" },
  "bulgarian split squat": { file: "quads/dumbbell-single-leg-split-squat.gif", target: "Quads & Glutes", equipment: "Dumbbell" },
  "split squat": { file: "quads/dumbbell-single-leg-split-squat.gif", target: "Quads & Glutes", equipment: "Dumbbell" },
  "barbell deadlift": { file: "glutes/barbell-deadlift.gif", target: "Posterior Chain", equipment: "Barbell" },
  "deadlift": { file: "glutes/barbell-deadlift.gif", target: "Posterior Chain", equipment: "Barbell" },
  "conventional deadlift": { file: "glutes/barbell-deadlift.gif", target: "Posterior Chain", equipment: "Barbell" },
  "romanian deadlift": { file: "glutes/barbell-straight-leg-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Barbell" },
  "rdl": { file: "glutes/barbell-straight-leg-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Barbell" },
  "stiff leg deadlift": { file: "glutes/barbell-straight-leg-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Barbell" },
  "lying leg curl": { file: "hamstrings/lever-lying-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  "hamstring curl": { file: "hamstrings/lever-lying-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  "leg curl": { file: "hamstrings/lever-lying-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  "seated leg curl": { file: "hamstrings/lever-seated-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  "barbell hip thrust": { file: "glutes/barbell-hip-thrust.gif", target: "Glutes", equipment: "Barbell" },
  "hip thrust": { file: "glutes/barbell-hip-thrust.gif", target: "Glutes", equipment: "Barbell" },
  "glute bridge": { file: "glutes/barbell-hip-thrust.gif", target: "Glutes", equipment: "Barbell" },
  "standing calf raise": { file: "calves/standing-calf-raise.gif", target: "Calves", equipment: "Bodyweight" },
  "calf raise": { file: "calves/standing-calf-raise.gif", target: "Calves", equipment: "Bodyweight" },
  "calf raises": { file: "calves/standing-calf-raise.gif", target: "Calves", equipment: "Bodyweight" },
  "seated calf raise": { file: "calves/lever-seated-calf-raise.gif", target: "Calves", equipment: "Machine" },

  // ARMS (BICEPS / TRICEPS / FOREARMS)
  "barbell curl": { file: "biceps/barbell-curl.gif", target: "Biceps", equipment: "Barbell" },
  "barbell bicep curl": { file: "biceps/barbell-curl.gif", target: "Biceps", equipment: "Barbell" },
  "bicep curl": { file: "biceps/dumbbell-biceps-curl.gif", target: "Biceps", equipment: "Dumbbell" },
  "bicep curls": { file: "biceps/dumbbell-biceps-curl.gif", target: "Biceps", equipment: "Dumbbell" },
  "dumbbell bicep curl": { file: "biceps/dumbbell-biceps-curl.gif", target: "Biceps", equipment: "Dumbbell" },
  "dumbbell curl": { file: "biceps/dumbbell-biceps-curl.gif", target: "Biceps", equipment: "Dumbbell" },
  "hammer curl": { file: "biceps/dumbbell-hammer-curl.gif", target: "Brachialis & Biceps", equipment: "Dumbbell" },
  "dumbbell hammer curl": { file: "biceps/dumbbell-hammer-curl.gif", target: "Brachialis & Biceps", equipment: "Dumbbell" },
  "preacher curl": { file: "biceps/barbell-preacher-curl.gif", target: "Biceps", equipment: "Barbell" },
  "incline dumbbell curl": { file: "biceps/dumbbell-incline-curl.gif", target: "Biceps (Long Head)", equipment: "Dumbbell" },
  "concentration curl": { file: "biceps/dumbbell-concentration-curl.gif", target: "Biceps", equipment: "Dumbbell" },
  "cable curl": { file: "biceps/cable-curl.gif", target: "Biceps", equipment: "Cable" },
  "cable pushdown": { file: "triceps/cable-pushdown.gif", target: "Triceps", equipment: "Cable" },
  "tricep pushdown": { file: "triceps/cable-pushdown.gif", target: "Triceps", equipment: "Cable" },
  "triceps pushdown": { file: "triceps/cable-pushdown.gif", target: "Triceps", equipment: "Cable" },
  "rope pushdown": { file: "triceps/cable-rope-pushdown.gif", target: "Triceps", equipment: "Cable" },
  "cable rope pushdown": { file: "triceps/cable-rope-pushdown.gif", target: "Triceps", equipment: "Cable" },
  "skull crusher": { file: "triceps/barbell-lying-triceps-extension.gif", target: "Triceps", equipment: "Barbell" },
  "skull crushers": { file: "triceps/barbell-lying-triceps-extension.gif", target: "Triceps", equipment: "Barbell" },
  "lying triceps extension": { file: "triceps/barbell-lying-triceps-extension.gif", target: "Triceps", equipment: "Barbell" },
  "overhead tricep extension": { file: "triceps/dumbbell-standing-overhead-triceps-extension.gif", target: "Triceps (Long Head)", equipment: "Dumbbell" },
  "overhead dumbbell tricep extension": { file: "triceps/dumbbell-standing-overhead-triceps-extension.gif", target: "Triceps", equipment: "Dumbbell" },
  "tricep kickback": { file: "triceps/dumbbell-kickback.gif", target: "Triceps", equipment: "Dumbbell" },
  "bench dip": { file: "triceps/bench-dip.gif", target: "Triceps", equipment: "Bodyweight" },
  "wrist curl": { file: "forearms/barbell-wrist-curl.gif", target: "Forearms", equipment: "Barbell" },

  // CORE / ABS
  "plank": { file: "abs/front-plank.gif", target: "Core", equipment: "Bodyweight" },
  "front plank": { file: "abs/front-plank.gif", target: "Core", equipment: "Bodyweight" },
  "crunch": { file: "abs/crunch.gif", target: "Abs", equipment: "Bodyweight" },
  "crunches": { file: "abs/crunch.gif", target: "Abs", equipment: "Bodyweight" },
  "hanging leg raise": { file: "abs/hanging-leg-raise.gif", target: "Lower Abs", equipment: "Bodyweight" },
  "leg raise": { file: "abs/hanging-leg-raise.gif", target: "Lower Abs", equipment: "Bodyweight" },
  "cable crunch": { file: "abs/cable-kneeling-crunch.gif", target: "Abs", equipment: "Cable" },
  "russian twist": { file: "abs/russian-twist.gif", target: "Obliques", equipment: "Bodyweight" },
  "ab wheel rollout": { file: "abs/ab-wheel-rollout.gif", target: "Core", equipment: "Ab Wheel" },
  "ab rollout": { file: "abs/ab-wheel-rollout.gif", target: "Core", equipment: "Ab Wheel" },
  "mountain climber": { file: "abs/mountain-climber.gif", target: "Core & Cardio", equipment: "Bodyweight" },
  "mountain climbers": { file: "abs/mountain-climber.gif", target: "Core & Cardio", equipment: "Bodyweight" },
};

/**
 * Normalizes input exercise name for token and fuzzy matching
 */
function cleanName(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/\b\d+\s*[xX×]\s*\d+(\s*reps?)?\b/gi, "") // strip "3x12" or "3x12 reps"
    .replace(/\b\d+\s*(kg|lbs?)\b/gi, "")             // strip "60 kg"
    .replace(/\bdb\b/gi, "dumbbell")
    .replace(/\bbb\b/gi, "barbell")
    .replace(/[^a-z0-9]/g, " ")                       // strip symbols
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves any exercise name to an animated demonstration GIF with 100% reliability
 */
export function getExerciseAnimation(exerciseName: string, targetMuscleHint?: string): ExerciseAnimationInfo {
  const cleaned = cleanName(exerciseName);

  // 1. Direct match in canonical dictionary
  if (CANONICAL_EXERCISES[cleaned]) {
    const item = CANONICAL_EXERCISES[cleaned];
    return {
      name: exerciseName,
      gifUrl: `${CDN_BASE}/${item.file}`,
      secondaryGifUrl: `${RAW_BASE}/${item.file}`,
      targetMuscle: item.target,
      equipment: item.equipment,
      isFallback: false,
    };
  }

  // 2. Keyword/substring search against canonical map
  for (const [key, item] of Object.entries(CANONICAL_EXERCISES)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return {
        name: exerciseName,
        gifUrl: `${CDN_BASE}/${item.file}`,
        secondaryGifUrl: `${RAW_BASE}/${item.file}`,
        targetMuscle: item.target,
        equipment: item.equipment,
        isFallback: false,
      };
    }
  }

  // 3. Multi-token partial matching (best score)
  const tokens = cleaned.split(" ").filter((t) => t.length > 2);
  let bestMatch: { file: string; target: string; equipment: string } | null = null;
  let highestScore = 0;

  for (const [key, item] of Object.entries(CANONICAL_EXERCISES)) {
    let score = 0;
    for (const tok of tokens) {
      if (key.includes(tok)) score += 2;
    }
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  }

  if (bestMatch && highestScore >= 2) {
    return {
      name: exerciseName,
      gifUrl: `${CDN_BASE}/${bestMatch.file}`,
      secondaryGifUrl: `${RAW_BASE}/${bestMatch.file}`,
      targetMuscle: bestMatch.target,
      equipment: bestMatch.equipment,
      isFallback: false,
    };
  }

  // 4. Targeted Muscle Hint Fallback
  const hintLower = String(targetMuscleHint || "").toLowerCase();
  for (const [muscleKey, fallback] of Object.entries(MUSCLE_FALLBACKS)) {
    if (hintLower.includes(muscleKey) || cleaned.includes(muscleKey)) {
      return {
        name: exerciseName,
        gifUrl: `${CDN_BASE}/${fallback.file}`,
        secondaryGifUrl: `${RAW_BASE}/${fallback.file}`,
        targetMuscle: fallback.target,
        equipment: fallback.equipment,
        isFallback: true,
      };
    }
  }

  // 5. Default General Compound Fallback (Bench Press / Full Body)
  const defaultFallback = MUSCLE_FALLBACKS.chest;
  return {
    name: exerciseName,
    gifUrl: `${CDN_BASE}/${defaultFallback.file}`,
    secondaryGifUrl: `${RAW_BASE}/${defaultFallback.file}`,
    targetMuscle: defaultFallback.target,
    equipment: defaultFallback.equipment,
    isFallback: true,
  };
}
