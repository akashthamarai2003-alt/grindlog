"use client";

import { motion } from "framer-motion";
import { Droplets, Moon, Flame } from "lucide-react";

interface DailyActivityCardProps {
  lifestyle?: any;
  activity?: any;
  activityDate?: string;
  workoutCompleted?: boolean;
  premiumLevel?: string;
}

export function DailyActivityCard({ lifestyle, activity, activityDate, workoutCompleted = false, premiumLevel = "core" }: DailyActivityCardProps) {
  // Pull only saved targets from the AI plan. Never invent fallback values.
  const stepsTarget = Number(lifestyle?.daily_steps_target) > 0 ? Number(lifestyle.daily_steps_target) : null;
  const waterTarget = Number(lifestyle?.water_target_liters) > 0 ? Number(lifestyle.water_target_liters) : null;
  const sleepTarget = Number(lifestyle?.sleep_target_hours) > 0 ? Number(lifestyle.sleep_target_hours) : null;
  const isPro = premiumLevel === "pro";
  const todayDateStr = new Date().toISOString().split('T')[0];
  const canLogActivity = isPro && (!activityDate || activityDate === todayDateStr);



  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group mt-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/10 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
      
      <div className="relative bg-[#111A10] rounded-2xl p-5 flex flex-col gap-4 shadow-xl border border-white/5 backdrop-blur-md">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">Today</h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
            
            {/* Steps */}
            <div 
              className={`flex flex-col gap-1 p-2 -m-2 rounded-lg transition-colors ${canLogActivity ? "cursor-pointer hover:bg-white/5" : "cursor-default"}`}
              onClick={canLogActivity ? async () => {
                const input = window.prompt("Enter your steps for today:");
                if (!input || isNaN(Number(input))) return;
                
                try {
                  const { createClient } = await import("@/lib/services/supabase/client");
                  const supabase = createClient();
                  const { data: { user } } = await supabase.auth.getUser();
                  if (!user) return;
                  
                  await supabase.from('fitness_os_activity_logs').upsert({
                    user_id: user.id,
                    activity_date: new Date().toISOString().split('T')[0],
                    steps: Number(input)
                  }, { onConflict: 'user_id,activity_date' });
                  window.location.reload();
                } catch(e) {}
              } : undefined}
            >
              <div className="flex items-center gap-1.5 text-white/60">
                <span className="text-sm">🚶</span>
                <span className="text-xs font-bold uppercase tracking-widest">Steps</span>
                <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded-sm ml-auto">{canLogActivity ? "TAP TO LOG" : isPro ? "VIEW ONLY" : "TARGET"}</span>
              </div>
              <div className="text-sm font-black text-white">
                {isPro
                  ? (Number(activity?.steps) > 0 ? Number(activity.steps).toLocaleString() : "Not logged")
                  : (stepsTarget?.toLocaleString() || "Not set")}
                <span className="text-white/40 font-medium text-xs">{isPro ? ` / ${stepsTarget?.toLocaleString() || "--"}` : " target"}</span>
              </div>
            </div>

            {/* Water */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#3b82f6]/80">
                <Droplets className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Water</span>
              </div>
              <div className="text-sm font-black text-white">
                {isPro
                  ? (Number(activity?.water_liters) > 0 ? `${Number(activity.water_liters).toFixed(1)} L` : "Not logged")
                  : (waterTarget ? `${waterTarget.toFixed(1)} L` : "Not set")}
                <span className="text-white/40 font-medium text-xs">{isPro ? ` / ${waterTarget?.toFixed(1) || "--"} L` : " target"}</span>
              </div>
            </div>

            {/* Sleep */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#8b5cf6]/80">
                <Moon className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Sleep</span>
              </div>
              <div className="text-sm font-black text-white">
                {isPro
                  ? (Number(activity?.sleep_hours) > 0
                      ? `${Math.floor(Number(activity.sleep_hours))}h ${Math.round((Number(activity.sleep_hours) % 1) * 60)}m`
                      : "Not logged")
                  : (sleepTarget ? `${sleepTarget}h target` : "Not set")}
              </div>
            </div>

            {/* Workout */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-[#ef4444]/80">
                <Flame className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/60">Workout</span>
              </div>
              <div className={`text-sm font-black ${workoutCompleted ? 'text-[#ADFF00]' : 'text-white/40'}`}>
                {workoutCompleted ? "Completed" : "Not completed"}
              </div>
            </div>

          </div>
      </div>
    </motion.div>
  );
}
