"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Dumbbell, Apple, ShoppingCart, CircleCheck, Brain, Flame, Droplets, 
  Activity, ArrowRight, AlertTriangle, ShieldAlert, HeartPulse, CalendarDays, Loader2, Sparkles, Utensils
} from "lucide-react";
import { toast } from "sonner";
import { AIPlanAnimation } from "@/components/fitness/plan-animation";

const MOCK_PLAN_DATA = {
  plan: {
    name: "Hypertrophy Foundations 4-Day Split",
    description: "A 4-day progressive overload split focusing on compound mass builders.",
    goal: "Build Muscle",
  },
  workouts: [
    {
      title: "Chest & Triceps Hypertrophy",
      workout_date: "2026-10-01",
      duration_minutes: 60,
      exercises: [
        { name: "Incline Barbell Bench Press", sets: 4, reps_string: "4 x 8-10", notes: "Control the 3-second eccentric" },
        { name: "Flat Dumbbell Press", sets: 3, reps_string: "3 x 10-12", notes: "Squeeze pecs at the top" },
        { name: "Cable Chest Flyes", sets: 3, reps_string: "3 x 12-15", notes: "Constant tension" },
        { name: "Overhead Rope Tricep Extension", sets: 3, reps_string: "3 x 12", notes: "Full stretch on triceps long head" },
      ]
    },
    {
      title: "Back & Biceps Power",
      workout_date: "2026-10-02",
      duration_minutes: 55,
      exercises: [
        { name: "Chest Supported T-Bar Row", sets: 4, reps_string: "4 x 8-10", notes: "Pull with elbows" },
        { name: "Lat Pulldown (Neutral Grip)", sets: 3, reps_string: "3 x 10-12", notes: "Full lat flare" },
        { name: "Incline Dumbbell Bicep Curls", sets: 3, reps_string: "3 x 10-12", notes: "Supinate at top" },
      ]
    },
    {
      title: "Active Recovery",
      workout_date: "2026-10-03",
      duration_minutes: 20,
      exercises: []
    },
    {
      title: "Legs & Core Foundation",
      workout_date: "2026-10-04",
      duration_minutes: 65,
      exercises: [
        { name: "Barbell Back Squat", sets: 4, reps_string: "4 x 6-8", notes: "Break parallel" },
        { name: "Romanian Deadlift", sets: 3, reps_string: "3 x 8-10", notes: "Hinge at hips, slight knee bend" },
        { name: "Leg Press", sets: 3, reps_string: "3 x 12-15", notes: "Deep stretch" },
        { name: "Hanging Leg Raises", sets: 3, reps_string: "3 x 15", notes: "Control the swing" },
      ]
    },
    {
      title: "Shoulders & Arms Hypertrophy",
      workout_date: "2026-10-05",
      duration_minutes: 55,
      exercises: [
        { name: "Dumbbell Overhead Shoulder Press", sets: 4, reps_string: "4 x 8-10", notes: "Elbows slightly tucked" },
        { name: "Cable Lateral Raises", sets: 4, reps_string: "4 x 15", notes: "Constant deltoid tension" },
        { name: "Barbell Skull Crushers", sets: 3, reps_string: "3 x 10-12", notes: "Lower to hairline" },
      ]
    },
    {
      title: "Rest Day",
      workout_date: "2026-10-06",
      duration_minutes: 0,
      exercises: []
    },
    {
      title: "Rest Day",
      workout_date: "2026-10-07",
      duration_minutes: 0,
      exercises: []
    }
  ],
  nutrition: {
    daily_calories: 2600,
    protein_grams: 165,
    carbs_grams: 310,
    fat_grams: 75,
    meals_per_day: 4,
    meals: [],
    grocery_list: []
  },
  _profile: {
    goal: "Build Muscle",
    food_environment: "Home",
    meals_per_day: "4 meals",
    nutrition_budget: "₹2,000–5,000"
  },
  _subscriptionPlan: "pro"
};

