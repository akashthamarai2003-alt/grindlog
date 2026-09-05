import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { Utensils } from "lucide-react";
import { NutritionView } from "@/components/fitness/nutrition/nutrition-view";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { getCachedUser } from "@/lib/services/supabase/server";

export default async function NutritionIndexPage() {
  const today = new Date().toLocaleDateString("en-US", { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });

  const { data: { user } } = await getCachedUser();
  const initialData = user
    ? await NutritionService.getTodaySummaryAndDetails(user.id).catch((err) => {
        console.warn("Failed to prefetch today nutrition on server:", err?.message || err);
        return null;
      })
    : null;

  return (
    <FitnessGuard requirePro featureName="nutrition and food logging">
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-32">
          
          {/* Nutrition & Meals Header */}
          <div className="w-full flex flex-col pt-2 pb-4">
            <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
              Your Meals
            </h1>
            
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-bold text-white/60">
                {today}
              </p>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ADFF00]/10 rounded-full border border-[#ADFF00]/20">
                <Utensils className="w-3.5 h-3.5 text-[#ADFF00]" />
                <span className="text-xs font-black text-[#ADFF00] tracking-widest uppercase">7-Day Plan</span>
              </div>
            </div>
          </div>

          <NutritionView initialData={initialData} />

        </div>
      </div>
    </FitnessGuard>
  );
}
