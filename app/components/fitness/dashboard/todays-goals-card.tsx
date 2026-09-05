"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Target, Sparkles, Zap } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";

interface TodaysGoalsCardProps {
  lifestyle?: any;
  activity?: any;
  nutrition?: any;
  workoutCompleted?: boolean;
  premiumLevel?: string;
  targetDateStr?: string;
}

export function TodaysGoalsCard({
  lifestyle,
  activity,
  nutrition,
  workoutCompleted = false,
  premiumLevel = "core",
  targetDateStr,
}: TodaysGoalsCardProps) {
  // Determine effective date for persistent goal state keying
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

  const goalsStorageKey = `grindlog_goals_completed_${effectiveDate}`;
  const mealsStorageKey = `grindlog_meals_completed_${effectiveDate}`;

  // Targets from plan
  const stepsTarget = Number(lifestyle?.daily_steps_target) > 0 ? Number(lifestyle.daily_steps_target) : null;
  const waterTarget = Number(lifestyle?.water_target_liters) > 0 ? Number(lifestyle.water_target_liters) : null;
  const sleepTarget = Number(lifestyle?.sleep_target_hours) > 0 ? Number(lifestyle.sleep_target_hours) : null;
  const targetCalories = Number(nutrition?.daily_calories) > 0 ? Number(nutrition.daily_calories) : null;
  const proteinTarget = Number(nutrition?.protein_grams) > 0 ? Number(nutrition.protein_grams) : null;

  // Track meal completion from Today's Nutrition card
  const [nutritionProgress, setNutritionProgress] = useState({
    caloriesHit: false,
    proteinHit: false,
    consumedCalories: 0,
    consumedProtein: 0,
  });

  const checkNutritionStorage = useCallback(() => {
    try {
      const savedMeals = localStorage.getItem(mealsStorageKey);
      if (savedMeals && nutrition?.meals && Array.isArray(nutrition.meals) && nutrition.meals.length > 0) {
        const parsed: Record<string, boolean> = JSON.parse(savedMeals);
        const totalMeals = nutrition.meals.length;
        const checkedCount = Object.entries(parsed).filter(([_, v]) => Boolean(v)).length;

        let sumCals = 0;
        let sumPro = 0;
        nutrition.meals.forEach((m: any, idx: number) => {
          if (parsed[idx]) {
            const cal = Number(m.total_calories ?? m.calories) || (targetCalories ? Math.round(targetCalories / totalMeals) : 0);
            const pro = Number(m.protein_grams ?? m.protein) || (proteinTarget ? Math.round(proteinTarget / totalMeals) : 0);
            sumCals += cal;
            sumPro += pro;
          }
        });

        const allMealsDone = checkedCount >= totalMeals;
        const calsMet = allMealsDone || (targetCalories ? sumCals >= targetCalories * 0.9 : false);
        const proMet = allMealsDone || (proteinTarget ? sumPro >= proteinTarget * 0.9 : false);

        setNutritionProgress({
          caloriesHit: calsMet,
          proteinHit: proMet,
          consumedCalories: sumCals,
          consumedProtein: sumPro,
        });
      } else {
        setNutritionProgress({
          caloriesHit: false,
          proteinHit: false,
          consumedCalories: 0,
          consumedProtein: 0,
        });
      }
    } catch {
      // ignore
    }
  }, [mealsStorageKey, nutrition?.meals, targetCalories, proteinTarget]);

  // Initial check and live event listener for instant reactivity across cards
  useEffect(() => {
    checkNutritionStorage();

    const handleUpdate = () => checkNutritionStorage();
    window.addEventListener("grindlog_meals_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("grindlog_meals_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, [checkNutritionStorage]);

  // User manual check/uncheck overrides (only used when a goal is not yet automatically reached)
  const [manualGoals, setManualGoals] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(goalsStorageKey);
      if (saved) {
        setManualGoals(JSON.parse(saved));
      } else {
        setManualGoals({});
      }
    } catch {
      setManualGoals({});
    }
  }, [goalsStorageKey]);

  // Automatic conditions: ALWAYS TRUE when user completes the real-world action!
  const autoWorkout = Boolean(workoutCompleted);
  const autoCalories = Boolean(nutritionProgress.caloriesHit);
  const autoProtein = Boolean(nutritionProgress.proteinHit);
  const autoSteps = Boolean(stepsTarget !== null && Number(activity?.steps) >= stepsTarget);
  const autoWater = Boolean(waterTarget !== null && Number(activity?.water_liters) >= waterTarget);
  const autoSleep = Boolean(sleepTarget !== null && Number(activity?.sleep_hours) >= sleepTarget);

  // Resolution: if autoCompleted is true, it is ALWAYS complete!
  // Otherwise, user can manually toggle it.
  const isGoalDone = (id: string, autoCompleted: boolean) => {
    if (autoCompleted) return true;
    return Boolean(manualGoals[id]);
  };

  const toggleGoal = (id: string, autoCompleted: boolean) => {
    // If it's already automatically completed by real logs, it stays completed!
    if (autoCompleted) return;

    setManualGoals((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem(goalsStorageKey, JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to persist goal completion:", err);
      }
      return next;
    });
  };

  // Activity logged values
  const loggedSteps = Number(activity?.steps) || 0;
  const loggedWater = Number(activity?.water_liters) || 0;
  const loggedSleep = Number(activity?.sleep_hours) || 0;

  // Goals definitions with live status hints
  const coreGoals = [
    {
      id: "workout",
      text: "Complete workout",
      autoCompleted: autoWorkout,
      completed: isGoalDone("workout", autoWorkout),
      hint: autoWorkout ? "Auto-Checked" : "Pending session",
    },
    ...(targetCalories
      ? [
          {
            id: "calories",
            text: `${targetCalories.toLocaleString()} kcal daily target`,
            autoCompleted: autoCalories,
            completed: isGoalDone("calories", autoCalories),
            hint: autoCalories
              ? "Auto-Checked"
              : `${nutritionProgress.consumedCalories.toLocaleString()} / ${targetCalories.toLocaleString()} kcal`,
          },
        ]
      : []),
    ...(proteinTarget
      ? [
          {
            id: "protein",
            text: `Hit ${proteinTarget}g protein target`,
            autoCompleted: autoProtein,
            completed: isGoalDone("protein", autoProtein),
            hint: autoProtein
              ? "Auto-Checked"
              : `${nutritionProgress.consumedProtein} / ${proteinTarget}g`,
          },
        ]
      : []),
  ];

  const goals =
    premiumLevel === "pro"
      ? [
          ...coreGoals,
          ...(stepsTarget
            ? [
                {
                  id: "steps",
                  text: `${stepsTarget.toLocaleString()} steps`,
                  autoCompleted: autoSteps,
                  completed: isGoalDone("steps", autoSteps),
                  hint: autoSteps
                    ? "Auto-Checked"
                    : `${loggedSteps.toLocaleString()} / ${stepsTarget.toLocaleString()}`,
                },
              ]
            : []),
          ...(waterTarget
            ? [
                {
                  id: "water",
                  text: `${waterTarget.toFixed(1)}L water`,
                  autoCompleted: autoWater,
                  completed: isGoalDone("water", autoWater),
                  hint: autoWater
                    ? "Auto-Checked"
                    : `${loggedWater.toFixed(1)} / ${waterTarget.toFixed(1)} L`,
                },
              ]
            : []),
          ...(sleepTarget
            ? [
                {
                  id: "sleep",
                  text: `Sleep target ${sleepTarget}h`,
                  autoCompleted: autoSleep,
                  completed: isGoalDone("sleep", autoSleep),
                  hint: autoSleep
                    ? `${loggedSleep.toFixed(1)}h · Auto-Checked`
                    : loggedSleep > 0
                    ? `${loggedSleep.toFixed(1)} / ${sleepTarget}h`
                    : undefined,
                },
              ]
            : []),
        ]
      : coreGoals;

  const completedCount = goals.filter((g) => g.completed).length;
  const allComplete = goals.length > 0 && completedCount === goals.length;
  const progressPercent = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="w-full relative p-[1px] rounded-2xl overflow-hidden group mt-2"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#ADFF00]/10 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

      <div className="relative bg-[#111A10] rounded-2xl p-4 sm:p-5 flex flex-col gap-3.5 sm:gap-4 shadow-xl border border-white/5 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-[#ADFF00]" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wider text-white uppercase leading-none">
                Today&apos;s Goals
              </h3>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${
              allComplete
                ? "bg-[#ADFF00]/15 text-[#ADFF00] border-[#ADFF00]/40 shadow-[0_0_10px_rgba(173,255,0,0.2)]"
                : "bg-white/5 text-white/60 border-white/10"
            }`}
          >
            {allComplete ? "All Hit! 🎉" : `${completedCount}/${goals.length} Done`}
          </span>
        </div>

        {/* User-facing explanation: Automatically fills in from workouts, meals & activity */}
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#ADFF00] bg-[#ADFF00]/10 px-2.5 py-1.5 rounded-xl border border-[#ADFF00]/20">
          <Zap className="w-3.5 h-3.5 text-[#ADFF00] shrink-0" />
          <span>Automatically checks in as you complete workouts, meals & activity</span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-1.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#ADFF00]/60 to-[#ADFF00] rounded-full shadow-[0_0_8px_rgba(173,255,0,0.3)]"
            />
          </div>
        </div>

        {/* Goals Checklist */}
        <div className="flex flex-col gap-1">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id, goal.autoCompleted)}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-2.5 sm:gap-3 p-2.5 -mx-1.5 rounded-xl transition-all duration-200 select-none ${
                goal.autoCompleted
                  ? "bg-[#ADFF00]/[0.05] cursor-default"
                  : goal.completed
                  ? "bg-[#ADFF00]/[0.03] cursor-pointer"
                  : "hover:bg-white/[0.03] active:scale-[0.99] cursor-pointer"
              }`}
            >
              <div className="shrink-0 flex items-center justify-center">
                {goal.completed ? (
                  <CheckCircle2 className="w-5 h-5 text-[#ADFF00] drop-shadow-[0_0_6px_rgba(173,255,0,0.5)]" />
                ) : (
                  <Circle className="w-5 h-5 text-white/20 hover:text-white/40 transition-colors" />
                )}
              </div>

              <span
                className={`text-xs sm:text-sm font-medium tracking-wide transition-colors flex-1 min-w-0 truncate ${
                  goal.completed
                    ? "text-white/40 line-through decoration-[#ADFF00]/40"
                    : "text-white/85"
                }`}
              >
                {goal.text}
              </span>

              {/* Status Indicator */}
              {goal.hint && (
                <span
                  className={`text-[10px] font-bold shrink-0 ml-auto px-2 py-0.5 rounded-full border transition-all ${
                    goal.autoCompleted
                      ? "text-[#ADFF00] bg-[#ADFF00]/15 border-[#ADFF00]/30 shadow-[0_0_6px_rgba(173,255,0,0.15)]"
                      : goal.completed
                      ? "text-[#ADFF00]/90 bg-white/5 border-white/10"
                      : "text-white/40 bg-white/[0.03] border-white/5 tabular-nums"
                  }`}
                >
                  {goal.hint}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
