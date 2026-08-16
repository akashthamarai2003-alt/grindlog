"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Droplet, RefreshCw, Plus, Zap, Apple, Salad, Coffee, Beef, Loader2, Bot, Edit3, X, Check } from "lucide-react";
import { getFoodImage, getFoodSvgAvatar } from "@/lib/utils/food-images";
import { nutritionApi } from "@/lib/api/nutrition";
import { LogFoodModal } from "./log-food-modal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function NutritionView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isWaterLoading, setIsWaterLoading] = useState(false);
  const [swappingMeal, setSwappingMeal] = useState<string | null>(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState("lunch");
  const [modalPreselectedFoods, setModalPreselectedFoods] = useState<any[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);
  const [showTargetsModal, setShowTargetsModal] = useState(false);

  // Targets Modal Form State
  const [targetForm, setTargetForm] = useState({
    calories: 2000,
    protein: 130,
    carbs: 225,
    fat: 55,
    water_ml: 3000
  });

  const fetchToday = async () => {
    try {
      const res = await nutritionApi.getToday();
      setData(res);
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
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchToday();
  }, []);

  const handleSetDailyTargets = async (customPayload?: any) => {
    setIsGenerating(true);
    try {
      await nutritionApi.setTargets(customPayload || targetForm);
      toast.success("Daily nutrition targets initialized!");
      setShowTargetsModal(false);
      await fetchToday();
    } catch (err: any) {
      toast.error(err?.message || "Failed to set daily targets");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSwapMeal = async (mealType: string) => {
    try {
      setSwappingMeal(mealType);
      toast.loading("Swapping meal...", { id: "swap" });
      const res = await nutritionApi.swapMeal(mealType);
      toast.success(res.message || `Swapped ${mealType} meal!`, { id: "swap" });
      await fetchToday();
    } catch (err: any) {
      toast.error(err?.message || "Failed to swap meal", { id: "swap" });
    } finally {
      setSwappingMeal(null);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    try {
      const res = await nutritionApi.generatePlan();
      if (res.existing) {
        toast.info(res.message);
      } else {
        toast.success("Meal plan generated successfully!");
      }
      await fetchToday();
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate plan");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddWater = async (amount: number) => {
    if (!data) return;
    
    // 1. Optimistic UI Update - Instant feedback
    const previousWater = data.consumed?.water_ml || 0;
    const newWater = previousWater + amount;
    
    setData((prev: any) => ({
      ...prev,
      consumed: { ...prev.consumed, water_ml: newWater }
    }));
    
    // Optional: light haptic feedback/toast for instant gratification
    toast.success(`Logged ${amount}ml of water`);

    try {
      // 2. Fire API in background
      await nutritionApi.logWater(amount);
      
      // 3. Quietly sync with server to ensure consistency
      nutritionApi.getToday().then(res => {
        if (res) setData(res);
      }).catch(() => {});
      
    } catch (err: any) {
      // 4. Revert if the API call fails
      setData((prev: any) => ({
        ...prev,
        consumed: { ...prev.consumed, water_ml: previousWater }
      }));
      toast.error(err?.message || "Failed to log water. Please check your connection.");
    }
  };

  const openLogModal = (mealType: string, preselected?: any[]) => {
    setModalMealType(mealType);
    setModalPreselectedFoods(preselected || []);
    setModalOpen(true);
  };

  const getMealTiming = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return '8:00 AM - 9:30 AM';
      case 'lunch': return '1:00 PM - 2:30 PM';
      case 'snack': return '5:00 PM - 6:30 PM';
      case 'dinner': return '8:30 PM - 10:00 PM';
      default: return '';
    }
  };

  if (isLoading) {
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
        <button onClick={fetchToday} className="mt-4 px-4 py-2 bg-white/5 rounded-full text-xs font-bold text-white hover:bg-white/10">Try Again</button>
      </div>
    );
  }

  if (!data) return null;

  const { targets, consumed, remaining, budget, progress, meals, nutrition_score } = data;

  const getMealIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'breakfast': return <Coffee size={20} />;
      case 'lunch': return <Salad size={20} />;
      case 'snack': return <Apple size={20} />;
      case 'dinner': return <Beef size={20} />;
      default: return <Apple size={20} />;
    }
  };

  const isMealCompleted = (type: string) => {
    return data.logged_foods?.some((f: any) => f.meal_type === type);
  };

  const foodsByMeal = (data.logged_foods || []).reduce((acc: any, log: any) => {
    const t = log.meal_type || 'snack';
    if (!acc[t]) acc[t] = [];
    acc[t].push(log);
    return acc;
  }, {});

  return (
    <>
      <div className="space-y-4">
        {/* Today's Nutrition card */}
        <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#ADFF00]/5 blur-[40px] rounded-full pointer-events-none" />
          
          <div className="flex justify-between items-end mb-6 relative z-10">
            <div>
              <p className="text-[11px] font-black tracking-widest text-[#ADFF00] uppercase mb-1">Calories Remaining</p>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white tracking-tighter">{remaining.calories}</span>
                <span className="text-sm font-bold text-white/50">kcal</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white/60">{consumed.calories} / {targets.calories} consumed</p>
            </div>
          </div>

          <div className="h-3 w-full bg-black/40 rounded-full mb-6 overflow-hidden relative z-10 p-0.5">
            <div className="h-full bg-gradient-to-r from-[#ADFF00] to-[#88cc00] rounded-full relative" style={{ width: `${progress.calories_percent}%` }}>
              <div className="absolute inset-0 bg-white/20 w-full rounded-full" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 relative z-10">
            <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Protein</span>
                <span className="text-[10px] font-bold text-[#ADFF00]">{consumed.protein}/{targets.protein}g</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#ADFF00] rounded-full" style={{ width: `${progress.protein_percent}%` }} />
              </div>
            </div>
            <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Carbs</span>
                <span className="text-[10px] font-bold text-blue-400">{consumed.carbs}/{targets.carbs}g</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-400 rounded-full" style={{ width: `${Math.min(100, (consumed.carbs/targets.carbs)*100)}%` }} />
              </div>
            </div>
            <div className="bg-[#0A1108] rounded-2xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-wider">Fat</span>
                <span className="text-[10px] font-bold text-orange-400">{consumed.fat}/{targets.fat}g</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.min(100, (consumed.fat/targets.fat)*100)}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Daily Target card */}
        <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-[11px] font-black tracking-widest text-white uppercase">Your Daily Targets</h3>
              <button 
                onClick={() => setShowTargetsModal(true)} 
                className="text-[10px] font-bold text-[#ADFF00] hover:underline flex items-center gap-1"
              >
                <Edit3 size={12} /> Edit
              </button>
            </div>
            <span className="text-[10px] font-black tracking-widest text-white/40 uppercase">Score: <span className={nutrition_score > 80 ? "text-[#ADFF00]" : "text-white"}>{nutrition_score}</span></span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl py-3 border border-white/5">
              <span className="text-[10px] text-white/50 font-bold uppercase mb-1">Cals</span>
              <span className="text-sm font-black text-white">{targets.calories}</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl py-3 border border-white/5">
              <span className="text-[10px] text-white/50 font-bold uppercase mb-1">Pro</span>
              <span className="text-sm font-black text-[#ADFF00]">{targets.protein}g</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl py-3 border border-white/5">
              <span className="text-[10px] text-white/50 font-bold uppercase mb-1">Carb</span>
              <span className="text-sm font-black text-blue-400">{targets.carbs}g</span>
            </div>
            <div className="flex flex-col items-center justify-center bg-black/30 rounded-xl py-3 border border-white/5">
              <span className="text-[10px] text-white/50 font-bold uppercase mb-1">Fat</span>
              <span className="text-sm font-black text-orange-400">{targets.fat}g</span>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="mt-8 mb-4">
          <h2 className="text-[13px] font-black tracking-widest text-white uppercase px-1">Today&apos;s Meals</h2>
        </div>
        
        {meals.every((m: any) => !m.meal_plan_items || m.meal_plan_items.length === 0) ? (
          <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-8 text-center opacity-70">
             <p className="text-white/50 text-sm mb-4">No meal plan generated for today.</p>
             <button 
               disabled={isGenerating}
               onClick={handleGeneratePlan}
               className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
             >
               {isGenerating ? <Loader2 className="animate-spin" size={14} /> : null}
               {isGenerating ? "Generating..." : "Generate AI Meal Plan"}
             </button>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal: any) => {
              const completed = isMealCompleted(meal.meal_type);
              const loggedFoods = foodsByMeal[meal.meal_type] || [];
              const mealCals = loggedFoods.reduce((acc: number, f: any) => acc + f.calories, 0);
              const mealPro = loggedFoods.reduce((acc: number, f: any) => acc + f.protein, 0);
              
              return (
                <div key={meal.id} className={`bg-[#111A10] border rounded-[24px] p-5 ${completed ? 'border-[#ADFF00]/20 shadow-[0_0_15px_rgba(173,255,0,0.03)]' : 'border-white/5 opacity-90'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${completed ? 'bg-[#ADFF00]/10 text-[#ADFF00]' : 'bg-white/5 text-white/60'}`}>
                        {getMealIcon(meal.meal_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white capitalize">{meal.meal_type}</h3>
                          <span className="text-[10px] font-bold text-[#ADFF00] bg-[#ADFF00]/10 px-2 py-0.5 rounded-full border border-[#ADFF00]/20">
                            {getMealTiming(meal.meal_type)}
                          </span>
                        </div>
                        <p className="text-xs text-white/50 font-medium mt-0.5">
                          {completed ? 'Logged' : (meal.meal_plan_items?.length > 0 ? 'Planned' : 'Not planned yet')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {completed && (
                        <>
                          <p className="text-sm font-black text-white">{mealCals} <span className="text-[10px] text-white/50">kcal</span></p>
                          <p className="text-xs font-bold text-[#ADFF00]">{mealPro}g Protein</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Show planned or logged foods with image reference */}
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                    <ul className="text-[13px] font-medium text-white/80 space-y-2.5">
                      {loggedFoods.length > 0 ? (
                        loggedFoods.map((f: any) => (
                          <li key={f.id} className="flex justify-between items-center">
                            <span className="flex items-center gap-2.5 text-white/90">
                              <img 
                                src={getFoodSvgAvatar(f.foods?.name || '')} 
                                alt={f.foods?.name || 'Food'} 
                                className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                              />
                              <div>
                                <span className="font-bold block">{f.foods?.name || 'Logged food'}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-white/40 font-medium">x{f.quantity} serving</span>
                                  <span className="text-[10px] text-white/30">•</span>
                                  <span className="text-[10px] text-[#ADFF00]/70 font-medium">{f.protein}g P</span>
                                  <span className="text-[10px] text-blue-400/70 font-medium">{f.carbs}g C</span>
                                  <span className="text-[10px] text-orange-400/70 font-medium">{f.fat}g F</span>
                                </div>
                              </div>
                            </span>
                            <span className="text-xs font-black text-[#ADFF00]">{f.calories} <span className="text-[9px] text-[#ADFF00]/70 uppercase">kcal</span></span>
                          </li>
                        ))
                      ) : (meal.meal_plan_items && meal.meal_plan_items.length > 0) ? (
                        meal.meal_plan_items.map((item: any) => (
                           <li key={item.id} className="flex justify-between items-center">
                            <span className="flex items-center gap-2.5 text-white/80">
                              <img 
                                src={getFoodSvgAvatar(item.foods?.name || '')} 
                                alt={item.foods?.name || 'Food'} 
                                className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                              />
                              <div>
                                <span className="font-bold block text-white/90">{item.foods?.name || 'Food item'}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-white/40 font-medium">{item.foods?.serving_size || '1 serving'}</span>
                                  <span className="text-[10px] text-white/30">•</span>
                                  <span className="text-[10px] text-[#ADFF00]/70 font-medium">{Math.round(item.foods?.protein * item.quantity)}g P</span>
                                  <span className="text-[10px] text-blue-400/70 font-medium">{Math.round(item.foods?.carbs * item.quantity)}g C</span>
                                  <span className="text-[10px] text-orange-400/70 font-medium">{Math.round(item.foods?.fat * item.quantity)}g F</span>
                                </div>
                              </div>
                            </span>
                            <span className="text-xs font-black text-white/70">{Math.round(item.foods?.calories * item.quantity)} <span className="text-[9px] text-white/40 uppercase">kcal</span></span>
                          </li>
                        ))
                      ) : (
                        <li className="text-center py-2 text-white/40 text-xs">
                          No foods planned yet. Tap <span className="text-[#ADFF00] font-bold">Log Meal</span> to add foods!
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      disabled={swappingMeal === meal.meal_type}
                      onClick={() => handleSwapMeal(meal.meal_type)} 
                      className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 transition-all flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {swappingMeal === meal.meal_type ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} 
                      Swap
                    </button>
                    {!completed ? (
                      <button onClick={() => openLogModal(meal.meal_type, meal.meal_plan_items)} className="flex-[2] py-2.5 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2">
                        Log Meal
                      </button>
                    ) : (
                      <button onClick={() => openLogModal(meal.meal_type)} className="py-2.5 px-4 bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 border border-[#ADFF00]/20 rounded-xl text-[11px] font-black tracking-widest uppercase text-[#ADFF00] transition-all flex justify-center items-center">
                        <Plus size={14} />
                      </button>
                    )}
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
                <span className="text-3xl font-black text-white">{consumed.protein}</span>
                <span className="text-sm font-bold text-white/40 pb-1">/ {targets.protein}g</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full mb-2">
                <div className="h-full bg-[#ADFF00] rounded-full" style={{ width: `${progress.protein_percent}%` }} />
              </div>
              <p className="text-[10px] font-bold text-white/50">{remaining.protein}g remaining</p>
            </div>
          </div>

          <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-[10px] font-black tracking-widest text-emerald-400 uppercase mb-1">Food Budget</h3>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-white">₹{budget.spent}</span>
                <span className="text-sm font-bold text-white/40 pb-1">/ {budget.daily_limit}</span>
              </div>
              <p className="text-[10px] font-bold text-white/40 mt-1">Today</p>
            </div>
            <div className="mt-2">
              <p className="text-[10px] font-bold text-white/60">₹{budget.monthly_spent} / ₹{budget.monthly_limit} Monthly</p>
            </div>
          </div>
        </div>

        {/* Hydration card */}
        <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 mt-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/5 blur-[30px] rounded-full pointer-events-none" />
          <div className="flex justify-between items-center relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400 border border-cyan-400/20">
                <Droplet size={24} />
              </div>
              <div>
                <h3 className="text-[11px] font-black tracking-widest text-cyan-400 uppercase mb-1">Hydration</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-white">{consumed.water_ml}</span>
                  <span className="text-sm font-bold text-white/50">/ {targets.water_ml}ml</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button disabled={isWaterLoading} onClick={() => handleAddWater(250)} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-white hover:bg-white/10 transition-colors disabled:opacity-50">+ 250ml</button>
              <button disabled={isWaterLoading} onClick={() => handleAddWater(500)} className="px-4 py-1.5 bg-cyan-400/10 border border-cyan-400/20 rounded-full text-[10px] font-black uppercase text-cyan-400 hover:bg-cyan-400/20 transition-colors disabled:opacity-50">+ 500ml</button>
            </div>
          </div>
        </div>

        {/* Today's Summary section */}
        <div className="mt-8 mb-4">
          <h2 className="text-[13px] font-black tracking-widest text-white uppercase px-1">Today&apos;s Summary</h2>
        </div>
        
        <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40"><Zap size={14} /></div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Calories</p>
              <p className="text-sm font-black text-white">{consumed.calories} / {targets.calories}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00]"><Apple size={14} /></div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Protein</p>
              <p className="text-sm font-black text-white">{consumed.protein} / {targets.protein}g</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400"><Droplet size={14} /></div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Water</p>
              <p className="text-sm font-black text-white">{consumed.water_ml} / {targets.water_ml}ml</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40"><Apple size={14} /></div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Meals</p>
              <p className="text-sm font-black text-white">{Object.keys(foodsByMeal).length} / {meals.length || 4} done</p>
            </div>
          </div>
        </div>

      </div>

      <LogFoodModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSuccess={fetchToday}
        defaultMealType={modalMealType}
        preselectedFoods={modalPreselectedFoods}
      />

      {/* Edit Daily Targets Modal */}
      <AnimatePresence>
        {showTargetsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111A10] border border-white/10 rounded-3xl p-6 shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00]">
                    <Edit3 size={16} />
                  </div>
                  <h2 className="text-base font-black text-white uppercase tracking-wider">Set Daily Nutrition Targets</h2>
                </div>
                <button onClick={() => setShowTargetsModal(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
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
                  <label className="block text-[11px] font-bold text-cyan-400 uppercase tracking-wider mb-1">Water Target (ml)</label>
                  <input 
                    type="number"
                    value={targetForm.water_ml}
                    onChange={(e) => setTargetForm(p => ({ ...p, water_ml: Number(e.target.value) }))}
                    className="w-full p-3 rounded-xl bg-black/40 border border-cyan-400/30 text-white font-bold text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  disabled={isGenerating}
                  onClick={() => handleSetDailyTargets()}
                  className="w-full py-4 mt-2 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black font-black text-xs uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                  <span>{isGenerating ? "Saving Targets..." : "Save Daily Targets"}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-5 flex flex-col gap-3 z-40">
        <button className="w-12 h-12 rounded-full bg-[#111A10] border border-white/10 flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
          <Bot size={20} className="text-white" />
        </button>
        <button onClick={() => openLogModal('snack')} className="w-14 h-14 rounded-full bg-[#ADFF00] flex items-center justify-center shadow-[0_0_20px_rgba(173,255,0,0.3)] hover:scale-105 transition-transform">
          <Plus size={24} className="text-black" />
        </button>
      </div>
    </>
  );
}
