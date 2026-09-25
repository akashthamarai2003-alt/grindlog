"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, RefreshCw, Plus, Zap, Dumbbell, Apple, Salad, Coffee, Beef, Loader2, Edit3, X, Check, Trash2, Sparkles, Lock, Clock } from "lucide-react";
import { FoodAvatar } from "./food-avatar";
import { getMealHeroPhoto, getFoodEmoji } from "@/lib/utils/food-images";
import { WaterBottleCard } from "./water-bottle-card";
import { WaterHistoryCard } from "./water-history-card";
import { TodaySummaryCard } from "./today-summary-card";
import { nutritionApi, nutritionClientCache } from "@/lib/api/nutrition";
import { LogFoodModal } from "./log-food-modal";
import { SwapMealModal } from "./swap-meal-modal";
import { ProUpgradeModal } from "@/components/fitness/pro-upgrade-modal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

function formatDateInTimeZone(timeZone?: string, date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit'
    }).formatToParts(date);
    const getPart = (type: string) => parts.find((part) => part.type === type)?.value || '';
    return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
  } catch {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  }
}

export function NutritionView({ initialData, isPro = true }: { initialData?: any; isPro?: boolean } = {}) {
  const router = useRouter();
  const initialDateStr = initialData?.date;
  const userTimeZoneRef = useRef<string | undefined>(initialData?.timezone);
  const [todayDateStr, setTodayDateStr] = useState<string>(() => initialDateStr || formatDateInTimeZone(initialData?.timezone));
  const todayDateRef = useRef(todayDateStr);

  const [data, setData] = useState<any>(() => {
    const dateKey = initialDateStr || (typeof window !== "undefined" ? formatDateInTimeZone(initialData?.timezone) : "");
    if (dateKey) {
      const cached = nutritionClientCache.get(dateKey, initialData?.user_id);
      if (cached && ((cached.logged_foods?.length || 0) > 0 || (cached.consumed?.calories || 0) > 0)) {
        return {
          ...(initialData || {}),
          ...cached,
          consumed: cached.consumed || initialData?.consumed,
          logged_foods: cached.logged_foods || initialData?.logged_foods,
          meals: (cached.meals && cached.meals.length > 0) ? cached.meals : initialData?.meals,
        };
      }
    }
    return initialData || null;
  });
  const [isLoading, setIsLoading] = useState(!initialData && !data);
  const [isDateLoading, setIsDateLoading] = useState(false);
  const [dateLoadError, setDateLoadError] = useState<string | null>(null);
  const [error, setError] = useState<any>(null);

  // Week navigation offset (0 = current week, +1 = next week, -1 = previous week)
  const [weekOffset, setWeekOffset] = useState(0);

  // Date navigation & swap modal states
  const [selectedDate, setSelectedDate] = useState<string>(initialData?.date || todayDateStr);
  const selectedDateRef = useRef<string>(initialData?.date || todayDateStr);

  const isFuture = Boolean(selectedDate && selectedDate > todayDateStr);
  const isToday = !selectedDate || selectedDate === todayDateStr;
  const isPast = Boolean(selectedDate && selectedDate < todayDateStr);
  const dateCacheRef = useRef<Record<string, any>>({});
  const isInternalUpdateRef = useRef(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [selectedMealOptions, setSelectedMealOptions] = useState<Record<string, 'A' | 'B'>>({});
  const [swapMealType, setSwapMealType] = useState<string>("breakfast");
  
  // Water debouncing refs for instantaneous zero-lag tapping
  const pendingWaterDeltaRef = useRef<number>(0);
  const waterInFlightDeltaRef = useRef<number>(0);
  const waterDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState("lunch");
  const [modalPreselectedFoods, setModalPreselectedFoods] = useState<any[]>([]);

  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalFeature, setProModalFeature] = useState("This feature");

  const triggerProModal = (feature: string) => {
    setProModalFeature(feature);
    setProModalOpen(true);
  };

  const [isGenerating, setIsGenerating] = useState(false);
  const [showTargetsModal, setShowTargetsModal] = useState(false);

  // Targets Modal Form State
  const [targetForm, setTargetForm] = useState({
    calories: initialData?.targets?.calories || 2000,
    protein: initialData?.targets?.protein || 130,
    carbs: initialData?.targets?.carbs || 225,
    fat: initialData?.targets?.fat || 55,
    water_ml: initialData?.targets?.water_ml || 3000
  });

  const weekDates = useMemo(() => {
    const baseDate = new Date(todayDateStr + 'T12:00:00');
    const currentDay = baseDate.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - distanceToMonday + (weekOffset * 7));

    const dates = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = formatDateInTimeZone(undefined, d);
      dates.push({
        dateStr: iso,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        isToday: iso === todayDateStr
      });
    }
    return dates;
  }, [todayDateStr, weekOffset]);

  useEffect(() => {
    const syncDay = () => {
      const currentDate = formatDateInTimeZone(userTimeZoneRef.current);
      const previousDate = todayDateRef.current;
      if (currentDate === previousDate) return;
      todayDateRef.current = currentDate;
      setTodayDateStr(currentDate);
      if (selectedDateRef.current === previousDate) {
        selectedDateRef.current = currentDate;
        setSelectedDate(currentDate);
        setWeekOffset(0);
        nutritionApi.getToday(currentDate).then((fresh) => {
          if (fresh?.date === selectedDateRef.current) setData(fresh);
        }).catch(() => {});
      } else {
        const selected = new Date(`${selectedDateRef.current}T12:00:00`);
        const current = new Date(`${currentDate}T12:00:00`);
        selected.setDate(selected.getDate() - (selected.getDay() + 6) % 7);
        current.setDate(current.getDate() - (current.getDay() + 6) % 7);
        setWeekOffset(Math.round((selected.getTime() - current.getTime()) / (7 * 24 * 60 * 60 * 1000)));
      }
    };
    const interval = window.setInterval(syncDay, 60_000);
    syncDay();
    window.addEventListener('focus', syncDay);
    document.addEventListener('visibilitychange', syncDay);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', syncDay);
      document.removeEventListener('visibilitychange', syncDay);
    };
  }, []);

  const getActiveMealType = () => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 19) return 'pre_workout';
    if (hour >= 19 && hour <= 23) return 'dinner';
    return 'breakfast';
  };

  // Sync cache whenever data changes
  useEffect(() => {
    if (data?.date && !data._isDatePlaceholder) {
      dateCacheRef.current[data.date] = data;
      nutritionClientCache.set(data.date, data);
    }
  }, [data]);

  // Background prefetch all 7 days of the week so date switching is 0ms instant
  useEffect(() => {
    if (!data) return;

    if (data.date && !data._isDatePlaceholder) {
      dateCacheRef.current[data.date] = data;
      nutritionClientCache.set(data.date, data);
    }

    weekDates.forEach((w) => {
      const d = w.dateStr;
      if (d !== data.date && !dateCacheRef.current[d]) {
        nutritionApi.getToday(d).then((res) => {
          if (res?.date) {
            dateCacheRef.current[res.date] = res;
            nutritionClientCache.set(res.date, res);
            if (selectedDateRef.current === res.date) {
              setData(res);
              setIsDateLoading(false);
              setDateLoadError(null);
            }
          }
        }).catch(() => {});
      }
    });
  }, [weekDates, !data]);

  const fetchToday = async (dateParam?: string, isInitial: boolean = false) => {
    try {
      const targetDate = dateParam || selectedDateRef.current || selectedDate;
      const loadUserToday = isInitial && !initialData && !dateParam;
      const cached = nutritionClientCache.get(targetDate, initialData?.user_id || data?.user_id);
      if (cached && (!data || ((cached.logged_foods?.length || 0) > 0 || (cached.consumed?.calories || 0) > 0))) {
        setData((prev: any) => {
          if (!prev) return cached;
          const prevCount = prev?.logged_foods?.length || 0;
          const cachedCount = cached?.logged_foods?.length || 0;
          if (cachedCount >= prevCount) return cached;
          return prev;
        });
        dateCacheRef.current[targetDate] = cached;
      }

      if ((isInitial && !data && !cached) || (!data && !cached)) {
        setIsLoading(true);
      }
      const res = await nutritionApi.getToday(loadUserToday ? undefined : targetDate);
      if (res?.timezone) userTimeZoneRef.current = res.timezone;
      if (res?.date) {
        dateCacheRef.current[res.date] = res;
        nutritionClientCache.set(res.date, res);
      }
      if (loadUserToday || !selectedDateRef.current || selectedDateRef.current === (res?.date || targetDate)) {
        setData(res);
        if (res?.date) {
          setSelectedDate(res.date);
          selectedDateRef.current = res.date;
          if (loadUserToday) {
            todayDateRef.current = res.date;
            setTodayDateStr(res.date);
          }
        }
      }
      if (res?.targets) {
        setTargetForm({
          calories: res.targets.calories || 2000,
          protein: res.targets.protein || 130,
          carbs: res.targets.carbs || 225,
          fat: res.targets.fat || 55,
          water_ml: res.targets.water_ml || 3000
        });
      }
      setError(null);
    } catch (err: any) {
      if (isInitial || !data) {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialData) return;
    setData((prev: any) => {
      if (!prev) return initialData;
      const prevCount = prev?.logged_foods?.length || 0;
      const newCount = initialData?.logged_foods?.length || 0;
      const prevCals = Number(prev?.consumed?.calories) || 0;
      const newCals = Number(initialData?.consumed?.calories) || 0;

      // If active state has MORE logged foods than initialData, or active state has calories while initialData has 0,
      // preserve active state so we never drop newly logged meals!
      if (prevCount > newCount || (prevCals > 0 && newCals === 0)) {
        return {
          ...initialData,
          consumed: prev.consumed,
          logged_foods: prev.logged_foods,
          meals: (prev.meals && prev.meals.length > 0) ? prev.meals : initialData.meals,
          targets: initialData.targets || prev.targets,
        };
      }
      return initialData;
    });
  }, [initialData]);

  useEffect(() => {
    if (!initialData) {
      fetchToday(undefined, true);
    } else {
      // Quiet background revalidation on mount so navigation from dashboard reflects latest logs
      fetchToday(undefined, false);
    }

    const handleSync = () => {
      if (isInternalUpdateRef.current) {
        isInternalUpdateRef.current = false;
        return;
      }
      const targetDate = selectedDateRef.current || todayDateStr;
      const cached = nutritionClientCache.get(targetDate, initialData?.user_id || data?.user_id);
      if (cached) {
        setData(cached);
        dateCacheRef.current[targetDate] = cached;
      }
      if (selectedDateRef.current) {
        delete dateCacheRef.current[selectedDateRef.current];
      }
      fetchToday(selectedDateRef.current, false);
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "grindlog_meals_last_updated") {
        handleSync();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        handleSync();
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("grindlog_meals_updated", handleSync);
      window.addEventListener("focus", handleSync);
      window.addEventListener("storage", handleStorage);
      document.addEventListener("visibilitychange", handleVisibility);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("grindlog_meals_updated", handleSync);
        window.removeEventListener("focus", handleSync);
        window.removeEventListener("storage", handleStorage);
        document.removeEventListener("visibilitychange", handleVisibility);
      }
    };
  }, []);

  const handleSelectDate = (dateStr: string, forceReload = false) => {
    if (selectedDate === dateStr && !forceReload) return;
    setDateLoadError(null);

    // Flush any pending water updates before switching dates
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
      flushWaterSync();
    }

    setSelectedDate(dateStr);
    selectedDateRef.current = dateStr;

    // 1. Instant Cache HIT (0ms switch)
    if (dateCacheRef.current[dateStr]) {
      setIsDateLoading(false);
      setData(dateCacheRef.current[dateStr]);
      // Quiet background revalidation
      nutritionApi.getToday(dateStr).then((res) => {
        if (res?.date) {
          dateCacheRef.current[res.date] = res;
          if (selectedDateRef.current === res.date) {
            setData(res);
          }
        }
      }).catch(() => {});
      return;
    }

    // 2. Cache MISS: Optimistic instant switch in 0ms without skeleton/unmount
    setIsDateLoading(true);
    const clickedDateObj = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[clickedDateObj.getDay()] || 'Day';

    setData((prev: any) => {
      if (!prev) return prev;
      const t = prev.targets || { calories: 2000, protein: 130, carbs: 225, fat: 55, water_ml: 3000 };
      return {
        ...prev,
        date: dateStr,
        _isDatePlaceholder: true,
        day_of_week: dayName,
        meals: [],
        logged_foods: [],
        water_logs: [],
        water_consumed_ml: 0,
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0, water_ml: 0 },
        remaining: { calories: t.calories, protein: t.protein, carbs: t.carbs, fat: t.fat, water_ml: t.water_ml },
        budget: { ...prev.budget, spent: 0, monthly_spent: 0 },
        progress: { calories_percent: 0, protein_percent: 0, water_percent: 0 },
        nutrition_score: 0
      };
    });

    // 3. Fetch from API in background quietly
    nutritionApi.getToday(dateStr).then((res) => {
      if (res?.date) {
        dateCacheRef.current[res.date] = res;
        if (selectedDateRef.current === res.date) {
          setData(res);
          setIsDateLoading(false);
        }
      }
    }).catch((err) => {
      console.error("Failed to load date details:", err);
      if (selectedDateRef.current === dateStr) {
        setDateLoadError(err?.message || "Could not load meals for this date.");
        setIsDateLoading(false);
      }
    });
  };

  const openTargetsModal = () => {
    if (!isToday) {
      toast.info("Targets can only be changed for today and upcoming days.");
      return;
    }
    if (!isPro) {
      triggerProModal("Custom Macro Targets");
      return;
    }
    if (data?.targets) {
      setTargetForm({
        calories: Number(data.targets.calories) || 2000,
        protein: Number(data.targets.protein) || 130,
        carbs: Number(data.targets.carbs) || 225,
        fat: Number(data.targets.fat) || 55,
        water_ml: Number(data.targets.water_ml) || 3000
      });
    }
    setShowTargetsModal(true);
  };

  const handleSetDailyTargets = async (customPayload?: any) => {
    const payload = customPayload || targetForm;
    const previousData = data;
    setIsGenerating(true);

    const targetCals = Number(payload.calories) || 2000;
    const targetPro = Number(payload.protein) || 130;
    const targetCarbs = Number(payload.carbs) || 225;
    const targetFat = Number(payload.fat) || 55;
    const targetWater = Math.min(8000, Math.max(1000, Number(payload.water_ml) || 3000));

    // 0ms Instant optimistic UI update
    setData((prev: any) => {
      if (!prev) return prev;
      const consumedCals = Number(prev.consumed?.calories) || 0;
      const consumedPro = Number(prev.consumed?.protein) || 0;
      const consumedWater = Number(prev.consumed?.water_ml) || 0;

      return {
        ...prev,
        targets: {
          ...prev.targets,
          calories: targetCals,
          protein: targetPro,
          carbs: targetCarbs,
          fat: targetFat,
          water_ml: targetWater
        },
        remaining: {
          ...prev.remaining,
          calories: Math.max(0, targetCals - consumedCals),
          protein: Math.max(0, targetPro - consumedPro)
        },
        progress: {
          ...prev.progress,
          calories_percent: Math.min(100, Math.round((consumedCals / (targetCals || 1)) * 100)),
          protein_percent: Math.min(100, Math.round((consumedPro / (targetPro || 1)) * 100)),
          water_percent: Math.min(100, Math.round((consumedWater / (targetWater || 1)) * 100))
        }
      };
    });

    setShowTargetsModal(false);
    toast.success("Daily nutrition targets saved!");

    try {
      await nutritionApi.setTargets(payload);
      // Clear cache so other days refresh with new target thresholds
      dateCacheRef.current = {};
      const updated = await nutritionApi.getToday(selectedDateRef.current);
      if (updated) {
        setData(updated);
        dateCacheRef.current[updated.date || selectedDateRef.current] = updated;
      }
    } catch (err: any) {
      console.error("Failed to save targets:", err);
      setData(previousData);
      toast.error(err?.message || "Failed to save daily targets");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSwapOption = async (chosenOption: any) => {
    if (!data) return;
    const previousData = data;
    const targetDate = selectedDate || data.date;

    // Instant optimistic swap in 0ms!
    setData((prev: any) => {
      if (!prev) return prev;
      const updatedMeals = (prev.meals || []).map((m: any) => {
        if (m.meal_type !== swapMealType) return m;

        const newItems = chosenOption.items.map((it: any, idx: number) => ({
          id: `swapped-${idx}`,
          quantity: it.quantity || 1,
          foods: {
            id: it.food_id || it.id,
            name: it.name,
            category: it.category || 'General',
            serving_size: it.serving_size,
            calories: it.calories,
            protein: it.protein,
            carbs: it.carbs,
            fat: it.fat,
            estimated_cost: it.estimated_cost
          }
        }));

        return {
          ...m,
          name: chosenOption.name,
          calories: chosenOption.calories,
          protein: chosenOption.protein,
          carbs: chosenOption.carbs,
          fat: chosenOption.fat,
          meal_plan_items: newItems
        };
      });

      return {
        ...prev,
        meals: updatedMeals
      };
    });

    toast.success(`Swapped to ${chosenOption.name}!`);

    try {
      await nutritionApi.swapMeal(swapMealType, chosenOption, targetDate);
      nutritionApi.getToday(targetDate).then(res => { if (res) setData(res); }).catch(() => {});
    } catch (err: any) {
      setData(previousData);
      toast.error(err?.message || "Failed to save meal swap to server");
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await nutritionApi.generatePlan();
      // Invalidate local client date cache and global client cache so all screens reload fresh meals
      dateCacheRef.current = {};
      nutritionClientCache.clear();
      nutritionClientCache.notifyUpdated();
      // Generation always starts today, never at the future week being browsed.
      setWeekOffset(0);
      try {
        const fresh = await nutritionApi.getToday();
        if (!fresh?.date) throw new Error("Could not load the new plan.");
        if (fresh.timezone) userTimeZoneRef.current = fresh.timezone;
        todayDateRef.current = fresh.date;
        setTodayDateStr(fresh.date);
        setSelectedDate(fresh.date);
        selectedDateRef.current = fresh.date;
        setData(fresh);
        setDateLoadError(null);
        setIsDateLoading(false);
      } catch {
        toast.warning("Plan saved, but the page could not refresh. Please reload to see it.");
        router.refresh();
        return;
      }
      if (res.existing) toast.info(res.message);
      else toast.success(res.message || "7-Day meal plan generated successfully!");
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const flushWaterSync = () => {
    const delta = pendingWaterDeltaRef.current;
    if (delta === 0) return;
    pendingWaterDeltaRef.current = 0;
    waterInFlightDeltaRef.current += delta;

    const targetDate = selectedDateRef.current;

    const handleSuccess = (res: any) => {
      waterInFlightDeltaRef.current -= delta;
      if (res?.total_water_ml !== undefined) {
        setData((prev: any) => {
          if (!prev) return prev;
          const targetWater = Number(prev.targets?.water_ml) || 2500;
          // Reconcile: server confirmed total + any in-flight or newly queued user clicks
          const unconfirmed = waterInFlightDeltaRef.current + pendingWaterDeltaRef.current;
          const reconciledTotal = Math.max(0, res.total_water_ml + unconfirmed);
          const updated = {
            ...prev,
            consumed: { ...prev.consumed, water_ml: reconciledTotal },
            progress: {
              ...prev.progress,
              water_percent: Math.min(100, Math.round((reconciledTotal / (targetWater || 1)) * 100))
            }
          };
          if (targetDate) {
            dateCacheRef.current[targetDate] = updated;
          }
          return updated;
        });
      }
    };

    const handleError = (err: any) => {
      waterInFlightDeltaRef.current -= delta;
      console.error("Failed to sync water to server:", err);
      toast.error("Failed to sync water to server");
      // Revert the failed delta
      setData((prev: any) => {
        if (!prev) return prev;
        const current = Number(prev.consumed?.water_ml) || 0;
        const reverted = Math.max(0, current - delta);
        const targetWater = Number(prev.targets?.water_ml) || 2500;
        return {
          ...prev,
          consumed: { ...prev.consumed, water_ml: reverted },
          progress: {
            ...prev.progress,
            water_percent: Math.min(100, Math.round((reverted / (targetWater || 1)) * 100))
          }
        };
      });
    };

    if (delta > 0) {
      nutritionApi.logWater(delta).then(handleSuccess).catch(handleError);
    } else {
      nutritionApi.removeWater(Math.abs(delta)).then(handleSuccess).catch(handleError);
    }
  };

  useEffect(() => {
    return () => {
      if (waterDebounceTimerRef.current) {
        clearTimeout(waterDebounceTimerRef.current);
        flushWaterSync();
      }
    };
  }, []);

  const handleDeleteFood = async (id: string, foodName?: string) => {
    if (!isToday) {
      toast.info("Past meal history is read-only.");
      return;
    }
    if (!isPro) {
      triggerProModal("Food Logging");
      return;
    }
    if (!data) return;

    const previousData = data;
    const targetItem = data.logged_foods?.find((f: any) => f.id === id);

    // Instant optimistic removal (0ms!)
    setData((prev: any) => {
      if (!prev) return prev;
      const updatedLogged = (prev.logged_foods || []).filter((f: any) => f.id !== id);
      
      const subCals = Number(targetItem?.calories) || 0;
      const subPro = Number(targetItem?.protein) || 0;
      const subCarbs = Number(targetItem?.carbs) || 0;
      const subFat = Number(targetItem?.fat) || 0;
      const subCost = Number(targetItem?.estimated_cost) || 0;

      const newConsumedCals = Math.max(0, Math.round((Number(prev.consumed?.calories) || 0) - subCals));
      const newConsumedPro = Math.max(0, Math.round(((Number(prev.consumed?.protein) || 0) - subPro) * 10) / 10);
      const targetCals = Number(prev.targets?.calories) || 2000;
      const targetPro = Number(prev.targets?.protein) || 130;

      return {
        ...prev,
        logged_foods: updatedLogged,
        consumed: {
          ...prev.consumed,
          calories: newConsumedCals,
          protein: newConsumedPro,
          carbs: Math.max(0, (Number(prev.consumed?.carbs) || 0) - subCarbs),
          fat: Math.max(0, (Number(prev.consumed?.fat) || 0) - subFat),
        },
        remaining: {
          ...prev.remaining,
          calories: Math.max(0, targetCals - newConsumedCals),
          protein: Math.max(0, targetPro - newConsumedPro),
        },
        budget: {
          ...prev.budget,
          spent: Math.max(0, Math.round(((Number(prev.budget?.spent) || 0) - subCost) * 100) / 100),
          monthly_spent: Math.max(0, Math.round(((Number(prev.budget?.monthly_spent) || 0) - subCost) * 100) / 100),
        },
        progress: {
          ...prev.progress,
          calories_percent: Math.min(100, Math.round((newConsumedCals / (targetCals || 1)) * 100)),
          protein_percent: Math.min(100, Math.round((newConsumedPro / (targetPro || 1)) * 100)),
        }
      };
    });

    toast.success(`Removed ${foodName || "food"}`);

    try {
      await nutritionApi.deleteFood(id);
      isInternalUpdateRef.current = true;
      nutritionClientCache.notifyUpdated();
      // Quiet background reconciliation
      nutritionApi.getToday(selectedDateRef.current).then(res => {
        if (res) {
          setData(res);
          nutritionClientCache.set(res.date || selectedDateRef.current, res);
        }
      }).catch(() => {});
    } catch (err: any) {
      // Revert if API failed
      setData(previousData);
      toast.error(err?.message || "Failed to remove food from server");
    }
  };

  const handleAddWater = (amount: number) => {
    if (!isToday) {
      toast.info("Water can only be logged for today.");
      return;
    }
    if (!isPro) {
      triggerProModal("Water & Hydration Tracking");
      return;
    }
    if (!data) return;

    const MAX_DAILY_WATER_ML = 8000;
    const currentWater = Number(data.consumed?.water_ml) || 0;

    if (currentWater >= MAX_DAILY_WATER_ML) {
      toast.warning("Daily safety cap of 8L reached. Excessive water intake can cause water intoxication (hyponatremia).");
      return;
    }

    let effectiveAmount = amount;
    if (currentWater + effectiveAmount > MAX_DAILY_WATER_ML) {
      effectiveAmount = MAX_DAILY_WATER_ML - currentWater;
      toast.info(`Capped to daily limit of 8L (+${effectiveAmount}ml added).`);
    }

    let reachedGoal = false;
    let targetGoalLiters = "2.5";

    setData((prev: any) => {
      if (!prev) return prev;
      const targetWater = Number(prev.targets?.water_ml) || 2500;
      targetGoalLiters = (targetWater / 1000).toFixed(1);
      const curr = Number(prev.consumed?.water_ml) || 0;
      const newWater = Math.min(MAX_DAILY_WATER_ML, curr + effectiveAmount);
      if (newWater >= targetWater && curr < targetWater) {
        reachedGoal = true;
      }
      const updated = {
        ...prev,
        consumed: { ...prev.consumed, water_ml: newWater },
        progress: {
          ...prev.progress,
          water_percent: Math.min(100, Math.round((newWater / (targetWater || 1)) * 100))
        }
      };
      if (selectedDateRef.current) {
        dateCacheRef.current[selectedDateRef.current] = updated;
      }
      return updated;
    });

    if (reachedGoal) {
      toast.success(`🎉 Daily water goal of ${targetGoalLiters}L reached!`);
    } else if (effectiveAmount > 0) {
      toast.success(`Logged ${effectiveAmount}ml of water`);
    }

    // Debounce background API sync
    pendingWaterDeltaRef.current += effectiveAmount;
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    waterDebounceTimerRef.current = setTimeout(() => {
      flushWaterSync();
    }, 350);
  };

  const handleRemoveWater = (amount: number = 250) => {
    if (!isToday) {
      toast.info("Water can only be changed for today.");
      return;
    }
    if (!isPro) {
      triggerProModal("Water & Hydration Tracking");
      return;
    }
    if (!data) return;

    let didRemove = false;

    setData((prev: any) => {
      if (!prev) return prev;
      const targetWater = Number(prev.targets?.water_ml) || 2500;
      const currentWater = Number(prev.consumed?.water_ml) || 0;
      if (currentWater <= 0) return prev;
      didRemove = true;
      const newWater = Math.max(0, currentWater - amount);
      const updated = {
        ...prev,
        consumed: { ...prev.consumed, water_ml: newWater },
        progress: {
          ...prev.progress,
          water_percent: Math.min(100, Math.round((newWater / (targetWater || 1)) * 100))
        }
      };
      if (selectedDateRef.current) {
        dateCacheRef.current[selectedDateRef.current] = updated;
      }
      return updated;
    });

    if (!didRemove) return;

    toast.success(`Removed ${amount}ml of water`);

    pendingWaterDeltaRef.current -= amount;
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    waterDebounceTimerRef.current = setTimeout(() => {
      flushWaterSync();
    }, 350);
  };

  const handleResetWater = async () => {
    if (!isToday) {
      toast.info("Water can only be changed for today.");
      return;
    }
    if (!isPro) {
      triggerProModal("Water & Hydration Tracking");
      return;
    }
    if (typeof window !== "undefined" && !window.confirm("Do you want to reset today's logged water to 0L?")) {
      return;
    }

    // Cancel pending debounced sync
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    pendingWaterDeltaRef.current = 0;
    waterInFlightDeltaRef.current = 0;

    setData((prev: any) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        consumed: { ...prev.consumed, water_ml: 0 },
        progress: {
          ...prev.progress,
          water_percent: 0
        }
      };
      if (selectedDateRef.current) {
        dateCacheRef.current[selectedDateRef.current] = updated;
      }
      return updated;
    });

    try {
      await nutritionApi.resetWater();
      toast.success("Today's water reset to 0L");
    } catch (err: any) {
      console.error("Failed to reset water:", err);
      toast.error("Failed to reset water on server");
    }
  };

  const handleFoodLoggedSuccess = (loggedData?: any) => {
    if (loggedData) {
      const items = Array.isArray(loggedData) ? loggedData : [loggedData];
      if (items.length > 0) {
        const isRealServerData = items.some((it: any) => it.id && !String(it.id).startsWith('opt-'));

        setData((prev: any) => {
          if (!prev) return prev;
          const currentLogged = Array.isArray(prev.logged_foods) ? [...prev.logged_foods] : [];

          // If real server data arrives, remove any temporary optimistic placeholders for this meal
          let baseLogged = currentLogged;
          if (isRealServerData) {
            const targetMealType = items[0]?.meal_type ? String(items[0].meal_type).toLowerCase().trim() : '';
            baseLogged = currentLogged.filter((f: any) => {
              if (String(f.id || '').startsWith('opt-') && String(f.meal_type || '').toLowerCase().trim() === targetMealType) {
                return false;
              }
              return true;
            });
          }

          const existingIds = new Set(baseLogged.map((f: any) => f.id));
          const newItems = items.filter((f: any) => !existingIds.has(f.id));
          const updatedLogged = [...baseLogged, ...newItems];

          // Recalculate totals directly from updatedLogged for 100% mathematical consistency
          let totalCals = 0;
          let totalPro = 0;
          let totalCarbs = 0;
          let totalFat = 0;
          let totalCost = 0;

          updatedLogged.forEach((item: any) => {
            totalCals += Number(item.calories) || 0;
            totalPro += Number(item.protein) || 0;
            totalCarbs += Number(item.carbs) || 0;
            totalFat += Number(item.fat) || 0;
            totalCost += Number(item.estimated_cost) || 0;
          });

          const newConsumedCals = Math.round(totalCals);
          const newConsumedPro = Math.round(totalPro * 10) / 10;
          const newConsumedCarbs = Math.round(totalCarbs * 10) / 10;
          const newConsumedFat = Math.round(totalFat * 10) / 10;
          const targetCals = Number(prev.targets?.calories) || 2000;
          const targetPro = Number(prev.targets?.protein) || 130;

          const updatedState = {
            ...prev,
            logged_foods: updatedLogged,
            consumed: {
              ...prev.consumed,
              calories: newConsumedCals,
              protein: newConsumedPro,
              carbs: newConsumedCarbs,
              fat: newConsumedFat,
            },
            remaining: {
              ...prev.remaining,
              calories: Math.max(0, targetCals - newConsumedCals),
              protein: Math.max(0, targetPro - newConsumedPro),
            },
            budget: {
              ...prev.budget,
              spent: Math.round(totalCost * 100) / 100,
              monthly_spent: Math.round(((Number(prev.budget?.monthly_spent) || 0) + (isRealServerData ? 0 : totalCost)) * 100) / 100,
            },
            progress: {
              ...prev.progress,
              calories_percent: Math.min(100, Math.round((newConsumedCals / (targetCals || 1)) * 100)),
              protein_percent: Math.min(100, Math.round((newConsumedPro / (targetPro || 1)) * 100)),
            }
          };

          if (selectedDateRef.current) {
            dateCacheRef.current[selectedDateRef.current] = updatedState;
            nutritionClientCache.set(selectedDateRef.current, updatedState);
          }

          return updatedState;
        });

        // Only reconcile quietly with server when confirmed server data has committed!
        // Never call getToday during optimistic update to avoid premature overwrite race condition
        if (isRealServerData) {
          isInternalUpdateRef.current = true;
          nutritionClientCache.notifyUpdated();
          const targetDate = selectedDateRef.current;
          nutritionApi.getToday(targetDate).then(res => {
            if (res && selectedDateRef.current === targetDate) {
              setData((current: any) => {
                const currentCount = current?.logged_foods?.length || 0;
                const resCount = res?.logged_foods?.length || 0;
                if (resCount < currentCount) {
                  return {
                    ...res,
                    logged_foods: current.logged_foods,
                    consumed: current.consumed,
                  };
                }
                return res;
              });
              dateCacheRef.current[targetDate] = res;
              nutritionClientCache.set(res.date || targetDate, res);
            }
          }).catch(() => {});
        }
        return;
      }
    }
    fetchToday(selectedDateRef.current);
  };

  const openLogModal = (mealType: string, preselected?: any[]) => {
    if (!isToday) {
      toast.info("Meals can only be logged for today.");
      return;
    }
    if (!isPro) {
      triggerProModal("Food Logging");
      return;
    }
    setModalMealType(mealType);
    setModalPreselectedFoods(preselected || []);
    setModalOpen(true);
  };

  const handleOpenSwapModal = (mealType: string) => {
    if (isPast) {
      toast.info("Past meal plans are read-only.");
      return;
    }
    if (!isPro) {
      triggerProModal("Meal Swapping");
      return;
    }
    setSwapMealType(mealType);
    setSwapModalOpen(true);
  };

  const getMealTiming = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return '8:00 AM - 9:30 AM';
      case 'lunch': return '1:00 PM - 2:30 PM';
      case 'pre_workout': return '4:00 PM - 5:00 PM';
      case 'snack': return '5:00 PM - 6:30 PM';
      case 'post_workout': return '7:00 PM - 8:00 PM';
      case 'dinner': return '8:30 PM - 10:00 PM';
      default: return '';
    }
  };

  const formatMealType = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (isLoading && !data) {
    return (
      <div className="flex flex-col gap-4 animate-pulse pt-4">
        <div className="h-48 bg-white/5 rounded-[24px]"></div>
        <div className="h-24 bg-white/5 rounded-[24px]"></div>
        <div className="h-64 bg-white/5 rounded-[24px] mt-4"></div>
      </div>
    );
  }

  if (error) {
    if (error.code === 'TARGET_NOT_FOUND') {
      return (
        <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-8 text-center mt-8">
          <div className="w-16 h-16 bg-[#ADFF00]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-[#ADFF00]">
            <Apple size={32} />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">Targets Missing</h2>
          <p className="text-white/50 text-sm mb-6">Set your daily nutrition targets or auto-initialize calculated targets now.</p>
          <button 
            disabled={isGenerating}
            onClick={() => handleSetDailyTargets()}
            className="w-full py-4 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black rounded-xl text-xs font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50 shadow-[0_0_20px_rgba(173,255,0,0.3)]"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Zap size={16} />}
            <span>{isGenerating ? "Initializing Targets..." : "Set Daily Targets"}</span>
          </button>
        </div>
      );
    }
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-[24px] p-5 text-center mt-8">
        <p className="text-red-400 font-bold">{error.message || "An error occurred."}</p>
        <button onClick={() => fetchToday()} className="mt-4 px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-white hover:bg-white/10">Try Again</button>
      </div>
    );
  }

  if (!data) return null;

  const targets = data.targets || {};
  const consumed = data.consumed || {};
  const remaining = data.remaining || {};
  const budget = data.budget || { daily_limit: 200, spent: 0, monthly_limit: 6000, monthly_spent: 0 };
  const progress = data.progress || {};
  const meals = Array.isArray(data.meals) ? data.meals : [];
  const loggedFoods = Array.isArray(data.logged_foods) ? data.logged_foods : [];
  const nutrition_score = data.nutrition_score || 0;
  const hasPlannedMeals = meals.length > 0;
  const weeklyStatus = data?.weekly_plan_status;
  const canGeneratePlan = weeklyStatus ? Boolean(weeklyStatus.can_generate) : true;

  // Safe numerical calculations resistant to overflow/wrapping
  const targetCals = Number(targets.calories) || 2000;
  const targetPro = Number(targets.protein) || 130;
  const targetCarbs = Number(targets.carbs) || 225;
  const targetFat = Number(targets.fat) || 55;

  const consumedCals = Math.round(Number(consumed.calories) || 0);
  const consumedPro = Math.round(Number(consumed.protein) || 0);
  const consumedCarbs = Math.round(Number(consumed.carbs) || 0);
  const consumedFat = Math.round(Number(consumed.fat) || 0);

  // Show a near-target state without implying that a partial intake completed the goal.
  const isCaloriesNearTarget = consumedCals > 0 && Math.abs(consumedCals - targetCals) <= Math.max(130, Math.round(targetCals * 0.06));
  const isCalorieSurplus = !isCaloriesNearTarget && consumedCals > targetCals;
  const surplusCals = consumedCals - targetCals;
  const calsRemaining = Math.max(0, targetCals - consumedCals);

  // Keep the labels truthful when a user exceeds a target. Only the visual bar
  // is capped because its width cannot exceed the card.
  const proPercent = Math.round((consumedPro / (targetPro || 1)) * 100);
  const carbsPercent = Math.round((consumedCarbs / (targetCarbs || 1)) * 100);
  const fatPercent = Math.round((consumedFat / (targetFat || 1)) * 100);
  const calsPercent = Math.round((consumedCals / (targetCals || 1)) * 100);
  const formatProgressLabel = (percent: number) => percent > 999 ? "999%+" : `${Math.max(0, percent)}%`;
  const progressBarWidth = (percent: number) => `${Math.max(0, Math.min(100, percent))}%`;

  const getMealIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return <Coffee size={20} />;
      case 'lunch': return <Salad size={20} />;
      case 'pre_workout': return <Zap size={20} />;
      case 'post_workout': return <Dumbbell size={20} />;
      case 'snack': return <Apple size={20} />;
      case 'dinner': return <Beef size={20} />;
      default: return <Apple size={20} />;
    }
  };

  const foodsByMeal = useMemo(() => {
    const acc: Record<string, any[]> = {};
    for (const log of loggedFoods) {
      const t = String(log.meal_type || 'snack').toLowerCase().trim();
      if (!acc[t]) acc[t] = [];
      // Repeated entries can be intentional (for example, two servings logged
      // at different times). Keep each row so the list agrees with daily totals.
      acc[t].push(log);
    }
    return acc;
  }, [loggedFoods]);

  const foodEnvironment = (data?.food_environment || 'Home').trim();
  const envLower = foodEnvironment.toLowerCase();
  const isPG = envLower === 'pg';
  const isHostel = envLower === 'hostel';
  const isCanteen = envLower.includes('canteen') || envLower.includes('office');
  const isICook = envLower === 'i cook' || envLower === 'self-cooked' || envLower === 'i_cook';
  const isHome = envLower === 'home';

  const getEnvBadge = () => {
    if (isPG) {
      return {
        label: "🏢 PG Mess + Hack",
        className: "text-[9px] font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider"
      };
    }
    if (isHostel) {
      return {
        label: "🎓 Hostel Mess + Hack",
        className: "text-[9px] font-black text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider"
      };
    }
    if (isCanteen) {
      return {
        label: "🍱 Canteen + Hack",
        className: "text-[9px] font-black text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider"
      };
    }
    if (isICook) {
      return {
        label: "🍳 Self-Cooked",
        className: "text-[9px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider"
      };
    }
    return {
      label: "🏠 Home Kitchen",
      className: "text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider"
    };
  };

  const isItemCoreCheck = (it: any) => {
    if (typeof it.is_core === 'boolean') return it.is_core;
    if (isICook) return false;
    const name = String(it.foods?.name || '').toLowerCase();
    if (
      name.includes('boiled egg') ||
      name.includes('egg white') ||
      name.includes('egg bhurji') ||
      name.includes('omelette') ||
      name.includes('paneer tikka') ||
      name.includes('paneer bhurji') ||
      name.includes('raw paneer') ||
      name.includes('soy chunk') ||
      name.includes('soya chunk') ||
      name.includes('whey') ||
      name.includes('protein powder') ||
      name.includes('chicken breast') ||
      name.includes('fish curry') ||
      name.includes('chicken curry') ||
      name.includes('mutton') ||
      name.includes('roasted peanut') ||
      name.includes('roasted chana') ||
      name.includes('almond') ||
      name.includes('walnut')
    ) {
      return false;
    }
    if (/\b(?:egg|eggs)\b/i.test(name) && !name.includes('egg curry')) {
      return false;
    }
    if (/\bpaneer\b/i.test(name) && !name.includes('matar paneer')) {
      return false;
    }
    // For Home living: Family curd/dahi and homemade buttermilk are provided by family
    if (isHome && (name.includes('curd') || name.includes('dahi') || name.includes('chaas') || name.includes('buttermilk') || name.includes('raita'))) {
      return true;
    }
    return (
      name.includes('rice') || 
      name.includes('roti') || 
      name.includes('chapati') || 
      name.includes('phulka') || 
      name.includes('dal') || 
      name.includes('sambar') || 
      name.includes('vegetable') || 
      name.includes('sabzi') || 
      name.includes('poha') || 
      name.includes('upma') || 
      name.includes('idli') || 
      name.includes('dosa') || 
      name.includes('pongal') || 
      name.includes('bread') || 
      name.includes('milk') ||
      name.includes('core meal') ||
      name.includes('base meal')
    );
  };

  const getRealisticItemCost = (foodName?: string, defaultCost?: number) => {
    if (!foodName) return typeof defaultCost === 'number' && defaultCost > 0 ? defaultCost : 10;
    const lower = foodName.toLowerCase();

    if (lower.includes('egg white')) return 5;
    if (lower.includes('egg')) return 7; // 1 farm egg = ₹7
    if (lower.includes('curd') || lower.includes('dahi')) return 10; // 100g curd = ₹10
    if (lower.includes('paneer')) return 35; // 100g paneer = ₹35
    if (lower.includes('soya chunk') || lower.includes('soy chunk')) return 12; // 50g = ₹12
    if (lower.includes('tofu')) return 25;
    if (lower.includes('chicken breast')) return 45; // 100g = ₹45
    if (lower.includes('chicken curry') || lower.includes('chicken')) return 50;
    if (lower.includes('fish')) return 50;
    if (lower.includes('roasted peanut')) return 8; // 30g = ₹8
    if (lower.includes('roasted chana')) return 8; // 25-30g = ₹8
    if (lower.includes('banana')) return 6; // 1 banana = ₹6
    if (lower.includes('apple')) return 20; // 1 apple = ₹20
    if (lower.includes('milk')) return 12; // 250ml milk = ₹12
    if (lower.includes('whey') || lower.includes('protein powder')) return 65;

    // Home cooking staples & sides (raw cost)
    if (lower.includes('roti') || lower.includes('chapati') || lower.includes('phulka')) return 2; // ₹2/chapati
    if (lower.includes('rice') || lower.includes('chawal')) return 5; // ₹5/bowl cooked rice
    if (lower.includes('idli')) return 4; // ₹4/idli
    if (lower.includes('sambar')) return 8; // ₹8/bowl
    if (lower.includes('dal') || lower.includes('moong') || lower.includes('rajma') || lower.includes('chole')) return 8; // ₹8/bowl
    if (lower.includes('vegetable') || lower.includes('sabzi') || lower.includes('salad')) return 10; // ₹10/bowl
    if (lower.includes('oats')) return 10;
    if (lower.includes('poha')) return 8;
    if (lower.includes('bread')) return 4;

    return typeof defaultCost === 'number' && defaultCost > 0 ? Math.min(defaultCost, 20) : 10;
  };

  const formatItemServing = (qty: number, rawServing?: string, foodName?: string) => {
    let q = Number(qty);
    if (!Number.isFinite(q) || q <= 0) q = 1;

    let serving = (rawServing || '1 serving').trim();
    const nameLower = (foodName || '').toLowerCase();
    const formatAmount = (value: number) => {
      const rounded = Number(value.toFixed(2));
      return String(rounded);
    };
    const weightMatch = serving.match(/(\d+(?:\.\d+)?)\s*g\b/i);
    const baseGrams = weightMatch ? Number(weightMatch[1]) : null;
    const displayCount = (count: number) => count < 1 ? `${formatAmount(count)} of a` : formatAmount(count);

    const embeddedMatch = serving.match(/^(\d+(?:\.\d+)?)\s*(?:x|\*|\u00D7)\s*(.*)$/i);
    if (embeddedMatch) {
      const embeddedAmount = Number(embeddedMatch[1]);
      if (Number.isFinite(embeddedAmount) && embeddedAmount > 0) {
        q = q === 1 ? embeddedAmount : Number((q * embeddedAmount).toFixed(2));
      }
      serving = embeddedMatch[2].trim();
    }

    const currentCount = () => {
      const match = serving.match(/^(\d+(?:\.\d+)?)\s*(?:large|medium|small|whole|egg whites?|eggs?|whites?|pieces?|idlis?|bowls?|cups?|plates?)\b/i);
      const baseCount = match ? Number(match[1]) : 1;
      const value = q * baseCount;
      return Number.isFinite(value) && value > 0 ? value : q;
    };

    // Use the saved base serving to scale weights; never round a fractional
    // serving up to a whole egg, fruit, or other discrete item.
    if ((nameLower.includes('chicken') || nameLower.includes('fish') || nameLower.includes('paneer') || nameLower.includes('tofu')) && !nameLower.includes('curry')) {
      const grams = Math.round((baseGrams || 100) * q);
      return `${formatAmount(grams)}g (cooked)`;
    }

    if (nameLower.includes('egg white') || (nameLower.includes('egg') && serving.toLowerCase().includes('white'))) {
      const count = currentCount();
      const grams = Math.round(baseGrams !== null ? baseGrams * q : 33 * count);
      return `${displayCount(count)} egg white${count > 1 ? 's' : ''} (${grams}g)`;
    }

    if (nameLower.includes('egg') && !nameLower.includes('bhurji') && !nameLower.includes('curry')) {
      const count = currentCount();
      const grams = Math.round(baseGrams !== null ? baseGrams * q : 50 * count);
      return `${displayCount(count)} large egg${count > 1 ? 's' : ''} (${grams}g)`;
    }

    if (nameLower.includes('roti') || nameLower.includes('chapati') || nameLower.includes('phulka')) {
      const count = currentCount();
      const grams = Math.round(baseGrams !== null ? baseGrams * q : 40 * count);
      return `${displayCount(count)} chapati${count > 1 ? 's' : ''} (${grams}g)`;
    }

    if (nameLower.includes('banana') || nameLower.includes('apple') || nameLower.includes('orange')) {
      const count = currentCount();
      const fruitName = nameLower.includes('banana') ? 'banana' : nameLower.includes('apple') ? 'apple' : 'orange';
      const weight = baseGrams || (fruitName === 'banana' ? 118 : 180);
      const grams = baseGrams !== null ? Math.round(baseGrams * q) : Math.round(weight * count);
      return `${displayCount(count)} medium ${fruitName}${count > 1 ? 's' : ''} (${grams}g)`;
    }

    if (nameLower.includes('idli')) {
      const pieceMatch = serving.match(/^(\d+(?:\.\d+)?)\s*pieces?\b/i);
      const piecesPerServing = pieceMatch ? Number(pieceMatch[1]) : 1;
      const totalPieces = q * piecesPerServing;
      const grams = baseGrams !== null ? Math.round(baseGrams * q) : Math.round(40 * totalPieces);
      return `${formatAmount(totalPieces)} idli piece${totalPieces === 1 ? '' : 's'} (${grams}g)`;
    }

    if (nameLower.includes('rice') || nameLower.includes('chawal')) {
      const count = currentCount();
      const totalGrams = Math.round(baseGrams !== null ? baseGrams * q : 150 * count);
      return `${formatAmount(count)} bowl${count === 1 ? '' : 's'} cooked (${totalGrams}g)`;
    }

    const bowlCupMatch = serving.match(/^(?:(\d+(?:\.\d+)?)\s*)?(bowl|cup|plate)s?\s*\(([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z]+)\)$/i);
    if (bowlCupMatch) {
      const baseCount = bowlCupMatch[1] ? Number(bowlCupMatch[1]) : 1;
      const vessel = bowlCupMatch[2].toLowerCase();
      const grams = Number(bowlCupMatch[3]);
      const unit = bowlCupMatch[4];
      const amount = q * baseCount;
      return `${formatAmount(amount)} ${vessel}${amount === 1 ? '' : 's'} (${Math.round(grams * q)}${unit})`;
    }

    const simpleWeightMatch = serving.match(/^(\d+(?:\.\d+)?)\s*g(\s*\(.*?\))?$/i);
    if (simpleWeightMatch) {
      const grams = Math.round(Number(simpleWeightMatch[1]) * q);
      return `${grams}g${simpleWeightMatch[2] || ''}`;
    }

    if (nameLower.includes('curd') || nameLower.includes('dahi') || nameLower.includes('yogurt')) {
      const count = currentCount();
      const grams = Math.round(baseGrams !== null ? baseGrams * q : 100 * count);
      return `${formatAmount(count)} bowl${count === 1 ? '' : 's'} (${grams}g)`;
    }

    if (nameLower.includes('dal') || nameLower.includes('curry') || nameLower.includes('sambar') || nameLower.includes('chole') || nameLower.includes('rajma') || nameLower.includes('sabzi') || nameLower.includes('gravy')) {
      const count = currentCount();
      const grams = Math.round(baseGrams !== null ? baseGrams * q : 150 * count);
      return `${formatAmount(count)} bowl${count === 1 ? '' : 's'} (${grams}g)`;
    }

    if (q === 1) return serving;
    return `${formatAmount(q)} x ${serving}`;
  };

  return (
    <>
      <div className="space-y-4">
        <p className="text-sm font-bold text-white/70" aria-live="polite">
          Viewing {new Date(`${selectedDate}T12:00:00`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          {isToday ? ' · Today' : isFuture ? ' · Scheduled' : ' · Past day'}
        </p>
        {isPro && data?.food_allergies && (
          <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-white/70">
            Allergy reminder: check the actual ingredients and preparation of every food before eating it.
          </p>
        )}
        {!isPro && (
          <div className="mb-4 p-4 rounded-2xl bg-gradient-to-r from-[#ADFF00]/15 via-[#ADFF00]/5 to-transparent border border-[#ADFF00]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(173,255,0,0.1)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-[#ADFF00] text-black text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Pro Feature Preview
                </span>
              </div>
              <p className="text-xs text-white/80 font-medium leading-relaxed">
                Core includes your daily macro targets. Upgrade to Pro for personalized 7-day recipes, meal swaps, and smart food logging.
              </p>
            </div>
            <a
              href="/payment?returnTo=/nutrition&intent=upgrade_pro"
              className="shrink-0 px-3.5 py-2 bg-[#ADFF00] hover:bg-[#c4ff33] text-black text-xs font-black rounded-xl uppercase tracking-wider transition-colors shadow-sm"
            >
              Unlock Pro ⚡
            </a>
          </div>
        )}

        {/* Master Nutrition Card: Zero-Overlap, Dynamic Scaling */}
        <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ADFF00]/5 blur-[40px] rounded-full pointer-events-none" />
          
          {/* Header Row: Title & Action Controls */}
          <div className="flex justify-between items-center mb-5 relative z-10">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#ADFF00] animate-pulse" />
              <p className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase">Daily Nutrition</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-white/50 uppercase bg-black/40 px-2.5 py-1 rounded-full border border-white/5">
                Score: <span className={nutrition_score >= 80 ? "text-[#ADFF00]" : "text-white"}>{nutrition_score}</span>
              </span>
              <button 
                type="button"
                onClick={openTargetsModal} 
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                  isPro 
                    ? "text-black bg-[#ADFF00] hover:bg-[#ADFF00]/90 shadow-[0_0_10px_rgba(173,255,0,0.2)]" 
                    : "text-white/80 bg-white/10 hover:bg-white/15 border border-white/10"
                }`}
              >
                {isPro ? <Edit3 size={11} /> : <Lock size={11} className="text-amber-400" />} Targets {!isPro && <span className="text-[9px] text-amber-400 uppercase font-black ml-0.5">PRO</span>}
              </button>
            </div>
          </div>

          {/* Hero Calorie Section: Resilient against any number length */}
          <div className="flex flex-wrap justify-between items-end gap-2 mb-4 relative z-10">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1 text-white/50">
                {isCaloriesNearTarget
                  ? "Calories Near Target"
                  : isCalorieSurplus 
                  ? "Calorie Surplus" 
                  : "Calories Remaining"}
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-4xl font-black tracking-tighter ${
                  isCaloriesNearTarget
                    ? "text-[#ADFF00]" 
                    : isCalorieSurplus 
                    ? "text-amber-400" 
                    : "text-white"
                }`}>
                  {isCaloriesNearTarget
                    ? `${consumedCals}` 
                    : isCalorieSurplus 
                    ? `+${surplusCals}` 
                    : calsRemaining}
                </span>
                <span className={`text-sm font-bold ${isCaloriesNearTarget ? "text-[#ADFF00]/80" : "text-white/50"}`}>
                  {isCaloriesNearTarget
                    ? "kcal consumed"
                    : isCalorieSurplus 
                    ? "kcal over" 
                    : "kcal left"}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-full border whitespace-nowrap ${
                isCaloriesNearTarget
                  ? "text-[#ADFF00] bg-[#ADFF00]/10 border-[#ADFF00]/20" 
                  : "text-white/70 bg-black/40 border-white/5"
              }`}>
                {consumedCals} <span className="text-white/40">/ {targetCals} kcal</span>
              </span>
            </div>
          </div>

          {/* Calorie Progress Bar */}
          <div className="h-3 w-full bg-black/40 rounded-full mb-5 overflow-hidden relative z-10 p-0.5">
            <div 
              className={`h-full rounded-full relative transition-all duration-500 ${
                isCalorieSurplus 
                  ? "bg-gradient-to-r from-amber-400 to-rose-500" 
                  : "bg-gradient-to-r from-[#ADFF00] to-[#88cc00]"
              }`} 
              style={{ width: progressBarWidth(calsPercent) }}
            >
              <div className="absolute inset-0 bg-white/20 w-full rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
            </div>
          </div>

          {/* 3 Macro Cards: Zero-Overlap Vertical Layout */}
          <div className="grid grid-cols-3 gap-2.5 relative z-10">
            {/* Protein Card */}
            <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Protein</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${proPercent > 100 ? "text-rose-400 bg-rose-400/10" : "text-[#ADFF00] bg-[#ADFF00]/10"}`}>
                  {formatProgressLabel(proPercent)}
                </span>
              </div>
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className="text-base font-black text-white tracking-tight leading-none">
                  {consumedPro}
                </span>
                <span className="text-[11px] font-bold text-white/40 leading-none">
                  /{targetPro}g
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#ADFF00] rounded-full transition-all duration-300" style={{ width: progressBarWidth(proPercent) }} />
              </div>
            </div>

            {/* Carbs Card */}
            <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Carbs</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${carbsPercent > 100 ? "text-rose-400 bg-rose-400/10" : "text-blue-400 bg-blue-400/10"}`}>
                  {formatProgressLabel(carbsPercent)}
                </span>
              </div>
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className="text-base font-black text-white tracking-tight leading-none">
                  {consumedCarbs}
                </span>
                <span className="text-[11px] font-bold text-white/40 leading-none">
                  /{targetCarbs}g
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${carbsPercent > 100 ? "bg-rose-400" : "bg-blue-400"}`} style={{ width: progressBarWidth(carbsPercent) }} />
              </div>
            </div>

            {/* Fat Card */}
            <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Fat</span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${fatPercent > 100 ? "text-rose-400 bg-rose-400/10" : "text-orange-400 bg-orange-400/10"}`}>
                  {formatProgressLabel(fatPercent)}
                </span>
              </div>
              <div className="flex items-baseline gap-0.5 mb-2">
                <span className="text-base font-black text-white tracking-tight leading-none">
                  {consumedFat}
                </span>
                <span className="text-[11px] font-bold text-white/40 leading-none">
                  /{targetFat}g
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${fatPercent > 100 ? "bg-rose-400" : "bg-orange-400"}`} style={{ width: progressBarWidth(fatPercent) }} />
              </div>
            </div>
          </div>
        </div>

        {/* 7-Day Interactive Strip with Week Navigator */}
        <div suppressHydrationWarning className="bg-[#111A10] border border-white/5 rounded-2xl p-2.5 mt-6 mb-2">
          {/* Week Selector Bar */}
          <div className="flex items-center justify-between px-1.5 pb-2 mb-2 border-b border-white/5">
            <button
              type="button"
              onClick={() => {
                const selectedIndex = weekDates.findIndex((day) => day.dateStr === selectedDate);
                const target = new Date(`${weekDates[selectedIndex >= 0 ? selectedIndex : 0].dateStr}T12:00:00`);
                target.setDate(target.getDate() - 7);
                setWeekOffset(prev => prev - 1);
                handleSelectDate(formatDateInTimeZone(undefined, target));
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold active:scale-95 select-none"
              title="Previous Week"
            >
              <ChevronLeft size={14} />
              <span className="text-[10px] uppercase tracking-wider">Prev</span>
            </button>

            <div className="flex items-center gap-2">
              <span suppressHydrationWarning className="text-xs font-black text-white uppercase tracking-wider">
                {weekDates.length === 7 && (
                  `${new Date(weekDates[0].dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${new Date(weekDates[6].dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                )}
              </span>
              {weekOffset !== 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    setWeekOffset(0);
                    handleSelectDate(todayDateStr);
                  }}
                  className="text-[9px] font-black bg-[#ADFF00]/15 text-[#ADFF00] border border-[#ADFF00]/30 px-2 py-0.5 rounded-full uppercase tracking-wider cursor-pointer hover:bg-[#ADFF00]/25 transition-all active:scale-95"
                >
                  Today
                </button>
              ) : (
                <span className="text-[9px] font-black bg-white/10 text-white/70 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  This Week
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const selectedIndex = weekDates.findIndex((day) => day.dateStr === selectedDate);
                const target = new Date(`${weekDates[selectedIndex >= 0 ? selectedIndex : 0].dateStr}T12:00:00`);
                target.setDate(target.getDate() + 7);
                setWeekOffset(prev => prev + 1);
                handleSelectDate(formatDateInTimeZone(undefined, target));
              }}
              className="p-1 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-all cursor-pointer flex items-center gap-1 text-[11px] font-bold active:scale-95 select-none"
              title="Next Week"
            >
              <span className="text-[10px] uppercase tracking-wider">Next</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div suppressHydrationWarning className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
            {weekDates.map((d) => {
              const isSelected = (selectedDate || todayDateStr) === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  type="button"
                  suppressHydrationWarning
                  onClick={() => handleSelectDate(d.dateStr)}
                  className={`flex-1 min-w-[42px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#ADFF00] text-black font-black shadow-[0_0_12px_rgba(173,255,0,0.3)]'
                      : d.isToday
                      ? 'bg-white/10 text-white font-bold border border-[#ADFF00]/40'
                      : 'text-white/50 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <span suppressHydrationWarning className="text-[9px] uppercase tracking-wider">{d.dayName}</span>
                  <span suppressHydrationWarning className="text-xs font-bold mt-0.5">{d.dayNumber}</span>
                  {d.isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 bg-[#ADFF00] rounded-full mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meals Section Header */}
        <div className="mt-6 mb-3 px-1">
          <div className="flex items-center justify-between gap-3">
            {/* Title & User Setup Subtitle */}
            <div className="min-w-0">
              <h2 suppressHydrationWarning className="text-sm sm:text-base font-black tracking-wider text-white uppercase truncate">
                {(!selectedDate || selectedDate === todayDateStr) ? "Today's Meals" : `${weekDates.find(w => w.dateStr === selectedDate)?.dayName || 'Selected'}'s Meals`}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/50 mt-0.5 flex-wrap">
                <span className="text-[#ADFF00] font-bold">
                  {data?.food_environment === 'PG' ? '🏢 PG Mess' : data?.food_environment === 'Hostel' ? '🎓 Hostel' : data?.food_environment === 'Home' ? '🏠 Home' : data?.food_environment === 'I Cook' ? '🍳 I Cook' : (data?.food_environment || 'Home')}
                </span>
                <span className="text-white/20">•</span>
                <span className="capitalize">{data?.food_type || 'Balanced'}</span>
                <span className="text-white/20">•</span>
                <span className="text-white/40">Whole Foods</span>
              </div>
            </div>

            {/* Status Badge or Action Button */}
            <div className="shrink-0">
              {isDateLoading || dateLoadError ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/60">
                  {isDateLoading ? <Loader2 size={12} className="animate-spin" /> : <Clock size={12} />}
                  {isDateLoading ? "Loading Date" : "Date Unavailable"}
                </div>
              ) : isPast ? (
                <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-bold text-white/50">
                  Past Day
                </div>
              ) : isFuture && !hasPlannedMeals ? (
                canGeneratePlan ? (
                  <button
                    type="button"
                    disabled={isGenerating}
                    onClick={handleGeneratePlan}
                    className="text-[10px] sm:text-xs font-black text-black bg-[#ADFF00] hover:bg-[#c4ff33] px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_14px_rgba(173,255,0,0.3)] disabled:opacity-50 cursor-pointer active:scale-95 whitespace-nowrap"
                    title="Generate a seven-day diet plan starting today"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                    {isGenerating ? "Planning..." : "Plan From Today"}
                  </button>
                ) : (
                  <div 
                    className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-amber-400/90 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full whitespace-nowrap select-none"
                    title={`Plan generation unlocks on ${weeklyStatus?.next_available_formatted || 'the next cycle date'}.`}
                  >
                    <Lock size={11} className="shrink-0 text-amber-400" />
                    <span className="font-extrabold tracking-wide">Not Created</span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/70 font-medium">Unlocks {weeklyStatus?.next_available_formatted || `in ${weeklyStatus?.days_remaining || 7}d`}</span>
                  </div>
                )
              ) : canGeneratePlan ? (
                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={handleGeneratePlan}
                  className="text-[10px] sm:text-xs font-black text-black bg-[#ADFF00] hover:bg-[#c4ff33] px-3.5 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_14px_rgba(173,255,0,0.3)] disabled:opacity-50 cursor-pointer active:scale-95 whitespace-nowrap"
                  title="Generate your weekly personalized diet plan with Luna AI (1 per week, max 4 per month)"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={12} /> : <Sparkles size={12} />}
                  {isGenerating ? "Planning..." : "Generate 7-Day Plan"}
                </button>
              ) : (
                <div 
                  className="inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-[#ADFF00] bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-3 py-1 rounded-full whitespace-nowrap select-none shadow-[0_0_10px_rgba(173,255,0,0.06)]"
                  title={`Active Weekly Plan (${weeklyStatus?.plans_used_this_month || 1}/4 this month). Next plan generation available on ${weeklyStatus?.next_available_formatted || 'next week'}.`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ADFF00] animate-pulse shrink-0" />
                  <span className="font-extrabold tracking-wide">{hasPlannedMeals ? "Plan Active" : "Not Planned"}</span>
                  <span className="text-white/30">•</span>
                  <span className="text-white/70 font-medium">Next: {weeklyStatus?.next_available_formatted || `in ${weeklyStatus?.days_remaining || 7}d`}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {isDateLoading ? (
          <div className="rounded-[24px] border border-white/10 bg-[#111A10] p-8 text-center text-sm font-medium text-white/60" role="status">
            <Loader2 size={20} className="mx-auto mb-3 animate-spin text-[#ADFF00]" />
            Loading meals for this date...
          </div>
        ) : dateLoadError ? (
          <div className="rounded-[24px] border border-rose-500/20 bg-[#111A10] p-8 text-center text-sm text-white/70" role="alert">
            <p>{dateLoadError}</p>
            <button type="button" onClick={() => handleSelectDate(selectedDate, true)} className="mt-4 rounded-xl bg-white/10 px-4 py-2 text-xs font-bold text-white hover:bg-white/15">
              Try Again
            </button>
          </div>
        ) : !hasPlannedMeals ? (
          <div className="bg-[#111A10] border border-[#ADFF00]/20 rounded-[24px] p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="w-12 h-12 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center mx-auto mb-3 text-[#ADFF00]">
              <Sparkles size={24} />
            </div>
            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">
              {isFuture
                ? "No Plan for This Date"
                : isPast
                ? "No Plan for This Date"
                : isPro
                ? "Generate Your 7-Day Plan"
                : "Unlock 7-Day AI Meal Plan"}
            </h3>
            <p className="text-white/60 text-xs sm:text-sm max-w-sm mx-auto mb-5 leading-relaxed">
              {isFuture
                ? (isPro
                    ? (!canGeneratePlan
                        ? `This date is outside your saved plan. You can generate another 7-day plan on ${weeklyStatus?.next_available_formatted || 'your next cycle date'}.`
                        : "A new 7-day plan starts on the day you generate it, not on the selected calendar week.")
                    : `Personalized recipes and grocery lists calibrated to your target of ${targetCals} kcal and ${targetPro}g protein.`)
                : isPast
                ? "No meal plan was saved for this date. Past days are read-only."
                : (isPro
                    ? (canGeneratePlan ? "Create seven consecutive days of meals starting today." : `No meal plan is saved for today. Your next plan unlocks on ${weeklyStatus?.next_available_formatted || 'your next cycle date'}.`)
                    : `Personalized recipes and grocery lists calibrated to your target of ${targetCals} kcal and ${targetPro}g protein.`)}
            </p>
            {isPro ? (
              isFuture ? (
                canGeneratePlan ? (
                  <button 
                    disabled={isGenerating}
                    onClick={handleGeneratePlan}
                    className="px-5 py-3 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black font-black uppercase tracking-wider rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-2 mx-auto transition-all shadow-[0_0_15px_rgba(173,255,0,0.3)] cursor-pointer active:scale-95"
                  >
                    {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                    {isGenerating ? "Generating 7-Day Plan..." : "Generate Plan From Today"}
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs font-bold text-amber-400 mx-auto">
                    <Lock size={14} className="shrink-0" />
                    <span>Plan Creation Unlocks on {weeklyStatus?.next_available_formatted || 'next week'}</span>
                  </div>
                )
              ) : isPast ? (
                <button
                  type="button"
                  onClick={() => {
                    setWeekOffset(0);
                    handleSelectDate(todayDateStr);
                  }}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-bold text-xs rounded-xl uppercase tracking-wider transition-all cursor-pointer"
                >
                  Back to Today
                </button>
              ) : canGeneratePlan ? (
                <button 
                  disabled={isGenerating}
                  onClick={handleGeneratePlan}
                  className="px-5 py-3 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black font-black uppercase tracking-wider rounded-xl text-xs disabled:opacity-50 flex items-center justify-center gap-2 mx-auto transition-all shadow-[0_0_15px_rgba(173,255,0,0.3)] cursor-pointer active:scale-95"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  {isGenerating ? "Generating 7-Day Plan..." : "Generate 7-Day Plan"}
                </button>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#ADFF00]/10 border border-[#ADFF00]/20 rounded-xl text-xs font-bold text-[#ADFF00] mx-auto">
                  <span className="w-2 h-2 rounded-full bg-[#ADFF00] animate-pulse shrink-0" />
                  <span>No Plan for Today</span>
                  <span className="text-white/40">•</span>
                  <span className="text-white/80">Next generation on {weeklyStatus?.next_available_formatted || 'next week'}</span>
                </div>
              )
            ) : (
              <a
                href="/payment?returnTo=/nutrition&intent=upgrade_pro"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#ADFF00] hover:bg-[#c4ff33] text-black font-black uppercase tracking-wider rounded-xl text-xs transition-all shadow-[0_0_20px_rgba(173,255,0,0.3)] cursor-pointer"
              >
                Upgrade to Pro to Generate Plan ⚡
              </a>
            )}
            {isToday && isPro && (
              <button
                type="button"
                onClick={() => openLogModal(getActiveMealType())}
                className="mt-3 mx-auto flex items-center justify-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-xs font-bold text-white hover:bg-white/10"
              >
                <Plus size={14} /> Log Food Without a Plan
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {(data?.has_active_plan || meals.length > 0) && weeklyStatus?.can_generate && isPro && (
              <div className="bg-gradient-to-r from-[#111A10] via-[#172714] to-[#111A10] border border-[#ADFF00]/40 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_25px_rgba(173,255,0,0.12)]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ADFF00]/20 flex items-center justify-center shrink-0 text-[#ADFF00] shadow-[0_0_10px_rgba(173,255,0,0.2)]">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Ready for a New 7-Day Plan</h4>
                    <p className="text-xs text-white/60">A new plan will start today and cover the next seven consecutive days.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleGeneratePlan}
                  disabled={isGenerating}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#ADFF00] hover:bg-[#baff22] text-black font-black uppercase tracking-wider text-xs rounded-xl flex items-center justify-center gap-2 shrink-0 transition-all shadow-[0_0_15px_rgba(173,255,0,0.3)] cursor-pointer active:scale-95"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={14} /> : <RefreshCw size={14} />}
                  {isGenerating ? "Generating..." : "Generate From Today"}
                </button>
              </div>
            )}

            {meals.map((meal: any) => {
              const loggedFoods = foodsByMeal[String(meal.meal_type || '').toLowerCase().trim()] || [];
              const hasLoggedFoods = loggedFoods.length > 0;
              
              const mealKey = meal.id || meal.meal_type;
              const currentChoice = selectedMealOptions[mealKey] || 'A';
              const hasOptionB = Boolean(meal.option_b_name && Array.isArray(meal.option_b_items) && meal.option_b_items.length > 0);
              const isOptB = hasOptionB && currentChoice === 'B';

              const currentPlannedFoods = isOptB 
                ? meal.option_b_items 
                : (Array.isArray(meal.meal_plan_items) ? meal.meal_plan_items : []);

              const currentMealName = isOptB && meal.option_b_name 
                ? meal.option_b_name 
                : (meal.name || formatMealType(meal.meal_type));

              const heroPhotoUrl = getMealHeroPhoto(
                meal.meal_type, 
                currentMealName, 
                data?.food_type || data?.profile?.diet_preference
              );

              const currentPrepInstruction = isOptB && meal.option_b_prep_instruction 
                ? meal.option_b_prep_instruction 
                : meal.prep_instructions;

              const mealCals = Math.round(loggedFoods.reduce((acc: number, f: any) => acc + (Number(f.calories) || 0), 0));
              const mealPro = Math.round(loggedFoods.reduce((acc: number, f: any) => acc + (Number(f.protein) || 0), 0));
              
              const plannedTotals = currentPlannedFoods.reduce((totals: any, item: any) => {
                const quantity = Number(item.quantity) || 1;
                return {
                  calories: totals.calories + Number(item.foods?.calories || 0) * quantity,
                  protein: totals.protein + Number(item.foods?.protein || 0) * quantity,
                  carbs: totals.carbs + Number(item.foods?.carbs || 0) * quantity,
                  fat: totals.fat + Number(item.foods?.fat || 0) * quantity,
                };
              }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

              const corePlannedItems = currentPlannedFoods.filter((it: any) => isItemCoreCheck(it));
              const addonPlannedItems = currentPlannedFoods.filter((it: any) => !isItemCoreCheck(it));
              const addonCost = addonPlannedItems.reduce((acc: number, it: any) => {
                const itemUnitCost = getRealisticItemCost(it.foods?.name, Number(it.foods?.estimated_cost));
                return acc + Math.round(itemUnitCost * (Number(it.quantity) || 1));
              }, 0);
              const totalMealCost = currentPlannedFoods.reduce((acc: number, it: any) => {
                const isCore = isItemCoreCheck(it);
                if (isCore) return acc;
                const itemUnitCost = getRealisticItemCost(it.foods?.name, Number(it.foods?.estimated_cost));
                return acc + Math.round(itemUnitCost * (Number(it.quantity) || 1));
              }, 0);
              const hasCoreAndAddon = corePlannedItems.length > 0 && addonPlannedItems.length > 0;
              
              const isActive = !hasLoggedFoods && isToday && getActiveMealType() === meal.meal_type;

              return (
                <div 
                  key={meal.id} 
                  className={`bg-[#111A10] border rounded-[24px] overflow-hidden transition-all ${
                    isActive 
                      ? 'border-[#ADFF00]/60 shadow-[0_0_25px_rgba(173,255,0,0.12)] ring-1 ring-[#ADFF00]/30' 
                      : hasLoggedFoods
                      ? 'border-[#ADFF00]/20 shadow-[0_0_15px_rgba(173,255,0,0.03)]' 
                      : 'border-white/5 opacity-90'
                  }`}
                >
                  {/* NutriScan-style Hero Food Photo Banner */}
                  <div className="relative w-full h-36 sm:h-44 overflow-hidden bg-black/40">
                    <img 
                      src={heroPhotoUrl} 
                      alt={currentMealName} 
                      className="w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111A10] via-[#111A10]/50 to-black/40" />
                    
                    {/* Top Floating Badge Bar */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md bg-black/70 text-white border border-white/15 flex items-center gap-1.5 shadow-md">
                          <span>{getMealIcon(meal.meal_type)}</span>
                          <span>{formatMealType(meal.meal_type)}</span>
                        </span>
                        {isActive && (
                          <span className="text-[9px] font-black text-black bg-[#ADFF00] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(173,255,0,0.5)] animate-pulse">
                            NOW
                          </span>
                        )}
                        <span className={`${getEnvBadge().className} text-[9px] backdrop-blur-md`}>
                          {getEnvBadge().label}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black backdrop-blur-md bg-black/70 text-[#ADFF00] border border-[#ADFF00]/30 shadow-md">
                          {hasLoggedFoods ? `${mealCals} kcal · ${mealPro}g P logged` : `${Math.round(plannedTotals.calories)} kcal · ${Math.round(plannedTotals.protein)}g P`}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Title & Whole Food Tag */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 backdrop-blur-sm">
                          🌱 100% Whole Food
                        </span>
                        <span className="text-[10px] font-bold text-white/70 backdrop-blur-sm">
                          {getMealTiming(meal.meal_type)}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white leading-tight drop-shadow-md truncate" title={currentMealName}>
                        <span className="mr-1.5">{getFoodEmoji(currentMealName)}</span>
                        {currentMealName}
                      </h3>
                    </div>
                  </div>

                  {/* Dual-Option Switcher (Option A vs Option B) */}
                  {hasOptionB && !hasLoggedFoods && (
                    <div className="px-5 pt-3 pb-1">
                      <div className="flex items-center bg-black/50 p-1 rounded-xl border border-white/10 shadow-inner">
                        <button
                          type="button"
                          onClick={() => setSelectedMealOptions(prev => ({ ...prev, [mealKey]: 'A' }))}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            !isOptB 
                              ? 'bg-[#ADFF00] text-black shadow-[0_0_12px_rgba(173,255,0,0.3)]' 
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>Option A</span>
                          <span className="text-[10px] font-normal lowercase opacity-80 truncate max-w-[120px]">
                            ({getFoodEmoji(meal.name)} {meal.name || 'Quick / Mess'})
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedMealOptions(prev => ({ ...prev, [mealKey]: 'B' }))}
                          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isOptB 
                              ? 'bg-[#ADFF00] text-black shadow-[0_0_12px_rgba(173,255,0,0.3)]' 
                              : 'text-white/60 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <span>Option B</span>
                          <span className="text-[10px] font-normal lowercase opacity-80 truncate max-w-[120px]">
                            ({getFoodEmoji(meal.option_b_name)} {meal.option_b_name})
                          </span>
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-5">
                    {/* Status Subtitle */}
                    <div className="flex justify-between items-center mb-3">
                      <p className="text-xs text-white/50 font-medium">
                        {hasLoggedFoods ? `${loggedFoods.length} item${loggedFoods.length === 1 ? '' : 's'} logged` : (currentPlannedFoods.length > 0 ? (isOptB ? 'Option B Planned Foods' : 'Option A Planned Foods') : 'Not planned yet')}
                      </p>
                      <div className="text-right">
                        {hasLoggedFoods ? (
                          <span className="text-xs font-bold text-[#ADFF00]">✓ Logged</span>
                        ) : currentPlannedFoods.length > 0 ? (
                          <span className="text-xs text-white/50">
                            {isOptB ? 'Alternative Recipe' : 'Primary Plan'}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Show planned or logged foods with real-world environment grouping */}
                    <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                      {loggedFoods.length > 0 ? (
                        <ul className="text-[13px] font-medium text-white/80 space-y-2.5">
                          {loggedFoods.map((f: any) => (
                            <li key={f.id} className="flex justify-between items-center group">
                              <span className="flex items-center gap-2.5 text-white/90">
                                <FoodAvatar 
                                  name={f.foods?.name || ''} 
                                  className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                                />
                                <div>
                                  <span className="font-bold block text-white/90">{f.foods?.name || 'Logged food'}</span>
                                  <span className="text-[11px] text-white/40 font-medium">{formatItemServing(f.quantity, f.foods?.serving_size, f.foods?.name)}</span>
                                </div>
                              </span>
                              <div className="flex items-center gap-2.5">
                                <span className="text-xs font-black text-[#ADFF00]">{Math.round(Number(f.calories) || 0)} <span className="text-[9px] text-[#ADFF00]/70 uppercase">kcal</span></span>
                                {isToday && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteFood(f.id, f.foods?.name)}
                                    className="w-6 h-6 rounded-md bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 border border-white/5 hover:border-red-500/30 flex items-center justify-center transition-all cursor-pointer"
                                    title="Remove food"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (currentPlannedFoods.length > 0) ? (
                        <div className="space-y-3">
                          {!isICook && hasCoreAndAddon ? (
                            <>
                              {/* Section 1: Mess / Home Kitchen Base (provided, with no extra grocery cost) */}
                              <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                                    {isPG ? '🍱 PG Mess Base' : isHostel ? '🎓 Hostel Mess Base' : isCanteen ? '🍱 Canteen Base' : '🍲 Family Kitchen Base'}
                                  </span>
                                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                    Provided · No extra grocery cost
                                  </span>
                                </div>
                                <ul className="text-[13px] font-medium text-white/80 space-y-2">
                                  {corePlannedItems.map((item: any) => (
                                    <li key={item.id} className="flex justify-between items-center">
                                      <span className="flex items-center gap-2 text-white/80">
                                        <FoodAvatar 
                                          name={item.foods?.name || ''} 
                                          className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0"
                                        />
                                        <div>
                                          <span className="font-semibold block text-xs text-white/90">{item.foods?.name || 'Base staple'}</span>
                                          <span className="text-[10px] text-white/40 font-medium">{formatItemServing(item.quantity, item.foods?.serving_size, item.foods?.name)}</span>
                                        </div>
                                      </span>
                                      <span className="text-xs font-bold text-white/60">
                                        {Math.round(Number(item.foods?.calories || 0) * (Number(item.quantity) || 1))} <span className="text-[9px] text-white/40 uppercase">kcal</span>
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* Section 2: High-Protein Add-ons */}
                              <div className="bg-[#ADFF00]/[0.03] rounded-xl p-2.5 border border-[#ADFF00]/25 shadow-[0_0_15px_rgba(173,255,0,0.03)]">
                                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-[#ADFF00]/15">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-[#ADFF00] flex items-center gap-1.5">
                                    ⚡ {isPG ? 'PG Protein Add-ons' : isHostel ? 'Hostel Protein Hacks' : isHome ? 'Your Fitness Add-ons' : 'Protein Add-ons'}
                                  </span>
                                  <span className="text-[9px] font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded-md border border-[#ADFF00]/20">
                                    ₹{addonCost} {isPG || isHostel ? 'Out of Pocket' : 'Grocery'}
                                  </span>
                                </div>
                                <ul className="text-[13px] font-medium text-white/90 space-y-2">
                                  {addonPlannedItems.map((item: any) => (
                                    <li key={item.id} className="flex justify-between items-center">
                                      <span className="flex items-center gap-2 text-white/90">
                                        <FoodAvatar 
                                          name={item.foods?.name || ''} 
                                          className="w-7 h-7 rounded-lg object-cover border border-[#ADFF00]/30 shrink-0 shadow-[0_0_6px_rgba(173,255,0,0.15)]"
                                        />
                                        <div>
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-bold block text-xs text-white">{item.foods?.name || 'Protein booster'}</span>
                                            {item.foods?.protein ? (
                                              <span className="text-[9px] font-extrabold text-[#ADFF00] bg-[#ADFF00]/15 px-1.5 py-0.5 rounded border border-[#ADFF00]/30 shadow-[0_0_8px_rgba(173,255,0,0.15)]">
                                                +{Math.round(Number(item.foods.protein) * (Number(item.quantity) || 1))}g P
                                              </span>
                                            ) : null}
                                          </div>
                                          <span className="text-[10px] text-white/50 font-medium">{formatItemServing(item.quantity, item.foods?.serving_size, item.foods?.name)}</span>
                                        </div>
                                      </span>
                                      <span className="text-xs font-bold text-white/80">
                                        {Math.round(Number(item.foods?.calories || 0) * (Number(item.quantity) || 1))} <span className="text-[9px] text-white/40 uppercase">kcal</span>
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </>
                          ) : isICook ? (
                            /* Self-Cooked Recipe view */
                            <div className="bg-white/[0.02] rounded-xl p-2.5 border border-emerald-500/20">
                              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                                  🍳 Homemade Recipe Ingredients
                                </span>
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                                  ₹{totalMealCost} Grocery
                                </span>
                              </div>
                              <ul className="text-[13px] font-medium text-white/80 space-y-2">
                                {currentPlannedFoods.map((item: any) => (
                                  <li key={item.id} className="flex justify-between items-center">
                                    <span className="flex items-center gap-2.5 text-white/80">
                                      <FoodAvatar 
                                        name={item.foods?.name || ''} 
                                        className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0"
                                      />
                                      <div>
                                        <span className="font-semibold block text-xs text-white/90">{item.foods?.name || 'Food item'}</span>
                                        <span className="text-[10px] text-white/40 font-medium">{formatItemServing(item.quantity, item.foods?.serving_size, item.foods?.name)}</span>
                                      </div>
                                    </span>
                                    <span className="text-xs font-black text-white/70">
                                      {Math.round(Number(item.foods?.calories || 0) * (Number(item.quantity) || 1))} <span className="text-[9px] text-white/40 uppercase">kcal</span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            /* Single category (Snack, or only add-ons, or only base) */
                            <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                              <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                                <span className="text-[10px] font-black uppercase tracking-wider text-[#ADFF00] flex items-center gap-1.5">
                                  ⚡ {addonPlannedItems.length > 0 ? 'High-Protein Fuel' : 'Mess Meal'}
                                </span>
                                <span className="text-[9px] font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded-md border border-[#ADFF00]/20">
                                  {addonPlannedItems.length > 0 ? `₹${addonCost}` : 'No extra grocery cost'}
                                </span>
                              </div>
                              <ul className="text-[13px] font-medium text-white/80 space-y-2">
                                {currentPlannedFoods.map((item: any) => (
                                  <li key={item.id} className="flex justify-between items-center">
                                    <span className="flex items-center gap-2.5 text-white/80">
                                      <FoodAvatar 
                                        name={item.foods?.name || ''} 
                                        className="w-7 h-7 rounded-lg object-cover border border-white/10 shrink-0"
                                      />
                                      <div>
                                        <span className="font-semibold block text-xs text-white/90">{item.foods?.name || 'Food item'}</span>
                                        <span className="text-[10px] text-white/40 font-medium">{formatItemServing(item.quantity, item.foods?.serving_size, item.foods?.name)}</span>
                                      </div>
                                    </span>
                                    <span className="text-xs font-black text-white/70">
                                      {Math.round(Number(item.foods?.calories || 0) * (Number(item.quantity) || 1))} <span className="text-[9px] text-white/40 uppercase">kcal</span>
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-2 text-white/40 text-xs">
                          {isFuture
                            ? "No foods scheduled for this meal."
                            : <>No foods planned yet. Tap <span className="text-[#ADFF00] font-bold">Log Meal</span> to add foods!</>
                          }
                        </div>
                      )}
                      {currentPrepInstruction && !hasLoggedFoods && (
                        <div className="pt-2.5 mt-2.5 border-t border-white/5 text-[11px] text-white/70 leading-relaxed bg-white/[0.02] p-2.5 rounded-xl border border-white/5 flex items-start gap-2">
                          <span className="text-sm shrink-0">💡</span>
                          <span>{currentPrepInstruction}</span>
                        </div>
                      )}
                    </div>
                    {!hasLoggedFoods && currentPlannedFoods.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                        {[
                          { label: 'Calories', value: Math.round(plannedTotals.calories), suffix: 'kcal', className: 'text-white' },
                          { label: 'Fat', value: Math.round(plannedTotals.fat), suffix: 'g', className: 'text-amber-400' },
                          { label: 'Carbs', value: Math.round(plannedTotals.carbs), suffix: 'g', className: 'text-sky-400' },
                          { label: 'Protein', value: Math.round(plannedTotals.protein), suffix: 'g', className: 'text-[#ADFF00]' },
                        ].map((macro) => (
                          <div key={macro.label} className="text-center">
                            <p className={`text-xs font-black ${macro.className}`}>{macro.value}{macro.suffix}</p>
                            <p className="text-[9px] text-white/40">{macro.label}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      {isPast ? (
                        <div className="flex-1 py-2.5 px-4 bg-[#121E12] border border-white/5 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/40 flex justify-center items-center gap-2 select-none">
                          <Clock size={14} /> Past Day
                        </div>
                      ) : isFuture ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => handleOpenSwapModal(meal.meal_type)} 
                            className="py-2.5 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ADFF00]/40 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 hover:text-white transition-all flex justify-center items-center gap-1.5 cursor-pointer"
                            title="Swap this planned meal for another recipe"
                          >
                            {isPro ? <RefreshCw size={14} /> : <Lock size={13} className="text-amber-400" />} 
                            Swap
                          </button>
                          <div 
                            className="flex-1 py-2.5 px-4 bg-[#121E12] border border-white/5 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/40 flex justify-center items-center gap-2 cursor-not-allowed select-none opacity-70"
                            title="Scheduled meal for this upcoming date"
                          >
                            <Clock size={14} className="text-white/40" />
                            <span>Scheduled</span>
                          </div>
                        </>
                      ) : !hasLoggedFoods ? (
                        <>
                          <button 
                            type="button"
                            onClick={() => handleOpenSwapModal(meal.meal_type)} 
                            className="py-2.5 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ADFF00]/40 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 hover:text-white transition-all flex justify-center items-center gap-1.5 cursor-pointer"
                          >
                            {isPro ? <RefreshCw size={14} /> : <Lock size={13} className="text-amber-400" />} 
                            Swap
                          </button>
                          <button 
                            type="button"
                            onClick={() => openLogModal(meal.meal_type, currentPlannedFoods)} 
                            className={`flex-1 py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2 cursor-pointer ${
                              isPro 
                                ? "bg-[#ADFF00] hover:bg-[#baff22] text-black shadow-[0_0_15px_rgba(173,255,0,0.15)]"
                                : "bg-white/10 hover:bg-white/15 border border-white/10 text-white/90"
                            }`}
                          >
                            {!isPro && <Lock size={13} className="text-amber-400" />}
                            Log Meal {!isPro && <span className="text-[9px] text-amber-400 uppercase font-black ml-0.5">PRO</span>}
                          </button>
                          <button 
                            type="button"
                            onClick={() => openLogModal(meal.meal_type)} 
                            className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 hover:text-white transition-all flex justify-center items-center cursor-pointer"
                            title={isPro ? "Add extra food to this meal" : "Pro Feature: Add extra food"}
                          >
                            {isPro ? <Plus size={14} /> : <Lock size={13} className="text-amber-400" />}
                          </button>
                        </>
                      ) : (
                        <button 
                          type="button"
                          onClick={() => openLogModal(meal.meal_type)} 
                          className={`w-full py-2.5 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex justify-center items-center gap-1.5 cursor-pointer ${
                            isPro
                              ? "bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 border border-[#ADFF00]/30 text-[#ADFF00]"
                              : "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70"
                          }`}
                        >
                          {isPro ? <Plus size={14} /> : <Lock size={13} className="text-amber-400" />} Add Food {!isPro && <span className="text-[9px] text-amber-400 uppercase font-black ml-0.5">PRO</span>}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick Actions Row */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black tracking-widest text-[#ADFF00] uppercase mb-1">Protein Goal</h3>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-white">{Math.round(consumed.protein || 0)}</span>
                <span className="text-sm font-bold text-white/40 pb-1">/ {Math.round(targets.protein || 130)}g</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                <div 
                  className="h-full bg-[#ADFF00] rounded-full transition-all duration-300" 
                  style={{ width: `${Math.min(100, Math.round(((consumed.protein || 0) / (targets.protein || 1)) * 100))}%` }} 
                />
              </div>
              <p className="text-[10px] font-bold text-white/50">{Math.round(remaining.protein || 0)}g remaining</p>
            </div>
          </div>

          <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-1">Food Budget</h3>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-white">₹{Math.round(budget.spent || 0)}</span>
                <span className="text-sm font-bold text-white/40 pb-1">/ ₹{budget.daily_limit || 200}</span>
              </div>
              <p className="text-[10px] font-bold text-white/40 mt-1">
                {isToday ? "Today" : isFuture ? "Scheduled" : "Spent"}
              </p>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${(budget.spent || 0) > ((budget.daily_limit || 200) * 1.1) ? 'bg-rose-500' : (budget.spent || 0) > (budget.daily_limit || 200) ? 'bg-amber-400' : 'bg-emerald-400'}`} 
                  style={{ width: `${Math.min(100, Math.round(((budget.spent || 0) / (budget.daily_limit || 1)) * 100))}%` }} 
                />
              </div>
              <p className="text-[10px] font-bold text-white/60">₹{Math.round(budget.monthly_spent || 0)} / ₹{budget.monthly_limit || 6000} Monthly</p>
            </div>
          </div>
        </div>

        {/* Animated Water Intake Bottle Card */}
        <WaterBottleCard
          isPro={isPro}
          disabled={!isToday}
          consumedMl={Number(consumed.water_ml) || 0}
          targetMl={Number(targets.water_ml) || 2500}
          onAddWater={handleAddWater}
          onRemoveWater={handleRemoveWater}
          onResetWater={handleResetWater}
          onEditGoal={openTargetsModal}
        />

        {/* Water Intake History & Heatmap Card */}
        <WaterHistoryCard
          todayConsumedMl={isToday ? Number(consumed.water_ml) || 0 : 0}
          targetMl={Number(targets.water_ml) || 2500}
        />

        {/* Today's Summary section */}
        <TodaySummaryCard
          consumed={consumed}
          targets={targets}
          meals={meals}
          loggedFoods={loggedFoods}
          nutritionScore={nutrition_score}
          title={isToday ? "Today's Summary" : isFuture ? "Scheduled Summary" : "Day Summary"}
        />

      </div>

      {modalOpen && (
        <LogFoodModal 
          key={`${modalMealType}-${modalPreselectedFoods?.length || 0}`}
          isOpen={modalOpen} 
          onClose={() => setModalOpen(false)} 
          onSuccess={handleFoodLoggedSuccess}
          defaultMealType={modalMealType}
          preselectedFoods={modalPreselectedFoods}
        />
      )}

      <SwapMealModal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        mealType={swapMealType}
        onSelectOption={handleSelectSwapOption}
        onCustomFoodClick={() => {
          setSwapModalOpen(false);
          openLogModal(swapMealType);
        }}
      />

      {/* Edit Daily Targets Modal */}
      <AnimatePresence>
        {showTargetsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111A10] border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-2xl relative max-h-[90dvh] overflow-y-auto overscroll-contain"
            >
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00] shrink-0">
                    <Edit3 size={16} />
                  </div>
                  <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider truncate">Daily Targets</h2>
                </div>
                <button onClick={() => setShowTargetsModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white shrink-0">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3.5 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-white/60 uppercase tracking-wider mb-1">Calories (kcal)</label>
                    <input 
                      type="number"
                      value={targetForm.calories}
                      onChange={(e) => setTargetForm(p => ({ ...p, calories: Number(e.target.value) }))}
                      className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white font-bold text-sm outline-none focus:border-[#ADFF00]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-[#ADFF00] uppercase tracking-wider mb-1">Protein (g)</label>
                    <input 
                      type="number"
                      value={targetForm.protein}
                      onChange={(e) => setTargetForm(p => ({ ...p, protein: Number(e.target.value) }))}
                      className="w-full p-3 rounded-xl bg-black/40 border border-[#ADFF00]/30 text-white font-bold text-sm outline-none focus:border-[#ADFF00]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1">Carbs (g)</label>
                    <input 
                      type="number"
                      value={targetForm.carbs}
                      onChange={(e) => setTargetForm(p => ({ ...p, carbs: Number(e.target.value) }))}
                      className="w-full p-3 rounded-xl bg-black/40 border border-blue-400/30 text-white font-bold text-sm outline-none focus:border-blue-400"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-orange-400 uppercase tracking-wider mb-1">Fat (g)</label>
                    <input 
                      type="number"
                      value={targetForm.fat}
                      onChange={(e) => setTargetForm(p => ({ ...p, fat: Number(e.target.value) }))}
                      className="w-full p-3 rounded-xl bg-black/40 border border-orange-400/30 text-white font-bold text-sm outline-none focus:border-orange-400"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider">Water Target (ml)</label>
                    <span className="text-[10px] text-white/40 font-medium">Max 8,000ml (8L)</span>
                  </div>
                  <input 
                    type="number"
                    min={1000}
                    max={8000}
                    step={250}
                    value={targetForm.water_ml}
                    onChange={(e) => setTargetForm(p => ({ ...p, water_ml: Math.min(8000, Number(e.target.value)) }))}
                    className="w-full p-3 rounded-xl bg-black/40 border border-cyan-400/30 text-white font-bold text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="button"
                  disabled={isGenerating}
                  onClick={() => handleSetDailyTargets()}
                  className="w-full py-4 mt-2 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all duration-150 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 select-none"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  <span>{isGenerating ? "Saving Targets..." : "Save Daily Targets"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <ProUpgradeModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName={proModalFeature}
      />
    </>
  );
}
