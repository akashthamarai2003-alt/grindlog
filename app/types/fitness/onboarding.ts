import { z } from "zod";

export const OnboardingSchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
  preferred_language: z.string().optional(),

  goal: z.enum([
    "Lose Fat", 
    "Build Muscle", 
    "Lose Fat + Build Muscle", 
    "Build Strength", 
    "Improve Fitness", 
    "Maintain"
  ]).optional(),
  
  fitness_level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  
  age: z.number().min(16, "Must be at least 16").max(120, "Please enter a valid age").optional(),
  height: z.number().min(50, "Height seems too low").max(300, "Height seems too high").optional(),
  weight: z.number().min(30, "Weight seems too low").max(400, "Weight seems too high").optional(),
  target_weight: z.number().min(30).max(400).optional(),
  waist_cm: z.number().min(20).max(300).optional(),
  chest_cm: z.number().min(20).max(300).optional(),
  arm_cm: z.number().min(10).max(100).optional(),
  thigh_cm: z.number().min(10).max(150).optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  
  training_location: z.enum(["Gym", "Home", "Outdoor", "Mixed"]).optional(),
  equipment: z.array(z.string()).optional(),
  
  training_days_per_week: z.number().min(1).max(7).optional(),
  workout_duration_minutes: z.number().min(10).max(180).optional(),
  preferred_training_days: z.array(z.string()).optional(),
  preferred_training_time: z.string().optional(),
  
  diet_preference: z.enum(["No Preference", "Vegetarian", "Vegan", "Non-Vegetarian", "Other"]).optional(),
  food_avoidances: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  meals_per_day: z.number().min(1).max(10).optional(),
  nutrition_budget: z.string().optional(),
  
  activity_level: z.enum(["Mostly sedentary", "Lightly active", "Moderately active", "Very active"]).optional(),
  sleep_duration: z.number().min(3).max(16).optional(),
  wake_time: z.string().optional(),
  sleep_time: z.string().optional(),
  lifestyle_description: z.string().optional()
});

export type OnboardingData = z.infer<typeof OnboardingSchema>;
