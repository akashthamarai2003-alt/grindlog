"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X, Loader2, Check, Plus, Minus, ChevronLeft } from "lucide-react";
import { nutritionApi } from "@/lib/api/nutrition";
import { toast } from "sonner";
import { FoodAvatar } from "./food-avatar";

interface Food {
  id: string;
  name: string;
  category: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimated_cost: number;
  image_url?: string;
  source?: 'verified' | 'open_food_facts';
  source_name?: string;
  brand?: string;
}

const FOOD_CATEGORIES = [
  { id: "All", label: "All Foods" },
  { id: "Protein", label: "🍗 High Protein" },
  { id: "Breakfast", label: "🥣 Breakfast" },
  { id: "Curry", label: "🍛 Curries & Dals" },
  { id: "Staple", label: "🍞 Staples & Grains" },
  { id: "Dairy", label: "🥛 Dairy" },
  { id: "Nuts & Snacks", label: "🥜 Nuts & Snacks" },
  { id: "Fruit", label: "🍎 Fruits" },
  { id: "Vegetables", label: "🥗 Vegetables" },
];

interface PlannedItem {
  key: string;
  name: string;
  serving_size: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  estimated_cost: number;
  quantity: number;
  checked: boolean;
  rawItem: any;
}

interface LogFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (optimisticData?: any) => void;
  defaultMealType?: string;
  preselectedFoods?: any[]; // for logging an existing meal plan
}

