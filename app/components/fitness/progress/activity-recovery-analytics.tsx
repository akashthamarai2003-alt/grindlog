"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ActivityAnalytics, RecoveryAnalytics } from "@/types/fitness/analytics";
import { Footprints, Moon, Plus, Sparkles, X, Check, Loader2 } from "lucide-react";
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { toast } from "sonner";

export function ActivityRecoveryAnalyticsCard({
  activity,
  recovery,
  onRefresh,
}: {
  activity: ActivityAnalytics;
  recovery: RecoveryAnalytics;
  onRefresh?: () => Promise<void> | void;
}) {
  const router = useRouter();
  const [localActivity, setLocalActivity] = useState<ActivityAnalytics>(activity);
  const [localRecovery, setLocalRecovery] = useState<RecoveryAnalytics>(recovery);

  useEffect(() => {
    setLocalActivity(activity);
  }, [activity]);

  useEffect(() => {
    setLocalRecovery(recovery);
  }, [recovery]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"steps" | "sleep">("steps");

  // Logging modal form state
  const todayStr = new Date().toISOString().split("T")[0];
  const [logDate, setLogDate] = useState(todayStr);
  const [stepsInput, setStepsInput] = useState<string>(
    localActivity.todaySteps && localActivity.todaySteps > 0 ? String(localActivity.todaySteps) : ""
  );
  const [sleepHoursInput, setSleepHoursInput] = useState<string>(
    localRecovery.todaySleepHours && localRecovery.todaySleepHours > 0 ? String(localRecovery.todaySleepHours) : ""
  );
  const [sleepQualityInput, setSleepQualityInput] = useState<number>(
    localRecovery.todaySleepQuality ? Math.round(localRecovery.todaySleepQuality / 10) : 8
  );
  const [isSaving, setIsSaving] = useState(false);

  const openLogModal = (tab: "steps" | "sleep" = "steps") => {
    setActiveTab(tab);
    setLogDate(todayStr);
    setStepsInput(localActivity.todaySteps && localActivity.todaySteps > 0 ? String(localActivity.todaySteps) : "");
    setSleepHoursInput(localRecovery.todaySleepHours && localRecovery.todaySleepHours > 0 ? String(localRecovery.todaySleepHours) : "");
    setSleepQualityInput(localRecovery.todaySleepQuality ? Math.round(localRecovery.todaySleepQuality / 10) : 8);
    setIsModalOpen(true);
  };

  const handleSaveLogs = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stepsInput && !sleepHoursInput) {
      toast.error("Please enter steps or sleep hours to log.");
      return;
    }

    const parsedSteps = stepsInput ? Number(stepsInput) : undefined;
    const parsedSleep = sleepHoursInput ? Number(sleepHoursInput) : undefined;
    const parsedQuality = sleepHoursInput ? sleepQualityInput * 10 : undefined;

    // 1. OPTIMISTIC UPDATE: Update the UI immediately in 0ms!
    if (parsedSteps !== undefined) {
      setLocalActivity((prev) => {
        const updatedChart = (prev.stepsChart || []).map((entry) => {
          if (entry.date === logDate || (logDate === todayStr && entry.isToday)) {
            return { ...entry, steps: parsedSteps, logged: true };
          }
          return entry;
        });
        const isToday = logDate === todayStr;
        return {
          ...prev,
          todaySteps: isToday ? parsedSteps : prev.todaySteps,
          stepsChart: updatedChart,
        };
      });
    }

    if (parsedSleep !== undefined) {
      setLocalRecovery((prev) => {
        const updatedChart = (prev.sleepChart || []).map((entry) => {
          if (entry.date === logDate || (logDate === todayStr && entry.isToday)) {
            return {
              ...entry,
              hours: parsedSleep,
              quality: parsedQuality ?? entry.quality,
              logged: true,
            };
          }
          return entry;
        });
        const isToday = logDate === todayStr;
        return {
          ...prev,
          todaySleepHours: isToday ? parsedSleep : prev.todaySleepHours,
          todaySleepQuality: isToday ? (parsedQuality ?? prev.todaySleepQuality) : prev.todaySleepQuality,
          sleepChart: updatedChart,
        };
      });
    }

    // Immediately close modal and notify user
    setIsModalOpen(false);
    toast.success("Activity & sleep logged successfully!");

    setIsSaving(true);
    try {
      const res = await fetch("/api/fitness/log-activity-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: logDate,
          steps: parsedSteps,
          sleepHours: parsedSleep,
          sleepQuality: sleepHoursInput ? sleepQualityInput : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to save log");
      }

      // Re-fetch parent aggregated data to update streak, consistency score, etc.
      if (onRefresh) {
        await onRefresh();
      }
      router.refresh();
    } catch (err: any) {
      console.error("Save activity/sleep error:", err);
      toast.error(err.message || "Failed to save log");
      // Revert to props on failure
      setLocalActivity(activity);
      setLocalRecovery(recovery);
    } finally {
      setIsSaving(false);
    }
  };

  // 7-day fallback data if empty
  const defaultChartData = [
    { day: "M", fullDay: "Mon", isToday: false, logged: false },
    { day: "T", fullDay: "Tue", isToday: false, logged: false },
    { day: "W", fullDay: "Wed", isToday: false, logged: false },
    { day: "T", fullDay: "Thu", isToday: false, logged: false },
    { day: "F", fullDay: "Fri", isToday: true, logged: false },
    { day: "S", fullDay: "Sat", isToday: false, logged: false },
    { day: "S", fullDay: "Sun", isToday: false, logged: false },
  ];

  const stepsData =
    localActivity.stepsChart && localActivity.stepsChart.length > 0
      ? localActivity.stepsChart
      : defaultChartData.map((d) => ({ ...d, steps: 0, target: localActivity.stepTarget || 8000 }));

  const sleepData =
    localRecovery.sleepChart && localRecovery.sleepChart.length > 0
      ? localRecovery.sleepChart
      : defaultChartData.map((d) => ({ ...d, hours: 0, quality: 0, target: localRecovery.sleepTargetHours || 8 }));

  const currentSteps =
    localActivity.todaySteps !== undefined && localActivity.todaySteps > 0
      ? localActivity.todaySteps
      : localActivity.averageDailySteps;

  const currentSleep =
    localRecovery.todaySleepHours !== undefined && localRecovery.todaySleepHours > 0
      ? localRecovery.todaySleepHours
      : localRecovery.averageSleepHours;

  const stepPercentage =
    localActivity.stepTarget > 0 ? Math.min(100, Math.round((currentSteps / localActivity.stepTarget) * 100)) : 0;
  const sleepPercentage =
    localRecovery.sleepTargetHours > 0 ? Math.min(100, Math.round((currentSleep / localRecovery.sleepTargetHours) * 100)) : 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Activity & Recovery
        </h2>
        <button
          type="button"
          onClick={() => openLogModal("steps")}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#ADFF00]/10 border border-[#ADFF00]/30 text-[#ADFF00] hover:bg-[#ADFF00]/20 transition-colors text-[10px] font-black uppercase tracking-wider active:scale-95 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Log Today</span>
        </button>
      </div>

      {/* 2 Main Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Activity (Steps) Card */}
        <div
          onClick={() => openLogModal("steps")}
          className="w-full bg-[#111A10] border border-white/5 hover:border-emerald-400/25 transition-all duration-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm cursor-pointer group"
          title="Click to log steps"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Steps</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-400/10 text-emerald-300 border border-emerald-400/20">
                {stepPercentage}%
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-black text-white leading-none">
                {currentSteps.toLocaleString()}
                <span className="text-[10px] text-white/60 font-bold ml-0.5">steps</span>
              </span>
              <span className="text-[9px] font-bold text-white/40 tracking-wider">
                / {activity.stepTarget.toLocaleString()} goal
              </span>
            </div>

            <div className="text-[9px] font-semibold text-white/40 mb-3 flex items-center justify-between">
              <span>
                {activity.todaySteps && activity.todaySteps > 0 ? "Today's Steps" : "Daily Average"}
                {activity.averageDailySteps > 0 && activity.todaySteps !== undefined && (
                  <span className="text-white/30 ml-1">· Avg: {activity.averageDailySteps.toLocaleString()}</span>
                )}
              </span>
            </div>
          </div>

          {/* 7-Day Bar Chart */}
          <div className="w-full flex flex-col gap-1.5 mt-2">
            <div className="w-full h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stepsData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      backgroundColor: "#0A1108",
                      border: "1px solid rgba(52,211,153,0.3)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                    itemStyle={{ color: "#34d399" }}
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString()} steps`, "Steps"]}
                    labelFormatter={(_, items) => {
                      const item = items?.[0]?.payload;
                      return item?.fullDay ? `${item.fullDay} ${item.date ? `(${item.date})` : ""}` : "";
                    }}
                  />
                  <Bar dataKey="steps" radius={[4, 4, 0, 0]} minPointSize={4}>
                    {stepsData.map((entry: any, index: number) => (
                      <Cell
                        key={`step-cell-${index}`}
                        fill={entry.steps > 0 ? "#34d399" : "rgba(255,255,255,0.06)"}
                        stroke={entry.isToday ? "#ADFF00" : "none"}
                        strokeWidth={entry.isToday ? 1.5 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekday Labels */}
            <div className="flex justify-between px-1 text-[8px] font-black tracking-widest uppercase">
              {stepsData.map((d: any, index: number) => (
                <span
                  key={index}
                  className={
                    d.isToday
                      ? "text-[#ADFF00] font-black"
                      : d.steps > 0
                      ? "text-emerald-400/80 font-bold"
                      : "text-white/30"
                  }
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Recovery (Sleep) Card */}
        <div
          onClick={() => openLogModal("sleep")}
          className="w-full bg-[#111A10] border border-white/5 hover:border-indigo-400/25 transition-all duration-200 rounded-2xl p-4 flex flex-col justify-between shadow-sm cursor-pointer group"
          title="Click to log sleep"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Moon className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Sleep</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-400/10 text-indigo-300 border border-indigo-400/20">
                {sleepPercentage}%
              </span>
            </div>

            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-black text-white leading-none">
                {currentSleep}
                <span className="text-[10px] text-white/60 font-bold ml-0.5">hrs</span>
              </span>
              <span className="text-[9px] font-bold text-white/40 tracking-wider">
                / {recovery.sleepTargetHours}h target
              </span>
            </div>

            <div className="text-[9px] font-semibold text-white/40 mb-3 flex items-center justify-between">
              <span>
                {recovery.todaySleepHours && recovery.todaySleepHours > 0 ? "Today's Sleep" : "Daily Average"}
                {recovery.averageSleepHours > 0 && recovery.todaySleepHours !== undefined && (
                  <span className="text-white/30 ml-1">· Avg: {recovery.averageSleepHours}h</span>
                )}
              </span>
            </div>
          </div>

          {/* 7-Day Bar Chart */}
          <div className="w-full flex flex-col gap-1.5 mt-2">
            <div className="w-full h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sleepData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip
                    cursor={{ fill: "rgba(255,255,255,0.03)" }}
                    contentStyle={{
                      backgroundColor: "#0A1108",
                      border: "1px solid rgba(129,140,248,0.3)",
                      borderRadius: "12px",
                      color: "#fff",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                    itemStyle={{ color: "#818cf8" }}
                    formatter={(val: any) => [`${Number(val || 0)} hrs`, "Sleep Duration"]}
                    labelFormatter={(_, items) => {
                      const item = items?.[0]?.payload;
                      const qualityText = item?.quality ? ` · Quality: ${item.quality}%` : "";
                      return item?.fullDay ? `${item.fullDay} ${item.date ? `(${item.date})` : ""}${qualityText}` : "";
                    }}
                  />
                  <Bar dataKey="hours" radius={[4, 4, 0, 0]} minPointSize={4}>
                    {sleepData.map((entry: any, index: number) => (
                      <Cell
                        key={`sleep-cell-${index}`}
                        fill={entry.hours > 0 ? "#818cf8" : "rgba(255,255,255,0.06)"}
                        stroke={entry.isToday ? "#ADFF00" : "none"}
                        strokeWidth={entry.isToday ? 1.5 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekday Labels */}
            <div className="flex justify-between px-1 text-[8px] font-black tracking-widest uppercase">
              {sleepData.map((d: any, index: number) => (
                <span
                  key={index}
                  className={
                    d.isToday
                      ? "text-[#ADFF00] font-black"
                      : d.hours > 0
                      ? "text-indigo-400/80 font-bold"
                      : "text-white/30"
                  }
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recovery & Rest Status Sub-bar */}
      <div className="w-full bg-[#111A10] border border-white/5 rounded-xl px-3.5 py-2.5 flex items-center justify-between text-[10px]">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white/50 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ADFF00]" />
            Rest Days This Week:
          </span>
          <span className="font-black text-white">
            {recovery.restDays} {recovery.restDays === 1 ? "Day" : "Days"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-white/50 uppercase tracking-wider">
            Sleep Quality:
          </span>
          <span className="font-mono font-bold text-indigo-300 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">
            {recovery.todaySleepQuality && recovery.todaySleepQuality > 0
              ? `${recovery.todaySleepQuality}% (Today)`
              : recovery.averageSleepQuality > 0
              ? `${recovery.averageSleepQuality}% (Avg)`
              : "Not logged"}
          </span>
        </div>
      </div>

      {/* Interactive Quick Log Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="w-full max-w-md bg-[#0D140C] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4 text-white animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">⚡</span>
                <h3 className="text-sm font-black tracking-widest text-white uppercase">
                  Log Activity & Recovery
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveLogs} className="flex flex-col gap-4">
              {/* Date Quick Selector */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  Select Date
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setLogDate(todayStr)}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      logDate === todayStr
                        ? "bg-[#ADFF00] text-black shadow-md shadow-[#ADFF00]/20"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const y = new Date();
                      y.setDate(y.getDate() - 1);
                      setLogDate(y.toISOString().split("T")[0]);
                    }}
                    className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      logDate !== todayStr
                        ? "bg-[#ADFF00] text-black shadow-md shadow-[#ADFF00]/20"
                        : "bg-white/5 text-white/70 hover:bg-white/10 border border-white/5"
                    }`}
                  >
                    Yesterday
                  </button>
                  <input
                    type="date"
                    value={logDate}
                    max={todayStr}
                    onChange={(e) => setLogDate(e.target.value)}
                    className="w-32 bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-[#ADFF00]"
                  />
                </div>
              </div>

              {/* Tab Selector: Steps vs Sleep */}
              <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab("steps")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "steps"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Footprints className="w-3.5 h-3.5" />
                  Daily Steps
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("sleep")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "sleep"
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "text-white/50 hover:text-white"
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  Sleep & Recovery
                </button>
              </div>

              {/* Steps Tab Content */}
              {activeTab === "steps" && (
                <div className="flex flex-col gap-3 p-3 bg-[#111A10] border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <Footprints className="w-4 h-4" /> Steps Count
                    </span>
                    <span className="text-[10px] text-white/40">Goal: {activity.stepTarget.toLocaleString()}</span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 7500"
                      value={stepsInput}
                      onChange={(e) => setStepsInput(e.target.value)}
                      className="w-full bg-[#0A1108] border border-white/10 rounded-xl px-3.5 py-2.5 text-base font-black text-white focus:outline-none focus:border-emerald-400 placeholder:text-white/20"
                      autoFocus
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-white/40">steps</span>
                  </div>

                  {/* Quick Preset Chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { label: "+1,000", val: 1000, add: true },
                      { label: "+2,500", val: 2500, add: true },
                      { label: "5,000", val: 5000 },
                      { label: "7,000", val: 7000 },
                      { label: "10,000", val: 10000 },
                    ].map((chip, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          if (chip.add) {
                            setStepsInput((prev) => String((Number(prev) || 0) + chip.val));
                          } else {
                            setStepsInput(String(chip.val));
                          }
                        }}
                        className="text-[10px] font-bold px-2 py-1 rounded bg-white/5 border border-white/5 text-white/70 hover:bg-emerald-400/20 hover:text-emerald-300 hover:border-emerald-400/30 transition-colors"
                      >
                        {chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sleep Tab Content */}
              {activeTab === "sleep" && (
                <div className="flex flex-col gap-3 p-3 bg-[#111A10] border border-white/5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Moon className="w-4 h-4" /> Sleep Duration
                    </span>
                    <span className="text-[10px] text-white/40">Target: {recovery.sleepTargetHours} hours</span>
                  </div>

                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      placeholder="e.g. 7.5"
                      value={sleepHoursInput}
                      onChange={(e) => setSleepHoursInput(e.target.value)}
                      className="w-full bg-[#0A1108] border border-white/10 rounded-xl px-3.5 py-2.5 text-base font-black text-white focus:outline-none focus:border-indigo-400 placeholder:text-white/20"
                      autoFocus
                    />
                    <span className="absolute right-3 top-3 text-xs font-bold text-white/40">hours</span>
                  </div>

                  {/* Sleep Duration Presets */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[6, 6.5, 7, 7.5, 8, 8.5, 9].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setSleepHoursInput(String(hrs))}
                        className={`text-[10px] font-bold px-2 py-1 rounded transition-colors ${
                          sleepHoursInput === String(hrs)
                            ? "bg-indigo-400/20 text-indigo-300 border border-indigo-400/40"
                            : "bg-white/5 border border-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {hrs}h
                      </button>
                    ))}
                  </div>

                  {/* Sleep Quality */}
                  <div className="flex flex-col gap-1.5 mt-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-white/60 uppercase">
                      <span>Sleep Quality</span>
                      <span className="text-indigo-400 font-mono">{sleepQualityInput * 10}%</span>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { label: "Poor", rating: 3, icon: "😴" },
                        { label: "Fair", rating: 6, icon: "😐" },
                        { label: "Good", rating: 8, icon: "😊" },
                        { label: "Great", rating: 10, icon: "⚡" },
                      ].map((q) => (
                        <button
                          key={q.label}
                          type="button"
                          onClick={() => setSleepQualityInput(q.rating)}
                          className={`py-1.5 px-1 rounded-lg flex flex-col items-center gap-0.5 text-[9px] font-bold transition-all ${
                            sleepQualityInput === q.rating
                              ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/40"
                              : "bg-white/5 text-white/50 hover:bg-white/10 border border-transparent"
                          }`}
                        >
                          <span className="text-sm">{q.icon}</span>
                          <span>{q.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 rounded-xl bg-[#ADFF00] hover:bg-[#baff22] text-black text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-[#ADFF00]/20 disabled:opacity-50 cursor-pointer"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Log</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

