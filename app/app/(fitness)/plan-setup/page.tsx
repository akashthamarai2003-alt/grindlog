'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, Check, AlertTriangle, ArrowRight, Brain, Dumbbell, Apple, Droplets, Flame, ShoppingCart, ShieldAlert, HeartPulse, CalendarDays, CircleCheck } from 'lucide-react';
import { toast } from 'sonner';
import GroceryTab from '@/components/fitness/plan/grocery-tab';
import { AIPlanAnimation } from '@/components/fitness/plan-animation';

type PlanGenerationError = Error & {
  errorType: "SAFETY" | "SYSTEM";
};

async function requestPlanDraft() {
  const response = await fetch('/api/fitness-ai/generate-draft', { method: 'POST' });
  const body = await response.json().catch(() => null);

  if (!response.ok || !body?.success) {
    const error = new Error(
      body?.error || `We could not start plan generation (request ${response.status}).`,
    ) as PlanGenerationError;
    error.errorType = body?.errorType === "SAFETY" ? "SAFETY" : "SYSTEM";
    throw error;
  }

  return body;
}

function getPlanGenerationErrorType(error: unknown): "SAFETY" | "SYSTEM" {
  return typeof error === "object" &&
    error !== null &&
    "errorType" in error &&
    error.errorType === "SAFETY"
    ? "SAFETY"
    : "SYSTEM";
}

