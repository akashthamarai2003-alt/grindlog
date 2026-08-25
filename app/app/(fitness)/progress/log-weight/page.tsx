"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Weight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function LogWeightPage() {
  const [weight, setWeight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    if (!weight || isNaN(Number(weight))) return;
    
    setIsLoading(true);
    
    // 1. Fire the request in the background (Optimistic UI - do not await!)
    fetch("/api/fitness/log-weight", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight }),
    }).catch(error => console.error("Background save error:", error));

    // 2. Play the beautiful loading animation for exactly 600ms, then instantly navigate back
    setTimeout(() => {
      router.push("/progress");
      router.refresh(); // Tell Next.js to pull the new data when we get there
    }, 600);
  };

  return (
    <div className="w-full flex flex-col h-full bg-[#0A1108] p-5 relative overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-[#0A1108]/90 backdrop-blur-md flex flex-col items-center justify-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="mb-6"
            >
              <Loader2 className="w-12 h-12 text-[#ADFF00]" />
            </motion.div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Saving Weight...</h2>
            <p className="text-sm text-white/50 mt-2 font-medium">Crunching the numbers</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-10">
        <Link href="/progress" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors">
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
          className="w-full max-w-xs h-14 bg-[#ADFF00] text-black font-black uppercase tracking-widest rounded-2xl flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-transform active:scale-95"
        >
          {isLoading ? "Saving..." : "Save Weight"}
        </button>
      </div>
    </div>
  );
}
