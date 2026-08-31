import { z } from "zod";
import type { OnboardingData } from "@/types/fitness/onboarding";
import { generateOpenAIResponseJSON } from "@/lib/services/openai/client";

const StartingReportSchema = z.object({
  body_scan_insights: z.object({
    has_body_scan: z.boolean(),
    overall_summary: z.string().min(20),
    observed_strengths: z.array(z.string().min(4)).max(3),
    priority_improvements: z.array(z.string().min(4)).max(3),
    posture_or_movement_note: z.string().min(10),
  }),
  first_two_weeks: z.object({
    training_start: z.string().min(20).max(180),
    nutrition_start: z.string().min(20).max(180),
    recovery_start: z.string().min(20).max(180),
  }),
  training_strategy: z.string().min(20).max(350),
  nutrition_strategy: z.string().min(20).max(350),
  focus_areas: z.array(z.string().min(3)).length(5),
  reality_check: z.object({
    is_timeframe_realistic: z.boolean(),
    honest_assessment: z.string().min(20).max(260),
    achievable_in_timeframe: z.array(z.string().min(4).max(90)).min(3).max(3),
  }),
  health_and_safety: z.object({
    has_concerns: z.boolean(),
    safety_verdict: z.string().min(10).max(260),
    medical_focus_areas: z.array(z.string()).max(3),
  }),
});

export type StartingReport = z.infer<typeof StartingReportSchema>;

type StartingReportInput = {
  onboarding: OnboardingData;
  bmi: number | null;
  estimatedBodyFat: number | null;
  visualObservations: string;
};

function compactVisualObservations(raw: string): string {
  if (!raw || raw === "No photos provided.") return "No body-scan photos were provided.";

  // Vision analysis can be long. A concise extract is enough for the report and
  // prevents an uploaded-photo analysis from inflating every OpenAI request.
  return raw.slice(0, 2800);
}

function hasUsableBodyScan(raw: string): boolean {
  return Boolean(
    raw
    && raw !== "No photos provided."
    && !raw.includes('"error"'),
  );
}

export async function generateStartingReport({
  onboarding,
  bmi,
  estimatedBodyFat,
  visualObservations,
}: StartingReportInput): Promise<StartingReport> {
  const profile = {
    demographics: {
      gender: onboarding.gender ?? null,
      age: onboarding.age ?? null,
      height_cm: onboarding.height ?? null,
      weight_kg: onboarding.weight ?? null,
      target_weight_kg: onboarding.target_weight ?? null,
      goal: onboarding.goal ?? null,
      target_deadline_days: onboarding.target_deadline_days ?? null,
      target_physique: onboarding.target_physique ?? null,
    },
    measurements: {
      waist_cm: onboarding.waist_cm ?? null,
      chest_cm: onboarding.chest_cm ?? null,
      arm_cm: onboarding.arm_cm ?? null,
      thigh_cm: onboarding.thigh_cm ?? null,
      bmi,
      estimated_body_fat_percent: estimatedBodyFat,
    },
    training: {
      fitness_level: onboarding.fitness_level ?? null,
      days_per_week: onboarding.training_days_per_week ?? null,
      duration_minutes: onboarding.workout_duration_minutes ?? null,
      location: onboarding.training_location ?? null,
      equipment: onboarding.equipment ?? [],
      activity_level: onboarding.activity_level ?? null,
      daily_steps: onboarding.daily_steps ?? null,
      preferred_training_time: onboarding.preferred_training_time ?? onboarding.workout_time ?? null,
      sleep_duration: onboarding.sleep_duration ?? null,
    },
    nutrition: {
      diet_type: onboarding.food_type ?? null,
      food_environment: onboarding.food_environment ?? null,
      meals_per_day: onboarding.meals_per_day ?? null,
      nutrition_budget: onboarding.nutrition_budget ?? null,
      available_foods: onboarding.available_foods ?? [],
      allergies: onboarding.food_allergies ?? null,
      foods_disliked: onboarding.foods_disliked ?? null,
      foods_avoided: onboarding.foods_avoided ?? null,
    },
    health: {
      physical_problems: onboarding.physical_problems ?? [],
      previous_injuries: onboarding.previous_injuries ?? false,
      previous_injury_areas: onboarding.previous_injury_areas ?? [],
      current_pain_severity: onboarding.current_pain_severity ?? null,
      exercise_limitations: onboarding.exercise_limitations ?? [],
      medical_guidance: onboarding.medical_guidance ?? null,
    },
  };

  const systemPrompt = `You are Grindlog's cautious fitness coach. Create a concise starting report using only the supplied onboarding profile and optional vision observations. Do not invent a measurement, target, injury, food preference, budget, or photo finding. This is coaching guidance, not medical advice.

Return one valid JSON object with exactly these top-level fields. The report must be readable in under one minute; avoid repetition.
- body_scan_insights: { has_body_scan, overall_summary, observed_strengths, priority_improvements, posture_or_movement_note }. Only describe photo observations when body_scan_available is true. Never diagnose health conditions or give an exact body-fat percentage from photos. If false, explicitly state that no usable body scan is available and use empty observation arrays.
- first_two_weeks: { training_start, nutrition_start, recovery_start }. Each value must be one short action, maximum 24 words. Give a realistic beginner-safe start that respects stated injuries, fitness level, available time, location, equipment, diet, and budget. Do not prescribe a six-day hard programme to a beginner unless their supplied profile supports it.
- training_strategy: short personalised strategy for the detailed plan, maximum 60 words.
- nutrition_strategy: short personalised strategy for the detailed plan that strictly respects diet_type, allergies, avoided foods, food environment, and budget, maximum 60 words.
- focus_areas: exactly 5 short personalised focus areas.
- reality_check: { is_timeframe_realistic, honest_assessment, achievable_in_timeframe } with exactly 3 practical outcomes. honest_assessment must be maximum 40 words. If no deadline or target weight is provided, state that it was not supplied rather than inventing one.
- health_and_safety: { has_concerns, safety_verdict, medical_focus_areas }. Keep medical_focus_areas empty if there are no stated concerns. safety_verdict must be maximum 40 words.

Use Indian rupees only when the supplied budget is in rupees. Keep each string plain, concrete, and concise.`;

  const response = await generateOpenAIResponseJSON<unknown>({
    systemPrompt,
    userPrompt: `ONBOARDING PROFILE:\n${JSON.stringify(profile)}\n\nBODY SCAN AVAILABLE: ${hasUsableBodyScan(visualObservations)}\n\nOPTIONAL BODY-SCAN OBSERVATIONS:\n${compactVisualObservations(visualObservations)}`,
    maxTokens: 1100,
    // This report is bounded and should not use the high-reasoning plan budget.
    reasoningEffort: "low",
    minimumOutputTokens: 1800,
  });

  const parsed = StartingReportSchema.safeParse(response);
  if (!parsed.success) {
    throw new Error("OpenAI returned an incomplete starting report.");
  }

  return parsed.data;
}
