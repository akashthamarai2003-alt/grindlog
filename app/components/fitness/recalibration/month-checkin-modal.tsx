"use client";

import { useState } from "react";
import {
  X,
  Sparkles,
  Scale,
  HeartPulse,
  Target,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Flame,
  Dumbbell
} from "lucide-react";

interface MonthCheckinModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWeight: number | string;
  currentGoal?: string;
  hasPreviousPain?: boolean;
}

export function MonthCheckinModal({
  isOpen,
  onClose,
  currentWeight,
  currentGoal = "Cut",
  hasPreviousPain = false,
}: MonthCheckinModalProps) {
  const [weight, setWeight] = useState<string>(String(currentWeight || ""));
  const [painStatus, setPainStatus] = useState<"healed" | "better" | "same">("better");
  const [goal, setGoal] = useState<string>(currentGoal);
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState("Analyzing progress...");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      setLoadingStage("Updating weight & recovery metrics...");
      await new Promise((r) => setTimeout(r, 600));

      setLoadingStage("Recalibrating daily calories & protein...");
      const res = await fetch("/api/fitness-ai/generate-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isRecalibrate: true,
          newWeight: Number(weight) || currentWeight,
          painStatus,
          newGoal: goal,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to recalibrate plan. Please try again.");
      }

      setLoadingStage("Locking in your next Progressive Overload phase!");
      await new Promise((r) => setTimeout(r, 800));

      // Reload page to reflect newly active mesocycle
      window.location.reload();
    } catch (err: any) {
      console.error("Recalibration error:", err);
      setError(err.message || "An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121E12] border border-[#ADFF00]/40 rounded-3xl p-6 sm:p-8 text-white shadow-[0_0_50px_rgba(173,255,0,0.15)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        {!loading && (
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#ADFF00]/15 border border-[#ADFF00]/30 flex items-center justify-center text-[#ADFF00] shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-[#ADFF00] text-black px-2 py-0.5 rounded-full">
                Phase Recalibration
              </span>
            </div>
            <h2 className="text-xl font-black text-white mt-1">Monthly Progress Check-In</h2>
            <p className="text-xs text-gray-400">
              Recalibrate your next 4-week mesocycle based on real body progress.
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-[#ADFF00]/20 border-t-[#ADFF00] animate-spin" />
              <Dumbbell className="w-6 h-6 text-[#ADFF00] absolute inset-0 m-auto animate-pulse" />
            </div>
            <div>
              <p className="text-base font-bold text-white">{loadingStage}</p>
              <p className="text-xs text-gray-400 mt-1">
                Applying progressive overload & fresh exercise novelties...
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 1. Scale Weight */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-200">
                <Scale className="w-4 h-4 text-[#ADFF00]" />
                <span>Current Morning Weight (kg)</span>
                <span className="text-[11px] font-normal text-gray-400">(Started at {currentWeight} kg)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  min="30"
                  max="250"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-[#0A1108] border border-white/10 rounded-2xl px-4 py-3 text-white text-base font-bold focus:outline-none focus:border-[#ADFF00] transition-colors"
                  placeholder="e.g. 54.2"
                />
                <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-500">kg</span>
              </div>
            </div>

            {/* 2. Recovery & Joint Status */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-200">
                <HeartPulse className="w-4 h-4 text-[#ADFF00]" />
                <span>Joints & Fatigue Status</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "healed", label: "Completely Healed", desc: "No pain or issues" },
                  { id: "better", label: "Much Better", desc: "Noticeable improvement" },
                  { id: "same", label: "Need Modification", desc: "Keep joints safe" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPainStatus(item.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      painStatus === item.id
                        ? "border-[#ADFF00] bg-[#ADFF00]/10 text-white shadow-[0_0_15px_rgba(173,255,0,0.15)]"
                        : "border-white/10 bg-[#0A1108] text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Next Phase Goal */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-gray-200">
                <Target className="w-4 h-4 text-[#ADFF00]" />
                <span>Next 4-Week Phase Target</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "Cut", label: "Fat Loss & Cut", desc: "Higher deficit, lean conditioning" },
                  { id: "Build Muscle", label: "Hypertrophy / Lean Bulk", desc: "Slight surplus, maximum volume" },
                  { id: "Maintain", label: "Body Recomposition", desc: "Maintain weight, build strength" },
                  { id: "Gain Weight", label: "Strength & Mass", desc: "Calorie surplus, heavy compound lifts" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setGoal(item.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      goal.toLowerCase().includes(item.id.toLowerCase())
                        ? "border-[#ADFF00] bg-[#ADFF00]/10 text-white shadow-[0_0_15px_rgba(173,255,0,0.15)]"
                        : "border-white/10 bg-[#0A1108] text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <p className="text-xs font-bold">{item.label}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-black uppercase tracking-wider text-sm rounded-2xl shadow-[0_0_20px_rgba(173,255,0,0.3)] transition-all active:scale-95 flex items-center justify-center gap-2 mt-4"
            >
              <span>Recalibrate & Unlock Next Phase 🚀</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
