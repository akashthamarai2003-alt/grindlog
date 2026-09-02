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

// Keep the provider response contract strict for the two plan-generation
// routes. Without this, a model can return a mapping/object for `workouts`
// and the local parser only discovers the problem after the paid call.
export const FITNESS_PLAN_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: ["safety_acknowledgment", "plan", "workouts", "nutrition", "lifestyle"],
  properties: {
    safety_acknowledgment: { type: "string" },
    plan: {
      type: "object",
      additionalProperties: false,
      required: ["name", "description", "goal"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        goal: { type: "string" },
      },
    },
    workouts: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "workout_date", "duration_minutes", "exercises"],
        properties: {
          title: { type: "string" },
          workout_date: { type: "string" },
          duration_minutes: { type: "number" },
          exercises: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: [
                "name",
                "exercise_order",
                "sets",
                "reps_string",
                "target_reps_num",
                "rest_seconds",
                "notes",
              ],
              properties: {
                name: { type: "string" },
                exercise_order: { type: "number" },
                sets: { type: "number" },
                reps_string: { type: "string" },
                target_reps_num: { type: ["number", "null"] },
                rest_seconds: { type: "number" },
                notes: { type: ["string", "null"] },
              },
            },
          },
        },
      },
    },
    nutrition: {
      type: "object",
      additionalProperties: false,
      required: [
        "daily_calories",
        "protein_grams",
        "meals_per_day",
        "guidance",
        "meals",
        "grocery_list",
      ],
      properties: {
        daily_calories: { type: ["number", "null"] },
        protein_grams: { type: ["number", "null"] },
        meals_per_day: { type: ["number", "null"] },
        guidance: { type: "string" },
        meals: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "meal_name",
              "time_of_day",
              "items",
              "total_calories",
              "protein_grams",
              "prep_instructions",
            ],
            properties: {
              meal_name: { type: "string" },
              time_of_day: { type: "string" },
              items: { type: "array", items: { type: "string" } },
              total_calories: { type: ["number", "null"] },
              protein_grams: { type: ["number", "null"] },
              prep_instructions: { type: "string" },
            },
          },
        },
        grocery_list: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: [
              "name",
              "monthly_quantity",
              "unit",
              "estimated_price",
              "category",
              "is_optional",
              "reason",
            ],
            properties: {
              name: { type: "string" },
              monthly_quantity: { type: "number" },
              unit: { type: "string" },
              estimated_price: { type: "number" },
              category: { type: "string" },
              is_optional: { type: "boolean" },
              reason: { type: "string" },
            },
          },
        },
      },
    },
    lifestyle: {
      type: "object",
      additionalProperties: false,
      required: ["sleep_target_hours", "water_target_liters", "daily_steps_target"],
      properties: {
        sleep_target_hours: { type: ["number", "null"] },
        water_target_liters: { type: ["number", "null"] },
        daily_steps_target: { type: ["number", "null"] },
      },
    },
  },
};

export function buildFitnessPlanJsonSchema(
  exactWorkoutCount?: number,
): Record<string, unknown> {
  const schema = JSON.parse(JSON.stringify(FITNESS_PLAN_JSON_SCHEMA)) as Record<string, any>;
  if (typeof exactWorkoutCount === "number" && Number.isInteger(exactWorkoutCount) && exactWorkoutCount >= 0) {
    schema.properties.workouts.minItems = exactWorkoutCount;
    schema.properties.workouts.maxItems = exactWorkoutCount;
  }
  return schema;
}

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
