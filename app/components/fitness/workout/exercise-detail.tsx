"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, Bot, Check, Loader2, Pencil, X, Timer,
  BookOpen, ChevronDown, ChevronUp, Dumbbell, Target, Trophy, ArrowRight
} from "lucide-react";
import { FitnessExercise, FitnessSet } from "@/types/fitness/workout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useWorkoutTimer } from "@/hooks/fitness/useWorkoutTimer";
import { estimated1RM, format1RM } from "@/lib/fitness/calculations/one-rm";

interface ExerciseDetailProps {
  exercise: FitnessExercise & { fitness_os_sets: FitnessSet[] };
  workoutId: string;
  sessionId: string;
  startedAt?: string | null;
  isPaused?: boolean;
  onBack?: () => void;
  onSetCompleted?: (setId: string, reps: number, weightKg: number) => void;
  nextExercise?: { id: string; name: string } | null;
  onNextExercise?: (exerciseId: string) => void;
}

// Bodyweight exercise keywords — show "BW" instead of "0 kg"
const BODYWEIGHT_KEYWORDS = [
  "push-up", "pushup", "pull-up", "pullup", "chin-up", "chinup",
  "dip", "plank", "crunch", "sit-up", "situp", "burpee", "squat jump",
  "lunge", "mountain climber", "leg raise", "glute bridge", "hip thrust",
  "bodyweight", "body weight"
];

function isBodyweightExercise(name: string): boolean {
  const lower = name.toLowerCase();
  return BODYWEIGHT_KEYWORDS.some(kw => lower.includes(kw));
}

