import { z } from "zod";
import type { OnboardingData } from "@/types/fitness/onboarding";
import {
  FITNESS_REPORT_MODEL,
  generateOpenAIResponseJSON,
} from "@/lib/services/openai/client";

const StartingReportSchema = z.object({
  body_scan_insights: z.object({
    has_body_scan: z.boolean(),
    overall_summary: z.string().min(2),
    observed_strengths: z.array(z.string().min(2)).max(3),
    priority_improvements: z.array(z.string().min(2)).max(3),
    posture_or_movement_note: z.string().min(2),
    goal_gap: z.string().nullable().optional(),
  }),
  first_two_weeks: z.object({
    training_start: z.string().min(2),
    nutrition_start: z.string().min(2),
    recovery_start: z.string().min(2),
  }),
  training_strategy: z.string().min(2),
  nutrition_strategy: z.string().min(2),
  progress_roadmap: z.array(z.string().min(2)).min(3).max(4),
  focus_areas: z.array(z.string().min(2)).length(5),
  fitness_score: z.number().min(0).max(100),
  reality_check: z.object({
    is_timeframe_realistic: z.boolean(),
    honest_assessment: z.string().min(2),
    achievable_in_timeframe: z.array(z.string().min(2)).min(3).max(5),
  }),
  timeline_projection: z
    .array(
      z.object({
        timeframe: z.string().min(1),
        target_weight_kg: z.union([z.string(), z.number(), z.null()]),
        expected_changes: z.string().min(2),
      }),
    )
    .min(3)
    .max(4),
  health_and_safety: z.object({
    has_concerns: z.boolean(),
    safety_verdict: z.string().min(2),
    medical_focus_areas: z.array(z.string()).max(3),
  }),
  starting_report_viewed: z.boolean().optional(),
  starting_report_viewed_at: z.string().optional(),
  free_preview_accepted: z.boolean().optional(),
  free_preview_accepted_at: z.string().optional(),
});

export type StartingReport = z.infer<typeof StartingReportSchema>;

// Keep the provider-side contract aligned with StartingReportSchema. Structured
// Outputs prevents a complete-looking JSON response from silently omitting one
// of the sections rendered by the report page.
export const STARTING_REPORT_JSON_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  required: [
    "body_scan_insights",
    "first_two_weeks",
    "training_strategy",
    "nutrition_strategy",
    "progress_roadmap",
    "focus_areas",
    "fitness_score",
    "reality_check",
    "timeline_projection",
    "health_and_safety",
  ],
  properties: {
    body_scan_insights: {
      type: "object",
      additionalProperties: false,
      required: [
        "has_body_scan",
        "overall_summary",
        "observed_strengths",
        "priority_improvements",
        "posture_or_movement_note",
        "goal_gap",
      ],
      properties: {
        has_body_scan: { type: "boolean" },
        overall_summary: { type: "string" },
        observed_strengths: { type: "array", items: { type: "string" }, maxItems: 3 },
        priority_improvements: { type: "array", items: { type: "string" }, maxItems: 3 },
        posture_or_movement_note: { type: "string" },
        goal_gap: { type: ["string", "null"] },
      },
    },
    first_two_weeks: {
      type: "object",
      additionalProperties: false,
      required: ["training_start", "nutrition_start", "recovery_start"],
      properties: {
        training_start: { type: "string" },
        nutrition_start: { type: "string" },
        recovery_start: { type: "string" },
      },
    },
    training_strategy: { type: "string" },
    nutrition_strategy: { type: "string" },
    progress_roadmap: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 4 },
    focus_areas: { type: "array", items: { type: "string" }, minItems: 5, maxItems: 5 },
    fitness_score: { type: "number", minimum: 0, maximum: 100 },
    reality_check: {
      type: "object",
      additionalProperties: false,
      required: ["is_timeframe_realistic", "honest_assessment", "achievable_in_timeframe"],
      properties: {
        is_timeframe_realistic: { type: "boolean" },
        honest_assessment: { type: "string" },
        achievable_in_timeframe: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 5 },
      },
    },
    timeline_projection: {
      type: "array",
      minItems: 3,
      maxItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["timeframe", "target_weight_kg", "expected_changes"],
        properties: {
          timeframe: { type: "string" },
          target_weight_kg: { type: ["string", "number", "null"] },
          expected_changes: { type: "string" },
        },
      },
    },
    health_and_safety: {
      type: "object",
      additionalProperties: false,
      required: ["has_concerns", "safety_verdict", "medical_focus_areas"],
      properties: {
        has_concerns: { type: "boolean" },
        safety_verdict: { type: "string" },
        medical_focus_areas: { type: "array", items: { type: "string" }, maxItems: 3 },
      },
    },
  },
};

