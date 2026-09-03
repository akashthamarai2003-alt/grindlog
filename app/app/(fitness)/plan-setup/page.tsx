'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, Check, AlertTriangle, ArrowRight, Brain, Dumbbell, Apple, Droplets, Flame, ShoppingCart, ShieldAlert, HeartPulse, CalendarDays, CircleCheck, Activity, LockKeyhole } from 'lucide-react';
import { toast } from 'sonner';
import GroceryTab from '@/components/fitness/plan/grocery-tab';
import { AIPlanAnimation } from '@/components/fitness/plan-animation';

type PlanGenerationError = Error & {
  errorType: "SAFETY" | "SYSTEM" | "PLAN_ACTIVE" | "PAYMENT_REQUIRED";
};

let activePlanDraftRequest: Promise<any> | null = null;

async function requestPlanDraft() {
  if (activePlanDraftRequest) return activePlanDraftRequest;

  activePlanDraftRequest = fetch('/api/fitness-ai/generate-draft', { method: 'POST' })
    .then(async (response) => {
      const body = await response.json().catch(() => null);

      if (!response.ok || !body?.success) {
        const error = new Error(
          body?.error || `We could not start plan generation (request ${response.status}).`,
        ) as PlanGenerationError;
        error.errorType = body?.errorType === "SAFETY"
          ? "SAFETY"
          : body?.errorType === "PLAN_ACTIVE"
            ? "PLAN_ACTIVE"
            : body?.errorType === "PAYMENT_REQUIRED"
              ? "PAYMENT_REQUIRED"
            : "SYSTEM";
        throw error;
      }

      return body;
    })
    .finally(() => {
      activePlanDraftRequest = null;
    });

  return activePlanDraftRequest;
}

function getPlanGenerationErrorType(error: unknown): "SAFETY" | "SYSTEM" | "PLAN_ACTIVE" | "PAYMENT_REQUIRED" {
  return typeof error === "object" &&
    error !== null &&
    "errorType" in error &&
    (error.errorType === "SAFETY" || error.errorType === "PLAN_ACTIVE" || error.errorType === "PAYMENT_REQUIRED")
    ? error.errorType
    : "SYSTEM";
}

function usesProvidedCoreMeals(profile: any): boolean {
  return ["PG", "Hostel", "Home", "Office/Canteen"].includes(profile?.food_environment);
}

function foodRoutineLabel(foodEnvironment: unknown): string | null {
  const environment = typeof foodEnvironment === "string" ? foodEnvironment.trim() : "";
  if (!environment) return null;
  if (environment === "PG") return "PG-provided food";
  if (environment === "Hostel") return "Hostel-provided food";
  if (environment === "Home") return "Home meals";
  if (environment === "Office/Canteen") return "Canteen meals";
  return `${environment} meals`;
}

function providedMealSourceLabel(foodEnvironment: unknown): string {
  const environment = typeof foodEnvironment === "string" ? foodEnvironment.trim() : "";
  if (environment === "PG") return "PG-provided";
  if (environment === "Hostel") return "Hostel-provided";
  if (environment === "Home") return "Home-provided";
  if (environment === "Office/Canteen") return "Canteen-provided";
  return environment ? `${environment}-provided` : "Provided";
}

function normaliseProvidedMealItem(item: unknown, foodEnvironment: unknown): string {
  const text = String(item ?? "").trim();
  if (!/PG\/Hostel\/Home\s+Provided\s+Core\s+Meal\s*\(Free\)/i.test(text)) {
    return text;
  }

  return text.replace(
    /PG\/Hostel\/Home\s+Provided\s+Core\s+Meal\s*\(Free\)/gi,
    `${providedMealSourceLabel(foodEnvironment)} core meal (free)`,
  );
}

function isCoreMeal(mealName: unknown): boolean {
  return typeof mealName === "string" && /breakfast|lunch|dinner/i.test(mealName);
}

function weekDayLabel(offset: number, anchorDate: Date): string {
  const date = new Date(anchorDate);
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date).toUpperCase();
}

function workoutDayOffset(workoutDate: unknown, anchorDate: Date): number | null {
  if (typeof workoutDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(workoutDate)) return null;
  const anchor = new Date(anchorDate);
  anchor.setHours(0, 0, 0, 0);
  const [year, month, day] = workoutDate.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setHours(0, 0, 0, 0);
  const offset = Math.round((date.getTime() - anchor.getTime()) / 86400000);
  return offset >= 0 && offset < 7 ? offset : null;
}

