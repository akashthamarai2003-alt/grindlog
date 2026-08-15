'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Send, Check, AlertTriangle, ArrowRight, Brain, Dumbbell, Apple, Droplets, Flame, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import GroceryTab from '@/components/fitness/plan/grocery-tab';

export default function PlanSetupPage() {
  const router = useRouter();
  const [planData, setPlanData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationErrorType, setGenerationErrorType] = useState<"SAFETY" | "SYSTEM" | null>(null);
  
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Mon, 6 = Sun
  const [activeTab, setActiveTab] = useState<"workout" | "diet" | "grocery">("workout");
  
  const [chatInput, setChatInput] = useState("");
  const [modulating, setModulating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setProgress(p => {
        // Slow down the progress significantly to account for up to 3 retries (approx 30-45 seconds)
        if (p < 60) return p + Math.floor(Math.random() * 3) + 1; // Fast to 60%
        if (p < 85) return p + 1; // 1% every 0.8s
        if (p < 95) return p + (Math.random() > 0.5 ? 1 : 0); // Very slow
        if (p < 99) return p + (Math.random() > 0.9 ? 1 : 0); // Crawl
        return 99;
      });
    }, 800);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    // Generate draft on mount
    let isMounted = true;
    fetch('/api/fitness-ai/generate-draft', { method: 'POST' })
      .then(res => res.json())
      .then(res => {
        if (!isMounted) return;
        if (res.success) {
          setPlanData(res.data);
        } else {
          setGenerationError(res.error || "Failed to generate plan");
          setGenerationErrorType(res.errorType || "SYSTEM");
          toast.error(res.error || "Failed to generate plan");
        }
        setLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        toast.error("Network error");
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
        router.push("/fitness/roadmap");
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A1108] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          <svg className="absolute inset-0 w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="60" className="stroke-[#1A2619] fill-none" strokeWidth="8" />
            <motion.circle 
              cx="64" cy="64" r="60" 
              className="stroke-[#ADFF00] fill-none" 
              strokeWidth="8" 
              strokeDasharray={2 * Math.PI * 60}
              strokeDashoffset={2 * Math.PI * 60 * (1 - progress / 100)}
              strokeLinecap="round"
              initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - progress / 100) }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center flex-col">
            <span className="text-3xl font-black">{progress}%</span>
          </div>
        </div>
        <h2 className="text-2xl font-black">Building your perfect plan...</h2>
        <p className="text-gray-400 mt-2">AI is analyzing your body scan and fitness profile...</p>
        
        <div className="mt-8 text-xs text-gray-500 font-bold tracking-widest uppercase h-4">
          <AnimatePresence mode="wait">
            <motion.span
              key={
                progress < 30 ? "analyzing" :
                progress < 60 ? "designing" :
                progress < 85 ? "calculating" : "finalizing"
              }
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
            >
              {progress < 30 ? "Analyzing profile constraints..." : 
               progress < 60 ? "Designing custom workout splits..." : 
               progress < 85 ? "Calculating macro requirements..." : 
               "Finalizing safety checks..."}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (!planData) {
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
            fetch('/api/fitness-ai/generate-draft', { method: 'POST' })
              .then(res => res.json())
              .then(res => {
                if (res.success) setPlanData(res.data);
                else {
                  setGenerationError(res.error || "Failed to generate plan");
                  setGenerationErrorType(res.errorType || "SYSTEM");
                }
                setLoading(false);
              })
              .catch(() => {
                setGenerationError("Network error");
                setGenerationErrorType("SYSTEM");
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
  const workouts = planData.workouts || [];
  const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  
  const activeWorkout = selectedDay < workouts.length ? workouts[selectedDay] : null;

  return (
    <div className="min-h-[100dvh] bg-[#0A1108] text-white pb-[140px]">
      <div className="pt-12 px-6 pb-6">
        <h1 className="text-3xl font-black mb-2 tracking-tight">
          {activeTab === 'workout' ? 'Your Training Plan' : activeTab === 'diet' ? 'Your Nutrition Plan' : 'Your Grocery Plan'}
        </h1>
        <p className="text-gray-400">{planData.plan?.description || "Here is your custom AI generated plan."}</p>
      </div>

      {/* Tab Toggle */}
      <div className="flex bg-[#121E12] rounded-full p-1 mx-6 mb-6">
        <button 
          onClick={() => setActiveTab("workout")}
          className={`flex-1 py-2 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "workout" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          <Dumbbell size={16} /> Workout
        </button>
        <button 
          onClick={() => setActiveTab("diet")}
          className={`flex-1 py-2 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "diet" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          <Apple size={16} /> Diet
        </button>
        <button 
          onClick={() => setActiveTab("grocery")}
          className={`flex-1 py-2 text-sm font-bold rounded-full transition-all flex items-center justify-center gap-2 ${activeTab === "grocery" ? 'bg-[#ADFF00] text-black shadow-sm' : 'text-gray-400 hover:text-white'}`}
        >
          <ShoppingCart size={16} /> Grocery
        </button>
      </div>

      {activeTab === "workout" ? (
        <>
      {/* Week Selector */}
      <div className="flex overflow-x-auto gap-3 px-6 pb-4 scrollbar-hide snap-x">
        {days.map((day, i) => {
          const isSelected = selectedDay === i;
          const hasWorkout = i < workouts.length;
          const wo = hasWorkout ? workouts[i] : null;
          
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
              {hasWorkout && (wo.title.toLowerCase().includes("rest") || wo.title.toLowerCase().includes("recovery")) ? (
                <span className={`text-xs font-semibold ${isSelected ? 'text-white' : 'text-gray-400'}`}>Recovery</span>
              ) : hasWorkout ? (
                <span className={`text-xs font-bold leading-tight text-left ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {wo.title.substring(0, 18)}{wo.title.length > 18 ? '...' : ''}
                </span>
              ) : (
                <span className="text-xs font-semibold text-gray-500">Rest</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Workout Details */}
      <div className="px-6 mt-4">
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
                    <h2 className="text-xl font-black">{activeWorkout.title}</h2>
                    <p className="text-sm text-gray-400">{activeWorkout.duration_minutes} min</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeWorkout.exercises?.map((ex: any, i: number) => (
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
                  {(!activeWorkout.exercises || activeWorkout.exercises.length === 0) && (
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
      ) : activeTab === "diet" ? (
        <div className="px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            {planData.nutrition?.meals?.map((meal: any, idx: number) => (
              <div key={idx} className="bg-[#121E12] border border-[#1A2619] p-4 rounded-2xl relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ADFF00] opacity-50"></div>
                <div className="flex justify-between items-start mb-3 pl-2">
                  <h3 className="font-bold text-gray-200 text-lg">{meal.meal_name}</h3>
                  <span className="text-xs font-semibold text-gray-500 bg-black/40 px-2 py-1 rounded-md">{meal.time_of_day}</span>
                </div>
                
                <div className="space-y-2 pl-2">
                  {meal.items?.map((item: string, itemIdx: number) => (
                    <div key={itemIdx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF00]"></div>
                      <span className="text-sm font-medium text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
                
                {meal.prep_instructions && (
                  <div className="mt-4 pl-2 text-[11px] text-gray-500 border-t border-[#1A2619] pt-3">
                    {meal.prep_instructions}
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
          
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-[#ADFF00] text-black rounded-full font-extrabold text-lg flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(173,255,0,0.2)] hover:bg-[#c4ff33] disabled:opacity-70 transition-colors"
          >
            {saving ? (
              <><Loader2 size={20} className="animate-spin" /> <span>Activating Plan...</span></>
            ) : (
              <><span>Confirm & Enter Dashboard</span> <ArrowRight size={20} /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
