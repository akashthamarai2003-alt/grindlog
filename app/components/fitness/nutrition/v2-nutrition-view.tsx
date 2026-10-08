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
  Trash2,
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
import type { V2NutritionDay, V2NutritionLog, V2NutritionMeal } from "@/lib/services/nutrition/v2-ui-data";
import { cleanFoodName, cleanServing } from "@/lib/fitness/nutrition/portion-parser";

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

const SLOT_ORDER: Record<string, number> = {
  breakfast: 10,
  morning_snack: 20,
  lunch: 30,
  snack: 40,
  afternoon_snack: 40,
  pre_workout: 50,
  post_workout: 60,
  dinner: 70,
  evening_snack: 80,
  late_night: 90,
  other: 100,
};

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

function isDayFoodFinished(day: V2NutritionDay | null | undefined): boolean {
  if (!day || !day.meals || day.meals.length === 0) return false;
  return day.meals.every((meal) => meal.logs.length > 0 || meal.status === "LOGGED");
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
  const [deletingLogId, setDeletingLogId] = useState<string | null>(null);
  const inFlightMealsRef = useRef<Set<string>>(new Set());
  const dayRequest = useRef(0);
  const pendingWaterDeltaRef = useRef<number>(0);
  const waterInFlightDeltaRef = useRef<number>(0);
  const waterDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const currentWaterRef = useRef<number>(Number(initialData?.consumed?.water_ml) || 0);

  // Fast client cache for instant 0ms date switching
  const daysCacheRef = useRef<Map<string, V2NutritionDay>>(
    new Map(initialData ? [[initialData.date, initialData]] : [])
  );
  const [completedDays, setCompletedDays] = useState<Set<string>>(() => {
    const set = new Set<string>();
    if (initialData && isDayFoodFinished(initialData)) {
      set.add(initialData.date);
    }
    return set;
  });

  useEffect(() => {
    if (initialData?.date) {
      daysCacheRef.current.set(initialData.date, initialData);
      if (isDayFoodFinished(initialData)) {
        setCompletedDays((prev) => {
          if (prev.has(initialData.date)) return prev;
          const next = new Set(prev);
          next.add(initialData.date);
          return next;
        });
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (data?.date) {
      daysCacheRef.current.set(data.date, data);
      if (isDayFoodFinished(data)) {
        setCompletedDays((prev) => {
          if (prev.has(data.date)) return prev;
          const next = new Set(prev);
          next.add(data.date);
          return next;
        });
      } else {
        setCompletedDays((prev) => {
          if (!prev.has(data.date)) return prev;
          const next = new Set(prev);
          next.delete(data.date);
          return next;
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (data?.consumed?.water_ml !== undefined) {
      currentWaterRef.current = Number(data.consumed.water_ml) || 0;
    }
  }, [data?.consumed?.water_ml]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const current = useMemo(() => {
    if (data?.date === selectedDate) return data;
    return daysCacheRef.current.get(selectedDate) || null;
  }, [data, selectedDate]);
  const today = data?.today || initialData?.today || selectedDate;
  const isToday = selectedDate === today;
  const isPast = selectedDate < today;
  const reload = useCallback(() => {
    daysCacheRef.current.clear();
    setRefreshKey((key) => key + 1);
  }, []);

  useEffect(() => {
    // 0ms instant display from cache if available and not a forced reload
    const cached = daysCacheRef.current.get(selectedDate);
    if (cached && refreshKey === 0) {
      if (data?.date !== selectedDate) {
        setData(cached);
      }
      setLoading(false);
      return;
    }

    const requestId = ++dayRequest.current;
    const controller = new AbortController();

    // If cached data is present, do not show a blocking skeleton loader
    if (!cached) {
      setLoading(true);
    }
    setError(null);

    fetch(`/api/nutrition/v2-day?date=${selectedDate}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(messageOf(payload.error));
        return payload.data as V2NutritionDay;
      })
      .then((fresh) => {
        if (requestId === dayRequest.current) {
          // If viewing today, preserve local optimistic water so it never jumps down
          const hasPendingWater = pendingWaterDeltaRef.current !== 0 || waterInFlightDeltaRef.current !== 0;
          const effectiveWater = (selectedDate === today && hasPendingWater)
            ? currentWaterRef.current
            : fresh.consumed.water_ml;
          currentWaterRef.current = effectiveWater;
          const resolvedDay: V2NutritionDay = {
            ...fresh,
            consumed: {
              ...fresh.consumed,
              water_ml: effectiveWater,
            },
          };
          daysCacheRef.current.set(fresh.date, resolvedDay);
          setData(resolvedDay);
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
  }, [selectedDate, refreshKey, today]);

  // Background prefetch: pre-fetches all 7 days of the current week strip quietly
  useEffect(() => {
    if (fixtureMode) return;
    let isCancelled = false;
    const timer = setTimeout(async () => {
      for (const d of weekDates) {
        if (isCancelled) break;
        if (daysCacheRef.current.has(d)) continue;
        try {
          const res = await fetch(`/api/nutrition/v2-day?date=${d}`, { cache: "no-store" });
          if (!res.ok) continue;
          const payload = await res.json();
          if (payload?.data && !isCancelled) {
            const fresh = payload.data as V2NutritionDay;
            daysCacheRef.current.set(d, fresh);
            if (isDayFoodFinished(fresh)) {
              setCompletedDays((prev) => {
                if (prev.has(d)) return prev;
                const next = new Set(prev);
                next.add(d);
                return next;
              });
            }
          }
        } catch {
          // Quietly ignore background prefetch errors
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [weekDates]);

  const navigateWeek = (days: number) => {
    const next = addDays(weekStart, days);
    setWeekStart(next);
    setSelectedDate(next);
    setExpandedId(null);
    const cached = daysCacheRef.current.get(next);
    if (cached) {
      setData(cached);
      setLoading(false);
    }
  };

  const jumpToToday = () => {
    setWeekStart(mondayOf(today));
    setSelectedDate(today);
    setExpandedId(null);
    const cached = daysCacheRef.current.get(today);
    if (cached) {
      setData(cached);
      setLoading(false);
    }
  };

  const chooseDay = (date: string) => {
    if (date === selectedDate) return;
    setSelectedDate(date);
    setExpandedId(null);
    setPlanOpen(false);
    const cached = daysCacheRef.current.get(date);
    if (cached) {
      setData(cached);
      setLoading(false);
    }
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

  const extraMeals = useMemo<V2NutritionMeal[]>(() => {
    if (!current) return [];
    const attachedIds = new Set(current.meals.flatMap((m) => m.logs.map((l) => l.id)));
    const map = new Map<string, V2NutritionLog[]>();
    for (const log of current.logs) {
      if (!attachedIds.has(log.id)) {
        const slot = log.mealSlot || "snack";
        const existing = map.get(slot) || [];
        existing.push(log);
        map.set(slot, existing);
      }
    }

    const result: V2NutritionMeal[] = [];
    for (const [slot, logs] of map.entries()) {
      const totalCals = logs.reduce((sum, l) => sum + (Number(l.calories) || 0), 0);
      const totalPro = logs.reduce((sum, l) => sum + (Number(l.protein) || 0), 0);
      const totalCarbs = logs.reduce((sum, l) => sum + (Number(l.carbs) || 0), 0);
      const totalFat = logs.reduce((sum, l) => sum + (Number(l.fat) || 0), 0);
      const latestTime = logs[logs.length - 1]?.loggedAt;
      let scheduledTime: string | null = null;
      if (latestTime) {
        try {
          const d = new Date(latestTime);
          scheduledTime = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        } catch {}
      }

      result.push({
        id: `extra-${slot}`,
        slot,
        sequence: 99,
        scheduledTime,
        status: "LOGGED",
        sourceType: "TEMPLATE",
        name: logs.map((l) => l.name).join(" · "),
        description: null,
        whyThisMeal: null,
        prepInstructions: null,
        prepTimeMin: null,
        imageUrl: "",
        calories: totalCals,
        protein: totalPro,
        carbs: totalCarbs,
        fat: totalFat,
        cost: 0,
        ingredients: logs.map((l) => ({
          id: l.id,
          name: l.name,
          quantity: l.serving || "1 serving",
          isProvided: false,
        })),
        logs,
      });
    }
    return result;
  }, [current]);

  const allTimelineMeals = useMemo(() => {
    if (!current) return [];
    const combined = [...current.meals, ...extraMeals];
    return combined.sort((a, b) => {
      if (a.scheduledTime && b.scheduledTime) {
        const cmp = a.scheduledTime.localeCompare(b.scheduledTime);
        if (cmp !== 0) return cmp;
      }
      const orderA = SLOT_ORDER[a.slot.toLowerCase()] ?? a.sequence * 10;
      const orderB = SLOT_ORDER[b.slot.toLowerCase()] ?? b.sequence * 10;
      return orderA - orderB;
    });
  }, [current, extraMeals]);

  const loggedCount = (current?.meals.filter((meal) => meal.logs.length > 0 || meal.status === "LOGGED").length || 0) + extraMeals.length;
  const totalMealSlotsCount = (current?.meals.length || 0) + extraMeals.length;
  const isDayFinished = useMemo(() => {
    if (totalMealSlotsCount > 0 && loggedCount >= totalMealSlotsCount) return true;
    return isDayFoodFinished(current);
  }, [totalMealSlotsCount, loggedCount, current]);

  const handleOptimisticLog = useCallback((loggedItems: any, defaultSlot?: string) => {
    if (!loggedItems) return;
    const items = Array.isArray(loggedItems) ? loggedItems : [loggedItems];
    if (items.length === 0) return;

    setData((prev) => {
      if (!prev) return prev;
      const newLogs: V2NutritionLog[] = items.map((item: any) => {
        const slot = item.meal_type || item.mealSlot || defaultSlot || "snack";
        return {
          id: item.id || `optimistic-log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          mealSlot: slot,
          plannedMealId: item.planned_meal_id || item.plannedMealId || null,
          name: cleanFoodName(item.foods?.name || item.custom_food?.name || item.recipe_name_snapshot || item.name, "Logged Food"),
          serving: cleanServing(item.serving_snapshot || item.foods?.serving_size || item.serving) || null,
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
          loggedAt: item.logged_at || new Date().toISOString(),
        };
      });

      const addedCals = newLogs.reduce((s, l) => s + l.calories, 0);
      const addedPro = newLogs.reduce((s, l) => s + l.protein, 0);
      const addedCarbs = newLogs.reduce((s, l) => s + l.carbs, 0);
      const addedFat = newLogs.reduce((s, l) => s + l.fat, 0);

      const updatedMeals = prev.meals.map((m) => {
        const matchingLogs = newLogs.filter((nl) => nl.mealSlot === m.slot || (nl.plannedMealId && nl.plannedMealId === m.id));
        if (matchingLogs.length === 0) return m;
        return {
          ...m,
          status: "LOGGED" as const,
          logs: [...m.logs, ...matchingLogs],
        };
      });

      return {
        ...prev,
        meals: updatedMeals,
        logs: [...prev.logs, ...newLogs],
        consumed: {
          ...prev.consumed,
          calories: prev.consumed.calories + addedCals,
          protein: prev.consumed.protein + addedPro,
          carbs: prev.consumed.carbs + addedCarbs,
          fat: prev.consumed.fat + addedFat,
        },
      };
    });
  }, []);

  const handleDeleteFood = useCallback(async (logId: string, foodName?: string) => {
    if (deletingLogId) return;
    setDeletingLogId(logId);

    const previousData = data;
    if (!previousData) {
      setDeletingLogId(null);
      return;
    }

    const targetLog = previousData.logs.find((l) => l.id === logId);
    if (!targetLog) {
      setDeletingLogId(null);
      return;
    }

    // 1. Instant 0ms Optimistic UI Update
    setData((prev) => {
      if (!prev) return prev;
      const filteredLogs = prev.logs.filter((l) => l.id !== logId);
      const updatedMeals = prev.meals.map((m) => {
        const remainingMealLogs = m.logs.filter((l) => l.id !== logId);
        return {
          ...m,
          status: (remainingMealLogs.length === 0 && m.status === "LOGGED" ? "PLANNED" : m.status) as V2NutritionMeal["status"],
          logs: remainingMealLogs,
        };
      });

      return {
        ...prev,
        meals: updatedMeals,
        logs: filteredLogs,
        consumed: {
          ...prev.consumed,
          calories: Math.max(0, prev.consumed.calories - Math.round(Number(targetLog.calories) || 0)),
          protein: Math.max(0, prev.consumed.protein - Math.round(Number(targetLog.protein) || 0)),
          carbs: Math.max(0, prev.consumed.carbs - Math.round(Number(targetLog.carbs) || 0)),
          fat: Math.max(0, prev.consumed.fat - Math.round(Number(targetLog.fat) || 0)),
        },
      };
    });

    toast.success(`Removed ${cleanFoodName(foodName, "food")}`);

    // 2. Background Server API Call
    try {
      await nutritionApi.deleteFood(logId);
      reload();
    } catch (cause) {
      // 3. Rollback on Failure
      setData(previousData);
      toast.error(messageOf(cause));
    } finally {
      setDeletingLogId(null);
    }
  }, [deletingLogId, data, reload]);

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
    if (inFlightMealsRef.current.has(meal.id)) return;
    inFlightMealsRef.current.add(meal.id);
    setLoggingMealId(meal.id);

    // 1. Instant 0ms Optimistic UI Update
    setData((prev) => {
      if (!prev) return prev;
      const updatedMeals = prev.meals.map((m) => {
        if (m.id !== meal.id) return m;
        return {
          ...m,
          status: "LOGGED" as const,
          logs: [
            ...m.logs,
            {
              id: `optimistic-${Date.now()}`,
              mealSlot: m.slot,
              plannedMealId: m.id,
              name: m.name,
              serving: null,
              calories: m.calories,
              protein: m.protein,
              carbs: m.carbs,
              fat: m.fat,
              loggedAt: new Date().toISOString(),
            },
          ],
        };
      });

      return {
        ...prev,
        meals: updatedMeals,
        consumed: {
          ...prev.consumed,
          calories: prev.consumed.calories + Math.round(Number(meal.calories) || 0),
          protein: prev.consumed.protein + Math.round(Number(meal.protein) || 0),
          carbs: prev.consumed.carbs + Math.round(Number(meal.carbs) || 0),
          fat: prev.consumed.fat + Math.round(Number(meal.fat) || 0),
        },
      };
    });

    // 2. Safe Background API Persistence
    try {
      const response = await fetch("/api/nutrition/log-planned-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, meal_slot: meal.slot }),
      });
      const payload = await response.json();
      if (!response.ok || payload.engine !== "v2") {
        throw new Error(messageOf(payload?.error?.message || payload?.error || "Planned meal was not saved."));
      }

      toast.success(`${titleCase(meal.slot)} logged from your plan.`);

      // Seamlessly reconcile authoritative consumed macros from server
      const adaptiveConsumed = payload?.data?.adaptiveDay?.consumedMacros;
      if (adaptiveConsumed) {
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            consumed: {
              ...prev.consumed,
              calories: Number(adaptiveConsumed.calories) || prev.consumed.calories,
              protein: Number(adaptiveConsumed.protein) || prev.consumed.protein,
              carbs: Number(adaptiveConsumed.carbs) || prev.consumed.carbs,
              fat: Number(adaptiveConsumed.fat) || prev.consumed.fat,
            },
          };
        });
      }
    } catch (cause) {
      // 3. Rollback Optimistic State on Failure
      setData((prev) => {
        if (!prev) return prev;
        const revertedMeals = prev.meals.map((m) => {
          if (m.id !== meal.id) return m;
          return {
            ...m,
            status: meal.status,
            logs: meal.logs,
          };
        });

        return {
          ...prev,
          meals: revertedMeals,
          consumed: {
            ...prev.consumed,
            calories: Math.max(0, prev.consumed.calories - Math.round(Number(meal.calories) || 0)),
            protein: Math.max(0, prev.consumed.protein - Math.round(Number(meal.protein) || 0)),
            carbs: Math.max(0, prev.consumed.carbs - Math.round(Number(meal.carbs) || 0)),
            fat: Math.max(0, prev.consumed.fat - Math.round(Number(meal.fat) || 0)),
          },
        };
      });
      toast.error(messageOf(cause));
    } finally {
      inFlightMealsRef.current.delete(meal.id);
      setLoggingMealId(null);
    }
  };

  const flushWaterSync = useCallback(async () => {
    const delta = pendingWaterDeltaRef.current;
    if (delta === 0) return;
    pendingWaterDeltaRef.current = 0;
    waterInFlightDeltaRef.current += delta;

    try {
      let res: any;
      if (delta > 0) {
        res = await nutritionApi.logWater(delta);
      } else {
        res = await nutritionApi.removeWater(Math.abs(delta));
      }
      waterInFlightDeltaRef.current -= delta;
      // If the server reported hitting the 8L daily safety cap, clamp client state
      if (res?.capped) {
        currentWaterRef.current = 8000;
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            consumed: {
              ...prev.consumed,
              water_ml: 8000,
            },
          };
        });
      }
    } catch (cause) {
      waterInFlightDeltaRef.current -= delta;
      console.error("Failed to sync water to server:", cause);
      toast.error("Failed to sync water to server");
      setData((prev) => {
        if (!prev) return prev;
        const cur = Number(prev.consumed?.water_ml) || 0;
        const reverted = Math.max(0, cur - delta);
        currentWaterRef.current = reverted;
        return {
          ...prev,
          consumed: {
            ...prev.consumed,
            water_ml: reverted,
          },
        };
      });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (waterDebounceTimerRef.current) {
        clearTimeout(waterDebounceTimerRef.current);
        void flushWaterSync();
      }
    };
  }, [flushWaterSync]);

  const handleAddWater = useCallback((amount: number = 250) => {
    if (!isToday) {
      toast.info("Water can only be changed for today.");
      return;
    }
    if (!isPro) {
      toast.info("Water tracking is available on the Pro plan.");
      return;
    }
    if (!data) return;

    const currentWater = currentWaterRef.current;
    if (currentWater >= 8000) {
      toast.info("Daily safety cap of 8L reached.");
      return;
    }

    const effectiveAmount = Math.min(amount, 8000 - currentWater);
    if (effectiveAmount <= 0) return;

    const newWater = Math.min(8000, currentWater + effectiveAmount);
    currentWaterRef.current = newWater;

    // Instant 0ms local state update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        consumed: {
          ...prev.consumed,
          water_ml: newWater,
        },
      };
    });

    const targetWater = Number(data.targets?.water_ml) || 2500;
    if (newWater >= targetWater && currentWater < targetWater) {
      toast.success(`🎉 Daily water goal of ${(targetWater / 1000).toFixed(1)}L reached!`);
    }

    // Debounce background API sync
    pendingWaterDeltaRef.current += effectiveAmount;
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    waterDebounceTimerRef.current = setTimeout(() => {
      void flushWaterSync();
    }, 350);
  }, [isToday, isPro, data, flushWaterSync]);

  const handleRemoveWater = useCallback((amount: number = 250) => {
    if (!isToday) {
      toast.info("Water can only be changed for today.");
      return;
    }
    if (!isPro) {
      toast.info("Water tracking is available on the Pro plan.");
      return;
    }
    if (!data) return;

    const currentWater = currentWaterRef.current;
    if (currentWater <= 0) return;

    const effectiveAmount = Math.min(amount, currentWater);
    const newWater = Math.max(0, currentWater - effectiveAmount);
    currentWaterRef.current = newWater;

    // Instant 0ms local state update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        consumed: {
          ...prev.consumed,
          water_ml: newWater,
        },
      };
    });

    // Debounce background API sync
    pendingWaterDeltaRef.current -= effectiveAmount;
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    waterDebounceTimerRef.current = setTimeout(() => {
      void flushWaterSync();
    }, 350);
  }, [isToday, isPro, data, flushWaterSync]);

  const handleResetWater = useCallback(async () => {
    if (!isToday) {
      toast.info("Water can only be changed for today.");
      return;
    }
    if (!isPro) {
      toast.info("Water tracking is available on the Pro plan.");
      return;
    }
    if (typeof window !== "undefined" && !window.confirm("Do you want to reset today's logged water to 0L?")) {
      return;
    }

    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    pendingWaterDeltaRef.current = 0;
    waterInFlightDeltaRef.current = 0;
    currentWaterRef.current = 0;

    // Instant 0ms local state update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        consumed: {
          ...prev.consumed,
          water_ml: 0,
        },
      };
    });

    try {
      await nutritionApi.resetWater();
      toast.success("Water reset to 0 ml");
    } catch (cause) {
      toast.error(messageOf(cause));
      reload();
    }
  }, [isToday, isPro, reload]);

  const saveWaterGoal = async () => {
    if (!current || waterGoal < 250 || waterGoal > 8000) {
      toast.error("Choose a water target from 250 to 8000 ml.");
      return;
    }
    setSavingWaterGoal(true);
    try {
      await nutritionApi.setTargets({ ...current.targets, water_ml: waterGoal });
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          targets: {
            ...prev.targets,
            water_ml: waterGoal,
          },
        };
      });
      setWaterGoalOpen(false);
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
              onClick={() => {
                const nextSlot = current?.meals.find((m) => m.id === nextMealId)?.slot 
                  || current?.meals.find((m) => m.status === "PLANNED" && m.logs.length === 0)?.slot 
                  || "snack";
                setManualSlot(nextSlot);
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#ADFF00] px-3 py-2 text-xs font-black text-[#0A1108] shadow-[0_0_16px_rgba(173,255,0,0.25)] transition hover:bg-[#c3ff42] active:scale-95 touch-manipulation select-none cursor-pointer"
            >
              <Plus size={14} />
              <span>Log Food</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. Compact Daily Fuel Hero Card (Calorie Ring + 3 Macro Bars) */}
      <section
        className="nutrition-fuel-hero-card relative overflow-hidden rounded-[24px] border border-[#ADFF00]/25 bg-gradient-to-br from-[#182814] via-[#101B0F] to-[#0A1208] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.35)] sm:p-6"
        aria-label="Nutrition fuel summary"
      >
        <div className="fuel-hero-ambient-glow pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-[#ADFF00]/10 blur-3xl" />

        {/* Micro-Header Strip */}
        <div className="relative mb-3.5 flex items-center justify-between border-b border-white/5 pb-2.5">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isDayFinished ? "bg-emerald-400" : "bg-[#ADFF00]"} animate-pulse`} />
            <span className="fuel-hero-title text-[11px] font-black uppercase tracking-[0.16em] text-white/70">
              {isToday ? "Today's Fuel Target" : "Day's Fuel Target"}
            </span>
            {isDayFinished && (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[9px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1 shadow-[0_0_8px_rgba(52,211,153,0.2)]">
                <Check size={9} strokeWidth={3.5} /> Day Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-white/60">
            <span>Meals Logged:</span>
            <span className={`fuel-logged-badge rounded-md px-2 py-0.5 font-black flex items-center gap-1.5 transition-colors ${
              isDayFinished
                ? "bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 shadow-[0_0_10px_rgba(52,211,153,0.2)]"
                : "bg-white/10 text-white"
            }`}>
              {isDayFinished && <Check size={11} strokeWidth={3} className="text-emerald-400" />}
              <span>{loggedCount} / {totalMealSlotsCount}</span>
              {isDayFinished && <span className="text-[10px] text-emerald-400 font-bold">• All Done!</span>}
            </span>
          </div>
        </div>

        {/* Primary Calories Progress */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Flame className="fuel-flame-icon h-4 w-4 text-[#ADFF00]" />
              <span className="fuel-calories-label text-xs font-black uppercase tracking-wider text-white">
                Calories
              </span>
            </div>
            <div className="text-right">
              <span className="fuel-calories-val text-base font-black text-white sm:text-lg">
                {number(consumedCals)}
              </span>
              <span className="fuel-calories-sub text-xs font-semibold text-white/45">
                {" "}/ {number(targetCals)} kcal
              </span>
            </div>
          </div>

          <div className="fuel-progress-track h-2.5 w-full overflow-hidden rounded-full bg-black/50 border border-white/5 p-[1px]">
            <div
              className="fuel-progress-fill h-full rounded-full bg-gradient-to-r from-[#ADFF00] via-[#c4ff4d] to-emerald-400 shadow-[0_0_12px_rgba(173,255,0,0.35)] transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, caloriePercent))}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-white/50 px-0.5">
            <span className="fuel-percent-text">{caloriePercent}% target hit</span>
            <span className="fuel-remaining-text font-bold text-[#ADFF00]">
              {number(calorieRemaining)} kcal remaining
            </span>
          </div>
        </div>

        {/* 3 Secondary Macro Pillars (Protein, Carbs, Fat) */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {/* Protein */}
          <div className="fuel-macro-pillar rounded-xl border border-white/5 bg-black/30 p-2.5 sm:p-3 flex flex-col justify-between gap-1.5">
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
            <div className="fuel-macro-track h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="fuel-pro-fill h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, proPercent))}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="fuel-macro-pillar rounded-xl border border-white/5 bg-black/30 p-2.5 sm:p-3 flex flex-col justify-between gap-1.5">
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
            <div className="fuel-macro-track h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="fuel-carbs-fill h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, carbsPercent))}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="fuel-macro-pillar rounded-xl border border-white/5 bg-black/30 p-2.5 sm:p-3 flex flex-col justify-between gap-1.5">
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
            <div className="fuel-macro-track h-1.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="fuel-fat-fill h-full rounded-full bg-gradient-to-r from-rose-400 to-pink-400 transition-all duration-500"
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
            const isCompleted = completedDays.has(date) || (isSelected && isDayFinished);
            return (
              <button
                key={date}
                type="button"
                onClick={() => chooseDay(date)}
                aria-pressed={isSelected}
                className={`relative min-w-0 rounded-2xl border px-1 py-2 text-center transition active:scale-95 ${
                  isSelected
                    ? "border-[#ADFF00] bg-[#ADFF00] text-[#0A1108] shadow-[0_4px_16px_rgba(173,255,0,0.3)] font-black"
                    : isCompleted
                    ? "border-emerald-500/40 bg-[#0E1B10] text-emerald-300 hover:border-emerald-400/60 hover:text-white"
                    : "border-white/10 bg-[#111A10] text-white/55 hover:border-white/25 hover:text-white"
                }`}
              >
                {/* Completed food indicator badge */}
                {isCompleted && (
                  <span
                    title="All meals finished for this day"
                    className={`absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black shadow-md ${
                      isSelected
                        ? "bg-[#0A1108] text-[#ADFF00] ring-2 ring-[#ADFF00]"
                        : "bg-emerald-500 text-black ring-2 ring-[#0A1108]"
                    }`}
                  >
                    <Check size={10} strokeWidth={3.5} />
                  </span>
                )}

                <span className="block text-[9px] font-bold uppercase tracking-wider sm:text-[10px]">
                  {displayDate(date, { weekday: "short" })}
                </span>
                <span className="mt-0.5 block text-base font-black sm:text-lg">{date.slice(-2)}</span>

                {/* Day status indicator: Completed check / Today dot / spacer */}
                {isCompleted ? (
                  <span
                    className={`mx-auto mt-0.5 flex h-2 items-center justify-center text-[9px] font-black ${
                      isSelected ? "text-[#0A1108]" : "text-emerald-400"
                    }`}
                  >
                    <Check size={11} strokeWidth={3.5} />
                  </span>
                ) : isCurrentToday ? (
                  <span
                    className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${
                      isSelected ? "bg-[#0A1108]" : "bg-[#ADFF00]"
                    }`}
                  />
                ) : (
                  <span className="mx-auto mt-1 block h-1.5 w-1.5 opacity-0" />
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
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#ADFF00]">Fuel Timeline</p>
              {isDayFinished && (
                <span className="rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-400 flex items-center gap-1 shadow-[0_0_10px_rgba(52,211,153,0.2)]">
                  <Check size={11} strokeWidth={3} /> Day Complete
                </span>
              )}
            </div>
            <h2 className="mt-0.5 text-xl font-black text-white sm:text-2xl">
              Meals for {displayDate(selectedDate, { weekday: "long" })}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isDayFinished ? (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/20 px-2.5 py-1 text-xs font-black text-emerald-400 flex items-center gap-1.5 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
                <Check size={13} strokeWidth={3} /> {loggedCount}/{totalMealSlotsCount} Finished
              </span>
            ) : current?.planId ? (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/50">
                {current.meals.length} planned
              </span>
            ) : null}
            {extraMeals.length > 0 && !isDayFinished && (
              <span className="rounded-full border border-[#ADFF00]/20 bg-[#ADFF00]/10 px-2.5 py-1 text-xs font-bold text-[#ADFF00]">
                +{extraMeals.length} extra logged
              </span>
            )}
          </div>
        </div>

        {/* Day Finished Celebratory Banner */}
        {isDayFinished && (
          <div className="mb-3.5 flex items-center gap-3 rounded-2xl border border-emerald-500/35 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-transparent p-3 sm:p-3.5 shadow-[0_4px_20px_rgba(16,185,129,0.12)]">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_12px_rgba(52,211,153,0.25)]">
              <Check size={18} strokeWidth={3} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 sm:text-sm">
                  Day&apos;s Food Finished!
                </h4>
                <span className="rounded-md bg-emerald-500/25 px-1.5 py-0.5 text-[10px] font-black text-emerald-300">
                  {loggedCount}/{totalMealSlotsCount} Logged
                </span>
              </div>
              <p className="mt-0.5 text-xs text-emerald-200/80">
                All planned meals for {displayDate(selectedDate, { weekday: "long" })} have been logged. Outstanding consistency staying on track with your fuel target!
              </p>
            </div>
          </div>
        )}

        {loading && !current && (
          <div className="space-y-2.5" aria-label="Loading meals">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3.5 sm:p-4 animate-pulse"
              >
                <div className="h-12 w-12 rounded-xl bg-white/10 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3.5 w-1/3 rounded bg-white/10" />
                  <div className="h-2.5 w-1/2 rounded bg-white/5" />
                </div>
              </div>
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

        {!loading && !error && allTimelineMeals.length === 0 && (
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

        {current && allTimelineMeals.length > 0 && (
          <div className="space-y-2.5 sm:space-y-3">
            {allTimelineMeals.map((meal) => {
              const isExtra = meal.id.startsWith("extra-");
              const state = isExtra ? "LOGGED" : stateOf(meal, nextMealId);
              const logged = state === "LOGGED";
              const actual = actualTotals(meal);
              const differentFood = !isExtra && logged && meal.logs.some((log) => !log.plannedMealId);
              const actualTitle = (isExtra || differentFood) && meal.logs.length > 0
                ? meal.logs.map((log) => cleanFoodName(log.name)).join(" · ")
                : cleanFoodName(meal.name);
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
                        name={(isExtra || differentFood) && meal.logs.length > 0 ? cleanFoodName(meal.logs[0].name) : cleanFoodName(meal.name)}
                        imageUrl={isExtra || differentFood ? undefined : meal.imageUrl}
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
                        {fixtureMode ? (
                          <span className="text-[9px] font-bold uppercase text-white/50">{state}</span>
                        ) : (
                          <>
                            {state === "NEXT" && (
                              <span className="rounded bg-[#ADFF00] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#0A1108]">
                                Next Up
                              </span>
                            )}
                            {state === "SKIPPED" && (
                              <span className="rounded bg-rose-500/20 border border-rose-500/30 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-rose-300">
                                SKIPPED
                              </span>
                            )}
                          </>
                        )}
                        {isExtra && (
                          <span className="rounded bg-[#ADFF00]/15 border border-[#ADFF00]/25 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#ADFF00]">
                            Extra
                          </span>
                        )}
                      </div>

                      {/* Food / Recipe Title */}
                      <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-white sm:text-base">
                        {actualTitle}
                      </h3>

                      {/* Compact Macro Badges (Calories, Protein, Cost) */}
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
                        <span className="rounded-md bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-2 py-0.5 text-[#ADFF00]">
                          {number(shownCalories)} kcal
                        </span>
                        <span className="rounded-md bg-sky-400/10 border border-sky-400/20 px-2 py-0.5 text-sky-300">
                          {number(shownProtein)}g protein
                        </span>
                        {!isExtra && Number(meal.cost) > 0 && (
                          <span className="text-[10px] font-medium text-white/40">
                            ₹{number(meal.cost)}
                          </span>
                        )}
                        {differentFood && (
                          <span className="text-[10px] font-semibold text-amber-300">
                            (custom food · planned: {meal.name})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Actions (Log button + Swap & Details) */}
                    <div className="flex shrink-0 flex-col items-end justify-between self-stretch gap-1.5">
                      {!logged && state !== "SKIPPED" && isToday && isPro ? (
                        <button
                          type="button"
                          disabled={Boolean(loggingMealId && loggingMealId === meal.id)}
                          onClick={() => void logPlanned(meal)}
                          className="rounded-xl bg-[#ADFF00] px-3.5 py-1.5 text-xs font-black text-[#0A1108] shadow-sm transition hover:bg-[#c3ff42] active:scale-95 disabled:opacity-50 touch-manipulation select-none cursor-pointer"
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
                        {!isExtra && !logged && state !== "SKIPPED" && !isPast && isPro && (
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
                          title={expanded ? "Less detail" : isExtra ? "View logged items" : "View ingredients & prep"}
                        >
                          <ChevronDown
                            size={14}
                            className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Drawer: Macros & Details */}
                  {expanded && (
                    <div className="flex flex-col gap-4 border-t border-white/5 bg-black/20 p-3.5 text-xs sm:p-5 w-full min-w-0 max-w-full overflow-hidden">
                      {/* Macro Breakdown Strip */}
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2 rounded-xl border border-white/5 bg-black/40 p-2.5 text-center min-w-0 w-full">
                        <div className="min-w-0">
                          <span className="block text-[9px] font-black uppercase tracking-wider text-white/40 truncate">Calories</span>
                          <span className="text-xs font-black text-[#ADFF00] truncate block">{number(shownCalories)} kcal</span>
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[9px] font-black uppercase tracking-wider text-sky-400 truncate">Protein</span>
                          <span className="text-xs font-black text-sky-300 truncate block">{number(shownProtein)}g</span>
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[9px] font-black uppercase tracking-wider text-amber-400 truncate">Carbs</span>
                          <span className="text-xs font-black text-amber-300 truncate block">{number(shownCarbs)}g</span>
                        </div>
                        <div className="min-w-0">
                          <span className="block text-[9px] font-black uppercase tracking-wider text-rose-400 truncate">Fat</span>
                          <span className="text-xs font-black text-rose-300 truncate block">{number(shownFat)}g</span>
                        </div>
                      </div>

                      {/* If Extra logged meal: list of logged items + delete button + add more */}
                      {isExtra ? (
                        <div className="w-full min-w-0">
                          <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                            Logged Food Items ({meal.logs.length})
                          </h4>
                          <ul className="space-y-2 w-full min-w-0">
                            {meal.logs.map((log) => (
                              <li
                                key={log.id}
                                className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/[0.03] p-2.5 min-w-0 overflow-hidden"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="font-bold text-white text-xs truncate min-w-0">{cleanFoodName(log.name)}</span>
                                    {log.serving && (
                                      <span className="text-[10px] text-white/40 shrink-0 max-w-[120px] truncate">({cleanServing(log.serving)})</span>
                                    )}
                                  </div>
                                  <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-white/50">
                                    <span className="text-[#ADFF00] font-semibold">{number(log.calories)} kcal</span>
                                    <span>·</span>
                                    <span className="text-sky-300 font-semibold">{number(log.protein)}g pro</span>
                                    <span>·</span>
                                    <span className="text-amber-300 font-semibold">{number(log.carbs)}g carb</span>
                                    <span>·</span>
                                    <span className="text-rose-300 font-semibold">{number(log.fat)}g fat</span>
                                  </div>
                                </div>
                                {isToday && (
                                  <button
                                    type="button"
                                    disabled={deletingLogId === log.id}
                                    onClick={() => void handleDeleteFood(log.id, log.name)}
                                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-rose-400 hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300 transition"
                                    title={`Remove ${cleanFoodName(log.name)}`}
                                  >
                                    {deletingLogId === log.id ? (
                                      <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                      <Trash2 size={12} />
                                    )}
                                  </button>
                                )}
                              </li>
                            ))}
                          </ul>
                          {isToday && isPro && (
                            <button
                              type="button"
                              onClick={() => setManualSlot(meal.slot)}
                              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#ADFF00] hover:underline"
                            >
                              <Plus size={13} />
                              <span>Log more to {titleCase(meal.slot)}</span>
                            </button>
                          )}
                        </div>
                      ) : (
                        /* Planned meal expanded content */
                        <>
                          <div className="w-full min-w-0">
                            <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                              Full Ingredients
                            </h4>
                            <ul className="space-y-1.5 w-full min-w-0">
                              {meal.ingredients.map((item) => (
                                <li key={item.id} className="flex items-center justify-between gap-3 text-white/75 min-w-0">
                                  <span className="min-w-0 flex-1 truncate text-white/85">
                                    {cleanFoodName(item.name)}
                                    {item.isProvided && (
                                      <span className="ml-1.5 text-[9px] font-bold text-[#ADFF00] shrink-0 inline-block">Provided</span>
                                    )}
                                  </span>
                                  <span className="whitespace-nowrap font-bold text-white shrink-0 text-right text-xs">{cleanServing(item.quantity)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="w-full min-w-0">
                            <h4 className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                              Preparation
                            </h4>
                            <p className="leading-relaxed text-white/70 break-words whitespace-normal text-xs">
                              {meal.prepInstructions || "Preparation instructions are not available for this meal."}
                            </p>

                            {meal.whyThisMeal && (
                              <div className="mt-3 w-full min-w-0">
                                <h4 className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/45">
                                  Why This Meal Fits Your Goal
                                </h4>
                                <p className="leading-relaxed text-white/70 break-words whitespace-normal text-xs">{meal.whyThisMeal}</p>
                              </div>
                            )}

                            {logged && meal.logs.length > 0 && (
                              <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 min-w-0 w-full">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <p className="text-[11px] font-black text-emerald-300 uppercase tracking-wider">
                                    Actual food logged
                                  </p>
                                  <span className="text-[10px] font-bold text-emerald-400/70">
                                    {meal.logs.length} item{meal.logs.length === 1 ? "" : "s"}
                                  </span>
                                </div>
                                <ul className="space-y-2 w-full min-w-0">
                                  {meal.logs.map((log) => (
                                    <li
                                      key={log.id}
                                      className="flex items-center justify-between gap-2.5 rounded-xl border border-white/5 bg-black/30 p-2.5 min-w-0 overflow-hidden"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-1.5 min-w-0">
                                          <span className="text-xs font-bold text-white truncate min-w-0">
                                            {cleanFoodName(log.name)}
                                          </span>
                                          {log.serving && (
                                            <span className="text-[10px] text-white/50 shrink-0 max-w-[120px] truncate">
                                              ({cleanServing(log.serving)})
                                            </span>
                                          )}
                                        </div>
                                        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[10px] text-white/60">
                                          <span className="text-[#ADFF00] font-bold">
                                            {number(log.calories)} kcal
                                          </span>
                                          <span>·</span>
                                          <span className="text-sky-300 font-bold">
                                            {number(log.protein)}g pro
                                          </span>
                                          {Number(log.carbs) > 0 && (
                                            <>
                                              <span>·</span>
                                              <span className="text-amber-300">
                                                {number(log.carbs)}g carb
                                              </span>
                                            </>
                                          )}
                                          {Number(log.fat) > 0 && (
                                            <>
                                              <span>·</span>
                                              <span className="text-rose-300">
                                                {number(log.fat)}g fat
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      {isToday && (
                                        <button
                                          type="button"
                                          disabled={deletingLogId === log.id}
                                          onClick={() => void handleDeleteFood(log.id, log.name)}
                                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-rose-400 hover:border-rose-400/40 hover:bg-rose-400/10 hover:text-rose-300 active:scale-95 transition cursor-pointer"
                                          title={`Remove ${cleanFoodName(log.name)}`}
                                        >
                                          {deletingLogId === log.id ? (
                                            <Loader2 size={12} className="animate-spin" />
                                          ) : (
                                            <Trash2 size={12} />
                                          )}
                                        </button>
                                      )}
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
                        </>
                      )}
                    </div>
                  )}
                </article>
              );
            })}

            {/* Quick "+ Log Snack or Extra Food" button at bottom of timeline */}
            {isToday && (
              <button
                type="button"
                onClick={() => setManualSlot("snack")}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-3 text-xs font-bold text-white/60 transition hover:border-[#ADFF00]/40 hover:bg-[#ADFF00]/5 hover:text-[#ADFF00] active:scale-[0.99] touch-manipulation select-none cursor-pointer"
              >
                <Plus size={15} />
                <span>+ Log Snack or Extra Food</span>
              </button>
            )}
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
            onAddWater={handleAddWater}
            onRemoveWater={handleRemoveWater}
            onResetWater={handleResetWater}
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
          onSuccess={(loggedData) => {
            handleOptimisticLog(loggedData, manualSlot);
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
