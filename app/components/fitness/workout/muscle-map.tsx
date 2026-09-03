"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Info, CheckCircle2, RotateCcw } from "lucide-react";

/**
 * High-Fidelity Anatomical Muscle Activation Map
 * Accurate regex movement classification, isolated muscle inspection, and exercise tracking.
 */

// Precise anatomical keyword rules (prevents "lateral" matching "lat", handles plurals and variations)
const MUSCLE_RULES: Record<string, RegExp[]> = {
  chest: [
    /\bbench press\b/i,
    /\bchest press\b/i,
    /\bpush-?ups?\b/i,
    /\bpecs?\b/i,
    /\bchest flye?s?\b/i,
    /\bpec flye?s?\b/i,
    /\bchest\b/i,
    /\bcable crossovers?\b/i,
    /\bincline press\b/i,
    /\bdecline press\b/i,
  ],
  shoulders: [
    /\blateral raises?\b/i,
    /\bshoulders?\b/i,
    /\boverhead press(?:es)?\b/i,
    /\bfront raises?\b/i,
    /\bdeltoids?\b/i,
    /\bmilitary press(?:es)?\b/i,
    /\barnold press(?:es)?\b/i,
    /\bface pulls?\b/i,
    /\brear delts?\b/i,
    /\bupright rows?\b/i,
  ],
  biceps: [
    /\bbiceps?\b/i,
    /\bcurls?\b/i,
    /\bchin-?ups?\b/i,
    /\bpreachers?\b/i,
  ],
  triceps: [
    /\btriceps?\b/i,
    /\bskull crushers?\b/i,
    /\bpushdowns?\b/i,
    /\btricep extensions?\b/i,
    /\bclose-grip\b/i,
    /\bkickbacks?\b/i,
    /\bdips?\b/i,
    /\bdiamond push-?ups?\b/i,
  ],
  back: [
    /\bdumbbell rows?\b/i,
    /\bbarbell rows?\b/i,
    /\bcable rows?\b/i,
    /\bseated rows?\b/i,
    /\brows?\b/i,
    /\bpull-?ups?\b/i,
    /\blat pulldowns?\b/i,
    /\blat pulls?\b/i,
    /\bdeadlifts?\b/i,
    /\bback\b/i,
    /\blats?\b/i,
    /\brhomboids?\b/i,
    /\bt-bar\b/i,
    /\bpullovers?\b/i,
    /\bshrugs?\b/i,
    /\bhyperextensions?\b/i,
  ],
  core: [
    /\bcrunches?\b/i,
    /\bplanks?\b/i,
    /\bsit-?ups?\b/i,
    /\babs?\b/i,
    /\bcore\b/i,
    /\bleg raises?\b/i,
    /\bmountain climbers?\b/i,
    /\brussian twists?\b/i,
    /\bdeadbugs?\b/i,
    /\bhollow body\b/i,
  ],
  glutes: [
    /\bhip thrusts?\b/i,
    /\bglutes?\b/i,
    /\bglute bridges?\b/i,
    /\bbridges?\b/i,
    /\blunges?\b/i,
    /\bkickbacks?\b/i,
    /\bcable pull-through\b/i,
    /\bsquats?\b/i,
  ],
  quads: [
    /\bsquats?\b/i,
    /\bleg press(?:es)?\b/i,
    /\bquads?\b/i,
    /\bleg extensions?\b/i,
    /\blunges?\b/i,
    /\bstep-?ups?\b/i,
    /\bhack squats?\b/i,
    /\bgoblet squats?\b/i,
    /\bbulgarian\b/i,
  ],
  hamstrings: [
    /\bhamstrings?\b/i,
    /\brdls?\b/i,
    /\bromanian\b/i,
    /\bdeadlifts?\b/i,
    /\bleg curls?\b/i,
    /\bgood mornings?\b/i,
    /\bstiff-leg\b/i,
  ],
  calves: [
    /\bcalfs?\b/i,
    /\bcalves?\b/i,
    /\bcalf raises?\b/i,
    /\bcalf press\b/i,
    /\bsoleus\b/i,
    /\bstanding calf\b/i,
    /\bseated calf\b/i,
  ],
  forearms: [
    /\bforearms?\b/i,
    /\bwrist curls?\b/i,
    /\bfarmers walk\b/i,
    /\breverse curls?\b/i,
    /\bgrip\b/i,
  ],
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

interface MuscleMapProps {
  exerciseNames: string[];
  showLabel?: boolean;
}

export function MuscleMap({ exerciseNames = [], showLabel = true }: MuscleMapProps) {
  const [activeView, setActiveView] = useState<"both" | "front" | "back">("both");
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Group matching exercises by muscle group
  const { muscleCounts, muscleExercises } = useMemo(() => {
    const counts: Record<string, number> = {};
    const exercisesByMuscle: Record<string, string[]> = {};

    exerciseNames.forEach(name => {
      const trimmed = name.trim();
      if (!trimmed) return;

      for (const [muscle, patterns] of Object.entries(MUSCLE_RULES)) {
        if (patterns.some(p => p.test(trimmed))) {
          counts[muscle] = (counts[muscle] || 0) + 1;
          if (!exercisesByMuscle[muscle]) {
            exercisesByMuscle[muscle] = [];
          }
          if (!exercisesByMuscle[muscle].includes(trimmed)) {
            exercisesByMuscle[muscle].push(trimmed);
          }
        }
      }
    });

    return { muscleCounts: counts, muscleExercises: exercisesByMuscle };
  }, [exerciseNames]);

  const maxCount = useMemo(() => {
    const vals = Object.values(muscleCounts);
    return vals.length ? Math.max(...vals) : 1;
  }, [muscleCounts]);

  const totalActivated = Object.keys(muscleCounts).length;
  const topMuscle = Object.entries(muscleCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

  // Helper for muscle fill, opacity, and isolated highlight
  const getMuscleStyle = (muscleKey: string) => {
    const count = muscleCounts[muscleKey] || 0;
    const isSelected = selectedMuscle === muscleKey;
    const hasActiveSelection = selectedMuscle !== null;

    // When another muscle is selected, dim non-selected muscles
    if (hasActiveSelection && !isSelected) {
      return {
        fill: count > 0 ? "#ADFF00" : "#131C13",
        fillOpacity: count > 0 ? 0.12 : 0.05,
        stroke: "rgba(255, 255, 255, 0.04)",
        strokeWidth: 0.5,
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "pointer",
      };
    }

    if (count === 0) {
      return {
        fill: isSelected ? "rgba(173, 255, 0, 0.25)" : "#131C13",
        stroke: isSelected ? "#ADFF00" : "rgba(255, 255, 255, 0.08)",
        strokeWidth: isSelected ? 1.4 : 0.6,
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        cursor: "pointer",
      };
    }

    // Activated gradient levels
    const baseOpacity = Math.min(1, 0.45 + (count / maxCount) * 0.55);
    return {
      fill: isSelected ? "#C6FF33" : "#ADFF00",
      fillOpacity: isSelected ? 1 : baseOpacity,
      stroke: isSelected ? "#FFFFFF" : "#ADFF00",
      strokeWidth: isSelected ? 1.6 : 0.9,
      filter: isSelected
        ? "drop-shadow(0 0 10px rgba(173, 255, 0, 0.95))"
        : count >= 2
        ? "drop-shadow(0 0 5px rgba(173, 255, 0, 0.65))"
        : undefined,
      transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      cursor: "pointer",
    };
  };

  const handleSelect = (muscle: string) => {
    setSelectedMuscle(prev => (prev === muscle ? null : muscle));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header bar */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00]">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Muscle Activation Map</h3>
              <p className="text-[11px] text-white/50">
                {totalActivated > 0
                  ? `${totalActivated} muscle groups targeted in routine`
                  : "Targeted plan muscle anatomy"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#0A1108] p-1 rounded-xl border border-white/5">
            {(["both", "front", "back"] as const).map(v => (
              <button
                key={v}
                onClick={() => setActiveView(v)}
                className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
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

      {/* Interactive Muscle Banner & Selected Detail */}
      <AnimatePresence mode="wait">
        {selectedMuscle ? (
          <motion.div
            key={selectedMuscle}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="p-3 bg-[#0E170C] rounded-2xl border border-[#ADFF00]/30 flex flex-col gap-2 shadow-[0_0_15px_rgba(173,255,0,0.08)]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ADFF00] animate-pulse" />
                <span className="font-black text-sm text-[#ADFF00] uppercase tracking-wide">
                  {MUSCLE_LABELS[selectedMuscle] || selectedMuscle}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#ADFF00]/15 text-[#ADFF00] font-bold border border-[#ADFF00]/30">
                  {muscleCounts[selectedMuscle] || 0} exercises
                </span>
              </div>
              <button
                onClick={() => setSelectedMuscle(null)}
                className="flex items-center gap-1 text-[10px] font-bold text-white/50 hover:text-white px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            </div>

            {/* List of matching exercises */}
            {muscleExercises[selectedMuscle]?.length ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {muscleExercises[selectedMuscle].map(ex => (
                  <span
                    key={ex}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/40 border border-white/5 text-[10px] text-white/90 font-semibold"
                  >
                    <CheckCircle2 className="w-3 h-3 text-[#ADFF00]" />
                    {ex}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-white/40 italic">
                Resting in current routine • No direct exercises assigned yet.
              </p>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="overview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-8 flex items-center justify-between px-3.5 bg-[#0A1108] rounded-xl border border-white/5 text-[11px]"
          >
            {topMuscle ? (
              <div className="flex items-center gap-2 w-full justify-between">
                <span className="text-gray-400 text-[10px] font-medium">Primary Training Focus:</span>
                <span className="font-black text-[#ADFF00] uppercase text-[10px] tracking-wider">
                  {MUSCLE_LABELS[topMuscle] || topMuscle} ({muscleCounts[topMuscle]} exercises)
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                <Info className="w-3.5 h-3.5 text-[#ADFF00]" />
                <span>Tap any muscle or pill below to isolate and see targeting exercises</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Figures Canvas */}
      <div className="relative bg-[radial-gradient(ellipse_at_center,rgba(173,255,0,0.05)_0%,transparent_75%)] py-4 px-3 rounded-2xl border border-white/5 flex items-center justify-center gap-6 sm:gap-14 overflow-hidden">
        
        {/* FRONT VIEW (ANTERIOR) */}
        {(activeView === "both" || activeView === "front") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
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

              {/* Traps (Front Clavicular Slope) */}
              <g onClick={() => handleSelect("back")}>
                <path d="M44.5 37 L33 42 C36.5 40 40.5 38 44.5 37 Z" style={getMuscleStyle("back")} />
                <path d="M55.5 37 L67 42 C63.5 40 59.5 38 55.5 37 Z" style={getMuscleStyle("back")} />
              </g>

              {/* Shoulders (Deltoids - Front & Lateral) */}
              <g onClick={() => handleSelect("shoulders")}>
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
              <g onClick={() => handleSelect("chest")}>
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
              <g onClick={() => handleSelect("biceps")}>
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
              <g onClick={() => handleSelect("forearms")}>
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
              <g onClick={() => handleSelect("core")}>
                {/* Upper Abs */}
                <path d="M48.5 62 L36 63.5 C35.5 67 36.5 70 48.5 70 Z" style={getMuscleStyle("core")} />
                <path d="M51.5 62 L64 63.5 C64.5 67 63.5 70 51.5 70 Z" style={getMuscleStyle("core")} />

                {/* Mid Abs */}
                <path d="M48.5 71.5 L36.5 71.5 C36.5 75.5 37.5 79 48.5 79 Z" style={getMuscleStyle("core")} />
                <path d="M51.5 71.5 L63.5 71.5 C63.5 75.5 62.5 79 51.5 79 Z" style={getMuscleStyle("core")} />

                {/* Lower Abs */}
                <path d="M48.5 80.5 L38 80.5 C38.5 85 43 89.5 48.5 90.5 Z" style={getMuscleStyle("core")} />
                <path d="M51.5 80.5 L62 80.5 C61.5 85 57 89.5 51.5 90.5 Z" style={getMuscleStyle("core")} />

                {/* Obliques */}
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
              <g onClick={() => handleSelect("quads")}>
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
              <g onClick={() => handleSelect("calves")}>
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
            <span className="text-[10px] font-black text-white/50 tracking-widest uppercase mt-1">Front</span>
          </motion.div>
        )}

        {/* BACK VIEW (POSTERIOR) */}
        {(activeView === "both" || activeView === "back") && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
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
              <g onClick={() => handleSelect("back")}>
                <path
                  d="M50 34 L34 42 C38 46 43 47 46 47 L47 62 L50 68 L53 62 L54 47 C57 47 62 46 66 42 Z"
                  style={getMuscleStyle("back")}
                />
              </g>

              {/* Rear Deltoids */}
              <g onClick={() => handleSelect("shoulders")}>
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
              <g onClick={() => handleSelect("back")}>
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
              <g onClick={() => handleSelect("triceps")}>
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
              <g onClick={() => handleSelect("forearms")}>
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
              <g onClick={() => handleSelect("glutes")}>
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
              <g onClick={() => handleSelect("hamstrings")}>
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
              <g onClick={() => handleSelect("calves")}>
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
            <span className="text-[10px] font-black text-white/50 tracking-widest uppercase mt-1">Back</span>
          </motion.div>
        )}

      </div>

      {/* Interactive Muscle Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {Object.entries(muscleCounts).length > 0 ? (
          Object.entries(muscleCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([muscle, count]) => {
              const isSelected = selectedMuscle === muscle;
              return (
                <button
                  key={muscle}
                  onClick={() => handleSelect(muscle)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.5)] scale-105"
                      : "bg-[#111A10] border border-[#ADFF00]/30 text-white hover:border-[#ADFF00] hover:bg-[#162215]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isSelected ? "bg-black" : "bg-[#ADFF00]"}`} />
                  <span>{MUSCLE_LABELS[muscle] || muscle}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                      isSelected ? "bg-black/25 text-black" : "bg-[#ADFF00]/20 text-[#ADFF00]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })
        ) : (
          <div className="w-full flex items-center justify-between text-xs text-white/50 bg-[#0A1108] p-3.5 rounded-xl border border-white/5">
            <span>All muscles fresh • Start a workout to log active volume</span>
            <span className="text-[10px] font-black text-[#ADFF00] uppercase">100% Recovery</span>
          </div>
        )}
      </div>

    </div>
  );
}
