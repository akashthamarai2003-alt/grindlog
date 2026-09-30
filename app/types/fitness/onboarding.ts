import { z } from "zod";

export const OnboardingSchema = z.object({
  name: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  preferred_language: z.string().nullable().optional(),

  goal: z.enum([
    "Lose Fat", 
    "Cut",
    "Build Muscle", 
    "Gain Weight",
    "Lose Fat + Build Muscle", 
    "Build Strength", 
    "Improve Fitness", 
    "Maintain"
  ]).nullable().optional(),

  target_physique: z.enum([
    "Lean Athletic",
    "Muscular",
    "Six Pack",
    "Men's Physique",
    "Bodybuilder",
    "Sporty",
    "Strong & Functional"
  ]).nullable().optional(),
  goal_physique_image: z.string().nullable().optional(),
  
  fitness_level: z.enum(["Beginner", "Intermediate", "Advanced"]).nullable().optional(),
  
  age: z.number().min(16, "Must be at least 16").max(120, "Please enter a valid age").nullable().optional(),
  height: z.number().min(50, "Height seems too low").max(300, "Height seems too high").nullable().optional(),
  weight: z.number().min(30, "Weight seems too low").max(400, "Weight seems too high").nullable().optional(),
  target_weight: z.number().min(30).max(400).nullable().optional(),
  target_deadline_days: z.number().min(1).max(3650).nullable().optional(),
  waist_cm: z.number().min(20).max(300).nullable().optional(),
  chest_cm: z.number().min(20).max(300).nullable().optional(),
  arm_cm: z.number().min(10).max(100).nullable().optional(),
  thigh_cm: z.number().min(10).max(150).nullable().optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).nullable().optional(),
  
  training_location: z.enum(["Gym", "Home", "Outdoor", "Combination"]).nullable().optional(),
  equipment: z.array(z.string()).nullable().optional(),
  
  training_days_per_week: z.number().min(1).max(7).nullable().optional(),
  workout_duration_minutes: z.number().min(10).max(180).nullable().optional(),
  plan_start_preference: z.enum(["today", "monday"]).nullable().optional(),
  preferred_training_days: z.array(z.string()).nullable().optional(),
  preferred_training_time: z.string().nullable().optional(),
  
  food_type: z.enum(["Vegetarian", "Eggetarian", "Non-Vegetarian", "Vegan"]).nullable().optional(),
  food_environment: z.enum(["Home", "PG", "Hostel", "Office/Canteen", "I Cook", "Mixed"]).nullable().optional(),
  meals_per_day: z.enum(["2 meals", "3 meals", "4 meals", "5+ meals"]).nullable().optional(),
  nutrition_budget: z.enum(["₹0–1,000", "₹1,000–2,000", "₹2,000–5,000", "₹5,000+"]).nullable().optional(),
  available_foods: z.array(z.string()).nullable().optional(),
  food_allergies: z.string().nullable().optional(),
  foods_disliked: z.string().nullable().optional(),
  foods_avoided: z.string().nullable().optional(),
  nutrition_medical_conditions: z.array(z.enum([
    "None", "Diabetes", "Kidney disease", "Pregnancy or breastfeeding", "Other medical diet"
  ])).nullable().optional(),
  
  activity_level: z.enum(["Mostly sitting", "Lightly active", "Moderately active", "Very active"]).nullable().optional(),
  daily_steps: z.enum(["<3k", "3–5k", "5–10k", "10k+"]).nullable().optional(),
  sleep_duration: z.enum(["<5h", "5–6h", "6–7h", "7–8h", "8h+"]).nullable().optional(),
  
  wake_time: z.string().nullable().optional(),
  sleep_time: z.string().nullable().optional(),
  workout_time: z.string().nullable().optional(),
  work_time: z.string().nullable().optional(),
  
  physical_problems: z.array(z.string()).nullable().optional(),
  previous_injuries: z.boolean().nullable().optional(),
  previous_injury_areas: z.array(z.string()).nullable().optional(),
  previous_injury_timeline: z.string().nullable().optional(),
  current_pain_severity: z.number().min(0).max(10).nullable().optional(),
  current_pain_triggers: z.array(z.string()).nullable().optional(),
  exercise_limitations: z.array(z.string()).nullable().optional(),
  medical_guidance: z.string().nullable().optional(),
  additional_health_notes: z.string().nullable().optional(),
  safety_acknowledged: z.boolean().nullable().optional(),
  
  lifestyle_description: z.string().nullable().optional(),
  
  body_scan_front: z.string().nullable().optional(),
  body_scan_left: z.string().nullable().optional(),
  body_scan_right: z.string().nullable().optional(),
  body_scan_back: z.string().nullable().optional(),
  body_scan_inspiration: z.string().nullable().optional(),
  
  ai_strategy: z.record(z.any()).nullable().optional()
});

export type OnboardingData = z.infer<typeof OnboardingSchema>;

function hasText(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed === "Other:" || trimmed === "Other") return false;
  if (trimmed.startsWith("Other:")) {
    return trimmed.slice(6).trim().length > 0;
  }
  return true;
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
