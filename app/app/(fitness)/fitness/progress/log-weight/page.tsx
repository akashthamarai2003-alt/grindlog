"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Weight } from "lucide-react";
import Link from "next/link";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { FitnessShell } from "@/components/fitness/fitness-shell";

export default function LogWeightPage() {
  const [weight, setWeight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!weight || isNaN(Number(weight))) return;
    
    setIsLoading(true);
    try {
      const res = await fetch("/api/fitness/log-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight }),
      });

      if (!res.ok) throw new Error("Failed to save weight");
      
      router.push("/fitness/progress");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Failed to save weight. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FitnessGuard>
      <FitnessShell>
        <div className="w-full flex flex-col h-full bg-[#0A1108] p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-10">
            <Link href="/fitness/progress" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-sm font-black tracking-widest text-white uppercase">Log Weight</h1>
            <div className="w-10" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center -mt-20">
            <div className="w-20 h-20 rounded-full bg-[#ADFF00]/10 flex items-center justify-center mb-6">
              <Weight className="w-10 h-10 text-[#ADFF00]" />
            </div>
            
            <h2 className="text-white/60 text-sm font-bold mb-4 uppercase tracking-widest">Current Weight</h2>
            
            <div className="flex items-end gap-2 mb-12">
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="00.0"
                className="bg-transparent text-6xl font-black text-white outline-none w-48 text-center placeholder:text-white/20"
                autoFocus
              />
              <span className="text-2xl font-black text-[#ADFF00] mb-2">kg</span>
            </div>

            <button 
              onClick={handleSave}
              disabled={isLoading || !weight}
              className="w-full max-w-xs h-14 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Save Weight"}
            </button>
          </div>
        </div>
      </FitnessShell>
    </FitnessGuard>
  );
}
