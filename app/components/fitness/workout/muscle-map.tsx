"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Info } from "lucide-react";

/**
 * High-Fidelity Anatomical Muscle Activation Map
 * Realistic athletic anatomical vector paths with dynamic neon heat-mapping.
 */

// Muscle group keyword mappings for exercise recognition
const MUSCLE_KEYWORDS: Record<string, string[]> = {
  chest: ["bench press", "chest press", "push-up", "pushup", "fly", "pec", "chest", "dip", "cable crossover"],
  shoulders: ["shoulder press", "overhead press", "lateral raise", "front raise", "deltoid", "shoulder", "military press", "arnold press", "upright row", "face pull"],
  biceps: ["curl", "bicep", "chin-up", "chinup", "hammer curl", "preacher"],
  triceps: ["tricep", "skull crusher", "pushdown", "extension", "close-grip", "kickback", "diamond pushup"],
  back: ["row", "pull-up", "pullup", "lat pulldown", "deadlift", "back", "lat", "rhomboid", "t-bar", "pullover", "shrug"],
  core: ["crunch", "plank", "sit-up", "situp", "ab ", "core", "leg raise", "mountain climber", "russian twist", "hanging leg", "deadbug"],
  glutes: ["hip thrust", "glute", "squat", "lunge", "leg press", "step-up", "kickback", "cable pull-through"],
  quads: ["squat", "leg press", "quad", "leg extension", "lunge", "step-up", "hack squat", "goblet squat", "sissy squat", "bulgarian"],
  hamstrings: ["hamstring", "rdl", "romanian", "leg curl", "deadlift", "good morning", "stiff-leg"],
  calves: ["calf raise", "calf", "standing calf", "seated calf", "donkey calf"],
  forearms: ["forearm", "wrist curl", "grip", "farmers walk", "reverse curl"],
};

const MUSCLE_LABELS: Record<string, string> = {
  chest: "Chest (Pectorals)",
  shoulders: "Shoulders (Deltoids)",
  biceps: "Biceps",
  triceps: "Triceps",
  back: "Back & Lats",
  core: "Abs & Core",
  glutes: "Glutes",
  quads: "Quads (Quadriceps)",
  hamstrings: "Hamstrings",
  calves: "Calves (Gastrocnemius)",
  forearms: "Forearms",
};

function getMuscleActivation(exerciseName: string): Set<string> {
  const lower = (exerciseName || "").toLowerCase();
  const activated = new Set<string>();
  for (const [muscle, keywords] of Object.entries(MUSCLE_KEYWORDS)) {
    if (keywords.some(kw => lower.includes(kw))) activated.add(muscle);
  }
  return activated;
}

interface MuscleMapProps {
  exerciseNames: string[];
  showLabel?: boolean;
}

