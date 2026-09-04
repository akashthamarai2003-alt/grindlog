"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Trophy, Activity, Save, Bot, ChevronRight, AlertCircle, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FitnessWorkout } from "@/types/fitness/workout";
import { MuscleMap } from "@/components/fitness/workout/muscle-map";

interface WorkoutCompleteProps {
  workout: FitnessWorkout;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  actualDuration?: number;
  actualVolume?: number;
  actualCalories?: number;
  recordsBroken?: number;
  exerciseNames?: string[];
  sessionId?: string;
  userName?: string;
}

export function WorkoutComplete({ 
  workout, 
  exerciseCount, 
  completedSets, 
  totalSets,
  actualDuration,
  actualVolume,
  actualCalories,
  recordsBroken,
  exerciseNames = [],
  sessionId,
  userName = "Athlete"
}: WorkoutCompleteProps) {
  const workoutName = workout?.name || "Upper Body";
  const duration = actualDuration !== undefined 
    ? actualDuration 
    : (workout?.duration_minutes && workout.duration_minutes <= 180 && workout.duration_minutes >= 5
        ? workout.duration_minutes
        : (completedSets > 0 ? Math.round(completedSets * 3.5) : 48));
  
  // Real math or fallback
  const volume = actualVolume !== undefined ? actualVolume.toLocaleString() : (totalSets * 10 * 25).toLocaleString();
  const calories = actualCalories !== undefined ? actualCalories : Math.min(850, Math.max(120, Math.round(duration * 6.2)));
  const records = recordsBroken !== undefined ? recordsBroken : 1;

  // Feedback State
  const [difficulty, setDifficulty] = useState<string | null>(null);
  const [feel, setFeel] = useState<string | null>(null);
  const [pain, setPain] = useState<string | null>(null);
  const [painLocation, setPainLocation] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const isFeedbackComplete = difficulty && feel && (pain === "No" || (pain === "Yes" && painLocation));

  // Dynamic AI Recommendations
  const getDynamicReview = () => {
    const exercises = (workout as any)?.fitness_os_exercises || [];
    const names = (exerciseNames && exerciseNames.length > 0)
      ? exerciseNames
      : exercises.map((e: any) => e?.name).filter(Boolean);

    const firstEx = names[0] || "main compound lifts";
    const lastEx = names[names.length - 1] || "accessories";

    const recs: string[] = [];
    
    if (pain === "Yes" && painLocation) {
      recs.push(`Monitor ${painLocation.toLowerCase()} discomfort, warm up thoroughly next session`);
    }

    if (difficulty === "Easy") {
      recs.push(`Increase working weight by 2.5-5kg on ${firstEx}`);
    } else if (difficulty === "Very Hard") {
      recs.push(`Maintain current weights, prioritize protein and sleep recovery`);
    } else {
      recs.push(`Maintain current weight on ${firstEx}, focus on perfect form`);
    }

    if (feel === "Tired") {
      recs.push("Ensure adequate carbohydrate intake post-workout for energy replenishment");
    } else if (feel === "Great" || feel === "Good") {
      recs.push(`Try pushing for 1-2 more reps on ${lastEx} next week`);
    } else {
      recs.push("Keep consistency high, you are on track");
    }

    return recs.slice(0, 3);
  };

  const handleSaveWorkout = async () => {
    setIsSaving(true);
    
    try {
      // Find the active session for this workout
      const targetSessionId = sessionId || (workout as any).fitness_os_workout_sessions?.[0]?.id;

      if (targetSessionId && (difficulty || feel || pain)) {
        await fetch(`/api/workouts/sessions/${targetSessionId}/feedback`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ difficulty, feel, pain, painLocation })
        });
      }
      
      toast.success("Workout completed and saved!");
      router.push("/workout");
      router.refresh();
    } catch (e) {
      console.error("Failed to save feedback", e);
      router.push("/workout");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto px-5 py-12 flex flex-col items-center pb-44">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.1 }}
        className="w-24 h-24 rounded-full bg-[#ADFF00]/10 flex items-center justify-center mb-6 border border-[#ADFF00]/20 shadow-[0_0_40px_rgba(173,255,0,0.15)] shrink-0"
      >
        <Flame className="w-12 h-12 text-[#ADFF00]" />
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-black text-white uppercase tracking-tight mb-2 text-center"
      >
        Workout Complete!
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm font-bold text-white/60 mb-10"
      >
        Great work, {userName}.
      </motion.p>

      {/* Stats Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full bg-[#111A10] border border-[#ADFF00]/20 rounded-[24px] p-6 shadow-[0_0_40px_rgba(173,255,0,0.05)] relative overflow-hidden mb-8 shrink-0"
      >
        <div className="absolute top-0 right-0 w-40 h-40 bg-[#ADFF00]/5 blur-[60px] rounded-full" />
        
        <div className="flex justify-between items-end mb-6 relative z-10">
          <div className="flex flex-col">
            <span className="text-xl font-black text-white uppercase tracking-wider">{workoutName}</span>
            <span className="text-[11px] font-bold text-[#ADFF00] tracking-widest uppercase mt-1">{duration} min</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xl font-black text-white">{exerciseCount} / {exerciseCount}</span>
            <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase mt-1">Exercises</span>
          </div>
        </div>

        <div className="w-full h-px bg-white/10 mb-6" />

        <div className="flex items-center justify-between mb-8">
          <span className="text-sm font-bold text-white/80 tracking-wider">{completedSets} sets completed</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Volume</span>
            <span className="text-lg font-black text-white">{volume} <span className="text-xs text-white/50">kg</span></span>
          </div>
          
          <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-amber-400/10 blur-[20px] rounded-full" />
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1 z-10">Records</span>
            <div className="flex items-center gap-1.5 z-10">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-lg font-black text-white">{records}</span>
            </div>
          </div>

          <div className="flex flex-col p-4 bg-white/5 rounded-2xl border border-white/5 col-span-2">
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Calories</span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#ADFF00]" />
              <span className="text-lg font-black text-white">~{calories} <span className="text-xs text-white/50">kcal</span></span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Muscle Map */}
      {exerciseNames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="w-full bg-[#111A10] border border-white/5 rounded-[24px] p-6 mb-8 shrink-0"
        >
          <MuscleMap exerciseNames={exerciseNames} showLabel={true} />
        </motion.div>
      )}

      {/* Post-Workout Feedback */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="w-full flex flex-col gap-6 mb-8"
      >
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase text-center">
          Post-Workout Feedback
        </h2>

        {/* Difficulty */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-white/80 tracking-wide">How difficult was today's workout?</span>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Easy", emoji: "😴" },
              { label: "Moderate", emoji: "🙂" },
              { label: "Hard", emoji: "😤" },
              { label: "Very Hard", emoji: "🔥" }
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => setDifficulty(opt.label)}
                className={`flex items-center gap-2 p-3 rounded-xl border transition-all ${difficulty === opt.label ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'bg-[#111A10] border-white/5 text-white/60 hover:bg-white/5'}`}
              >
                <span className="text-lg">{opt.emoji}</span>
                <span className="text-xs font-bold uppercase tracking-wider">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feel */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-white/80 tracking-wide">How did you feel?</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: "Great", emoji: "😊" },
              { label: "Good", emoji: "🙂" },
              { label: "Normal", emoji: "😐" },
              { label: "Tired", emoji: "😫" }
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => setFeel(opt.label)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${feel === opt.label ? 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]' : 'bg-[#111A10] border-white/5 text-white/60 hover:bg-white/5'}`}
              >
                <span className="text-2xl mb-1">{opt.emoji}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pain */}
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-white/80 tracking-wide">Any pain/discomfort?</span>
          <div className="grid grid-cols-2 gap-2">
            {["No", "Yes"].map(opt => (
              <button
                key={opt}
                onClick={() => { setPain(opt); if (opt === "No") setPainLocation(null); }}
                className={`flex items-center justify-center p-3 rounded-xl border transition-all ${pain === opt ? (opt === 'Yes' ? 'bg-red-500/10 border-red-500 text-red-500' : 'bg-[#ADFF00]/10 border-[#ADFF00] text-[#ADFF00]') : 'bg-[#111A10] border-white/5 text-white/60 hover:bg-white/5'}`}
              >
                <span className="text-xs font-bold uppercase tracking-wider">{opt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Pain Location (Conditional) */}
        <AnimatePresence>
          {pain === "Yes" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-col gap-3 overflow-hidden"
            >
              <div className="flex items-center gap-2 text-red-400 mt-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Where?</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {["Shoulder", "Elbow", "Wrist", "Back", "Knee", "Other"].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setPainLocation(opt)}
                    className={`flex items-center justify-center p-2 rounded-xl border transition-all ${painLocation === opt ? 'bg-red-500/10 border-red-500 text-red-400' : 'bg-[#111A10] border-white/5 text-white/60 hover:bg-white/5'}`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">{opt}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* AI Review (Shows when feedback is complete) */}
      <AnimatePresence>
        {isFeedbackComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full bg-[#111A10] border border-[#ADFF00]/30 rounded-2xl p-6 mb-8 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-full bg-[#ADFF00]" />
            
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-5 h-5 text-[#ADFF00]" />
              <h3 className="text-sm font-black tracking-widest text-[#ADFF00] uppercase">
                AI Workout Review
              </h3>
            </div>

            <p className="text-sm font-medium text-white/90 leading-relaxed mb-4">
              Excellent session. You completed all {exerciseCount} exercises and maintained your planned volume.
            </p>

            <div className="flex flex-col gap-3">
              <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">
                Next Session Recommendations
              </span>
              <ul className="flex flex-col gap-2">
                {getDynamicReview().map((rec, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm font-medium text-white/70">
                    <ChevronRight className="w-4 h-4 text-[#ADFF00] shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full"
      >
        <button 
          onClick={handleSaveWorkout}
          disabled={!isFeedbackComplete || isSaving}
          className="w-full bg-[#ADFF00] text-black font-black uppercase tracking-widest py-4 rounded-xl shadow-[0_0_20px_rgba(173,255,0,0.2)] flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? "Saving..." : "Save Workout"}
        </button>
      </motion.div>
      
    </div>
  );
}
