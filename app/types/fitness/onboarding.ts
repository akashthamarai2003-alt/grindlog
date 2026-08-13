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

  target_physique: z.enum([
    "Lean Athletic",
    "Muscular",
    "Six Pack",
    "Men's Physique",
    "Bodybuilder",
    "Sporty",
    "Strong & Functional"
  ]).optional(),
  goal_physique_image: z.string().optional(),
  
  fitness_level: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
  
  age: z.number().min(16, "Must be at least 16").max(120, "Please enter a valid age").optional(),
  height: z.number().min(50, "Height seems too low").max(300, "Height seems too high").optional(),
  weight: z.number().min(30, "Weight seems too low").max(400, "Weight seems too high").optional(),
  target_weight: z.number().min(30).max(400).optional(),
  target_deadline_days: z.number().min(1).max(3650).optional(),
  waist_cm: z.number().min(20).max(300).optional(),
  chest_cm: z.number().min(20).max(300).optional(),
  arm_cm: z.number().min(10).max(100).optional(),
  thigh_cm: z.number().min(10).max(150).optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  
  training_location: z.enum(["Gym", "Home", "Outdoor", "Combination"]).optional(),
  equipment: z.array(z.string()).optional(),
  
  training_days_per_week: z.number().min(1).max(7).optional(),
  workout_duration_minutes: z.number().min(10).max(180).optional(),
  preferred_training_days: z.array(z.string()).optional(),
  preferred_training_time: z.string().optional(),
  
  food_type: z.enum(["Vegetarian", "Eggetarian", "Non-Vegetarian", "Vegan"]).optional(),
  food_environment: z.enum(["Home", "PG", "Hostel", "Office/Canteen", "I Cook", "Mixed"]).optional(),
  meals_per_day: z.enum(["2 meals", "3 meals", "4 meals", "5+ meals"]).optional(),
  nutrition_budget: z.enum(["₹0–1,000", "₹1,000–2,000", "₹2,000–5,000", "₹5,000+"]).optional(),
  available_foods: z.array(z.string()).optional(),
  food_allergies: z.string().optional(),
  foods_disliked: z.string().optional(),
  foods_avoided: z.string().optional(),
  
  activity_level: z.enum(["Mostly sitting", "Lightly active", "Moderately active", "Very active"]).optional(),
  daily_steps: z.enum(["<3k", "3–5k", "5–10k", "10k+"]).optional(),
  sleep_duration: z.enum(["<5h", "5–6h", "6–7h", "7–8h", "8h+"]).optional(),
  
  wake_time: z.string().optional(),
  sleep_time: z.string().optional(),
  workout_time: z.string().optional(),
  work_time: z.string().optional(),
  
  physical_problems: z.array(z.string()).optional(),
  previous_injuries: z.boolean().optional(),
  previous_injury_areas: z.array(z.string()).optional(),
  previous_injury_timeline: z.string().optional(),
  current_pain_severity: z.number().min(0).max(10).optional(),
  current_pain_triggers: z.array(z.string()).optional(),
  exercise_limitations: z.array(z.string()).optional(),
  medical_guidance: z.string().optional(),
  additional_health_notes: z.string().optional(),
  safety_acknowledged: z.boolean().optional(),
  
  lifestyle_description: z.string().optional(),
  
  body_scan_front: z.string().optional(),
  body_scan_left: z.string().optional(),
  body_scan_right: z.string().optional(),
  body_scan_back: z.string().optional(),
  body_scan_inspiration: z.string().optional(),
  
  ai_strategy: z.record(z.any()).optional()
});

export type OnboardingData = z.infer<typeof OnboardingSchema>;
