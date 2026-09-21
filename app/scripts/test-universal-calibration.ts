import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

import { NutritionService, isStapleCoreFood, getRealisticFoodCost, calibrateMealsToTargets } from '../lib/services/nutrition/nutrition-service';
import { calculateTargets } from '../lib/fitness/nutrition/nutrition-engine';

export function calibratedUniversalMeals(
  meals: any[],
  targets: { calories: number; protein?: number; carbs?: number; fat?: number },
  profile: any,
  foodCatalog: any[] = []
): any[] {
  if (!meals || !Array.isArray(meals) || meals.length === 0 || !targets) return meals;

  const targetCals = Math.round(Number(targets.calories) || 2000);
  const targetPro = Math.round(Number((targets as any).protein_g ?? targets.protein ?? 120));
  const targetCarbs = Math.round(Number((targets as any).carbs_g ?? targets.carbs ?? 200));
  const targetFat = Math.round(Number((targets as any).fat_g ?? targets.fat ?? 50));

  // 1. Daily Budget Cap based on Onboarding Tier
  const budgetStr = String(profile?.nutrition_budget || '₹1,000–2,000');
  let dailyBudgetCap = 75;
  if (budgetStr.includes('0–1,000') || budgetStr.includes('0-1,000')) dailyBudgetCap = 40;
  else if (budgetStr.includes('1,000–2,000') || budgetStr.includes('1,000-2,000')) dailyBudgetCap = 75;
  else if (budgetStr.includes('2,000–5,000') || budgetStr.includes('2,000-5,000')) dailyBudgetCap = 200;
  else if (budgetStr.includes('5,000')) dailyBudgetCap = 300;

  // Diet preference flags
  const dietStr = `${profile?.diet_preference || ''} ${profile?.food_type || ''}`.toLowerCase().trim() || 'balanced';
  const isVegan = dietStr.includes('vegan');
  const isNonVeg = !isVegan && (dietStr.includes('non') || dietStr.includes('meat') || dietStr.includes('chicken') || dietStr.includes('fish'));
  const isEggetarian = !isVegan && !isNonVeg && (dietStr.includes('egg') || dietStr.includes('eggetarian'));
  const isVegetarian = !isVegan && !isNonVeg && !isEggetarian;

  const mealsPerDay = profile?.meals_per_day || (meals.length === 3 ? '3 meals' : (meals.length === 2 ? '2 meals' : (meals.length >= 5 ? '5+ meals' : '4 meals')));
  const slotRatios: Record<string, number> = {
    breakfast: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.20 : (mealsPerDay === '2 meals' ? 0.0 : 0.25)),
    lunch: mealsPerDay === '3 meals' ? 0.40 : (mealsPerDay === '5+ meals' ? 0.28 : (mealsPerDay === '2 meals' ? 0.50 : 0.35)),
    pre_workout: 0.12,
    snack: 0.12,
    post_workout: 0.13,
    dinner: mealsPerDay === '3 meals' ? 0.30 : (mealsPerDay === '5+ meals' ? 0.27 : (mealsPerDay === '2 meals' ? 0.50 : 0.28)),
  };

  const getItemInfo = (it: any) => {
    const fName = String(it.foods?.name || it.name || '').trim();
    let q = Number(it.quantity) || 1;
    let unitCals = Number(it.foods?.calories ?? it.calories ?? 0);
    let unitPro = Number(it.foods?.protein ?? it.protein ?? 0);
    let unitCarbs = Number(it.foods?.carbs ?? it.carbs ?? 0);
    let unitFat = Number(it.foods?.fat ?? it.fat ?? 0);
    let unitCost = Number(it.foods?.estimated_cost ?? it.estimated_cost ?? 0);

    // If unitCals was already multiplied by quantity in raw items:
    if (!it.foods && q > 1 && unitCals > 0) {
      unitCals = Math.round(unitCals / q);
      unitPro = Number((unitPro / q).toFixed(1));
      unitCarbs = Number((unitCarbs / q).toFixed(1));
      unitFat = Number((unitFat / q).toFixed(1));
      unitCost = Math.round(unitCost / q);
    }

    const isCore = it.is_core ?? isStapleCoreFood(fName, profile?.food_environment);
    const realisticCost = isCore ? 0 : getRealisticFoodCost(fName, unitCost);

    return { fName, q, unitCals, unitPro, unitCarbs, unitFat, unitCost: realisticCost, isCore };
  };

  const getTotals = (currMeals: any[]) => {
    let cal = 0, pro = 0, carb = 0, fat = 0, cost = 0;
    currMeals.forEach((m: any) => {
      (m.meal_plan_items || m.items || []).forEach((it: any) => {
        const info = getItemInfo(it);
        const q = Number(it.quantity) || 1;
        cal += Math.round(info.unitCals * q);
        pro += Number((info.unitPro * q).toFixed(1));
        carb += Number((info.unitCarbs * q).toFixed(1));
        fat += Number((info.unitFat * q).toFixed(1));
        cost += info.isCore ? 0 : Math.round(info.unitCost * q);
      });
    });
    return {
      cal: Math.round(cal),
      pro: Number(pro.toFixed(1)),
      carb: Number(carb.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      cost: Math.round(cost)
    };
  };

  // STAGE 1: SLOT-LEVEL INITIAL BALANCING
  let calibratedMeals = meals.map((m: any) => {
    const mType = (m.meal_type || 'lunch').toLowerCase();
    const slotFraction = slotRatios[mType] ?? (1 / meals.length);
    const mealTargetCals = Math.round(targetCals * slotFraction);

    const rawItems = m.meal_plan_items || m.items || [];
    if (rawItems.length === 0) return m;

    const currentMealCals = rawItems.reduce((sum: number, it: any) => {
      const info = getItemInfo(it);
      return sum + info.unitCals * info.q;
    }, 0);

    const mealScale = currentMealCals > 0 ? (mealTargetCals / currentMealCals) : 1;

    const calibratedItems = rawItems.map((it: any) => {
      const info = getItemInfo(it);
      const lowerName = info.fName.toLowerCase();
      let q = info.q;

      // Intelligent portioning based on scale & slot target
      if (lowerName.includes('egg') && !lowerName.includes('white') && !lowerName.includes('curry')) {
        if (mealTargetCals <= 400 || mealScale < 0.75) q = 1;
        else q = 2; // Cap whole eggs at 2 per meal
      } else if (lowerName.includes('rice') || lowerName.includes('chawal')) {
        if (mealScale < 0.7) q = 0.8;
        else if (mealScale < 0.9) q = 1.0;
        else if (mealScale > 1.3) q = 1.6;
        else q = 1.2;
      } else if (lowerName.includes('roti') || lowerName.includes('chapati') || lowerName.includes('phulka')) {
        if (mealScale < 0.65) q = 1;
        else if (mealScale < 0.9) q = 2;
        else if (mealScale > 1.35) q = 3;
        else q = 2;
      } else if (lowerName.includes('banana') || lowerName.includes('apple')) {
        if (mealScale < 0.65 || targetCals < 1500) q = 0.5;
        else q = 1;
      } else if (lowerName.includes('peanut')) {
        if (mealScale < 0.8 || targetFat < 50) q = 0.5;
        else q = 0.8;
      } else if (lowerName.includes('soya chunk') || lowerName.includes('soy chunk')) {
        q = Math.min(1.5, Math.max(0.6, Number((q * mealScale).toFixed(1))));
      } else if (lowerName.includes('paneer')) {
        if (dailyBudgetCap <= 75 || targetFat <= 50 || mealScale < 0.8) q = 0.5;
        else if (mealScale > 1.2) q = 1.0;
        else q = 0.7;
      } else if (lowerName.includes('chicken breast') || lowerName.includes('chicken')) {
        q = Number(Math.min(2.0, Math.max(0.8, q * mealScale)).toFixed(1));
      } else {
        const rawScaled = q * mealScale;
        q = Math.max(0.4, Math.min(2.0, Number(rawScaled.toFixed(1))));
      }

      return {
        ...it,
        quantity: q,
        is_core: info.isCore,
        calories: Math.round(info.unitCals * q),
        protein: Number((info.unitPro * q).toFixed(1)),
        carbs: Number((info.unitCarbs * q).toFixed(1)),
        fat: Number((info.unitFat * q).toFixed(1)),
        estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
        foods: it.foods ? { ...it.foods, calories: info.unitCals, protein: info.unitPro, carbs: info.unitCarbs, fat: info.unitFat, estimated_cost: info.unitCost } : undefined
      };
    });

    return { ...m, meal_plan_items: calibratedItems, items: calibratedItems };
  });

  // STAGE 2: PROTEIN CALIBRATION (Target +/- 6g)
  let totals = getTotals(calibratedMeals);
  let proGap = targetPro - totals.pro;

  if (profile.goal === 'Cut' && dietStr.includes('non')) {
    console.log(`[DEBUG AKASH] Initial targets: ${targetCals} kcal, ${targetPro}g P, ${targetFat}g F`);
    console.log(`[DEBUG AKASH] Stage 1 totals:`, totals);
    console.log(`[DEBUG AKASH] proGap entering Stage 2:`, proGap);
  }

  if (proGap > 6) {
    // 2A. Scale existing lean protein sources in lunch & dinner
    calibratedMeals = calibratedMeals.map((m: any) => {
      const items = (m.meal_plan_items || m.items || []).map((it: any) => {
        const info = getItemInfo(it);
        const lower = info.fName.toLowerCase();
        let q = Number(it.quantity) || 1;

        if (lower.includes('chicken breast') || (lower.includes('chicken') && !lower.includes('biryani'))) {
          const needed = Math.min(1.2, Math.max(0, proGap / 31));
          q = Number((q + needed).toFixed(1));
          proGap -= needed * 31;
        } else if (lower.includes('soya chunk') || lower.includes('soy chunk')) {
          const needed = Math.min(0.8, Math.max(0, proGap / 45));
          q = Number((q + needed).toFixed(1));
          proGap -= needed * 45;
        } else if (lower.includes('egg white')) {
          const needed = Math.min(5, Math.round(proGap / 3.6));
          q = q + needed;
          proGap -= needed * 3.6;
        }

        return {
          ...it,
          quantity: q,
          calories: Math.round(info.unitCals * q),
          protein: Number((info.unitPro * q).toFixed(1)),
          carbs: Number((info.unitCarbs * q).toFixed(1)),
          fat: Number((info.unitFat * q).toFixed(1)),
          estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
        };
      });
      return { ...m, meal_plan_items: items, items };
    });

    // 2B. If still short by > 8g, inject lean protein into lunch AND/OR dinner
    totals = getTotals(calibratedMeals);
    proGap = targetPro - totals.pro;

    if (proGap > 8) {
      // Find candidate meals to inject protein (Lunch and Dinner)
      const candidateSlots = ['dinner', 'lunch'];
      for (const slot of candidateSlots) {
        if (proGap <= 6) break;
        const targetMealIdx = calibratedMeals.findIndex(m => (m.meal_type || '').toLowerCase() === slot);
        if (targetMealIdx === -1) continue;

        const targetMeal = calibratedMeals[targetMealIdx];
        let addOnFood: any = null;
        let addOnQty = 1;

        if (isNonVeg) {
          addOnFood = {
            id: 'chicken-breast-addon',
            name: 'Chicken Breast (Cooked)',
            category: 'Non-Vegetarian',
            serving_size: '100g',
            calories: 165,
            protein: 31,
            carbs: 0,
            fat: 3.6,
            estimated_cost: 45,
          };
          addOnQty = Number(Math.max(0.5, Math.min(1.2, proGap / 31)).toFixed(1));
          proGap -= addOnQty * 31;
        } else if (isEggetarian) {
          addOnFood = {
            id: 'egg-white-addon',
            name: 'Boiled Egg White',
            category: 'Protein',
            serving_size: '1 large (33g)',
            calories: 17,
            protein: 3.6,
            carbs: 0.2,
            fat: 0.1,
            estimated_cost: 6,
          };
          addOnQty = Math.max(2, Math.min(5, Math.round(proGap / 3.6)));
          proGap -= addOnQty * 3.6;
        } else {
          // Vegetarian & Vegan: Soy Chunks
          addOnFood = {
            id: 'soya-chunks-addon',
            name: 'Soy Chunks (Cooked)',
            category: 'Protein',
            serving_size: '1 bowl (100g)',
            calories: 345,
            protein: 52,
            carbs: 33,
            fat: 0.5,
            estimated_cost: 20,
          };
          addOnQty = Number(Math.max(0.4, Math.min(0.8, proGap / 52)).toFixed(1));
          proGap -= addOnQty * 52;
        }

        const isCore = isStapleCoreFood(addOnFood.name, profile?.food_environment);
        const unitCost = isCore ? 0 : getRealisticFoodCost(addOnFood.name, addOnFood.estimated_cost);

        const newItems = [
          ...(targetMeal.meal_plan_items || []),
          {
            food_id: addOnFood.id,
            quantity: addOnQty,
            is_core: isCore,
            calories: Math.round(addOnFood.calories * addOnQty),
            protein: Number((addOnFood.protein * addOnQty).toFixed(1)),
            carbs: Number((addOnFood.carbs * addOnQty).toFixed(1)),
            fat: Number((addOnFood.fat * addOnQty).toFixed(1)),
            estimated_cost: Math.round(unitCost * addOnQty),
            foods: addOnFood,
          }
        ];

        // If cutting or low fat, trim full fat paneer when soya is added to prevent calorie & fat surplus
        if (targetFat <= 50) {
          (targetMeal.meal_plan_items || []).forEach((it: any) => {
            if ((it.foods?.name || it.name || '').toLowerCase().includes('paneer')) {
              it.quantity = Math.max(0.2, Number((it.quantity * 0.4).toFixed(1)));
              const pInfo = getItemInfo(it);
              it.calories = Math.round(pInfo.unitCals * it.quantity);
              it.protein = Number((pInfo.unitPro * it.quantity).toFixed(1));
              it.carbs = Number((pInfo.unitCarbs * it.quantity).toFixed(1));
              it.fat = Number((pInfo.unitFat * it.quantity).toFixed(1));
              it.estimated_cost = pInfo.isCore ? 0 : Math.round(pInfo.unitCost * it.quantity);
            }
          });
        }

        calibratedMeals[targetMealIdx] = {
          ...targetMeal,
          meal_plan_items: newItems,
          items: newItems
        };
      }
    }
  } else if (proGap < -8) {
    // 2C. Scale down excessive protein anchors evenly across all meals
    let anchorItems: any[] = [];
    calibratedMeals.forEach(m => {
      (m.meal_plan_items || []).forEach((it: any) => {
        const lower = (it.foods?.name || it.name || '').toLowerCase();
        if (lower.includes('chicken') || lower.includes('soya') || lower.includes('soy chunk') || lower.includes('paneer') || lower.includes('egg white')) {
          anchorItems.push(it);
        }
      });
    });

    if (anchorItems.length > 0) {
      const proExcess = totals.pro - targetPro;
      const trimPerAnchor = proExcess / anchorItems.length;

      calibratedMeals = calibratedMeals.map((m: any) => {
        const items = (m.meal_plan_items || []).map((it: any) => {
          const info = getItemInfo(it);
          const lower = info.fName.toLowerCase();
          let q = Number(it.quantity) || 1;
          if (lower.includes('chicken') || lower.includes('soya') || lower.includes('soy chunk') || lower.includes('paneer') || lower.includes('egg white')) {
            const deltaQ = info.unitPro > 0 ? (trimPerAnchor / info.unitPro) : 0;
            q = Number(Math.max(0.25, q - deltaQ).toFixed(1));
          }
          return {
            ...it,
            quantity: q,
            calories: Math.round(info.unitCals * q),
            protein: Number((info.unitPro * q).toFixed(1)),
            carbs: Number((info.unitCarbs * q).toFixed(1)),
            fat: Number((info.unitFat * q).toFixed(1)),
            estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
          };
        });
        return { ...m, meal_plan_items: items, items };
      });
    }
  }

  if (profile.goal === 'Cut' && dietStr.includes('non')) {
    console.log(`[DEBUG AKASH] Post-Stage 2 totals:`, getTotals(calibratedMeals));
  }

  // STAGE 3: STRICT FAT CAP ENFORCEMENT (totalFat <= targetFat + 3g)
  totals = getTotals(calibratedMeals);
  let fatOverage = totals.fat - targetFat;

  if (fatOverage > 2) {
    // 3A. Check whole eggs across entire day - cap at 2 whole eggs total
    let totalWholeEggs = 0;
    calibratedMeals.forEach(m => {
      (m.meal_plan_items || []).forEach((it: any) => {
        const fName = (it.foods?.name || it.name || '').toLowerCase();
        if (fName.includes('egg') && !fName.includes('white') && !fName.includes('curry')) {
          totalWholeEggs += Number(it.quantity) || 0;
        }
      });
    });

    if (totalWholeEggs > 2) {
      let eggsToTrim = totalWholeEggs - 2;
      calibratedMeals = calibratedMeals.map(m => {
        const items = (m.meal_plan_items || []).map((it: any) => {
          const fName = (it.foods?.name || it.name || '').toLowerCase();
          if (fName.includes('egg') && !fName.includes('white') && !fName.includes('curry') && eggsToTrim > 0) {
            const currentQ = Number(it.quantity) || 1;
            const reduction = Math.min(eggsToTrim, Math.max(1, currentQ - 1));
            eggsToTrim -= reduction;
            const newQ = Math.max(1, currentQ - reduction);
            const info = getItemInfo(it);
            return {
              ...it,
              quantity: newQ,
              calories: Math.round(info.unitCals * newQ),
              protein: Number((info.unitPro * newQ).toFixed(1)),
              carbs: Number((info.unitCarbs * newQ).toFixed(1)),
              fat: Number((info.unitFat * newQ).toFixed(1)),
              estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * newQ),
            };
          }
          return it;
        });
        return { ...m, meal_plan_items: items, items };
      });
    }

    // 3B. Scale down fats, oils, peanuts, full-fat paneer, milk
    totals = getTotals(calibratedMeals);
    fatOverage = totals.fat - targetFat;

    if (fatOverage > 2) {
      calibratedMeals = calibratedMeals.map((m: any) => {
        const items = (m.meal_plan_items || []).map((it: any) => {
          const info = getItemInfo(it);
          const lower = info.fName.toLowerCase();
          let q = Number(it.quantity) || 1;

          if (lower.includes('peanut')) {
            q = Math.max(0.4, Number((q * 0.6).toFixed(1)));
          } else if (lower.includes('paneer') && fatOverage > 4) {
            q = Math.max(0.4, Number((q * 0.7).toFixed(1)));
          } else if (lower.includes('ghee') || lower.includes('oil') || lower.includes('butter')) {
            q = Math.max(0.3, Number((q * 0.5).toFixed(1)));
          } else if (lower.includes('whole milk') && fatOverage > 3) {
            q = Math.max(0.5, Number((q * 0.75).toFixed(1)));
          }

          return {
            ...it,
            quantity: q,
            calories: Math.round(info.unitCals * q),
            protein: Number((info.unitPro * q).toFixed(1)),
            carbs: Number((info.unitCarbs * q).toFixed(1)),
            fat: Number((info.unitFat * q).toFixed(1)),
            estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
          };
        });
        return { ...m, meal_plan_items: items, items };
      });
    }
  }

  // STAGE 4: CALORIE & CARB FINE-TUNING VIA STAPLE FOODS (Target +/- 2%)
  totals = getTotals(calibratedMeals);
  const calDelta = targetCals - totals.cal;

  if (Math.abs(calDelta) > 20) {
    // Calculate total calories currently coming from carb staples
    let stapleCals = 0;
    calibratedMeals.forEach(m => {
      (m.meal_plan_items || []).forEach((it: any) => {
        const lower = (it.foods?.name || it.name || '').toLowerCase();
        if (lower.includes('rice') || lower.includes('roti') || lower.includes('chapati') || lower.includes('oat') || lower.includes('poha') || lower.includes('upma') || lower.includes('daliya') || lower.includes('cheela')) {
          stapleCals += Math.round((it.foods?.calories || it.calories || 0) * (Number(it.quantity) || 1));
        }
      });
    });

    if (stapleCals > 0) {
      const carbRatio = Math.max(0.4, Math.min(2.2, 1 + (calDelta / stapleCals)));
      calibratedMeals = calibratedMeals.map((m: any) => {
        const items = (m.meal_plan_items || []).map((it: any) => {
          const info = getItemInfo(it);
          const lower = info.fName.toLowerCase();
          let q = Number(it.quantity) || 1;

          const isCarbStaple = lower.includes('rice') || lower.includes('roti') || lower.includes('chapati') || lower.includes('oat') || lower.includes('poha') || lower.includes('upma') || lower.includes('daliya') || lower.includes('cheela');

          if (isCarbStaple) {
            q = Math.max(0.4, Number((q * carbRatio).toFixed(1)));
          }

          return {
            ...it,
            quantity: q,
            calories: Math.round(info.unitCals * q),
            protein: Number((info.unitPro * q).toFixed(1)),
            carbs: Number((info.unitCarbs * q).toFixed(1)),
            fat: Number((info.unitFat * q).toFixed(1)),
            estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
          };
        });
        return { ...m, meal_plan_items: items, items };
      });
    }
  }

  // STAGE 5: STRICT BUDGET CAP ENFORCEMENT
  totals = getTotals(calibratedMeals);
  if (totals.cost > dailyBudgetCap) {
    calibratedMeals = calibratedMeals.map((m: any) => {
      const items = (m.meal_plan_items || []).map((it: any) => {
        const info = getItemInfo(it);
        let q = Number(it.quantity) || 1;
        if (!info.isCore && info.unitCost > 30) {
          q = Math.max(0.6, Number((q * 0.85).toFixed(1)));
        }
        return {
          ...it,
          quantity: q,
          calories: Math.round(info.unitCals * q),
          protein: Number((info.unitPro * q).toFixed(1)),
          carbs: Number((info.unitCarbs * q).toFixed(1)),
          fat: Number((info.unitFat * q).toFixed(1)),
          estimated_cost: info.isCore ? 0 : Math.round(info.unitCost * q),
        };
      });
      return { ...m, meal_plan_items: items, items };
    });
  }

  // Final summary update per meal
  return calibratedMeals.map((m: any) => {
    const items = m.meal_plan_items || m.items || [];
    const finalCals = Math.round(items.reduce((s: number, it: any) => s + (Number(it.calories) || 0), 0));
    const finalPro = Number(items.reduce((s: number, it: any) => s + (Number(it.protein) || 0), 0).toFixed(1));
    const finalCarbs = Number(items.reduce((s: number, it: any) => s + (Number(it.carbs) || 0), 0).toFixed(1));
    const finalFat = Number(items.reduce((s: number, it: any) => s + (Number(it.fat) || 0), 0).toFixed(1));
    const finalCost = items.reduce((s: number, it: any) => s + (Number(it.estimated_cost) || 0), 0);

    return {
      ...m,
      calories: finalCals,
      protein: finalPro,
      carbs: finalCarbs,
      fat: finalFat,
      estimated_cost: Math.round(finalCost),
      meal_plan_items: items,
      items: items
    };
  });
}

