"use client";

import { useState, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { nutritionApi } from "@/lib/api/nutrition";
import { toast } from "sonner";
import { getFoodImage, DEFAULT_FOOD_IMAGE } from "@/lib/utils/food-images";

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
}

interface LogFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultMealType?: string;
  preselectedFoods?: any[]; // for logging an existing meal plan
}

export function LogFoodModal({ isOpen, onClose, onSuccess, defaultMealType = 'lunch', preselectedFoods }: LogFoodModalProps) {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Food[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  
  // Step 1: Search, Step 2: Set Quantity
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState(defaultMealType);

  useEffect(() => {
    if (isOpen) {
      setSearch("");
      setSelectedFood(null);
      setQuantity(1);
      setMealType(defaultMealType);
      
      // Always load food database catalog in background
      fetchFoods("");

      // If preselectedFoods exist, auto-select the planned meal food so user can log directly
      if (preselectedFoods && preselectedFoods.length > 0) {
        const firstItem = preselectedFoods[0];
        const foodObj = firstItem?.foods || firstItem;
        if (foodObj && foodObj.name) {
          setSelectedFood(foodObj);
          setQuantity(Number(firstItem.quantity) || 1);
        }
      }
    }
  }, [isOpen, defaultMealType, preselectedFoods]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (isOpen && !selectedFood) {
        fetchFoods(search);
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const fetchFoods = async (q: string) => {
    setIsSearching(true);
    try {
      const data = await nutritionApi.searchFoods(q);
      setResults(data || []);
    } catch (err: any) {
      toast.error(err?.message || "Failed to search foods");
    } finally {
      setIsSearching(false);
    }
  };

  const handleLog = async () => {
    if (!selectedFood) return;
    setIsLogging(true);
    try {
      if (preselectedFoods && preselectedFoods.length > 0 && selectedFood?.id === (preselectedFoods[0]?.foods?.id || preselectedFoods[0]?.id)) {
        for (const item of preselectedFoods) {
          const foodObj = item.foods || item;
          if (foodObj?.id) {
            await nutritionApi.logFood({
              food_id: foodObj.id,
              meal_type: mealType,
              quantity: Number(item.quantity) || 1
            });
          }
        }
        toast.success(`Logged ${mealType} meal!`);
      } else {
        await nutritionApi.logFood({
          food_id: selectedFood.id,
          meal_type: mealType,
          quantity: quantity
        });
        toast.success(`Logged ${quantity}x ${selectedFood.name}`);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to log food");
    } finally {
      setIsLogging(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#111A10] w-full max-w-md rounded-t-[32px] sm:rounded-[32px] border border-white/10 overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-sm font-black uppercase tracking-widest text-white">
            {selectedFood ? "Log Details" : "Search Food"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/50 hover:text-white">
            <X size={16} />
          </button>
        </div>

        {!selectedFood ? (
          <div className="flex-1 overflow-y-auto">
            <div className="p-5">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                <input 
                  type="text"
                  placeholder="Search foods..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white text-sm outline-none focus:border-[#ADFF00]/50 focus:bg-white/10 transition-all"
                />
              </div>

              {isSearching ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-[#ADFF00]" size={24} />
                </div>
              ) : (
                <div className="space-y-2">
                  {results.map(food => (
                    <button 
                      key={food.id}
                      onClick={() => setSelectedFood(food)}
                      className="w-full text-left bg-black/40 hover:bg-white/5 border border-transparent hover:border-white/10 rounded-2xl p-3 transition-all flex justify-between items-center gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <img 
                          src={getFoodImage(food.name, food.category, food.image_url)} 
                          alt={food.name} 
                          onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_FOOD_IMAGE; }}
                          className="w-12 h-12 rounded-xl object-cover border border-white/10 shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-white text-sm">{food.name}</h4>
                          <p className="text-xs text-white/50 mt-0.5">{food.serving_size} • ₹{food.estimated_cost}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-black text-[#ADFF00]">{food.calories} <span className="text-[10px] text-[#ADFF00]/70 uppercase">kcal</span></p>
                        <p className="text-xs text-white/60 font-medium">{food.protein}g protein</p>
                      </div>
                    </button>
                  ))}
                  
                  {results.length === 0 && !isSearching && (
                    <div className="text-center py-10 text-white/40 text-sm">
                      No foods found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="p-5 overflow-y-auto">
            <div className="bg-black/40 rounded-2xl p-4 mb-6 border border-white/5 overflow-hidden">
              <div className="relative h-32 rounded-xl overflow-hidden mb-4 border border-white/10">
                <img 
                  src={getFoodImage(selectedFood.name, selectedFood.category, selectedFood.image_url)} 
                  alt={selectedFood.name} 
                  onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_FOOD_IMAGE; }}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end">
                  <h3 className="text-lg font-black text-white">{selectedFood.name}</h3>
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
                  <p className="text-sm font-black text-blue-400">{(selectedFood.carbs * quantity).toFixed(1)}g</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-xl">
                  <p className="text-[10px] uppercase text-white/50 font-bold mb-1">Fat</p>
                  <p className="text-sm font-black text-orange-400">{(selectedFood.fat * quantity).toFixed(1)}g</p>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1 mb-2 block">Quantity (Servings)</label>
                <input 
                  type="number" 
                  min="0.1" 
                  step="0.1"
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#ADFF00]/50"
                />
              </div>
              
              <div>
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider ml-1 mb-2 block">Meal</label>
                <select 
                  value={mealType}
                  onChange={e => setMealType(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white font-bold outline-none focus:border-[#ADFF00]/50 appearance-none"
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
                onClick={() => setSelectedFood(null)}
                className="flex-1 py-4 rounded-xl border border-white/10 text-white text-xs font-black tracking-widest uppercase hover:bg-white/5"
              >
                Back
              </button>
              <button 
                onClick={handleLog}
                disabled={isLogging || quantity <= 0}
                className="flex-[2] py-4 rounded-xl bg-[#ADFF00] text-black text-xs font-black tracking-widest uppercase hover:bg-[#ADFF00]/90 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLogging ? <Loader2 className="animate-spin" size={16} /> : "Log Food"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
