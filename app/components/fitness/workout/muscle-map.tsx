"use client";

import { useMemo } from "react";

/**
 * Muscle Map Component — Original SVG Design
 * Completely original artwork. NOT derived from openGym's body-paths.js (AGPL).
 * Uses simplified human figure silhouette built from basic SVG shapes.
 */

// Muscle group to exercise name keyword mapping
const MUSCLE_KEYWORDS: Record<string, string[]> = {
  chest: ["bench press", "chest press", "push-up", "pushup", "fly", "pec", "chest"],
  shoulders: ["shoulder press", "overhead press", "lateral raise", "front raise", "deltoid", "shoulder"],
  biceps: ["curl", "bicep", "chin-up", "hammer"],
  triceps: ["tricep", "skull crusher", "extension", "pushdown", "dip", "close-grip"],
  back: ["row", "pull-up", "pullup", "lat pulldown", "deadlift", "back", "lat", "rhomboid"],
  core: ["crunch", "plank", "sit-up", "situp", "ab ", "core", "leg raise", "mountain climber"],
  glutes: ["hip thrust", "glute", "squat", "lunge", "leg press"],
  quads: ["squat", "leg press", "quad", "leg extension", "lunge", "step-up"],
  hamstrings: ["hamstring", "rdl", "romanian", "leg curl", "deadlift"],
  calves: ["calf raise", "calf", "standing calf", "seated calf"],
  forearms: ["forearm", "wrist curl", "grip"],
};

function getMuscleActivation(exerciseName: string): Set<string> {
  const lower = exerciseName.toLowerCase();
  const activated = new Set<string>();
  for (const [muscle, keywords] of Object.entries(MUSCLE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) activated.add(muscle);
  }
  return activated;
}

function intensityClass(count: number): string {
  if (count === 0) return "fill-white/5";
  if (count === 1) return "fill-[#ADFF00]/30";
  if (count === 2) return "fill-[#ADFF00]/55";
  if (count === 3) return "fill-[#ADFF00]/75";
  return "fill-[#ADFF00]";
}

interface MuscleMapProps {
  exerciseNames: string[];
  showLabel?: boolean;
}

