"use client";

import { motion } from "framer-motion";
import { Bot, HelpCircle } from "lucide-react";

interface AiCoachNoteProps {
  note?: string;
}

export function AiCoachNote({ note }: AiCoachNoteProps) {
  const defaultNote = "Today's workout focuses on your upper body. Keep 1–2 reps in reserve on most sets and prioritize controlled repetitions.";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="w-full relative mt-6"
    >
      <div className="bg-[#111A10] border border-white/5 rounded-[20px] p-5">
        
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-4 h-4 text-[#ADFF00]" />
          <h3 className="text-xs font-black tracking-widest text-white/90 uppercase">
            AI Coach Note
          </h3>
        </div>

        <p className="text-sm font-medium text-white/70 leading-relaxed mb-4 italic border-l-2 border-[#ADFF00]/50 pl-3">
          "{note || defaultNote}"
        </p>

        <button className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 border border-white/5">
          <HelpCircle className="w-4 h-4 text-white/50" />
          <span className="text-[11px] font-black text-white/80 uppercase tracking-widest">Why this workout?</span>
        </button>

      </div>
    </motion.div>
  );
}
