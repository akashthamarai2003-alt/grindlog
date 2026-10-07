"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flame,
  Loader2,
  Plus,
  RotateCcw,
  ShoppingBasket,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { FoodAvatar } from "./food-avatar";
import { LogFoodModal } from "./log-food-modal";
import { TodaySummaryCard } from "./today-summary-card";
import { WaterBottleCard } from "./water-bottle-card";
import { WaterHistoryCard } from "./water-history-card";
import { nutritionApi } from "@/lib/api/nutrition";
import type { V2NutritionDay, V2NutritionMeal } from "@/lib/services/nutrition/v2-ui-data";

type SwapOption = {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  calories: number;
  protein: number;
  estimated_cost: number;
  prep_time_min?: number;
  items?: Array<{ name: string }>;
};

const NO_PRESELECTED_FOODS: [] = [];

function dateAtNoon(date: string): Date {
  return new Date(`${date}T12:00:00Z`);
}

function addDays(date: string, days: number): string {
  const value = dateAtNoon(date);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function mondayOf(date: string): string {
  const day = dateAtNoon(date).getUTCDay();
  return addDays(date, -(day + 6) % 7);
}

function titleCase(slot: string): string {
  return slot.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayDate(date: string, options: Intl.DateTimeFormatOptions): string {
  return dateAtNoon(date).toLocaleDateString("en-IN", { ...options, timeZone: "UTC" });
}

function displayTime(time: string | null): string {
  if (!time) return "Flexible time";
  const [hours, minutes] = time.split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return time;
  return new Date(2026, 0, 1, hours, minutes).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function loggedTime(time: string, timezone: string): string {
  return new Date(time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: timezone });
}

function number(value: number): string {
  return Math.round(value).toLocaleString("en-IN");
}

function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "Please try again.";
}

function actualTotals(meal: V2NutritionMeal) {
  return meal.logs.reduce(
    (total, log) => ({
      calories: total.calories + log.calories,
      protein: total.protein + log.protein,
      carbs: total.carbs + log.carbs,
      fat: total.fat + log.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function stateOf(meal: V2NutritionMeal, nextId: string | undefined) {
  if (meal.logs.length > 0 || meal.status === "LOGGED") return "LOGGED";
  if (meal.status === "SKIPPED" || meal.status === "CANCELLED") return "SKIPPED";
  return meal.id === nextId ? "NEXT" : "UPCOMING";
}

function SwapDialog({
  meal,
  date,
  onClose,
  onSwapped,
}: {
  meal: V2NutritionMeal;
  date: string;
  onClose: () => void;
  onSwapped: () => Promise<void>;
}) {
  const [options, setOptions] = useState<SwapOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const loadOptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/nutrition/swap-meal?meal_type=${encodeURIComponent(meal.slot)}&date=${date}`,
        { cache: "no-store" }
      );
      const payload = await response.json();
      if (!response.ok || payload.engine !== "v2") {
        throw new Error(messageOf(payload.error || "V2 alternatives are unavailable."));
      }
      setOptions((payload.data?.options || []).slice(0, 6));
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setLoading(false);
    }
  }, [date, meal.slot]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const selectOption = async (option: SwapOption) => {
    setPendingId(option.id);
    try {
      const result = await nutritionApi.swapMeal(meal.slot, { id: option.id }, date);
      if (result.engine !== "v2") throw new Error("The V2 swap was not confirmed.");
      await onSwapped();
      toast.success("Meal swapped and saved.");
      onClose();
    } catch (cause) {
      toast.error(messageOf(cause));
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="swap-title"
        className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#101B0F] shadow-2xl sm:rounded-[28px]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div>
            <p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#ADFF00]">Your alternatives</p>
            <h2 id="swap-title" className="text-xl font-black text-white">
              Swap {titleCase(meal.slot)}
            </h2>
            <p className="mt-1 text-sm text-white/50">Choose another meal that fits your saved plan.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close swap options"
            className="rounded-full bg-white/10 p-2 text-white/70 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="space-y-3 overflow-y-auto p-4 sm:p-6">
          {loading && [0, 1, 2].map((key) => <div key={key} className="h-28 animate-pulse rounded-2xl bg-white/5" />)}
          {error && (
            <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-rose-200">
              {error}
              <button type="button" onClick={() => void loadOptions()} className="ml-3 font-bold underline">
                Retry
              </button>
            </div>
          )}
          {!loading && !error && options.length === 0 && (
            <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-white/55">
              No compatible alternatives are available for this meal.
            </p>
          )}
          {!loading &&
            !error &&
            options.map((option) => (
              <div
                key={option.id}
                className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3.5 sm:gap-4 sm:p-4"
              >
                <FoodAvatar
                  name={option.name}
                  imageUrl={option.image_url}
                  className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="line-clamp-2 font-bold text-white">{option.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-white/45">
                    {option.items?.map((item) => item.name).join(" · ") || option.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-white/70">
                    <span>{number(option.calories)} kcal</span>
                    <span>{number(option.protein)}g protein</span>
                    <span>₹{number(option.estimated_cost)}</span>
                    {option.prep_time_min != null && <span>{option.prep_time_min} min prep</span>}
                  </div>
                  <button
                    type="button"
                    disabled={Boolean(pendingId)}
                    onClick={() => void selectOption(option)}
                    className="mt-3 rounded-lg bg-[#ADFF00] px-3 py-2 text-xs font-black text-[#0A1108] disabled:opacity-50"
                  >
                    {pendingId === option.id ? "Saving…" : "Choose meal"}
                  </button>
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}

export function V2NutritionView({
  initialData,
  isPro,
  fixtureMode = false,
}: {
  initialData: V2NutritionDay | null;
  isPro: boolean;
  fixtureMode?: boolean;
}) {
  const [hydrated, setHydrated] = useState(false);
  const [selectedDate, setSelectedDate] = useState(initialData?.date || new Date().toISOString().slice(0, 10));
  const [weekStart, setWeekStart] = useState(() => mondayOf(initialData?.date || new Date().toISOString().slice(0, 10)));
  const [data, setData] = useState<V2NutritionDay | null>(initialData);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [swapMeal, setSwapMeal] = useState<V2NutritionMeal | null>(null);
  const [manualSlot, setManualSlot] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [waterGoalOpen, setWaterGoalOpen] = useState(false);
  const [waterGoal, setWaterGoal] = useState(initialData?.targets.water_ml || 2500);
  const [savingWaterGoal, setSavingWaterGoal] = useState(false);
  const [loggingMealId, setLoggingMealId] = useState<string | null>(null);
  const dayRequest = useRef(0);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const current = data?.date === selectedDate ? data : null;
  const today = data?.today || initialData?.today || selectedDate;
  const isToday = selectedDate === today;
  const isPast = selectedDate < today;
  const reload = useCallback(() => {
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    if (fixtureMode && refreshKey === 0 && selectedDate === initialData?.date) return;
    const requestId = ++dayRequest.current;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/nutrition/v2-day?date=${selectedDate}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(messageOf(payload.error));
        return payload.data as V2NutritionDay;
      })
      .then((fresh) => {
        if (requestId === dayRequest.current) {
          setData(fresh);
          setWaterGoal(fresh.targets.water_ml || 2500);
        }
      })
      .catch((cause) => {
        if (!controller.signal.aborted && requestId === dayRequest.current) setError(messageOf(cause));
      })
      .finally(() => {
        if (requestId === dayRequest.current) setLoading(false);
      });
    return () => controller.abort();
  }, [selectedDate, refreshKey, fixtureMode, initialData?.date]);

  const navigateWeek = (days: number) => {
    const next = addDays(weekStart, days);
    setWeekStart(next);
    setSelectedDate(next);
    setExpandedId(null);
  };

  const jumpToToday = () => {
    setWeekStart(mondayOf(today));
    setSelectedDate(today);
    setExpandedId(null);
  };

  const chooseDay = (date: string) => {
    setSelectedDate(date);
    setExpandedId(null);
    setPlanOpen(false);
  };

  // Smart & Time-Aware Next Meal Selector:
  // - Morning (before 11:30 AM): Marks Breakfast as Next Up (or Lunch if Breakfast already logged).
  // - Afternoon (11:30 AM – 4:30 PM): Marks Lunch as Next Up (or Dinner if Lunch already logged).
  // - Evening (after 4:30 PM): Marks Dinner as Next Up.
  // - Past unlogged meals do NOT show the green Next Up badge.
  // - Only active on Today (disabled when viewing other days in the week).
  const nextMealId = useMemo(() => {
    if (!current?.meals || current.meals.length === 0) return undefined;

    // Preserve deterministic selection in visual fixture tests
    if (fixtureMode) {
      return current.meals.find((meal) => meal.status === "PLANNED" && meal.logs.length === 0)?.id;
    }

    if (!isToday) return undefined;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const MORNING_CUTOFF = 11 * 60 + 30; // 11:30 AM (690 min)
    const AFTERNOON_CUTOFF = 16 * 60 + 30; // 4:30 PM (990 min)

    const isUnlogged = (meal: V2NutritionMeal) =>
      (meal.status === "PLANNED" || !meal.status) && meal.logs.length === 0;

    const parseMealMinutes = (meal: V2NutritionMeal): number | null => {
      if (!meal.scheduledTime) return null;
      const [h, m] = meal.scheduledTime.split(":").map(Number);
      if (Number.isFinite(h)) return h * 60 + (m || 0);
      return null;
    };

    const isSlot = (meal: V2NutritionMeal, type: "breakfast" | "lunch" | "dinner") => {
      const slot = meal.slot?.toLowerCase() || "";
      if (slot.includes(type)) return true;
      const mins = parseMealMinutes(meal);
      if (mins !== null) {
        if (type === "breakfast" && mins < MORNING_CUTOFF) return true;
        if (type === "lunch" && mins >= MORNING_CUTOFF && mins < AFTERNOON_CUTOFF) return true;
        if (type === "dinner" && mins >= AFTERNOON_CUTOFF) return true;
      }
      return false;
    };

    // 1. Morning (before 11:30 AM):
    if (currentMinutes < MORNING_CUTOFF) {
      const breakfast = current.meals.find((m) => isSlot(m, "breakfast"));
      if (breakfast && isUnlogged(breakfast)) return breakfast.id;
      const lunch = current.meals.find((m) => isSlot(m, "lunch"));
      if (lunch && isUnlogged(lunch)) return lunch.id;
      return undefined;
    }

    // 2. Afternoon (11:30 AM – 4:30 PM):
    if (currentMinutes >= MORNING_CUTOFF && currentMinutes < AFTERNOON_CUTOFF) {
      const lunch = current.meals.find((m) => isSlot(m, "lunch"));
      if (lunch && isUnlogged(lunch)) return lunch.id;
      const dinner = current.meals.find((m) => isSlot(m, "dinner"));
      if (dinner && isUnlogged(dinner)) return dinner.id;
      return undefined;
    }

    // 3. Evening (after 4:30 PM):
    const dinner = current.meals.find((m) => isSlot(m, "dinner"));
    if (dinner && isUnlogged(dinner)) return dinner.id;
    const upcomingEvening = current.meals.find((m) => {
      const mins = parseMealMinutes(m);
      return mins !== null && mins >= AFTERNOON_CUTOFF && isUnlogged(m);
    });
    return upcomingEvening?.id;
  }, [current, isToday, fixtureMode]);
  const loggedCount = current?.meals.filter((meal) => meal.logs.length > 0 || meal.status === "LOGGED").length || 0;

  const generatePlan = async () => {
    setGenerating(true);
    try {
      await nutritionApi.generatePlan({ v2: true, start_date: today });
      toast.success("Your 7-day plan is ready.");
      setSelectedDate(today);
      setWeekStart(mondayOf(today));
      reload();
    } catch (cause) {
      toast.error(messageOf(cause));
    } finally {
      setGenerating(false);
    }
  };

  const logPlanned = async (meal: V2NutritionMeal) => {
    if (loggingMealId) return;
    setLoggingMealId(meal.id);
    try {
      const response = await fetch("/api/nutrition/log-planned-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, meal_slot: meal.slot }),
      });
      const payload = await response.json();
      if (!response.ok || payload.engine !== "v2") {
        throw new Error(messageOf(payload.error || "Planned meal was not saved."));
      }
      toast.success(`${titleCase(meal.slot)} logged from your plan.`);
      reload();
    } catch (cause) {
      toast.error(messageOf(cause));
    } finally {
      setLoggingMealId(null);
    }
  };

  const updateWater = async (action: () => Promise<unknown>) => {
    try {
      await action();
      reload();
    } catch (cause) {
      toast.error(messageOf(cause));
    }
  };

  const saveWaterGoal = async () => {
    if (!current || waterGoal < 250 || waterGoal > 8000) {
      toast.error("Choose a water target from 250 to 8000 ml.");
      return;
    }
    setSavingWaterGoal(true);
    try {
      await nutritionApi.setTargets({ ...current.targets, water_ml: waterGoal });
      setWaterGoalOpen(false);
      reload();
      toast.success("Water target updated.");
    } catch (cause) {
      toast.error(messageOf(cause));
    } finally {
      setSavingWaterGoal(false);
    }
  };

  // Macro & Calorie computations for the compact Hero Card
  const targetCals = Math.max(1, Math.round(Number(current?.targets.calories) || 2000));
  const consumedCals = Math.round(Number(current?.consumed.calories) || 0);
  const caloriePercent = Math.min(100, Math.round((consumedCals / targetCals) * 100));
  const calorieRemaining = Math.max(0, targetCals - consumedCals);
  const isSurplus = consumedCals > targetCals;

  // Circular ring SVG parameters: radius 40 -> circumference 251.32
  const circleCircumference = 251.32;
  const calorieOffset = circleCircumference - (caloriePercent / 100) * circleCircumference;

  const targetPro = Math.max(1, Math.round(Number(current?.targets.protein) || 120));
  const consumedPro = Math.round(Number(current?.consumed.protein) || 0);
  const proPercent = Math.round((consumedPro / targetPro) * 100);

  const targetCarbs = Math.max(1, Math.round(Number(current?.targets.carbs) || 200));
  const consumedCarbs = Math.round(Number(current?.consumed.carbs) || 0);
  const carbsPercent = Math.round((consumedCarbs / targetCarbs) * 100);

  const targetFat = Math.max(1, Math.round(Number(current?.targets.fat) || 60));
  const consumedFat = Math.round(Number(current?.consumed.fat) || 0);
  const fatPercent = Math.round((consumedFat / targetFat) * 100);

  const nutritionScore = useMemo(() => {
    if (!current) return 0;
    const cScore = targetCals > 0 ? Math.min(100, Math.round((consumedCals / targetCals) * 100)) : 0;
    const pScore = targetPro > 0 ? Math.min(100, Math.round((consumedPro / targetPro) * 100)) : 0;
    const wTarget = current.targets.water_ml || 2500;
    const wScore = wTarget > 0 ? Math.min(100, Math.round(((current.consumed.water_ml || 0) / wTarget) * 100)) : 0;
    return Math.round((cScore + pScore + wScore) / 3);
  }, [current, targetCals, consumedCals, targetPro, consumedPro]);

  return (
    <div className="space-y-5 pb-36 sm:space-y-6 sm:pb-40" data-v2-ready={hydrated}>
      {/* 1. Sleek Compact Header with Quick Action Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-[#ADFF00]/25 bg-[#ADFF00]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#ADFF00]">
              <Sparkles size={11} /> Daily Fuel
            </span>
            {isToday && (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/70">
                Today
              </span>
            )}
          </div>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            {isToday ? "Today's Nutrition" : displayDate(selectedDate, { weekday: "long" })}
          </h1>
          <p className="text-xs font-medium text-white/50">
            {displayDate(selectedDate, { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>

        {/* Quick Actions (Grocery, 7-Day Plan, Quick Log) */}
        <div className="flex items-center gap-2">
          <Link
            href="/grocery"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-white/90 transition hover:border-[#ADFF00]/30 hover:bg-[#ADFF00]/10 hover:text-[#ADFF00] active:scale-95"
          >
            <ShoppingBasket size={14} className="text-[#ADFF00]" />
            <span>Grocery</span>
          </Link>
          <button
            type="button"
            onClick={() => setPlanOpen((open) => !open)}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-95 ${
              planOpen
                ? "border-[#ADFF00] bg-[#ADFF00] text-[#0A1108]"
                : "border-white/10 bg-white/5 text-white/90 hover:border-white/20 hover:bg-white/10"
            }`}
          >
            <CalendarDays size={14} />
            <span>7-Day Plan</span>
          </button>
          {isToday && (
            <button
              type="button"
              onClick={() => setManualSlot("snack")}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ADFF00] px-3 py-2 text-xs font-black text-[#0A1108] shadow-[0_0_16px_rgba(173,255,0,0.25)] transition hover:bg-[#c3ff42] active:scale-95"
            >
              <Plus size={14} />
              <span>Log Food</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Compact Daily Fuel Hero Card (Calorie Ring + 3 Macro Bars) */}
      <section
        className="relative overflow-hidden rounded-[24px] border border-[#ADFF00]/25 bg-gradient-to-br from-[#182814] via-[#101B0F] to-[#0A1208] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:p-6"
        aria-label="Nutrition fuel summary"
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#ADFF00]/10 blur-3xl" />

        {/* Micro-Header Strip */}
        <div className="relative mb-3.5 flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#ADFF00] animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
              {isToday ? "Today's Fuel Target" : "Day's Fuel Target"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-white/60">
            <span>Meals Logged:</span>
            <span className="rounded-md bg-white/10 px-2 py-0.5 font-black text-white">
              {loggedCount} / {current?.meals.length || 0}
            </span>
          </div>
        </div>

        {/* Primary Calories Progress */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-[#ADFF00]" />
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Calories
              </span>
            </div>
            <div className="text-right">
              <span className="text-base font-black text-white sm:text-lg">
                {number(consumedCals)}
              </span>
              <span className="text-xs font-semibold text-white/45">
                {" "}/ {number(targetCals)} kcal
              </span>
            </div>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/50 border border-white/5 p-[1px]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#ADFF00] via-[#c4ff4d] to-emerald-400 shadow-[0_0_12px_rgba(173,255,0,0.35)] transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, caloriePercent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 px-0.5">
            <span>{caloriePercent}% target hit</span>
            <span className="font-bold text-[#ADFF00]">
              {number(calorieRemaining)} kcal remaining
            </span>
          </div>
        </div>

        {/* 3 Secondary Macro Pillars (Protein, Carbs, Fat) */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {/* Protein */}
          <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 sm:p-3 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-sky-400">
                Protein
              </span>
              <span className="text-[10px] font-bold text-white/40 tabular-nums">
                {proPercent}%
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white truncate">
              {number(consumedPro)}
              <span className="text-[10px] font-normal text-white/40">/{number(targetPro)}g</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, proPercent))}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 sm:p-3 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
                Carbs
              </span>
              <span className="text-[10px] font-bold text-white/40 tabular-nums">
                {carbsPercent}%
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white truncate">
              {number(consumedCarbs)}
              <span className="text-[10px] font-normal text-white/40">/{number(targetCarbs)}g</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, carbsPercent))}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="rounded-xl border border-white/5 bg-black/30 p-2.5 sm:p-3 flex flex-col justify-between gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-400">
                Fat
              </span>
              <span className="text-[10px] font-bold text-white/40 tabular-nums">
                {fatPercent}%
              </span>
            </div>
            <div className="text-xs sm:text-sm font-black text-white truncate">
              {number(consumedFat)}
              <span className="text-[10px] font-normal text-white/40">/{number(targetFat)}g</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, fatPercent))}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Collapsible 7-Day Plan Overview Drawer */}
      {planOpen && (
        <section
          className="rounded-2xl border border-white/10 bg-[#111A10] p-4 shadow-xl sm:p-5"
          aria-label="Seven day plan overview"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-black text-white">7-Day Plan Schedule</h2>
            <button
              type="button"
              onClick={() => setPlanOpen(false)}
              aria-label="Close plan overview"
              className="rounded-lg p-1 text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {weekDates.map((date) => (
              <button
                key={date}
                type="button"
                onClick={() => chooseDay(date)}
                className={`rounded-xl border p-2 text-center transition ${
                  date === selectedDate
                    ? "border-[#ADFF00]/60 bg-[#ADFF00]/15 text-[#ADFF00]"
                    : "border-white/10 text-white/70 hover:border-white/20"
                }`}
              >
                <span className="block text-[9px] uppercase font-bold sm:text-[10px]">
                  {displayDate(date, { weekday: "short" })}
                </span>
                <span className="block text-base font-black sm:text-lg">{date.slice(-2)}</span>
              </button>
            ))}
          </div>
          {!current?.planId && isPro && (
            <button
              type="button"
              disabled={generating}
              onClick={() => void generatePlan()}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ADFF00] px-4 py-3 text-sm font-black text-black transition hover:bg-[#c3ff42] disabled:opacity-50"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
              Generate 7-day plan
            </button>
          )}
        </section>
      )}

      {/* 4. Compact 7-Day Week Strip */}
      <section aria-label="Choose plan day">
        <div className="mb-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Your Week</h2>
            {!isToday && (
              <button
                type="button"
                onClick={jumpToToday}
                className="flex items-center gap-1 rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[#ADFF00] hover:bg-white/10"
              >
                <RotateCcw size={10} />
                <span>Today</span>
              </button>
            )}
          </div>
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={() => navigateWeek(-7)}
              aria-label="Previous week"
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => navigateWeek(7)}
              aria-label="Next week"
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weekDates.map((date) => {
            const isSelected = date === selectedDate;
            const isCurrentToday = date === today;
            return (
              <button
                key={date}
                type="button"
                onClick={() => chooseDay(date)}
                aria-pressed={isSelected}
                className={`min-w-0 rounded-2xl border px-1 py-2 text-center transition active:scale-95 ${
                  isSelected
                    ? "border-[#ADFF00] bg-[#ADFF00] text-[#0A1108] shadow-[0_4px_16px_rgba(173,255,0,0.3)] font-black"
                    : "border-white/10 bg-[#111A10] text-white/55 hover:border-white/25 hover:text-white"
                }`}
              >
                <span className="block text-[9px] font-bold uppercase tracking-wider sm:text-[10px]">
                  {displayDate(date, { weekday: "short" })}
                </span>
                <span className="mt-0.5 block text-base font-black sm:text-lg">{date.slice(-2)}</span>
                {isCurrentToday && (
                  <span
                    className={`mx-auto mt-0.5 block h-1 w-1 rounded-full ${
                      isSelected ? "bg-[#0A1108]" : "bg-[#ADFF00]"
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. Streamlined Meal Timeline (Compact 1-Story Cards) */}
      <section aria-label="Meal timeline">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ADFF00]">Fuel Timeline</p>
            <h2 className="mt-0.5 text-xl font-black text-white sm:text-2xl">
              Meals for {displayDate(selectedDate, { weekday: "long" })}
            </h2>
          </div>
          {current?.planId && (
            <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/50">
              {current.meals.length} planned
            </span>
          )}
        </div>

        {loading && !current && (
          <div className="space-y-2.5" aria-label="Loading meals">
            {[0, 1, 2].map((index) => (
              <div key={index} className="h-24 animate-pulse rounded-2xl border border-white/5 bg-white/5" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-400/5 p-4 text-sm text-rose-200">
            Couldn&apos;t load this day: {error}
            <button type="button" onClick={reload} className="ml-3 font-bold underline">
              Retry
            </button>
          </div>
        )}

        {!loading && !error && current?.meals.length === 0 && (
          <div className="rounded-[24px] border border-dashed border-white/15 bg-[#111A10] p-7 text-center">
            <CalendarDays className="mx-auto mb-2.5 text-[#ADFF00]" size={32} />
            <h3 className="text-base font-black text-white">No meals planned for this day</h3>
            <p className="mx-auto mt-1 max-w-sm text-xs text-white/50">
              Choose another day or generate your personal 7-day plan.
            </p>
            {isPro && isToday && (
              <button
                type="button"
                disabled={generating}
                onClick={() => void generatePlan()}
                className="mt-4 rounded-xl bg-[#ADFF00] px-5 py-2.5 text-xs font-black text-black hover:bg-[#c3ff42] disabled:opacity-50"
              >
                {generating ? "Generating…" : "Generate 7-day plan"}
              </button>
            )}
          </div>
        )}

        {current && (
          <div className="space-y-2.5 sm:space-y-3">
            {current.meals.map((meal) => {
              const state = stateOf(meal, nextMealId);
              const logged = state === "LOGGED";
              const actual = actualTotals(meal);
              const differentFood = logged && meal.logs.some((log) => !log.plannedMealId);
              const shownCalories = logged && meal.logs.length > 0 ? actual.calories : meal.calories;
              const shownProtein = logged && meal.logs.length > 0 ? actual.protein : meal.protein;
              const shownCarbs = logged && meal.logs.length > 0 ? actual.carbs : meal.carbs;
              const shownFat = logged && meal.logs.length > 0 ? actual.fat : meal.fat;
              const expanded = expandedId === meal.id;

              return (
                <article
                  key={meal.id}
                  className={`overflow-hidden rounded-2xl border bg-[#111A10] transition ${
                    state === "NEXT"
                      ? "border-[#ADFF00]/55 shadow-[0_0_24px_rgba(173,255,0,0.12)]"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Single-Story Main Row */}
                  <div className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4">
                    {/* Food Avatar / Image */}
                    <div className="relative shrink-0">
                      <FoodAvatar
                        name={meal.name}
                        imageUrl={meal.imageUrl}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover border border-white/10 sm:h-20 sm:w-20"
                      />
                      {logged && (
                        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400 text-black shadow">
                          <Check size={12} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Meal Info Middle Column */}
                    <div className="min-w-0 flex-1">
                      {/* Slot + Time + Status */}
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                        <span className="font-black uppercase tracking-wider text-white/50">
                          {titleCase(meal.slot)}
                        </span>
                        <span className="text-white/25">·</span>
                        <span className="flex items-center gap-1 text-white/45">
                          <Clock3 size={11} /> {displayTime(meal.scheduledTime)}
                        </span>
                        {state === "NEXT" && (
                          <span className="rounded bg-[#ADFF00] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#0A1108]">
                            Next Up
                          </span>
                        )}
                        {logged && (
                          <span className="rounded bg-emerald-400/15 border border-emerald-400/20 px-1.5 py-0.5 text-[9px] font-bold text-emerald-300">
                            Logged
                          </span>
                        )}
                      </div>

                      {/* Recipe Title */}
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white sm:text-base">
                        {meal.name}
                      </h3>

                      {/* Compact Macro Badges (Calories, Protein, Carbs, Fat, Cost) */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] font-bold">
                        <span className="rounded-md bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-1.5 py-0.5 text-[#ADFF00]">
                          {number(shownCalories)} kcal
                        </span>
                        <span className="rounded-md bg-sky-400/10 border border-sky-400/20 px-1.5 py-0.5 text-sky-300">
                          {number(shownProtein)}g P
                        </span>
                        <span className="rounded-md bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 text-amber-300">
                          {number(shownCarbs)}g C
                        </span>
                        <span className="rounded-md bg-rose-400/10 border border-rose-400/20 px-1.5 py-0.5 text-rose-300">
                          {number(shownFat)}g F
                        </span>
                        <span className="text-[10px] font-medium text-white/40">
                          ₹{number(meal.cost)}
                        </span>
                        {differentFood && (
                          <span className="text-[10px] font-semibold text-amber-300">
                            (custom food)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Actions (Log button + Swap & Details) */}
                    <div className="flex shrink-0 flex-col items-end justify-between self-stretch gap-1.5">
                      {!logged && state !== "SKIPPED" && isToday && isPro ? (
                        <button
                          type="button"
                          disabled={Boolean(loggingMealId)}
                          onClick={() => void logPlanned(meal)}
                          className="rounded-xl bg-[#ADFF00] px-3.5 py-1.5 text-xs font-black text-[#0A1108] shadow-sm transition hover:bg-[#c3ff42] active:scale-95 disabled:opacity-50"
                        >
                          {loggingMealId === meal.id ? <Loader2 size={13} className="animate-spin" /> : "Log"}
                        </button>
                      ) : logged ? (
                        <span className="rounded-xl bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 text-[11px] font-black text-emerald-300">
                          ✓ Done
                        </span>
                      ) : (
                        <div className="h-6" />
                      )}

                      {/* Secondary Buttons Row */}
                      <div className="mt-auto flex items-center gap-1">
                        {!logged && state !== "SKIPPED" && !isPast && isPro && (
                          <button
                            type="button"
                            onClick={() => setSwapMeal(meal)}
                            className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-white/70 hover:border-white/20 hover:text-white"
                          >
                            Swap
                          </button>
                        )}
                        <button
                          type="button"
                          aria-expanded={expanded}
                          onClick={() => setExpandedId(expanded ? null : meal.id)}
                          className="flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/5 p-1 text-white/60 hover:text-white transition"
                          title={expanded ? "Less detail" : "View ingredients & prep"}
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Drawer: Ingredients, Prep, & Notes */}
                  {expanded && (
                    <div className="grid gap-4 border-t border-white/5 bg-black/20 p-3.5 text-xs sm:p-5">
                      {/* Macro Breakdown Strip */}
                      <div className="grid grid-cols-4 gap-2 rounded-xl border border-white/5 bg-black/40 p-2.5 text-center">
                        <div>
                          <span className="block text-[9px] font-black uppercase tracking-wider text-white/40">Calories</span>
                          <span className="text-xs font-black text-[#ADFF00]">{number(shownCalories)} kcal</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-black uppercase tracking-wider text-sky-400">Protein</span>
                          <span className="text-xs font-black text-sky-300">{number(shownProtein)}g</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-black uppercase tracking-wider text-amber-400">Carbs</span>
                          <span className="text-xs font-black text-amber-300">{number(shownCarbs)}g</span>
                        </div>
                        <div>
                          <span className="block text-[9px] font-black uppercase tracking-wider text-rose-400">Fat</span>
                          <span className="text-xs font-black text-rose-300">{number(shownFat)}g</span>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                          Full Ingredients
                        </h4>
                        <ul className="space-y-1.5">
                          {meal.ingredients.map((item) => (
                            <li key={item.id} className="flex justify-between gap-3 text-white/75">
                              <span>
                                {item.name}
                                {item.isProvided && (
                                  <span className="ml-1 text-[9px] font-bold text-[#ADFF00]">Provided</span>
                                )}
                              </span>
                              <span className="whitespace-nowrap font-semibold text-white">{item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                          Preparation
                        </h4>
                        <p className="leading-relaxed text-white/70">
                          {meal.prepInstructions || "Preparation instructions are not available for this meal."}
                        </p>

                        {meal.whyThisMeal && (
                          <>
                            <h4 className="mb-1 mt-3 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                              Why This Meal Fits Your Goal
                            </h4>
                            <p className="leading-relaxed text-white/70">{meal.whyThisMeal}</p>
                          </>
                        )}

                        {logged && meal.logs.length > 0 && (
                          <div className="mt-3 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-2.5">
                            <p className="text-[11px] font-black text-emerald-300">Actual food logged</p>
                            <ul className="mt-1.5 space-y-1 text-white/70">
                              {meal.logs.map((log) => (
                                <li key={log.id}>
                                  {log.name}
                                  {log.serving && ` · ${log.serving}`} · {number(log.calories)} kcal
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {isToday && isPro && !logged && (
                          <button
                            type="button"
                            onClick={() => setManualSlot(meal.slot)}
                            className="mt-3 text-xs font-bold text-[#ADFF00] underline underline-offset-4"
                          >
                            I ate different food
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Hydration Section (Water Tracker Cards) */}
      {current && (
        <section className="space-y-4 pt-2" aria-label="Hydration tracking">
          <WaterBottleCard
            isPro={isPro}
            disabled={!isToday}
            consumedMl={current.consumed.water_ml}
            targetMl={current.targets.water_ml}
            onAddWater={(amount) => updateWater(() => nutritionApi.logWater(amount))}
            onRemoveWater={(amount) => updateWater(() => nutritionApi.removeWater(amount))}
            onResetWater={() => updateWater(() => nutritionApi.resetWater())}
            onEditGoal={() => setWaterGoalOpen(true)}
          />
          <WaterHistoryCard
            todayConsumedMl={isToday ? current.consumed.water_ml : 0}
            targetMl={current.targets.water_ml}
          />
        </section>
      )}

      {/* 7. Detailed Adherence & Goals Breakdown (Today's Summary) */}
      {current && (
        <section aria-label="Today targets summary">
          <TodaySummaryCard
            consumed={current.consumed}
            targets={current.targets}
            meals={current.meals.map((meal) => ({ meal_type: meal.slot }))}
            loggedFoods={current.logs.map((log) => ({ meal_type: log.mealSlot }))}
            nutritionScore={nutritionScore}
            title={isToday ? "Today's Summary" : "Day Summary"}
          />
        </section>
      )}

      {/* 7. Dialogs & Modals */}
      {swapMeal && (
        <SwapDialog
          meal={swapMeal}
          date={selectedDate}
          onClose={() => setSwapMeal(null)}
          onSwapped={async () => {
            reload();
          }}
        />
      )}

      {manualSlot && (
        <LogFoodModal
          key={manualSlot}
          isOpen
          onClose={() => setManualSlot(null)}
          defaultMealType={manualSlot}
          preselectedFoods={NO_PRESELECTED_FOODS}
          onSuccess={() => {
            reload();
          }}
        />
      )}

      {waterGoalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setWaterGoalOpen(false);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-label="Edit water target"
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111A10] p-5 shadow-2xl"
          >
            <h2 className="text-lg font-black text-white">Daily Water Target</h2>
            <label className="mt-4 block text-xs font-bold text-white/50" htmlFor="v2-water-goal">
              Millilitres
            </label>
            <input
              id="v2-water-goal"
              type="number"
              min={250}
              max={8000}
              step={250}
              value={waterGoal}
              onChange={(event) => setWaterGoal(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-white focus:border-[#ADFF00] focus:outline-none"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setWaterGoalOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white/60 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingWaterGoal}
                onClick={() => void saveWaterGoal()}
                className="rounded-lg bg-[#ADFF00] px-4 py-2 text-sm font-black text-black hover:bg-[#c3ff42] disabled:opacity-50"
              >
                {savingWaterGoal ? "Saving…" : "Save"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
