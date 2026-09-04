"use client";

import { useState, useMemo } from "react";
import { WeightPoint } from "@/types/fitness/analytics";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { Plus, Target, CalendarDays, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

export function WeightChart({ data, targetWeight }: { data: WeightPoint[], targetWeight: number | null }) {
  const [viewMode, setViewMode] = useState<"daily" | "weekly">("daily");
  const [scaleMode, setScaleMode] = useState<"focus" | "target">("focus");

  // Weekly average aggregator
  const weeklyData = useMemo(() => {
    if (data.length === 0) return [];

    const weekMap = new Map<string, { sum: number; count: number; lastDate: string }>();

    for (const p of data) {
      const d = new Date(p.date + "T00:00:00");
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
      const monday = new Date(d.setDate(diff));
      const weekKey = monday.toISOString().split("T")[0];

      const current = weekMap.get(weekKey) || { sum: 0, count: 0, lastDate: p.date };
      current.sum += p.weight;
      current.count += 1;
      current.lastDate = p.date;
      weekMap.set(weekKey, current);
    }

    return Array.from(weekMap.entries())
      .map(([_, val]) => ({
        date: val.lastDate,
        weight: Math.round((val.sum / val.count) * 10) / 10
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  const activeData = viewMode === "weekly" ? weeklyData : data;

  // Domain computation
  const { minWeight, maxWeight, changeDiff, latestWeight } = useMemo(() => {
    if (activeData.length === 0) {
      return { minWeight: 60, maxWeight: 80, changeDiff: 0, latestWeight: 0 };
    }

    const weights = activeData.map(d => d.weight);
    const firstWeight = weights[0];
    const lastWeight = weights[weights.length - 1];
    const diff = Math.round((lastWeight - firstWeight) * 10) / 10;

    let min = Math.min(...weights);
    let max = Math.max(...weights);

    if (scaleMode === "target" && targetWeight) {
      min = Math.min(min, targetWeight);
      max = Math.max(max, targetWeight);
    }

    let minDomain = Math.floor(min - 1);
    let maxDomain = Math.ceil(max + 1);

    // If range is very small, give it enough vertical headroom so slope is natural
    if (maxDomain - minDomain < 3) {
      minDomain = Math.floor(min - 1.5);
      maxDomain = Math.ceil(max + 1.5);
    }

    return {
      minWeight: minDomain,
      maxWeight: maxDomain,
      changeDiff: diff,
      latestWeight: lastWeight
    };
  }, [activeData, scaleMode, targetWeight]);

  if (data.length === 0) {
    return (
      <div className="w-full flex flex-col gap-3">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Weight History
        </h2>
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center h-48">
          <p className="text-sm font-bold text-white/60 mb-2">No weight history yet</p>
          <Link href="/progress/log-weight" className="flex items-center gap-2 px-4 py-2 bg-[#ADFF00]/10 text-[#ADFF00] rounded-xl font-black text-xs uppercase tracking-widest border border-[#ADFF00]/20 hover:bg-[#ADFF00]/20 transition-colors">
            <Plus className="w-3 h-3" /> Log Weight
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header with Title & Log Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Weight History
        </h2>
        <Link href="/progress/log-weight" className="flex items-center gap-1 text-[#ADFF00] font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">
          <Plus className="w-3 h-3" /> Log
        </Link>
      </div>

      <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 pt-5 flex flex-col gap-4 shadow-xl">
        {/* Sub-header: Current Stats + Daily/Weekly & Focus/Target Toggles */}
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-lg font-black text-white">
              {latestWeight.toFixed(1)} <span className="text-xs text-white/40 font-bold">kg</span>
            </span>
            {changeDiff !== 0 && (
              <span className={`text-[11px] font-bold flex items-center gap-0.5 ${changeDiff < 0 ? "text-[#ADFF00]" : "text-amber-400"}`}>
                {changeDiff < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {changeDiff > 0 ? `+${changeDiff}` : changeDiff} kg
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Daily vs Weekly Toggle */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/5 text-[10px] font-bold uppercase tracking-wider">
              <button
                onClick={() => setViewMode("daily")}
                className={`px-2 py-1 rounded-md transition-all ${
                  viewMode === "daily" ? "bg-[#ADFF00] text-black" : "text-white/50 hover:text-white"
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setViewMode("weekly")}
                className={`px-2 py-1 rounded-md transition-all ${
                  viewMode === "weekly" ? "bg-[#ADFF00] text-black" : "text-white/50 hover:text-white"
                }`}
              >
                Weekly
              </button>
            </div>

            {/* Focus vs Target Toggle */}
            {targetWeight && (
              <button
                onClick={() => setScaleMode(scaleMode === "focus" ? "target" : "focus")}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                  scaleMode === "target"
                    ? "bg-[#ADFF00]/10 border-[#ADFF00]/40 text-[#ADFF00]"
                    : "bg-white/5 border-white/5 text-white/40 hover:text-white"
                }`}
                title="Toggle Goal Target line"
              >
                Goal {targetWeight}kg
              </button>
            )}
          </div>
        </div>

        {/* Chart Container */}
        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={activeData} margin={{ top: 8, right: 12, left: -25, bottom: 0 }}>
              <XAxis 
                dataKey="date" 
                tickFormatter={(val) => {
                  try {
                    const parts = String(val).split("-");
                    if (parts.length === 3) {
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const day = parseInt(parts[2], 10);
                      const monthIdx = parseInt(parts[1], 10) - 1;
                      return `${day} ${months[monthIdx] || ""}`;
                    }
                    return val;
                  } catch {
                    return val;
                  }
                }}
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis 
                domain={[minWeight, maxWeight]}
                stroke="rgba(255,255,255,0.1)"
                tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
                dx={-5}
                tickFormatter={(val) => `${Math.round(val)}`}
              />
              <Tooltip
                formatter={(value: any) => [`${Number(value).toFixed(1)} kg`, viewMode === "weekly" ? "Weekly Avg" : "Weight"]}
                labelFormatter={(label: any) => {
                  try {
                    const parts = String(label).split("-");
                    if (parts.length === 3) {
                      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                      const day = parseInt(parts[2], 10);
                      const monthIdx = parseInt(parts[1], 10) - 1;
                      const year = parts[0];
                      return `${day} ${months[monthIdx] || ""} ${year}`;
                    }
                    return label;
                  } catch {
                    return label;
                  }
                }}
                contentStyle={{ backgroundColor: "#0A1108", border: "1px solid rgba(173,255,0,0.3)", borderRadius: "12px", color: "#fff", fontSize: "12px", fontWeight: 700 }}
                itemStyle={{ color: "#ADFF00" }}
                labelStyle={{ color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}
              />
              {scaleMode === "target" && targetWeight && (
                <ReferenceLine 
                  y={targetWeight} 
                  stroke="#ADFF00" 
                  strokeDasharray="4 4" 
                  strokeOpacity={0.6}
                  label={{
                    value: `Goal: ${targetWeight} kg`,
                    fill: "#ADFF00",
                    fontSize: 10,
                    fontWeight: 800,
                    position: "insideBottomRight",
                    offset: 8
                  }}
                />
              )}
              <Line 
                type="monotone" 
                dataKey="weight" 
                stroke="#ADFF00" 
                strokeWidth={3}
                dot={{ fill: "#0A1108", stroke: "#ADFF00", strokeWidth: 2, r: 4 }}
                activeDot={{ fill: "#ADFF00", stroke: "#0A1108", strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Real-World Guidance Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40">
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3 h-3 text-[#ADFF00]/60" />
            Weigh in daily (morning fasted)
          </span>
          <span>
            {viewMode === "daily" ? "Showing daily logs" : "Showing 7-day moving averages"}
          </span>
        </div>
      </div>
    </div>
  );
}
