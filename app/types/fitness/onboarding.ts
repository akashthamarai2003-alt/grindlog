import { z } from "zod";

export const OnboardingSchema = z.object({
  name: z.string().optional(),
  country: z.string().optional(),
  preferred_language: z.string().optional(),

  goal: z.enum([
    "Lose Fat", 
    "Cut",
    "Build Muscle", 
    "Gain Weight",
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
  plan_start_preference: z.enum(["today", "monday"]).optional(),
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

function hasText(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

function hasChoice(values: unknown): boolean {
  return Array.isArray(values) && values.some((value) => hasText(value));
}

function isNumberInRange(value: unknown, minimum: number, maximum: number): boolean {
  return typeof value === "number" && Number.isFinite(value) && value >= minimum && value <= maximum;
}

/**
 * Required before onboarding can be submitted to the report/plan pipeline.
 * The base schema stays permissive so drafts can be edited, but the final
 * submission must contain every safety-critical field.
 */
export function getOnboardingCompletionIssues(data: Partial<OnboardingData>): string[] {
  const issues: string[] = [];

  if (!hasText(data.name) || !hasText(data.country) || !hasText(data.preferred_language) || !data.gender) {
    issues.push("complete your personal profile");
  }
  if (!isNumberInRange(data.age, 16, 120)) issues.push("enter a valid age");
  if (!isNumberInRange(data.height, 50, 250) || !isNumberInRange(data.weight, 30, 350)) {
    issues.push("enter valid height and weight");
  }
  if (!data.goal || !isNumberInRange(data.target_weight, 30, 350)) {
    issues.push("complete your goal and target weight");
  }
  if (!data.fitness_level || !isNumberInRange(data.training_days_per_week, 3, 7)) {
    issues.push("complete your training experience and frequency");
  }
  if (!data.training_location || !hasChoice(data.equipment)) {
    issues.push("choose your training environment and equipment");
  }
  if (!data.plan_start_preference || !isNumberInRange(data.workout_duration_minutes, 10, 90) || !hasText(data.preferred_training_time)) {
    issues.push("complete your training schedule");
  }
  if (!data.food_type || !data.meals_per_day || !data.food_environment) {
    issues.push("complete your nutrition profile");
  }
  if (!data.nutrition_budget) issues.push("choose a monthly food budget");
  if (data.target_deadline_days !== undefined && data.target_deadline_days !== null && !isNumberInRange(data.target_deadline_days, 7, 365)) {
    issues.push("use a goal deadline between 7 and 365 days");
  }
  if (!data.activity_level || !data.daily_steps || !data.sleep_duration) {
    issues.push("complete your lifestyle profile");
  }

  const physicalProblems = Array.isArray(data.physical_problems)
    ? data.physical_problems.filter((value) => hasText(value))
    : [];
  if (physicalProblems.length === 0) {
    issues.push("answer the physical-problems question");
  } else if (!physicalProblems.includes("None")) {
    if (!isNumberInRange(data.current_pain_severity, 0, 10) || !hasChoice(data.current_pain_triggers)) {
      issues.push("complete your current pain details");
    }
  }

  if (typeof data.previous_injuries !== "boolean") {
    issues.push("answer the previous-injuries question");
  } else if (data.previous_injuries && (!hasChoice(data.previous_injury_areas) || !hasText(data.previous_injury_timeline))) {
    issues.push("complete your previous-injury details");
  }
  if (!hasChoice(data.exercise_limitations)) issues.push("answer the exercise-limitations question");
  if (data.safety_acknowledged !== true) issues.push("acknowledge the safety information");
  if (!hasText(data.target_physique) && !hasText(data.goal_physique_image) && !hasText(data.body_scan_inspiration)) {
    issues.push("select a target physique or upload a goal photo");
  }

  return issues;
}
