import { z } from "zod";

const safeNumber = z.preprocess((val) => {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const parsed = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}, z.number());

const safeArray = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((val: any) => {
  if (typeof val === 'string') return [];
  if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
    return Object.values(val);
  }
  return val;
}, z.union([z.array(schema), z.null(), z.undefined()]).transform(val => val || []));

export const GeneratedExerciseSchema = z.object({
  name: z.coerce.string(),
  exercise_order: safeNumber.optional(),
  sets: safeNumber.optional().default(3),
  reps_string: z.coerce.string().describe("e.g. '8-12' or '10'").optional().default(""),
  target_reps_num: safeNumber.nullable().optional(),
  rest_seconds: safeNumber.optional().default(60),
  notes: z.coerce.string().nullable().optional()
});

export const GeneratedWorkoutSchema = z.object({
  title: z.coerce.string(),
  workout_date: z.coerce.string().describe("YYYY-MM-DD").optional().default(""),
  duration_minutes: safeNumber.optional().default(45),
  exercises: safeArray(GeneratedExerciseSchema)
});

export const GeneratedMealSchema = z.object({
  meal_name: z.coerce.string().describe("e.g., Breakfast, Lunch, Snack").optional().default(""),
  time_of_day: z.coerce.string().describe("e.g., 08:00 AM").optional().default(""),
  items: safeArray(z.coerce.string()),
  total_calories: safeNumber.nullable().optional(),
  protein_grams: safeNumber.nullable().optional(),
  prep_instructions: z.coerce.string().describe("Brief prep instructions, highlighting if it's no-cook or hostel-friendly").optional().default("")
});

export const GeneratedGroceryItemSchema = z.object({
  name: z.coerce.string(),
  monthly_quantity: safeNumber.optional().default(1),
  unit: z.coerce.string().describe("e.g. pieces, kg, liters, grams").optional().default(""),
  estimated_price: safeNumber.optional().default(0),
  category: z.coerce.string().optional().default("Other"),
  is_optional: z.coerce.boolean().optional().default(false),
  reason: z.coerce.string().optional().default("")
});

export const GeneratedNutritionSchema = z.object({
  daily_calories: safeNumber.nullable().optional(),
  protein_grams: safeNumber.nullable().optional(),
  meals_per_day: safeNumber.nullable().optional(),
  meals: safeArray(GeneratedMealSchema),
  grocery_list: safeArray(GeneratedGroceryItemSchema),
  guidance: z.coerce.string().describe("General healthy eating tips reflecting allergies and preferences").optional().default("")
});

export const GeneratedLifestyleSchema = z.object({
  sleep_target_hours: safeNumber.nullable().optional(),
  water_target_liters: safeNumber.nullable().optional(),
  daily_steps_target: safeNumber.nullable().optional()
});

export const GeneratedPlanSchema = z.preprocess(
  (val: any) => {
    if (!val || typeof val !== 'object') return val;
    if (!val.plan && (val.name || val.description || val.goal)) {
      val.plan = {
        name: val.name || "Custom Fitness Plan",
        description: val.description || "Your personalized plan.",
        goal: val.goal || "Fitness"
      };
    }
    if (!val.plan) {
      val.plan = {
        name: "Custom Fitness Plan",
        description: "Your personalized plan.",
        goal: "Fitness"
      };
    }
    return val;
  },
  z.object({
    safety_acknowledgment: z.coerce.string().describe("Explicit acknowledgment of all limitations and forbidden exercises").optional(),
    plan: z.object({
      name: z.coerce.string(),
      description: z.coerce.string(),
      goal: z.coerce.string()
    }),
    workouts: safeArray(GeneratedWorkoutSchema),
    nutrition: GeneratedNutritionSchema.nullable().optional(),
    lifestyle: GeneratedLifestyleSchema.nullable().optional()
  })
);

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
