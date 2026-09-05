"use client";

import { useState, useEffect } from "react";
import { X, Loader2, Check, RefreshCw, Sparkles, ChevronRight } from "lucide-react";
import { nutritionApi } from "@/lib/api/nutrition";
import { FoodAvatar } from "./food-avatar";
import { toast } from "sonner";

interface SwapMealModalProps {
  isOpen: boolean;
  onClose: () => void;
  mealType: string;
  onSelectOption: (option: any) => Promise<void> | void;
  onCustomFoodClick?: () => void;
}

function formatMealType(type: string) {
  return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function SwapMealModal({
  isOpen,
  onClose,
  mealType,
  onSelectOption,
  onCustomFoodClick
}: SwapMealModalProps) {
  const [options, setOptions] = useState<any[]>([]);
  const [profileDiet, setProfileDiet] = useState<string>("Balanced");
  const [isLoading, setIsLoading] = useState(true);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setOptions([]);
      setSelectingId(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    nutritionApi.getSwapOptions(mealType)
      .then((res: any) => {
        if (!isMounted) return;
        setOptions(res.options || []);
        if (res.profile_diet) setProfileDiet(res.profile_diet);
      })
      .catch((err: any) => {
        if (!isMounted) return;
        console.error("Failed to load swap alternatives:", err);
        toast.error("Failed to load alternatives. Please try again.");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, mealType]);

  const handleSelect = async (opt: any) => {
    try {
      setSelectingId(opt.id);
      await onSelectOption(opt);
      onClose();
    } catch (err: any) {
      toast.error(err?.message || "Failed to select meal option");
    } finally {
      setSelectingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[88dvh] bg-[#111A10] border border-white/10 rounded-[24px] sm:rounded-[28px] overflow-hidden flex flex-col shadow-2xl">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-white/10 flex items-center justify-between bg-black/20 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#ADFF00]/10 border border-[#ADFF00]/20 flex items-center justify-center text-[#ADFF00] shrink-0">
              <RefreshCw size={17} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-black tracking-wide text-white uppercase truncate">
                  Swap {formatMealType(mealType)}
                </h2>
                <span className="text-[9px] font-black uppercase bg-white/10 text-white/70 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
                  {profileDiet}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-white/50 font-medium truncate">
                Choose a balanced, healthy alternative
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/50 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X size={16} />
          </button>
        </div>

        {/* Options List */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 sm:space-y-4 flex-1 overscroll-contain">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 bg-white/5 rounded-2xl animate-pulse border border-white/5" />
              ))}
            </div>
          ) : options.length === 0 ? (
            <div className="py-12 text-center text-white/40">
              <p className="text-sm">No alternative options found for your food preferences.</p>
              <button
                type="button"
                onClick={onCustomFoodClick}
                className="mt-3 text-xs text-[#ADFF00] font-bold hover:underline"
              >
                Search and log custom foods
              </button>
            </div>
          ) : (
            options.map((opt: any, index: number) => {
              const isSelected = selectingId === opt.id;
              return (
                <div
                  key={opt.id}
                  className="bg-black/40 border border-white/10 hover:border-[#ADFF00]/40 rounded-2xl p-4 transition-all group flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black tracking-widest text-[#ADFF00] uppercase bg-[#ADFF00]/10 px-2 py-0.5 rounded-md">
                          Option {index + 1}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-[#ADFF00] transition-colors">
                          {opt.name}
                        </h3>
                      </div>
                      {opt.description && (
                        <p className="text-xs text-white/50 font-medium mt-1">
                          {opt.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-sm font-black text-white">{opt.calories}</span>
                      <span className="text-[10px] text-white/50 font-bold uppercase ml-1">kcal</span>
                    </div>
                  </div>

                  {/* Food items row */}
                  <div className="bg-white/5 rounded-xl p-2.5 mb-3 border border-white/5">
                    <ul className="text-xs space-y-1.5">
                      {(opt.items || []).map((item: any, idx: number) => (
                        <li key={idx} className="flex justify-between items-center text-white/80">
                          <span className="flex items-center gap-2">
                            <FoodAvatar name={item.name} className="w-6 h-6 rounded-md object-cover border border-white/10" />
                            <span className="font-semibold text-white/90">{item.name}</span>
                            <span className="text-[11px] text-white/40">({item.serving_size})</span>
                          </span>
                          <span className="text-[11px] font-bold text-[#ADFF00]/80">
                            {item.calories} kcal
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Macros and Select Button */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/5">
                    <div className="flex items-center gap-2.5 text-[11px] font-bold">
                      <span className="text-[#ADFF00]">{opt.protein}g <span className="text-white/40 font-normal">pro</span></span>
                      <span className="text-sky-400">{opt.carbs}g <span className="text-white/40 font-normal">carb</span></span>
                      <span className="text-amber-400">{opt.fat}g <span className="text-white/40 font-normal">fat</span></span>
                      {opt.estimated_cost > 0 ? (
                        <span className="text-white/40 font-normal">₹{opt.estimated_cost}</span>
                      ) : (
                        <span className="text-[#ADFF00]/70 font-normal text-[10px]">Free (PG/Home)</span>
                      )}
                    </div>

                    <button
                      type="button"
                      disabled={isSelected}
                      onClick={() => handleSelect(opt)}
                      className="py-1.5 px-4 bg-[#ADFF00] hover:bg-[#baff22] text-black font-black text-[11px] tracking-wider uppercase rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-[0_0_12px_rgba(173,255,0,0.15)]"
                    >
                      {isSelected ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          Selecting...
                        </>
                      ) : (
                        <>
                          <Check size={12} />
                          Select Meal
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut */}
        <div className="p-4 border-t border-white/10 bg-black/30 flex justify-between items-center text-xs text-white/50">
          <span>Want something specific?</span>
          <button
            type="button"
            onClick={() => {
              onClose();
              if (onCustomFoodClick) onCustomFoodClick();
            }}
            className="text-[#ADFF00] hover:underline font-bold flex items-center gap-1 cursor-pointer"
          >
            Search Any Food <ChevronRight size={14} />
          </button>
        </div>

      </div>
    </div>
  );
}
