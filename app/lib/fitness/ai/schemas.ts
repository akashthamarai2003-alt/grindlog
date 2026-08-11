import { z } from "zod";

export const GeneratedExerciseSchema = z.object({
  name: z.string(),
  exercise_order: z.number().int().min(1),
  sets: z.number().int().min(1).max(10),
  reps_string: z.string().describe("e.g. '8-12' or '10'"),
  target_reps_num: z.number().int().min(1).max(100).nullable(),
  rest_seconds: z.number().int().min(0).max(300),
  notes: z.string().nullable().optional()
});

export const GeneratedWorkoutSchema = z.object({
  title: z.string(),
  workout_date: z.string().describe("YYYY-MM-DD"),
  duration_minutes: z.number().int().min(5).max(180),
  exercises: z.array(GeneratedExerciseSchema).min(1).max(15)
});

export const GeneratedMealSchema = z.object({
  meal_name: z.string().describe("e.g., Breakfast, Lunch, Snack"),
  time_of_day: z.string().describe("e.g., 08:00 AM"),
  items: z.array(z.string()).describe("List of food items with quantities"),
  total_calories: z.number().int().nullable(),
  protein_grams: z.number().int().nullable(),
  prep_instructions: z.string().describe("Brief prep instructions, highlighting if it's no-cook or hostel-friendly")
});

export const GeneratedGroceryItemSchema = z.object({
  name: z.string(),
  monthly_quantity: z.number(),
  unit: z.string().describe("e.g. pieces, kg, liters, grams"),
  estimated_price: z.number().describe("Estimated market price in local currency"),
  category: z.enum(["Protein", "Carbohydrates", "Fruits", "Vegetables", "Dairy", "Snacks", "Other"]),
  is_optional: z.boolean(),
  reason: z.string()
});

export const GeneratedNutritionSchema = z.object({
  daily_calories: z.number().int().max(10000).nullable(),
  protein_grams: z.number().int().min(30).max(400).nullable(),
  meals_per_day: z.number().int().min(1).max(8).nullable(),
  meals: z.array(GeneratedMealSchema).default([]),
  grocery_list: z.array(GeneratedGroceryItemSchema).default([]),
  guidance: z.string().describe("General healthy eating tips reflecting allergies and preferences")
});

export const GeneratedLifestyleSchema = z.object({
  sleep_target_hours: z.number().min(4).max(12).nullable(),
  water_target_liters: z.number().min(1).max(6).nullable(),
  daily_steps_target: z.number().int().min(1000).max(30000).nullable()
});

export const GeneratedPlanSchema = z.object({
  plan: z.object({
    name: z.string(),
    description: z.string(),
    goal: z.string()
  }),
  workouts: z.array(GeneratedWorkoutSchema),
  nutrition: GeneratedNutritionSchema.nullable(),
  lifestyle: GeneratedLifestyleSchema.nullable()
});

export type GeneratedPlanData = z.infer<typeof GeneratedPlanSchema>;

export const CoachResponseSchema = z.object({
  message: z.string(),
  tone: z.enum(["supportive", "motivational", "informative"]),
  recommendations: z.array(z.string()),
  warnings: z.array(z.string())
});
export type CoachResponseData = z.infer<typeof CoachResponseSchema>;

export const WeeklyReviewSchema = z.object({
  summary: z.string(),
  highlights: z.array(z.string()),
  recommendations: z.array(z.string()),
  encouragement: z.string()
});
export type WeeklyReviewData = z.infer<typeof WeeklyReviewSchema>;

export const PlanAdjustmentSchema = z.object({
  should_adjust: z.boolean(),
  reason: z.string(),
  changes: z.array(z.object({
    workout_id: z.string().describe("Can be 'all' or specific workout ID if known by AI, else generic name"),
    change_type: z.string(),
    description: z.string()
  }))
});
export type PlanAdjustmentData = z.infer<typeof PlanAdjustmentSchema>;
