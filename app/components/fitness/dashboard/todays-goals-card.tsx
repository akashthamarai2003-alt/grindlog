"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Circle, Target, Sparkles } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

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

  // Auto-detect meal completion from nutrition card's local storage
  const [mealsCompleted, setMealsCompleted] = useState(false);

  useEffect(() => {
    try {
      const savedMeals = localStorage.getItem(mealsStorageKey);
      if (savedMeals && nutrition?.meals && Array.isArray(nutrition.meals) && nutrition.meals.length > 0) {
        const parsed = JSON.parse(savedMeals);
        const count = Object.values(parsed).filter(Boolean).length;
        if (count >= nutrition.meals.length) {
          setMealsCompleted(true);
        }
      }
    } catch {
      // ignore
    }
  }, [mealsStorageKey, nutrition?.meals]);

  // User manual check/uncheck overrides
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

  const toggleGoal = (id: string, autoDefault: boolean) => {
    setManualGoals((prev) => {
      const current = prev[id] !== undefined ? prev[id] : autoDefault;
      const next = { ...prev, [id]: !current };
      try {
        localStorage.setItem(goalsStorageKey, JSON.stringify(next));
      } catch (err) {
        console.warn("Failed to persist goal completion:", err);
      }
      return next;
    });
  };

  const isGoalDone = (id: string, autoCompleted: boolean) => {
    if (manualGoals[id] !== undefined) {
      return manualGoals[id];
    }
    return autoCompleted;
  };

  // Automatic conditions
  const autoWorkout = workoutCompleted;
  const autoCalories = mealsCompleted;
  const autoProtein = mealsCompleted;
  const autoSteps = stepsTarget !== null && Number(activity?.steps) >= stepsTarget;
  const autoWater = waterTarget !== null && Number(activity?.water_liters) >= waterTarget;
  const autoSleep = sleepTarget !== null && Number(activity?.sleep_hours) >= sleepTarget;

  // Goal items definition
  const coreGoals = [
    {
      id: "workout",
      text: "Complete workout",
      completed: isGoalDone("workout", autoWorkout),
      autoDefault: autoWorkout,
      hint: workoutCompleted ? "Done" : undefined,
    },
    ...(targetCalories
      ? [
          {
            id: "calories",
            text: `${targetCalories.toLocaleString()} kcal daily target`,
            completed: isGoalDone("calories", autoCalories),
            autoDefault: autoCalories,
            hint: mealsCompleted ? "Hit" : undefined,
          },
        ]
      : []),
    ...(proteinTarget
      ? [
          {
            id: "protein",
            text: `Hit ${proteinTarget}g protein target`,
            completed: isGoalDone("protein", autoProtein),
            autoDefault: autoProtein,
            hint: mealsCompleted ? "Hit" : undefined,
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
                  completed: isGoalDone("steps", autoSteps),
                  autoDefault: autoSteps,
                  hint:
                    Number(activity?.steps) > 0
                      ? `${Number(activity.steps).toLocaleString()} logged`
                      : undefined,
                },
              ]
            : []),
          ...(waterTarget
            ? [
                {
                  id: "water",
                  text: `${waterTarget.toFixed(1)}L water`,
                  completed: isGoalDone("water", autoWater),
                  autoDefault: autoWater,
                  hint:
                    Number(activity?.water_liters) > 0
                      ? `${Number(activity.water_liters).toFixed(1)}L`
                      : undefined,
                },
              ]
            : []),
          ...(sleepTarget
            ? [
                {
                  id: "sleep",
                  text: `Sleep target ${sleepTarget}h`,
                  completed: isGoalDone("sleep", autoSleep),
                  autoDefault: autoSleep,
                  hint:
                    Number(activity?.sleep_hours) > 0
                      ? `${Number(activity.sleep_hours).toFixed(1)}h`
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

      <div className="relative bg-[#111A10] rounded-2xl p-4 sm:p-5 flex flex-col gap-4 shadow-xl border border-white/5 backdrop-blur-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 text-[#ADFF00]" />
            </div>
            <h3 className="text-sm font-black tracking-wider text-white uppercase leading-none">
              Today&apos;s Goals
            </h3>
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

        {/* Interactive Goals List */}
        <div className="flex flex-col gap-1">
          {goals.map((goal) => (
            <div
              key={goal.id}
              onClick={() => toggleGoal(goal.id, goal.autoDefault)}
              role="button"
              tabIndex={0}
              className={`flex items-center gap-3 p-2.5 -mx-1.5 rounded-xl cursor-pointer transition-all duration-200 select-none ${
                goal.completed ? "bg-[#ADFF00]/[0.03]" : "hover:bg-white/[0.03] active:scale-[0.99]"
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

              {goal.hint && (
                <span className="text-[10px] font-semibold text-[#ADFF00]/70 shrink-0 ml-auto bg-[#ADFF00]/10 px-1.5 py-0.5 rounded border border-[#ADFF00]/20">
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
