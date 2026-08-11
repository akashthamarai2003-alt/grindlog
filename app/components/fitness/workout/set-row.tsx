"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { FitnessSet } from "@/types/fitness/workout";
import { completeSetAction } from "@/app/actions/fitness";
import { toast } from "sonner";

interface SetRowProps {
  setRecord: FitnessSet;
  onSetCompleted: (durationMs: number) => void;
  isTimerActive: boolean;
}

export function SetRow({ setRecord, onSetCompleted, isTimerActive }: SetRowProps) {
  const [actualReps, setActualReps] = useState<string>(
    setRecord.actual_reps?.toString() || setRecord.target_reps?.toString() || ""
  );
  const [weightKg, setWeightKg] = useState<string>(
    setRecord.weight_kg?.toString() || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompleted = setRecord.completed;

  const handleComplete = async () => {
    if (isCompleted || isSubmitting) return;
    setIsSubmitting(true);

    const reps = actualReps ? parseInt(actualReps, 10) : null;
    const weight = weightKg ? parseFloat(weightKg) : null;

    const res = await completeSetAction({
      setId: setRecord.id,
      actualReps: reps,
      weightKg: weight,
      // Pass 0 as placeholder for now, actual duration calculations can be added later
      durationSeconds: 0 
    });

    if (res.success) {
      onSetCompleted(Date.now());
    } else {
      toast.error(res.error || "Failed to complete set");
    }

    setIsSubmitting(false);
  };

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${isCompleted ? 'bg-[#ADFF00]/10 border border-[#ADFF00]/20' : 'bg-white/5 border border-transparent'}`}>
      <div className="w-8 flex items-center justify-center shrink-0">
        <span className={`text-sm font-bold ${isCompleted ? 'text-[#ADFF00]' : 'text-white/40'}`}>
          {setRecord.set_number}
        </span>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-2">
        <div className="relative">
          <input
            type="number"
            min="0"
            value={actualReps}
            onChange={(e) => setActualReps(e.target.value)}
            disabled={isCompleted || isSubmitting}
            placeholder={setRecord.target_reps?.toString() || "-"}
            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm font-bold text-white text-center focus:outline-none focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] disabled:bg-transparent disabled:border-transparent disabled:text-[#ADFF00]/80 placeholder:text-white/20"
            aria-label={`Set ${setRecord.set_number} reps`}
          />
          {!isCompleted && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30">
              REPS
            </span>
          )}
        </div>

        <div className="relative">
          <input
            type="number"
            min="0"
            step="0.5"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            disabled={isCompleted || isSubmitting}
            placeholder="-"
            className="w-full bg-black/40 border border-white/5 rounded-xl px-3 py-2 text-sm font-bold text-white text-center focus:outline-none focus:border-[#ADFF00] focus:ring-1 focus:ring-[#ADFF00] disabled:bg-transparent disabled:border-transparent disabled:text-[#ADFF00]/80 placeholder:text-white/20"
            aria-label={`Set ${setRecord.set_number} weight in kg`}
          />
          {!isCompleted && (
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white/30">
              KG
            </span>
          )}
        </div>
      </div>

      <button
        onClick={handleComplete}
        disabled={isCompleted || isSubmitting || isTimerActive}
        className={`w-12 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
          isCompleted
            ? 'bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.5)]'
            : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
        } ${isTimerActive && !isCompleted ? 'opacity-30 cursor-not-allowed' : ''}`}
        aria-label={isCompleted ? "Set completed" : "Complete set"}
      >
        {isSubmitting ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Check className={`w-5 h-5 ${isCompleted ? 'stroke-[3]' : 'stroke-[2]'}`} />
        )}
      </button>
    </div>
  );
}
