"use client";

import { motion } from "framer-motion";
import { Droplets, Moon, Flame, Footprints, ArrowUpRight, Activity } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

interface DailyActivityCardProps {
  lifestyle?: any;
  activity?: any;
  activityDate?: string;
  workoutCompleted?: boolean;
  premiumLevel?: string;
}

export function DailyActivityCard({
  lifestyle,
  activity,
  activityDate,
  workoutCompleted = false,
  premiumLevel = "core",
}: DailyActivityCardProps) {
  const router = useRouter();
  const isPro = premiumLevel === "pro";

  // Pull saved targets from the AI plan
  const stepsTarget = Number(lifestyle?.daily_steps_target) > 0 ? Number(lifestyle.daily_steps_target) : null;
  const waterTarget = Number(lifestyle?.water_target_liters) > 0 ? Number(lifestyle.water_target_liters) : null;
  const sleepTarget = Number(lifestyle?.sleep_target_hours) > 0 ? Number(lifestyle.sleep_target_hours) : null;

  // Active values
  const stepsVal = Number(activity?.steps) > 0 ? Number(activity.steps) : null;
  const waterVal = Number(activity?.water_liters) > 0 ? Number(activity.water_liters) : null;
  const sleepVal = Number(activity?.sleep_hours) > 0 ? Number(activity.sleep_hours) : null;

  // Percentage calculations
  const stepsPercent = useMemo(() => {
    if (!stepsTarget || !stepsVal) return 0;
    return Math.min(Math.round((stepsVal / stepsTarget) * 100), 100);
  }, [stepsTarget, stepsVal]);

  const waterPercent = useMemo(() => {
    if (!waterTarget || !waterVal) return 0;
    return Math.min(Math.round((waterVal / waterTarget) * 100), 100);
  }, [waterTarget, waterVal]);

  const sleepPercent = useMemo(() => {
    if (!sleepTarget || !sleepVal) return 0;
    return Math.min(Math.round((sleepVal / sleepTarget) * 100), 100);
  }, [sleepTarget, sleepVal]);

  // Formatted sleep string
  const sleepFormatted = useMemo(() => {
    if (!sleepVal) return "Not logged";
    const hours = Math.floor(sleepVal);
    const mins = Math.round((sleepVal % 1) * 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }, [sleepVal]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group mt-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/10 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative bg-[#111A10] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl border border-white/5 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 text-[#ADFF00]" />
            </div>
            <h3 className="text-sm font-black tracking-wider text-white uppercase leading-none">
              Today&apos;s Activity
            </h3>
          </div>
          {isPro && (
            <button
              type="button"
              onClick={() => router.push("/progress")}
              className="text-[10px] font-bold text-[#ADFF00] hover:underline flex items-center gap-0.5 cursor-pointer bg-[#ADFF00]/5 px-2 py-1 rounded-full border border-[#ADFF00]/20 transition-all active:scale-95"
            >
              <span>Full Analytics</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 4 Activity Tiles Grid */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {/* 1. Steps */}
          <div
            className="flex flex-col justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-emerald-400/30 hover:bg-white/[0.03] transition-all cursor-pointer group/tile active:scale-[0.98]"
            onClick={() => router.push(isPro ? "/progress" : "/payment?returnTo=/&intent=upgrade_pro")}
            title={isPro ? "Click to view and log steps in Progress" : "Upgrade to Pro"}
          >
            <div className="flex items-center gap-1.5 text-white/60">
              <Footprints className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                Steps
              </span>
              <span className="text-[8px] font-black bg-[#ADFF00]/10 text-[#ADFF00] px-1.5 py-0.5 rounded-sm ml-auto border border-[#ADFF00]/20">
                {isPro ? "LOG" : "PRO"}
              </span>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-black text-white tabular-nums truncate">
                {isPro
                  ? (stepsVal ? stepsVal.toLocaleString() : "Not logged")
                  : (stepsTarget?.toLocaleString() || "Not set")}
                <span className="text-white/40 font-semibold text-[10px] sm:text-xs ml-0.5">
                  {isPro ? ` / ${stepsTarget?.toLocaleString() || "--"}` : " target"}
                </span>
              </div>
            </div>

            {/* Mini Progress Track */}
            <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stepsPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500/60 to-emerald-400 rounded-full"
              />
            </div>
          </div>

          {/* 2. Water */}
          <div
            className="flex flex-col justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-blue-400/30 hover:bg-white/[0.03] transition-all cursor-pointer group/tile active:scale-[0.98]"
            onClick={() => router.push("/nutrition")}
            title="Click to track hydration in Nutrition"
          >
            <div className="flex items-center gap-1.5 text-blue-400">
              <Droplets className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                Water
              </span>
              <span className="text-[8px] font-black bg-blue-400/10 text-blue-300 px-1.5 py-0.5 rounded-sm ml-auto border border-blue-400/20">
                TRACK
              </span>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-black text-white tabular-nums truncate">
                {isPro
                  ? (waterVal !== null ? `${waterVal.toFixed(1)} L` : "Not logged")
                  : (waterTarget ? `${waterTarget.toFixed(1)} L` : "Not set")}
                <span className="text-white/40 font-semibold text-[10px] sm:text-xs ml-0.5">
                  {isPro ? ` / ${waterTarget ? `${waterTarget.toFixed(1)} L` : "--"}` : " target"}
                </span>
              </div>
            </div>

            {/* Mini Progress Track */}
            <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${waterPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-blue-500/60 to-blue-400 rounded-full"
              />
            </div>
          </div>

          {/* 3. Sleep */}
          <div
            className="flex flex-col justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-indigo-400/30 hover:bg-white/[0.03] transition-all cursor-pointer group/tile active:scale-[0.98]"
            onClick={() => router.push(isPro ? "/progress" : "/payment?returnTo=/&intent=upgrade_pro")}
            title={isPro ? "Click to view and log sleep in Progress" : "Upgrade to Pro"}
          >
            <div className="flex items-center gap-1.5 text-indigo-400">
              <Moon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                Sleep
              </span>
              <span className="text-[8px] font-black bg-indigo-400/10 text-indigo-300 px-1.5 py-0.5 rounded-sm ml-auto border border-indigo-400/20">
                {isPro ? "LOG" : "PRO"}
              </span>
            </div>

            <div>
              <div className="text-xs sm:text-sm font-black text-white tabular-nums truncate">
                {isPro ? sleepFormatted : (sleepTarget ? `${sleepTarget}h` : "Not set")}
                <span className="text-white/40 font-semibold text-[10px] sm:text-xs ml-0.5">
                  {isPro ? ` / ${sleepTarget ? `${sleepTarget}h` : "--"}` : " target"}
                </span>
              </div>
            </div>

            {/* Mini Progress Track */}
            <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sleepPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500/60 to-indigo-400 rounded-full"
              />
            </div>
          </div>

          {/* 4. Workout */}
          <div
            className="flex flex-col justify-between gap-2 p-3 sm:p-3.5 rounded-xl bg-black/30 border border-white/5 hover:border-[#ADFF00]/30 hover:bg-white/[0.03] transition-all cursor-pointer group/tile active:scale-[0.98]"
            onClick={() => router.push("/workout")}
            title="Click to view workout session"
          >
            <div className="flex items-center gap-1.5 text-amber-400">
              <Flame className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80">
                Workout
              </span>
              <span className="text-[8px] font-black bg-[#ADFF00]/10 text-[#ADFF00] px-1.5 py-0.5 rounded-sm ml-auto border border-[#ADFF00]/20">
                VIEW
              </span>
            </div>

            <div>
              <div
                className={`text-xs sm:text-sm font-black truncate ${
                  workoutCompleted ? "text-[#ADFF00]" : "text-white/50"
                }`}
              >
                {workoutCompleted ? "Completed 🎉" : "Pending"}
              </div>
            </div>

            {/* Mini Progress Track */}
            <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: workoutCompleted ? "100%" : "0%" }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#ADFF00]/60 to-[#ADFF00] rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
