"use client";

import { NutritionAnalytics } from "@/types/fitness/analytics";
import { Apple, Beef } from "lucide-react";
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from "recharts";

export function NutritionAnalyticsCard({ metrics }: { metrics: NutritionAnalytics }) {
  // Fake chart data if empty for demo
  const calorieData = metrics.calorieChart.length > 0 ? metrics.calorieChart : [
    { day: "M", calories: 2400, target: 2500 },
    { day: "T", calories: 2600, target: 2500 },
    { day: "W", calories: 2450, target: 2500 },
    { day: "T", calories: 2300, target: 2500 },
    { day: "F", calories: 2550, target: 2500 },
    { day: "S", calories: 2800, target: 2500 },
    { day: "S", calories: 2400, target: 2500 },
  ];

  return (
    <div className="w-full flex flex-col gap-3">
      <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
        Nutrition Analytics
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Calories Card */}
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Apple className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Calories</span>
          </div>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-xl font-black text-white leading-none">{metrics.averageCalories}</span>
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">/ {metrics.calorieTarget}</span>
          </div>
          
          <div className="w-full h-16 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calorieData}>
                <defs>
                  <linearGradient id="calColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="calories" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#calColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Protein Card */}
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col">
          <div className="flex items-center gap-1.5 mb-2">
            <Beef className="w-4 h-4 text-red-400" />
            <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Protein</span>
          </div>
          <div className="flex items-end gap-1 mb-4">
            <span className="text-xl font-black text-white leading-none">{metrics.averageProtein}g</span>
            <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest mb-0.5">/ {metrics.proteinTarget}g</span>
          </div>
          
          <div className="w-full h-16 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={calorieData}> {/* Using calorieData structure for demo */}
                <defs>
                  <linearGradient id="proColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="calories" stroke="#f87171" strokeWidth={2} fillOpacity={1} fill="url(#proColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
