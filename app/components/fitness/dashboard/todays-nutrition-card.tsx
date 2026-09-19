"use client";

import { motion } from "framer-motion";
import { Utensils, ArrowRight, CheckCircle2, Circle, Flame, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import { nutritionApi } from "@/lib/api/nutrition";
import { toast } from "sonner";

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

  const [activeNutrition, setActiveNutrition] = useState<any>(nutrition);

  useEffect(() => {
    setActiveNutrition(nutrition);
  }, [nutrition]);

  const refreshNutrition = useCallback(async () => {
    try {
      const fresh = await nutritionApi.getToday(effectiveDate);
      if (fresh) {
        setActiveNutrition((prev: any) => ({
          ...prev,
          ...fresh,
          consumed: fresh.consumed || prev?.consumed,
          logged_foods: fresh.logged_foods || prev?.logged_foods,
          meals: (fresh.meals && fresh.meals.length > 0) ? fresh.meals : prev?.meals,
        }));
      }
    } catch {
      // silently ignore network errors
    }
  }, [effectiveDate]);

  useEffect(() => {
    refreshNutrition();
    const handleSync = () => {
      refreshNutrition();
    };
    if (typeof window !== "undefined") {
      window.addEventListener("grindlog_meals_updated", handleSync);
      window.addEventListener("focus", handleSync);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("grindlog_meals_updated", handleSync);
        window.removeEventListener("focus", handleSync);
      }
    };
  }, [refreshNutrition]);

  const targetCalories = Number(activeNutrition?.daily_calories ?? nutrition?.daily_calories) > 0 
    ? Math.round(Number(activeNutrition?.daily_calories ?? nutrition?.daily_calories)) 
    : null;
  const targetProtein = Number(activeNutrition?.protein_grams ?? nutrition?.protein_grams) > 0 
    ? Math.round(Number(activeNutrition?.protein_grams ?? nutrition?.protein_grams)) 
    : null;

  // Derive target fats and carbs consistently with the backend formula
  const targetFats = useMemo(() => {
    const rawFat = Number(activeNutrition?.fat_grams ?? nutrition?.fat_grams);
    if (rawFat > 0) return Math.round(rawFat);
    if (targetCalories) return Math.round((targetCalories * 0.25) / 9);
    return null;
  }, [activeNutrition?.fat_grams, nutrition?.fat_grams, targetCalories]);

  const targetCarbs = useMemo(() => {
    const rawCarbs = Number(activeNutrition?.carbs_grams ?? nutrition?.carbs_grams);
    if (rawCarbs > 0) return Math.round(rawCarbs);
    if (targetCalories && targetProtein && targetFats) {
      return Math.max(0, Math.round((targetCalories - targetProtein * 4 - targetFats * 9) / 4));
    }
    return null;
  }, [activeNutrition?.carbs_grams, nutrition?.carbs_grams, targetCalories, targetProtein, targetFats]);

  const rawMeals = (Array.isArray(activeNutrition?.meals) && activeNutrition.meals.length > 0)
    ? activeNutrition.meals
    : (Array.isArray(nutrition?.meals) ? nutrition.meals : []);
  const totalMealsCount = rawMeals.length || 1;

  // Process meals and assign realistic macros based on meal data or intelligent goal split
  const meals = useMemo(() => {
    return rawMeals.map((m: any, idx: number) => {
      const mealName = String(m.meal_name || m.name || `Meal ${idx + 1}`).trim();
      const timeStr = String(m.time_of_day || m.time || "").trim();
      const instructions = String(m.prep_instructions || m.notes || "").trim();

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
      let ratio = 1 / totalMealsCount;
      if (totalMealsCount >= 3) {
        if (idx === 0) ratio = 0.25;
        else if (idx === 1) ratio = 0.35;
        else if (idx === 2) ratio = 0.30;
        else ratio = 0.10;
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

      // Derive canonical meal_type
      let resolvedMealType = String(m.meal_type || "").toLowerCase().trim();
      if (!resolvedMealType) {
        const fullContext = `${mealName} ${timeStr} ${instructions}`.toLowerCase();
        if (fullContext.includes("breakfast") || fullContext.includes("waking") || fullContext.includes("morning")) {
          resolvedMealType = "breakfast";
        } else if (fullContext.includes("lunch") || fullContext.includes("midday") || fullContext.includes("noon")) {
          resolvedMealType = "lunch";
        } else if (fullContext.includes("dinner") || fullContext.includes("night") || fullContext.includes("supper")) {
          resolvedMealType = "dinner";
        } else if (fullContext.includes("pre-workout") || fullContext.includes("preworkout") || fullContext.includes("pre workout")) {
          resolvedMealType = "pre_workout";
        } else if (fullContext.includes("post-workout") || fullContext.includes("postworkout") || fullContext.includes("post workout")) {
          resolvedMealType = "post_workout";
        } else if (fullContext.includes("snack") || fullContext.includes("evening")) {
          if (totalMealsCount === 3 && idx === 2) {
            resolvedMealType = "dinner";
          } else {
            resolvedMealType = "snack";
          }
        } else {
          // Positional fallback
          if (totalMealsCount === 3) {
            resolvedMealType = idx === 0 ? "breakfast" : idx === 1 ? "lunch" : "dinner";
          } else if (totalMealsCount === 4) {
            resolvedMealType = idx === 0 ? "breakfast" : idx === 1 ? "lunch" : idx === 2 ? "pre_workout" : "dinner";
          } else if (totalMealsCount === 2) {
            resolvedMealType = idx === 0 ? "lunch" : "dinner";
          } else {
            resolvedMealType = idx === 0 ? "breakfast" : idx === totalMealsCount - 1 ? "dinner" : "lunch";
          }
        }
      }

      return {
        id: idx,
        meal_type: resolvedMealType,
        name: mealName,
        time: timeStr,
        items: itemsList,
        desc: itemsList.length > 0 ? itemsList.join(" + ") : "Planned Meal",
        instructions,
        calories: mealCalories,
        protein: mealProtein,
        carbs: mealCarbs,
        fats: mealFats,
        meal_plan_items: m.meal_plan_items,
      };
    });
  }, [rawMeals, totalMealsCount, targetCalories, targetProtein, targetCarbs, targetFats]);

  // Helper to clean awkward decimals in item names: e.g. "1.91 bowls" -> "1.9 bowls"
  const cleanItemDisplay = (itemStr: string): string => {
    return String(itemStr || "").replace(/(\d+)\.(\d+)\s*(bowls?|cups?|plates?|servings?|pieces?|g|cheelas?|rotis?|chapatis?|eggs?)/gi, (match, whole, dec, unit) => {
      const val = parseFloat(`${whole}.${dec}`);
      if (isNaN(val)) return match;
      if (Math.abs(val - Math.round(val)) <= 0.12) {
        const rounded = Math.round(val);
        return `${rounded} ${rounded === 1 ? unit.replace(/s$/, '') : unit}`;
      }
      return `${Number(val.toFixed(1))} ${unit}`;
    });
  };

  // Set of meal types that are already logged in the database for today
  const dbCompletedTypes = useMemo(() => {
    const set = new Set<string>();
    const logs = activeNutrition?.logged_foods || nutrition?.logged_foods;
    if (Array.isArray(logs)) {
      logs.forEach((f: any) => {
        if (f.meal_type) set.add(String(f.meal_type).toLowerCase().trim());
      });
    }
    return set;
  }, [activeNutrition?.logged_foods, nutrition?.logged_foods]);

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

    const handleSync = () => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) setCompletedMeals(JSON.parse(saved));
      } catch {}
    };

    if (typeof window !== "undefined") {
      window.addEventListener("grindlog_meals_updated", handleSync);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("grindlog_meals_updated", handleSync);
      }
    };
  }, [storageKey]);

  const isMealDone = useCallback((meal: any) => {
    const typeKey = String(meal.meal_type || "").toLowerCase().trim();
    if (typeKey && dbCompletedTypes.has(typeKey)) return true;

    // Check if food logs contain items matching this meal
    const logs = activeNutrition?.logged_foods || nutrition?.logged_foods;
    if (Array.isArray(logs) && logs.length > 0) {
      if (typeKey && logs.some((f: any) => String(f.meal_type || "").toLowerCase().trim() === typeKey)) {
        return true;
      }
      const mealItemKeywords = (meal.items || []).map((it: string) => {
        return it.toLowerCase().split('-')[0].replace(/[^a-z0-9]/g, ' ').trim();
      }).filter((k: string) => k.length >= 3);

      const hasMatchingFood = logs.some((f: any) => {
        const fName = String(f.foods?.name || f.name || "").toLowerCase();
        return mealItemKeywords.some((k: string) => fName.includes(k) || k.includes(fName));
      });
      if (hasMatchingFood) return true;
    }

    return Boolean(completedMeals[meal.id]);
  }, [dbCompletedTypes, activeNutrition?.logged_foods, nutrition?.logged_foods, completedMeals]);

  const toggleMeal = (meal: any) => {
    const alreadyDone = isMealDone(meal);
    const nextState = !alreadyDone;
    const typeKey = meal.meal_type || 'lunch';

    setCompletedMeals((prev) => {
      const next = { ...prev, [meal.id]: nextState };
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to persist completed meals:", err);
      }
      return next;
    });

    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("grindlog_meals_updated"));
    }

    if (nextState) {
      // Background log to database
      const itemsToLog = (meal.meal_plan_items && meal.meal_plan_items.length > 0)
        ? meal.meal_plan_items.map((it: any) => ({
            food_id: it.food_id || it.foods?.id,
            meal_type: typeKey,
            quantity: Number(it.quantity) || 1,
            custom_food: !it.food_id && !it.foods?.id ? {
              name: it.foods?.name || it.name,
              calories: it.foods?.calories || Math.round(meal.calories / Math.max(1, (meal.items?.length || 1))),
              protein: it.foods?.protein || Number((meal.protein / Math.max(1, (meal.items?.length || 1))).toFixed(1)),
              serving_size: it.foods?.serving_size || '1 serving',
            } : undefined
          }))
        : [{
            meal_type: typeKey,
            quantity: 1,
            custom_food: {
              name: meal.name,
              calories: meal.calories,
              protein: meal.protein,
              carbs: meal.carbs,
              fat: meal.fats,
              serving_size: '1 meal'
            }
          }];

      nutritionApi.logFoods(itemsToLog).then(() => {
        toast.success(`Logged ${meal.name}!`);
        refreshNutrition();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("grindlog_meals_updated"));
        }
      }).catch((err) => {
        console.warn("Could not sync logged meal to DB:", err);
        toast.success(`Logged ${meal.name}!`);
      });
    } else {
      // Background unlog
      const currentLogs = activeNutrition?.logged_foods || nutrition?.logged_foods || [];
      const foodsToRemove = currentLogs.filter((f: any) => String(f.meal_type).toLowerCase() === typeKey);
      if (foodsToRemove.length > 0) {
        Promise.all(foodsToRemove.map((f: any) => nutritionApi.deleteFood(f.id))).then(() => {
          refreshNutrition();
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("grindlog_meals_updated"));
          }
        }).catch(() => {});
      }
      toast.info(`Unlogged ${meal.name}`);
    }
  };

  // Real-world dynamic calculations: sum actual checked meal macros
  const completedCount = useMemo(() => {
    return meals.filter(m => isMealDone(m)).length;
  }, [meals, isMealDone]);

  const consumedCalories = useMemo(() => {
    const dbCals = Math.round(Number(activeNutrition?.consumed?.calories || nutrition?.consumed?.calories) || 0);
    const localExtraCals = meals.reduce((acc: number, m: any) => {
      const typeKey = m.meal_type;
      const inDb = typeKey && dbCompletedTypes.has(typeKey);
      if (completedMeals[m.id] && !inDb) {
        return acc + m.calories;
      }
      return acc;
    }, 0);
    return dbCals + localExtraCals;
  }, [activeNutrition?.consumed?.calories, nutrition?.consumed?.calories, dbCompletedTypes, meals, completedMeals]);

  const consumedProtein = useMemo(() => {
    const dbPro = Math.round(Number(activeNutrition?.consumed?.protein || nutrition?.consumed?.protein) || 0);
    const localExtraPro = meals.reduce((acc: number, m: any) => {
      const typeKey = m.meal_type;
      const inDb = typeKey && dbCompletedTypes.has(typeKey);
      if (completedMeals[m.id] && !inDb) {
        return acc + m.protein;
      }
      return acc;
    }, 0);
    return dbPro + localExtraPro;
  }, [activeNutrition?.consumed?.protein, nutrition?.consumed?.protein, dbCompletedTypes, meals, completedMeals]);

  const consumedCarbs = useMemo(() => {
    const dbCarbs = Math.round(Number(activeNutrition?.consumed?.carbs || nutrition?.consumed?.carbs) || 0);
    const localExtraCarbs = meals.reduce((acc: number, m: any) => {
      const typeKey = m.meal_type;
      const inDb = typeKey && dbCompletedTypes.has(typeKey);
      if (completedMeals[m.id] && !inDb) {
        return acc + m.carbs;
      }
      return acc;
    }, 0);
    return dbCarbs + localExtraCarbs;
  }, [activeNutrition?.consumed?.carbs, nutrition?.consumed?.carbs, dbCompletedTypes, meals, completedMeals]);

  const consumedFats = useMemo(() => {
    const dbFat = Math.round(Number(activeNutrition?.consumed?.fat || nutrition?.consumed?.fat) || 0);
    const localExtraFat = meals.reduce((acc: number, m: any) => {
      const typeKey = m.meal_type;
      const inDb = typeKey && dbCompletedTypes.has(typeKey);
      if (completedMeals[m.id] && !inDb) {
        return acc + m.fats;
      }
      return acc;
    }, 0);
    return dbFat + localExtraFat;
  }, [activeNutrition?.consumed?.fat, nutrition?.consumed?.fat, dbCompletedTypes, meals, completedMeals]);

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
                const isCompleted = isMealDone(meal);

                return (
                  <div
                    key={meal.id}
                    onClick={() => toggleMeal(meal)}
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
                              {cleanItemDisplay(item)}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs font-medium text-white/40 mt-1">
                          {cleanItemDisplay(meal.desc)}
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
          href="/nutrition"
          prefetch={true}
          className="w-full"
        >
          <button className="w-full py-3 px-4 bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.1] border border-white/10 active:scale-[0.99] transition-all duration-300 rounded-xl flex items-center justify-center gap-2 group/btn">
            <span className="text-xs font-black text-white uppercase tracking-wider">
              {premiumLevel === "pro" ? "View Full Diet & Log" : "View Meals & Nutrition"}
            </span>
            <ArrowRight className="w-4 h-4 text-[#ADFF00] group-hover/btn:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
