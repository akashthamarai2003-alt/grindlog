import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Utensils, ShoppingCart } from "lucide-react";
import { NutritionView } from "@/components/fitness/nutrition/nutrition-view";
import { V2NutritionView } from "@/components/fitness/nutrition/v2-nutrition-view";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { V2PlanService } from "@/lib/services/nutrition/v2-plan-service";
import { getV2NutritionDay } from "@/lib/services/nutrition/v2-ui-data";
import { getCachedUser } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessPlan } from "@/lib/fitness/subscription/access";
import NutritionLoading from "./loading";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function NutritionContent() {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/nutrition");
  }

  const admin = createAdminClient();

  // Keep the validated V2 experience scoped to the existing profile flag.
  const [
    { data: profile },
    plan,
  ] = await Promise.all([
    admin
      .from("fitness_os_profiles")
      .select("onboarding_completed,nutrition_engine_v2")
      .eq("user_id", user.id)
      .maybeSingle(),
    getFitnessPlan(user.id),
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const isPro = plan?.id === "pro";

  if (V2PlanService.isNutritionV2Enabled(user.id, profile)) {
    const initialData = await getV2NutritionDay(user.id).catch((err) => {
      console.warn("Failed to prefetch V2 nutrition:", err?.message || err);
      return null;
    });
    return (
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="mx-auto w-full max-w-5xl px-4 pb-32 pt-6 sm:px-6 sm:pt-10">
          <V2NutritionView initialData={initialData} isPro={isPro} />
        </div>
      </div>
    );
  }

  const initialData = await NutritionService.getTodaySummaryAndDetails(user.id).catch((err) => {
    console.warn("Failed to prefetch today nutrition on server:", err?.message || err);
    return null;
  });

  return (
    <div className="min-h-screen bg-[#0A1108] text-white">
      <div className="w-full max-w-md mx-auto px-3.5 sm:px-5 pt-6 sm:pt-8 pb-32">
        {/* Nutrition & Meals Header */}
        <div className="w-full flex flex-col pt-2 pb-4">
          <h1 className="text-3xl font-black text-white uppercase tracking-tight mb-1">
            Your Meals
          </h1>
          
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <p className="text-sm font-bold text-white/60">Seven consecutive days, starting when you generate</p>
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
                  {isPro ? "7-Day Plan" : "Pro Preview"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <NutritionView initialData={initialData} isPro={isPro} />
      </div>
    </div>
  );
}

export default function NutritionIndexPage() {
  return (
    <Suspense fallback={<NutritionLoading />}>
      <NutritionContent />
    </Suspense>
  );
}