// Generate structured instructions from exercise name & notes
function generateInstructions(exercise: FitnessExercise): string[] {
  const notes = exercise.notes;
  if (notes && notes.length > 60) {
    // Split existing notes into steps if they contain numbered points or sentences
    const steps = notes
      .split(/\d+\.\s+|;\s*|(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 15);
    if (steps.length >= 2) return steps.slice(0, 6);
  }

  // Generic form cues based on target muscle
  const target = (exercise as any).target_muscles?.[0]?.toLowerCase() || "";
  const name = exercise.name.toLowerCase();

  if (name.includes("press") || name.includes("push")) {
    return [
      "Set up with a strong, stable base — feet flat on floor or proper position.",
      "Grip the bar/handles slightly wider than shoulder-width.",
      "Lower the weight with control — 2–3 seconds eccentric.",
      "Press explosively through the sticking point.",
      "Lock out at the top and squeeze the target muscle.",
      "Breathe in on the way down, exhale on the way up."
    ];
  }
  if (name.includes("row") || name.includes("pull")) {
    return [
      "Maintain a neutral spine — avoid rounding your lower back.",
      "Initiate the movement by retracting your shoulder blades first.",
      "Pull the weight toward your lower chest or hip.",
      "Hold the contracted position for 1 second.",
      "Lower with control — don't let the weight swing.",
      "Keep your core braced throughout the entire movement."
    ];
  }
  if (name.includes("curl")) {
    return [
      "Stand or sit with upper arms pinned to your sides.",
      "Supinate your wrists as you lift (if using dumbbells).",
      "Curl the weight until your biceps are fully contracted.",
      "Squeeze hard at the top for 1 second.",
      "Lower slowly — 3 seconds on the way down.",
      "Don't swing your hips or use momentum."
    ];
  }
  if (name.includes("squat") || name.includes("leg press") || name.includes("lunge")) {
    return [
      "Position feet shoulder-width apart, toes slightly out.",
      "Brace your core and keep your chest up.",
      "Descend until thighs are parallel to the floor (or lower).",
      "Drive through your heels to stand back up.",
      "Keep your knees tracking over your toes at all times.",
      "Exhale on the way up, inhale on the way down."
    ];
  }
  if (name.includes("deadlift") || name.includes("hinge") || name.includes("rdl")) {
    return [
      "Stand with feet hip-width apart, bar over mid-foot.",
      "Hinge at the hips and grip the bar just outside your legs.",
      "Keep your back flat and chest proud — no rounding.",
      "Drive your feet into the floor to initiate the lift.",
      "Lock out your hips and squeeze your glutes at the top.",
      "Lower the bar under control — push your hips back."
    ];
  }

  // Generic fallback
  return [
    "Set up in the correct starting position with proper alignment.",
    `Focus on the target muscle — ${target || "the primary muscle"}.`,
    "Control the eccentric (lowering) phase — 2–3 seconds.",
    "Explode through the concentric (lifting) phase.",
    "Breathe steadily — exhale on exertion.",
    "Prioritize form over weight — stop if form breaks down."
  ];
}

export function ExerciseDetail({ exercise, workoutId, sessionId, startedAt, isPaused, onBack, onSetCompleted, nextExercise, onNextExercise }: ExerciseDetailProps) {
  const router = useRouter();
  const { formattedTime } = useWorkoutTimer(workoutId, startedAt, isPaused);
  
  const sortedSets = [...exercise.fitness_os_sets].sort((a, b) => a.set_number - b.set_number);
  const isBW = isBodyweightExercise(exercise.name);
  const instructions = generateInstructions(exercise);
  
  const [activeRestSeconds, setActiveRestSeconds] = useState<number | null>(null);
  const [isNavigatingBack, setIsNavigatingBack] = useState(false);
  const [isEditingRest, setIsEditingRest] = useState(false);
  const [isUpdatingRest, setIsUpdatingRest] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const handleUpdateRest = async (newRest: number) => {
    setIsUpdatingRest(true);
    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/exercises/${exercise.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rest_seconds: newRest })
      });
      if (!res.ok) throw new Error("Failed");
      toast.success("Rest time updated");
      setIsEditingRest(false);
      router.refresh();
    } catch {
      toast.error("Could not update rest time");
    } finally {
      setIsUpdatingRest(false);
    }
  };

  const [setInputs, setSetInputs] = useState<Record<string, { weight: string; reps: string }>>(
    sortedSets.reduce((acc, set) => ({
      ...acc,
      [set.id]: {
        weight: set.weight_kg?.toString() || (isBW ? "0" : ""),
        reps: set.actual_reps?.toString() || set.target_reps?.toString() || ""
      }
    }), {})
  );

  useEffect(() => {
    if (activeRestSeconds === null || activeRestSeconds <= 0) return;
    const interval = setInterval(() => {
      setActiveRestSeconds(prev => (prev && prev > 0 ? prev - 1 : null));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeRestSeconds]);

  const handleCompleteSet = async (setRecord: FitnessSet) => {
    if (setRecord.completed) return;
    const input = setInputs[setRecord.id];
    
    if (!input.reps || input.reps.trim() === "") {
      toast.error("Please enter the number of reps.");
      return;
    }

    const weightRaw = isBW ? "0" : input.weight;
    if (!isBW && (!weightRaw || weightRaw.trim() === "")) {
      toast.error("Please enter the weight (use 0 for bodyweight).");
      return;
    }

    const reps = parseInt(input.reps, 10);
    const weight = parseFloat(weightRaw || "0");

    // Instant optimistic update (0ms delay)
    setRecord.completed = true;
    setActiveRestSeconds(exercise.rest_seconds);
    if (onSetCompleted) {
      onSetCompleted(setRecord.id, reps, weight);
    }

    if (workoutId === "mock") return;

    // Background sync to database
    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId: setRecord.id, reps, weightKg: weight })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete set");
    } catch (e: any) {
      // Revert if network error
      setRecord.completed = false;
      toast.error(e.message || "Failed to sync set. Please try again.");
    }
  };

  const handleInputChange = (setId: string, field: "weight" | "reps", value: string) => {
    setSetInputs(prev => ({ ...prev, [setId]: { ...prev[setId], [field]: value } }));
  };

  const skipRest = () => setActiveRestSeconds(null);

  return (
    <div className="w-full h-full flex flex-col pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (onBack) {
                onBack();
              } else {
                setIsNavigatingBack(true);
                router.push(`/workout/${workoutId}`);
              }
            }}
            disabled={isNavigatingBack}
            className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {isNavigatingBack
              ? <Loader2 className="w-5 h-5 text-white/70 animate-spin" />
              : <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white" />
            }
          </button>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">BACK</h1>
        </div>
        {startedAt && (
          <div className="flex items-center gap-1.5 bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-3 py-1 rounded-md">
            <Timer className={`w-3.5 h-3.5 ${isPaused ? "text-white/50" : "text-[#ADFF00]"}`} />
            <span className={`text-xs font-black tracking-widest ${isPaused ? "text-white/50" : "text-[#ADFF00]"}`}>
              {formattedTime}
            </span>
          </div>
        )}
      </div>

      <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-2">
        {exercise.name}
      </h2>

      {/* Target muscle & equipment chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(exercise as any).target_muscles?.[0] && (
          <span className="flex items-center gap-1 text-[10px] font-black tracking-[0.2em] text-[#ADFF00] uppercase bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-2.5 py-1 rounded-full">
            <Target className="w-3 h-3" /> {(exercise as any).target_muscles[0]}
          </span>
        )}
        {isBW && (
          <span className="flex items-center gap-1 text-[10px] font-black tracking-[0.2em] text-white/60 uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
            <Dumbbell className="w-3 h-3" /> Bodyweight
          </span>
        )}
      </div>

      {/* Exercise meta bar */}
      <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-6">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Target</span>
          <span className="text-sm font-semibold text-white/90">{exercise.target_sets} Sets x {String(exercise.target_reps || "").replace(/^\d+\s*[xX×]\s*/, '')} Reps</span>
        </div>
        <div className="flex flex-col text-right relative">
          <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5 flex items-center justify-end gap-1.5">
            Rest
            {!isEditingRest && (
              <button onClick={() => setIsEditingRest(true)} className="hover:text-white transition-colors">
                <Pencil className="w-3 h-3" />
              </button>
            )}
          </span>
          {isEditingRest ? (
            <div className="flex items-center gap-2 mt-1">
              <select
                className="bg-[#111A10] border border-white/10 rounded-lg text-sm text-white px-2 py-1 outline-none focus:border-[#ADFF00]"
                disabled={isUpdatingRest}
                value={exercise.rest_seconds || 90}
                onChange={(e) => handleUpdateRest(Number(e.target.value))}
              >
                {[30, 45, 60, 90, 120, 150, 180].map(s => (
                  <option key={s} value={s}>{s} sec</option>
                ))}
              </select>
              <button onClick={() => setIsEditingRest(false)} className="p-1 hover:bg-white/10 rounded-md">
                <X className="w-4 h-4 text-white/50" />
              </button>
              {isUpdatingRest && <Loader2 className="w-3 h-3 animate-spin text-[#ADFF00]" />}
            </div>
          ) : (
            <span className="text-sm font-semibold text-white/90">{exercise.rest_seconds} sec</span>
          )}
        </div>
      </div>

      {/* Sets */}
      <div className="flex flex-col gap-6">
        {sortedSets.map((setRecord, idx) => {
          const isCompleted = setRecord.completed;
          const allSetsCompleted = sortedSets.every(s => s.completed);

          // Compute estimated 1RM for this set
          const inputW = parseFloat(setInputs[setRecord.id]?.weight || "0");
          const inputR = parseInt(setInputs[setRecord.id]?.reps || "0", 10);
          const e1rm = (!isBW && inputW > 0 && inputR > 0) ? estimated1RM(inputW, inputR) : null;

          return (
            <motion.div
              key={setRecord.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col relative"
            >
              <div className="w-full h-px bg-white/10 mb-6" />
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
                  Set {setRecord.set_number}
                </h3>
                {/* Estimated 1RM badge */}
                {e1rm !== null && !isCompleted && (
                  <span className="flex items-center gap-1 text-[9px] font-black text-amber-400/80 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                    <Trophy className="w-2.5 h-2.5" />
                    Est. 1RM: {e1rm} kg
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Weight input */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Weight</span>
                  {isBW ? (
                    <div className="w-full bg-[#111A10] border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white/50 text-center">
                      Bodyweight
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={setInputs[setRecord.id]?.weight}
                        onChange={(e) => handleInputChange(setRecord.id, "weight", e.target.value)}
                        disabled={isCompleted}
                        className="w-full bg-[#111A10] border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-white text-center focus:outline-none focus:border-[#ADFF00] disabled:opacity-50"
                        placeholder="-"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">kg</span>
                    </div>
                  )}
                </div>

                {/* Reps input */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Reps</span>
                  <input
                    type="number"
                    value={setInputs[setRecord.id]?.reps}
                    onChange={(e) => handleInputChange(setRecord.id, "reps", e.target.value)}
                    disabled={isCompleted}
                    className="w-full bg-[#111A10] border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-white text-center focus:outline-none focus:border-[#ADFF00] disabled:opacity-50"
                    placeholder="-"
                  />
                </div>
              </div>

              {isCompleted ? (
                <div className="w-full bg-white/5 border border-white/10 text-white/50 font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2">
                  <Check className="w-4 h-4 text-[#ADFF00]" />
                  Completed
                </div>
              ) : (
                <button
                  onClick={() => { if (activeRestSeconds !== null) setActiveRestSeconds(null); handleCompleteSet(setRecord); }}
                  className="w-full bg-[#ADFF00] text-black font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] transition-transform active:scale-[0.98] cursor-pointer hover:bg-[#b8ff1a]"
                >
                  <Check className="w-4 h-4" />
                  Complete Set
                </button>
              )}

              {/* Rest Timer */}
              {isCompleted && activeRestSeconds !== null && idx === sortedSets.filter(s => s.completed).length - 1 && idx < sortedSets.length - 1 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="w-full bg-[#1A2619] border border-[#ADFF00]/30 rounded-xl p-4 mt-4 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#ADFF00] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Check className="w-3 h-3" /> Set Completed
                    </span>
                    <span className="text-xl font-black text-white">
                      Rest {Math.floor(activeRestSeconds / 60).toString().padStart(2, "0")}:{(activeRestSeconds % 60).toString().padStart(2, "0")}
                    </span>
                  </div>
                  <button
                    onClick={skipRest}
                    className="bg-black/50 border border-white/10 px-4 py-2 rounded-lg text-xs font-bold text-white uppercase tracking-wider hover:bg-white/10 transition-colors"
                  >
                    Skip Rest
                  </button>
                </motion.div>
              )}

              {/* All sets done — next exercise or back to overview */}
              {allSetsCompleted && idx === sortedSets.length - 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full mt-6 flex flex-col gap-3">
                  {activeRestSeconds !== null && activeRestSeconds > 0 && (
                    <div className="w-full flex justify-center mb-1">
                      <div className="bg-[#111A10] border border-white/10 rounded-full px-4 py-1.5 flex items-center gap-2">
                        <span className="text-xs font-bold text-white/50 uppercase tracking-widest">Rest:</span>
                        <span className="text-sm font-black text-[#ADFF00]">
                          {Math.floor(activeRestSeconds / 60).toString().padStart(2, "0")}:{(activeRestSeconds % 60).toString().padStart(2, "0")}
                        </span>
                      </div>
                    </div>
                  )}

                  {nextExercise && (
                    <button
                      onClick={() => {
                        if (onNextExercise) {
                          onNextExercise(nextExercise.id);
                        } else if (onBack) {
                          onBack();
                        } else {
                          router.push(`/workout/${workoutId}`);
                        }
                      }}
                      className="w-full bg-[#ADFF00] text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.3)] active:scale-[0.98] transition-all cursor-pointer"
                    >
                      <span className="truncate">Next: {nextExercise.name}</span>
                      <ArrowRight className="w-5 h-5 shrink-0" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (onBack) {
                        onBack();
                      } else {
                        setIsNavigatingBack(true);
                        router.push(`/workout/${workoutId}`);
                      }
                    }}
                    disabled={isNavigatingBack}
                    className={`w-full font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer ${
                      nextExercise
                        ? "bg-[#111A10] border border-white/10 text-white hover:bg-white/5"
                        : "bg-[#ADFF00] text-black shadow-[0_0_20px_rgba(173,255,0,0.2)]"
                    }`}
                  >
                    <Check className="w-4 h-4 text-[#ADFF00]" />
                    <span>Workout Overview</span>
                  </button>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-white/10 my-8" />

      {/* Exercise Instructions (collapsible) */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => setShowInstructions(prev => !prev)}
          className="flex items-center justify-between w-full bg-[#111A10] border border-white/10 rounded-2xl px-5 py-4 hover:bg-white/5 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#ADFF00]" />
            <span className="text-sm font-black text-white uppercase tracking-widest">How to do it</span>
          </div>
          {showInstructions
            ? <ChevronUp className="w-4 h-4 text-white/50" />
            : <ChevronDown className="w-4 h-4 text-white/50" />
          }
        </button>

        {showInstructions && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111A10] border border-white/5 rounded-2xl p-5 flex flex-col gap-3"
          >
            {instructions.map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#ADFF00]/15 border border-[#ADFF00]/30 flex items-center justify-center text-[10px] font-black text-[#ADFF00] shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm font-medium text-white/80 leading-relaxed">{step}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* AI Tip */}
        <div className="bg-[#111A10] border border-[#ADFF00]/10 rounded-2xl p-5 shadow-[0_0_15px_rgba(173,255,0,0.02)]">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-[#ADFF00]" />
            <h3 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">AI Tip</h3>
          </div>
          <p className="text-sm font-medium text-white/80 leading-relaxed italic border-l-2 border-[#ADFF00]/50 pl-3">
            &ldquo;{exercise.notes || "Focus on perfect form and controlled movements to maximize muscle engagement and prevent injury."}&rdquo;
          </p>
        </div>
      </div>
    </div>
  );
}
