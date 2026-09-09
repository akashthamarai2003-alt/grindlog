import { redirect } from "next/navigation";
import Link from "next/link";
import { Utensils, ShoppingCart } from "lucide-react";
import { getCachedUser, createServerSupabase } from "@/lib/services/supabase/server";
import { parseBudget } from "@/lib/fitness/nutrition/constants";
import { calculateGroceryList } from "@/lib/fitness/nutrition/grocery-calculator";
import { generateDeterministicNutritionPlan } from "@/lib/fitness/nutrition/nutrition-engine";
import { GroceryView } from "@/components/fitness/grocery/grocery-view";
import { GroceryItemData, GroceryBudgetSummary } from "@/components/fitness/grocery/types";

export const metadata = {
  title: "Smart Grocery List | GrindLog",
  description: "AI-generated grocery shopping list scaled for weekly runs and monthly stocking.",
};

export default async function GroceryPage() {
  const { data: { user } } = await getCachedUser();

  if (!user) {
    redirect("/auth/signin?redirect=/grocery");
  }

  const supabase = await createServerSupabase();

  // Run all independent queries in parallel
  const [
    { data: activePlan },
    { data: profile },
    { data: dbGroceryItems }
  ] = await Promise.all([
    supabase
      .from("fitness_os_workout_plans")
      .select("id, name, goal, plan_data")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("fitness_grocery_items")
      .select("*")
      .eq("user_id", user.id)
      .order("category", { ascending: true })
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  const parsedBudget = parseBudget(profile?.nutrition_budget ?? null);
  const monthlyBudget = parsedBudget.max > 0 ? parsedBudget.max : 3500;
  const weeklyBudget = Math.round(monthlyBudget / 4);

  const budgetSummary: GroceryBudgetSummary = {
    monthlyBudget,
    weeklyBudget,
    tier: parsedBudget.tier,
  };

  const planNutrition = activePlan?.plan_data?.nutrition;
  const planGroceryList = planNutrition?.grocery_list || [];

  let itemsToRender: GroceryItemData[] = [];

  // Filter dbGroceryItems by activePlan if applicable
  const currentPlanDbItems = dbGroceryItems
    ? (activePlan?.id ? dbGroceryItems.filter((it: any) => it.plan_id === activePlan.id) : dbGroceryItems)
    : [];

  if (planGroceryList.length > 0) {
    // 1. Authoritative active hybrid plan grocery list (60% Math locked numbers + 40% AI kirana tips)
    itemsToRender = planGroceryList.map((planItem: any, idx: number) => {
      // Find matching DB item to preserve checkbox state
      const dbMatch = currentPlanDbItems.find(
        (db: any) => db.name?.toLowerCase() === planItem.name?.toLowerCase()
      );

      return {
        id: dbMatch?.id || `plan-item-${idx}`,
        name: planItem.name,
        monthlyQuantity: Number(planItem.monthly_quantity) || 1,
        unit: planItem.unit || "unit",
        estimatedPrice: Number(planItem.estimated_price) || 0,
        category: planItem.category || "General",
        isOptional: Boolean(planItem.is_optional),
        reason: planItem.reason || "",
        purchased: Boolean(dbMatch?.purchased),
        foodServingSize: planItem.food_serving_size,
        proteinGrams: planItem.protein_grams_per_serving,
        calories: planItem.calories_per_serving,
        carbsGrams: planItem.carbs_grams_per_serving,
        fatGrams: planItem.fat_grams_per_serving,
        usedInMeals: planItem.used_in_meals || (planItem.reason?.includes("used in") ? [planItem.reason.split("used in")[1].trim()] : undefined),
      };
    });

    // If DB items are out of sync with active plan, synchronize DB in background
    if (activePlan?.id) {
      const namesInDb = new Set(currentPlanDbItems.map((i: any) => i.name?.toLowerCase()));
      const namesInPlan = new Set(planGroceryList.map((i: any) => i.name?.toLowerCase()));
      const isOutOfSync = currentPlanDbItems.length !== planGroceryList.length ||
        planGroceryList.some((p: any) => !namesInDb.has(p.name?.toLowerCase())) ||
        currentPlanDbItems.some((d: any) => !namesInPlan.has(d.name?.toLowerCase()));

      if (isOutOfSync) {
        (async () => {
          try {
            await supabase.from("fitness_grocery_items").delete().eq("user_id", user.id).eq("plan_id", activePlan.id);
            await supabase.from("fitness_grocery_items").insert(
              planGroceryList.map((item: any) => ({
                user_id: user.id,
                plan_id: activePlan.id,
                name: item.name,
                monthly_quantity: Number(item.monthly_quantity) || 1,
                unit: item.unit || "unit",
                estimated_price: Number(item.estimated_price) || 0,
                category: item.category || "General",
                is_optional: Boolean(item.is_optional),
                reason: item.reason || "",
                purchased: Boolean(currentPlanDbItems.find((d: any) => d.name?.toLowerCase() === item.name?.toLowerCase())?.purchased),
              }))
            );
          } catch (syncErr: any) {
            console.warn("Background grocery auto-sync error:", syncErr);
          }
        })();
      }
    }
  } else if (currentPlanDbItems.length > 0) {
    // Map existing DB items if plan_data doesn't have grocery list
    itemsToRender = currentPlanDbItems.map((dbItem: any) => ({
      id: dbItem.id,
      name: dbItem.name,
      monthlyQuantity: Number(dbItem.monthly_quantity) || 1,
      unit: dbItem.unit || "unit",
      estimatedPrice: Number(dbItem.estimated_price) || 0,
      category: dbItem.category || "General",
      isOptional: Boolean(dbItem.is_optional),
      reason: dbItem.reason || "",
      purchased: Boolean(dbItem.purchased),
    }));
  } else if (planNutrition?.meals && activePlan?.id) {
    // Dynamic fallback: compute grocery list from active meals using grocery calculator
    try {
      const calculated = calculateGroceryList(
        planNutrition.meals,
        parsedBudget,
        profile?.food_environment || "Home"
      );

      if (calculated.length > 0) {
        itemsToRender = calculated.map((item: any, idx: number) => ({
          id: item.id || `calc-item-${idx}`,
          name: item.name,
          monthlyQuantity: Number(item.monthly_quantity ?? item.monthlyQuantity) || 1,
          unit: item.unit || "unit",
          estimatedPrice: Number(item.estimated_price ?? item.estimatedPrice) || 0,
          category: item.category || "General",
          isOptional: Boolean(item.is_optional ?? item.isOptional),
          reason: item.reason || "",
          purchased: false,
          proteinGrams: item.proteinPerServing,
          calories: item.caloriesPerServing,
          usedInMeals: item.usedInMeals,
        }));

        // Async seed DB
        supabase
          .from("fitness_grocery_items")
          .insert(calculated.map((item) => ({
            user_id: user.id,
            plan_id: activePlan.id,
            name: item.name,
            monthly_quantity: item.monthlyQuantity,
            unit: item.unit,
            estimated_price: item.estimatedPrice,
            category: item.category,
            is_optional: item.isOptional,
            reason: item.reason,
            purchased: false,
          })))
          .then(undefined, (err: any) => console.warn("Background grocery seed error:", err));
      }
    } catch (calcError) {
      console.warn("Dynamic grocery list calculation fallback error:", calcError);
    }
  } else if (profile) {
    // Dynamic fallback for onboarding-completed users who haven't generated a full plan yet
    try {
      const detPlan = await generateDeterministicNutritionPlan(profile as any, supabase);
      if (detPlan?.grocery && detPlan.grocery.length > 0) {
        itemsToRender = detPlan.grocery.map((item: any, idx: number) => ({
          id: `onboarding-grocery-${idx}`,
          name: item.name,
          monthlyQuantity: Number(item.monthlyQuantity) || 1,
          unit: item.unit || "unit",
          estimatedPrice: Number(item.estimatedPrice) || 0,
          category: item.category || "General",
          isOptional: Boolean(item.isOptional),
          reason: item.reason || "",
          purchased: false,
          proteinGrams: item.proteinPerServing,
          calories: item.caloriesPerServing,
        }));
      }
    } catch (onboardingErr) {
      console.warn("Onboarding deterministic grocery fallback error:", onboardingErr);
    }
  }

  // If no items found and no plan
  if (!activePlan || itemsToRender.length === 0) {
    return (
      <div className="min-h-screen bg-[#0A1108] text-white">
        <div className="w-full max-w-md mx-auto px-4 pt-12 pb-32 text-center">
          <div className="w-16 h-16 rounded-3xl bg-[#121E12] border border-[#1A2619] flex items-center justify-center text-[#ADFF00] mx-auto mb-4 shadow-xl">
            <ShoppingCart className="w-8 h-8" />
          </div>

          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-2">
            No Grocery Plan Found
          </h1>
          <p className="text-sm text-white/50 mb-6 leading-relaxed max-w-xs mx-auto">
            Your grocery shopping list is automatically generated when your AI Nutrition Plan is active.
          </p>

          <Link
            href="/nutrition"
            prefetch={true}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ADFF00] text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(173,255,0,0.3)] hover:bg-[#b8ff1f] transition-all"
          >
            <Utensils className="w-4 h-4" />
            View Meals & Nutrition
          </Link>
        </div>
      </div>
    );
  }

  return (
    <GroceryView
      initialItems={itemsToRender}
      budget={budgetSummary}
      planName={activePlan.name}
      planGoal={activePlan.goal}
      dietType={profile?.diet_preference || profile?.food_type || undefined}
      userId={user.id}
      planId={activePlan.id}
    />
  );
}
