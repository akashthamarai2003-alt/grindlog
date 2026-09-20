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
  calves: { file: "calves/bodyweight-standing-calf-raise.gif", target: "Calves", equipment: "Bodyweight" },
  abs: { file: "abs/weighted-front-plank.gif", target: "Core / Abs", equipment: "Bodyweight" },
  abdominals: { file: "abs/weighted-front-plank.gif", target: "Core / Abs", equipment: "Bodyweight" },
  core: { file: "abs/weighted-front-plank.gif", target: "Core", equipment: "Bodyweight" },
  cardio: { file: "cardio/cycle-cross-trainer.gif", target: "Cardio", equipment: "Machine" },
  traps: { file: "traps/dumbbell-shrug.gif", target: "Trapezius", equipment: "Dumbbells" },
  trapezius: { file: "traps/dumbbell-shrug.gif", target: "Trapezius", equipment: "Dumbbells" },
  forearms: { file: "forearms/barbell-wrist-curl.gif", target: "Forearms", equipment: "Barbell" },
};

// Curated Canonical Exercise Dictionary with Extensive Home & Gym Coverage
const CANONICAL_EXERCISES: Record<string, { file: string; target: string; equipment: string }> = {
  // PUSH-UP & CHEST BODYWEIGHT VARIATIONS (Specific multi-word forms first)
  "feet elevated push up": { file: "pectorals/decline-push-up.gif", target: "Upper Chest & Shoulders", equipment: "Bodyweight" },
  "feet elevated pushup": { file: "pectorals/decline-push-up.gif", target: "Upper Chest & Shoulders", equipment: "Bodyweight" },
  "feet elevated push ups": { file: "pectorals/decline-push-up.gif", target: "Upper Chest & Shoulders", equipment: "Bodyweight" },
  "feet elevated pushups": { file: "pectorals/decline-push-up.gif", target: "Upper Chest & Shoulders", equipment: "Bodyweight" },
  "elevated push up": { file: "pectorals/decline-push-up.gif", target: "Upper Chest & Shoulders", equipment: "Bodyweight" },
  "decline push up": { file: "pectorals/decline-push-up.gif", target: "Upper Chest & Shoulders", equipment: "Bodyweight" },
  "decline pushup": { file: "pectorals/decline-push-up.gif", target: "Upper Chest & Shoulders", equipment: "Bodyweight" },
  "decline push ups": { file: "pectorals/decline-push-up.gif", target: "Upper Chest & Shoulders", equipment: "Bodyweight" },
  "diamond push up": { file: "triceps/diamond-push-up.gif", target: "Triceps & Inner Chest", equipment: "Bodyweight" },
  "diamond pushup": { file: "triceps/diamond-push-up.gif", target: "Triceps & Inner Chest", equipment: "Bodyweight" },
  "diamond push ups": { file: "triceps/diamond-push-up.gif", target: "Triceps & Inner Chest", equipment: "Bodyweight" },
  "diamond pushups": { file: "triceps/diamond-push-up.gif", target: "Triceps & Inner Chest", equipment: "Bodyweight" },
  "triangle push up": { file: "triceps/diamond-push-up.gif", target: "Triceps & Inner Chest", equipment: "Bodyweight" },
  "close grip push up": { file: "triceps/close-grip-push-up.gif", target: "Triceps & Chest", equipment: "Bodyweight" },
  "close grip pushup": { file: "triceps/close-grip-push-up.gif", target: "Triceps & Chest", equipment: "Bodyweight" },
  "close grip push ups": { file: "triceps/close-grip-push-up.gif", target: "Triceps & Chest", equipment: "Bodyweight" },
  "narrow push up": { file: "triceps/close-grip-push-up.gif", target: "Triceps", equipment: "Bodyweight" },
  "narrow pushup": { file: "triceps/close-grip-push-up.gif", target: "Triceps", equipment: "Bodyweight" },
  "pike push up": { file: "glutes/pike-to-cobra-push-up.gif", target: "Shoulders / Front Delts", equipment: "Bodyweight" },
  "pike pushup": { file: "glutes/pike-to-cobra-push-up.gif", target: "Shoulders / Front Delts", equipment: "Bodyweight" },
  "pike push ups": { file: "glutes/pike-to-cobra-push-up.gif", target: "Shoulders / Front Delts", equipment: "Bodyweight" },
  "incline push up": { file: "pectorals/incline-push-up.gif", target: "Lower Chest", equipment: "Bodyweight" },
  "incline pushup": { file: "pectorals/incline-push-up.gif", target: "Lower Chest", equipment: "Bodyweight" },
  "incline push ups": { file: "pectorals/incline-push-up.gif", target: "Lower Chest", equipment: "Bodyweight" },
  "hands elevated push up": { file: "pectorals/incline-push-up.gif", target: "Lower Chest", equipment: "Bodyweight" },
  "wide grip push up": { file: "pectorals/wide-hand-push-up.gif", target: "Chest", equipment: "Bodyweight" },
  "wide hand push up": { file: "pectorals/wide-hand-push-up.gif", target: "Chest", equipment: "Bodyweight" },
  "wide push up": { file: "pectorals/wide-hand-push-up.gif", target: "Chest", equipment: "Bodyweight" },
  "archer push up": { file: "pectorals/archer-push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "archer pushup": { file: "pectorals/archer-push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "hindu push up": { file: "pectorals/modified-hindu-push-up-male.gif", target: "Shoulders & Chest", equipment: "Bodyweight" },
  "hindu pushup": { file: "pectorals/modified-hindu-push-up-male.gif", target: "Shoulders & Chest", equipment: "Bodyweight" },
  "kneeling push up": { file: "pectorals/kneeling-push-up-male.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "knee push up": { file: "pectorals/kneeling-push-up-male.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "handstand push up": { file: "triceps/handstand-push-up.gif", target: "Shoulders & Triceps", equipment: "Bodyweight" },
  "handstand pushup": { file: "triceps/handstand-push-up.gif", target: "Shoulders & Triceps", equipment: "Bodyweight" },
  "clap push up": { file: "pectorals/clap-push-up.gif", target: "Chest & Explosive Power", equipment: "Bodyweight" },
  "plyo push up": { file: "pectorals/plyo-push-up.gif", target: "Chest & Explosive Power", equipment: "Bodyweight" },
  "shoulder tap push up": { file: "pectorals/shoulder-tap-push-up.gif", target: "Core & Shoulders", equipment: "Bodyweight" },
  "push up to side plank": { file: "abs/push-up-to-side-plank.gif", target: "Chest & Obliques", equipment: "Bodyweight" },
  "superman push up": { file: "pectorals/superman-push-up.gif", target: "Chest & Core", equipment: "Bodyweight" },
  "single arm push up": { file: "pectorals/single-arm-push-up.gif", target: "Chest & Core", equipment: "Bodyweight" },
  "one arm push up": { file: "pectorals/single-arm-push-up.gif", target: "Chest & Core", equipment: "Bodyweight" },
  "wall push up": { file: "pectorals/push-up-wall.gif", target: "Chest (Beginner)", equipment: "Bodyweight" },
  "standard push up": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "standard pushup": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "regular push up": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "push up": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "pushup": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "push ups": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "pushups": { file: "pectorals/push-up.gif", target: "Chest & Triceps", equipment: "Bodyweight" },

  // DIPS
  "bench dip": { file: "triceps/bench-dip-on-floor.gif", target: "Triceps", equipment: "Bodyweight" },
  "bench dips": { file: "triceps/bench-dip-on-floor.gif", target: "Triceps", equipment: "Bodyweight" },
  "chair dip": { file: "triceps/bench-dip-on-floor.gif", target: "Triceps", equipment: "Bodyweight" },
  "floor dip": { file: "triceps/bench-dip-on-floor.gif", target: "Triceps", equipment: "Bodyweight" },
  "chest dip": { file: "pectorals/chest-dip.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "chest dips": { file: "pectorals/chest-dip.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "tricep dip": { file: "triceps/bench-dip-on-floor.gif", target: "Triceps", equipment: "Bodyweight" },
  "dips": { file: "pectorals/chest-dip.gif", target: "Chest & Triceps", equipment: "Bodyweight" },
  "dip": { file: "pectorals/chest-dip.gif", target: "Chest & Triceps", equipment: "Bodyweight" },

  // GYM CHEST / PECTORALS
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
  "dumbbell fly": { file: "pectorals/dumbbell-fly.gif", target: "Chest", equipment: "Dumbbell" },
  "dumbbell flyes": { file: "pectorals/dumbbell-fly.gif", target: "Chest", equipment: "Dumbbell" },
  "cable fly": { file: "pectorals/cable-standing-fly.gif", target: "Chest", equipment: "Cable" },
  "cable crossover": { file: "pectorals/cable-standing-fly.gif", target: "Chest", equipment: "Cable" },
  "cable crossovers": { file: "pectorals/cable-standing-fly.gif", target: "Chest", equipment: "Cable" },
  "pec deck": { file: "pectorals/lever-seated-fly.gif", target: "Chest", equipment: "Machine" },
  "machine fly": { file: "pectorals/lever-seated-fly.gif", target: "Chest", equipment: "Machine" },
  "pec fly": { file: "pectorals/lever-seated-fly.gif", target: "Chest", equipment: "Machine" },

  // BACK / LATS / CALISTHENICS
  "lat pulldown": { file: "lats/cable-lat-pulldown-full-range-of-motion.gif", target: "Lats", equipment: "Cable" },
  "cable lat pulldown": { file: "lats/cable-lat-pulldown-full-range-of-motion.gif", target: "Lats", equipment: "Cable" },
  "wide grip lat pulldown": { file: "lats/cable-lat-pulldown-full-range-of-motion.gif", target: "Lats", equipment: "Cable" },
  "close grip lat pulldown": { file: "lats/band-close-grip-pulldown.gif", target: "Lats", equipment: "Cable" },
  "pull up": { file: "lats/pull-up.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "pullup": { file: "lats/pull-up.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "pull ups": { file: "lats/pull-up.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "pullups": { file: "lats/pull-up.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "chin up": { file: "lats/chin-up.gif", target: "Lats & Biceps", equipment: "Bodyweight" },
  "chinup": { file: "lats/chin-up.gif", target: "Lats & Biceps", equipment: "Bodyweight" },
  "chin ups": { file: "lats/chin-up.gif", target: "Lats & Biceps", equipment: "Bodyweight" },
  "close grip chin up": { file: "lats/close-grip-chin-up.gif", target: "Biceps & Lats", equipment: "Bodyweight" },
  "inverted row": { file: "upper-back/bodyweight-squatting-row.gif", target: "Upper Back & Lats", equipment: "Bodyweight" },
  "australian pull up": { file: "upper-back/bodyweight-squatting-row.gif", target: "Upper Back & Lats", equipment: "Bodyweight" },
  "bodyweight row": { file: "upper-back/bodyweight-squatting-row.gif", target: "Upper Back & Lats", equipment: "Bodyweight" },
  "doorframe row": { file: "upper-back/bodyweight-squatting-row-with-towel.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "towel row": { file: "upper-back/bodyweight-squatting-row-with-towel.gif", target: "Lats & Back", equipment: "Bodyweight" },
  "scapula push up": { file: "serratus-anterior/scapula-push-up.gif", target: "Serratus & Upper Back", equipment: "Bodyweight" },
  "seated cable row": { file: "upper-back/cable-seated-row.gif", target: "Middle Back", equipment: "Cable" },
  "cable row": { file: "upper-back/cable-seated-row.gif", target: "Middle Back", equipment: "Cable" },
  "seated row": { file: "upper-back/cable-seated-row.gif", target: "Middle Back", equipment: "Cable" },
  "barbell row": { file: "upper-back/barbell-bent-over-row.gif", target: "Upper Back", equipment: "Barbell" },
  "barbell bent over row": { file: "upper-back/barbell-bent-over-row.gif", target: "Upper Back", equipment: "Barbell" },
  "bent over row": { file: "upper-back/barbell-bent-over-row.gif", target: "Upper Back", equipment: "Barbell" },
  "dumbbell row": { file: "upper-back/dumbbell-one-arm-bent-over-row.gif", target: "Middle Back", equipment: "Dumbbell" },
  "one arm dumbbell row": { file: "upper-back/dumbbell-one-arm-bent-over-row.gif", target: "Middle Back", equipment: "Dumbbell" },
  "single arm dumbbell row": { file: "upper-back/dumbbell-one-arm-bent-over-row.gif", target: "Middle Back", equipment: "Dumbbell" },
  "t bar row": { file: "upper-back/lever-t-bar-row.gif", target: "Middle Back", equipment: "Machine" },
  "lever t bar row": { file: "upper-back/lever-t-bar-row.gif", target: "Middle Back", equipment: "Machine" },
  "hyperextension": { file: "spine/hyperextension.gif", target: "Lower Back", equipment: "Machine" },
  "back extension": { file: "spine/hyperextension.gif", target: "Lower Back", equipment: "Machine" },
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

  // LEGS / LOWER BODY (HOME & GYM)
  "bodyweight squat": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "air squat": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "jump squat": { file: "glutes/jump-squat.gif", target: "Quads & Explosive Power", equipment: "Bodyweight" },
  "squat jump": { file: "glutes/jump-squat.gif", target: "Quads & Explosive Power", equipment: "Bodyweight" },
  "pistol squat": { file: "glutes/single-leg-squat-pistol-male.gif", target: "Quadriceps & Balance", equipment: "Bodyweight" },
  "single leg squat": { file: "glutes/single-leg-squat-pistol-male.gif", target: "Quadriceps & Balance", equipment: "Bodyweight" },
  "cossack squat": { file: "glutes/weighted-cossack-squats-male.gif", target: "Adductors & Quads", equipment: "Bodyweight" },
  "bulgarian split squat": { file: "quads/dumbbell-single-leg-split-squat.gif", target: "Quads & Glutes", equipment: "Bodyweight / Dumbbell" },
  "split squat": { file: "quads/split-squats.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "split squats": { file: "quads/split-squats.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "walking lunge": { file: "glutes/dumbbell-lunge.gif", target: "Quads & Glutes", equipment: "Bodyweight / Dumbbell" },
  "walking lunges": { file: "glutes/dumbbell-lunge.gif", target: "Quads & Glutes", equipment: "Bodyweight / Dumbbell" },
  "reverse lunge": { file: "quads/barbell-squat-jump-step-rear-lunge.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "lunge": { file: "glutes/dumbbell-lunge.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "lunges": { file: "glutes/dumbbell-lunge.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "wall sit": { file: "quads/smith-chair-squat.gif", target: "Quadriceps Isometric", equipment: "Bodyweight" },
  "glute bridge": { file: "glutes/barbell-glute-bridge.gif", target: "Glutes & Hamstrings", equipment: "Bodyweight" },
  "barbell hip thrust": { file: "glutes/barbell-glute-bridge.gif", target: "Glutes", equipment: "Barbell" },
  "hip thrust": { file: "glutes/barbell-glute-bridge.gif", target: "Glutes", equipment: "Barbell / Bodyweight" },
  "barbell squat": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Barbell" },
  "back squat": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Barbell" },
  "squat": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Barbell / Bodyweight" },
  "squats": { file: "glutes/barbell-full-squat-side-pov.gif", target: "Quads & Glutes", equipment: "Barbell / Bodyweight" },
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
  "barbell deadlift": { file: "glutes/barbell-deadlift.gif", target: "Posterior Chain", equipment: "Barbell" },
  "deadlift": { file: "glutes/barbell-deadlift.gif", target: "Posterior Chain", equipment: "Barbell" },
  "conventional deadlift": { file: "glutes/barbell-deadlift.gif", target: "Posterior Chain", equipment: "Barbell" },
  "romanian deadlift": { file: "glutes/barbell-romanian-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Barbell" },
  "rdl": { file: "glutes/barbell-romanian-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Barbell" },
  "stiff leg deadlift": { file: "glutes/barbell-romanian-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Barbell" },
  "lying leg curl": { file: "hamstrings/lever-lying-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  "hamstring curl": { file: "hamstrings/lever-lying-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  "leg curl": { file: "hamstrings/lever-lying-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  "seated leg curl": { file: "hamstrings/lever-seated-leg-curl.gif", target: "Hamstrings", equipment: "Machine" },
  "standing calf raise": { file: "calves/bodyweight-standing-calf-raise.gif", target: "Calves", equipment: "Bodyweight" },
  "calf raise": { file: "calves/bodyweight-standing-calf-raise.gif", target: "Calves", equipment: "Bodyweight" },
  "calf raises": { file: "calves/bodyweight-standing-calf-raise.gif", target: "Calves", equipment: "Bodyweight" },
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
  "rope pushdown": { file: "triceps/cable-pushdown-with-rope-attachment.gif", target: "Triceps", equipment: "Cable" },
  "cable rope pushdown": { file: "triceps/cable-pushdown-with-rope-attachment.gif", target: "Triceps", equipment: "Cable" },
  "skull crusher": { file: "triceps/barbell-lying-triceps-extension.gif", target: "Triceps", equipment: "Barbell" },
  "skull crushers": { file: "triceps/barbell-lying-triceps-extension.gif", target: "Triceps", equipment: "Barbell" },
  "lying triceps extension": { file: "triceps/barbell-lying-triceps-extension.gif", target: "Triceps", equipment: "Barbell" },
  "overhead tricep extension": { file: "triceps/dumbbell-standing-triceps-extension.gif", target: "Triceps (Long Head)", equipment: "Dumbbell" },
  "overhead dumbbell tricep extension": { file: "triceps/dumbbell-standing-triceps-extension.gif", target: "Triceps", equipment: "Dumbbell" },
  "tricep kickback": { file: "triceps/dumbbell-kickback.gif", target: "Triceps", equipment: "Dumbbell" },
  "wrist curl": { file: "forearms/barbell-wrist-curl.gif", target: "Forearms", equipment: "Barbell" },

  // CORE / ABS (HOME & GYM)
  "plank": { file: "abs/weighted-front-plank.gif", target: "Core & Abs", equipment: "Bodyweight" },
  "front plank": { file: "abs/weighted-front-plank.gif", target: "Core & Abs", equipment: "Bodyweight" },
  "side plank": { file: "abs/bodyweight-incline-side-plank.gif", target: "Obliques & Core", equipment: "Bodyweight" },
  "plank with twist": { file: "abs/front-plank-with-twist.gif", target: "Core & Obliques", equipment: "Bodyweight" },
  "plank shoulder taps": { file: "abs/kneeling-plank-tap-shoulder-male.gif", target: "Core & Shoulders", equipment: "Bodyweight" },
  "shoulder tap": { file: "abs/kneeling-plank-tap-shoulder-male.gif", target: "Core & Shoulders", equipment: "Bodyweight" },
  "dead bug": { file: "abs/dead-bug.gif", target: "Core Stabilizers", equipment: "Bodyweight" },
  "deadbug": { file: "abs/dead-bug.gif", target: "Core Stabilizers", equipment: "Bodyweight" },
  "crunch": { file: "abs/crunch-floor.gif", target: "Upper Abs", equipment: "Bodyweight" },
  "crunches": { file: "abs/crunch-floor.gif", target: "Upper Abs", equipment: "Bodyweight" },
  "bicycle crunch": { file: "abs/band-bicycle-crunch.gif", target: "Obliques & Abs", equipment: "Bodyweight" },
  "reverse crunch": { file: "abs/cable-reverse-crunch.gif", target: "Lower Abs", equipment: "Bodyweight" },
  "hanging leg raise": { file: "abs/hanging-leg-raise.gif", target: "Lower Abs", equipment: "Bodyweight" },
  "lying leg raise": { file: "abs/lying-leg-raise-flat-bench.gif", target: "Lower Abs", equipment: "Bodyweight" },
  "leg raise": { file: "abs/hanging-leg-raise.gif", target: "Lower Abs", equipment: "Bodyweight" },
  "sit up": { file: "abs/arms-overhead-full-sit-up-male.gif", target: "Abs & Core", equipment: "Bodyweight" },
  "situp": { file: "abs/arms-overhead-full-sit-up-male.gif", target: "Abs & Core", equipment: "Bodyweight" },
  "sit ups": { file: "abs/arms-overhead-full-sit-up-male.gif", target: "Abs & Core", equipment: "Bodyweight" },
  "russian twist": { file: "abs/russian-twist.gif", target: "Obliques & Core", equipment: "Bodyweight" },
  "cable crunch": { file: "abs/cable-kneeling-crunch.gif", target: "Abs", equipment: "Cable" },
  "ab wheel rollout": { file: "abs/wheel-rollerout.gif", target: "Core", equipment: "Ab Wheel" },
  "ab rollout": { file: "abs/wheel-rollerout.gif", target: "Core", equipment: "Ab Wheel" },
  "mountain climber": { file: "cardio/mountain-climber.gif", target: "Core & Cardio", equipment: "Bodyweight" },
  "mountain climbers": { file: "cardio/mountain-climber.gif", target: "Core & Cardio", equipment: "Bodyweight" },
  "v up": { file: "abs/band-v-up.gif", target: "Abs & Core", equipment: "Bodyweight" },
  "v ups": { file: "abs/band-v-up.gif", target: "Abs & Core", equipment: "Bodyweight" },

  // CARDIO & HIIT
  "jumping jacks": { file: "cardio/jack-jump-male.gif", target: "Full Body Cardio", equipment: "Bodyweight" },
  "jumping jack": { file: "cardio/jack-jump-male.gif", target: "Full Body Cardio", equipment: "Bodyweight" },
  "burpee": { file: "cardio/burpee.gif", target: "Full Body & Cardio", equipment: "Bodyweight" },
  "burpees": { file: "cardio/burpee.gif", target: "Full Body & Cardio", equipment: "Bodyweight" },
  "jump rope": { file: "cardio/jump-rope.gif", target: "Cardio & Calves", equipment: "Jump Rope" },
  "skipping": { file: "cardio/jump-rope.gif", target: "Cardio & Calves", equipment: "Jump Rope" },
  "high knees": { file: "cardio/walking-high-knees-lunge.gif", target: "Cardio & Hip Flexors", equipment: "Bodyweight" },
  "bear crawl": { file: "cardio/bear-crawl.gif", target: "Full Body & Core", equipment: "Bodyweight" },
  "skater hops": { file: "cardio/skater-hops.gif", target: "Glutes & Agility", equipment: "Bodyweight" },
  "skater jumps": { file: "cardio/skater-hops.gif", target: "Glutes & Agility", equipment: "Bodyweight" },
  "star jump": { file: "cardio/star-jump-male.gif", target: "Cardio & Power", equipment: "Bodyweight" },
  "star jumps": { file: "cardio/star-jump-male.gif", target: "Cardio & Power", equipment: "Bodyweight" },
  "scissor jumps": { file: "cardio/scissor-jumps-male.gif", target: "Cardio & Legs", equipment: "Bodyweight" },

  // ADDITIONAL HOME CALISTHENICS & FLOOR MOVEMENTS
  "spider crawl push up": { file: "glutes/spider-crawl-push-up.gif", target: "Chest & Core", equipment: "Bodyweight" },
  "sphinx push up": { file: "triceps/push-up-on-lower-arms.gif", target: "Triceps", equipment: "Bodyweight" },
  "side push up": { file: "triceps/side-push-up.gif", target: "Triceps", equipment: "Bodyweight" },
  "deep push up": { file: "pectorals/deep-push-up.gif", target: "Chest Full Range", equipment: "Bodyweight" },
  "drop push up": { file: "pectorals/drop-push-up.gif", target: "Chest Plyometric", equipment: "Bodyweight" },
  "clock push up": { file: "pectorals/clock-push-up.gif", target: "Chest & Core", equipment: "Bodyweight" },
  "chest tap push up": { file: "pectorals/chest-tap-push-up-male.gif", target: "Chest & Stability", equipment: "Bodyweight" },
  "pike press": { file: "glutes/pike-to-cobra-push-up.gif", target: "Shoulders / Front Delts", equipment: "Bodyweight" },
  "forward lunge": { file: "glutes/forward-lunge-male.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "forward lunges": { file: "glutes/forward-lunge-male.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "lunge with jump": { file: "glutes/lunge-with-jump.gif", target: "Quads & Power", equipment: "Bodyweight" },
  "jumping lunge": { file: "glutes/lunge-with-jump.gif", target: "Quads & Power", equipment: "Bodyweight" },
  "jumping lunges": { file: "glutes/lunge-with-jump.gif", target: "Quads & Power", equipment: "Bodyweight" },
  "curtsey squat": { file: "glutes/curtsey-squat.gif", target: "Glutes & Quads", equipment: "Bodyweight" },
  "curtsy lunge": { file: "glutes/curtsey-squat.gif", target: "Glutes & Quads", equipment: "Bodyweight" },
  "glute bridge march": { file: "glutes/glute-bridge-march.gif", target: "Glutes & Core", equipment: "Bodyweight" },
  "single leg glute bridge": { file: "glutes/single-leg-bridge-with-outstretched-leg.gif", target: "Glutes & Hamstrings", equipment: "Bodyweight" },
  "single leg bridge": { file: "glutes/single-leg-bridge-with-outstretched-leg.gif", target: "Glutes & Hamstrings", equipment: "Bodyweight" },
  "side bridge hip abduction": { file: "abductors/side-bridge-hip-abduction.gif", target: "Hip Abductors & Glutes", equipment: "Bodyweight" },
  "side hip abduction": { file: "abductors/side-hip-abduction.gif", target: "Hip Abductors & Glutes", equipment: "Bodyweight" },
  "swimmer kicks": { file: "glutes/swimmer-kicks-v-2-male.gif", target: "Lower Back & Glutes", equipment: "Bodyweight" },
  "reverse plank": { file: "abs/reverse-plank-with-leg-lift.gif", target: "Posterior Chain & Core", equipment: "Bodyweight" },
  "air bike": { file: "abs/air-bike.gif", target: "Obliques & Abs", equipment: "Bodyweight" },
  "cross body crunch": { file: "abs/cross-body-crunch.gif", target: "Obliques", equipment: "Bodyweight" },
  "heel touchers": { file: "abs/alternate-heel-touchers.gif", target: "Obliques", equipment: "Bodyweight" },
  "alternate heel touchers": { file: "abs/alternate-heel-touchers.gif", target: "Obliques", equipment: "Bodyweight" },
  "heel touches": { file: "abs/alternate-heel-touchers.gif", target: "Obliques", equipment: "Bodyweight" },
  "frog crunch": { file: "abs/frog-crunch.gif", target: "Abs", equipment: "Bodyweight" },
  "crab twist toe touch": { file: "abs/crab-twist-toe-touch.gif", target: "Core & Agility", equipment: "Bodyweight" },
  "toe touch": { file: "abs/side-to-side-toe-touch-male.gif", target: "Hamstrings & Core", equipment: "Bodyweight" },
  "cocoons": { file: "abs/cocoons.gif", target: "Abs & Hip Flexors", equipment: "Bodyweight" },
  "flutter kicks": { file: "glutes/flutter-kicks.gif", target: "Lower Abs & Hip Flexors", equipment: "Bodyweight" },
  "flutter kick": { file: "glutes/flutter-kicks.gif", target: "Lower Abs & Hip Flexors", equipment: "Bodyweight" },
  "monster walk": { file: "glutes/monster-walk.gif", target: "Glutes & Hips", equipment: "Band / Bodyweight" },

  // DUMBBELL HOME EXERCISES
  "dumbbell floor press": { file: "pectorals/dumbbell-bench-press.gif", target: "Chest & Triceps", equipment: "Dumbbell" },
  "dumbbell arnold press": { file: "delts/dumbbell-arnold-press.gif", target: "Shoulders", equipment: "Dumbbell" },
  "arnold press": { file: "delts/dumbbell-arnold-press.gif", target: "Shoulders", equipment: "Dumbbell" },
  "dumbbell step up": { file: "glutes/dumbbell-step-up.gif", target: "Quads & Glutes", equipment: "Dumbbell" },
  "step up": { file: "glutes/dumbbell-step-up.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "step ups": { file: "glutes/dumbbell-step-up.gif", target: "Quads & Glutes", equipment: "Bodyweight" },
  "dumbbell romanian deadlift": { file: "glutes/dumbbell-romanian-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Dumbbell" },
  "dumbbell rdl": { file: "glutes/dumbbell-romanian-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Dumbbell" },
  "dumbbell deadlift": { file: "glutes/dumbbell-deadlift.gif", target: "Posterior Chain", equipment: "Dumbbell" },
  "dumbbell stiff leg deadlift": { file: "glutes/dumbbell-stiff-leg-deadlift.gif", target: "Hamstrings & Glutes", equipment: "Dumbbell" },
  "dumbbell rear lunge": { file: "glutes/dumbbell-rear-lunge.gif", target: "Quads & Glutes", equipment: "Dumbbell" },
};

// Pre-sorted canonical keys by length in descending order.
// This ensures specific multi-word variations (e.g., 'feet elevated push up', 'diamond push up')
// always match before generic base terms (e.g., 'push up').
const SORTED_CANONICAL_KEYS = Object.keys(CANONICAL_EXERCISES).sort((a, b) => b.length - a.length);

/**
 * Normalizes input exercise name for token and fuzzy matching
 */
function cleanName(raw: string): string {
  return String(raw || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "") // strip anything in parentheses like (bodyweight), (each leg), (tempo)
    .replace(/\[.*?\]/g, "") // strip brackets
    .replace(/\b\d+\s*[xX×]\s*\d+(\s*reps?)?\b/gi, "") // strip "3x12" or "3x12 reps"
    .replace(/\b\d+\s*(kg|lbs?)\b/gi, "")             // strip "60 kg"
    .replace(/\bdb\b/gi, "dumbbell")
    .replace(/\bbb\b/gi, "barbell")
    .replace(/\bbw\b/gi, "bodyweight")
    .replace(/[^a-z0-9]/g, " ")                       // strip symbols
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Resolves any exercise name to an animated demonstration GIF with 100% reliability
 */
export function getExerciseAnimation(exerciseName: string, targetMuscleHint?: string): ExerciseAnimationInfo {
  const cleaned = cleanName(exerciseName);

  // 1. Direct O(1) match in canonical dictionary
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

  // 1b. If prefixed with "bodyweight ", test stripped version
  if (cleaned.startsWith("bodyweight ")) {
    const stripped = cleaned.replace(/^bodyweight\s+/, "");
    if (CANONICAL_EXERCISES[stripped]) {
      const item = CANONICAL_EXERCISES[stripped];
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

  // 2. Longest-match substring search.
  // Iterates from longest specific key to shortest (e.g. 'feet elevated push up' before 'push up')
  for (const key of SORTED_CANONICAL_KEYS) {
    if (cleaned.includes(key)) {
      const item = CANONICAL_EXERCISES[key];
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

  // 2b. If bodyweight prefix was present, test substring on stripped version
  if (cleaned.startsWith("bodyweight ")) {
    const stripped = cleaned.replace(/^bodyweight\s+/, "");
    for (const key of SORTED_CANONICAL_KEYS) {
      if (stripped.includes(key)) {
        const item = CANONICAL_EXERCISES[key];
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
  }

  // 3. Multi-token weighted matching (best token overlap)
  const tokens = cleaned.split(" ").filter((t) => t.length > 2);
  let bestMatch: { file: string; target: string; equipment: string } | null = null;
  let highestScore = 0;

  for (const key of SORTED_CANONICAL_KEYS) {
    const item = CANONICAL_EXERCISES[key];
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

  // 4. Targeted Muscle Hint Fallback (if hint is specific and not generic 'Muscle')
  const hintLower = String(targetMuscleHint || "").toLowerCase().trim();
  if (hintLower && hintLower !== "muscle") {
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
  }

  // 5. Default General Compound Fallback (Chest & Core)
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

