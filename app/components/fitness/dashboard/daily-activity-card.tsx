"use client";

import { motion } from "framer-motion";
import { Droplets, Moon, Flame, Footprints, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface DailyActivityCardProps {
  lifestyle?: any;
  activity?: any;
  activityDate?: string;
  workoutCompleted?: boolean;
  premiumLevel?: string;
}

export function DailyActivityCard({ lifestyle, activity, activityDate, workoutCompleted = false, premiumLevel = "core" }: DailyActivityCardProps) {
  const router = useRouter();
  // Pull only saved targets from the AI plan. Never invent fallback values.
  const stepsTarget = Number(lifestyle?.daily_steps_target) > 0 ? Number(lifestyle.daily_steps_target) : null;
  const waterTarget = Number(lifestyle?.water_target_liters) > 0 ? Number(lifestyle.water_target_liters) : null;
  const sleepTarget = Number(lifestyle?.sleep_target_hours) > 0 ? Number(lifestyle.sleep_target_hours) : null;
  const isPro = premiumLevel === "pro";

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
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold tracking-wide text-white/90 uppercase">Today's Activity</h3>
          {isPro && (
            <button
              type="button"
              onClick={() => router.push('/progress')}
              className="text-[10px] font-bold text-[#ADFF00] hover:underline flex items-center gap-0.5 cursor-pointer"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Steps */}
          <div 
            className="flex flex-col gap-1 p-3 rounded-xl bg-black/25 border border-white/5 hover:border-emerald-400/30 hover:bg-white/5 transition-all cursor-pointer group/tile active:scale-[0.98]"
            onClick={() => router.push(isPro ? '/progress' : '/payment?returnTo=/&intent=upgrade_pro')}
            title={isPro ? "Click to view and log steps in Progress" : "Upgrade to Pro"}
          >
            <div className="flex items-center gap-1.5 text-white/60">
              <Footprints className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Steps</span>
              <span className="text-[8px] font-bold bg-[#ADFF00]/10 text-[#ADFF00] px-1.5 py-0.5 rounded-sm ml-auto">
                {isPro ? "LOG" : "PRO"}
              </span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {isPro
                ? (Number(activity?.steps) > 0 ? Number(activity.steps).toLocaleString() : "Not logged")
                : (stepsTarget?.toLocaleString() || "Not set")}
              <span className="text-white/40 font-medium text-xs">{isPro ? ` / ${stepsTarget?.toLocaleString() || "--"}` : " target"}</span>
            </div>
          </div>

          {/* Water */}
          <div 
            className="flex flex-col gap-1 p-3 rounded-xl bg-black/25 border border-white/5 hover:border-blue-400/30 hover:bg-white/5 transition-all cursor-pointer group/tile active:scale-[0.98]"
            onClick={() => router.push('/nutrition')}
            title="Click to track hydration in Nutrition"
          >
            <div className="flex items-center gap-1.5 text-[#3b82f6]/80">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Water</span>
              <span className="text-[8px] font-bold bg-blue-400/10 text-blue-300 px-1.5 py-0.5 rounded-sm ml-auto">
                TRACK
              </span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {isPro
                ? (Number(activity?.water_liters) > 0 ? `${Number(activity.water_liters).toFixed(1)} L` : "Not logged")
                : (waterTarget ? `${waterTarget.toFixed(1)} L` : "Not set")}
              <span className="text-white/40 font-medium text-xs">{isPro ? ` / ${waterTarget?.toFixed(1) || "--"} L` : " target"}</span>
            </div>
          </div>

          {/* Sleep */}
          <div 
            className="flex flex-col gap-1 p-3 rounded-xl bg-black/25 border border-white/5 hover:border-indigo-400/30 hover:bg-white/5 transition-all cursor-pointer group/tile active:scale-[0.98]"
            onClick={() => router.push(isPro ? '/progress' : '/payment?returnTo=/&intent=upgrade_pro')}
            title={isPro ? "Click to view and log sleep in Progress" : "Upgrade to Pro"}
          >
            <div className="flex items-center gap-1.5 text-[#8b5cf6]/80">
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Sleep</span>
              <span className="text-[8px] font-bold bg-indigo-400/10 text-indigo-300 px-1.5 py-0.5 rounded-sm ml-auto">
                {isPro ? "LOG" : "PRO"}
              </span>
            </div>
            <div className="text-sm font-black text-white mt-0.5">
              {isPro
                ? (Number(activity?.sleep_hours) > 0
                    ? `${Math.floor(Number(activity.sleep_hours))}h ${Math.round((Number(activity.sleep_hours) % 1) * 60)}m`
                    : "Not logged")
                : (sleepTarget ? `${sleepTarget}h target` : "Not set")}
            </div>
          </div>

          {/* Workout */}
          <div 
            className="flex flex-col gap-1 p-3 rounded-xl bg-black/25 border border-white/5 hover:border-[#ADFF00]/30 hover:bg-white/5 transition-all cursor-pointer group/tile active:scale-[0.98]"
            onClick={() => router.push('/workout')}
            title="Click to view workout session"
          >
            <div className="flex items-center gap-1.5 text-[#ef4444]/80">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">Workout</span>
              <span className="text-[8px] font-bold bg-[#ADFF00]/10 text-[#ADFF00] px-1.5 py-0.5 rounded-sm ml-auto">
                VIEW
              </span>
            </div>
            <div className={`text-sm font-black mt-0.5 ${workoutCompleted ? 'text-[#ADFF00]' : 'text-white/50'}`}>
              {workoutCompleted ? "Completed 🎉" : "Pending"}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
