"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle, RefreshCw } from "lucide-react";

export function RegenerateReportButton() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const regenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/fitness/report/regenerate", { method: "POST" });
      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.success) {
        throw new Error(body?.error || "Could not generate your report.");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate your report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={regenerate}
        disabled={isGenerating}
        className="w-full py-3.5 bg-[#ADFF00] text-black rounded-full font-extrabold flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
      >
        {isGenerating ? <LoaderCircle size={18} className="animate-spin" /> : <RefreshCw size={18} />}
        {isGenerating ? "Creating your report..." : "Create My Personalised Report"}
      </button>
      {error && <p role="alert" className="text-center text-sm text-red-300">{error}</p>}
    </div>
  );
}
