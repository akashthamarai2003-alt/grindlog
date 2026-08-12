"use client";

import { useState, useEffect } from "react";
import { ChevronRight, Droplet, RefreshCw, Plus, Zap, Apple, Salad, Coffee, Beef, Loader2, Bot } from "lucide-react";
import { nutritionApi } from "@/lib/api/nutrition";
import { LogFoodModal } from "./log-food-modal";
import { toast } from "sonner";

export function NutritionView() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isWaterLoading, setIsWaterLoading] = useState(false);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState("lunch");
  const [modalPreselectedFoods, setModalPreselectedFoods] = useState<any[]>([]);

  const [isGenerating, setIsGenerating] = useState(false);

  const fetchToday = async () => {
    try {
      const res = await nutritionApi.getToday();
      setData(res);
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
    setIsWaterLoading(true);
    try {
      await nutritionApi.logWater(amount);
      await fetchToday();
      toast.success(`Logged ${amount}ml of water`);
    } catch (err: any) {
      toast.error(err?.message || "Failed to log water");
    } finally {
      setIsWaterLoading(false);
    }
  };

  const openLogModal = (mealType: string, preselected?: any[]) => {
    setModalMealType(mealType);
    setModalPreselectedFoods(preselected || []);
    setModalOpen(true);
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
          <h2 className="text-lg font-black text-white uppercase tracking-widest mb-2">No Plan Found</h2>
          <p className="text-white/50 text-sm mb-6">You don't have active nutrition targets or a meal plan for today.</p>
          <button 
            disabled={isGenerating}
            onClick={handleGeneratePlan}
            className="w-full py-4 bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black rounded-xl text-xs font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={16} /> : "Generate My Plan"}
            {isGenerating && "Generating..."}
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

  // Determine meal status strictly from backend data (if foods are logged for that meal type)
  const isMealCompleted = (type: string) => {
    return data.logged_foods?.some((f: any) => f.meal_type === type);
  };

  // Group foods by meal type for display
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
            <h3 className="text-[11px] font-black tracking-widest text-white uppercase">Your Daily Targets</h3>
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
        
        {meals.length === 0 ? (
          <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-8 text-center opacity-70">
             <p className="text-white/50 text-sm mb-4">No meal plan generated for today.</p>
             <button 
               disabled={isGenerating}
               onClick={handleGeneratePlan}
               className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
             >
               {isGenerating ? <Loader2 className="animate-spin" size={14} /> : null}
               {isGenerating ? "Generating..." : "Generate Plan"}
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
                        <h3 className="text-sm font-bold text-white capitalize">{meal.meal_type}</h3>
                        <p className="text-xs text-white/50 font-medium">{completed ? 'Logged' : 'Planned'}</p>
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
                  
                  {/* Show planned or logged foods */}
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5 mb-4">
                    <ul className="text-[13px] font-medium text-white/80 space-y-2">
                      {loggedFoods.length > 0 ? (
                        loggedFoods.map((f: any) => (
                          <li key={f.id} className="flex justify-between">
                            <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[#ADFF00]/50"/> {f.foods?.name || 'Unknown'} <span className="text-xs text-white/30">x{f.quantity}</span></span>
                            <span className="text-white/40">{f.calories} kcal</span>
                          </li>
                        ))
                      ) : (
                        meal.meal_plan_items?.map((item: any) => (
                           <li key={item.id} className="flex justify-between">
                            <span className="flex items-center gap-2 text-white/50"><div className="w-1.5 h-1.5 rounded-full bg-white/10"/> {item.foods?.name || 'Food item'}</span>
                            <span className="text-white/30">{Math.round(item.foods?.calories * item.quantity)} kcal</span>
                          </li>
                        ))
                      )}
                    </ul>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 transition-all flex justify-center items-center gap-2">
                      <RefreshCw size={14} /> Swap
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