export default function TestPlanSetupPage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const params = use(searchParams);
  const router = useRouter();
  const initialState = params?.state;

  const [loading, setLoading] = useState(initialState === "loading");
  const [generationError, setGenerationError] = useState<string | null>(
    initialState === "error" ? "Unable to connect to AI plan service" : null
  );
  const [generationErrorType, setGenerationErrorType] = useState<"SAFETY" | "SYSTEM" | null>(
    initialState === "safety" ? "SAFETY" : initialState === "error" ? "SYSTEM" : null
  );
  const [planData, setPlanData] = useState<any>(
    initialState === "error" || initialState === "safety" || initialState === "loading"
      ? null
      : MOCK_PLAN_DATA
  );

  const [activeTab, setActiveTab] = useState<"workout" | "diet" | "grocery">("workout");
  const [selectedDay, setSelectedDay] = useState(0);
  const [saving, setSaving] = useState(false);

  const days = ["THU", "FRI", "SAT", "SUN", "MON", "TUE", "WED"];
  const workouts = planData?.workouts || [];
  const activeWorkout = workouts[selectedDay] || null;
  const activeExercises = activeWorkout?.exercises || [];

  const handleSave = async () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Plan activated!");
      router.push("/roadmap");
    }, 600);
  };

  if (generationError || generationErrorType) {
    const isSafety = generationErrorType === "SAFETY";
    return (
      <div className="min-h-screen bg-[#0A1108] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 border ${isSafety ? 'bg-red-500/10 border-red-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
          <AlertTriangle size={32} className={isSafety ? "text-red-500" : "text-amber-500"} />
        </div>
        <h2 className="text-2xl font-black mb-3">{isSafety ? "AI Safety Reject" : "Plan Generation Failed"}</h2>
        <div className={`bg-[#121E12] border p-4 rounded-2xl mb-6 max-w-sm ${isSafety ? 'border-red-500/30' : 'border-amber-500/30'}`}>
          <p className={`text-sm font-semibold mb-2 ${isSafety ? 'text-red-400' : 'text-amber-400'}`}>
            {isSafety ? "Our backend safety validator blocked the AI from generating a dangerous plan." : "The AI encountered an issue while building your custom plan."}
          </p>
          <p className="text-xs text-gray-300">{generationError || "Safety violation in forbidden movements"}</p>
        </div>
        <button
          onClick={() => {
            setGenerationError(null);
            setGenerationErrorType(null);
            setPlanData(MOCK_PLAN_DATA);
          }}
          className="px-8 py-3 bg-[#ADFF00] text-black font-extrabold rounded-full flex items-center gap-2 hover:bg-[#c4ff33] transition-colors"
        >
          <span>Try Again</span>
          <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-[100dvh] bg-[#0A1108] text-white pb-[220px]">
        {/* Header */}
        <div className="mx-auto max-w-md pt-10 px-6 pb-6">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#233522] bg-[#121E12] px-3 py-1.5 text-[10px] font-extrabold tracking-[0.14em] text-[#ADFF00] uppercase">
            <CircleCheck size={13} /> Your personalised plan
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            {activeTab === "workout" ? "Your Training Plan" : activeTab === "diet" ? "Your Nutrition Plan" : "Your Grocery Plan"}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-400">
            {activeTab === "workout" 
              ? "A weekly workout plan shaped around your goals, time, and equipment."
              : activeTab === "diet"
                ? "Generated by Luna from the goal, food availability, budget, and routine you saved."
                : "A monthly shopping list based on your saved food preferences and budget."}
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="mx-auto mb-5 max-w-md px-6">
          <div className="flex bg-[#121E12] rounded-full p-1 border border-[#1A2619]">
            <button 
              onClick={() => setActiveTab("workout")}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "workout" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Dumbbell size={15} /> Workout
            </button>
            <button 
              onClick={() => setActiveTab("diet")}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "diet" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <Apple size={15} /> Diet
            </button>
            <button 
              onClick={() => setActiveTab("grocery")}
              className={`flex-1 py-2.5 text-xs font-black uppercase tracking-wider rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "grocery" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
            >
              <ShoppingCart size={15} /> Grocery
            </button>
          </div>
        </div>

        {/* Workout Tab Content */}
        {activeTab === "workout" && (
          <>
            {/* Week Selector */}
            <div className="mx-auto flex max-w-md overflow-x-auto gap-3 pb-4 scrollbar-hide snap-x px-6">
              {days.map((day, i) => {
                const isSelected = selectedDay === i;
                const wo = workouts[i];
                const hasExercises = wo?.exercises?.length > 0;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(i)}
                    className={`snap-start shrink-0 w-28 p-3 rounded-2xl border-2 transition-all flex flex-col items-start gap-1 ${
                      isSelected ? 'border-[#ADFF00] bg-[#ADFF00]/10' : 'border-[#1A2619] bg-[#121E12]'
                    }`}
                  >
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-[#ADFF00]' : 'text-gray-500'}`}>{day}</span>
                    <span className={`text-xs font-bold leading-tight text-left ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {hasExercises ? wo.title.substring(0, 16) : "Rest Day"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Exercises List */}
            <div className="mx-auto mt-4 max-w-md px-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-[#1A2619] flex items-center justify-center shrink-0">
                  <Dumbbell size={20} className="text-[#ADFF00]" />
                </div>
                <div>
                  <h2 className="text-xl font-black">{activeWorkout?.title || "Rest Day"}</h2>
                  <p className="text-sm text-gray-400">{activeWorkout?.duration_minutes ? `${activeWorkout.duration_minutes} min` : "Recovery"}</p>
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
                      <span className="block font-black text-[#ADFF00] text-lg">{ex.reps_string}</span>
                    </div>
                  </div>
                ))}
                {activeExercises.length === 0 && (
                  <div className="text-center p-8 bg-[#121E12] border border-[#1A2619] rounded-2xl text-gray-500">
                    Active Recovery / Rest Day
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Diet Tab Content */}
        {activeTab === "diet" && (
          <div className="mx-auto max-w-md px-6 pb-5 space-y-4">
            <section className="overflow-hidden rounded-3xl border border-[#ADFF00]/20 bg-[linear-gradient(145deg,rgba(173,255,0,0.10),rgba(18,30,18,1)_44%)] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">
                  <Brain size={14} /> Your personalised plan
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  🍃 100% Natural Foods
                </span>
              </div>
              <h2 className="mt-3 text-xl font-black text-white">Generated by Luna AI</h2>
              <p className="mt-1 text-xs leading-relaxed text-gray-400">Built around your goal, budget, food availability, and routine.</p>
            </section>

            {/* Macro Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 text-center">
                <Flame size={20} className="mx-auto mb-2 text-orange-500" />
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Calories</span>
                <span className="text-xl font-black text-white">{planData.nutrition.daily_calories}</span>
              </div>
              <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 text-center">
                <Dumbbell size={20} className="mx-auto mb-2 text-blue-500" />
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Protein</span>
                <span className="text-xl font-black text-white">{planData.nutrition.protein_grams}g</span>
              </div>
              <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 text-center">
                <Activity size={20} className="mx-auto mb-2 text-purple-500" />
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Carbs</span>
                <span className="text-xl font-black text-white">{planData.nutrition.carbs_grams}g</span>
              </div>
              <div className="rounded-2xl border border-[#1A2619] bg-[#121E12] p-4 text-center">
                <Droplets size={20} className="mx-auto mb-2 text-amber-500" />
                <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-gray-500">Fat</span>
                <span className="text-xl font-black text-white">{planData.nutrition.fat_grams}g</span>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center mx-auto text-[#ADFF00]">
                <Utensils size={24} />
              </div>
              <h3 className="text-lg font-black text-white">Full Diet Plan in Nutrition Page</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                You can see your fully personalized diet, daily meal strategy, recipes, and food swaps in the <strong className="text-white">Nutrition</strong> page once you save your plan.
              </p>
            </div>
          </div>
        )}

        {/* Grocery Tab Content */}
        {activeTab === "grocery" && (
          <div className="mx-auto max-w-md px-6 pb-5 space-y-4">
            <section className="overflow-hidden rounded-3xl border border-[#ADFF00]/20 bg-[linear-gradient(145deg,rgba(173,255,0,0.10),rgba(18,30,18,1)_45%)] p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#ADFF00]">
                  <Brain size={14} /> GENERATED BY LUNA AI
                </div>
                <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                  🍃 100% NATURAL WHOLE FOODS
                </span>
              </div>
              <h2 className="mt-3 text-xl font-black text-white">Your grocery add-ons</h2>
              <p className="mt-1 text-sm leading-relaxed text-gray-400">
                A 30-day shopping list built from the foods and budget you saved.
              </p>
              <div className="mt-3.5 rounded-2xl bg-black/40 border border-emerald-500/20 p-3 flex items-start gap-2.5 text-xs text-emerald-300/90 font-medium leading-relaxed">
                <span className="text-base shrink-0">🍃</span>
                <span>Zero artificial powders or chemical supplements. Built exclusively with 100% real, wholesome natural foods.</span>
              </div>
            </section>

            <div className="rounded-3xl border border-[#1A2619] bg-[#121E12] p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center mx-auto text-[#ADFF00]">
                <ShoppingCart size={24} />
              </div>
              <h3 className="text-lg font-black text-white">Full Grocery Plan in Nutrition Page</h3>
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
                You can see your fully planned 30-day grocery shopping list, aisle breakdown, and budget tracker in the <strong className="text-white">Nutrition</strong> and <strong className="text-white">Grocery</strong> pages once you save your plan.
              </p>
            </div>
          </div>
        )}

        {/* Floating Save CTA */}
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
                <><span>Lock In My Plan</span> <ArrowRight size={20} /></>
              )}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <AIPlanAnimation
          isReady={true}
          minDurationMs={1500}
          onAnimationComplete={() => setLoading(false)}
        />
      )}
    </>
  );
}
