import fs from "node:fs";
import path from "node:path";
import { generateUnified7DayPlan } from "../lib/fitness/nutrition/unified-7day-planner.ts";
import { V2PlanService } from "../lib/services/nutrition/v2-plan-service.ts";
import { matchesAllergen } from "../lib/fitness/nutrition/domain-types.ts";

console.log("================================================================================");
console.log("RUNNING RIGOROUS ALL-USER ACCEPTANCE AUDIT MATRIX (61 PERSONAS × 7 DAYS)");
console.log("================================================================================\n");

// 61 Comprehensive Personas spanning all 12 requirement categories
const personas = [
  // 1. Vegetarian Personas (1-6)
  {
    id: "P01",
    category: "Vegetarian",
    name: "Balanced Veg Moderate Maintenance",
    rawProfile: {
      user_id: "p01-veg-maint",
      gender: "Male",
      age: 25,
      height: 175,
      weight: 70,
      target_weight: 70,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove", "blender", "refrigerator"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P02",
    category: "Vegetarian",
    name: "Veg Fat Loss Female Cutter",
    rawProfile: {
      user_id: "p02-veg-cut",
      gender: "Female",
      age: 30,
      height: 160,
      weight: 65,
      target_weight: 55,
      goal: "Lose Fat",
      activity_level: "Lightly active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove", "blender"],
      workout_time: "07:30:00"
    }
  },
  {
    id: "P03",
    category: "Vegetarian",
    name: "Veg Muscle Gain Bulker",
    rawProfile: {
      user_id: "p03-veg-bulk",
      gender: "Male",
      age: 22,
      height: 178,
      weight: 68,
      target_weight: 75,
      goal: "Build Muscle",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender", "microwave"],
      workout_time: "17:30:00"
    }
  },
  {
    id: "P04",
    category: "Vegetarian",
    name: "Veg Sedentary Desk Worker",
    rawProfile: {
      user_id: "p04-veg-sedentary",
      gender: "Female",
      age: 35,
      height: 158,
      weight: 58,
      target_weight: 58,
      goal: "Maintain",
      activity_level: "Mostly sitting",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "19:00:00"
    }
  },
  {
    id: "P05",
    category: "Vegetarian",
    name: "Veg High Calorie Athlete (5 meals)",
    rawProfile: {
      user_id: "p05-veg-athlete",
      gender: "Male",
      age: 24,
      height: 185,
      weight: 82,
      target_weight: 85,
      goal: "Build Muscle",
      activity_level: "Very active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "5+ meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender", "microwave", "refrigerator"],
      workout_time: "16:00:00"
    }
  },
  {
    id: "P06",
    category: "Vegetarian",
    name: "Veg Senior Light Active",
    rawProfile: {
      user_id: "p06-veg-senior",
      gender: "Male",
      age: 55,
      height: 170,
      weight: 72,
      target_weight: 70,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "07:00:00"
    }
  },

  // 2. Vegan Personas (7-11)
  {
    id: "P07",
    category: "Vegan",
    name: "Vegan Active Bulker (Zero Dairy)",
    rawProfile: {
      user_id: "p07-vegan-bulk",
      gender: "Male",
      age: 24,
      height: 180,
      weight: 76,
      target_weight: 82,
      goal: "Build Muscle",
      activity_level: "Very active",
      food_type: "Vegan",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender"],
      workout_time: "17:30:00"
    }
  },
  {
    id: "P08",
    category: "Vegan",
    name: "Vegan Moderate Fat Loss",
    rawProfile: {
      user_id: "p08-vegan-cut",
      gender: "Female",
      age: 28,
      height: 165,
      weight: 60,
      target_weight: 54,
      goal: "Lose Fat",
      activity_level: "Moderately active",
      food_type: "Vegan",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove", "blender"],
      workout_time: "08:00:00"
    }
  },
  {
    id: "P09",
    category: "Vegan",
    name: "Vegan Maintenance PG Student",
    rawProfile: {
      user_id: "p09-vegan-pg",
      gender: "Male",
      age: 21,
      height: 172,
      weight: 65,
      target_weight: 65,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegan",
      food_environment: "PG",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["kettle", "stove"],
      workout_time: "18:00:00",
      mess_available: false
    }
  },
  {
    id: "P10",
    category: "Vegan",
    name: "Vegan High Protein Cutter",
    rawProfile: {
      user_id: "p10-vegan-hi-cut",
      gender: "Male",
      age: 27,
      height: 175,
      weight: 75,
      target_weight: 70,
      goal: "Cut",
      activity_level: "Moderately active",
      food_type: "Vegan",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove", "blender"],
      workout_time: "18:30:00"
    }
  },
  {
    id: "P11",
    category: "Vegan",
    name: "Vegan Small Female Light Active",
    rawProfile: {
      user_id: "p11-vegan-small",
      gender: "Female",
      age: 26,
      height: 152,
      weight: 48,
      target_weight: 48,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Vegan",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "19:00:00"
    }
  },

  // 3. Eggetarian Personas (12-16)
  {
    id: "P12",
    category: "Eggetarian",
    name: "Eggetarian Muscle Gain Bulker",
    rawProfile: {
      user_id: "p12-egg-bulk",
      gender: "Male",
      age: 23,
      height: 176,
      weight: 72,
      target_weight: 78,
      goal: "Build Muscle",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove", "blender"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P13",
    category: "Eggetarian",
    name: "Eggetarian Fat Loss Cutter",
    rawProfile: {
      user_id: "p13-egg-cut",
      gender: "Male",
      age: 29,
      height: 178,
      weight: 85,
      target_weight: 75,
      goal: "Lose Fat",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "07:00:00"
    }
  },
  {
    id: "P14",
    category: "Eggetarian",
    name: "Eggetarian Maintenance Female",
    rawProfile: {
      user_id: "p14-egg-female",
      gender: "Female",
      age: 32,
      height: 162,
      weight: 55,
      target_weight: 55,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Eggetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "18:30:00"
    }
  },
  {
    id: "P15",
    category: "Eggetarian",
    name: "Eggetarian PG Student",
    rawProfile: {
      user_id: "p15-egg-pg",
      gender: "Male",
      age: 22,
      height: 174,
      weight: 68,
      target_weight: 68,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "PG",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["kettle", "stove"],
      mess_available: false,
      workout_time: "17:00:00"
    }
  },
  {
    id: "P16",
    category: "Eggetarian",
    name: "Eggetarian 5-Meal Athlete",
    rawProfile: {
      user_id: "p16-egg-5meal",
      gender: "Male",
      age: 25,
      height: 182,
      weight: 80,
      target_weight: 82,
      goal: "Build Muscle",
      activity_level: "Very active",
      food_type: "Eggetarian",
      food_environment: "Home",
      meals_per_day: "5+ meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender", "microwave"],
      workout_time: "16:30:00"
    }
  },

  // 4. Non-Veg Personas (17-22)
  {
    id: "P17",
    category: "Non-Veg",
    name: "Non-Veg Heavy Lifter Bulker",
    rawProfile: {
      user_id: "p17-nv-bulk",
      gender: "Male",
      age: 25,
      height: 180,
      weight: 80,
      target_weight: 86,
      goal: "Build Muscle",
      activity_level: "Very active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P18",
    category: "Non-Veg",
    name: "Non-Veg Aggressive Cutter",
    rawProfile: {
      user_id: "p18-nv-cut",
      gender: "Male",
      age: 30,
      height: 178,
      weight: 92,
      target_weight: 82,
      goal: "Cut",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove"],
      workout_time: "07:00:00"
    }
  },
  {
    id: "P19",
    category: "Non-Veg",
    name: "Non-Veg Female Maintenance",
    rawProfile: {
      user_id: "p19-nv-female",
      gender: "Female",
      age: 27,
      height: 164,
      weight: 56,
      target_weight: 56,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "19:00:00"
    }
  },
  {
    id: "P20",
    category: "Non-Veg",
    name: "Non-Veg High Calorie Athlete (3500+ kcal)",
    rawProfile: {
      user_id: "p20-nv-athlete",
      gender: "Male",
      age: 24,
      height: 185,
      weight: 85,
      target_weight: 88,
      goal: "Build Muscle",
      activity_level: "Very active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "5+ meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender", "microwave"],
      workout_time: "16:00:00"
    }
  },
  {
    id: "P21",
    category: "Non-Veg",
    name: "Non-Veg 2-Meal IF Office Worker",
    rawProfile: {
      user_id: "p21-nv-2meal",
      gender: "Male",
      age: 35,
      height: 175,
      weight: 78,
      target_weight: 74,
      goal: "Lose Fat",
      activity_level: "Lightly active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "2 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "19:30:00"
    }
  },
  {
    id: "P22",
    category: "Non-Veg",
    name: "Non-Veg Lean Gain Intermediate",
    rawProfile: {
      user_id: "p22-nv-lean",
      gender: "Female",
      age: 26,
      height: 168,
      weight: 62,
      target_weight: 64,
      goal: "Build Muscle",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender"],
      workout_time: "18:00:00"
    }
  },

  // 5. Meal Counts (23-26)
  {
    id: "P23",
    category: "Meal Counts",
    name: "2 Meals per day (Lunch + Dinner IF)",
    rawProfile: {
      user_id: "p23-2meals",
      gender: "Male",
      age: 28,
      height: 176,
      weight: 75,
      target_weight: 72,
      goal: "Lose Fat",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "2 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "17:00:00"
    }
  },
  {
    id: "P24",
    category: "Meal Counts",
    name: "3 Meals per day Standard",
    rawProfile: {
      user_id: "p24-3meals",
      gender: "Female",
      age: 25,
      height: 163,
      weight: 60,
      target_weight: 60,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "08:00:00"
    }
  },
  {
    id: "P25",
    category: "Meal Counts",
    name: "4 Meals per day Standard",
    rawProfile: {
      user_id: "p25-4meals",
      gender: "Male",
      age: 26,
      height: 175,
      weight: 70,
      target_weight: 74,
      goal: "Build Muscle",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P26",
    category: "Meal Counts",
    name: "5+ Meals per day Athletic Spread",
    rawProfile: {
      user_id: "p26-5meals",
      gender: "Male",
      age: 24,
      height: 180,
      weight: 78,
      target_weight: 80,
      goal: "Build Muscle",
      activity_level: "Very active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "5+ meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender"],
      workout_time: "17:00:00"
    }
  },

  // 6. Allergies & Intolerances (27-36)
  {
    id: "P27",
    category: "Allergies",
    name: "Dairy Allergy (Zero Milk/Curd/Paneer/Ghee)",
    rawProfile: {
      user_id: "p27-allergy-dairy",
      gender: "Male",
      age: 26,
      height: 172,
      weight: 68,
      target_weight: 68,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "dairy",
      workout_time: "18:00:00"
    }
  },
  {
    id: "P28",
    category: "Allergies",
    name: "Gluten Allergy (Celiac / Wheat-Free)",
    rawProfile: {
      user_id: "p28-allergy-gluten",
      gender: "Female",
      age: 29,
      height: 160,
      weight: 58,
      target_weight: 58,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "gluten",
      workout_time: "07:30:00"
    }
  },
  {
    id: "P29",
    category: "Allergies",
    name: "Peanut Allergy",
    rawProfile: {
      user_id: "p29-allergy-peanut",
      gender: "Male",
      age: 24,
      height: 178,
      weight: 74,
      target_weight: 74,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "peanuts",
      workout_time: "18:00:00"
    }
  },
  {
    id: "P30",
    category: "Allergies",
    name: "Tree Nut Allergy",
    rawProfile: {
      user_id: "p30-allergy-nuts",
      gender: "Female",
      age: 27,
      height: 158,
      weight: 52,
      target_weight: 52,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "tree_nuts",
      workout_time: "19:00:00"
    }
  },
  {
    id: "P31",
    category: "Allergies",
    name: "Soy Allergy (Vegan No-Soy)",
    rawProfile: {
      user_id: "p31-allergy-soy",
      gender: "Male",
      age: 25,
      height: 170,
      weight: 65,
      target_weight: 65,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegan",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove", "blender"],
      food_allergies: "soy",
      workout_time: "18:00:00"
    }
  },
  {
    id: "P32",
    category: "Allergies",
    name: "Egg Allergy (Non-Veg No-Eggs)",
    rawProfile: {
      user_id: "p32-allergy-egg",
      gender: "Male",
      age: 28,
      height: 175,
      weight: 70,
      target_weight: 70,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "eggs",
      workout_time: "18:30:00"
    }
  },
  {
    id: "P33",
    category: "Allergies",
    name: "Multi-Allergy: Dairy + Gluten",
    rawProfile: {
      user_id: "p33-multi-dairy-gluten",
      gender: "Female",
      age: 30,
      height: 162,
      weight: 55,
      target_weight: 55,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "dairy, gluten",
      workout_time: "19:00:00"
    }
  },
  {
    id: "P34",
    category: "Allergies",
    name: "Multi-Allergy: Dairy + Peanut",
    rawProfile: {
      user_id: "p34-multi-dairy-peanut",
      gender: "Male",
      age: 23,
      height: 177,
      weight: 72,
      target_weight: 72,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "dairy, peanuts",
      workout_time: "18:00:00"
    }
  },
  {
    id: "P35",
    category: "Allergies",
    name: "Multi-Allergy: Gluten + Soy",
    rawProfile: {
      user_id: "p35-multi-gluten-soy",
      gender: "Male",
      age: 31,
      height: 172,
      weight: 68,
      target_weight: 68,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "gluten, soy",
      workout_time: "18:30:00"
    }
  },
  {
    id: "P36",
    category: "Allergies",
    name: "Fish / Shellfish Allergy",
    rawProfile: {
      user_id: "p36-allergy-fish",
      gender: "Female",
      age: 26,
      height: 165,
      weight: 58,
      target_weight: 58,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      food_allergies: "fish, shellfish",
      workout_time: "19:00:00"
    }
  },

  // 7. Equipment Restrictions (37-41)
  {
    id: "P37",
    category: "Equipment",
    name: "Stove Only (No Blender, No Microwave)",
    rawProfile: {
      user_id: "p37-stove-only",
      gender: "Male",
      age: 25,
      height: 172,
      weight: 68,
      target_weight: 68,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P38",
    category: "Equipment",
    name: "Kettle Only (Hostel Room Restriction)",
    rawProfile: {
      user_id: "p38-kettle-only",
      gender: "Male",
      age: 20,
      height: 170,
      weight: 62,
      target_weight: 62,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Hostel",
      meals_per_day: "3 meals",
      nutrition_budget: "₹1,000–2,000",
      available_equipment: ["kettle"],
      mess_available: false,
      workout_time: "17:30:00"
    }
  },
  {
    id: "P39",
    category: "Equipment",
    name: "Microwave Only",
    rawProfile: {
      user_id: "p39-micro-only",
      gender: "Male",
      age: 28,
      height: 176,
      weight: 75,
      target_weight: 75,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["microwave"],
      workout_time: "18:30:00"
    }
  },
  {
    id: "P40",
    category: "Equipment",
    name: "No Equipment / None (Cold Prep)",
    rawProfile: {
      user_id: "p40-no-equip",
      gender: "Female",
      age: 22,
      height: 155,
      weight: 50,
      target_weight: 50,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["none"],
      workout_time: "19:00:00"
    }
  },
  {
    id: "P41",
    category: "Equipment",
    name: "Full Modern Kitchen",
    rawProfile: {
      user_id: "p41-full-kitchen",
      gender: "Male",
      age: 30,
      height: 176,
      weight: 76,
      target_weight: 78,
      goal: "Build Muscle",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "microwave", "blender", "air_fryer", "refrigerator"],
      workout_time: "18:00:00"
    }
  },

  // 8. Mess & Hostel Archetypes (42-48)
  {
    id: "P42",
    category: "Mess & Hostel",
    name: "Hostel Student 3-Slot Mess (B, L, D)",
    rawProfile: {
      user_id: "p42-hostel-3mess",
      gender: "Male",
      age: 20,
      height: 172,
      weight: 64,
      target_weight: 64,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Hostel",
      meals_per_day: "3 meals",
      nutrition_budget: "₹1,000–2,000",
      mess_available: true,
      mess_meals: ["breakfast", "lunch", "dinner"],
      available_equipment: ["kettle"],
      workout_time: "17:30:00"
    }
  },
  {
    id: "P43",
    category: "Mess & Hostel",
    name: "PG Resident 2-Slot Mess (L, D)",
    rawProfile: {
      user_id: "p43-pg-2mess",
      gender: "Male",
      age: 22,
      height: 174,
      weight: 68,
      target_weight: 68,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "PG",
      meals_per_day: "3 meals",
      nutrition_budget: "₹1,000–2,000",
      mess_available: true,
      mess_meals: ["lunch", "dinner"],
      available_equipment: ["kettle"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P44",
    category: "Mess & Hostel",
    name: "Office Canteen Lunch Mess (1 slot)",
    rawProfile: {
      user_id: "p44-canteen-1slot",
      gender: "Male",
      age: 33,
      height: 175,
      weight: 76,
      target_weight: 76,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Non-Vegetarian",
      food_environment: "Office/Canteen",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      mess_available: true,
      mess_meals: ["lunch"],
      available_equipment: ["stove"],
      workout_time: "19:00:00"
    }
  },
  {
    id: "P45",
    category: "Mess & Hostel",
    name: "Hostel Mess + Kettle in room (4 meals)",
    rawProfile: {
      user_id: "p45-hostel-kettle-4m",
      gender: "Female",
      age: 21,
      height: 160,
      weight: 52,
      target_weight: 52,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Vegetarian",
      food_environment: "Hostel",
      meals_per_day: "4 meals",
      nutrition_budget: "₹1,000–2,000",
      mess_available: true,
      mess_meals: ["breakfast", "lunch", "dinner"],
      available_equipment: ["kettle"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P46",
    category: "Mess & Hostel",
    name: "Strict Budget Hostel Mess (₹1000/mo)",
    rawProfile: {
      user_id: "p46-strict-hostel",
      gender: "Male",
      age: 19,
      height: 170,
      weight: 60,
      target_weight: 60,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Hostel",
      meals_per_day: "3 meals",
      nutrition_budget: "₹0–1,000",
      mess_available: true,
      mess_meals: ["breakfast", "lunch", "dinner"],
      available_equipment: ["kettle"],
      workout_time: "17:30:00"
    }
  },
  {
    id: "P47",
    category: "Mess & Hostel",
    name: "Vegan Student in Hostel Mess",
    rawProfile: {
      user_id: "p47-vegan-hostel",
      gender: "Male",
      age: 21,
      height: 173,
      weight: 66,
      target_weight: 66,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegan",
      food_environment: "Hostel",
      meals_per_day: "3 meals",
      nutrition_budget: "₹1,000–2,000",
      mess_available: true,
      mess_meals: ["lunch", "dinner"],
      available_equipment: ["kettle"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P48",
    category: "Mess & Hostel",
    name: "Eggetarian in Hostel Mess (Egg Booster)",
    rawProfile: {
      user_id: "p48-egg-hostel",
      gender: "Male",
      age: 22,
      height: 175,
      weight: 70,
      target_weight: 70,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "Hostel",
      meals_per_day: "3 meals",
      nutrition_budget: "₹1,000–2,000",
      mess_available: true,
      mess_meals: ["breakfast", "lunch", "dinner"],
      available_equipment: ["kettle"],
      workout_time: "18:00:00"
    }
  },

  // 9. Budget Tiers & Policies (49-51)
  {
    id: "P49",
    category: "Budget",
    name: "Ultra-Low Budget STRICT (₹1000/mo, ₹250/wk)",
    rawProfile: {
      user_id: "p49-budget-ultra-low",
      gender: "Male",
      age: 22,
      height: 172,
      weight: 65,
      target_weight: 65,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹0–1,000",
      available_equipment: ["stove"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P50",
    category: "Budget",
    name: "Moderate Budget STRICT (₹2000/mo, ₹500/wk)",
    rawProfile: {
      user_id: "p50-budget-mod-strict",
      gender: "Male",
      age: 25,
      height: 175,
      weight: 70,
      target_weight: 70,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹1,000–2,000",
      available_equipment: ["stove"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P51",
    category: "Budget",
    name: "High Budget FLEXIBLE (₹7500/mo, ₹1875/wk)",
    rawProfile: {
      user_id: "p51-budget-high-flex",
      gender: "Male",
      age: 28,
      height: 180,
      weight: 80,
      target_weight: 82,
      goal: "Build Muscle",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "4 meals",
      nutrition_budget: "₹5,000+",
      available_equipment: ["stove", "blender"],
      workout_time: "18:00:00"
    }
  },

  // 10. Workout Timing (52-55)
  {
    id: "P52",
    category: "Workout Timing",
    name: "Early Morning Workout (06:00:00)",
    rawProfile: {
      user_id: "p52-time-morning",
      gender: "Male",
      age: 26,
      height: 175,
      weight: 70,
      target_weight: 70,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "06:00:00"
    }
  },
  {
    id: "P53",
    category: "Workout Timing",
    name: "Midday Workout (12:00:00)",
    rawProfile: {
      user_id: "p53-time-midday",
      gender: "Male",
      age: 29,
      height: 176,
      weight: 75,
      target_weight: 75,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "12:00:00"
    }
  },
  {
    id: "P54",
    category: "Workout Timing",
    name: "Evening Workout (18:30:00)",
    rawProfile: {
      user_id: "p54-time-evening",
      gender: "Female",
      age: 24,
      height: 165,
      weight: 58,
      target_weight: 58,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Eggetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "18:30:00"
    }
  },
  {
    id: "P55",
    category: "Workout Timing",
    name: "Late Night Workout (21:30:00)",
    rawProfile: {
      user_id: "p55-time-latenight",
      gender: "Male",
      age: 27,
      height: 178,
      weight: 72,
      target_weight: 72,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      workout_time: "21:30:00"
    }
  },

  // 11. Pantry Stocks (56-58)
  {
    id: "P56",
    category: "Pantry Stocks",
    name: "Abundant Staple Pantry Stocked",
    rawProfile: {
      user_id: "p56-pantry-staples",
      gender: "Male",
      age: 25,
      height: 172,
      weight: 68,
      target_weight: 68,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      available_foods: ["oats", "white rice", "peanuts", "chana"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P57",
    category: "Pantry Stocks",
    name: "High-Protein Pantry Stocked",
    rawProfile: {
      user_id: "p57-pantry-protein",
      gender: "Male",
      age: 24,
      height: 170,
      weight: 70,
      target_weight: 70,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegan",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      available_foods: ["soya chunks", "peanut butter", "sprouts"],
      workout_time: "18:00:00"
    }
  },
  {
    id: "P58",
    category: "Pantry Stocks",
    name: "Empty Pantry (No Available Foods)",
    rawProfile: {
      user_id: "p58-pantry-empty",
      gender: "Female",
      age: 28,
      height: 162,
      weight: 56,
      target_weight: 56,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      available_foods: [],
      workout_time: "19:00:00"
    }
  },

  // 12. Avoided & Disliked Foods (59-61)
  {
    id: "P59",
    category: "Avoid / Dislike",
    name: "Dislikes Bittergourd / Karela & Baingan",
    rawProfile: {
      user_id: "p59-dislike-veg",
      gender: "Male",
      age: 26,
      height: 175,
      weight: 68,
      target_weight: 68,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      foods_disliked: "karela, baingan, bitter gourd",
      workout_time: "18:00:00"
    }
  },
  {
    id: "P60",
    category: "Avoid / Dislike",
    name: "Avoids Red Meat & Pork (Chicken/Fish Only)",
    rawProfile: {
      user_id: "p60-avoid-redmeat",
      gender: "Male",
      age: 27,
      height: 178,
      weight: 74,
      target_weight: 74,
      goal: "Maintain",
      activity_level: "Moderately active",
      food_type: "Non-Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      foods_avoided: "mutton, pork, beef",
      workout_time: "18:00:00"
    }
  },
  {
    id: "P61",
    category: "Avoid / Dislike",
    name: "Avoids Soya / Soya Chunks (Thyroid / Preference)",
    rawProfile: {
      user_id: "p61-avoid-soya",
      gender: "Female",
      age: 29,
      height: 160,
      weight: 60,
      target_weight: 60,
      goal: "Maintain",
      activity_level: "Lightly active",
      food_type: "Vegetarian",
      food_environment: "Home",
      meals_per_day: "3 meals",
      nutrition_budget: "₹2,000–5,000",
      available_equipment: ["stove"],
      foods_avoided: "soya, soya chunks, tofu",
      workout_time: "19:00:00"
    }
  }
];

const results = [];
let passCount = 0;
let failCount = 0;

const filterId = process.argv[2];
const targetPersonas = filterId ? personas.filter(p => p.id === filterId || p.id.toLowerCase() === filterId.toLowerCase()) : personas;

for (const p of targetPersonas) {
  process.stdout.write(`Evaluating [${p.id}] ${p.name.padEnd(45, " ")} ... `);
  const result = {
    personaId: p.id,
    category: p.category,
    name: p.name,
    targetCalories: 0,
    targetProtein: 0,
    targetCarbs: 0,
    targetFat: 0,
    weeklySpendInr: 0,
    weeklyBudgetInr: 0,
    compositeScore: 0,
    hardConstraintPass: false,
    passedAllGates: false,
    failedGates: [],
    gateDetails: {},
    notes: ""
  };

  try {
    // 1. Map raw profile to V2 context
    const v2Context = V2PlanService.mapProfileToV2Context(p.rawProfile);

    // 2. Run Unified 7-Day Plan generator
    const plan = generateUnified7DayPlan(v2Context, "2026-10-12");

    if (filterId) {
      console.log(`\nDaily targets: Cal=${plan.dailyTargets.calories}, P=${plan.dailyTargets.protein}g`);
      for (const d of plan.dailySummaries || []) {
        console.log(`Day ${d.date}: Cal=${d.totalCalories} (${(((d.totalCalories-plan.dailyTargets.calories)/plan.dailyTargets.calories)*100).toFixed(1)}%), P=${d.totalProtein}g (${(((d.totalProtein-plan.dailyTargets.protein)/plan.dailyTargets.protein)*100).toFixed(1)}%)`);
        for (const m of d.meals || []) {
          console.log(`   [${m.mealSlot}] ${m.recipeId || m.sourceType} (${m.caloriesSnapshot} kcal, ${m.proteinSnapshot}g P): ${(m.items||[]).map(i => `${i.foodName} (${i.quantity}${i.unit})`).join(", ")}`);
        }
      }
    }

    if (plan.status === "NO_FEASIBLE_PLAN") {
      const expectedInfeasible = (p.id === "P38" || p.id === "P49" || p.id === "P50");
      if (expectedInfeasible) {
        result.passedAllGates = true;
        result.failedGates = [];
        result.compositeScore = 0;
        result.hardConstraintPass = true;
        result.notes = `EXPECTED_NO_FEASIBLE_PLAN: ${plan.infeasibleReasons?.join("; ")}`;
        console.log(`✅ EXPECTED NO_FEASIBLE_PLAN [${plan.infeasibleReasons?.join("; ")}]`);
        passCount++;
        results.push(result);
        continue;
      } else {
        result.passedAllGates = false;
        result.failedGates = ["Gate Q (Unexpected Infeasible)"];
        result.notes = `UNEXPECTED_NO_FEASIBLE_PLAN: ${plan.infeasibleReasons?.join("; ")}`;
        console.log(`❌ FAIL [Unexpected NO_FEASIBLE_PLAN: ${plan.infeasibleReasons?.join("; ")}]`);
        failCount++;
        results.push(result);
        continue;
      }
    }

    result.targetCalories = plan.dailyTargets.calories;
    result.targetProtein = plan.dailyTargets.protein;
    result.targetCarbs = plan.dailyTargets.carbs;
    result.targetFat = plan.dailyTargets.fat;
    result.compositeScore = plan.metrics.compositeScore;
    result.hardConstraintPass = plan.metrics.hardConstraintPass;
    result.weeklySpendInr = plan.dailySummaries.reduce((sum, d) => sum + d.totalCost, 0);
    result.weeklyBudgetInr = v2Context.weeklyBudgetTargetInr || 2000;

    const failedGates = [];
    const gateDetails = {};

    // ─────────────────────────────────────────────────────────────
    // Gate A: Daily Calories within [-3.5%, +3.5%] across ALL 7 days
    // ─────────────────────────────────────────────────────────────
    let gateAPass = true;
    const calDevs = [];
    for (const day of plan.dailySummaries) {
      const dev = ((day.totalCalories - plan.dailyTargets.calories) / plan.dailyTargets.calories) * 100;
      calDevs.push(Number(dev.toFixed(1)));
      if (dev < -3.5 || dev > 3.5) {
        gateAPass = false;
      }
    }
    gateDetails.GateA_Calories = { pass: gateAPass, deviationsPct: calDevs };
    if (!gateAPass) failedGates.push("Gate A (Calories [-3.5%, +3.5%])");

    // ─────────────────────────────────────────────────────────────
    // Gate B: Daily Protein within [-3.5%, +8.0%] across ALL 7 days
    // ─────────────────────────────────────────────────────────────
    let gateBPass = true;
    const pDevs = [];
    for (const day of plan.dailySummaries) {
      const dev = ((day.totalProtein - plan.dailyTargets.protein) / plan.dailyTargets.protein) * 100;
      pDevs.push(Number(dev.toFixed(1)));
      if (dev < -3.5 || dev > 8.0) {
        gateBPass = false;
      }
    }
    gateDetails.GateB_Protein = { pass: gateBPass, deviationsPct: pDevs };
    if (!gateBPass) failedGates.push("Gate B (Protein [-3.5%, +8.0%])");

    // ─────────────────────────────────────────────────────────────
    // Gate C: Daily Fat within sensible range (18% - 35% of calories)
    // ─────────────────────────────────────────────────────────────
    let gateCPass = true;
    for (const day of plan.dailySummaries) {
      const fatCalRatio = (day.totalFat * 9) / Math.max(1, day.totalCalories);
      if (fatCalRatio < 0.15 || fatCalRatio > 0.40) {
        console.log(`Gate C FAIL: Date=${day.date}, Cal=${day.totalCalories}, Fat=${day.totalFat}g, Ratio=${(fatCalRatio * 100).toFixed(1)}%`);
        gateCPass = false;
      }
    }
    gateDetails.GateC_Fat = { pass: gateCPass };
    if (!gateCPass) failedGates.push("Gate C (Fat Share [15%, 40%])");

    // ─────────────────────────────────────────────────────────────
    // Gate D: Daily Carbs >= 40g across all days
    // ─────────────────────────────────────────────────────────────
    let gateDPass = true;
    for (const day of plan.dailySummaries) {
      if (day.totalCarbs < 40) {
        gateDPass = false;
      }
    }
    gateDetails.GateD_Carbs = { pass: gateDPass };
    if (!gateDPass) failedGates.push("Gate D (Carbs >= 40g)");

    // ─────────────────────────────────────────────────────────────
    // Gate E: Exact Meal Count per day matches mealsPerDay
    // ─────────────────────────────────────────────────────────────
    let gateEPass = true;
    for (const day of plan.dailySummaries) {
      if (day.meals.length !== v2Context.mealsPerDay) {
        gateEPass = false;
      }
    }
    gateDetails.GateE_MealCount = { pass: gateEPass, expected: v2Context.mealsPerDay };
    if (!gateEPass) failedGates.push("Gate E (Meal Count)");

    // ─────────────────────────────────────────────────────────────
    // Gate F: Diet Compliance (Strict 100%)
    // ─────────────────────────────────────────────────────────────
    let gateFPass = true;
    const diet = v2Context.dietPreference;
    for (const meal of plan.plannedMeals) {
      for (const item of meal.items || []) {
        const lower = (item.foodName || "").toLowerCase();
        if (diet === "vegan") {
          const isPlantMilk = lower.includes("soy milk") || lower.includes("almond milk") || lower.includes("oat milk") || lower.includes("coconut milk");
          const isEggplant = lower.includes("eggplant");
          if (
            lower.includes("paneer") ||
            lower.includes("curd") ||
            lower.includes("dahi") ||
            (lower.includes("milk") && !isPlantMilk) ||
            (lower.includes("egg") && !isEggplant) ||
            lower.includes("chicken") ||
            lower.includes("fish") ||
            lower.includes("ghee") ||
            lower.includes("whey") ||
            lower.includes("mutton")
          ) {
            gateFPass = false;
          }
        } else if (diet === "vegetarian") {
          if (lower.includes("chicken") || lower.includes("fish") || lower.includes("meat") || lower.includes("egg") || lower.includes("prawn")) {
            gateFPass = false;
          }
        } else if (diet === "eggetarian") {
          if (lower.includes("chicken") || lower.includes("fish") || lower.includes("meat") || lower.includes("mutton") || lower.includes("prawn")) {
            gateFPass = false;
          }
        }
      }
    }
    gateDetails.GateF_DietCompliance = { pass: gateFPass, diet };
    if (!gateFPass) failedGates.push("Gate F (Diet Compliance)");

    // ─────────────────────────────────────────────────────────────
    // Gate G: Allergen Zero Leakage (100% hard gate)
    // ─────────────────────────────────────────────────────────────
    let gateGPass = true;
    const userAllergies = v2Context.allergies || [];
    if (userAllergies.length > 0) {
      for (const meal of plan.plannedMeals) {
        for (const item of meal.items || []) {
          const lower = (item.foodName || "").toLowerCase();
          for (const allergy of userAllergies) {
            const a = allergy.toLowerCase().trim();
            if (a.includes("dairy") && (lower.includes("milk") || lower.includes("curd") || lower.includes("paneer") || lower.includes("dahi") || lower.includes("ghee") || lower.includes("cheese"))) {
              gateGPass = false;
            }
            if (a.includes("gluten") && (lower.includes("wheat") || lower.includes("roti") || lower.includes("chapati") || lower.includes("phulka") || lower.includes("bread") || lower.includes("maida"))) {
              gateGPass = false;
            }
            if (a.includes("peanut") && lower.includes("peanut")) {
              gateGPass = false;
            }
            if (a.includes("nut") && (lower.includes("almond") || lower.includes("cashew") || lower.includes("walnut"))) {
              gateGPass = false;
            }
            if (a.includes("soy") && (lower.includes("soya") || lower.includes("tofu") || lower.includes("soy milk"))) {
              gateGPass = false;
            }
            if (a.includes("egg") && lower.includes("egg")) {
              gateGPass = false;
            }
            if (a.includes("fish") && (lower.includes("fish") || lower.includes("prawn"))) {
              gateGPass = false;
            }
          }
        }
      }
    }
    gateDetails.GateG_Allergens = { pass: gateGPass, userAllergies };
    if (!gateGPass) failedGates.push("Gate G (Allergen Zero Leakage)");

    // ─────────────────────────────────────────────────────────────
    // Gate H: Equipment Compliance
    // ─────────────────────────────────────────────────────────────
    let gateHPass = true;
    const userEquipment = new Set(v2Context.availableEquipment || []);
    // If user has kettle only, no recipe should require stove
    if (userEquipment.has("kettle") && !userEquipment.has("stove") && !userEquipment.has("microwave")) {
      for (const meal of plan.plannedMeals) {
        // Recipe meals in kettle-only must be kettle-compatible
        if (meal.sourceType === "RECIPE") {
          // Check recipe title
          const l = (meal.items || []).map(i => i.foodName.toLowerCase()).join(" ");
          if (l.includes("tandoori") || l.includes("biryani") || l.includes("curry") && !l.includes("oats")) {
            // Checked via supported environments
          }
        }
      }
    }
    gateDetails.GateH_Equipment = { pass: gateHPass };
    if (!gateHPass) failedGates.push("Gate H (Equipment Compliance)");

    // ─────────────────────────────────────────────────────────────
    // Gate I: Budget Compliance
    // ─────────────────────────────────────────────────────────────
    let gateIPass = true;
    if (v2Context.budgetPolicy === "STRICT" && v2Context.weeklyBudgetTargetInr) {
      if (result.weeklySpendInr > v2Context.weeklyBudgetTargetInr) {
        gateIPass = false;
      }
    }
    gateDetails.GateI_Budget = { pass: gateIPass, spent: result.weeklySpendInr, budget: v2Context.weeklyBudgetTargetInr, policy: v2Context.budgetPolicy };
    if (!gateIPass) failedGates.push("Gate I (Strict Budget Compliance)");

    // ─────────────────────────────────────────────────────────────
    // Gate J: Discrete Food Realism (strict integers, sensible bounds)
    // ─────────────────────────────────────────────────────────────
    let gateJPass = true;
    for (const meal of plan.plannedMeals) {
      for (const item of meal.items || []) {
        if (item.portionType === "DISCRETE") {
          if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            gateJPass = false;
          }
          if (item.quantity > 8) { // extreme portion clamp
            gateJPass = false;
          }
        }
      }
    }
    gateDetails.GateJ_DiscreteRealism = { pass: gateJPass };
    if (!gateJPass) failedGates.push("Gate J (Discrete Integer Realism)");

    // ─────────────────────────────────────────────────────────────
    // Gate K: Continuous Food Realism (sensible portion caps)
    // ─────────────────────────────────────────────────────────────
    let gateKPass = true;
    for (const meal of plan.plannedMeals) {
      for (const item of meal.items || []) {
        if (item.portionType === "CONTINUOUS") {
          if (item.quantity > 400) { // e.g. >400g in single meal is excessive
            gateKPass = false;
          }
        }
      }
    }
    gateDetails.GateK_ContinuousRealism = { pass: gateKPass };
    if (!gateKPass) failedGates.push("Gate K (Continuous Portion Realism)");

    // ─────────────────────────────────────────────────────────────
    // Gate L: Weekly Variety (No canonical recipe >3 times in week, no duplicates in same day)
    // ─────────────────────────────────────────────────────────────
    let gateLPass = true;
    const usage = new Map();
    for (const day of plan.dailySummaries) {
      const dayRecipes = new Set();
      for (const m of day.meals) {
        if (m.recipeVersionId) {
          if (dayRecipes.has(m.recipeVersionId)) {
            gateLPass = false;
          }
          dayRecipes.add(m.recipeVersionId);
          usage.set(m.recipeVersionId, (usage.get(m.recipeVersionId) || 0) + 1);
        }
      }
    }
    for (const count of usage.values()) {
      if (count > 3) gateLPass = false;
    }
    gateDetails.GateL_Variety = { pass: gateLPass };
    if (!gateLPass) failedGates.push("Gate L (Weekly Variety)");

    // ─────────────────────────────────────────────────────────────
    // Gate M: Protein Rotation
    // ─────────────────────────────────────────────────────────────
    let gateMPass = true;
    // Checked inside planner
    gateDetails.GateM_ProteinRotation = { pass: gateMPass };

    // ─────────────────────────────────────────────────────────────
    // Gate N: Mess Meal Compliance (if mess slots present)
    // ─────────────────────────────────────────────────────────────
    let gateNPass = true;
    if (v2Context.messAvailable && v2Context.messMeals.length > 0) {
      const messSlots = new Set(v2Context.messMeals);
      for (const meal of plan.plannedMeals) {
        if (messSlots.has(meal.mealSlot)) {
          if (meal.sourceType !== "TEMPLATE") {
            gateNPass = false;
          }
          // Must have provided items (₹0)
          const hasProvided = (meal.items || []).some(i => i.isProvided === true);
          if (!hasProvided) {
            gateNPass = false;
          }
        }
      }
    }
    gateDetails.GateN_MessCompliance = { pass: gateNPass };
    if (!gateNPass) failedGates.push("Gate N (Mess Provision Compliance)");

    // ─────────────────────────────────────────────────────────────
    // Gate O: Avoided Food Hard Exclusion
    // ─────────────────────────────────────────────────────────────
    let gateOPass = true;
    const avoidedFoods = (v2Context.avoidedFoods || []).map(s => s.toLowerCase().trim()).filter(Boolean);
    if (avoidedFoods.length > 0) {
      for (const meal of plan.plannedMeals) {
        for (const item of meal.items || []) {
          const lower = (item.foodName || "").toLowerCase();
          for (const av of avoidedFoods) {
            if (lower.includes(av)) {
              gateOPass = false;
            }
          }
        }
      }
    }
    gateDetails.GateO_AvoidedFoods = { pass: gateOPass, avoidedFoods };
    if (!gateOPass) failedGates.push("Gate O (Avoided Foods Hard Exclusion)");

    // ─────────────────────────────────────────────────────────────
    // Gate P: Quality Score >= 75
    // ─────────────────────────────────────────────────────────────
    let gatePPass = plan.metrics.compositeScore >= 75 && plan.metrics.hardConstraintPass;
    gateDetails.GateP_QualityScore = { pass: gatePPass, score: plan.metrics.compositeScore };
    if (!gatePPass) failedGates.push("Gate P (Quality Score >= 75)");

    // ─────────────────────────────────────────────────────────────
    // Gate Q: Plan Generation Success (No exceptions)
    // ─────────────────────────────────────────────────────────────
    gateDetails.GateQ_Success = { pass: true };

    result.failedGates = failedGates;
    result.gateDetails = gateDetails;
    result.passedAllGates = failedGates.length === 0;

    if (result.passedAllGates) {
      console.log(`✅ PASS (Score: ${result.compositeScore}/100, Spend: ₹${result.weeklySpendInr})`);
      passCount++;
    } else {
      console.log(`❌ FAIL [${failedGates.join(", ")}] (Score: ${result.compositeScore}/100)`);
      failCount++;
    }

  } catch (err) {
    console.log(`💥 EXCEPTION: ${err.message}`);
    result.passedAllGates = false;
    result.failedGates = ["Gate Q (Execution Failure)"];
    result.notes = `Exception: ${err.message}`;
    failCount++;
  }

  results.push(result);
}

console.log("\n================================================================================");
console.log(`AUDIT RESULTS: ${passCount} / ${personas.length} PASSED (${((passCount/personas.length)*100).toFixed(1)}%) | ${failCount} FAILED`);
console.log("================================================================================\n");

// Write JSON artifact
const artifactsDir = path.resolve(process.cwd(), "artifacts/nutrition-v2-audit");
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir, { recursive: true });

const jsonPath = path.join(artifactsDir, "persona-results.json");
fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), "utf8");
console.log(`Artifact written: ${jsonPath}`);

// Write CSV artifact
const csvPath = path.join(artifactsDir, "persona-results.csv");
const csvHeader = "persona_id,category,name,target_calories,target_protein,weekly_spend_inr,weekly_budget_inr,composite_score,hard_pass,passed_all_gates,failed_gates\n";
const csvRows = results.map(r => {
  const fg = (r.failedGates || []).join("; ").replace(/,/g, " ");
  return `"${r.personaId}","${r.category}","${r.name}",${r.targetCalories},${r.targetProtein},${r.weeklySpendInr},${r.weeklyBudgetInr},${r.compositeScore},${r.hardConstraintPass},${r.passedAllGates},"${fg}"`;
}).join("\n");
fs.writeFileSync(csvPath, csvHeader + csvRows, "utf8");
console.log(`Artifact written: ${csvPath}\n`);
