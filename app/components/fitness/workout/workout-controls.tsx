"use client";

import { useState } from "react";
import { Play, Pause, CheckCircle } from "lucide-react";
import { 
  pauseWorkoutSessionAction, 
  resumeWorkoutSessionAction, 
  finishWorkoutSessionAction 
} from "@/app/actions/fitness";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface WorkoutControlsProps {
  sessionId: string;
  isPaused: boolean;
  hasIncompleteSets: boolean;
}

export function WorkoutControls({ sessionId, isPaused, hasIncompleteSets }: WorkoutControlsProps) {
  const router = useRouter();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const handlePauseResume = async () => {
    if (loadingAction) return;
    setLoadingAction("pause_resume");
    
    let res;
    if (isPaused) {
      res = await resumeWorkoutSessionAction({ sessionId });
    } else {
      res = await pauseWorkoutSessionAction({ sessionId });
    }

    if (!res.success) {
      toast.error(res.error || "Failed to update session state");
    }
    setLoadingAction(null);
  };

  const handleFinishRequest = () => {
    setShowConfirm(true);
  };

  const executeFinish = async () => {
    if (loadingAction) return;
    setLoadingAction("finish");
    
    const res = await finishWorkoutSessionAction({ sessionId });
    if (res.success) {
      toast.success("Workout completed!");
      // We rely on the server action to revalidate and then router.refresh or we just navigate
      // We can just rely on the server action pushing state to 'completed', which will trigger the layout to redirect to summary or we manually redirect here.
    } else {
      toast.error(res.error || "Failed to finish workout");
      setLoadingAction(null);
      setShowConfirm(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0A1108]/90 backdrop-blur-xl border-t border-white/5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-40">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={handlePauseResume}
            disabled={!!loadingAction}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 active:scale-[0.98] transition-all text-white font-black uppercase tracking-wide py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
            {isPaused ? "Resume" : "Pause"}
          </button>
          
          <button
            onClick={handleFinishRequest}
            disabled={!!loadingAction}
            className="flex-[2] bg-[#ADFF00] hover:bg-[#bfff33] active:scale-[0.98] transition-all text-black font-black uppercase tracking-wide py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5 stroke-[2.5]" />
            Finish Workout
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-[#111A10] border border-white/10 rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">
              Finish workout?
            </h3>
            <p className="text-sm font-medium text-white/60 mb-6">
              {hasIncompleteSets 
                ? "You still have incomplete sets. Are you sure you want to finish?" 
                : "Great job! Ready to wrap up?"}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={executeFinish}
                disabled={loadingAction === "finish"}
                className="w-full py-4 bg-[#ADFF00] hover:bg-[#bfff33] active:scale-[0.98] transition-all text-black font-black uppercase tracking-wide rounded-xl flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(173,255,0,0.3)] disabled:opacity-50"
              >
                {loadingAction === "finish" ? "Finishing..." : "Yes, finish workout"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loadingAction === "finish"}
                className="w-full py-4 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-white font-bold uppercase tracking-wide rounded-xl disabled:opacity-50 border border-white/5"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
