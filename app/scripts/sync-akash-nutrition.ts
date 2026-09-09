import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { generateDeterministicNutritionPlan, convertToAIPlanFormat } from '../lib/fitness/nutrition/nutrition-engine';
import { mergeHybridNutrition } from '../lib/fitness/nutrition/hybrid-merger';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

async function syncAkash() {
  const userId = '679816b6-7388-47f7-a4ca-fea5dbf3d879';
  console.log('Syncing active plan nutrition for Akash...');

  // 1. Fetch profile
  const { data: profile, error: profileErr } = await supabase
    .from('fitness_os_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (profileErr || !profile) {
    throw new Error(`Profile not found: ${profileErr?.message}`);
  }

  // 2. Fetch active plan
  const { data: activePlan, error: planErr } = await supabase
    .from('fitness_os_workout_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (planErr || !activePlan) {
    throw new Error(`Active plan not found: ${planErr?.message}`);
  }

  // 3. Generate 60% Math Ground Truth
  const detPlan = await generateDeterministicNutritionPlan(profile, supabase);
  const detAI = convertToAIPlanFormat(detPlan);

  // 4. Form 40% AI culinary & coaching layer
  const culinaryAI = {
    daily_calories: detAI.daily_calories,
    protein_grams: detAI.protein_grams,
    carbs_grams: detAI.carbs_grams,
    fat_grams: detAI.fat_grams,
    meals_per_day: 3,
    guidance: "Akash, your high-protein eggetarian plan is engineered specifically for your PG lifestyle. By pairing your mess meals with kettle-boiled eggs, quick-soaked soya chunks, and refreshing curd bowls, you will hit your 170g protein target cleanly without spending over ₹2,000.",
    meals: [
      {
        meal_name: "High-Protein Mess Breakfast (Boiled Egg Chaat)",
        time_of_day: detAI.meals[0]?.time_of_day || "7:30 AM",
        items: [
          "PG-provided core breakfast (Poha / Upma / Idli)",
          "3x Boiled Eggs (Whole) sliced with chaat masala & black pepper"
        ],
        total_calories: detAI.meals[0]?.total_calories,
        protein_grams: detAI.meals[0]?.protein_grams,
        prep_instructions: "Boil 3 eggs in your electric kettle for 9 minutes while getting ready. Peel, slice, and sprinkle chaat masala. Eat alongside your regular mess breakfast."
      },
      {
        meal_name: "Mess Lunch with Soya Chunks Protein Stir-In",
        time_of_day: detAI.meals[1]?.time_of_day || "1:00 PM",
        items: [
          "PG-provided core lunch (Rice, Dal, Sabzi & Roti)",
          "1 serving (50g dry) Soya Chunks tossed into mess curry"
        ],
        total_calories: detAI.meals[1]?.total_calories,
        protein_grams: detAI.meals[1]?.protein_grams,
        prep_instructions: "Soak 50g soya chunks in hot water from your kettle for 8 mins. Squeeze out excess water twice, then fold them directly into your mess dal or sabzi for an instant 26g protein boost."
      },
      {
        meal_name: "Mess Dinner with Probiotic Dahi Bowl",
        time_of_day: detAI.meals[2]?.time_of_day || "8:30 PM",
        items: [
          "PG-provided core dinner (Roti, Sabzi & Dal)",
          "1 bowl (150g) Low Fat Curd / Dahi with roasted jeera powder"
        ],
        total_calories: detAI.meals[2]?.total_calories,
        protein_grams: detAI.meals[2]?.protein_grams,
        prep_instructions: "Keep 150g curd cool in your room. Add a pinch of roasted cumin (jeera) and black salt for digestive aid and smooth muscle recovery before bed."
      }
    ],
    grocery_list: detAI.grocery_list.map(g => {
      let hack = "";
      if (g.name.toLowerCase().includes("egg")) {
        hack = "Primary morning protein anchor. Pro tip: Buy a 30-egg tray from a wholesale egg depot for ~₹180 instead of buying individual eggs.";
      } else if (g.name.toLowerCase().includes("soya")) {
        hack = "Cost-effective 26g protein punch for lunch. Pick Fortune or Nutrela 200g packs for the best value.";
      } else if (g.name.toLowerCase().includes("curd") || g.name.toLowerCase().includes("dahi")) {
        hack = "Evening digestive protein and gut health. Buy 400g/500g tubs from Mother Dairy or Amul.";
      }
      return {
        ...g,
        reason: hack ? `${g.reason} (Tip: ${hack})` : g.reason
      };
    })
  };

  const hybridNutrition = mergeHybridNutrition(culinaryAI, detAI);

  // 5. Update fitness_os_workout_plans
  const updatedPlanData = {
    ...activePlan.plan_data,
    nutrition: hybridNutrition
  };

  const { error: updatePlanErr } = await supabase
    .from('fitness_os_workout_plans')
    .update({ plan_data: updatedPlanData })
    .eq('id', activePlan.id);

  if (updatePlanErr) {
    throw new Error(`Failed to update plan_data: ${updatePlanErr.message}`);
  }
  console.log('✅ Updated fitness_os_workout_plans plan_data successfully!');

  // 6. Update fitness_os_nutrition_plans
  const { data: existingNutritionRow } = await supabase
    .from('fitness_os_nutrition_plans')
    .select('id')
    .eq('plan_id', activePlan.id)
    .maybeSingle();

  const nutritionSummary = {
    plan_id: activePlan.id,
    user_id: userId,
    daily_calories: hybridNutrition.daily_calories,
    protein_grams: hybridNutrition.protein_grams,
    meals_per_day: hybridNutrition.meals_per_day,
    guidance: hybridNutrition.guidance
  };

  if (existingNutritionRow) {
    await supabase.from('fitness_os_nutrition_plans').update(nutritionSummary).eq('id', existingNutritionRow.id);
  } else {
    await supabase.from('fitness_os_nutrition_plans').insert(nutritionSummary);
  }
  console.log('✅ Updated fitness_os_nutrition_plans successfully!');

  // 7. Sync fitness_grocery_items
  await supabase.from('fitness_grocery_items').delete().eq('user_id', userId);

  const groceryRows = hybridNutrition.grocery_list.map(g => ({
    user_id: userId,
    plan_id: activePlan.id,
    name: g.name,
    monthly_quantity: g.monthly_quantity,
    unit: g.unit,
    estimated_price: g.estimated_price,
    category: g.category,
    is_optional: g.is_optional,
    reason: g.reason,
    purchased: false
  }));

  const { error: groceryInsertErr } = await supabase
    .from('fitness_grocery_items')
    .insert(groceryRows);

  if (groceryInsertErr) {
    throw new Error(`Failed to insert grocery items: ${groceryInsertErr.message}`);
  }
  console.log('✅ Updated fitness_grocery_items successfully!');

  console.log('\n=== SYNC COMPLETE ===');
  console.log('Meals synced:');
  for (const m of hybridNutrition.meals) {
    console.log(`- ${m.meal_name} (${m.total_calories} kcal, ${m.protein_grams}g P)`);
  }
  console.log('\nGrocery synced:');
  for (const g of hybridNutrition.grocery_list) {
    console.log(`- ${g.name}: ${g.monthly_quantity} ${g.unit} (₹${g.estimated_price})`);
  }
  const totalCost = hybridNutrition.grocery_list.reduce((s, g) => s + g.estimated_price, 0);
  console.log(`Total Grocery: ₹${totalCost}`);

  console.log('\n=== VERIFYING UNIVERSAL PROFILES ===');
  const baseProfile = {
    age: 24,
    gender: 'male',
    height_cm: 175,
    weight_kg: 70,
    target_weight_kg: 70,
    activity_level: 'moderate',
    workout_goal: 'muscle_gain',
    onboarding_completed: true,
  };

  const testCases = [
    { label: '1. VEGETARIAN (HOME COOKING)', food_type: 'vegetarian', food_environment: 'Home', nutrition_budget: '₹2,000–5,000' },
    { label: '2. VEGAN (PG / HOSTEL)', food_type: 'vegan', food_environment: 'PG', nutrition_budget: '₹1,000–2,000' },
    { label: '3. NON-VEGETARIAN (PG / HOSTEL)', food_type: 'non_vegetarian', food_environment: 'PG', nutrition_budget: '₹2,000–5,000' },
  ];

  for (const tc of testCases) {
    console.log(`\n--- ${tc.label} ---`);
    const p = { ...baseProfile, ...tc };
    const det = await generateDeterministicNutritionPlan(p as any, supabase);
    const ai = convertToAIPlanFormat(det);

    console.log(`Target: ${ai.daily_calories} kcal | ${ai.protein_grams}g Protein | ${ai.carbs_grams}g C | ${ai.fat_grams}g F`);
    console.log(`Meals:`);
    for (const m of ai.meals) {
      console.log(`  • ${m.meal_name} (${m.total_calories} kcal, ${m.protein_grams}g P): ${m.items.join(' + ')}`);
    }
    console.log(`Grocery (${ai.grocery_list.length} items):`);
    let tcTotal = 0;
    for (const g of ai.grocery_list) {
      console.log(`  • ${g.name}: ${g.monthly_quantity} ${g.unit} (₹${g.estimated_price}) [${g.category}]`);
      tcTotal += g.estimated_price;
    }
    console.log(`Total Grocery: ₹${tcTotal} (Budget tier: ${tc.nutrition_budget})`);
  }
}

syncAkash().catch(console.error);