function planAnchorDate(workouts: any[]): Date {
  const datedWorkouts = workouts
    .map((workout) => workout?.workout_date)
    .filter((date): date is string => typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date))
    .sort();

  if (datedWorkouts.length) {
    const [year, month, day] = datedWorkouts[0].split("-").map(Number);
    return new Date(year, month - 1, day);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function ProUpgradePanel({
  section,
  onUpgrade,
}: {
  section: "diet" | "grocery";
  onUpgrade: () => void;
}) {
  const isDiet = section === "diet";

  return (
    <div className="mx-auto max-w-md px-6 pb-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <section className="overflow-hidden rounded-3xl border border-[#ADFF00]/25 bg-[linear-gradient(145deg,rgba(173,255,0,0.10),rgba(18,30,18,1)_48%)] p-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ADFF00]/15 text-[#ADFF00]">
          <LockKeyhole size={26} />
        </div>
        <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">Pro feature</p>
        <h2 className="mt-2 text-2xl font-black text-white">
          {isDiet ? "Unlock your full nutrition plan" : "Unlock smart grocery add-ons"}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-300">
          Core includes your workout plan and calorie/protein targets. Upgrade to Pro for
          {isDiet ? " complete meals, macros, and nutrition guidance." : " meal-linked grocery quantities, prices, and protein details."}
        </p>
        <button
          type="button"
          onClick={onUpgrade}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-[#ADFF00] py-3.5 text-sm font-extrabold text-black transition-colors hover:bg-[#c4ff33]"
        >
          Upgrade to Pro <ArrowRight size={17} />
        </button>
        <p className="mt-3 text-[11px] text-gray-500">Your workout plan remains available on Core.</p>
      </section>
    </div>
  );
}

export default function PlanSetupPage() {
  const router = useRouter();
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationErrorType, setGenerationErrorType] = useState<"SAFETY" | "SYSTEM" | "PLAN_ACTIVE" | "PAYMENT_REQUIRED" | null>(null);
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"workout" | "diet" | "grocery">("workout");
  
  const [chatInput, setChatInput] = useState("");
  const [modulating, setModulating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Generate draft on mount
    let isMounted = true;
    
    requestPlanDraft()
      .then((res) => {
        if (!isMounted) return;
        setPlanData(res.data);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        if (getPlanGenerationErrorType(err) === "PLAN_ACTIVE") {
          router.replace("/roadmap");
          return;
        }
        if (getPlanGenerationErrorType(err) === "PAYMENT_REQUIRED") {
          router.replace("/payment?returnTo=/plan-setup&intent=generate_plan");
          return;
        }
        const message = err instanceof Error ? err.message : "Network error while generating the plan.";
        setGenerationError(message);
        setGenerationErrorType(getPlanGenerationErrorType(err));
        toast.error(message);
      });
      
    return () => { isMounted = false; };
  }, []);

  const handleModulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || modulating) return;
    
    setModulating(true);
    const prompt = chatInput;
    setChatInput("");
    
    try {
      const res = await fetch('/api/fitness-ai/modulate-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPlan: planData, prompt })
      });
      const data = await res.json();
      if (data.success) {
        setPlanData(data.data);
        toast.success("Plan updated!");
      } else {
        toast.error(data.error || "Failed to modify plan");
        setChatInput(prompt);
      }
    } catch (err) {
      toast.error("Network error");
      setChatInput(prompt);
    } finally {
      setModulating(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/fitness-ai/save-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: planData })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Plan activated!");
        router.push("/roadmap");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to save plan");
        setSaving(false);
      }
    } catch (err) {
      toast.error("Network error");
      setSaving(false);
    }
  };

  if (!loading && !planData) {
    const isSafetyError = generationErrorType === "SAFETY";
    
    return (
      <div className="min-h-screen bg-[#0A1108] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${isSafetyError ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <AlertTriangle size={32} className={isSafetyError ? "text-red-500" : "text-amber-500"} />
        </div>
        <h2 className="text-2xl font-black mb-3">{isSafetyError ? "AI Safety Reject" : "Plan Generation Failed"}</h2>
        
        {generationError ? (
          <div className={`bg-[#121E12] border p-4 rounded-2xl mb-6 max-w-sm ${isSafetyError ? 'border-red-500/30' : 'border-amber-500/30'}`}>
            <p className={`text-sm font-semibold mb-2 ${isSafetyError ? 'text-red-400' : 'text-amber-400'}`}>
              {isSafetyError ? "Our backend safety validator blocked the AI from generating a dangerous plan." : "The AI encountered an issue while building your custom plan."}
            </p>
            <p className="text-xs text-gray-300">{generationError}</p>
          </div>
        ) : (
          <p className="text-gray-400 mb-6">Failed to load plan data.</p>
        )}
        
        <button 
          onClick={() => {
            setLoading(true);
            setGenerationError(null);
            setGenerationErrorType(null);
            // Retry only after a failed generation. The server reuses any
            // valid saved draft and never bypasses safety or duplicate guards.
            requestPlanDraft()
              .then(res => {
                setPlanData(res.data);
              })
              .catch((err: unknown) => {
                if (getPlanGenerationErrorType(err) === "PLAN_ACTIVE") {
                  router.replace("/roadmap");
                  return;
                }
                if (getPlanGenerationErrorType(err) === "PAYMENT_REQUIRED") {
                  router.replace("/payment?returnTo=/plan-setup&intent=generate_plan");
                  return;
                }
                setGenerationError(
                  err instanceof Error ? err.message : "Network error while generating the plan.",
                );
                setGenerationErrorType(getPlanGenerationErrorType(err));
              });
          }} 
          className="px-8 py-3 bg-[#ADFF00] text-black font-extrabold rounded-full flex items-center gap-2 hover:bg-[#c4ff33] transition-colors"
        >
          <span>Try Again</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // Workouts logic
  // Plans made before the current schema can still be in a browser/server
  // cache. Treat malformed legacy lists as empty rather than crashing the
  // entire final-plan screen during render.
  const workouts = Array.isArray(planData?.workouts)
    ? planData.workouts.filter((workout: unknown) => workout && typeof workout === "object")
    : [];
  const meals = Array.isArray(planData?.nutrition?.meals) ? planData.nutrition.meals : [];
  const planStartDate = planAnchorDate(workouts);
  const days = Array.from({ length: 7 }, (_, index) => weekDayLabel(index, planStartDate));
  const workoutForDay = (dayIndex: number) => {
    const datedWorkout = workouts.find(
      (workout: any) => workoutDayOffset(workout?.workout_date, planStartDate) === dayIndex,
    );
    // Older cached plans may not contain dates. Keep their original positional
    // behaviour as a compatibility fallback.
    return datedWorkout || (workouts.some((workout: any) => workout?.workout_date) ? null : workouts[dayIndex]) || null;
  };
  const activeWorkout = planData ? workoutForDay(selectedDay) : null;
  const activeExercises = Array.isArray(activeWorkout?.exercises) ? activeWorkout.exercises : [];
  const isRestOrRecoveryWorkout = (workout: any) => !workout?.exercises?.length;
  const isLightRecoveryWorkout = (workout: any) =>
    !workout?.exercises?.length ||
    (/recovery/i.test(workout?.title || "") &&
      Number(workout?.duration_minutes || 0) <= 30 &&
      workout.exercises.length <= 3);
  const hasTrainingSessions = workouts.some((workout: any) => !isRestOrRecoveryWorkout(workout));
  const safetyAcknowledgment = String(planData?.safety_acknowledgment || "").trim();
  const trainingPausedForSafety = Boolean(safetyAcknowledgment) && !hasTrainingSessions;
  const groceryUsesProvidedCoreMeals = usesProvidedCoreMeals(planData?._profile);
  const nutrition = planData?.nutrition;
  const isCorePlan = planData?._subscriptionPlan === "starter";
  const foodEnvironment = typeof planData?._profile?.food_environment === "string"
    ? planData._profile.food_environment
    : "";
  const nutritionGoal = String(planData?.plan?.goal || planData?._profile?.goal || "").trim();
  const isFatLossGoal = nutritionGoal === "Lose Fat" || nutritionGoal === "Cut";
  const nutritionMealCount = Number(nutrition?.meals_per_day);
  const nutritionMealCountLabel = Number.isFinite(nutritionMealCount) && nutritionMealCount > 0
    ? `${nutritionMealCount} meals/day`
    : String(planData?._profile?.meals_per_day || "").trim();
  const nutritionProfilePills = [
    nutritionGoal ? `Goal: ${nutritionGoal}` : null,
    nutritionMealCountLabel || null,
    foodRoutineLabel(foodEnvironment),
    planData?._profile?.nutrition_budget
      ? `${planData._profile.nutrition_budget} add-ons`
      : null,
  ].filter((value): value is string => Boolean(value));
  const nutritionFocusItems = [
    nutritionGoal ? `Goal: ${nutritionGoal}` : null,
    typeof nutrition?.protein_grams === "number" && nutrition.protein_grams > 0
      ? `${nutrition.protein_grams}g protein target`
      : null,
    planData?._profile?.nutrition_budget
      ? `Budget: ${planData._profile.nutrition_budget}`
      : null,
    foodRoutineLabel(foodEnvironment),
  ].filter((value): value is string => Boolean(value));
  const tabTitle = isCorePlan && activeTab === "diet"
    ? "Unlock Pro Nutrition"
    : isCorePlan && activeTab === "grocery"
      ? "Unlock Pro Grocery"
      : trainingPausedForSafety && activeTab === "workout"
    ? "Your Recovery Plan"
    : activeTab === "workout"
      ? "Your Training Plan"
      : activeTab === "diet"
        ? "Your Nutrition Plan"
        : groceryUsesProvidedCoreMeals
          ? "Your Grocery Add-ons"
          : "Your Grocery Plan";
  const tabDescription = isCorePlan && activeTab === "diet"
    ? "Full meal planning and nutrition guidance are available with Pro."
    : isCorePlan && activeTab === "grocery"
      ? "Smart grocery add-ons and food-level protein details are available with Pro."
      : activeTab === "workout"
    ? trainingPausedForSafety
      ? "Your safety comes first. Keep the nutrition and recovery plan below while you arrange professional guidance."
      : String(planData?.plan?.description || "A weekly plan shaped around your goals, time, and equipment.")
    : activeTab === "diet"
      ? trainingPausedForSafety
        ? "Nutrition and recovery support based on the routine you saved."
        : "Generated by Luna from the goal, food availability, budget, and routine you saved."
      : groceryUsesProvidedCoreMeals
        ? `Only practical add-ons not supplied with your ${planData?._profile?.food_environment} meals.`
        : "A monthly shopping list based on your saved food preferences and budget.";

  return (
    <>
      {planData && (
        <div className="min-h-[100dvh] bg-[#0A1108] text-white pb-[220px]">
          <div className="mx-auto max-w-md pt-10 px-6 pb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#233522] bg-[#121E12] px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-[#ADFF00] uppercase">
              <CircleCheck size={13} /> Your personalised plan
            </div>
            <h1 className="text-3xl font-black tracking-tight">{tabTitle}</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{tabDescription}</p>
          </div>

      {/* Tab Toggle */}
      <div className="mx-auto mb-5 max-w-md px-6">
        <div className="flex bg-[#121E12] rounded-full p-1">
          <button 
            onClick={() => setActiveTab("workout")}
            aria-pressed={activeTab === "workout"}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "workout" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <Dumbbell size={16} /> Workout
          </button>
          <button 
            onClick={() => setActiveTab("diet")}
            aria-pressed={activeTab === "diet"}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "diet" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <Apple size={16} /> Diet {isCorePlan && <LockKeyhole size={13} />}
          </button>
          <button 
            onClick={() => setActiveTab("grocery")}
            aria-pressed={activeTab === "grocery"}
            className={`flex-1 py-2 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "grocery" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
          >
            <ShoppingCart size={16} /> Grocery {isCorePlan && <LockKeyhole size={13} />}
          </button>
        </div>
      </div>

      {activeTab === "workout" ? (
        trainingPausedForSafety ? (
          <div className="mx-auto max-w-md px-6 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <section className="overflow-hidden rounded-3xl border border-amber-400/30 bg-[#121E12]">
              <div className="border-b border-amber-400/15 bg-amber-400/[0.06] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/15 text-amber-300">
                    <ShieldAlert size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold tracking-wider text-amber-300 uppercase">Training paused for safety</p>
                    <h2 className="mt-1 text-xl font-black">Take care first, then train with confidence.</h2>
                  </div>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-gray-300">{safetyAcknowledgment}</p>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex gap-3 rounded-2xl border border-white/5 bg-[#0D150D] p-4">
                  <HeartPulse size={18} className="mt-0.5 shrink-0 text-[#ADFF00]" />
                  <div>
                    <p className="text-sm font-bold text-white">Your next best step</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">Arrange a qualified medical or physiotherapy assessment before returning to resistance training.</p>
                  </div>
                </div>
                <div className="flex gap-3 rounded-2xl border border-white/5 bg-[#0D150D] p-4">
                  <CalendarDays size={18} className="mt-0.5 shrink-0 text-[#ADFF00]" />
                  <div>
                    <p className="text-sm font-bold text-white">What remains active today</p>
                    <p className="mt-1 text-xs leading-relaxed text-gray-400">Your food, hydration, sleep, and recovery guidance are ready. Use them to support your next step.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab("diet")}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#ADFF00]/25 bg-[#ADFF00]/10 py-3 text-sm font-extrabold text-[#ADFF00] transition-colors hover:bg-[#ADFF00]/15"
                >
                  View nutrition & recovery support <ArrowRight size={16} />
                </button>
              </div>
            </section>
          </div>
        ) : (
        <>
          {safetyAcknowledgment && (
            <div className="mx-auto mb-5 max-w-md px-6">
              <div className="flex gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
                <ShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-300" />
                <p className="text-xs leading-relaxed text-gray-300">{safetyAcknowledgment}</p>
              </div>
            </div>
          )}
      {/* Week Selector */}
      <div className="mx-auto flex max-w-md overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x">
        <div className="w-3 shrink-0" /> {/* Left Spacer (3 + 3 gap = 6) */}
        {days.map((day, i) => {
          const isSelected = selectedDay === i;
          const wo = workoutForDay(i);
          const hasWorkout = Boolean(wo);
          const workoutTitle = typeof wo?.title === "string" ? wo.title : "Workout";
          
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(i)}
              className={`snap-start shrink-0 w-28 p-3 rounded-2xl border-2 transition-all flex flex-col items-start gap-1 ${
                isSelected 
                  ? 'border-[#ADFF00] bg-[#ADFF00]/10' 
                  : 'border-[#1A2619] bg-[#121E12] hover:border-gray-700'
              }`}
            >
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#ADFF00]' : 'text-gray-500'}`}>{day}</span>
              {hasWorkout && isLightRecoveryWorkout(wo) ? (
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>Recovery</span>
              ) : hasWorkout ? (
                <span className={`text-xs font-bold leading-tight text-left ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {workoutTitle.substring(0, 18)}{workoutTitle.length > 18 ? '...' : ''}
                </span>
              ) : (
                <span className="text-xs font-semibold text-gray-500">Rest</span>
              )}
            </button>
          );
        })}
        <div className="w-3 shrink-0" /> {/* Right Spacer */}
      </div>

      {/* Selected Workout Details */}
      <div className="mx-auto mt-4 max-w-md px-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDay}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeWorkout ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-[#1A2619] flex items-center justify-center shrink-0">
                    <Dumbbell size={20} className="text-[#ADFF00]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black">{typeof activeWorkout.title === "string" ? activeWorkout.title : "Workout"}</h2>
                    <p className="text-sm text-gray-400">{Number(activeWorkout.duration_minutes) || 45} min</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeExercises.map((ex: any, i: number) => (
                    <div key={i} className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl flex justify-between items-center">
                      <div className="flex-1 pr-4">
                        <h3 className="font-bold text-gray-200">{ex.name}</h3>
                        {ex.notes && <p className="text-[11px] text-gray-500 mt-1 leading-snug">{ex.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <span className="block font-black text-[#ADFF00] text-lg">
                          {ex.sets} x {String(ex.reps_string || "").replace(/^\d+\s*[xX×*]\s*/, '').replace(/^\d+\s*x-\s*/, '')}
                        </span>
                      </div>
                    </div>
                  ))}
                  {activeExercises.length === 0 && (
                    <div className="text-center p-8 bg-[#121E12] border border-[#1A2619] rounded-2xl text-gray-500">
                      Active Recovery / Rest Day
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center p-8 bg-[#121E12] border border-[#1A2619] rounded-2xl text-gray-500">
                Rest Day
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>


        </>
        )
      ) : isCorePlan ? (
        <ProUpgradePanel
          section={activeTab === "grocery" ? "grocery" : "diet"}
          onUpgrade={() => router.push("/payment?returnTo=/plan-setup&intent=upgrade_pro")}
        />
      ) : activeTab === "diet" ? (
        <div className="mx-auto max-w-md px-6 pb-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="mb-5 overflow-hidden rounded-3xl border border-[#ADFF00]/20 bg-[linear-gradient(145deg,rgba(173,255,0,0.10),rgba(18,30,18,1)_44%)] p-5">
            <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">
              <Brain size={14} /> Your personalised plan
            </div>
            <h2 className="mt-3 text-xl font-black text-white">Generated by Luna AI</h2>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">Built around your goal, budget, food availability, and routine.</p>
            {nutritionProfilePills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {nutritionProfilePills.map((item) => (
                  <span key={item} className="rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-[11px] font-bold text-gray-200">
                    {item}
                  </span>
                ))}
              </div>
            )}
          </section>

          <div className="mb-3 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 text-center">
              <Flame size={20} className="mx-auto mb-2 text-orange-500" />
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Calories</span>
              <span className="text-lg font-black text-white">{nutrition?.daily_calories || '--'}</span>
            </div>
            <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 text-center">
              <Dumbbell size={20} className="mx-auto mb-2 text-blue-500" />
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Protein</span>
              <span className="text-lg font-black text-white">{nutrition?.protein_grams || '--'}g</span>
            </div>
            <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 text-center">
              <Activity size={20} className="mx-auto mb-2 text-violet-400" />
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Carbs</span>
              <span className="text-lg font-black text-white">{nutrition?.carbs_grams || '--'}g</span>
            </div>
            <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 text-center">
              <Droplets size={20} className="mx-auto mb-2 text-amber-400" />
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Fat</span>
              <span className="text-lg font-black text-white">{nutrition?.fat_grams || '--'}g</span>
            </div>
          </div>
          <div className="mb-7 flex items-center justify-between rounded-2xl border border-[#1A2619] bg-[#121E12] px-4 py-3">
            <div className="flex items-center gap-3">
              <Droplets size={20} className="text-cyan-400" />
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Water target</span>
                <span className="text-lg font-black text-white">{planData.lifestyle?.water_target_liters || 3}L</span>
              </div>
            </div>
            <span className="max-w-[150px] text-right text-[10px] leading-snug text-gray-500">
              {groceryUsesProvidedCoreMeals
                ? "Daily targets; provided meal portions may vary."
                : "Daily planning targets based on your saved profile."}
            </span>
          </div>

          <div className="mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">Your plan</p>
            <h2 className="mt-1 text-xl font-black text-white">Your daily meal strategy</h2>
          </div>

          <div className="space-y-4">
            {meals.map((meal: any, idx: number) => {
              const mealName = String(meal?.meal_name || "Meal");
              const mealItems = Array.isArray(meal?.items) ? meal.items : [];
              const sourceLabel = groceryUsesProvidedCoreMeals && isCoreMeal(mealName)
                ? `${providedMealSourceLabel(foodEnvironment)} meal`
                : isCoreMeal(mealName)
                  ? "Planned meal"
                  : "Planned add-on";

              return (
                <article key={`${mealName}-${idx}`} className="relative overflow-hidden rounded-2xl border border-[#1A2619] bg-[#121E12] p-4">
                  <div className="absolute inset-y-0 left-0 w-1 bg-[#ADFF00]" />
                  <div className="flex items-start justify-between gap-3 pl-2">
                    <div>
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#ADFF00]">{sourceLabel}</p>
                      <h3 className="mt-1 text-lg font-black text-white">{mealName}</h3>
                    </div>
                    <span className="shrink-0 rounded-lg bg-black/35 px-2 py-1 text-[11px] font-semibold text-gray-400">
                      {String(meal?.time_of_day || "Any time")}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2 pl-2">
                    {mealItems.length > 0 ? mealItems.map((item: string, itemIdx: number) => (
                      <div key={`${item}-${itemIdx}`} className="flex items-start gap-2">
                        <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#ADFF00]" />
                        <span className="text-sm font-medium leading-relaxed text-gray-200">{normaliseProvidedMealItem(item, foodEnvironment)}</span>
                      </div>
                    )) : (
                      <p className="text-sm text-gray-500">No meal items were generated.</p>
                    )}
                  </div>

                  {meal?.prep_instructions && (
                    <div className="mt-4 border-t border-white/5 bg-black/10 px-2 pt-3">
                      <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#ADFF00]">Luna&apos;s instruction</p>
                      <p className="mt-1 text-xs leading-relaxed text-gray-400">{String(meal.prep_instructions)}</p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>

          {groceryUsesProvidedCoreMeals ? (
            <section className="mt-6 rounded-3xl border border-[#ADFF00]/20 bg-[#121E12] p-5">
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">
                <Brain size={14} /> Luna&apos;s adaptive plan
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                {String(nutrition?.guidance || `Keep your ${foodEnvironment || "provided"} core meals and use the planned add-ons only when the served meal needs more protein.`)}
              </p>
              <div className="mt-4 space-y-3 border-t border-white/5 pt-4 text-xs">
                <div className="flex items-start justify-between gap-4"><span className="font-bold text-white">Protein served?</span><span className="text-right text-gray-400">Prioritise that portion first</span></div>
                <div className="flex items-start justify-between gap-4"><span className="font-bold text-white">Lower-protein meal?</span><span className="text-right text-gray-400">Use the listed add-on</span></div>
                <div className="flex items-start justify-between gap-4"><span className="font-bold text-white">Menu changes?</span><span className="text-right text-gray-400">Keep the meal; adapt the add-on</span></div>
              </div>
            </section>
          ) : nutrition?.guidance ? (
            <section className="mt-6 rounded-3xl border border-[#ADFF00]/20 bg-[#121E12] p-5">
              <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">
                <Brain size={14} /> Luna&apos;s daily strategy
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">{String(nutrition.guidance)}</p>
            </section>
          ) : null}

          {isFatLossGoal && (
            <section className="mt-6 rounded-3xl border border-[#ADFF00]/20 bg-[#121E12] p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">
                Fat-loss nutrition direction
              </p>
              <p className="mt-3 text-sm leading-relaxed text-gray-300">
                Limit added sugar, sugary drinks, deep-fried foods, and frequent fast food.
                Use measured cooking oil, prioritise protein and vegetables, and keep
                occasional treats within your calorie target.
              </p>
              {nutritionGoal === "Cut" && (
                <p className="mt-3 text-xs leading-relaxed text-gray-400">
                  Cut focus: keep resistance training and your protein target high to help
                  preserve muscle while body fat decreases.
                </p>
              )}
            </section>
          )}

          {nutritionFocusItems.length > 0 && (
            <section className="mt-6">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">Plan focus</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {nutritionFocusItems.map((item) => (
                  <span key={item} className="rounded-full border border-[#1A2619] bg-[#121E12] px-3 py-2 text-xs font-bold text-gray-300">
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
        ) : (
          <GroceryTab planData={planData} setPlanData={setPlanData} profile={planData._profile} />
        )}

        {/* Explicit bottom spacer to ensure content clears the floating footer */}
        <div className="h-56 shrink-0 w-full" />

        {/* Floating Modulator & Save */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#0A1108] via-[#0A1108] to-transparent pt-12 z-50 pointer-events-none">
            <div className="max-w-md mx-auto space-y-3 pointer-events-auto">
              <p className="px-4 text-center text-xs text-gray-500">
                You can refine this plan later from your dashboard.
              </p>
              
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] hover:bg-[#c4ff33] disabled:opacity-70 transition-colors"
              >
                {saving ? (
                  <><Loader2 size={20} className="animate-spin" /> <span>Locking In Your Plan...</span></>
                ) : (
                  <><span>{trainingPausedForSafety ? "Save Recovery Plan" : "Lock In My Plan"}</span> <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <AIPlanAnimation
          isReady={Boolean(planData || generationError)}
          hasError={Boolean(generationError)}
          onAnimationComplete={() => setLoading(false)}
        />
      )}
    </>
  );
}
