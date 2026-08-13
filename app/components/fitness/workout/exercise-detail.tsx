"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, PlayCircle, Bot, Check, Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { FitnessExercise, FitnessSet } from "@/types/fitness/workout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ExerciseOptionsModal } from "./exercise-options-modal";

interface ExerciseDetailProps {
  exercise: FitnessExercise & { fitness_os_sets: FitnessSet[] };
  workoutId: string;
  sessionId: string;
}

export function ExerciseDetail({ exercise, workoutId, sessionId }: ExerciseDetailProps) {
  const router = useRouter();
  const sortedSets = [...exercise.fitness_os_sets].sort((a, b) => a.set_number - b.set_number);
  
  const [activeRestSeconds, setActiveRestSeconds] = useState<number | null>(null);
  const [submittingSetId, setSubmittingSetId] = useState<string | null>(null);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  // Local state to track input values for sets so they are easily updatable
  const [setInputs, setSetInputs] = useState<Record<string, { weight: string, reps: string }>>(
    sortedSets.reduce((acc, set) => ({
      ...acc,
      [set.id]: {
        weight: set.weight_kg?.toString() || "",
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
    if (setRecord.completed || submittingSetId) return;
    setSubmittingSetId(setRecord.id);

    const input = setInputs[setRecord.id];
    const reps = input.reps ? parseInt(input.reps, 10) : null;
    const weight = input.weight ? parseFloat(input.weight) : null;

    // If it's the mock workout, just simulate a successful save
    if (workoutId === "mock") {
      await new Promise(resolve => setTimeout(resolve, 500));
      setActiveRestSeconds(exercise.rest_seconds);
      setRecord.completed = true;
      setSubmittingSetId(null);
      return;
    }

    try {
      const res = await fetch(`/api/workouts/sessions/${sessionId}/sets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          setId: setRecord.id,
          reps,
          weightKg: weight
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete set");

      setActiveRestSeconds(exercise.rest_seconds);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message || "Failed to complete set");
    } finally {
      setSubmittingSetId(null);
    }
  };

  const handleInputChange = (setId: string, field: 'weight' | 'reps', value: string) => {
    setSetInputs(prev => ({
      ...prev,
      [setId]: { ...prev[setId], [field]: value }
    }));
  };

  const skipRest = () => setActiveRestSeconds(null);

  const handleLoadVideo = async () => {
    if (gifUrl || isVideoLoading) return;
    setIsVideoLoading(true);
    try {
      const res = await fetch(`/api/workouts/video?query=${encodeURIComponent(exercise.name)}`);
      const data = await res.json();
      if (res.ok && data.gifUrl) {
        setGifUrl(data.gifUrl);
      } else {
        toast.error(data.error || "Could not find a video");
      }
    } catch (e: any) {
      toast.error("Failed to load video");
    } finally {
      setIsVideoLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href={`/fitness/workout/${workoutId}`} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-white/70 hover:text-white" />
          </Link>
          <h1 className="text-xl font-black text-white tracking-tight uppercase">BACK</h1>
        </div>
        
        <button 
          onClick={() => setIsOptionsOpen(true)}
          className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <MoreHorizontal className="w-6 h-6 text-white/70 hover:text-white" />
        </button>
      </div>

      <ExerciseOptionsModal 
        isOpen={isOptionsOpen}
        onClose={() => setIsOptionsOpen(false)}
        exerciseName={exercise.name}
      />

      <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">
        {exercise.name}
      </h2>

      {/* Clean GIF Player */}
      <div className="w-full h-56 bg-white rounded-2xl border border-white/5 flex items-center justify-center mb-6 shadow-xl relative overflow-hidden group">
        {gifUrl ? (
          <div className="w-full h-full absolute inset-0 z-20 flex items-center justify-center bg-white">
            <img 
              src={gifUrl} 
              alt={exercise.name}
              className="w-full h-full object-contain mix-blend-multiply scale-[1.35]"
            />
            {/* Dark overlay to blend into the app theme */}
            <div className="absolute inset-0 bg-[#0A1108]/90 mix-blend-normal pointer-events-none" style={{ mixBlendMode: 'darken' }} />
          </div>
        ) : (
          <button 
            onClick={handleLoadVideo}
            disabled={isVideoLoading}
            className="w-full h-full absolute inset-0 z-20 flex items-center justify-center flex-col focus:outline-none"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
            {isVideoLoading ? (
              <Loader2 className="w-12 h-12 text-[#ADFF00] animate-spin z-20" strokeWidth={1.5} />
            ) : (
              <PlayCircle className="w-12 h-12 text-[#ADFF00] z-20 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
            )}
            <span className="absolute bottom-4 left-4 text-xs font-black tracking-widest uppercase text-white z-20">
              {isVideoLoading ? "LOADING VIDEO..." : "WATCH EXERCISE VIDEO"}
            </span>
          </button>
        )}
      </div>

      {/* Metadata */}
      <div className="flex flex-col gap-1 mb-8">
        <span className="text-[11px] font-black tracking-[0.2em] text-[#ADFF00] uppercase mb-1">
          {(exercise as any).target_muscles?.[0] || "Target Muscle"}
        </span>
        <div className="flex justify-between items-end border-b border-white/5 pb-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Target</span>
            <span className="text-sm font-semibold text-white/90">{exercise.target_sets} Sets × {exercise.target_reps} Reps</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Rest</span>
            <span className="text-sm font-semibold text-white/90">{exercise.rest_seconds} sec</span>
          </div>
        </div>
      </div>

      {/* Sets */}
      <div className="flex flex-col gap-6">
        {sortedSets.map((setRecord, idx) => {
          const isCompleted = setRecord.completed;
          const isSubmitting = submittingSetId === setRecord.id;

          return (
            <motion.div 
              key={setRecord.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col relative"
            >
              <div className="w-full h-px bg-white/10 mb-6" />

              <h3 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase mb-4">
                Set {setRecord.set_number}
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Weight</span>
                  <div className="relative">
                    <input
                      type="number"
                      value={setInputs[setRecord.id].weight}
                      onChange={(e) => handleInputChange(setRecord.id, 'weight', e.target.value)}
                      disabled={isCompleted || isSubmitting}
                      className="w-full bg-[#111A10] border border-white/10 rounded-xl px-4 py-3 text-lg font-black text-white text-center focus:outline-none focus:border-[#ADFF00] disabled:opacity-50"
                      placeholder="-"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-white/30">kg</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Reps</span>
                  <input
                    type="number"
                    value={setInputs[setRecord.id].reps}
                    onChange={(e) => handleInputChange(setRecord.id, 'reps', e.target.value)}
                    disabled={isCompleted || isSubmitting}
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
                  onClick={() => handleCompleteSet(setRecord)}
                  disabled={isSubmitting || activeRestSeconds !== null}
                  className="w-full bg-[#ADFF00] text-black font-black uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] disabled:opacity-50 transition-transform active:scale-[0.98]"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isSubmitting ? "Saving..." : "Complete Set"}
                </button>
              )}

              {/* Active Rest Overlay if this set was just completed and timer is running */}
              {isCompleted && activeRestSeconds !== null && idx === sortedSets.filter(s => s.completed).length - 1 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="w-full bg-[#1A2619] border border-[#ADFF00]/30 rounded-xl p-4 mt-4 flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-[#ADFF00] uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Check className="w-3 h-3" /> Set Completed
                    </span>
                    <span className="text-xl font-black text-white">
                      Rest {Math.floor(activeRestSeconds / 60).toString().padStart(2, '0')}:{(activeRestSeconds % 60).toString().padStart(2, '0')}
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
            </motion.div>
          );
        })}
      </div>

      {/* Instructions & Tips */}
      <div className="w-full h-px bg-white/10 my-8" />
      
      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <h3 className="text-[11px] font-black tracking-[0.2em] text-white/50 uppercase mb-3">
            How to perform
          </h3>
          <ol className="list-decimal list-inside text-sm font-medium text-white/80 space-y-2 leading-relaxed">
            <li>Lie flat on the bench.</li>
            <li>Grip the bar slightly wider than shoulders.</li>
            <li>Lower the bar under control.</li>
            <li>Press upward without bouncing.</li>
          </ol>
        </div>

        <div className="bg-[#111A10] border border-white/5 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-4 h-4 text-[#ADFF00]" />
            <h3 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
              AI Tip
            </h3>
          </div>
          <p className="text-sm font-medium text-white/80 leading-relaxed italic border-l-2 border-[#ADFF00]/50 pl-3">
            "Keep your shoulder blades stable and control the lowering phase."
          </p>
        </div>
      </div>

    </div>
  );
}