export default function PlanSetupPage() {
  const router = useRouter();
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationErrorType, setGenerationErrorType] = useState<"SAFETY" | "SYSTEM" | null>(null);
  
  const [selectedDay, setSelectedDay] = useState(0);
  const [activeTab, setActiveTab] = useState<"workout" | "diet" | "grocery">("workout");
  
  const [chatInput, setChatInput] = useState("");
  const [modulating, setModulating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Generate draft on mount
    let isMounted = true;
    
    // 1. Start the API request
    const aiFetchPromise = requestPlanDraft();
    
    // 2. Keep the loading animation mounted for its complete 14.3-second timeline.
    const minimumDelayPromise = new Promise(resolve => setTimeout(resolve, 14300));

    // Wait for BOTH the AI to finish AND the full animation to complete
    Promise.all([aiFetchPromise, minimumDelayPromise])
      .then(([res]) => {
        if (!isMounted) return;
        setPlanData(res.data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const message = err instanceof Error ? err.message : "Network error while generating the plan.";
        setGenerationError(message);
        setGenerationErrorType(getPlanGenerationErrorType(err));
        toast.error(message);
        setLoading(false);
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
            // Trigger a fresh generation
            requestPlanDraft()
              .then(res => {
                setPlanData(res.data);
                setLoading(false);
              })
              .catch((err: unknown) => {
                setGenerationError(
                  err instanceof Error ? err.message : "Network error while generating the plan.",
                );
                setGenerationErrorType(getPlanGenerationErrorType(err));
                setLoading(false);
              });
          }} 
          className="px-8 py-3 bg-[#ADFF00] text-black font-extrabold rounded-full flex items-center gap-2 hover:bg-[#c4ff33] transition-colors"
        >
          <span>Force AI to Try Again</span>
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
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  const activeWorkout = planData && selectedDay < workouts.length ? workouts[selectedDay] : null;
  const activeExercises = Array.isArray(activeWorkout?.exercises) ? activeWorkout.exercises : [];
  const isRestOrRecoveryWorkout = (workout: any) =>
    !workout?.exercises?.length || /rest|recovery/i.test(workout?.title || "");
  const hasTrainingSessions = workouts.some((workout: any) => !isRestOrRecoveryWorkout(workout));
  const safetyAcknowledgment = String(planData?.safety_acknowledgment || "").trim();
  const trainingPausedForSafety = Boolean(safetyAcknowledgment) && !hasTrainingSessions;
  const nutritionGuidance = String(planData?.nutrition?.guidance || "").trim();
  const tabTitle = trainingPausedForSafety && activeTab === "workout"
    ? "Your Recovery Plan"
    : activeTab === "workout"
      ? "Your Training Plan"
      : activeTab === "diet"
        ? "Your Nutrition Plan"
        : "Your Grocery Plan";
  const tabDescription = activeTab === "workout"
    ? trainingPausedForSafety
      ? "Your safety comes first. Keep the nutrition and recovery plan below while you arrange professional guidance."
      : String(planData?.plan?.description || "A weekly plan shaped around your goals, time, and equipment.")
    : activeTab === "diet"
      ? nutritionGuidance || "Simple daily targets and meals that fit the food routine you shared."
      : "A flexible monthly shopping list built around your food preferences and budget.";

  return (
    <>
      {planData && (
        <div className="min-h-[100dvh] bg-[#0A1108] text-white pb-[156px]">
          <div className="mx-auto max-w-md pt-10 px-6 pb-6">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#233522] bg-[#121E12] px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-[#ADFF00] uppercase">
              <CircleCheck size={13} /> Your personalised plan
            </div>
            <h1 className="text-3xl font-black tracking-tight">{tabTitle}</h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">{tabDescription}</p>
          </div>

      {/* Tab Toggle */}
      <div className="mx-auto mb-7 max-w-md px-6">
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
          <Apple size={16} /> Diet
        </button>
        <button 
          onClick={() => setActiveTab("grocery")}
          aria-pressed={activeTab === "grocery"}
          className={`flex-1 py-2 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "grocery" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          <ShoppingCart size={16} /> Grocery
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
      <div className="mx-auto flex max-w-md overflow-x-auto gap-3 px-6 pb-4 scrollbar-hide snap-x">
        {days.map((day, i) => {
          const isSelected = selectedDay === i;
          const hasWorkout = i < workouts.length;
          const wo = hasWorkout ? workouts[i] : null;
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
              {hasWorkout && /rest|recovery/i.test(workoutTitle) ? (
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
                          {ex.sets} × {ex.reps_string}
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
      ) : activeTab === "diet" ? (
        <div className="mx-auto max-w-md px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Flame size={20} className="text-orange-500 mb-2" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Calories</span>
              <span className="text-lg font-black text-white">{planData.nutrition?.daily_calories || '--'}</span>
            </div>
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Dumbbell size={20} className="text-blue-500 mb-2" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Protein</span>
              <span className="text-lg font-black text-white">{planData.nutrition?.protein_grams || '--'}g</span>
            </div>
            <div className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl flex flex-col items-center justify-center text-center">
              <Droplets size={20} className="text-cyan-500 mb-2" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Water</span>
              <span className="text-lg font-black text-white">{planData.lifestyle?.water_target_liters || 3}L</span>
            </div>
          </div>

          <div className="space-y-4">
            {meals.map((meal: any, idx: number) => (
              <div key={idx} className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ADFF00] opacity-50"></div>
                <div className="flex justify-between items-start mb-3 pl-2">
                  <h3 className="font-bold text-gray-200 text-lg">{String(meal?.meal_name || "Meal")}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-black/40 px-2 py-1 rounded-md">{String(meal?.time_of_day || "Any time")}</span>
                </div>
                
                <div className="space-y-2 pl-2">
                  {(Array.isArray(meal?.items) ? meal.items : []).map((item: string, itemIdx: number) => (
                    <div key={itemIdx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF00]"></div>
                      <span className="text-sm font-medium text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
                
                {meal?.prep_instructions && (
                  <div className="mt-4 pl-2 text-[11px] text-gray-500 border-t border-[#1A2619] pt-3">
                    {String(meal.prep_instructions)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <GroceryTab planData={planData} setPlanData={setPlanData} profile={planData._profile} />
      )}

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
                  <><Loader2 size={20} className="animate-spin" /> <span>Activating Plan...</span></>
                ) : (
                  <><span>{trainingPausedForSafety ? "Save Recovery Plan" : "Activate My Plan"}</span> <ArrowRight size={20} /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
        <AIPlanAnimation onAnimationComplete={() => setLoading(false)} />
      )}
    </>
  );
}
