"use client";

import { NutritionAnalytics } from "@/types/fitness/analytics";
import { Apple, Beef, Flame, Sparkles } from "lucide-react";
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from "recharts";

export function NutritionAnalyticsCard({ metrics }: { metrics: NutritionAnalytics }) {
  const calorieData = metrics.calorieChart && metrics.calorieChart.length > 0 ? metrics.calorieChart : [
    { day: "M", fullDay: "Mon", calories: 0, target: 2000, isToday: false, logged: false },
    { day: "T", fullDay: "Tue", calories: 0, target: 2000, isToday: false, logged: false },
    { day: "W", fullDay: "Wed", calories: 0, target: 2000, isToday: false, logged: false },
    { day: "T", fullDay: "Thu", calories: 0, target: 2000, isToday: false, logged: false },
    { day: "F", fullDay: "Fri", calories: 0, target: 2000, isToday: true, logged: false },
    { day: "S", fullDay: "Sat", calories: 0, target: 2000, isToday: false, logged: false },
    { day: "S", fullDay: "Sun", calories: 0, target: 2000, isToday: false, logged: false },
  ];

  const proteinData = metrics.proteinChart && metrics.proteinChart.length > 0 ? metrics.proteinChart : [
    { day: "M", fullDay: "Mon", protein: 0, target: 130, isToday: false, logged: false },
    { day: "T", fullDay: "Tue", protein: 0, target: 130, isToday: false, logged: false },
    { day: "W", fullDay: "Wed", protein: 0, target: 130, isToday: false, logged: false },
    { day: "T", fullDay: "Thu", protein: 0, target: 130, isToday: false, logged: false },
    { day: "F", fullDay: "Fri", protein: 0, target: 130, isToday: true, logged: false },
    { day: "S", fullDay: "Sat", protein: 0, target: 130, isToday: false, logged: false },
    { day: "S", fullDay: "Sun", protein: 0, target: 130, isToday: false, logged: false },
  ];

  const currentCals = metrics.todayCalories !== undefined && metrics.todayCalories > 0
    ? metrics.todayCalories
    : metrics.averageCalories;

  const currentPro = metrics.todayProtein !== undefined && metrics.todayProtein > 0
    ? metrics.todayProtein
    : metrics.averageProtein;

  const calPercentage = metrics.calorieTarget > 0 ? Math.min(100, Math.round((currentCals / metrics.calorieTarget) * 100)) : 0;
  const proPercentage = metrics.proteinTarget > 0 ? Math.min(100, Math.round((currentPro / metrics.proteinTarget) * 100)) : 0;

  const carbsTarget = metrics.carbsTarget || 246;
  const fatTarget = metrics.fatTarget || 61;
  const todayCarbs = metrics.todayCarbs || 0;
  const todayFat = metrics.todayFat || 0;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">
          Nutrition Analytics
        </h2>
        {currentCals > 0 && (
          <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
            Today: <strong className="text-white font-black">{currentCals.toLocaleString()}</strong> / {metrics.calorieTarget.toLocaleString()} kcal
          </span>
        )}
      </div>

      {/* 2 Main Metric Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Calories Card */}
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Apple className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Calories</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                {calPercentage}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-black text-white leading-none">
                {currentCals.toLocaleString()}
                <span className="text-[10px] text-white/60 font-bold ml-0.5">kcal</span>
              </span>
              <span className="text-[9px] font-bold text-white/40 tracking-wider">/ {metrics.calorieTarget.toLocaleString()} kcal</span>
            </div>
            <div className="text-[9px] font-semibold text-white/40 mb-3">
              {metrics.todayCalories && metrics.todayCalories > 0 ? "Today's Intake" : "Daily Average"}
              {metrics.averageCalories > 0 && metrics.todayCalories !== undefined && (
                <span className="text-white/30 ml-1">· Avg: {metrics.averageCalories.toLocaleString()}</span>
              )}
            </div>
          </div>
          
          {/* 7-Day Bar Chart */}
          <div className="w-full flex flex-col gap-1.5 mt-2">
            <div className="w-full h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calorieData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#0A1108', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 700 }}
                    itemStyle={{ color: '#fbbf24' }}
                    formatter={(val: any) => [`${Number(val || 0).toLocaleString()} kcal`, "Calories"]}
                    labelFormatter={(_, items) => {
                      const item = items?.[0]?.payload;
                      return item?.fullDay ? `${item.fullDay} ${item.date ? `(${item.date})` : ''}` : '';
                    }}
                  />
                  <Bar dataKey="calories" radius={[4, 4, 0, 0]} minPointSize={4} isAnimationActive={false}>
                    {calorieData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cal-cell-${index}`} 
                        fill={entry.calories > 0 ? '#fbbf24' : 'rgba(255,255,255,0.06)'}
                        stroke={entry.isToday ? '#ADFF00' : 'none'}
                        strokeWidth={entry.isToday ? 1.5 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekday Labels */}
            <div className="flex justify-between px-1 text-[8px] font-black tracking-widest uppercase">
              {calorieData.map((d: any, index: number) => (
                <span 
                  key={index}
                  className={d.isToday ? "text-[#ADFF00] font-black" : d.calories > 0 ? "text-amber-400/80 font-bold" : "text-white/30"}
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Protein Card */}
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-4 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Beef className="w-4 h-4 text-red-400" />
                <span className="text-[10px] font-black tracking-widest text-white/50 uppercase">Protein</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-400/10 text-red-300 border border-red-400/20">
                {proPercentage}%
              </span>
            </div>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-xl font-black text-white leading-none">
                {currentPro}
                <span className="text-[10px] text-white/60 font-bold ml-0.5">g</span>
              </span>
              <span className="text-[9px] font-bold text-white/40 tracking-wider">/ {metrics.proteinTarget}g</span>
            </div>
            <div className="text-[9px] font-semibold text-white/40 mb-3">
              {metrics.todayProtein && metrics.todayProtein > 0 ? "Today's Intake" : "Daily Average"}
              {metrics.averageProtein > 0 && metrics.todayProtein !== undefined && (
                <span className="text-white/30 ml-1">· Avg: {metrics.averageProtein}g</span>
              )}
            </div>
          </div>
          
          {/* 7-Day Bar Chart */}
          <div className="w-full flex flex-col gap-1.5 mt-2">
            <div className="w-full h-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={proteinData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ backgroundColor: '#0A1108', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '12px', color: '#fff', fontSize: '11px', fontWeight: 700 }}
                    itemStyle={{ color: '#f87171' }}
                    formatter={(val: any) => [`${Number(val || 0)}g`, "Protein"]}
                    labelFormatter={(_, items) => {
                      const item = items?.[0]?.payload;
                      return item?.fullDay ? `${item.fullDay} ${item.date ? `(${item.date})` : ''}` : '';
                    }}
                  />
                  <Bar dataKey="protein" radius={[4, 4, 0, 0]} minPointSize={4} isAnimationActive={false}>
                    {proteinData.map((entry: any, index: number) => (
                      <Cell 
                        key={`pro-cell-${index}`} 
                        fill={entry.protein > 0 ? '#f87171' : 'rgba(255,255,255,0.06)'}
                        stroke={entry.isToday ? '#ADFF00' : 'none'}
                        strokeWidth={entry.isToday ? 1.5 : 0}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekday Labels */}
            <div className="flex justify-between px-1 text-[8px] font-black tracking-widest uppercase">
              {proteinData.map((d: any, index: number) => (
                <span 
                  key={index}
                  className={d.isToday ? "text-[#ADFF00] font-black" : d.protein > 0 ? "text-red-400/80 font-bold" : "text-white/30"}
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrient Distribution Breakdown */}
      {(todayCarbs > 0 || todayFat > 0 || currentPro > 0) && (
        <div className="w-full bg-[#111A10] border border-white/5 rounded-2xl p-3.5 sm:p-4 flex flex-col gap-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest text-white/60 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#ADFF00]" /> Today's Macronutrient Breakdown
            </span>
            <span className="text-[9px] font-mono font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded border border-[#ADFF00]/20">
              {currentCals.toLocaleString()} kcal logged
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Protein */}
            <div className="flex flex-col gap-1 bg-[#0A1108] p-2 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-red-400">🥩 Protein</span>
                <span className="text-white font-black">{currentPro}g</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-400 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, Math.round((currentPro / metrics.proteinTarget) * 100))}%` }} 
                />
              </div>
              <span className="text-[8px] text-white/40 text-right">Goal: {metrics.proteinTarget}g</span>
            </div>

            {/* Carbs */}
            <div className="flex flex-col gap-1 bg-[#0A1108] p-2 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-amber-400">🌾 Carbs</span>
                <span className="text-white font-black">{todayCarbs}g</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, Math.round((todayCarbs / carbsTarget) * 100))}%` }} 
                />
              </div>
              <span className="text-[8px] text-white/40 text-right">Goal: {carbsTarget}g</span>
            </div>

            {/* Fat */}
            <div className="flex flex-col gap-1 bg-[#0A1108] p-2 rounded-xl border border-white/5">
              <div className="flex items-center justify-between text-[9px] font-bold">
                <span className="text-sky-400">🥑 Fat</span>
                <span className="text-white font-black">{todayFat}g</span>
              </div>
              <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-400 rounded-full transition-all" 
                  style={{ width: `${Math.min(100, Math.round((todayFat / fatTarget) * 100))}%` }} 
                />
              </div>
              <span className="text-[8px] text-white/40 text-right">Goal: {fatTarget}g</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

