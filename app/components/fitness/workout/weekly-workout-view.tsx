"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, X, Check, Circle, Dot, Minus } from "lucide-react";

export function WeeklyWorkoutView({ weekDays = [] }: { weekDays?: any[] }) {
  const [isPlanOpen, setIsPlanOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <Check className="w-4 h-4 text-[#ADFF00]" />;
      case "today": return <div className="w-2 h-2 rounded-full bg-[#ADFF00]" />;
      case "upcoming": return <div className="w-2.5 h-2.5 rounded-full border border-white/30" />;
      case "rest": return <Minus className="w-4 h-4 text-white/20" />;
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-4 mb-8">
        
        <div className="flex items-center justify-between px-2">
          <span className="text-[11px] font-black tracking-widest text-white/50 uppercase">
            This Week
          </span>
          <button 
            onClick={() => setIsPlanOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/10"
          >
            <CalendarDays className="w-3.5 h-3.5 text-white/70" />
            <span className="text-[10px] font-black text-white/90 uppercase tracking-widest">Plan</span>
          </button>
        </div>

        <div className="flex justify-between items-center bg-[#111A10] border border-white/5 rounded-2xl p-4">
          {weekDays.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <span className={`text-[10px] font-black tracking-widest ${d.status === 'today' ? 'text-[#ADFF00]' : 'text-white/40'}`}>
                {d.day.charAt(0)}
              </span>
              <div className="h-6 flex items-center justify-center">
                {getStatusIcon(d.status)}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Plan Modal */}
      <AnimatePresence>
        {isPlanOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPlanOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-[#0A1108] border-t border-white/10 sm:border sm:rounded-[24px] rounded-t-[32px] p-6 shadow-2xl z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 sm:hidden" />
              
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    Your Weekly Plan
                  </h3>
                </div>
                <button 
                  onClick={() => setIsPlanOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex flex-col gap-3">
                {weekDays.map((day, idx) => (
                  <div key={idx} className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${day.status === 'today' ? 'bg-[#ADFF00]/10 border-[#ADFF00]/50' : 'bg-[#111A10] border-white/5'}`}>
                    
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">
                        {day.day}
                      </span>
                      <span className={`text-sm font-bold uppercase tracking-wider ${day.status === 'today' ? 'text-[#ADFF00]' : 'text-white'}`}>
                        {day.name}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <div className="h-5 flex items-center justify-center">
                        {getStatusIcon(day.status)}
                      </div>
                      <span className="text-[9px] font-bold text-white/30 tracking-widest uppercase">
                        {day.status}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
              
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