async function runTests() {
  const { data: foodCatalog } = await supabase.from('foods').select('*').eq('is_active', true);
  if (!foodCatalog) throw new Error('No foods');

  const archetypes = [
    {
      name: 'Akash (Non-Veg, Cut, I Cook, 3 meals)',
      profile: {
        weight: 75, height: 156, age: 25, gender: 'Male', goal: 'Cut', activity_level: 'Moderately active',
        diet_preference: 'Non-Vegetarian', food_environment: 'I Cook', meals_per_day: '3 meals', nutrition_budget: '₹2,000–5,000'
      }
    },
    {
      name: 'Priya (Vegetarian, Lose Fat, PG Hostel, 4 meals)',
      profile: {
        weight: 62, height: 162, age: 23, gender: 'Female', goal: 'Lose Fat', activity_level: 'Lightly active',
        diet_preference: 'Vegetarian', food_environment: 'PG', meals_per_day: '4 meals', nutrition_budget: '₹1,000–2,000'
      }
    },
    {
      name: 'Rahul (Eggetarian, Build Muscle, Home, 4 meals)',
      profile: {
        weight: 78, height: 178, age: 27, gender: 'Male', goal: 'Build Muscle', activity_level: 'Very active',
        diet_preference: 'Eggetarian', food_environment: 'Home', meals_per_day: '4 meals', nutrition_budget: '₹2,000–5,000'
      }
    },
    {
      name: 'Amit (Vegan, Maintain, Office/Canteen, 3 meals)',
      profile: {
        weight: 70, height: 172, age: 29, gender: 'Male', goal: 'Maintain', activity_level: 'Moderately active',
        diet_preference: 'Vegan', food_environment: 'Office/Canteen', meals_per_day: '3 meals', nutrition_budget: '₹1,000–2,000'
      }
    }
  ];

  console.log('================ UNIVERSAL CALIBRATION VERIFICATION ================');

  for (const arch of archetypes) {
    const targets = calculateTargets(arch.profile as any);
    const dayOfWeek = 1; // Monday
    const rotatingMap = NutritionService.getRotatingMealPlanForDay(dayOfWeek, arch.profile, targets, foodCatalog as any, 0);
    const mealsPerDay = arch.profile.meals_per_day || '4 meals';
    let ALL_MEAL_TYPES: string[];
    if (mealsPerDay === '2 meals') {
      ALL_MEAL_TYPES = ['lunch', 'dinner'];
    } else if (mealsPerDay === '3 meals') {
      ALL_MEAL_TYPES = ['breakfast', 'lunch', 'dinner'];
    } else if (mealsPerDay === '5+ meals') {
      ALL_MEAL_TYPES = ['breakfast', 'pre_workout', 'lunch', 'post_workout', 'dinner'];
    } else {
      // 4 meals
      ALL_MEAL_TYPES = ['breakfast', 'lunch', 'pre_workout', 'dinner'];
    }
    const baseMeals = ALL_MEAL_TYPES.map(mt => rotatingMap.get(mt)).filter(Boolean);

    const calibrated = calibrateMealsToTargets(baseMeals, targets, arch.profile);

    const totalCals = calibrated.reduce((s, m) => s + m.calories, 0);
    const totalPro = Number(calibrated.reduce((s, m) => s + m.protein, 0).toFixed(1));
    const totalCarbs = Number(calibrated.reduce((s, m) => s + m.carbs, 0).toFixed(1));
    const totalFat = Number(calibrated.reduce((s, m) => s + m.fat, 0).toFixed(1));
    const totalCost = calibrated.reduce((s, m) => s + m.estimated_cost, 0);

    console.log(`\n👤 ${arch.name}:`);
    console.log(`Targets:     ${targets.calories} kcal | ${targets.protein_g}g P | ${targets.carbs_g}g C | ${targets.fat_g}g F | Budget: ${arch.profile.nutrition_budget}`);
    console.log(`Calibrated:  ${totalCals} kcal | ${totalPro}g P | ${totalCarbs}g C | ${totalFat}g F | ₹${totalCost}`);

    const calDiff = Math.abs(totalCals - targets.calories);
    const proDiff = Math.abs(totalPro - targets.protein_g);
    const fatDiff = totalFat - targets.fat_g;

    const calPass = calDiff <= targets.calories * 0.05;
    const proPass = proDiff <= 15;
    const fatPass = fatDiff <= 8;

    console.log(`Validation:  Calories: ${calPass ? '✅' : '❌'} (${calDiff} diff) | Protein: ${proPass ? '✅' : '❌'} (${proDiff.toFixed(1)} diff) | Fat Cap: ${fatPass ? '✅' : '❌'} (${fatDiff.toFixed(1)} over)`);

    console.log(`--- Calibrated Meals Breakdown for ${arch.name} ---`);
    calibrated.forEach(m => {
      console.log(`  [${m.meal_type.toUpperCase()}] ${m.name} -> ${m.calories} kcal, ${m.protein}g P, ${m.carbs}g C, ${m.fat}g F, ₹${m.estimated_cost}`);
      (m.meal_plan_items || []).forEach((it: any) => {
        console.log(`     - ${it.foods?.name || it.name}: qty ${it.quantity} (${it.calories} kcal, ${it.protein}g P, ${it.carbs}g C, ${it.fat}g F, ₹${it.estimated_cost})`);
      });
    });
  }
}

runTests().catch(console.error);
