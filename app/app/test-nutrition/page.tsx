import { NutritionView } from "@/components/fitness/nutrition/nutrition-view";
import { mockLiveUserNutritionData } from "./mock-data";
import Link from "next/link";
import { Utensils, ShoppingCart } from "lucide-react";

export const dynamic = "force-dynamic";

export default function TestNutritionPage() {
  return (
    <div className="min-h-screen bg-[#0A1108] text-white" data-testid="nutrition-root">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-32">
        {/* Nutrition Header */}
        <div className="w-full flex flex-col pt-2 pb-4">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1" data-testid="page-title">
            Your Meals
          </h1>
          
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm font-bold text-white/60">Seven consecutive days, starting when you generate</p>
            <div className="flex items-center gap-2">
              <Link
                href="/grocery"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#ADFF00]/15 active:scale-95 border border-white/10 hover:border-[#ADFF00]/30 rounded-full transition-all text-xs font-bold text-white/90 hover:text-[#ADFF00]"
                data-testid="grocery-link"
              >
                <ShoppingCart className="w-3.5 h-3.5 text-[#ADFF00]" />
                <span>Grocery List</span>
              </Link>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20" data-testid="pro-badge">
                <Utensils className="w-3.5 h-3.5 text-[#ADFF00]" />
                <span className="text-xs font-black text-[#ADFF00] tracking-widest uppercase">
                  7-Day Plan
                </span>
              </div>
            </div>
          </div>
        </div>

        <NutritionView initialData={mockLiveUserNutritionData} isPro={true} />
      </div>
    </div>
  );
}
