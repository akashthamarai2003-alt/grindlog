import { redirect } from "next/navigation";
import Link from "next/link";
import { Utensils, ShoppingCart, ArrowLeft } from "lucide-react";
import { FitnessGuard } from "@/components/fitness/fitness-guard";
import { getCachedUser, createServerSupabase } from "@/lib/services/supabase/server";
import { parseBudget } from "@/lib/fitness/nutrition/constants";
import { calculateGroceryList } from "@/lib/fitness/nutrition/grocery-calculator";
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

  // 1. Fetch active workout plan (which holds nutrition plan_data)
  const { data: activePlan } = await supabase
    .from("fitness_os_workout_plans")
    .select("id, name, goal, plan_data")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2. Fetch fitness profile for budget & diet preferences
  const { data: profile } = await supabase
    .from("fitness_os_profiles")
    .select("nutrition_budget, diet_preference, food_type, food_environment, onboarding_completed")
    .eq("user_id", user.id)
    .maybeSingle();

  // 3. Fetch existing grocery items from DB table
  const { data: dbGroceryItems } = activePlan?.id
    ? await supabase
        .from("fitness_grocery_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("plan_id", activePlan.id)
        .order("category", { ascending: true })
    : { data: null };

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

  if (dbGroceryItems && dbGroceryItems.length > 0) {
    // Map existing DB items and enrich with macro info from plan_data
    itemsToRender = dbGroceryItems.map((dbItem) => {
      const matchInPlan = planGroceryList.find(
        (p: any) => p.name?.toLowerCase() === dbItem.name?.toLowerCase()
      );

      return {
        id: dbItem.id,
        name: dbItem.name,
        monthlyQuantity: Number(dbItem.monthly_quantity) || 1,
        unit: dbItem.unit || "unit",
        estimatedPrice: Number(dbItem.estimated_price) || 0,
        category: dbItem.category || "General",
        isOptional: Boolean(dbItem.is_optional),
        reason: dbItem.reason || matchInPlan?.reason || "",
        purchased: Boolean(dbItem.purchased),
        foodServingSize: matchInPlan?.food_serving_size,
        proteinGrams: matchInPlan?.protein_grams_per_serving,
        calories: matchInPlan?.calories_per_serving,
        carbsGrams: matchInPlan?.carbs_grams_per_serving,
        fatGrams: matchInPlan?.fat_grams_per_serving,
        usedInMeals: matchInPlan?.used_in_meals || (matchInPlan?.reason?.includes("used in") ? [matchInPlan.reason.split("used in")[1].trim()] : undefined),
      };
    });
  } else if (planGroceryList.length > 0 && activePlan?.id) {
    // DB table had no items yet, but plan_data has grocery items. Seed DB!
    const itemsToInsert = planGroceryList.map((item: any) => ({
      user_id: user.id,
      plan_id: activePlan.id,
      name: item.name,
      monthly_quantity: Number(item.monthly_quantity) || 1,
      unit: item.unit || "unit",
      estimated_price: Number(item.estimated_price) || 0,
      category: item.category || "General",
      is_optional: Boolean(item.is_optional),
      reason: item.reason || "",
      purchased: false,
    }));

    const { data: inserted } = await supabase
      .from("fitness_grocery_items")
      .insert(itemsToInsert)
      .select();

    if (inserted && inserted.length > 0) {
      itemsToRender = inserted.map((dbItem) => {
        const matchInPlan = planGroceryList.find(
          (p: any) => p.name?.toLowerCase() === dbItem.name?.toLowerCase()
        );
        return {
          id: dbItem.id,
          name: dbItem.name,
          monthlyQuantity: Number(dbItem.monthly_quantity) || 1,
          unit: dbItem.unit || "unit",
          estimatedPrice: Number(dbItem.estimated_price) || 0,
          category: dbItem.category || "General",
          isOptional: Boolean(dbItem.is_optional),
          reason: dbItem.reason || matchInPlan?.reason || "",
          purchased: false,
          foodServingSize: matchInPlan?.food_serving_size,
          proteinGrams: matchInPlan?.protein_grams_per_serving,
          calories: matchInPlan?.calories_per_serving,
          carbsGrams: matchInPlan?.carbs_grams_per_serving,
          fatGrams: matchInPlan?.fat_grams_per_serving,
        };
      });
    } else {
      // Fallback in-memory representation
      itemsToRender = planGroceryList.map((item: any, idx: number) => ({
        id: `plan-item-${idx}`,
        name: item.name,
        monthlyQuantity: Number(item.monthly_quantity) || 1,
        unit: item.unit || "unit",
        estimatedPrice: Number(item.estimated_price) || 0,
        category: item.category || "General",
        isOptional: Boolean(item.is_optional),
        reason: item.reason || "",
        purchased: false,
        foodServingSize: item.food_serving_size,
        proteinGrams: item.protein_grams_per_serving,
        calories: item.calories_per_serving,
        carbsGrams: item.carbs_grams_per_serving,
        fatGrams: item.fat_grams_per_serving,
      }));
    }
  } else if (planNutrition?.meals && activePlan?.id) {
    // Dynamic fallback: compute grocery list from active meals using grocery calculator
    try {
      const calculated = calculateGroceryList(
        planNutrition.meals,
        parsedBudget,
        profile?.food_environment || "Home"
      );

      if (calculated.length > 0) {
        const itemsToInsert = calculated.map((item) => ({
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
        }));

        const { data: inserted } = await supabase
          .from("fitness_grocery_items")
          .insert(itemsToInsert)
          .select();

        itemsToRender = (inserted || calculated).map((item: any, idx: number) => ({
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
      }
    } catch (calcError) {
      console.warn("Dynamic grocery list calculation fallback error:", calcError);
    }
  }

  // If no items found and no plan
  if (!activePlan || itemsToRender.length === 0) {
    return (
      <FitnessGuard featureName="smart grocery list">
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
      </FitnessGuard>
    );
  }

  return (
    <FitnessGuard featureName="smart grocery list">
      <GroceryView
        initialItems={itemsToRender}
        budget={budgetSummary}
        planName={activePlan.name}
        planGoal={activePlan.goal}
        dietType={profile?.diet_preference || profile?.food_type || undefined}
        userId={user.id}
        planId={activePlan.id}
      />
    </FitnessGuard>
  );
}