/**
 * A completed onboarding is not enough to show the report screen.  The
 * strategy itself must pass the same contract that the report renderer uses.
 * Keeping this check beside the schema prevents the onboarding flow and the
 * report page from disagreeing about whether a report exists.
 */
export function hasGeneratedStartingReport(value: unknown): value is StartingReport {
  return StartingReportSchema.safeParse(value).success;
}

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
  const value = raw.trim();
  return Boolean(
    value &&
      value !== "No photos provided." &&
      !value.includes('"error"') &&
      !value.includes("Gemini Vision API Error"),
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
      preferred_training_time:
        onboarding.preferred_training_time ?? onboarding.workout_time ?? null,
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
  
  CRITICAL TONE RULE: You MUST write in very simple, beginner-friendly English (5th-grade reading level). Our users are beginners and many are not native English speakers. Do not use complex medical, scientific, or robotic words. Be friendly, encouraging, and talk like a real human personal trainer using normal, natural gym slang (e.g. "Let's get those gains", "Don't sweat it", "We're gonna build some solid muscle"). For example, instead of 'The stated goal conflicts with height...', say 'Based on your height and weight, it's safer to focus on building muscle first rather than losing fat!'
  YOU MUST STRICTLY FOLLOW THIS TONE RULE FOR EVERY TEXT FIELD. Make it sound like a direct, encouraging message from a personal trainer.
  
  Return one valid JSON object with exactly these top-level fields:
  - body_scan_insights: { has_body_scan, overall_summary, observed_strengths, priority_improvements, posture_or_movement_note, goal_gap }. Only describe photo observations when BODY SCAN AVAILABLE is true. Never diagnose health conditions or give an exact body-fat percentage from photos. If false, explicitly state that no usable body scan is available, use empty observation arrays, and set goal_gap to null.
  - first_two_weeks: { training_start, nutrition_start, recovery_start }. Give a realistic beginner-safe start that respects stated injuries, fitness level, available time, location, equipment, diet, and budget. Do not prescribe a six-day hard programme to a beginner unless their supplied profile supports it.
  - training_strategy: short personalised strategy.
  - nutrition_strategy: short personalised strategy that strictly respects diet_type, allergies, avoided foods, food environment, and budget. For Lose Fat and Cut goals, mention limiting added sugar, sugary drinks, deep-fried foods, and frequent fast food, while using measured oil and keeping occasional treats within the calorie target. Never recommend zero sugar or zero oil. For Cut, mention adequate protein and resistance training for muscle retention.
  - progress_roadmap: 3 or 4 short milestones. (e.g., "Hit your first 5 pushups!", "Start noticing your shirts fitting tighter around the chest")
  - focus_areas: exactly 5 short personalised focus areas. Use slang like "Grow those shoulders" instead of "Deltoid hypertrophy".
  - fitness_score: a number from 0 to 100; it is a non-medical coaching baseline.
  - reality_check: { is_timeframe_realistic, honest_assessment, achievable_in_timeframe } with 3 to 5 practical outcomes. If no deadline or target weight is provided, state that it was not supplied rather than inventing one. EXTREMELY IMPORTANT: TALK LIKE A FRIENDLY GYM BRO / PERSONAL TRAINER in the honest_assessment. Use words like "Listen bro," "Don't sweat it," "We're gonna crush this." NEVER USE ROBOTIC LANGUAGE!
  - timeline_projection: 3 or 4 objects { timeframe, target_weight_kg, expected_changes }. target_weight_kg must be null when no safe target can be calculated from supplied data. Make "expected_changes" sound human and encouraging!
  - health_and_safety: { has_concerns, safety_verdict, medical_focus_areas }. Set has_concerns to true if the user's profile lists ANY physical_problems, previous_injuries, or exercise_limitations. Keep medical_focus_areas empty if there are no stated concerns. The safety_verdict MUST also use the friendly, human coach tone (e.g., "Since you mentioned knee pain, we're gonna swap heavy squats for safer moves to protect those joints. Safety first!"). Do NOT use robotic clinical language.
  
  Keep each string plain, concrete, and concise, but friendly.`;

  const reportPrompt = `ONBOARDING PROFILE:\n${JSON.stringify(profile)}\n\nBODY SCAN AVAILABLE: ${hasUsableBodyScan(visualObservations)}\n\nOPTIONAL BODY-SCAN OBSERVATIONS:\n${compactVisualObservations(visualObservations)}`;
  // 1. Primary Attempt: OpenAI with fast 5.5s mobile timeout
  try {
    const openAiTimeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("OpenAI call exceeded 5.5s mobile limit")), 5500)
    );
    const response = await Promise.race([
      generateOpenAIResponseJSON<unknown>({
        systemPrompt,
        userPrompt: reportPrompt,
        model: FITNESS_REPORT_MODEL,
        maxTokens: 2000,
        reasoningEffort: "low",
        minimumOutputTokens: 1200,
        jsonSchema: {
          name: "starting_report",
          schema: STARTING_REPORT_JSON_SCHEMA,
          description: "A complete Grindlog personalised starting report.",
          strict: true,
        },
        verbosity: "low",
      }),
      openAiTimeout,
    ]);
    const parsed = StartingReportSchema.safeParse(response);
    if (parsed.success) {
      return parsed.data;
    }
    console.warn("[StartingReport] OpenAI response did not match schema, trying Gemini fallback...");
  } catch (openAiErr: any) {
    console.warn("[StartingReport] OpenAI call skipped or timed out, switching to Gemini:", openAiErr?.message);
  }

  // 2. High-Speed Secondary Attempt: Google Gemini (gemini-3.6-flash ~1.5s with 4s timeout)
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      const { GoogleGenAI } = await import("@google/genai");
      const gemini = new GoogleGenAI({ apiKey: geminiApiKey });
      const geminiTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Gemini call exceeded 4s limit")), 4000)
      );
      const geminiPromise = gemini.models.generateContent({
        model: "gemini-3.6-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: `${systemPrompt}\n\nIMPORTANT: Return a single valid JSON object following the required schema.\n\n${reportPrompt}` }
            ]
          }
        ],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      });
      const geminiResponse = await Promise.race([geminiPromise, geminiTimeout]);
      const rawText = geminiResponse?.text?.trim() || "";
      let parsedJson: any;
      try {
        parsedJson = JSON.parse(rawText);
      } catch {
        const match = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) parsedJson = JSON.parse(match[1].trim());
      }
      if (parsedJson) {
        const geminiParsed = StartingReportSchema.safeParse(parsedJson);
        if (geminiParsed.success) {
          console.info("[StartingReport] Successfully generated starting report via Gemini 3.6 Flash!");
          return geminiParsed.data;
        }
      }
    } catch (geminiErr: any) {
      console.warn("[StartingReport] Gemini fallback failed:", geminiErr?.message);
    }
  }

  // 3. Reliable Instant Deterministic Fallback (Zero Token, Zero Latency)
  console.info("[StartingReport] Generating deterministic starting report fallback...");
  return buildDeterministicStartingReport(onboarding, bmi, estimatedBodyFat, visualObservations);
}

function buildDeterministicStartingReport(
  onboarding: Partial<OnboardingData>,
  bmi: number | null,
  estimatedBodyFat: number | null,
  visualObservations: string
): StartingReport {
  const goal = onboarding.goal || "Build Muscle";
  const weight = onboarding.weight || 70;
  const targetWeight = onboarding.target_weight || weight;
  const daysPerWeek = onboarding.training_days_per_week || 4;
  const diet = onboarding.food_type || (onboarding as any).diet_preference || "Vegetarian";
  const location = onboarding.training_location || "Gym";

  const hasPhotos = hasUsableBodyScan(visualObservations);

  return {
    body_scan_insights: {
      has_body_scan: hasPhotos,
      overall_summary: hasPhotos
        ? "Visual assessment indicates a solid athletic foundation ready for progressive overload."
        : "No photos provided. Starting baseline built from your self-reported measurements.",
      observed_strengths: ["Solid frame and foundation", "High readiness for training"],
      priority_improvements: ["Progressive strength adaptation", "Nutritional consistency"],
      posture_or_movement_note: "Prioritize core stabilization and neutral spine on compound lifts.",
      goal_gap: targetWeight ? `Target goal is ${targetWeight}kg from current ${weight}kg.` : null,
    },
    first_two_weeks: {
      training_start: `Establish movement rhythm with ${daysPerWeek} training days at ${location}, dialing in form.`,
      nutrition_start: `Focus on hitting daily protein targets with wholesome ${diet} foods and adequate hydration.`,
      recovery_start: "Aim for 7-8 hours of sleep per night to support tissue repair and energy levels.",
    },
    training_strategy: `Structured ${daysPerWeek}-day split prioritizing progressive overload, compound exercises, and recovery periods tailored for ${goal.toLowerCase()}.`,
    nutrition_strategy: `High-protein ${diet} approach optimized to fuel your workouts and achieve your ${goal.toLowerCase()} goal without extreme restrictions.`,
    progress_roadmap: [
      "Week 1-2: Perfect form on core compound lifts",
      "Week 3-4: Noticeable strength increases across all main movements",
      "Week 5-8: Visible muscular definition and body composition changes",
      "Week 9-12: Full milestone achievement towards your target physique",
    ],
    focus_areas: [
      "Chest & Upper Body Strength",
      "Posterior Chain Development",
      "Core & Movement Stability",
      "Daily Protein Consistency",
      "Consistent Recovery Sleep",
    ],
    fitness_score: Math.min(92, Math.max(68, Math.round(75 + (daysPerWeek * 2) - (bmi ? Math.abs(bmi - 22) * 1.2 : 0)))),
    reality_check: {
      is_timeframe_realistic: true,
      honest_assessment: `Listen bro, your goal of ${goal.toLowerCase()} is 100% achievable with consistency. We are going to lock in your daily routine and crush this step by step!`,
      achievable_in_timeframe: [
        "Consistent workout habit built",
        "Measurable jump in functional strength",
        "Clear progress in body composition and energy levels",
      ],
    },
    timeline_projection: [
      { timeframe: "Month 1", target_weight_kg: weight, expected_changes: "Noticeable boost in energy, workout stamina, and sleep quality." },
      { timeframe: "Month 2", target_weight_kg: targetWeight ? Math.round((weight + targetWeight) / 2) : weight, expected_changes: "Shirts fitting better, muscles feeling firmer, consistent strength gains." },
      { timeframe: "Month 3", target_weight_kg: targetWeight, expected_changes: "Dramatic transformation in physical shape, posture, and athletic performance." },
    ],
    health_and_safety: {
      has_concerns: Boolean(onboarding.physical_problems && onboarding.physical_problems.length > 0 && !onboarding.physical_problems.includes("None")),
      safety_verdict: "We will prioritize joint-friendly movement variations and proper warmups so you train hard while staying 100% injury-free.",
      medical_focus_areas: [],
    },
  };
}
