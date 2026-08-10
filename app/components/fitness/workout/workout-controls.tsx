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
      <div className="fixed bottom-0 left-0 right-0 p-5 bg-white border-t border-gray-100 pb-[calc(1.25rem+env(safe-area-inset-bottom))] z-40">
        <div className="max-w-md mx-auto flex gap-3">
          <button
            onClick={handlePauseResume}
            disabled={!!loadingAction}
            className="flex-1 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all text-gray-900 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPaused ? <Play className="w-5 h-5 fill-current" /> : <Pause className="w-5 h-5 fill-current" />}
            {isPaused ? "Resume" : "Pause"}
          </button>
          
          <button
            onClick={handleFinishRequest}
            disabled={!!loadingAction}
            className="flex-[2] bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_-4px_rgba(16,185,129,0.4)] disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" strokeWidth={2.5} />
            Finish Workout
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-5">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Finish workout?
            </h3>
            <p className="text-sm font-medium text-gray-500 mb-6">
              {hasIncompleteSets 
                ? "You still have incomplete sets. Are you sure you want to finish?" 
                : "Great job! Ready to wrap up?"}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={executeFinish}
                disabled={loadingAction === "finish"}
                className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition-all text-white font-bold py-3.5 rounded-2xl"
              >
                {loadingAction === "finish" ? "Finishing..." : hasIncompleteSets ? "Finish Anyway" : "Finish"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loadingAction === "finish"}
                className="w-full bg-gray-100 hover:bg-gray-200 active:scale-[0.98] transition-all text-gray-900 font-bold py-3.5 rounded-2xl"
              >
                {hasIncompleteSets ? "Continue Workout" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
