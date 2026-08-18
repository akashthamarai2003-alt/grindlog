import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { NutritionView } from "@/components/fitness/nutrition/nutrition-view";

export default function NutritionIndexPage() {
  const today = new Date().toLocaleDateString("en-US", { 
    weekday: 'short', month: 'short', day: 'numeric' 
  });

  return (
    <FitnessGuard requirePro={true}>
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-5 pt-8 pb-32">
          
          {/* Nutrition header */}
          <div className="flex items-center justify-between mb-6">
            <Link href="/fitness" className="w-10 h-10 flex items-center justify-center rounded-full bg-[#111A10] border border-white/5 text-white/70 hover:text-white hover:bg-white/5 transition-all">
              <ChevronLeft size={20} />
            </Link>
            
            <div className="text-center">
              <h1 className="text-base font-black tracking-widest text-white uppercase">Nutrition</h1>
              <p className="text-[11px] font-bold text-[#ADFF00] tracking-widest uppercase mt-1">{today}</p>
            </div>
            
            <div className="w-10 h-10" />
          </div>

          <NutritionView />

        </div>
      </div>
    </FitnessGuard>
  );
}
