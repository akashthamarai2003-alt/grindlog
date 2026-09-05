"use client";

import React, { useState, useMemo } from "react";
import { 
  Flame, 
  Dumbbell, 
  Wheat, 
  Shield, 
  Droplet, 
  UtensilsCrossed, 
  CheckCircle2, 
  Check, 
  Sparkles 
} from "lucide-react";

interface MetricItem {
  id: string;
  label: string;
  consumed: number;
  target: number;
  unit: string;
  percent: number;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeColor: string;
  progressGradient: string;
  isCompleted: boolean;
  isSurplus?: boolean;
}

interface TodaySummaryCardProps {
  consumed?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    water_ml?: number;
  };
  targets?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    water_ml?: number;
  };
  meals?: any[];
  loggedFoods?: any[];
  nutritionScore?: number;
}

export function TodaySummaryCard({
  consumed = {},
  targets = {},
  meals = [],
  loggedFoods = [],
  nutritionScore = 0,
}: TodaySummaryCardProps) {
  // Toggle between Core 4 metrics (Calories, Protein, Water, Meals) and Full 6 metrics (+ Carbs, Fat)
  const [viewMode, setViewMode] = useState<"core" | "detailed">("detailed");

  // Numerical computations with strict integer rounding to prevent decimal overflow
  const targetCals = Math.max(1, Math.round(Number(targets.calories) || 2000));
  const targetPro = Math.max(1, Math.round(Number(targets.protein) || 130));
  const targetCarbs = Math.max(1, Math.round(Number(targets.carbs) || 225));
  const targetFat = Math.max(1, Math.round(Number(targets.fat) || 55));
  const targetWater = Math.max(1, Math.round(Number(targets.water_ml) || 2500));

  const consumedCals = Math.round(Number(consumed.calories) || 0);
  const consumedPro = Math.round(Number(consumed.protein) || 0);
  const consumedCarbs = Math.round(Number(consumed.carbs) || 0);
  const consumedFat = Math.round(Number(consumed.fat) || 0);
  const consumedWater = Math.round(Number(consumed.water_ml) || 0);

  // Meals tracking: calculate how many planned meals or meal categories have logged foods
  const plannedMealsList = Array.isArray(meals) ? meals : [];
  const plannedCount = plannedMealsList.length > 0 ? plannedMealsList.length : 3;

  const loggedMealTypes = useMemo(() => {
    const types = new Set<string>();
    loggedFoods.forEach((f: any) => {
      if (f?.meal_type) types.add(f.meal_type.toLowerCase());
    });
    return types;
  }, [loggedFoods]);

  const completedMealsCount = useMemo(() => {
    if (plannedMealsList.length > 0) {
      return plannedMealsList.filter((m: any) => 
        loggedMealTypes.has(String(m?.meal_type || "").toLowerCase())
      ).length;
    }
    return loggedMealTypes.size;
  }, [plannedMealsList, loggedMealTypes]);

  // Percentage calculations capped at 100% for progress visual
  const calsPercent = Math.round((consumedCals / targetCals) * 100);
  const proPercent = Math.round((consumedPro / targetPro) * 100);
  const carbsPercent = Math.round((consumedCarbs / targetCarbs) * 100);
  const fatPercent = Math.round((consumedFat / targetFat) * 100);
  const waterPercent = Math.round((consumedWater / targetWater) * 100);
  const mealsPercent = Math.round((completedMealsCount / plannedCount) * 100);

  // Metrics definitions with dedicated themes and resilient zero-overlap hierarchy
  const allMetrics: MetricItem[] = useMemo(() => [
    {
      id: "calories",
      label: "Calories",
      consumed: consumedCals,
      target: targetCals,
      unit: "kcal",
      percent: calsPercent,
      icon: <Flame size={15} />,
      iconBg: "bg-orange-500/10 border border-orange-500/25",
      iconColor: "text-orange-400",
      badgeBg: calsPercent >= 100 ? "bg-amber-400/15 border border-amber-400/30" : "bg-white/5 border border-white/5",
      badgeColor: calsPercent >= 100 ? "text-amber-300 font-bold" : "text-white/60",
      progressGradient: calsPercent > 100 ? "from-amber-400 to-rose-500" : "from-orange-500/70 to-orange-400",
      isCompleted: calsPercent >= 95 && calsPercent <= 110,
      isSurplus: calsPercent > 110,
    },
    {
      id: "protein",
      label: "Protein",
      consumed: consumedPro,
      target: targetPro,
      unit: "g",
      percent: proPercent,
      icon: <Dumbbell size={15} />,
      iconBg: "bg-[#ADFF00]/10 border border-[#ADFF00]/25",
      iconColor: "text-[#ADFF00]",
      badgeBg: proPercent >= 100 ? "bg-[#ADFF00]/15 border border-[#ADFF00]/30" : "bg-white/5 border border-white/5",
      badgeColor: proPercent >= 100 ? "text-[#ADFF00] font-bold" : "text-white/60",
      progressGradient: "from-[#ADFF00]/70 to-[#ADFF00]",
      isCompleted: proPercent >= 100,
    },
    {
      id: "carbs",
      label: "Carbs",
      consumed: consumedCarbs,
      target: targetCarbs,
      unit: "g",
      percent: carbsPercent,
      icon: <Wheat size={15} />,
      iconBg: "bg-sky-500/10 border border-sky-500/25",
      iconColor: "text-sky-400",
      badgeBg: carbsPercent >= 100 ? "bg-sky-400/15 border border-sky-400/30" : "bg-white/5 border border-white/5",
      badgeColor: carbsPercent >= 100 ? "text-sky-300 font-bold" : "text-white/60",
      progressGradient: "from-sky-500/70 to-sky-400",
      isCompleted: carbsPercent >= 100,
    },
    {
      id: "fat",
      label: "Fat",
      consumed: consumedFat,
      target: targetFat,
      unit: "g",
      percent: fatPercent,
      icon: <Shield size={15} />,
      iconBg: "bg-yellow-500/10 border border-yellow-500/25",
      iconColor: "text-yellow-400",
      badgeBg: fatPercent >= 100 ? "bg-yellow-400/15 border border-yellow-400/30" : "bg-white/5 border border-white/5",
      badgeColor: fatPercent >= 100 ? "text-yellow-300 font-bold" : "text-white/60",
      progressGradient: "from-yellow-500/70 to-yellow-400",
      isCompleted: fatPercent >= 100,
    },
    {
      id: "water",
      label: "Water",
      consumed: Math.min(targetWater, consumedWater),
      target: targetWater,
      unit: "ml",
      percent: waterPercent,
      icon: <Droplet size={15} />,
      iconBg: "bg-cyan-500/10 border border-cyan-500/25",
      iconColor: "text-cyan-400",
      badgeBg: waterPercent >= 100 ? "bg-cyan-400/15 border border-cyan-400/30" : "bg-white/5 border border-white/5",
      badgeColor: waterPercent >= 100 ? "text-cyan-300 font-bold" : "text-white/60",
      progressGradient: "from-cyan-500/70 to-cyan-400",
      isCompleted: waterPercent >= 100,
    },
    {
      id: "meals",
      label: "Meals",
      consumed: completedMealsCount,
      target: plannedCount,
      unit: "done",
      percent: mealsPercent,
      icon: <UtensilsCrossed size={15} />,
      iconBg: "bg-emerald-500/10 border border-emerald-500/25",
      iconColor: "text-emerald-400",
      badgeBg: completedMealsCount >= plannedCount ? "bg-emerald-400/15 border border-emerald-400/30" : "bg-white/5 border border-white/5",
      badgeColor: completedMealsCount >= plannedCount ? "text-emerald-300 font-bold" : "text-white/60",
      progressGradient: "from-emerald-500/70 to-emerald-400",
      isCompleted: completedMealsCount >= plannedCount && plannedCount > 0,
    },
  ], [
    consumedCals, targetCals, calsPercent,
    consumedPro, targetPro, proPercent,
    consumedCarbs, targetCarbs, carbsPercent,
    consumedFat, targetFat, fatPercent,
    consumedWater, targetWater, waterPercent,
    completedMealsCount, plannedCount, mealsPercent
  ]);

  // Displayed items based on toggle: Core 4 (Calories, Protein, Water, Meals) or Full 6
  const displayedMetrics = useMemo(() => {
    if (viewMode === "core") {
      return allMetrics.filter((m) => ["calories", "protein", "water", "meals"].includes(m.id));
    }
    return allMetrics;
  }, [viewMode, allMetrics]);

  // Goals completed count
  const goalsHitCount = useMemo(() => {
    return displayedMetrics.filter((m) => m.percent >= 90).length;
  }, [displayedMetrics]);

  return (
    <div className="mt-8 mb-4">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#ADFF00] animate-pulse" />
          <h2 className="text-[13px] font-black tracking-widest text-white uppercase">
            Today&apos;s Summary
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle: Core (4) vs Detailed (6) */}
          <div className="flex items-center bg-black/40 p-0.5 rounded-full border border-white/10">
            <button
              type="button"
              onClick={() => setViewMode("core")}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === "core"
                  ? "bg-white/15 text-white font-black"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              Core (4)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("detailed")}
              className={`text-[10px] font-bold px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                viewMode === "detailed"
                  ? "bg-[#ADFF00] text-black font-black shadow-[0_0_10px_rgba(173,255,0,0.3)]"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              All (6)
            </button>
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-4 sm:p-5 relative overflow-hidden shadow-xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#ADFF00]/5 blur-[50px] rounded-full pointer-events-none" />

        {/* Top Adherence Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/5 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-white/50 uppercase tracking-wider">
              Daily Target Completion
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[#ADFF00]">
              {goalsHitCount}/{displayedMetrics.length} Met
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-white/40">
            <Sparkles size={12} className="text-[#ADFF00]" />
            <span>Score: <strong className="text-white font-black">{nutritionScore}</strong></span>
          </div>
        </div>

        {/* Dynamic Metric Tiles Grid - Immune to text wrapping or overflow */}
        <div className={`grid gap-3 relative z-10 ${
          viewMode === "core" 
            ? "grid-cols-2" 
            : "grid-cols-2 sm:grid-cols-3"
        }`}>
          {displayedMetrics.map((item) => (
            <div
              key={item.id}
              className="bg-[#0A1108] border border-white/5 rounded-2xl p-3.5 flex flex-col justify-between hover:border-white/15 transition-all group relative overflow-hidden"
            >
              {/* Subtle hover background sheen */}
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Tier 1: Header (Icon + Label + Percentage Pill) */}
              <div className="flex items-center justify-between gap-1.5 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg} ${item.iconColor}`}>
                    {item.icon}
                  </div>
                  <span className="text-[11px] font-black text-white/70 uppercase tracking-wider truncate">
                    {item.label}
                  </span>
                </div>

                <span className={`text-[10px] px-1.5 py-0.5 rounded-md shrink-0 flex items-center gap-0.5 ${item.badgeBg} ${item.badgeColor}`}>
                  {item.isCompleted && <Check size={10} className="stroke-[3]" />}
                  <span>{item.percent}%</span>
                </span>
              </div>

              {/* Tier 2: Dedicated Value Row - Full width prevents any text wrapping */}
              <div className="flex items-baseline justify-between gap-1 mb-2.5">
                <span className="text-lg sm:text-xl font-black text-white tracking-tight leading-none whitespace-nowrap">
                  {item.consumed.toLocaleString()}
                </span>
                <span className="text-[11px] font-bold text-white/40 leading-none whitespace-nowrap">
                  / {item.target.toLocaleString()}{item.unit ? ` ${item.unit}` : ""}
                </span>
              </div>

              {/* Tier 3: Smooth Progress Bar Track */}
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden p-0">
                <div
                  className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${item.progressGradient}`}
                  style={{ width: `${Math.min(100, Math.max(0, item.percent))}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Insight Footer */}
        <div className="mt-3.5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/40 relative z-10">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-[#ADFF00]" />
            <span>Updated live from your daily food & water logs</span>
          </span>
          <span className="text-white/30 hidden sm:inline">
            Zero-overlap responsive architecture
          </span>
        </div>
      </div>
    </div>
  );
}