function formatMealType(type: string) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function LogFoodModal({
  isOpen,
  onClose,
  onSuccess,
  defaultMealType = 'lunch',
  preselectedFoods
}: LogFoodModalProps) {
  const [mealType, setMealType] = useState(defaultMealType);
  const [isReviewingPlan, setIsReviewingPlan] = useState(false);
  const [plannedFoods, setPlannedFoods] = useState<PlannedItem[]>([]);

  // Search, category filter & single food selection state
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [dietFilter, setDietFilter] = useState<'onboarding' | 'all'>('onboarding');
  const [results, setResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);

  const fetchFoods = async (q: string, cat?: string, dietMode?: 'onboarding' | 'all') => {
    setIsSearching(true);
    const categoryToQuery = cat !== undefined ? cat : selectedCategory;
    const mode = dietMode !== undefined ? dietMode : dietFilter;
    try {
      const data = await nutritionApi.searchFoods(q, categoryToQuery, mode === 'all' ? 'all' : undefined);
      setResults(data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to search foods");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setMealType(defaultMealType);
      setSearch("");
      setSelectedCategory("All");
      setDietFilter("onboarding");
      setSelectedFood(null);
      setQuantity(1);

      if (preselectedFoods && preselectedFoods.length > 0) {
        setIsReviewingPlan(true);
        setPlannedFoods(
          preselectedFoods.map((item, idx) => {
            const foodObj = item.foods || item;
            const q = Number(item.quantity) || 1;
            return {
              key: foodObj?.id || `planned-${foodObj?.name || 'food'}-${idx}`,
              name: foodObj?.name || 'Food item',
              serving_size: foodObj?.serving_size || '1 serving',
              calories: Number(foodObj?.calories) || 0,
              protein: Number(foodObj?.protein) || 0,
              carbs: Number(foodObj?.carbs) || 0,
              fat: Number(foodObj?.fat) || 0,
              estimated_cost: Number(foodObj?.estimated_cost) || 0,
              quantity: q,
              checked: true,
              rawItem: item,
            };
          })
        );
      } else {
        setIsReviewingPlan(false);
        setPlannedFoods([]);
        fetchFoods("", "All", "onboarding");
      }
    }
  }, [isOpen, defaultMealType, preselectedFoods]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen && !isReviewingPlan && !selectedFood) {
        fetchFoods(search, selectedCategory, dietFilter);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search, selectedCategory, dietFilter, isOpen, isReviewingPlan, selectedFood]);

  // Calculations for planned meal
  const plannedTotals = useMemo(() => {
    return plannedFoods.reduce(
      (acc, item) => {
        if (!item.checked) return acc;
        return {
          calories: acc.calories + item.calories * item.quantity,
          protein: acc.protein + item.protein * item.quantity,
          carbs: acc.carbs + item.carbs * item.quantity,
          fat: acc.fat + item.fat * item.quantity,
          count: acc.count + 1,
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 }
    );
  }, [plannedFoods]);

  const toggleItemCheck = (index: number) => {
    setPlannedFoods(prev =>
      prev.map((item, i) => (i === index ? { ...item, checked: !item.checked } : item))
    );
  };

  const updateItemQuantity = (index: number, delta: number) => {
    setPlannedFoods(prev =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const newQ = Math.max(0.25, Math.round((item.quantity + delta) * 100) / 100);
        return { ...item, quantity: newQ };
      })
    );
  };

  const handleLogPlannedMeal = async () => {
    const itemsToLog = plannedFoods.filter(item => item.checked && item.quantity > 0);
    if (itemsToLog.length === 0) {
      toast.error("Select at least one food item to log");
      return;
    }

    const optimisticItems = itemsToLog.map((item, idx) => {
      const foodObj = item.rawItem?.foods || item.rawItem;
      const q = Number(item.quantity) || 1;
      return {
        id: `temp-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        food_id: foodObj?.id,
        meal_type: mealType,
        quantity: q,
        calories: Math.round((item.calories || 0) * q),
        protein: Number(((item.protein || 0) * q).toFixed(1)),
        carbs: Number(((item.carbs || 0) * q).toFixed(1)),
        fat: Number(((item.fat || 0) * q).toFixed(1)),
        estimated_cost: Number(((item.estimated_cost || 0) * q).toFixed(1)),
        source: 'manual',
        logged_at: new Date().toISOString(),
        foods: {
          id: foodObj?.id,
          name: item.name,
          category: foodObj?.category || mealType,
          serving_size: item.serving_size || '1 serving',
          image_url: foodObj?.image_url,
          calories: item.calories,
          protein: item.protein,
          carbs: item.carbs,
          fat: item.fat,
          estimated_cost: item.estimated_cost
        }
      };
    });

    // INSTANT: Close modal immediately, trigger optimistic dashboard update, show toast
    toast.success(`Logged ${itemsToLog.length} foods for ${formatMealType(mealType)}!`);
    onSuccess(optimisticItems);
    onClose();

    // Fire all API requests in parallel via Promise.all in background
    Promise.all(itemsToLog.map(item => {
      const foodObj = item.rawItem?.foods || item.rawItem;
      if (foodObj?.id) {
        return nutritionApi.logFood({
          food_id: foodObj.id,
          meal_type: mealType,
          quantity: item.quantity,
        });
      } else {
        return nutritionApi.logFood({
          meal_type: mealType,
          quantity: item.quantity,
          custom_food: {
            name: item.name,
            category: foodObj?.category || mealType,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            estimated_cost: item.estimated_cost,
          },
        });
      }
    })).catch((err: any) => {
      console.error("Background logMeal error:", err);
      toast.error(err?.message || "Some meal items failed to save to server");
    });
  };

  const handleLogSingle = async () => {
    if (!selectedFood) return;

    const scaledCalories = Math.round((selectedFood.calories || 0) * quantity);
    const scaledProtein = Number(((selectedFood.protein || 0) * quantity).toFixed(1));
    const scaledCarbs = Number(((selectedFood.carbs || 0) * quantity).toFixed(1));
    const scaledFat = Number(((selectedFood.fat || 0) * quantity).toFixed(1));
    const scaledCost = Number(((selectedFood.estimated_cost || 0) * quantity).toFixed(1));

    const optimisticItem = {
      id: `temp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      food_id: selectedFood.id,
      meal_type: mealType,
      quantity,
      calories: scaledCalories,
      protein: scaledProtein,
      carbs: scaledCarbs,
      fat: scaledFat,
      estimated_cost: scaledCost,
      source: 'manual',
      logged_at: new Date().toISOString(),
      foods: {
        id: selectedFood.id,
        name: selectedFood.name,
        category: selectedFood.category || mealType,
        serving_size: selectedFood.serving_size || '1 serving',
        image_url: selectedFood.image_url,
        calories: selectedFood.calories,
        protein: selectedFood.protein,
        carbs: selectedFood.carbs,
        fat: selectedFood.fat,
        estimated_cost: selectedFood.estimated_cost
      }
    };

    const payload: any = { meal_type: mealType, quantity };
    const isExternalOff = selectedFood.source === 'open_food_facts' || String(selectedFood.id || '').startsWith('off-');
    if (selectedFood.id && !isExternalOff) {
      payload.food_id = selectedFood.id;
    } else {
      payload.custom_food = {
        name: selectedFood.name,
        category: selectedFood.category || mealType,
        serving_size: selectedFood.serving_size || '1 serving',
        calories: selectedFood.calories || 0,
        protein: selectedFood.protein || 0,
        carbs: selectedFood.carbs || 0,
        fat: selectedFood.fat || 0,
        estimated_cost: selectedFood.estimated_cost || 0,
      };
    }

    // INSTANT: Close modal immediately, update parent dashboard UI, show toast
    toast.success(`Logged ${quantity}x ${selectedFood.name}`);
    onSuccess(optimisticItem);
    onClose();

    // Background server sync
    nutritionApi.logFood(payload).catch((err: any) => {
      console.error("Background logFood error:", err);
      toast.error(err?.message || `Failed to save ${selectedFood.name} to server`);
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm p-2 pb-24 sm:p-4 sm:pb-4">
      <div className="bg-[#111A10] w-full max-w-md rounded-t-[28px] sm:rounded-[32px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[calc(100dvh-5.5rem)] sm:max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {(!isReviewingPlan && preselectedFoods && preselectedFoods.length > 0) && (
              <button 
                onClick={() => setIsReviewingPlan(true)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/60 hover:text-white mr-1"
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">
                {isReviewingPlan ? `Log ${formatMealType(mealType)}` : selectedFood ? "Food Details" : "Search Food"}
              </h2>
              {isReviewingPlan && (
                <p className="text-[10px] font-bold text-[#ADFF00] tracking-wider uppercase mt-0.5">
                  {plannedTotals.count} of {plannedFoods.length} items selected
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        {isReviewingPlan ? (
          /* =================== MULTI-ITEM PLANNED MEAL REVIEW =================== */
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              <p className="text-xs text-white/60 font-medium">
                Confirm or adjust what you ate. Uncheck items you skipped.
              </p>

              <div className="space-y-2">
                {plannedFoods.map((item, idx) => {
                  const itemCals = Math.round(item.calories * item.quantity);
                  const itemPro = Math.round(item.protein * item.quantity);
                  const itemCarbs = Math.round(item.carbs * item.quantity);
                  const itemFat = Math.round(item.fat * item.quantity);

                  return (
                    <div
                      key={item.key}
                      className={`w-full rounded-2xl border transition-all p-3 flex flex-col gap-2 ${
                        item.checked
                          ? 'bg-[#0D150D] border-[#ADFF00]/30 shadow-[0_0_10px_rgba(173,255,0,0.03)]'
                          : 'bg-black/30 border-white/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div 
                          onClick={() => toggleItemCheck(idx)}
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        >
                          <div
                            className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-colors shrink-0 ${
                              item.checked ? 'bg-[#ADFF00] border-[#ADFF00] text-black' : 'border-white/20 bg-white/5'
                            }`}
                          >
                            {item.checked && <Check size={13} strokeWidth={3} />}
                          </div>

                          <FoodAvatar name={item.name} className="w-9 h-9 rounded-xl object-cover border border-white/10 shrink-0" />

                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">{item.name}</h4>
                            <p className="text-[10px] text-white/40 truncate">{item.serving_size}</p>
                          </div>
                        </div>

                        {/* Quantity Stepper */}
                        <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(idx, -0.5)}
                            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-black text-white">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateItemQuantity(idx, 0.5)}
                            className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>

                      {/* Macros row */}
                      {item.checked && (
                        <div className="flex items-center justify-between pl-8 pt-1 text-[10px] border-t border-white/5">
                          <span className="text-white/40">
                            <span className="text-[#ADFF00] font-bold">{itemPro}g P</span> •{' '}
                            <span className="text-sky-400 font-bold">{itemCarbs}g C</span> •{' '}
                            <span className="text-amber-400 font-bold">{itemFat}g F</span>
                          </span>
                          <span className="font-black text-white">{itemCals} kcal</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Button to add extra unlisted food */}
              <button
                type="button"
                onClick={() => {
                  setIsReviewingPlan(false);
                  fetchFoods("");
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-dashed border-white/15 rounded-2xl text-xs font-bold text-white/70 hover:text-white transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Plus size={14} className="text-[#ADFF00]" /> + Add Extra Food
              </button>
            </div>

            {/* Footer Summary & Log Button */}
            <div className="p-4 sm:p-5 bg-black/40 border-t border-white/5 shrink-0 flex flex-col gap-3">
              <div className="grid grid-cols-4 gap-2 bg-[#111A10] border border-white/5 rounded-xl p-2.5 text-center">
                <div>
                  <p className="text-xs font-black text-white">{Math.round(plannedTotals.calories)}</p>
                  <p className="text-[9px] text-white/40 uppercase font-bold">Cals</p>
                </div>
                <div>
                  <p className="text-xs font-black text-[#ADFF00]">{Math.round(plannedTotals.protein)}g</p>
                  <p className="text-[9px] text-white/40 uppercase font-bold">Protein</p>
                </div>
                <div>
                  <p className="text-xs font-black text-sky-400">{Math.round(plannedTotals.carbs)}g</p>
                  <p className="text-[9px] text-white/40 uppercase font-bold">Carbs</p>
                </div>
                <div>
                  <p className="text-xs font-black text-amber-400">{Math.round(plannedTotals.fat)}g</p>
                  <p className="text-[9px] text-white/40 uppercase font-bold">Fat</p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl border border-white/10 text-white/70 hover:text-white text-xs font-black tracking-widest uppercase hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleLogPlannedMeal}
                  disabled={plannedTotals.count === 0}
                  className="flex-[2] py-3.5 rounded-xl bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black text-xs font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-[0_0_15px_rgba(173,255,0,0.2)]"
                >
                  Log Meal ({plannedTotals.count} items)
                </button>
              </div>
            </div>
          </div>
        ) : !selectedFood ? (
          /* =================== SEARCH FOOD VIEW =================== */
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-4 sm:p-5 flex-1 overflow-y-auto">
              {/* Diet filter status bar */}
              <div className="flex items-center justify-between mb-2.5 px-1 text-[11px]">
                <span className="text-white/60 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ADFF00] shadow-[0_0_8px_rgba(173,255,0,0.6)]" />
                  Personalized to your diet
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = dietFilter === 'onboarding' ? 'all' : 'onboarding';
                    setDietFilter(nextMode);
                    fetchFoods(search, selectedCategory, nextMode);
                  }}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                    dietFilter === 'onboarding'
                      ? 'text-[#ADFF00] bg-[#ADFF00]/10 border-[#ADFF00]/30 hover:bg-[#ADFF00]/20'
                      : 'text-white/60 bg-white/5 border-white/10 hover:text-white'
                  }`}
                >
                  {dietFilter === 'onboarding' ? 'Diet Filter: Active' : 'Diet Filter: All Foods'}
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input
                  type="text"
                  placeholder="Search foods (e.g. Eggs, Oats, Whey, Chicken)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white text-sm outline-none focus:border-[#ADFF00]/50 focus:bg-white/10 transition-all"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1 mb-3">
                {FOOD_CATEGORIES.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      fetchFoods(search, cat.id);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#ADFF00] text-black font-black shadow-[0_0_10px_rgba(173,255,0,0.3)]'
                        : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {isSearching ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[#ADFF00]" size={24} />
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map(food => (
                    <button
                      key={food.id || food.name}
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-left bg-black/40 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-2xl p-3 transition-all flex justify-between items-center gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FoodAvatar name={food.name} className="w-11 h-11 rounded-xl object-cover border border-white/10 shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-white text-sm truncate">{food.name}</h4>
                            {food.source === 'open_food_facts' ? (
                              <span className="text-[9px] font-black text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-1.5 py-0.5 rounded">
                                Open Food Facts
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-[#ADFF00]/80 bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-1.5 py-0.5 rounded">
                                Verified
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 mt-0.5 truncate">
                            {food.serving_size} • ₹{food.estimated_cost}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#ADFF00]">
                          {food.calories} <span className="text-[10px] text-[#ADFF00]/70 uppercase">kcal</span>
                        </p>
                        <p className="text-xs text-white/60 font-medium">{food.protein}g protein</p>
                      </div>
                    </button>
                  ))}

                  {results.length === 0 && !isSearching && (
                    <div className="text-center py-10 text-white/40 text-sm">
                      No foods found for &quot;{search}&quot;.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* =================== SINGLE FOOD PORTION DETAIL =================== */
          <div className="p-4 sm:p-5 overflow-y-auto flex-1 flex flex-col justify-between">
            <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5 overflow-hidden">
              <div className="relative h-32 rounded-xl overflow-hidden mb-4 border border-white/10">
                <FoodAvatar name={selectedFood.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h3 className="text-lg font-black text-white">{selectedFood.name}</h3>
                    {selectedFood.source === 'open_food_facts' ? (
                      <span className="text-[10px] font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-full">
                        Open Food Facts
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-[#ADFF00] bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-2 py-0.5 rounded-full">
                        ICMR-NIN / USDA Verified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#ADFF00] font-bold">{selectedFood.serving_size}</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-2 bg-white/5 rounded-xl">
                  <p className="text-[10px] uppercase text-white/50 font-bold mb-1">Cals</p>
                  <p className="text-sm font-black text-white">{Math.round(selectedFood.calories * quantity)}</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl">
                  <p className="text-[10px] uppercase text-white/50 font-bold mb-1">Pro</p>
                  <p className="text-sm font-black text-[#ADFF00]">{(selectedFood.protein * quantity).toFixed(1)}g</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl">
                  <p className="text-[10px] uppercase text-white/50 font-bold mb-1">Carb</p>
                  <p className="text-sm font-black text-sky-400">{(selectedFood.carbs * quantity).toFixed(1)}g</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl">
                  <p className="text-[10px] uppercase text-white/50 font-bold mb-1">Fat</p>
                  <p className="text-sm font-black text-amber-400">{(selectedFood.fat * quantity).toFixed(1)}g</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1 mb-2 block">
                  Quantity (Servings)
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.max(0.25, Math.round((prev - 0.5) * 100) / 100))}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3.5 text-center text-white text-lg font-bold outline-none focus:border-[#ADFF00]/50"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity(prev => Math.round((prev + 0.5) * 100) / 100)}
                    className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1 mb-2 block">
                  Meal
                </label>
                <select
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3.5 text-white font-bold outline-none focus:border-[#ADFF00]/50 appearance-none"
                >
                  <option value="breakfast" className="bg-[#111A10]">Breakfast</option>
                  <option value="lunch" className="bg-[#111A10]">Lunch</option>
                  <option value="snack" className="bg-[#111A10]">Snack</option>
                  <option value="dinner" className="bg-[#111A10]">Dinner</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-3.5 rounded-xl border border-white/10 text-white text-xs font-black tracking-widest uppercase hover:bg-white/5 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleLogSingle}
                disabled={quantity <= 0}
                className="flex-[2] py-3.5 rounded-xl bg-[#ADFF00] hover:bg-[#ADFF00]/90 text-black text-xs font-black tracking-widest uppercase disabled:opacity-50 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(173,255,0,0.2)]"
              >
                Log Food
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