export function MuscleMap({ exerciseNames = [], showLabel = true }: MuscleMapProps) {
  const [activeView, setActiveView] = useState<"both" | "front" | "back">("both");
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  const muscleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const name of exerciseNames) {
      const muscles = getMuscleActivation(name);
      muscles.forEach(m => {
        counts[m] = (counts[m] || 0) + 1;
      });
    }
    return counts;
  }, [exerciseNames]);

  const maxCount = useMemo(() => {
    const vals = Object.values(muscleCounts);
    return vals.length ? Math.max(...vals) : 1;
  }, [muscleCounts]);

  const totalActivated = Object.keys(muscleCounts).length;
  const topMuscle = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Helper for muscle fill and glow style
  const getMuscleStyle = (muscleKey: string) => {
    const count = muscleCounts[muscleKey] || 0;
    const isHovered = hoveredMuscle === muscleKey;

    if (count === 0) {
      return {
        fill: isHovered ? "rgba(173, 255, 0, 0.2)" : "#131C13",
        stroke: isHovered ? "#ADFF00" : "rgba(255, 255, 255, 0.09)",
        strokeWidth: isHovered ? 1.2 : 0.7,
        transition: "all 0.25s ease",
        cursor: "pointer",
      };
    }

    // Activated gradient levels
    const intensity = Math.min(1, 0.35 + (count / maxCount) * 0.65);
    return {
      fill: isHovered ? "#BFFF1A" : "#ADFF00",
      fillOpacity: isHovered ? 1 : intensity,
      stroke: "#ADFF00",
      strokeWidth: isHovered ? 1.5 : 0.9,
      filter: count >= 2 || isHovered ? "drop-shadow(0 0 5px rgba(173, 255, 0, 0.75))" : undefined,
      transition: "all 0.25s ease",
      cursor: "pointer",
    };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00]">
              <Zap className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-white">Muscles Worked</h3>
              <p className="text-[10px] text-gray-400">
                {totalActivated > 0
                  ? `${totalActivated} muscle groups targeted`
                  : "Targeted plan muscle anatomy"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#0A1108] p-1 rounded-xl border border-white/5">
            {(["both", "front", "back"] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                  activeView === v
                    ? "bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Tooltip Banner */}
      <div className="h-6 flex items-center justify-between px-3 bg-[#0A1108] rounded-xl border border-white/5 text-[11px]">
        {hoveredMuscle ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="font-bold text-[#ADFF00]">{MUSCLE_LABELS[hoveredMuscle] || hoveredMuscle}</span>
            <span className="text-gray-400 text-[10px] font-medium">
              {muscleCounts[hoveredMuscle]
                ? `${muscleCounts[hoveredMuscle]} exercise(s) targeting this area`
                : "Resting in this routine"}
            </span>
          </div>
        ) : topMuscle ? (
          <div className="flex items-center gap-2 w-full justify-between">
            <span className="text-gray-400 text-[10px]">Primary Focus:</span>
            <span className="font-black text-[#ADFF00] uppercase text-[10px] tracking-wider">
              {MUSCLE_LABELS[topMuscle] || topMuscle} ({muscleCounts[topMuscle]} exercises)
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-500 text-[10px]">
            <Info className="w-3 h-3" />
            <span>Hover or tap any muscle group to inspect load</span>
          </div>
        )}
      </div>

      {/* Main Figures Canvas */}
      <div className="relative bg-[radial-gradient(ellipse_at_center,rgba(173,255,0,0.04)_0%,transparent_70%)] py-3 px-2 rounded-2xl border border-white/5 flex items-center justify-center gap-6 sm:gap-12 overflow-hidden">
        
        {/* SVG Defs for Gradients & Glow */}
        <svg className="absolute w-0 h-0" aria-hidden="true">
          <defs>
            <linearGradient id="neonGreenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D4FF4D" />
              <stop offset="100%" stopColor="#8AE600" />
            </linearGradient>
            <filter id="muscleGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#ADFF00" floodOpacity="0.8" />
            </filter>
          </defs>
        </svg>

        {/* FRONT VIEW (ANTERIOR) */}
        {(activeView === "both" || activeView === "front") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <svg
              viewBox="0 0 100 220"
              className="w-28 sm:w-36 h-60 sm:h-72 select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head Silhouette */}
              <path
                d="M50 6 C56 6 60.5 10.5 60.5 17.5 C60.5 22.5 58.5 26.5 56 29.5 L50 33 L44 29.5 C41.5 26.5 39.5 22.5 39.5 17.5 C39.5 10.5 44 6 50 6 Z"
                fill="#162215"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.7"
              />

              {/* Neck & SCM */}
              <path
                d="M46 32 L44.5 38 L42 40 L50 42 L58 40 L55.5 38 L54 32 Z"
                fill="#131C13"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.7"
              />

              {/* Traps (Front) */}
              <g
                onMouseEnter={() => setHoveredMuscle("back")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("back")}
              >
                <path d="M44.5 37 L33 42 C36.5 40 40.5 38 44.5 37 Z" style={getMuscleStyle("back")} />
                <path d="M55.5 37 L67 42 C63.5 40 59.5 38 55.5 37 Z" style={getMuscleStyle("back")} />
              </g>

              {/* Shoulders (Deltoids - Front & Lateral) */}
              <g
                onMouseEnter={() => setHoveredMuscle("shoulders")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("shoulders")}
              >
                {/* Left Deltoid */}
                <path
                  d="M33 42 C26 43 20 48 18 55 C17 59 19 64 22 66 C24 64 25.5 58 27 52 L33 44 Z"
                  style={getMuscleStyle("shoulders")}
                />
                {/* Right Deltoid */}
                <path
                  d="M67 42 C74 43 80 48 82 55 C83 59 81 64 78 66 C76 64 74.5 58 73 52 L67 44 Z"
                  style={getMuscleStyle("shoulders")}
                />
              </g>

              {/* Chest (Pectoralis Major) */}
              <g
                onMouseEnter={() => setHoveredMuscle("chest")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("chest")}
              >
                {/* Left Pec */}
                <path
                  d="M48.5 44 L34 44.5 C29.5 48 29 55 31.5 60 C35.5 63 44 63.5 48.5 60.5 Z"
                  style={getMuscleStyle("chest")}
                />
                {/* Right Pec */}
                <path
                  d="M51.5 44 L66 44.5 C70.5 48 71 55 68.5 60 C64.5 63 56 63.5 51.5 60.5 Z"
                  style={getMuscleStyle("chest")}
                />
              </g>

              {/* Biceps */}
              <g
                onMouseEnter={() => setHoveredMuscle("biceps")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("biceps")}
              >
                {/* Left Bicep */}
                <path
                  d="M22 66 C18 69 17 76 18.5 82 C20 86 23 86 24.5 84 C26 80 26 73 24.5 67 Z"
                  style={getMuscleStyle("biceps")}
                />
                {/* Right Bicep */}
                <path
                  d="M78 66 C82 69 83 76 81.5 82 C80 86 77 86 75.5 84 C74 80 74 73 75.5 67 Z"
                  style={getMuscleStyle("biceps")}
                />
              </g>

              {/* Forearms */}
              <g
                onMouseEnter={() => setHoveredMuscle("forearms")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("forearms")}
              >
                {/* Left Forearm */}
                <path
                  d="M23 85 C18 89 16.5 98 17.5 107 C18.5 111 20.5 113 22 112 C23.5 107 24.5 98 24.5 86 Z"
                  style={getMuscleStyle("forearms")}
                />
                {/* Right Forearm */}
                <path
                  d="M77 85 C82 89 83.5 98 82.5 107 C81.5 111 79.5 113 78 112 C76.5 107 75.5 98 75.5 86 Z"
                  style={getMuscleStyle("forearms")}
                />
              </g>

              {/* Hands */}
              <path d="M17.5 113 C16.5 117 18 122 19 124 C20 123 21 120 21 114 Z" fill="#131C13" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
              <path d="M82.5 113 C83.5 117 82 122 81 124 C80 123 79 120 79 114 Z" fill="#131C13" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />

              {/* Core / Abdominals (6-pack & Obliques) */}
              <g
                onMouseEnter={() => setHoveredMuscle("core")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("core")}
              >
                {/* Upper Abs */}
                <path d="M48.5 62 L36 63.5 C35.5 67 36.5 70 48.5 70 Z" style={getMuscleStyle("core")} />
                <path d="M51.5 62 L64 63.5 C64.5 67 63.5 70 51.5 70 Z" style={getMuscleStyle("core")} />

                {/* Mid Abs */}
                <path d="M48.5 71.5 L36.5 71.5 C36.5 75.5 37.5 79 48.5 79 Z" style={getMuscleStyle("core")} />
                <path d="M51.5 71.5 L63.5 71.5 C63.5 75.5 62.5 79 51.5 79 Z" style={getMuscleStyle("core")} />

                {/* Lower Abs */}
                <path d="M48.5 80.5 L38 80.5 C38.5 85 43 89.5 48.5 90.5 Z" style={getMuscleStyle("core")} />
                <path d="M51.5 80.5 L62 80.5 C61.5 85 57 89.5 51.5 90.5 Z" style={getMuscleStyle("core")} />

                {/* Left & Right Obliques */}
                <path d="M34 64 C30 72 31.5 81 36.5 88 L37.5 84 C34 78 33.5 71 35 65 Z" style={getMuscleStyle("core")} />
                <path d="M66 64 C70 72 68.5 81 63.5 88 L62.5 84 C66 78 66.5 71 65 65 Z" style={getMuscleStyle("core")} />
              </g>

              {/* Pelvis / Groin */}
              <path
                d="M37 89 L48.5 91.5 L50 92 L51.5 91.5 L63 89 C64 92 63 97 59 101 L50 102 L41 101 C37 97 36 92 37 89 Z"
                fill="#131C13"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="0.6"
              />

              {/* Quadriceps (Front Thighs) */}
              <g
                onMouseEnter={() => setHoveredMuscle("quads")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("quads")}
              >
                {/* Left Quad */}
                <path
                  d="M36.5 93 C29.5 100 28 112 29.5 127 C30.5 136 34 139.5 37 140 C41 139 42 129 43 120 C44 110 43 99 43 94 Z"
                  style={getMuscleStyle("quads")}
                />
                {/* Right Quad */}
                <path
                  d="M63.5 93 C70.5 100 72 112 70.5 127 C69.5 136 66 139.5 63 140 C59 139 58 129 57 120 C56 110 57 99 57 94 Z"
                  style={getMuscleStyle("quads")}
                />
              </g>

              {/* Knees */}
              <path d="M37 141 C34.5 143 34.5 148 37 150 C39.5 148 39.5 143 37 141 Z" fill="#162215" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
              <path d="M63 141 C65.5 143 65.5 148 63 150 C60.5 148 60.5 143 63 141 Z" fill="#162215" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />

              {/* Calves & Shins (Front) */}
              <g
                onMouseEnter={() => setHoveredMuscle("calves")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("calves")}
              >
                {/* Left Shin & Calf */}
                <path
                  d="M33 152 C30.5 162 29.5 174 32.5 188 C33.5 196 34.5 202 35.5 204 C37.5 202 38.5 195 39.5 186 C40.5 174 40.5 162 38.5 152 Z"
                  style={getMuscleStyle("calves")}
                />
                {/* Right Shin & Calf */}
                <path
                  d="M67 152 C69.5 162 70.5 174 67.5 188 C66.5 196 65.5 202 64.5 204 C62.5 202 61.5 195 60.5 186 C59.5 174 59.5 162 61.5 152 Z"
                  style={getMuscleStyle("calves")}
                />
              </g>

              {/* Feet */}
              <path d="M33 205 C31 210 33.5 215 36.5 215 C38.5 215 38.5 210 38 205 Z" fill="#131C13" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
              <path d="M67 205 C69 210 66.5 215 63.5 215 C61.5 215 61.5 210 62 205 Z" fill="#131C13" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
            </svg>
            <span className="text-[9px] font-black text-white/40 tracking-widest uppercase mt-1">Front</span>
          </motion.div>
        )}

        {/* BACK VIEW (POSTERIOR) */}
        {(activeView === "both" || activeView === "back") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center"
          >
            <svg
              viewBox="0 0 100 220"
              className="w-28 sm:w-36 h-60 sm:h-72 select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Head Silhouette (Back) */}
              <path
                d="M50 6 C56 6 60.5 10.5 60.5 17.5 C60.5 23.5 58 28 55 31 L50 33.5 L45 31 C42 28 39.5 23.5 39.5 17.5 C39.5 10.5 44 6 50 6 Z"
                fill="#162215"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="0.7"
              />

              {/* Neck */}
              <path d="M46 33 L54 33 L53 38 L47 38 Z" fill="#131C13" stroke="rgba(255,255,255,0.08)" strokeWidth="0.7" />

              {/* Trapezius (Diamond Back) */}
              <g
                onMouseEnter={() => setHoveredMuscle("back")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("back")}
              >
                <path
                  d="M50 34 L34 42 C38 46 43 47 46 47 L47 62 L50 68 L53 62 L54 47 C57 47 62 46 66 42 Z"
                  style={getMuscleStyle("back")}
                />
              </g>

              {/* Rear Deltoids */}
              <g
                onMouseEnter={() => setHoveredMuscle("shoulders")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("shoulders")}
              >
                {/* Left Rear Delt */}
                <path
                  d="M32 42 C25 43 20 48 18 55 C17 59 19 64 22 66 C24 63 26 57 28 51 L32 44 Z"
                  style={getMuscleStyle("shoulders")}
                />
                {/* Right Rear Delt */}
                <path
                  d="M68 42 C75 43 80 48 82 55 C83 59 81 64 78 66 C76 63 74 57 72 51 L68 44 Z"
                  style={getMuscleStyle("shoulders")}
                />
              </g>

              {/* Latissimus Dorsi (Lats) */}
              <g
                onMouseEnter={() => setHoveredMuscle("back")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("back")}
              >
                {/* Left Lat */}
                <path
                  d="M46 56 L33 46 C28 54 28.5 66 32.5 78 C36.5 84 42.5 86 46.5 86 L47 70 Z"
                  style={getMuscleStyle("back")}
                />
                {/* Right Lat */}
                <path
                  d="M54 56 L67 46 C72 54 71.5 66 67.5 78 C63.5 84 57.5 86 53.5 86 L53 70 Z"
                  style={getMuscleStyle("back")}
                />

                {/* Lower Back / Erector Spinae */}
                <path d="M47 72 L42 86 C44 89 47 91 48 92 Z" style={getMuscleStyle("back")} />
                <path d="M53 72 L58 86 C56 89 53 91 52 92 Z" style={getMuscleStyle("back")} />
              </g>

              {/* Triceps (Back) */}
              <g
                onMouseEnter={() => setHoveredMuscle("triceps")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("triceps")}
              >
                {/* Left Tricep */}
                <path
                  d="M22 66 C18 69 17.5 76 19 82 C20.5 86 23.5 85 24.5 83 C25.5 77 25.5 71 24.5 66 Z"
                  style={getMuscleStyle("triceps")}
                />
                {/* Right Tricep */}
                <path
                  d="M78 66 C82 69 82.5 76 81 82 C79.5 86 76.5 85 75.5 83 C74.5 77 74.5 71 75.5 66 Z"
                  style={getMuscleStyle("triceps")}
                />
              </g>

              {/* Forearms (Back) */}
              <g
                onMouseEnter={() => setHoveredMuscle("forearms")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("forearms")}
              >
                <path
                  d="M23 85 C18 89 16.5 98 17.5 107 C18.5 111 20.5 113 22 112 C23.5 107 24.5 98 24.5 86 Z"
                  style={getMuscleStyle("forearms")}
                />
                <path
                  d="M77 85 C82 89 83.5 98 82.5 107 C81.5 111 79.5 113 78 112 C76.5 107 75.5 98 75.5 86 Z"
                  style={getMuscleStyle("forearms")}
                />
              </g>

              {/* Hands (Back) */}
              <path d="M17.5 113 C16.5 117 18 122 19 124 C20 123 21 120 21 114 Z" fill="#131C13" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
              <path d="M82.5 113 C83.5 117 82 122 81 124 C80 123 79 120 79 114 Z" fill="#131C13" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />

              {/* Glutes (Gluteus Maximus) */}
              <g
                onMouseEnter={() => setHoveredMuscle("glutes")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("glutes")}
              >
                {/* Left Glute */}
                <path
                  d="M48.5 92 C42 92 34 94 32 101 C30 110 35 118 46.5 118 C48.5 114 49.5 103 48.5 92 Z"
                  style={getMuscleStyle("glutes")}
                />
                {/* Right Glute */}
                <path
                  d="M51.5 92 C58 92 66 94 68 101 C70 110 65 118 53.5 118 C51.5 114 50.5 103 51.5 92 Z"
                  style={getMuscleStyle("glutes")}
                />
              </g>

              {/* Hamstrings */}
              <g
                onMouseEnter={() => setHoveredMuscle("hamstrings")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("hamstrings")}
              >
                {/* Left Hamstring */}
                <path
                  d="M34 119 C30.5 127 30.5 137 33.5 143 C37.5 144 41.5 139 43.5 131 C44.5 124 44.5 119 43 119 Z"
                  style={getMuscleStyle("hamstrings")}
                />
                {/* Right Hamstring */}
                <path
                  d="M66 119 C69.5 127 69.5 137 66.5 143 C62.5 144 58.5 139 56.5 131 C55.5 124 55.5 119 57 119 Z"
                  style={getMuscleStyle("hamstrings")}
                />
              </g>

              {/* Calves (Back Gastrocnemius & Achilles) */}
              <g
                onMouseEnter={() => setHoveredMuscle("calves")}
                onMouseLeave={() => setHoveredMuscle(null)}
                onClick={() => setHoveredMuscle("calves")}
              >
                {/* Left Calf */}
                <path
                  d="M32.5 148 C28.5 158 28.5 170 31.5 182 C33.5 192 34.5 200 35.5 204 C37.5 202 38.5 192 40.5 180 C41.5 168 40.5 156 37.5 148 Z"
                  style={getMuscleStyle("calves")}
                />
                {/* Right Calf */}
                <path
                  d="M67.5 148 C71.5 158 71.5 170 68.5 182 C66.5 192 65.5 200 64.5 204 C62.5 202 61.5 192 59.5 180 C58.5 168 59.5 156 62.5 148 Z"
                  style={getMuscleStyle("calves")}
                />
              </g>

              {/* Feet & Heels (Back) */}
              <path d="M33 205 C31 210 33.5 215 36.5 215 C38.5 215 38.5 210 38 205 Z" fill="#131C13" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
              <path d="M67 205 C69 210 66.5 215 63.5 215 C61.5 215 61.5 210 62 205 Z" fill="#131C13" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
            </svg>
            <span className="text-[9px] font-black text-white/40 tracking-widest uppercase mt-1">Back</span>
          </motion.div>
        )}

      </div>

      {/* Muscle Breakdown Badges */}
      <div className="flex flex-wrap gap-2 pt-1">
        {Object.entries(muscleCounts).length > 0 ? (
          Object.entries(muscleCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([muscle, count]) => {
              const isHovered = hoveredMuscle === muscle;
              return (
                <button
                  key={muscle}
                  onMouseEnter={() => setHoveredMuscle(muscle)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onClick={() => setHoveredMuscle(hoveredMuscle === muscle ? null : muscle)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isHovered
                      ? "bg-[#ADFF00] text-black shadow-[0_0_12px_rgba(173,255,0,0.4)] scale-105"
                      : "bg-[#111A10] border border-[#ADFF00]/30 text-white hover:border-[#ADFF00]"
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#ADFF00]" />
                  <span>{MUSCLE_LABELS[muscle] || muscle}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isHovered ? "bg-black/20 text-black" : "bg-[#ADFF00]/15 text-[#ADFF00]"}`}>
                    {count}
                  </span>
                </button>
              );
            })
        ) : (
          <div className="w-full flex items-center justify-between text-xs text-white/50 bg-[#0A1108] p-3 rounded-xl border border-white/5">
            <span>Ready for training • Log a workout to activate heat signatures</span>
            <span className="text-[10px] font-bold text-[#ADFF00]">0% Fatigue</span>
          </div>
        )}
      </div>

    </div>
  );
}