export function MuscleMap({ exerciseNames, showLabel = true }: MuscleMapProps) {
  const muscleCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const name of exerciseNames) {
      const muscles = getMuscleActivation(name);
      muscles.forEach(m => { counts[m] = (counts[m] || 0) + 1; });
    }
    return counts;
  }, [exerciseNames]);

  const ic = (muscle: string) => intensityClass(muscleCount[muscle] || 0);

  const totalMuscleGroups = Object.keys(muscleCount).length;
  const topMuscle = Object.entries(muscleCount).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="flex flex-col gap-3">
      {showLabel && (
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Muscles Worked</span>
          {topMuscle && (
            <span className="text-[10px] font-bold text-[#ADFF00] capitalize bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-2 py-0.5 rounded-full">
              Focus: {topMuscle}
            </span>
          )}
        </div>
      )}

      <div className="flex gap-4 justify-center">
        {/* FRONT VIEW */}
        <svg viewBox="0 0 80 160" className="w-24 h-48" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <ellipse cx="40" cy="14" rx="10" ry="12" className="fill-white/8" />

          {/* Neck */}
          <rect x="36" y="24" width="8" height="6" className="fill-white/8" />

          {/* Shoulders */}
          <ellipse cx="20" cy="34" rx="10" ry="6" className={ic("shoulders")} />
          <ellipse cx="60" cy="34" rx="10" ry="6" className={ic("shoulders")} />

          {/* Chest */}
          <ellipse cx="30" cy="44" rx="9" ry="8" className={ic("chest")} />
          <ellipse cx="50" cy="44" rx="9" ry="8" className={ic("chest")} />

          {/* Torso outline */}
          <path d="M24 30 L56 30 L60 55 L56 75 L24 75 L20 55 Z" className="fill-white/5" />

          {/* Core / Abs */}
          <rect x="30" y="56" width="9" height="6" rx="2" className={ic("core")} />
          <rect x="41" y="56" width="9" height="6" rx="2" className={ic("core")} />
          <rect x="30" y="64" width="9" height="6" rx="2" className={ic("core")} />
          <rect x="41" y="64" width="9" height="6" rx="2" className={ic("core")} />

          {/* Biceps */}
          <ellipse cx="16" cy="50" rx="5" ry="10" className={ic("biceps")} />
          <ellipse cx="64" cy="50" rx="5" ry="10" className={ic("biceps")} />

          {/* Forearms */}
          <rect x="12" y="62" width="9" height="14" rx="4" className={ic("forearms")} />
          <rect x="59" y="62" width="9" height="14" rx="4" className={ic("forearms")} />

          {/* Hip / Glutes (visible front) */}
          <path d="M26 75 Q26 88 32 90 L40 92 L48 90 Q54 88 54 75 Z" className={ic("glutes")} />

          {/* Quads */}
          <ellipse cx="32" cy="108" rx="9" ry="20" className={ic("quads")} />
          <ellipse cx="48" cy="108" rx="9" ry="20" className={ic("quads")} />

          {/* Calves */}
          <ellipse cx="32" cy="140" rx="6" ry="12" className={ic("calves")} />
          <ellipse cx="48" cy="140" rx="6" ry="12" className={ic("calves")} />

          {/* Body outline strokes */}
          <path d="M24 30 L56 30 L60 55 L56 75 L24 75 L20 55 Z"
            fill="none" stroke="white" strokeOpacity="0.06" strokeWidth="0.5" />

          {/* Label */}
          <text x="40" y="158" textAnchor="middle" fontSize="5" fill="white" fillOpacity="0.25" fontWeight="bold">FRONT</text>
        </svg>

        {/* BACK VIEW */}
        <svg viewBox="0 0 80 160" className="w-24 h-48" xmlns="http://www.w3.org/2000/svg">
          {/* Head */}
          <ellipse cx="40" cy="14" rx="10" ry="12" className="fill-white/8" />

          {/* Neck */}
          <rect x="36" y="24" width="8" height="6" className="fill-white/8" />

          {/* Traps / Upper Back */}
          <path d="M30 30 Q40 26 50 30 L56 36 Q40 38 24 36 Z" className={ic("back")} />

          {/* Shoulders (rear) */}
          <ellipse cx="20" cy="36" rx="9" ry="6" className={ic("shoulders")} />
          <ellipse cx="60" cy="36" rx="9" ry="6" className={ic("shoulders")} />

          {/* Lats / Back */}
          <path d="M22 36 L26 75 L40 78 L54 75 L58 36 Q40 46 22 36 Z" className={ic("back")} />

          {/* Triceps */}
          <ellipse cx="16" cy="50" rx="5" ry="10" className={ic("triceps")} />
          <ellipse cx="64" cy="50" rx="5" ry="10" className={ic("triceps")} />

          {/* Forearms */}
          <rect x="12" y="62" width="9" height="14" rx="4" className={ic("forearms")} />
          <rect x="59" y="62" width="9" height="14" rx="4" className={ic("forearms")} />

          {/* Glutes */}
          <ellipse cx="33" cy="84" rx="11" ry="9" className={ic("glutes")} />
          <ellipse cx="47" cy="84" rx="11" ry="9" className={ic("glutes")} />

          {/* Hamstrings */}
          <ellipse cx="32" cy="108" rx="9" ry="20" className={ic("hamstrings")} />
          <ellipse cx="48" cy="108" rx="9" ry="20" className={ic("hamstrings")} />

          {/* Calves */}
          <ellipse cx="32" cy="140" rx="6" ry="12" className={ic("calves")} />
          <ellipse cx="48" cy="140" rx="6" ry="12" className={ic("calves")} />

          {/* Label */}
          <text x="40" y="158" textAnchor="middle" fontSize="5" fill="white" fillOpacity="0.25" fontWeight="bold">BACK</text>
        </svg>
      </div>

      {/* Muscle legend */}
      {totalMuscleGroups > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(muscleCount)
            .sort((a, b) => b[1] - a[1])
            .map(([muscle, count]) => (
              <span
                key={muscle}
                className="text-[9px] font-bold capitalize text-black bg-[#ADFF00] px-1.5 py-0.5 rounded-full"
                style={{ opacity: Math.min(0.5 + count * 0.15, 1) }}
              >
                {muscle}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
