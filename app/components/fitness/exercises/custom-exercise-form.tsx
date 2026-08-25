"use client";

import { useState } from "react";
import { WorkoutHeader } from "@/components/fitness/workout/workout-header";
import { Loader2, Plus, X, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CustomExerciseForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const MUSCLES = ["chest", "shoulders", "biceps", "triceps", "middle back", "lower back", "lats", "abdominals", "glutes", "quadriceps", "hamstrings", "calves", "forearms"];
  const EQUIPMENT = ["body only", "machine", "barbell", "dumbbell", "cable", "bands", "kettlebells", "other"];

  const [formData, setFormData] = useState({
    name: "",
    target_muscle: "chest",
    equipment: "barbell",
    mechanic: "compound",
    force: "push"
  });

  const [instructions, setInstructions] = useState<string[]>([""]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/fitness/exercises/custom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          instructions: instructions.filter(i => i.trim() !== ""),
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create exercise");

      toast.success("Exercise created!");
      router.push(`/exercises/${data.slug}`);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0A1108] overflow-y-auto pb-32">
      <div className="px-5 pt-8">
        <WorkoutHeader title="Custom Exercise" backUrl="/exercises" />
        
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Exercise Name</label>
            <input 
              type="text"
              required
              value={formData.name}
              onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Zercher Squat"
              className="bg-[#111A10] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-[#ADFF00] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Target Muscle</label>
              <select 
                value={formData.target_muscle}
                onChange={e => setFormData(p => ({ ...p, target_muscle: e.target.value }))}
                className="bg-[#111A10] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-[#ADFF00] outline-none capitalize appearance-none"
              >
                {MUSCLES.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Equipment</label>
              <select 
                value={formData.equipment}
                onChange={e => setFormData(p => ({ ...p, equipment: e.target.value }))}
                className="bg-[#111A10] border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white focus:border-[#ADFF00] outline-none capitalize appearance-none"
              >
                {EQUIPMENT.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Instructions (Optional)</label>
            {instructions.map((inst, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="w-8 h-10 rounded-lg bg-[#ADFF00]/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-[#ADFF00]">{idx + 1}</span>
                </div>
                <input 
                  type="text"
                  value={inst}
                  onChange={e => {
                    const newInst = [...instructions];
                    newInst[idx] = e.target.value;
                    setInstructions(newInst);
                  }}
                  placeholder="e.g. Keep your chest up..."
                  className="flex-1 bg-[#111A10] border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium text-white focus:border-[#ADFF00] outline-none"
                />
                {instructions.length > 1 && (
                  <button type="button" onClick={() => setInstructions(instructions.filter((_, i) => i !== idx))} className="p-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/80 bg-[#111A10]">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            
            <button 
              type="button" 
              onClick={() => setInstructions([...instructions, ""])}
              className="mt-2 py-3 border border-dashed border-white/20 rounded-xl text-xs font-bold text-white/50 hover:bg-white/5 flex items-center justify-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Step
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-8 w-full bg-[#ADFF00] text-black font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSubmitting ? "Saving..." : "Save Custom Exercise"}
          </button>
        </form>
      </div>
    </div>
  );
}
