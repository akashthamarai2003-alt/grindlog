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

export const GeneratedNutritionSchema = z.object({
  daily_calories: z.number().int().max(10000).nullable(),
  protein_grams: z.number().int().min(30).max(400).nullable(),
  meals_per_day: z.number().int().min(1).max(8).nullable(),
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
