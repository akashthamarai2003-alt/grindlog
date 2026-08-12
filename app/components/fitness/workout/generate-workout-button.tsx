"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function GenerateWorkoutButton() {
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();

  const handleGenerate = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const res = await fetch("/api/workouts/generate-plan", {
        method: "POST"
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate workout");

      toast.success("Workout generated successfully!");
      router.refresh(); // Refresh the Server Component to fetch the new data
    } catch (error: any) {
      toast.error(error.message);
      setIsGenerating(false);
    }
  };

  return (
    <button 
      onClick={handleGenerate}
      disabled={isGenerating}
      className="w-full bg-[#ADFF00] text-black font-black uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-[#bfff33] transition-colors shadow-[0_0_20px_rgba(173,255,0,0.2)] active:scale-[0.98] disabled:opacity-70"
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          GENERATING...
        </>
      ) : (
        <>
          <Plus className="w-5 h-5" />
          GENERATE WORKOUT
        </>
      )}
    </button>
  );
}
