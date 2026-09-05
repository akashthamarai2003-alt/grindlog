"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Square, Loader2, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { discardWorkoutSessionAction } from "@/app/actions/fitness";
import { clearWorkoutTimer } from "@/hooks/fitness/useWorkoutTimer";

interface ActiveWorkoutResumeCardProps {
  workoutId: string;
  completedExercises: number;
  totalExercises: number;
}

export function ActiveWorkoutResumeCard({ 
  workoutId, 
  completedExercises, 
  totalExercises 
}: ActiveWorkoutResumeCardProps) {
  const router = useRouter();
  const [isResuming, setIsResuming] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const handleDiscard = async () => {
    if (isDiscarding) return;
    setIsDiscarding(true);
    try {
      clearWorkoutTimer(workoutId);
      const res = await discardWorkoutSessionAction({ workoutId });
      if (!res.success) throw new Error(res.error || "Failed to discard workout");
      toast.success("Workout session discarded.");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to discard workout");
      setIsDiscarding(false);
    }
  };

  const isAllDone = totalExercises > 0 && completedExercises >= totalExercises;

  // Proactively prefetch the workout and summary routes on mount so navigation is instant
  useEffect(() => {
    if (workoutId && workoutId !== "mock") {
      router.prefetch(`/workout/${workoutId}`);
      router.prefetch(`/workout/${workoutId}/summary`);
    }
  }, [workoutId, router]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-[#1A2619] border border-[#ADFF00]/30 rounded-2xl p-5 mb-6 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-[#ADFF00]" />
      
      <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
        {isAllDone ? "Workout Completed!" : "Continue workout?"}
      </h3>
      
      <p className="text-sm font-medium text-white/60 mb-6">
        {isAllDone ? (
          <>All <span className="font-bold text-[#ADFF00]">{totalExercises}</span> exercises completed!</>
        ) : (
          <>You have completed <span className="font-bold text-[#ADFF00]">{completedExercises} / {totalExercises}</span> exercises.</>
        )}
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href={isAllDone ? `/workout/${workoutId}/summary` : `/workout/${workoutId}`}
          prefetch={true}
          onClick={() => setIsResuming(true)}
          onMouseEnter={() => router.prefetch(isAllDone ? `/workout/${workoutId}/summary` : `/workout/${workoutId}`)}
          onTouchStart={() => router.prefetch(isAllDone ? `/workout/${workoutId}/summary` : `/workout/${workoutId}`)}
          className={`w-full py-4 bg-[#ADFF00] text-black active:scale-[0.98] transition-all duration-200 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] font-black ${
            isResuming ? "opacity-80 pointer-events-none" : "hover:bg-[#bfff33]"
          }`}
        >
          {isResuming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-black" />
              <span className="text-[11px] font-black uppercase tracking-widest">
                {isAllDone ? "Loading Summary..." : "Resuming..."}
              </span>
            </>
          ) : (
            <>
              {isAllDone ? <Check className="w-4 h-4 text-black" /> : <Play className="w-4 h-4 fill-black" />}
              <span className="text-[11px] font-black uppercase tracking-widest">
                {isAllDone ? "View Workout Summary" : "Continue"}
              </span>
            </>
          )}
        </Link>

        {!isAllDone && (
          <div className="flex gap-2">
            <Link
              href={`/workout/${workoutId}/summary`}
              prefetch={true}
              onClick={() => setIsEnding(true)}
              onMouseEnter={() => router.prefetch(`/workout/${workoutId}/summary`)}
              onTouchStart={() => router.prefetch(`/workout/${workoutId}/summary`)}
              className={`flex-1 py-3.5 bg-[#111A10] border border-white/10 hover:bg-white/5 active:scale-[0.98] transition-all duration-200 rounded-xl flex items-center justify-center gap-2 ${
                isEnding || isDiscarding ? "opacity-80 pointer-events-none" : ""
              }`}
            >
              {isEnding ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white/70" />
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Ending...</span>
                </>
              ) : (
                <>
                  <Square className="w-3.5 h-3.5 text-white/50" />
                  <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">End Workout</span>
                </>
              )}
            </Link>

            <button
              onClick={handleDiscard}
              disabled={isDiscarding || isEnding}
              className="px-4 py-3.5 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 text-rose-400 active:scale-[0.98] transition-all duration-200 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Discard Workout"
            >
              {isDiscarding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-400" />
              ) : (
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="text-[10px] font-black uppercase tracking-widest">Discard</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
