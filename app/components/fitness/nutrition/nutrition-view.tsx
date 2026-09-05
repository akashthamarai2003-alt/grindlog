"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronRight, Droplet, RefreshCw, Plus, Zap, Apple, Salad, Coffee, Beef, Loader2, Bot, Edit3, X, Check, Trash2, Sparkles, Calendar } from "lucide-react";
import { FoodAvatar } from "./food-avatar";
import { WaterBottleCard } from "./water-bottle-card";
import { WaterHistoryCard } from "./water-history-card";
import { getFoodImage, getFoodSvgAvatar } from "@/lib/utils/food-images";
import { nutritionApi } from "@/lib/api/nutrition";
import { LogFoodModal } from "./log-food-modal";
import { SwapMealModal } from "./swap-meal-modal";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function NutritionView({ initialData }: { initialData?: any } = {}) {
  const [data, setData] = useState<any>(initialData || null);
  const [isLoading, setIsLoading] = useState(!initialData);
  const [error, setError] = useState<any>(null);
  const [swappingMeal, setSwappingMeal] = useState<string | null>(null);

  const todayDateStr = useMemo(() => {
    return new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  }, []);

  // Date navigation & swap modal states
  const [selectedDate, setSelectedDate] = useState<string>(initialData?.date || todayDateStr);
  const selectedDateRef = useRef<string>(initialData?.date || todayDateStr);
  const dateCacheRef = useRef<Record<string, any>>({});
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [swapMealType, setSwapMealType] = useState<string>("breakfast");
  
  // Water debouncing refs for instantaneous zero-lag tapping
  const pendingWaterDeltaRef = useRef<number>(0);
  const waterDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMealType, setModalMealType] = useState("lunch");
  const [modalPreselectedFoods, setModalPreselectedFoods] = useState<any[]>([]);

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
    const baseDate = new Date();
    const currentDay = baseDate.getDay();
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() - distanceToMonday);

    const dates = [];
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = new Intl.DateTimeFormat('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
      dates.push({
        dateStr: iso,
        dayName: dayNames[d.getDay()],
        dayNumber: d.getDate(),
        isToday: iso === todayDateStr
      });
    }
    return dates;
  }, [todayDateStr]);

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
    if (data?.date) {
      dateCacheRef.current[data.date] = data;
    }
  }, [data]);

  // Background prefetch all 7 days of the week so date switching is 0ms instant
  useEffect(() => {
    if (!data) return;

    if (data.date) {
      dateCacheRef.current[data.date] = data;
    }

    weekDates.forEach((w) => {
      const d = w.dateStr;
      if (d !== data.date && !dateCacheRef.current[d]) {
        nutritionApi.getToday(d).then((res) => {
          if (res?.date) {
            dateCacheRef.current[res.date] = res;
            if (selectedDateRef.current === res.date) {
              setData(res);
            }
          }
        }).catch(() => {});
      }
    });
  }, [weekDates, !data]);

  const fetchToday = async (dateParam?: string, isInitial: boolean = false) => {
    try {
      if (isInitial || !data) {
        setIsLoading(true);
      }
      const targetDate = dateParam || selectedDateRef.current || selectedDate;
      const res = await nutritionApi.getToday(targetDate);
      if (res?.date) {
        dateCacheRef.current[res.date] = res;
      }
      if (!selectedDateRef.current || selectedDateRef.current === (res?.date || targetDate)) {
        setData(res);
        if (res?.date) {
          setSelectedDate(res.date);
          selectedDateRef.current = res.date;
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
      if (isInitial || !data) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (!initialData) {
      fetchToday(undefined, true);
    }
  }, [initialData]);

  const handleSelectDate = (dateStr: string) => {
    if (selectedDate === dateStr) return;
    setSelectedDate(dateStr);
    selectedDateRef.current = dateStr;

    // 1. Instant Cache HIT (0ms switch)
    if (dateCacheRef.current[dateStr]) {
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
    const clickedDateObj = new Date(dateStr + 'T00:00:00');
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = dayNames[clickedDateObj.getDay()] || 'Day';

    setData((prev: any) => {
      if (!prev) return prev;
      const t = prev.targets || { calories: 2000, protein: 130, carbs: 225, fat: 55, water_ml: 3000 };
      return {
        ...prev,
        date: dateStr,
        day_of_week: dayName,
        logged_foods: [],
        water_logs: [],
        water_consumed_ml: 0,
        consumed: { calories: 0, protein: 0, carbs: 0, fat: 0, water_ml: 0 },
        remaining: { calories: t.calories, protein: t.protein, carbs: t.carbs, fat: t.fat },
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
        }
      }
    }).catch((err) => {
      console.error("Failed to load date details:", err);
    });
  };

  const handleSetDailyTargets = async (customPayload?: any) => {
    setIsGenerating(true);
    try {
      await nutritionApi.setTargets(customPayload || targetForm);
      toast.success("Daily nutrition targets initialized!");
      setShowTargetsModal(false);
      dateCacheRef.current = {}; // Invalidate cache so all days reflect updated targets
      await fetchToday(selectedDate, true);
    } catch (err: any) {
      toast.error(err?.message || "Failed to set daily targets");
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
      if (res.existing) {
        toast.info(res.message);
      } else {
        toast.success("Meal plan generated successfully!");
      }
      await fetchToday(selectedDateRef.current);
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

    if (delta > 0) {
      nutritionApi.logWater(delta).then(() => {
        nutritionApi.getToday(selectedDateRef.current).then(res => { if (res) setData(res); }).catch(() => {});
      }).catch(err => {
        console.error("Failed to sync water to server:", err);
        toast.error("Failed to sync water to server");
      });
    } else {
      nutritionApi.removeWater(Math.abs(delta)).then(() => {
        nutritionApi.getToday(selectedDateRef.current).then(res => { if (res) setData(res); }).catch(() => {});
      }).catch(err => {
        console.error("Failed to sync water removal:", err);
        toast.error("Failed to sync water removal");
      });
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
      // Quiet background reconciliation
      nutritionApi.getToday(selectedDateRef.current).then(res => {
        if (res) setData(res);
      }).catch(() => {});
    } catch (err: any) {
      // Revert if API failed
      setData(previousData);
      toast.error(err?.message || "Failed to remove food from server");
    }
  };

  const handleAddWater = (amount: number) => {
    if (!data) return;
    
    const targetWater = Number(data.targets?.water_ml) || 2500;
    const currentWater = Math.min(targetWater, Number(data.consumed?.water_ml) || 0);
    
    // Check if goal is already reached
    if (currentWater >= targetWater) {
      toast.info(`Daily goal of ${(targetWater / 1000).toFixed(1)}L reached! Tap Goal ✏️ to increase.`);
      return;
    }

    // Strictly cap at target
    const newWater = Math.min(targetWater, currentWater + amount);
    const addedActual = newWater - currentWater;
    if (addedActual <= 0) return;
    
    setData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        consumed: { ...prev.consumed, water_ml: newWater },
        progress: {
          ...prev.progress,
          water_percent: Math.min(100, Math.round((newWater / (targetWater || 1)) * 100))
        }
      };
    });
    
    if (newWater >= targetWater) {
      toast.success(`🎉 Daily water goal of ${(targetWater / 1000).toFixed(1)}L reached!`);
    } else {
      toast.success(`Logged ${addedActual}ml of water`);
    }

    // Debounce background API sync
    pendingWaterDeltaRef.current += addedActual;
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    waterDebounceTimerRef.current = setTimeout(() => {
      flushWaterSync();
    }, 450);
  };

  const handleRemoveWater = (amount: number = 250) => {
    if (!data) return;
    const targetWater = Number(data.targets?.water_ml) || 2500;
    const currentWater = Math.min(targetWater, Number(data.consumed?.water_ml) || 0);
    if (currentWater <= 0) return;
    const newWater = Math.max(0, currentWater - amount);

    setData((prev: any) => {
      if (!prev) return prev;
      return {
        ...prev,
        consumed: { ...prev.consumed, water_ml: newWater },
        progress: {
          ...prev.progress,
          water_percent: Math.min(100, Math.round((newWater / (targetWater || 1)) * 100))
        }
      };
    });
    toast.success(`Removed ${amount}ml of water`);

    pendingWaterDeltaRef.current -= amount;
    if (waterDebounceTimerRef.current) {
      clearTimeout(waterDebounceTimerRef.current);
    }
    waterDebounceTimerRef.current = setTimeout(() => {
      flushWaterSync();
    }, 450);
  };

  const handleFoodLoggedSuccess = (optimisticData?: any) => {
    if (optimisticData) {
      const items = Array.isArray(optimisticData) ? optimisticData : [optimisticData];
      if (items.length > 0) {
        setData((prev: any) => {
          if (!prev) return prev;
          const currentLogged = Array.isArray(prev.logged_foods) ? [...prev.logged_foods] : [];
          const updatedLogged = [...currentLogged, ...items];

          let addedCals = 0;
          let addedPro = 0;
          let addedCarbs = 0;
          let addedFat = 0;
          let addedCost = 0;

          items.forEach((item: any) => {
            addedCals += Number(item.calories) || 0;
            addedPro += Number(item.protein) || 0;
            addedCarbs += Number(item.carbs) || 0;
            addedFat += Number(item.fat) || 0;
            addedCost += Number(item.estimated_cost) || 0;
          });

          const newConsumedCals = Math.round((Number(prev.consumed?.calories) || 0) + addedCals);
          const newConsumedPro = Math.round(((Number(prev.consumed?.protein) || 0) + addedPro) * 10) / 10;
          const newConsumedCarbs = Math.round(((Number(prev.consumed?.carbs) || 0) + addedCarbs) * 10) / 10;
          const newConsumedFat = Math.round(((Number(prev.consumed?.fat) || 0) + addedFat) * 10) / 10;
          const targetCals = Number(prev.targets?.calories) || 2000;
          const targetPro = Number(prev.targets?.protein) || 130;

          return {
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
              spent: Math.round(((Number(prev.budget?.spent) || 0) + addedCost) * 100) / 100,
              monthly_spent: Math.round(((Number(prev.budget?.monthly_spent) || 0) + addedCost) * 100) / 100,
            },
            progress: {
              ...prev.progress,
              calories_percent: Math.min(100, Math.round((newConsumedCals / (targetCals || 1)) * 100)),
              protein_percent: Math.min(100, Math.round((newConsumedPro / (targetPro || 1)) * 100)),
            }
          };
        });

        // Reconcile quietly in the background without disturbing the user
        nutritionApi.getToday(selectedDateRef.current).then(res => {
          if (res) setData(res);
        }).catch(() => {});
        return;
      }
    }
    fetchToday(selectedDateRef.current);
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
  const hasPlannedMeals = meals.some((meal: any) => (
    Array.isArray(meal?.meal_plan_items) && meal.meal_plan_items.length > 0
  ));
  const hasLoggedFoods = loggedFoods.length > 0;

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

  const foodsByMeal = loggedFoods.reduce((acc: any, log: any) => {
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

        {/* 7-Day Interactive Strip */}
        <div className="bg-[#111A10] border border-white/5 rounded-2xl p-2 mt-6 mb-2">
          <div className="flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
            {weekDates.map((d) => {
              const isSelected = (selectedDate || todayDateStr) === d.dateStr;
              return (
                <button
                  key={d.dateStr}
                  type="button"
                  onClick={() => handleSelectDate(d.dateStr)}
                  className={`flex-1 min-w-[42px] py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all duration-150 active:scale-95 cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#ADFF00] text-black font-black shadow-[0_0_12px_rgba(173,255,0,0.3)]'
                      : d.isToday
                      ? 'bg-white/10 text-white font-bold border border-[#ADFF00]/40'
                      : 'text-white/50 hover:text-white hover:bg-white/5 font-medium'
                  }`}
                >
                  <span className="text-[9px] uppercase tracking-wider">{d.dayName}</span>
                  <span className="text-xs font-bold mt-0.5">{d.dayNumber}</span>
                  {d.isToday && !isSelected && (
                    <span className="w-1.5 h-1.5 bg-[#ADFF00] rounded-full mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Meals Header */}
        <div className="mt-4 mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[13px] font-black tracking-widest text-white uppercase">
              {(!selectedDate || selectedDate === todayDateStr) ? "Today's Meals" : `${weekDates.find(w => w.dateStr === selectedDate)?.dayName || 'Selected'}'s Meals`}
            </h2>
            {data.day_of_week && (
              <span className="text-[9px] font-black text-[#ADFF00] bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <Sparkles size={10} /> 7-Day Variety
              </span>
            )}
          </div>
          {data.food_type && (
            <span className="text-[10px] font-bold text-white/50 capitalize bg-white/5 px-2.5 py-0.5 rounded-md border border-white/5">
              {data.food_type}
            </span>
          )}
        </div>
        
        {!hasPlannedMeals && !hasLoggedFoods ? (
          <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-8 text-center opacity-70">
             <p className="text-white/50 text-sm mb-4">Your baseline AI strategy is active, but you haven't generated today's specific meal plan.</p>
             <button 
               disabled={isGenerating}
               onClick={handleGeneratePlan}
               className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-full text-xs font-bold disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
             >
               {isGenerating ? <Loader2 className="animate-spin" size={14} /> : null}
               {isGenerating ? "Generate AI Meal Plan" : "Generate AI Meal Plan"}
             </button>
          </div>
        ) : (
          <div className="space-y-3">
            {meals.map((meal: any) => {
              const completed = isMealCompleted(meal.meal_type);
              const loggedFoods = foodsByMeal[meal.meal_type] || [];
              const plannedFoods = Array.isArray(meal.meal_plan_items) ? meal.meal_plan_items : [];
              const mealCals = Math.round(loggedFoods.reduce((acc: number, f: any) => acc + (Number(f.calories) || 0), 0));
              const mealPro = Math.round(loggedFoods.reduce((acc: number, f: any) => acc + (Number(f.protein) || 0), 0));
              const plannedTotals = plannedFoods.reduce((totals: any, item: any) => {
                const quantity = Number(item.quantity) || 1;
                return {
                  calories: totals.calories + Number(item.foods?.calories || 0) * quantity,
                  protein: totals.protein + Number(item.foods?.protein || 0) * quantity,
                  carbs: totals.carbs + Number(item.foods?.carbs || 0) * quantity,
                  fat: totals.fat + Number(item.foods?.fat || 0) * quantity,
                };
              }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
              
              const isToday = !selectedDate || selectedDate === todayDateStr;
              const isActive = !completed && isToday && getActiveMealType() === meal.meal_type;

              return (
                <div 
                  key={meal.id} 
                  className={`bg-[#111A10] border rounded-[24px] p-5 transition-all ${
                    isActive 
                      ? 'border-[#ADFF00]/60 shadow-[0_0_25px_rgba(173,255,0,0.12)] ring-1 ring-[#ADFF00]/30' 
                      : completed 
                      ? 'border-[#ADFF00]/20 shadow-[0_0_15px_rgba(173,255,0,0.03)]' 
                      : 'border-white/5 opacity-90'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive 
                          ? 'bg-[#ADFF00] text-black font-black' 
                          : completed 
                          ? 'bg-[#ADFF00]/10 text-[#ADFF00]' 
                          : 'bg-white/5 text-white/60'
                      }`}>
                        {getMealIcon(meal.meal_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{formatMealType(meal.meal_type)}</h3>
                          {isActive && (
                            <span className="text-[9px] font-black text-black bg-[#ADFF00] px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(173,255,0,0.4)] animate-pulse">
                              NOW
                            </span>
                          )}
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
                          <li key={f.id} className="flex justify-between items-center group">
                            <span className="flex items-center gap-2.5 text-white/90">
                              <FoodAvatar 
                                name={f.foods?.name || ''} 
                                className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                              />
                              <div>
                                <span className="font-bold block text-white/90">{f.foods?.name || 'Logged food'}</span>
                                <span className="text-[11px] text-white/40 font-medium">x{f.quantity} serving{f.quantity > 1 ? 's' : ''}</span>
                              </div>
                            </span>
                            <div className="flex items-center gap-2.5">
                              <span className="text-xs font-black text-[#ADFF00]">{Math.round(Number(f.calories) || 0)} <span className="text-[9px] text-[#ADFF00]/70 uppercase">kcal</span></span>
                              <button
                                type="button"
                                onClick={() => handleDeleteFood(f.id, f.foods?.name)}
                                className="w-6 h-6 rounded-md bg-white/5 hover:bg-red-500/20 text-white/30 hover:text-red-400 border border-white/5 hover:border-red-500/30 flex items-center justify-center transition-all cursor-pointer"
                                title="Remove food"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </li>
                        ))
                      ) : (meal.meal_plan_items && meal.meal_plan_items.length > 0) ? (
                        meal.meal_plan_items.map((item: any) => (
                           <li key={item.id} className="flex justify-between items-center">
                            <span className="flex items-center gap-2.5 text-white/80">
                              <FoodAvatar 
                                name={item.foods?.name || ''} 
                                className="w-8 h-8 rounded-lg object-cover border border-white/10 shrink-0"
                              />
                              <div>
                                <span className="font-bold block text-white/90">{item.foods?.name || 'Food item'}</span>
                                <span className="text-[11px] text-white/40 font-medium">{item.quantity > 1 ? `x${item.quantity} ` : ''}{item.foods?.serving_size || '1 serving'}</span>
                              </div>
                            </span>
                            <span className="text-xs font-black text-white/70">{Math.round(Number(item.foods?.calories || 0) * (Number(item.quantity) || 1))} <span className="text-[9px] text-white/40 uppercase">kcal</span></span>
                          </li>
                        ))
                      ) : (
                        <li className="text-center py-2 text-white/40 text-xs">
                          No foods planned yet. Tap <span className="text-[#ADFF00] font-bold">Log Meal</span> to add foods!
                        </li>
                      )}
                    </ul>
                  </div>
                  {!completed && plannedFoods.length > 0 && (
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
                    {!completed ? (
                      <>
                        <button 
                          type="button"
                          onClick={() => {
                            setSwapMealType(meal.meal_type);
                            setSwapModalOpen(true);
                          }} 
                          className="py-2.5 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#ADFF00]/40 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 hover:text-white transition-all flex justify-center items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw size={14} /> 
                          Swap
                        </button>
                        <button 
                          onClick={() => openLogModal(meal.meal_type, meal.meal_plan_items)} 
                          className="flex-1 py-2.5 bg-[#ADFF00] hover:bg-[#baff22] text-black rounded-xl text-[11px] font-black tracking-widest uppercase transition-all flex justify-center items-center gap-2 shadow-[0_0_15px_rgba(173,255,0,0.15)] cursor-pointer"
                        >
                          Log Meal
                        </button>
                        <button 
                          onClick={() => openLogModal(meal.meal_type)} 
                          className="py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] font-black tracking-widest uppercase text-white/70 hover:text-white transition-all flex justify-center items-center cursor-pointer"
                          title="Add extra food to this meal"
                        >
                          <Plus size={14} />
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => openLogModal(meal.meal_type)} 
                        className="w-full py-2.5 bg-[#ADFF00]/10 hover:bg-[#ADFF00]/20 border border-[#ADFF00]/30 rounded-xl text-[11px] font-black tracking-widest uppercase text-[#ADFF00] transition-all flex justify-center items-center gap-1.5 cursor-pointer"
                      >
                        <Plus size={14} /> Add Food
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
              <p className="text-[10px] font-bold text-white/40 mt-1">Today</p>
            </div>
            <div className="mt-4">
              <div className="h-1.5 w-full bg-white/5 rounded-full mb-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${(budget.spent || 0) > (budget.daily_limit || 200) ? 'bg-rose-500' : 'bg-emerald-400'}`} 
                  style={{ width: `${Math.min(100, Math.round(((budget.spent || 0) / (budget.daily_limit || 1)) * 100))}%` }} 
                />
              </div>
              <p className="text-[10px] font-bold text-white/60">₹{Math.round(budget.monthly_spent || 0)} / ₹{budget.monthly_limit || 6000} Monthly</p>
            </div>
          </div>
        </div>

        {/* Animated Water Intake Bottle Card */}
        <WaterBottleCard
          consumedMl={Math.min(Number(targets.water_ml) || 2500, Number(consumed.water_ml) || 0)}
          targetMl={Number(targets.water_ml) || 2500}
          onAddWater={handleAddWater}
          onRemoveWater={handleRemoveWater}
          onEditGoal={() => setShowTargetsModal(true)}
        />

        {/* Water Intake History & Heatmap Card */}
        <WaterHistoryCard
          todayConsumedMl={Math.min(Number(targets.water_ml) || 2500, Number(consumed.water_ml) || 0)}
          targetMl={Number(targets.water_ml) || 2500}
        />

        {/* Today's Summary section */}
        <div className="mt-8 mb-4">
          <h2 className="text-[13px] font-black tracking-widest text-white uppercase px-1">Today&apos;s Summary</h2>
        </div>
        
        <div className="bg-[#111A10] border border-white/5 rounded-[24px] p-5 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/40"><Zap size={14} /></div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Calories</p>
              <p className="text-sm font-black text-white">{Math.round(consumed.calories || 0)} / {Math.round(targets.calories || 2000)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#ADFF00]/10 flex items-center justify-center text-[#ADFF00]"><Apple size={14} /></div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Protein</p>
              <p className="text-sm font-black text-white">{Math.round(consumed.protein || 0)} / {Math.round(targets.protein || 130)}g</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center text-cyan-400"><Droplet size={14} /></div>
            <div>
              <p className="text-[10px] text-white/50 uppercase font-bold">Water</p>
              <p className="text-sm font-black text-white">{Math.min(Math.round(targets.water_ml || 2500), Math.round(consumed.water_ml || 0))} / {Math.round(targets.water_ml || 2500)}ml</p>
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
        onSuccess={handleFoodLoggedSuccess}
        defaultMealType={modalMealType}
        preselectedFoods={modalPreselectedFoods}
      />

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
      <div className="fixed bottom-[174px] right-5 flex flex-col gap-3 z-40">
        <button onClick={() => openLogModal('snack')} className="w-14 h-14 rounded-full bg-[#ADFF00] flex items-center justify-center shadow-[0_0_20px_rgba(173,255,0,0.3)] hover:scale-105 transition-transform">
          <Plus size={24} className="text-black" />
        </button>
      </div>
    </>
  );
}
