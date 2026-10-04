"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  Clock3, Loader2, ShoppingBasket, Sparkles,
  Utensils, X } from "lucide-react";
import { toast } from "sonner";
import { FoodAvatar } from "./food-avatar";
import { LogFoodModal } from "./log-food-modal";
import { TodaySummaryCard } from "./today-summary-card";
import { WaterBottleCard } from "./water-bottle-card";
import { WaterHistoryCard } from "./water-history-card";
import { nutritionApi } from "@/lib/api/nutrition";
import type { V2NutritionDay, V2NutritionMeal } from "@/lib/services/nutrition/v2-ui-data";

type SwapOption = {
  id: string; name: string; description?: string; image_url?: string;
  calories: number; protein: number; estimated_cost: number; prep_time_min?: number;
  items?: Array<{ name: string }>;
};
const NO_PRESELECTED_FOODS: [] = [];

function dateAtNoon(date: string): Date { return new Date(`${date}T12:00:00Z`); }
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
    hour: "numeric", minute: "2-digit",
  });
}
function loggedTime(time: string, timezone: string): string {
  return new Date(time).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: timezone });
}
function number(value: number): string { return Math.round(value).toLocaleString("en-IN"); }
function messageOf(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error && typeof error.message === "string") return error.message;
  return "Please try again.";
}
function actualTotals(meal: V2NutritionMeal) {
  return meal.logs.reduce((total, log) => ({
    calories: total.calories + log.calories, protein: total.protein + log.protein,
    carbs: total.carbs + log.carbs, fat: total.fat + log.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });
}
function stateOf(meal: V2NutritionMeal, nextId: string | undefined) {
  if (meal.logs.length > 0 || meal.status === "LOGGED") return "LOGGED";
  if (meal.status === "SKIPPED" || meal.status === "CANCELLED") return "SKIPPED";
  return meal.id === nextId ? "NEXT" : "UPCOMING";
}

function Metric({ label, consumed, target, color, unit = "g" }: {
  label: string; consumed: number; target: number; color: string; unit?: string;
}) {
  const percent = target > 0 ? Math.min(100, Math.round(consumed / target * 100)) : 0;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3.5 sm:p-4">
      <div className="mb-2 flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/50">
        <span>{label}</span><span className="text-white/35">{percent}%</span>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className="text-2xl font-black leading-none text-white sm:text-3xl">{number(consumed)}</span>
        <span className="text-xs font-semibold text-white/45">/ {number(target)} {unit}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percent}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

function SwapDialog({ meal, date, onClose, onSwapped }: {
  meal: V2NutritionMeal; date: string; onClose: () => void; onSwapped: () => Promise<void>;
}) {
  const [options, setOptions] = useState<SwapOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const loadOptions = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const response = await fetch(`/api/nutrition/swap-meal?meal_type=${encodeURIComponent(meal.slot)}&date=${date}`, { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok || payload.engine !== "v2") throw new Error(messageOf(payload.error || "V2 alternatives are unavailable."));
      setOptions((payload.data?.options || []).slice(0, 6));
    } catch (cause) { setError(messageOf(cause)); }
    finally { setLoading(false); }
  }, [date, meal.slot]);
  useEffect(() => { void loadOptions(); }, [loadOptions]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
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
    } catch (cause) { toast.error(messageOf(cause)); }
    finally { setPendingId(null); }
  };
  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="swap-title" className="flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#101B0F] shadow-2xl sm:rounded-[28px]">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div><p className="mb-1 text-[11px] font-black uppercase tracking-[0.2em] text-[#ADFF00]">Your alternatives</p>
            <h2 id="swap-title" className="text-xl font-black text-white">Swap {titleCase(meal.slot)}</h2>
            <p className="mt-1 text-sm text-white/50">Choose another meal that fits your saved plan.</p></div>
          <button type="button" onClick={onClose} aria-label="Close swap options" className="rounded-full bg-white/10 p-2 text-white/70 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-3 overflow-y-auto p-4 sm:p-6">
          {loading && [0, 1, 2].map((key) => <div key={key} className="h-28 animate-pulse rounded-2xl bg-white/5" />)}
          {error && <div className="rounded-2xl border border-rose-400/20 bg-rose-400/5 p-5 text-sm text-rose-200">{error}<button type="button" onClick={() => void loadOptions()} className="ml-3 font-bold underline">Retry</button></div>}
          {!loading && !error && options.length === 0 && <p className="rounded-2xl border border-white/10 p-6 text-center text-sm text-white/55">No compatible alternatives are available for this meal.</p>}
          {!loading && !error && options.map((option) => (
            <div key={option.id} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3.5 sm:gap-4 sm:p-4">
              <FoodAvatar name={option.name} imageUrl={option.image_url} className="h-20 w-20 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24" />
              <div className="min-w-0 flex-1">
                <h3 className="line-clamp-2 font-bold text-white">{option.name}</h3>
                <p className="mt-1 line-clamp-1 text-xs text-white/45">{option.items?.map((item) => item.name).join(" · ") || option.description}</p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold text-white/70">
                  <span>{number(option.calories)} kcal</span><span>{number(option.protein)}g protein</span>
                  <span>₹{number(option.estimated_cost)}</span>
                  {option.prep_time_min != null && <span>{option.prep_time_min} min prep</span>}
                </div>
                <button type="button" disabled={Boolean(pendingId)} onClick={() => void selectOption(option)} className="mt-3 rounded-lg bg-[#ADFF00] px-3 py-2 text-xs font-black text-[#0A1108] disabled:opacity-50">
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

export function V2NutritionView({ initialData, isPro, fixtureMode = false }: {
  initialData: V2NutritionDay | null; isPro: boolean; fixtureMode?: boolean;
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
  useEffect(() => { setHydrated(true); }, []);
  const weekDates = useMemo(() => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)), [weekStart]);
  const current = data?.date === selectedDate ? data : null;
  const today = data?.today || initialData?.today || selectedDate;
  const isToday = selectedDate === today;
  const isPast = selectedDate < today;
  const reload = useCallback(() => { setRefreshKey((key) => key + 1); }, []);

  useEffect(() => {
    if (fixtureMode && refreshKey === 0 && selectedDate === initialData?.date) return;
    const requestId = ++dayRequest.current;
    const controller = new AbortController();
    setLoading(true); setError(null);
    fetch(`/api/nutrition/v2-day?date=${selectedDate}`, { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(messageOf(payload.error));
        return payload.data as V2NutritionDay;
      })
      .then((fresh) => { if (requestId === dayRequest.current) { setData(fresh); setWaterGoal(fresh.targets.water_ml || 2500); } })
      .catch((cause) => { if (!controller.signal.aborted && requestId === dayRequest.current) setError(messageOf(cause)); })
      .finally(() => { if (requestId === dayRequest.current) setLoading(false); });
    return () => controller.abort();
  }, [selectedDate, refreshKey, fixtureMode, initialData?.date]);

  const navigateWeek = (days: number) => {
    const next = addDays(weekStart, days);
    setWeekStart(next); setSelectedDate(next); setExpandedId(null);
  };
  const chooseDay = (date: string) => { setSelectedDate(date); setExpandedId(null); setPlanOpen(false); };
  const nextMealId = current?.meals.find((meal) => meal.status === "PLANNED" && meal.logs.length === 0)?.id;
  const loggedCount = current?.meals.filter((meal) => meal.logs.length > 0 || meal.status === "LOGGED").length || 0;

  const generatePlan = async () => {
    setGenerating(true);
    try {
      await nutritionApi.generatePlan({ v2: true, start_date: today });
      toast.success("Your 7-day plan is ready.");
      setSelectedDate(today); setWeekStart(mondayOf(today)); reload();
    } catch (cause) { toast.error(messageOf(cause)); }
    finally { setGenerating(false); }
  };
  const logPlanned = async (meal: V2NutritionMeal) => {
    if (loggingMealId) return;
    setLoggingMealId(meal.id);
    try {
      const response = await fetch("/api/nutrition/log-planned-meal", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: selectedDate, meal_slot: meal.slot }),
      });
      const payload = await response.json();
      if (!response.ok || payload.engine !== "v2") throw new Error(messageOf(payload.error || "Planned meal was not saved."));
      toast.success(`${titleCase(meal.slot)} logged from your plan.`);
      reload();
    } catch (cause) { toast.error(messageOf(cause)); }
    finally { setLoggingMealId(null); }
  };
  const updateWater = async (action: () => Promise<unknown>) => {
    try { await action(); reload(); } catch (cause) { toast.error(messageOf(cause)); }
  };
  const saveWaterGoal = async () => {
    if (!current || waterGoal < 250 || waterGoal > 8000) { toast.error("Choose a water target from 250 to 8000 ml."); return; }
    setSavingWaterGoal(true);
    try {
      await nutritionApi.setTargets({ ...current.targets, water_ml: waterGoal });
      setWaterGoalOpen(false); reload(); toast.success("Water target updated.");
    } catch (cause) { toast.error(messageOf(cause)); }
    finally { setSavingWaterGoal(false); }
  };

  return (
    <div className="space-y-6 sm:space-y-8" data-v2-ready={hydrated}>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="mb-2 flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.26em] text-[#ADFF00]"><Sparkles size={13} /> Daily fuel</p>
          <h1 className="text-3xl font-black uppercase leading-none tracking-tight text-white sm:text-5xl">Your Nutrition</h1>
          <p className="mt-2 text-sm font-medium text-white/50">{displayDate(selectedDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
        </div>
        <span className="rounded-full border border-[#ADFF00]/25 bg-[#ADFF00]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#ADFF00]">Personal plan</span>
      </header>

      <section className="relative overflow-hidden rounded-[28px] border border-[#ADFF00]/20 bg-gradient-to-br from-[#1A2915] via-[#111D10] to-[#0E170D] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.25)] sm:p-7" aria-label="Nutrition dashboard">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#ADFF00]/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#ADFF00]">{isToday ? "Today's progress" : "Day's progress"}</p>
            <p className="mt-1 text-sm text-white/60">All intake comes from your saved food log.</p></div>
          <div className="rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-right"><p className="text-[10px] font-bold uppercase tracking-widest text-white/45">Meals logged</p>
            <p className="text-xl font-black text-white">{loggedCount} <span className="text-sm text-white/40">/ {current?.meals.length || 0}</span></p></div>
        </div>
        <div className="relative mt-5 grid grid-cols-2 gap-2.5">
          <Metric label="Calories" consumed={current?.consumed.calories || 0} target={current?.targets.calories || 0} unit="kcal" color="#ADFF00" />
          <Metric label="Protein" consumed={current?.consumed.protein || 0} target={current?.targets.protein || 0} color="#67e8f9" />
          <Metric label="Carbs" consumed={current?.consumed.carbs || 0} target={current?.targets.carbs || 0} color="#fb923c" />
          <Metric label="Fat" consumed={current?.consumed.fat || 0} target={current?.targets.fat || 0} color="#f9a8d4" />
        </div>
        <div className="relative mt-5 flex flex-wrap gap-2.5">
          <Link href="/grocery" className="inline-flex items-center gap-2 rounded-xl bg-[#ADFF00] px-4 py-3 text-xs font-black uppercase tracking-wide text-[#0B1508] hover:bg-[#c1ff3f]"><ShoppingBasket size={16} /> Grocery List <ArrowRight size={14} /></Link>
          <button type="button" onClick={() => setPlanOpen((open) => !open)} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-white/10"><CalendarDays size={16} /> 7-Day Plan</button>
          {isToday && <button type="button" onClick={() => setManualSlot("snack")} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-wide text-white hover:bg-white/10"><Utensils size={16} /> Log actual food</button>}
        </div>
      </section>

      {planOpen && <section className="rounded-2xl border border-white/10 bg-[#111A10] p-4 sm:p-5" aria-label="Seven day plan overview">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-black text-white">Your 7-day plan</h2><button type="button" onClick={() => setPlanOpen(false)} aria-label="Close plan overview" className="text-white/50"><X size={16} /></button></div>
        <div className="grid grid-cols-7 gap-1.5">{weekDates.map((date) => <button key={date} type="button" onClick={() => chooseDay(date)} className={`rounded-xl border p-2 text-center ${date === selectedDate ? "border-[#ADFF00]/60 bg-[#ADFF00]/15 text-[#ADFF00]" : "border-white/10 text-white/70"}`}><span className="block text-[10px] uppercase">{displayDate(date, { weekday: "short" })}</span><span className="block text-lg font-black">{date.slice(-2)}</span></button>)}</div>
        {!current?.planId && isPro && <button type="button" disabled={generating} onClick={() => void generatePlan()} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#ADFF00] px-4 py-3 text-sm font-black text-black disabled:opacity-50">{generating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Generate V2 plan</button>}
      </section>}

      <section aria-label="Choose plan day">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-black uppercase tracking-[0.18em] text-white/45">Your week</h2>
          <div className="flex gap-2"><button type="button" onClick={() => navigateWeek(-7)} aria-label="Previous week" className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white"><ChevronLeft size={17} /></button><button type="button" onClick={() => navigateWeek(7)} aria-label="Next week" className="rounded-full border border-white/10 p-2 text-white/70 hover:text-white"><ChevronRight size={17} /></button></div></div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">{weekDates.map((date) => <button key={date} type="button" onClick={() => chooseDay(date)} aria-pressed={date === selectedDate} className={`min-w-0 rounded-2xl border px-1 py-3 text-center transition ${date === selectedDate ? "border-[#ADFF00] bg-[#ADFF00] text-[#10200A] shadow-[0_8px_24px_rgba(173,255,0,0.18)]" : "border-white/10 bg-[#111A10] text-white/55 hover:border-white/30"}`}><span className="block text-[9px] font-black uppercase tracking-wider sm:text-[11px]">{displayDate(date, { weekday: "short" })}</span><span className="mt-1 block text-lg font-black sm:text-xl">{date.slice(-2)}</span>{date === today && <span className="mx-auto mt-1 block h-1 w-1 rounded-full bg-current" />}</button>)}</div>
      </section>

      <section aria-label="Meal timeline">
        <div className="mb-4 flex items-end justify-between gap-3"><div><p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#ADFF00]">Fuel timeline</p><h2 className="mt-1 text-2xl font-black text-white">Meals for {displayDate(selectedDate, { weekday: "long" })}</h2></div>
          {current?.planId && <span className="text-xs text-white/40">{current.meals.length} planned</span>}</div>
        {loading && !current && <div className="space-y-3" aria-label="Loading meals">{[0, 1, 2].map((index) => <div key={index} className="h-28 animate-pulse rounded-2xl border border-white/5 bg-white/5" />)}</div>}
        {error && <div className="rounded-2xl border border-rose-400/25 bg-rose-400/5 p-5 text-sm text-rose-200">Couldn&apos;t load this day: {error}<button type="button" onClick={reload} className="ml-3 font-bold underline">Retry</button></div>}
        {!loading && !error && current?.meals.length === 0 && <div className="rounded-[24px] border border-dashed border-white/15 bg-[#111A10] p-8 text-center"><CalendarDays className="mx-auto mb-3 text-[#ADFF00]" size={32} /><h3 className="text-lg font-black">No V2 meals saved for this day</h3><p className="mx-auto mt-2 max-w-sm text-sm text-white/50">Choose another day or generate your personal 7-day plan.</p>{isPro && isToday && <button type="button" disabled={generating} onClick={() => void generatePlan()} className="mt-5 rounded-xl bg-[#ADFF00] px-5 py-3 text-sm font-black text-black disabled:opacity-50">{generating ? "Generating…" : "Generate 7-day plan"}</button>}</div>}
        {current && <div className="space-y-3">{current.meals.map((meal) => {
          const state = stateOf(meal, nextMealId);
          const logged = state === "LOGGED";
          const actual = actualTotals(meal);
          const differentFood = logged && meal.logs.some((log) => !log.plannedMealId);
          const shownCalories = logged && meal.logs.length > 0 ? actual.calories : meal.calories;
          const shownProtein = logged && meal.logs.length > 0 ? actual.protein : meal.protein;
          const expanded = expandedId === meal.id;
          return <article key={meal.id} className={`overflow-hidden rounded-[22px] border bg-[#111A10] transition ${state === "NEXT" ? "border-[#ADFF00]/55 shadow-[0_0_28px_rgba(173,255,0,0.11)]" : "border-white/10"}`}>
            <div className="flex gap-3 p-3.5 sm:gap-4 sm:p-5"><FoodAvatar name={meal.name} imageUrl={meal.imageUrl} className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28" />
              <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`rounded-md px-2 py-1 text-[10px] font-black tracking-[0.12em] ${state === "NEXT" ? "bg-[#ADFF00] text-[#10200A]" : state === "LOGGED" ? "bg-emerald-400/15 text-emerald-300" : "bg-white/10 text-white/60"}`}>{state}</span><span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/40">{titleCase(meal.slot)}</span></div>
                <h3 className="mt-1.5 line-clamp-2 text-base font-bold leading-tight text-white sm:text-lg">{meal.name}</h3>
                <p className="mt-1 flex items-center gap-1 text-xs text-white/45"><Clock3 size={12} /> {displayTime(meal.scheduledTime)}{logged && meal.logs.length > 0 && ` · Logged ${loggedTime(meal.logs[meal.logs.length - 1].loggedAt, current.timezone)}`}</p>
                <p className="mt-2 line-clamp-1 text-xs text-white/50">{differentFood ? `Actual: ${meal.logs.map((log) => log.name).join(", ")}` : meal.ingredients.map((item) => item.name).join(" · ")}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-bold"><span className="text-[#ADFF00]">{number(shownCalories)} kcal</span><span className="text-white/70">{number(shownProtein)}g protein</span>{differentFood && <span className="text-amber-300">Different food logged</span>}</div>
              </div></div>
            <div className="flex flex-wrap items-center gap-2 border-t border-white/5 px-3.5 py-3 sm:px-5">
              {!logged && state !== "SKIPPED" && isToday && isPro && <button type="button" disabled={Boolean(loggingMealId)} onClick={() => void logPlanned(meal)} className="rounded-lg bg-[#ADFF00] px-3 py-2 text-xs font-black text-black hover:bg-[#c3ff42] disabled:opacity-50">{loggingMealId === meal.id ? "Logging…" : "Log Meal"}</button>}
              {!logged && state !== "SKIPPED" && !isPast && isPro && <button type="button" onClick={() => setSwapMeal(meal)} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-bold text-white/80 hover:bg-white/10">Swap</button>}
              <button type="button" aria-expanded={expanded} onClick={() => setExpandedId(expanded ? null : meal.id)} className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs font-bold text-white/55 hover:text-white">{expanded ? "Less detail" : "View details"}<ChevronDown size={15} className={expanded ? "rotate-180" : ""} /></button>
            </div>
            {expanded && <div className="grid gap-5 border-t border-white/5 bg-black/15 p-4 text-sm sm:p-5"><div><h4 className="mb-3 text-[11px] font-black uppercase tracking-[0.15em] text-white/45">Full ingredients</h4><ul className="space-y-2">{meal.ingredients.map((item) => <li key={item.id} className="flex justify-between gap-3 text-white/75"><span>{item.name}{item.isProvided && <span className="ml-1 text-[10px] text-[#ADFF00]">Provided</span>}</span><span className="whitespace-nowrap font-semibold text-white">{item.quantity}</span></li>)}</ul><p className="mt-4 text-xs text-white/45">Estimated meal cost <span className="font-bold text-white">₹{number(meal.cost)}</span></p></div>
              <div><h4 className="mb-2 text-[11px] font-black uppercase tracking-[0.15em] text-white/45">Preparation</h4><p className="leading-relaxed text-white/70">{meal.prepInstructions || "Preparation instructions are not available for this meal."}</p>{meal.whyThisMeal && <><h4 className="mb-2 mt-4 text-[11px] font-black uppercase tracking-[0.15em] text-white/45">Why this meal</h4><p className="leading-relaxed text-white/70">{meal.whyThisMeal}</p></>}{logged && meal.logs.length > 0 && <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/5 p-3"><p className="text-xs font-black text-emerald-300">Actual food logged</p><ul className="mt-2 space-y-1 text-xs text-white/70">{meal.logs.map((log) => <li key={log.id}>{log.name}{log.serving && ` · ${log.serving}`} · {number(log.calories)} kcal</li>)}</ul><p className="mt-2 font-bold text-white">{number(actual.calories)} kcal · {number(actual.protein)}g protein · {number(actual.carbs)}g carbs · {number(actual.fat)}g fat</p></div>}{isToday && isPro && !logged && <button type="button" onClick={() => setManualSlot(meal.slot)} className="mt-4 text-xs font-bold text-[#ADFF00] underline underline-offset-4">I ate different food</button>}</div></div>}
          </article>;
        })}</div>}
      </section>

      {current && <div className="grid gap-4"><div><TodaySummaryCard consumed={current.consumed} targets={current.targets} meals={current.meals.map((meal) => ({ meal_type: meal.slot }))} loggedFoods={current.logs.map((log) => ({ meal_type: log.mealSlot }))} title={isToday ? "Today's Summary" : "Day Summary"} /></div>
        <WaterBottleCard isPro={isPro} disabled={!isToday} consumedMl={current.consumed.water_ml} targetMl={current.targets.water_ml} onAddWater={(amount) => updateWater(() => nutritionApi.logWater(amount))} onRemoveWater={(amount) => updateWater(() => nutritionApi.removeWater(amount))} onResetWater={() => updateWater(() => nutritionApi.resetWater())} onEditGoal={() => setWaterGoalOpen(true)} />
        <WaterHistoryCard todayConsumedMl={isToday ? current.consumed.water_ml : 0} targetMl={current.targets.water_ml} />
      </div>}

      {swapMeal && <SwapDialog meal={swapMeal} date={selectedDate} onClose={() => setSwapMeal(null)} onSwapped={async () => { reload(); }} />}
      {manualSlot && <LogFoodModal key={manualSlot} isOpen onClose={() => setManualSlot(null)} defaultMealType={manualSlot} preselectedFoods={NO_PRESELECTED_FOODS} onSuccess={() => { reload(); }} />}
      {waterGoalOpen && <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setWaterGoalOpen(false); }}><section role="dialog" aria-modal="true" aria-label="Edit water target" className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111A10] p-5"><h2 className="text-lg font-black">Daily water target</h2><label className="mt-4 block text-xs font-bold text-white/50" htmlFor="v2-water-goal">Millilitres</label><input id="v2-water-goal" type="number" min={250} max={8000} step={250} value={waterGoal} onChange={(event) => setWaterGoal(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 p-3 text-white" /><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setWaterGoalOpen(false)} className="rounded-lg px-3 py-2 text-sm text-white/60">Cancel</button><button type="button" disabled={savingWaterGoal} onClick={() => void saveWaterGoal()} className="rounded-lg bg-[#ADFF00] px-4 py-2 text-sm font-black text-black disabled:opacity-50">Save</button></div></section></div>}
    </div>
  );
}
