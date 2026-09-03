"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

export function ProNutritionGenerationCard() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateNutrition = async () => {
    if (isGenerating) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/fitness-ai/upgrade-nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json().catch(() => null);

      if (!response.ok || !result?.success) {
        throw new Error(result?.error || "We could not generate your Pro nutrition plan.");
      }

      toast.success(result.alreadyGenerated ? "Your Pro nutrition plan is already ready." : "Your Pro nutrition plan is ready.");
      router.refresh();
    } catch (error: any) {
      toast.error(error?.message || "We could not generate your Pro nutrition plan.");
      setIsGenerating(false);
    }
  };

  return (
    <section className="rounded-2xl border border-[#ADFF00]/35 bg-[linear-gradient(145deg,rgba(173,255,0,0.12),rgba(17,26,16,1)_58%)] p-5 shadow-xl">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#ADFF00]/15 text-[#ADFF00]">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-[#ADFF00]">Pro unlocked</p>
          <h2 className="mt-1 text-lg font-black text-white">Generate your full nutrition plan</h2>
          <p className="mt-2 text-xs leading-relaxed text-white/60">
            Your saved workout schedule is safe. Create the missing meals, macros, and grocery add-ons from your saved profile now.
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={generateNutrition}
        disabled={isGenerating}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ADFF00] py-3.5 text-sm font-black text-black transition-colors hover:bg-[#c4ff33] disabled:cursor-wait disabled:opacity-70"
      >
        {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isGenerating ? "BUILDING YOUR NUTRITION PLAN..." : "GENERATE PRO NUTRITION PLAN"}
        {!isGenerating && <ArrowRight className="h-4 w-4" />}
      </button>
      <p className="mt-2 text-center text-[10px] text-white/40">Uses one Pro AI generation credit after you confirm.</p>
    </section>
  );
}
