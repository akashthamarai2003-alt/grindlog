import { z } from "zod";

export const GeneratedExerciseSchema = z.object({
  name: z.string(),
  exercise_order: z.number().optional(),
  sets: z.number().optional().default(3),
  reps_string: z.string().describe("e.g. '8-12' or '10'").optional().default(""),
  target_reps_num: z.number().nullable().optional(),
  rest_seconds: z.number().optional().default(60),
  notes: z.string().nullable().optional()
});

export const GeneratedWorkoutSchema = z.object({
  title: z.string(),
  workout_date: z.string().describe("YYYY-MM-DD").optional().default(""),
  duration_minutes: z.number().optional().default(45),
  exercises: z.array(GeneratedExerciseSchema).default([])
});

export const GeneratedMealSchema = z.object({
  meal_name: z.string().describe("e.g., Breakfast, Lunch, Snack").optional().default(""),
  time_of_day: z.string().describe("e.g., 08:00 AM").optional().default(""),
  items: z.array(z.string()).describe("List of food items with quantities").default([]),
  total_calories: z.number().nullable().optional(),
  protein_grams: z.number().nullable().optional(),
  prep_instructions: z.string().describe("Brief prep instructions, highlighting if it's no-cook or hostel-friendly").optional().default("")
});

export const GeneratedGroceryItemSchema = z.object({
  name: z.string(),
  monthly_quantity: z.number().optional().default(1),
  unit: z.string().describe("e.g. pieces, kg, liters, grams").optional().default(""),
  estimated_price: z.number().optional().default(0),
  category: z.string().optional().default("Other"),
  is_optional: z.boolean().optional().default(false),
  reason: z.string().optional().default("")
});

export const GeneratedNutritionSchema = z.object({
  daily_calories: z.number().nullable().optional(),
  protein_grams: z.number().nullable().optional(),
  meals_per_day: z.number().nullable().optional(),
  meals: z.array(GeneratedMealSchema).default([]),
  grocery_list: z.array(GeneratedGroceryItemSchema).default([]),
  guidance: z.string().describe("General healthy eating tips reflecting allergies and preferences").optional().default("")
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
