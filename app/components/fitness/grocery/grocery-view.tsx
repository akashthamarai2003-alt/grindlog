"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  ShoppingCart, 
  Share2, 
  Copy, 
  Check, 
  RotateCcw, 
  Search, 
  X, 
  Sparkles, 
  TrendingUp, 
  CheckCircle2, 
  Filter,
  Eye,
  EyeOff,
  Wallet
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  GroceryItemData, 
  ShoppingPeriod, 
  GroceryCategoryFilter, 
  GROCERY_CATEGORIES, 
  normalizeGroceryCategory, 
  getScaledQuantity, 
  getScaledPrice,
  GroceryBudgetSummary
} from "./types";
import { GroceryItemCard } from "./grocery-item-card";
import { 
  toggleGroceryItemPurchasedAction, 
  resetGroceryItemsAction 
} from "@/app/actions/fitness";

interface GroceryViewProps {
  initialItems: GroceryItemData[];
  budget: GroceryBudgetSummary;
  planName?: string;
  planGoal?: string;
  dietType?: string;
  userId: string;
  planId: string;
}

export function GroceryView({
  initialItems,
  budget,
  planName = "AI Nutrition Plan",
  planGoal,
  dietType,
  userId,
  planId,
}: GroceryViewProps) {
  const router = useRouter();
  const [items, setItems] = useState<GroceryItemData[]>(initialItems);
  const [period, setPeriod] = useState<ShoppingPeriod>("weekly");
  const [selectedCategory, setSelectedCategory] = useState<GroceryCategoryFilter>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [hidePurchased, setHidePurchased] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const syncTimeoutMap = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Sync state from localStorage on initial load
  useEffect(() => {
    try {
      const storageKey = `grindlog_grocery_checked_${userId}_${planId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const checkedMap: Record<string, boolean> = JSON.parse(saved);
        setItems((prev) =>
          prev.map((item) => ({
            ...item,
            purchased: checkedMap[item.id] !== undefined ? checkedMap[item.id] : item.purchased,
          }))
        );
      }
    } catch {
      // ignore localStorage parse issues
    }
  }, [userId, planId]);

  // Clean up pending timeouts on unmount
  useEffect(() => {
    return () => {
      syncTimeoutMap.current.forEach((t) => clearTimeout(t));
      syncTimeoutMap.current.clear();
    };
  }, []);
  const persistCheckedState = (updatedItems: GroceryItemData[]) => {
    try {
      const storageKey = `grindlog_grocery_checked_${userId}_${planId}`;
      const checkedMap: Record<string, boolean> = {};
      for (const it of updatedItems) {
        checkedMap[it.id] = it.purchased;
      }
      localStorage.setItem(storageKey, JSON.stringify(checkedMap));
    } catch {
      // ignore localStorage quota errors
    }
  };

  // Toggle single item - 0ms instantaneous UI response with debounced background sync
  const handleToggle = (id: string) => {
    const item = items.find((it) => it.id === id);
    if (!item) return;
    const newPurchased = !item.purchased;

    const next = items.map((it) =>
      it.id === id ? { ...it, purchased: newPurchased } : it
    );
    setItems(next);
    persistCheckedState(next);

    // Debounce background sync per item to prevent network flooding and eliminate UI lag
    const existingTimeout = syncTimeoutMap.current.get(id);
    if (existingTimeout) clearTimeout(existingTimeout);

    const timeout = setTimeout(() => {
      toggleGroceryItemPurchasedAction(id, newPurchased).catch((err) => {
        console.warn("Background sync grocery item check to DB:", err);
      });
      syncTimeoutMap.current.delete(id);
    }, 400);

    syncTimeoutMap.current.set(id, timeout);
  };

  // Reset all checked items
  const handleReset = () => {
    if (items.every((it) => !it.purchased)) {
      toast.info("Checklist is already clear!");
      return;
    }

    const next = items.map((it) => ({ ...it, purchased: false }));
    setItems(next);
    persistCheckedState(next);

    // Clear any pending single-item syncs
    syncTimeoutMap.current.forEach((t) => clearTimeout(t));
    syncTimeoutMap.current.clear();

    resetGroceryItemsAction(planId).catch((err) => {
      console.warn("Failed to reset grocery items in DB:", err);
    });
    toast.success("Checklist reset for your next shopping run!");
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (selectedCategory !== "All") {
        const itemCategory = normalizeGroceryCategory(item.category, item.name);
        if (itemCategory !== selectedCategory) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCat = item.category.toLowerCase().includes(q);
        const matchesReason = (item.reason || "").toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesReason) return false;
      }

      // Hide purchased filter
      if (hidePurchased && item.purchased) {
        return false;
      }

      return true;
    });
  }, [items, selectedCategory, searchQuery, hidePurchased]);

  // Group filtered items by normalized category
  const groupedItems = useMemo(() => {
    const groups = new Map<string, GroceryItemData[]>();

    for (const item of filteredItems) {
      const cat = normalizeGroceryCategory(item.category, item.name);
      if (!groups.has(cat)) {
        groups.set(cat, []);
      }
      groups.get(cat)!.push(item);
    }

    return Array.from(groups.entries());
  }, [filteredItems]);

  // Cost & Progress calculations
  const { totalSpend, targetBudget, purchasedCount, totalCount, progressPercent } = useMemo(() => {
    const total = items.reduce((sum, it) => sum + getScaledPrice(it.estimatedPrice, period), 0);
    const target = period === "weekly" ? budget.weeklyBudget : budget.monthlyBudget;
    const purchased = items.filter((it) => it.purchased).length;
    const count = items.length;
    const percent = count > 0 ? Math.round((purchased / count) * 100) : 0;

    return {
      totalSpend: total,
      targetBudget: target,
      purchasedCount: purchased,
      totalCount: count,
      progressPercent: percent,
    };
  }, [items, period, budget]);

  // Formatted grocery list for WhatsApp / Blinkit / Share
  const generateFormattedText = () => {
    const periodLabel = period === "weekly" ? "Weekly Run (7-Day)" : "Monthly Stock-Up (30-Day)";
    const lines: string[] = [];

    lines.push(`🛒 *GrindLog Smart Grocery List* (${periodLabel})`);
    if (planGoal) lines.push(`🎯 Goal: ${planGoal}`);
    lines.push(`━━━━━━━━━━━━━━━━━━━━━`);

    // Group all items
    const allGroups = new Map<string, GroceryItemData[]>();
    for (const it of items) {
      const cat = normalizeGroceryCategory(it.category, it.name);
      if (!allGroups.has(cat)) allGroups.set(cat, []);
      allGroups.get(cat)!.push(it);
    }

    for (const [catName, catItems] of allGroups.entries()) {
      lines.push(`\n*${catName}:*`);
      for (const item of catItems) {
        const { displayQuantity, unit } = getScaledQuantity(item.monthlyQuantity, item.unit, period);
        const price = getScaledPrice(item.estimatedPrice, period);
        const checkMark = item.purchased ? "✅" : "▫️";
        lines.push(`${checkMark} ${item.name} — ${displayQuantity} ${unit} (~₹${price})`);
      }
    }

    lines.push(`\n━━━━━━━━━━━━━━━━━━━━━`);
    lines.push(`💵 Estimated Spend: ₹${totalSpend} (Budget: ₹${targetBudget})`);
    lines.push(`📱 Generated by GrindLog AI`);

    return lines.join("\n");
  };

  // Copy list handler
  const handleCopyList = async () => {
    const text = generateFormattedText();
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      toast.success("Grocery list copied! Ready to paste into WhatsApp or Blinkit.");
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  // Native share handler
  const handleShareList = async () => {
    const text = generateFormattedText();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `GrindLog Grocery List (${period === "weekly" ? "Weekly" : "Monthly"})`,
          text: text,
        });
        toast.success("List shared successfully!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          handleCopyList();
        }
      }
    } else {
      handleCopyList();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-36">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <Link
            href="/nutrition"
            prefetch={true}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
            title="Back to Meals"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          <div className="flex-1 text-center">
            <h1 className="text-xl font-black text-white uppercase tracking-tight flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#ADFF00]" />
              Smart Grocery
            </h1>
            <p className="text-[11px] font-semibold text-white/50 truncate">
              {dietType ? `${dietType} • ` : ""}{planGoal || "AI Nutrition Plan"}
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShareList}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
              title="Share / Copy List"
            >
              {isCopied ? <Check className="w-4 h-4 text-[#ADFF00]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95"
              title="Reset Checklist"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Weekly vs Monthly Period Toggle */}
        <div className="bg-[#121E12] border border-[#1A2619] p-1 rounded-2xl flex items-center gap-1 mb-4 shadow-lg">
          <button
            type="button"
            onClick={() => setPeriod("weekly")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 ${
              period === "weekly"
                ? "bg-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.3)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>Weekly Run</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              period === "weekly" ? "bg-black/20 text-black" : "bg-white/10 text-white/60"
            }`}>
              7-Day
            </span>
          </button>

          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-150 flex items-center justify-center gap-1.5 ${
              period === "monthly"
                ? "bg-[#ADFF00] text-black shadow-[0_0_15px_rgba(173,255,0,0.3)]"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <span>Monthly Stock</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
              period === "monthly" ? "bg-black/20 text-black" : "bg-white/10 text-white/60"
            }`}>
              30-Day
            </span>
          </button>
        </div>

        {/* Budget & Progress Overview Card */}
        <div className="bg-[#121E12] border border-[#1A2619] rounded-2xl p-4 mb-4 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                Shopping Progress
              </p>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-xl font-black text-white">
                  {purchasedCount} of {totalCount}
                </span>
                <span className="text-xs font-bold text-[#ADFF00]">
                  ({progressPercent}%)
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center justify-end gap-1">
                <Wallet className="w-3 h-3 text-[#ADFF00]" />
                Est. Total Cost
              </p>
              <div className="flex items-baseline justify-end gap-1.5 mt-0.5">
                <span className="text-xl font-black text-[#ADFF00]">
                  ₹{totalSpend}
                </span>
                {targetBudget > 0 && (
                  <span className="text-xs font-semibold text-white/40">
                    / ₹{targetBudget}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-[#ADFF00] to-emerald-400 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Quick budget status */}
          <div className="flex items-center justify-between text-[11px] text-white/60 pt-1 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#ADFF00]" />
              Calculated from your active meal servings
            </span>
            {targetBudget > 0 && totalSpend <= targetBudget ? (
              <span className="font-bold text-emerald-400">Within Budget</span>
            ) : targetBudget > 0 ? (
              <span className="font-bold text-amber-400">₹{totalSpend - targetBudget} over budget</span>
            ) : null}
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-2.5 mb-5">
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search paneer, eggs, oats..."
                className="w-full bg-[#121E12] border border-[#1A2619] rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none focus:border-[#ADFF00]/50 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Hide Purchased Toggle */}
            <button
              type="button"
              onClick={() => setHidePurchased(!hidePurchased)}
              className={`h-[38px] px-3 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all ${
                hidePurchased
                  ? "bg-[#ADFF00]/20 border-[#ADFF00]/40 text-[#ADFF00]"
                  : "bg-[#121E12] border-[#1A2619] text-white/50 hover:text-white hover:bg-white/5"
              }`}
              title={hidePurchased ? "Show all items" : "Hide purchased items"}
            >
              {hidePurchased ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span className="hidden sm:inline">Remaining</span>
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {GROCERY_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? "bg-[#ADFF00] text-black shadow-[0_0_10px_rgba(173,255,0,0.3)]"
                      : "bg-[#121E12] border border-[#1A2619] text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Grocery Items List */}
        {groupedItems.length > 0 ? (
          <div className="space-y-6">
            {groupedItems.map(([categoryName, categoryItems]) => (
              <div key={categoryName} className="space-y-2.5">
                {/* Category Header */}
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white/70 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#ADFF00]" />
                    {categoryName}
                  </h3>
                  <span className="text-[10px] font-bold text-white/40">
                    {categoryItems.filter((it) => it.purchased).length}/{categoryItems.length} checked
                  </span>
                </div>

                {/* Items in this category */}
                <div className="space-y-2">
                  {categoryItems.map((item) => (
                    <GroceryItemCard
                      key={item.id}
                      item={item}
                      period={period}
                      onToggle={handleToggle}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty Search / Filter State */
          <div className="p-8 text-center bg-[#121E12]/50 border border-[#1A2619] rounded-2xl">
            <ShoppingCart className="w-10 h-10 text-white/20 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-white mb-1">No items found</h3>
            <p className="text-xs text-white/40 mb-4 max-w-xs mx-auto">
              {searchQuery || hidePurchased || selectedCategory !== "All"
                ? "Try clearing your search query or filters to see all grocery items."
                : "No grocery items found in your active meal plan."}
            </p>
            {(searchQuery || hidePurchased || selectedCategory !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setHidePurchased(false);
                  setSelectedCategory("All");
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition-all"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}

        {/* Quick Action Bottom Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-3 bg-gradient-to-t from-[#0A1108] via-[#0A1108]/95 to-transparent pointer-events-none">
          <div className="max-w-md mx-auto flex items-center gap-2.5 pointer-events-auto">
            <button
              type="button"
              onClick={handleCopyList}
              className="flex-1 py-3 px-4 rounded-xl bg-[#ADFF00] hover:bg-[#b8ff1f] active:scale-[0.98] text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(173,255,0,0.3)] transition-all"
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  Copied to Clipboard!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 stroke-[2.5]" />
                  Copy for Blinkit / WhatsApp
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
