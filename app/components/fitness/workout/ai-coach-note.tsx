"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot, HelpCircle, X, Target, Activity, Dumbbell, Clock, HeartPulse, TrendingUp, Settings2, Loader2 } from "lucide-react";

interface AiCoachNoteProps {
  workoutId?: string;
  isEarlyStart?: boolean;
  initialNote?: string | null;
}

export function AiCoachNote({ workoutId, isEarlyStart = false, initialNote = null }: AiCoachNoteProps) {
  const [note, setNote] = useState<string | null>(initialNote);
  const [isLoading, setIsLoading] = useState(!initialNote);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dynamicInsights, setDynamicInsights] = useState<any[]>([]);
  const [hasFetchedInsights, setHasFetchedInsights] = useState(false);

  const defaultInsights = [
    { icon: Target, label: "Goal", value: "Hypertrophy (Muscle Growth)" },
    { icon: Activity, label: "Fitness Level", value: "Intermediate" },
    { icon: Dumbbell, label: "Available Equipment", value: "Full Gym Access" },
    { icon: Clock, label: "Duration", value: "45-60 min optimized" },
    { icon: HeartPulse, label: "Recovery", value: "Upper body fully recovered" },
    { icon: TrendingUp, label: "Progress", value: "Progressive overload applied" },
    { icon: Settings2, label: "Preferences", value: "Free weights prioritized" },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Target": return Target;
      case "Activity": return Activity;
      case "Dumbbell": return Dumbbell;
      case "Clock": return Clock;
      case "HeartPulse": return HeartPulse;
      case "TrendingUp": return TrendingUp;
      case "Settings2": return Settings2;
      default: return Target;
    }
  };

  const fetchInsightsIfNeeded = async () => {
    if (hasFetchedInsights || !workoutId || workoutId === "mock") return;
    try {
      const res = await fetch(`/api/workouts/${workoutId}/ai-coach-note`);
      const data = await res.json();
      if (data.insights && data.insights.length > 0) {
        setDynamicInsights(data.insights.map((i: any) => ({ ...i, icon: getIcon(i.icon) })));
        setHasFetchedInsights(true);
      } else {
        setDynamicInsights(defaultInsights);
      }
    } catch {
      setDynamicInsights(defaultInsights);
    }
  };

  useEffect(() => {
    if (!workoutId || workoutId === "mock") {
      setNote(`${isEarlyStart ? "This early-start session" : "This workout"} focuses on your upper body. Keep 1–2 reps in reserve on most sets and prioritize controlled repetitions.`);
      setDynamicInsights(defaultInsights);
      setIsLoading(false);
      return;
    }

    // If initialNote is provided from the server, use it instantly without extra API calls
    if (initialNote) {
      setNote(initialNote);
      setIsLoading(false);
      return;
    }

    const fetchNote = async () => {
      try {
        const res = await fetch(`/api/workouts/${workoutId}/ai-coach-note`);
        const data = await res.json();
        setNote(data.note || `${isEarlyStart ? "This early-start session" : "This workout"} focuses on your upper body. Keep 1–2 reps in reserve on most sets and prioritize controlled repetitions.`);
        
        if (data.insights && data.insights.length > 0) {
          setDynamicInsights(data.insights.map((i: any) => ({ ...i, icon: getIcon(i.icon) })));
          setHasFetchedInsights(true);
        } else {
          setDynamicInsights(defaultInsights);
        }
      } catch (err) {
        setNote(`${isEarlyStart ? "This early-start session" : "This workout"} focuses on your upper body. Keep 1–2 reps in reserve on most sets and prioritize controlled repetitions.`);
        setDynamicInsights(defaultInsights);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNote();
  }, [isEarlyStart, workoutId, initialNote]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full relative mt-6"
      >
        <div className="bg-[#111A10] border border-white/5 rounded-[20px] p-5 shadow-xl">
          
          <div className="flex items-center gap-2 mb-3">
            <Bot className="w-4 h-4 text-[#ADFF00]" />
            <h3 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
              AI Coach Note
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 text-white/50 mb-5">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm italic">Generating insights...</span>
            </div>
          ) : (
            <p className="text-sm font-medium text-white/80 leading-relaxed mb-5 italic border-l-2 border-[#ADFF00]/50 pl-3">
              "{note}"
            </p>
          )}

          <button 
            onClick={() => {
              fetchInsightsIfNeeded();
              setIsModalOpen(true);
            }}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 active:scale-[0.98] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 border border-white/5 group cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-white/50 group-hover:text-white transition-colors" />
            <span className="text-[11px] font-black text-white/80 uppercase tracking-widest group-hover:text-white transition-colors">Why this workout?</span>
          </button>

        </div>
      </motion.div>

      {/* AI Insights Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
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
              
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-[#ADFF00]" />
                  <h2 className="text-sm font-black text-white tracking-widest uppercase">
                    AI Generation Logic
                  </h2>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <p className="text-sm text-white/60 mb-6 leading-relaxed">
                Your workout was perfectly tailored for today based on 7 key data points from your profile and history.
              </p>

              <div className="flex flex-col gap-3">
                {dynamicInsights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-4 bg-[#111A10] border border-white/5 rounded-2xl">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                      {insight.icon && <insight.icon className="w-4 h-4 text-[#ADFF00]" />}
                    </div>
                    <div className="flex flex-col pt-0.5">
                      <span className="text-[10px] font-bold text-white/40 tracking-widest uppercase mb-1">
                        {insight.label}
                      </span>
                      <span className="text-sm font-semibold text-white/90">
                        {insight.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-full mt-6 bg-[#ADFF00] text-black font-black uppercase tracking-widest py-4 rounded-xl active:scale-[0.98] transition-transform cursor-pointer"
              >
                Got It
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
