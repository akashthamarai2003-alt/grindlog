"use client";

import React from "react";
import { Check, Flame, Dumbbell, Sparkles } from "lucide-react";
import { 
  GroceryItemData, 
  ShoppingPeriod, 
  getScaledQuantity, 
  getScaledPrice 
} from "./types";

interface GroceryItemCardProps {
  item: GroceryItemData;
  period: ShoppingPeriod;
  onToggle: (id: string) => void;
}

export const GroceryItemCard = React.memo(function GroceryItemCard({
  item,
  period,
  onToggle,
}: GroceryItemCardProps) {
  const { displayQuantity, unit } = getScaledQuantity(
    item.monthlyQuantity,
    item.unit,
    period
  );
  const price = getScaledPrice(item.estimatedPrice, period);

  return (
    <div
      onClick={() => onToggle(item.id)}
      className={`group relative flex items-start gap-3.5 p-3.5 sm:p-4 rounded-2xl border transition-all duration-150 cursor-pointer select-none ${
        item.purchased
          ? "bg-[#0E170E]/50 border-white/5 opacity-60"
          : "bg-[#121E12] border-[#1A2619] hover:border-[#ADFF00]/40 hover:bg-[#152315] active:scale-[0.99]"
      }`}
    >
      {/* Tactile Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={item.purchased}
        onClick={(e) => {
          e.stopPropagation();
          onToggle(item.id);
        }}
        className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center transition-all duration-150 ${
          item.purchased
            ? "bg-[#ADFF00] text-black shadow-[0_0_12px_rgba(173,255,0,0.35)]"
            : "border-2 border-white/20 hover:border-[#ADFF00] bg-white/5 text-transparent"
        }`}
      >
        <Check className={`w-3.5 h-3.5 stroke-[3] transition-transform ${item.purchased ? "scale-100" : "scale-0"}`} />
      </button>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          {/* Item Name & Details */}
          <div>
            <h4
              className={`text-sm sm:text-base font-bold transition-colors line-clamp-1 ${
                item.purchased ? "line-through text-white/40" : "text-white"
              }`}
            >
              {item.name}
            </h4>
            
            {/* Quantity Badge */}
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center text-xs font-black text-[#ADFF00] bg-[#ADFF00]/10 border border-[#ADFF00]/20 px-2 py-0.5 rounded-md">
                {displayQuantity} {unit}
              </span>
              {item.isOptional && (
                <span className="text-[10px] font-semibold text-white/40 bg-white/5 px-1.5 py-0.5 rounded border border-white/10">
                  Optional
                </span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <span
              className={`text-sm sm:text-base font-black tracking-tight ${
                item.purchased ? "line-through text-white/30" : "text-white"
              }`}
            >
              ₹{price}
            </span>
            <p className="text-[10px] font-medium text-white/40">
              {period === "weekly" ? "est. /wk" : "est. /mo"}
            </p>
          </div>
        </div>

        {/* Nutritional Context / Reason */}
        {(item.proteinGrams || item.reason || (item.usedInMeals && item.usedInMeals.length > 0)) && (
          <div className="mt-2.5 pt-2 border-t border-white/5 flex flex-wrap items-center gap-2 text-[11px] text-white/60">
            {typeof item.proteinGrams === "number" && item.proteinGrams > 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">
                <Dumbbell className="w-3 h-3" />
                {item.proteinGrams}g protein
              </span>
            )}
            {typeof item.calories === "number" && item.calories > 0 && (
              <span className="inline-flex items-center gap-1 text-amber-400 font-medium bg-amber-500/10 px-1.5 py-0.5 rounded">
                <Flame className="w-3 h-3" />
                {item.calories} kcal
              </span>
            )}
            {item.reason && !item.proteinGrams && (
              <span className="line-clamp-1 text-white/50 text-[11px]">
                {item.reason}
              </span>
            )}
            {item.usedInMeals && item.usedInMeals.length > 0 && (
              <span className="text-white/40 text-[10px]">
                • {item.usedInMeals.join(", ")}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
