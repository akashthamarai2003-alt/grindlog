"use client";

import { motion } from "framer-motion";
import { Utensils, ArrowRight, CheckCircle2, Circle, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo } from "react";

interface TodaysNutritionCardProps {
  nutrition?: any; // The nutrition plan object from DB
  premiumLevel?: string;
  targetDateStr?: string;
}

export function TodaysNutritionCard({
  nutrition,
  premiumLevel = "core",
  targetDateStr,
}: TodaysNutritionCardProps) {
  // Determine effective date for persistent meal state keying
  const effectiveDate = useMemo(() => {
    if (targetDateStr && /^\d{4}-\d{2}-\d{2}$/.test(targetDateStr)) {
      return targetDateStr;
    }
    return new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  }, [targetDateStr]);

  const targetCalories = Number(nutrition?.daily_calories) > 0 ? Math.round(Number(nutrition.daily_calories)) : null;
  const targetProtein = Number(nutrition?.protein_grams) > 0 ? Math.round(Number(nutrition.protein_grams)) : null;

  // Derive target fats and carbs consistently with the backend formula
  const targetFats = useMemo(() => {
    if (Number(nutrition?.fat_grams) > 0) return Math.round(Number(nutrition.fat_grams));
    if (targetCalories) return Math.round((targetCalories * 0.25) / 9);
    return null;
  }, [nutrition?.fat_grams, targetCalories]);

  const targetCarbs = useMemo(() => {
    if (Number(nutrition?.carbs_grams) > 0) return Math.round(Number(nutrition.carbs_grams));
    if (targetCalories && targetProtein && targetFats) {
      return Math.max(0, Math.round((targetCalories - targetProtein * 4 - targetFats * 9) / 4));
    }
    return null;
  }, [nutrition?.carbs_grams, targetCalories, targetProtein, targetFats]);

  const rawMeals = Array.isArray(nutrition?.meals) ? nutrition.meals : [];
  const totalMealsCount = rawMeals.length || 1;

  // Process meals and assign realistic macros based on meal data or intelligent goal split
  const meals = useMemo(() => {
    return rawMeals.map((m: any, idx: number) => {
      const mealName = String(m.meal_name || m.name || `Meal ${idx + 1}`).trim();
      const timeStr = String(m.time_of_day || m.time || "").trim();

      // Normalize items list
      let itemsList: string[] = [];
      if (Array.isArray(m.items)) {
        itemsList = m.items.map((it: any) => String(it).trim()).filter(Boolean);
      } else if (typeof m.items === "string") {
        itemsList = m.items.split("+").map((it: string) => it.trim()).filter(Boolean);
      } else if (m.desc) {
        itemsList = String(m.desc).split("+").map((it: string) => it.trim()).filter(Boolean);
      }

      // Check explicit meal-level macros
      const explicitCalories = Number(m.total_calories ?? m.calories);
      const explicitProtein = Number(m.protein_grams ?? m.protein);
      const explicitCarbs = Number(m.carbs_grams ?? m.carbs);
      const explicitFats = Number(m.fat_grams ?? m.fats ?? m.fat);

      // Intelligent proportion based on meal type if explicit values are missing
      const nameLower = mealName.toLowerCase();
      let ratio = 1 / totalMealsCount;
      if (totalMealsCount >= 3) {
        if (nameLower.includes("breakfast")) ratio = 0.25;
        else if (nameLower.includes("lunch")) ratio = 0.35;
        else if (nameLower.includes("dinner")) ratio = 0.30;
        else if (nameLower.includes("snack") || nameLower.includes("pre") || nameLower.includes("post")) ratio = 0.10;
      }

      const mealCalories = explicitCalories > 0
        ? Math.round(explicitCalories)
        : (targetCalories ? Math.round(targetCalories * ratio) : 0);

      const mealProtein = explicitProtein > 0
        ? Math.round(explicitProtein)
        : (targetProtein ? Math.round(targetProtein * ratio) : 0);

      const mealCarbs = explicitCarbs > 0
        ? Math.round(explicitCarbs)
        : (targetCarbs ? Math.round(targetCarbs * ratio) : 0);

      const mealFats = explicitFats > 0
        ? Math.round(explicitFats)
        : (targetFats ? Math.round(targetFats * ratio) : 0);

      return {
        id: idx,
        name: mealName,
        time: timeStr,
        items: itemsList,
        desc: itemsList.length > 0 ? itemsList.join(" + ") : "Planned Meal",
        instructions: String(m.prep_instructions || m.notes || "").trim(),
        calories: mealCalories,
        protein: mealProtein,
        carbs: mealCarbs,
        fats: mealFats,
      };
    });
  }, [rawMeals, totalMealsCount, targetCalories, targetProtein, targetCarbs, targetFats]);

  // Persistent storage key per effective date
  const storageKey = `grindlog_meals_completed_${effectiveDate}`;
  const [completedMeals, setCompletedMeals] = useState<Record<number, boolean>>({});

  // Sync state with localStorage on mount or date change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCompletedMeals(JSON.parse(saved));
      } else {
        setCompletedMeals({});
      }
    } catch {
      setCompletedMeals({});
    }
  }, [storageKey]);

  const toggleMeal = (id: number) => {
    setCompletedMeals((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to persist completed meals:", err);
      }
      return next;
    });
  };

  // Real-world dynamic calculations: sum actual checked meal macros
  const completedCount = useMemo(() => {
    return Object.entries(completedMeals).filter(([id, completed]) => {
      const numId = Number(id);
      return completed && numId >= 0 && numId < meals.length;
    }).length;
  }, [completedMeals, meals.length]);

  const consumedCalories = useMemo(() => {
    return meals.reduce((acc: number, m: any) => (completedMeals[m.id] ? acc + m.calories : acc), 0);
  }, [meals, completedMeals]);

  const consumedProtein = useMemo(() => {
    return meals.reduce((acc: number, m: any) => (completedMeals[m.id] ? acc + m.protein : acc), 0);
  }, [meals, completedMeals]);

  const consumedCarbs = useMemo(() => {
    return meals.reduce((acc: number, m: any) => (completedMeals[m.id] ? acc + m.carbs : acc), 0);
  }, [meals, completedMeals]);

  const consumedFats = useMemo(() => {
    return meals.reduce((acc: number, m: any) => (completedMeals[m.id] ? acc + m.fats : acc), 0);
  }, [meals, completedMeals]);

  const caloriesPercent = targetCalories ? Math.min(Math.round((consumedCalories / targetCalories) * 100), 100) : 0;
  const proteinPercent = targetProtein ? Math.min(Math.round((consumedProtein / targetProtein) * 100), 100) : 0;
  const carbsPercent = targetCarbs ? Math.min(Math.round((consumedCarbs / targetCarbs) * 100), 100) : 0;
  const fatsPercent = targetFats ? Math.min(Math.round((consumedFats / targetFats) * 100), 100) : 0;

  const isAllComplete = meals.length > 0 && completedCount === meals.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group mt-2"
    >
      {/* Animated Gradient Border */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/20 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative bg-[#111A10] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 sm:gap-5 shadow-xl border border-white/5 backdrop-blur-md">
        {/* Top Header with Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-[#ADFF00]" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wider text-white uppercase leading-none">
                Today&apos;s Nutrition
              </h3>
            </div>
          </div>

          {premiumLevel === "pro" && meals.length > 0 && (
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
                isAllComplete
                  ? "bg-[#ADFF00]/15 text-[#ADFF00] border-[#ADFF00]/40 shadow-[0_0_10px_rgba(173,255,0,0.2)]"
                  : "bg-white/5 text-white/60 border-white/10"
              }`}
            >
              {completedCount}/{meals.length} Logged
            </span>
          )}
        </div>

        {/* Primary Calories Progress */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[11px] font-black text-white/60 uppercase tracking-widest">
                Calories
              </span>
            </div>
            <div className="tabular-nums text-right">
              <span className="text-sm sm:text-base font-black text-white">
                {consumedCalories.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-white/40 ml-1">
                / {targetCalories ? targetCalories.toLocaleString() : "--"} kcal
              </span>
            </div>
          </div>

          <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5 p-[1px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${caloriesPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-amber-300 shadow-[0_0_12px_rgba(249,115,22,0.45)] rounded-full relative"
            />
          </div>

          <div className="flex justify-between items-center text-[10px] font-semibold text-white/40 px-0.5">
            <span>{caloriesPercent}% Target Hit</span>
            {targetCalories && (
              <span>
                {Math.max(0, targetCalories - consumedCalories).toLocaleString()} kcal remaining
              </span>
            )}
          </div>
        </div>

        {/* 3 Secondary Macro Pillars (Protein, Carbs, Fats) */}
        <div className="grid grid-cols-3 gap-2">
          {/* Protein */}
          <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider uppercase text-[#ADFF00]">
                Protein
              </span>
              <span className="text-[9px] font-bold text-white/40 tabular-nums">
                {proteinPercent}%
              </span>
            </div>
            <div className="tabular-nums text-xs font-black text-white truncate">
              {consumedProtein}
              <span className="text-[10px] font-semibold text-white/40 ml-0.5">
                /{targetProtein ?? "--"}g
              </span>
            </div>
            <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${proteinPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-[#ADFF00]/60 to-[#ADFF00] rounded-full"
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider uppercase text-amber-400">
                Carbs
              </span>
              <span className="text-[9px] font-bold text-white/40 tabular-nums">
                {carbsPercent}%
              </span>
            </div>
            <div className="tabular-nums text-xs font-black text-white truncate">
              {consumedCarbs}
              <span className="text-[10px] font-semibold text-white/40 ml-0.5">
                /{targetCarbs ?? "--"}g
              </span>
            </div>
            <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${carbsPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-amber-500/60 to-amber-400 rounded-full"
              />
            </div>
          </div>

          {/* Fats */}
          <div className="bg-black/30 rounded-xl p-2.5 border border-white/5 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black tracking-wider uppercase text-rose-400">
                Fats
              </span>
              <span className="text-[9px] font-bold text-white/40 tabular-nums">
                {fatsPercent}%
              </span>
            </div>
            <div className="tabular-nums text-xs font-black text-white truncate">
              {consumedFats}
              <span className="text-[10px] font-semibold text-white/40 ml-0.5">
                /{targetFats ?? "--"}g
              </span>
            </div>
            <div className="w-full h-1 bg-black/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${fatsPercent}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-rose-500/60 to-rose-400 rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Meals List / Locked View */}
        <div className="bg-black/35 rounded-xl border border-white/5 overflow-hidden">
          {premiumLevel === "core" ? (
            <div className="p-5 flex flex-col items-center justify-center text-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center mb-1">
                <Utensils className="w-5 h-5 text-[#ADFF00]" />
              </div>
              <h4 className="text-sm font-bold text-white">Full Meal Plan Locked</h4>
              <p className="text-[11px] text-white/50 max-w-[240px] leading-relaxed">
                You currently have access to Macros Only. Upgrade to Pro for a hyper-personalized daily meal plan.
              </p>
              <Link href="/payment?returnTo=/&intent=upgrade_pro" prefetch={true} className="mt-1">
                <button className="bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 text-[#ADFF00] text-[10px] font-black uppercase px-4 py-2 rounded-full border border-[#ADFF00]/20 transition-all flex items-center gap-1.5 active:scale-95">
                  Unlock Pro <ArrowRight size={12} />
                </button>
              </Link>
            </div>
          ) : meals.length > 0 ? (
            <div className="divide-y divide-white/5">
              {meals.map((meal: any) => {
                const isCompleted = !!completedMeals[meal.id];

                return (
                  <div
                    key={meal.id}
                    onClick={() => toggleMeal(meal.id)}
                    role="button"
                    tabIndex={0}
                    className={`flex items-start gap-3 p-3.5 cursor-pointer transition-all duration-200 select-none ${
                      isCompleted ? "bg-[#ADFF00]/[0.04]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className="shrink-0 mt-0.5">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[#ADFF00] drop-shadow-[0_0_8px_rgba(173,255,0,0.5)]" />
                      ) : (
                        <Circle className="w-5 h-5 text-white/20 hover:text-white/40 transition-colors" />
                      )}
                    </div>

                    {/* Meal Details (No arbitrary max-w clipping) */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={`text-xs font-black uppercase tracking-wider transition-colors ${
                              isCompleted ? "text-[#ADFF00]" : "text-white/90"
                            }`}
                          >
                            {meal.name}
                          </span>
                          {meal.time && (
                            <span className="text-[10px] font-semibold text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/5 shrink-0">
                              {meal.time}
                            </span>
                          )}
                        </div>

                        {/* Meal Macro Badges */}
                        {(meal.calories > 0 || meal.protein > 0) && (
                          <div className="flex items-center gap-1.5 text-[11px] font-bold tabular-nums shrink-0">
                            {meal.calories > 0 && (
                              <span className="text-orange-400/90">{meal.calories} kcal</span>
                            )}
                            {meal.calories > 0 && meal.protein > 0 && (
                              <span className="text-white/20">·</span>
                            )}
                            {meal.protein > 0 && (
                              <span className="text-[#ADFF00]/90">{meal.protein}g P</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Items Display: Clean wrapping chips instead of cut-off single line */}
                      {meal.items.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {meal.items.map((item: string, itemIdx: number) => (
                            <span
                              key={itemIdx}
                              className={`text-[11px] font-medium leading-tight px-2 py-0.5 rounded-md border transition-colors ${
                                isCompleted
                                  ? "bg-[#ADFF00]/5 text-white/60 border-[#ADFF00]/15 line-through decoration-[#ADFF00]/40"
                                  : "bg-white/[0.04] text-white/70 border-white/5"
                              }`}
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-white/40 mt-1">
                          {meal.desc}
                        </p>
                      )}

                      {/* Prep Instructions if available */}
                      {meal.instructions && (
                        <p className="text-[10px] text-white/40 mt-1.5 italic flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-[#ADFF00]/70 shrink-0" />
                          <span className="truncate">{meal.instructions}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 flex flex-col items-center justify-center text-center">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest mb-1">
                No Meals Planned
              </p>
              <p className="text-xs text-white/30">Your AI nutrition plan will appear here.</p>
            </div>
          )}
        </div>

        {/* Link Button */}
        <Link
          href={premiumLevel === "pro" ? "/nutrition" : "/payment?returnTo=/&intent=upgrade_pro"}
          prefetch={true}
          className="w-full"
        >
          <button className="w-full py-3 px-4 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] border border-white/10 active:scale-[0.99] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 group/btn">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              {premiumLevel === "pro" ? "View Full Diet & Log" : "Upgrade for Full Diet"}
            </span>
            <ArrowRight className="w-4 h-4 text-[#ADFF00] group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
