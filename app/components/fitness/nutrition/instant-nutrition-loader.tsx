"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, Utensils } from "lucide-react";
import { NutritionView } from "./nutrition-view";
import { NutritionSkeleton } from "./nutrition-skeleton";

export function InstantNutritionLoader() {
  const [snapshot, setSnapshot] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem("grindlog_nutrition_snapshot_v1");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && (parsed.targets || parsed.meals)) {
            setSnapshot(parsed);
          }
        }
      } catch {
        // ignore
      }
    }
  }, []);

  if (snapshot) {
    const today = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }).format(new Date());

    return (
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="fixed top-0 left-0 right-0 h-[2px] z-[9999] overflow-hidden bg-black/40 pointer-events-none">
          <div className="h-full bg-gradient-to-r from-[#ADFF00] via-[#c4ff33] to-[#ADFF00] shadow-[0_0_10px_#ADFF00] animate-pulse w-full" />
        </div>
        <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-32">
          {/* Nutrition & Meals Header */}
          <div className="w-full flex flex-col pt-2 pb-4">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
              Your Meals
            </h1>
            
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <p suppressHydrationWarning className="text-sm font-bold text-white/60">
                {today}
              </p>
              <div className="flex items-center gap-2">
                <Link
                  href="/grocery"
                  prefetch={true}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#ADFF00]/15 active:scale-95 border border-white/10 hover:border-[#ADFF00]/30 rounded-full transition-all text-xs font-bold text-white/90 hover:text-[#ADFF00]"
                >
                  <ShoppingCart className="w-3.5 h-3.5 text-[#ADFF00]" />
                  <span>Grocery List</span>
                </Link>
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20">
                  <Utensils className="w-3.5 h-3.5 text-[#ADFF00]" />
                  <span className="text-xs font-black text-[#ADFF00] tracking-widest uppercase">
                    7-Day Plan
                  </span>
                </div>
              </div>
            </div>
          </div>

          <NutritionView initialData={snapshot} isPro={true} />
        </div>
      </div>
    );
  }

  return <NutritionSkeleton />;
}
