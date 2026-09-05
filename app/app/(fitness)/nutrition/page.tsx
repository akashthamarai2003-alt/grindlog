import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
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
          
          {/* Nutrition header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/" prefetch={true} className="w-10 h-10 flex items-center justify-center rounded-full bg-[#111A10] border border-white/5 text-white/70 hover:text-white hover:bg-white/5 transition-all">
              <ChevronLeft size={20} />
            </Link>
            
            <div className="text-center">
              <h1 className="text-base font-black tracking-widest text-white uppercase">Nutrition</h1>
              <p className="text-[11px] font-bold text-[#ADFF00] tracking-widest uppercase mt-1">{today}</p>
            </div>
            
            <div className="w-10 h-10" />
          </div>

          <NutritionView initialData={initialData} />

        </div>
      </div>
    </FitnessGuard>
  );
}
