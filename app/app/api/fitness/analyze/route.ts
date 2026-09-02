import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { OnboardingSchema } from "@/types/fitness/onboarding";
import {
  generateStartingReport,
  hasGeneratedStartingReport,
} from "@/lib/services/fitness/starting-report-service";
import {
  BODY_SCAN_RESPONSE_INSTRUCTIONS,
  parseBodyScanAnalysis,
} from "@/lib/fitness/body-scan";

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function stripImagePayload(value: Record<string, unknown>): Record<string, unknown> {
  const {
    body_scan_front,
    body_scan_left,
    body_scan_right,
    body_scan_back,
    body_scan_inspiration,
    goal_physique_image,
    ...safeData
  } = value;

  return safeData;
}

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Not authenticated" },
        { status: 401 },
      );
    }

    const payload = await req.json();
    const result = OnboardingSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid data provided" },
        { status: 400 },
      );
    }

    const data = result.data;
    const hasUploadedBodyScan = Boolean(
      data.body_scan_front ||
        data.body_scan_left ||
        data.body_scan_right ||
        data.body_scan_back ||
        data.goal_physique_image ||
        data.body_scan_inspiration,
    );

    // Back/reload/reopen must not create another paid starting report when the
    // user has already submitted the exact same onboarding profile. A fresh
    // photo upload needs a new vision analysis even when every text answer is
    // unchanged, so it must never use this reuse path.
    const { data: existingProfile } = await supabase
      .from("fitness_os_profiles")
      .select("onboarding_completed, onboarding_data, ai_strategy")
      .eq("user_id", user.id)
      .maybeSingle();

    if (
      !hasUploadedBodyScan &&
      existingProfile?.onboarding_completed &&
      stableStringify(existingProfile.onboarding_data) ===
        stableStringify(stripImagePayload(data as Record<string, unknown>)) &&
      hasGeneratedStartingReport(existingProfile.ai_strategy)
    ) {
      return NextResponse.json({
        success: true,
        reused: true,
        ai_strategy: existingProfile.ai_strategy,
      });
    }

    // Optional: Extract images for Gemini Vision
    const images: Array<{ label: string; inlineData: { data: string; mimeType: string } }> = [];
    const addImage = (label: string, base64Str?: string) => {
      if (base64Str && base64Str.startsWith("data:image")) {
        const [meta, data] = base64Str.split(",");
        const mimeType = meta.split(";")[0].split(":")[1];
        images.push({
          label,
          inlineData: {
            data,
            mimeType,
          },
        });
      }
    };

    addImage("CURRENT BODY — FRONT VIEW", data.body_scan_front);
    addImage("CURRENT BODY — LEFT SIDE VIEW", data.body_scan_left);
    addImage("CURRENT BODY — RIGHT SIDE VIEW", data.body_scan_right);
    addImage("CURRENT BODY — BACK VIEW", data.body_scan_back);
    addImage(
      "GOAL PHYSIQUE — INSPIRATION ONLY, NOT THE USER'S CURRENT BODY",
      data.goal_physique_image || data.body_scan_inspiration,
    );

    let visualObservations = "No photos provided.";
    let visionAnalysisSucceeded = false;

    if (images.length > 0) {
      console.log(`Sending ${images.length} images to Google Gemini Vision...`);
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) throw new Error("GEMINI_API_KEY missing");

        const gemini = new GoogleGenAI({ apiKey });
        const models = [
          process.env.GEMINI_VISION_MODEL?.trim() || "gemini-3.6-flash",
          "gemini-2.5-pro",
        ].filter((model, index, list) => list.indexOf(model) === index);
        let response: Awaited<ReturnType<typeof gemini.models.generateContent>> | null = null;
        let lastModelError: unknown;
        for (const model of models) {
          try {
            response = await gemini.models.generateContent({
              model,
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `You are a cautious fitness coach. Analyse the labelled images below. The current-body views show the user from different angles; the optional goal-physique image is only a reference for direction. Keep the response concise, encouraging, and practical.\n${BODY_SCAN_RESPONSE_INSTRUCTIONS}`,
                    },
                    ...images.flatMap((image) => [
                      { text: image.label },
                      { inlineData: image.inlineData },
                    ]),
                  ],
                },
              ],
              config: {
                temperature: 0.2,
                responseMimeType: "application/json",
              },
            });
            break;
          } catch (modelError) {
            lastModelError = modelError;
            if (!String(modelError).includes("404") || model === models[models.length - 1]) {
              throw modelError;
            }
            console.warn(`Gemini model ${model} was not found; trying fallback model.`);
          }
        }
        if (!response) throw lastModelError || new Error("Gemini returned no response.");

        const bodyScan = parseBodyScanAnalysis(response.text);
        if (!bodyScan) {
          throw new Error("Gemini returned an invalid body-scan analysis.");
        }
        visualObservations = JSON.stringify(bodyScan);
        visionAnalysisSucceeded = true;
        console.log("Gemini Vision Observations:", visualObservations);
      } catch (err) {
        console.error("Gemini Vision API Error:", err);
      }
    }

    // Calculate baseline math metrics (BMI, Body Fat %, BMR)
    let bmi = null;
    if (data.height && data.weight) {
      const heightInMeters = data.height / 100;
      bmi = parseFloat((data.weight / (heightInMeters * heightInMeters)).toFixed(1));
    }

    let estimated_body_fat = null;
    if (data.height && data.waist_cm) {
      if (data.gender === "Female") {
        const logVal = Math.log10(data.waist_cm + (data.waist_cm + 15) - 35);
        const logHeight = Math.log10(data.height);
        estimated_body_fat = Math.max(
          10,
          Math.min(
            50,
            parseFloat(
              (495 / (1.29579 - 0.35004 * logVal + 0.221 * logHeight) - 450).toFixed(1),
            ),
          ),
        );
      } else {
        const neck = 38;
        const diff = Math.max(10, data.waist_cm - neck);
        const logDiff = Math.log10(diff);
        const logHeight = Math.log10(data.height);
        estimated_body_fat = Math.max(
          5,
          Math.min(
            50,
            parseFloat(
              (495 / (1.0324 - 0.19077 * logDiff + 0.15456 * logHeight) - 450).toFixed(1),
            ),
          ),
        );
      }
    }

    // The personalised report is generated once from this exact onboarding data.
    // Groq remains isolated to the in-app chatbot.
    console.log("Generating personalised starting report...");
    let aiStrategy: Record<string, unknown> = {};
    let reportGenerationFailed = false;
    try {
      aiStrategy = await generateStartingReport({
        onboarding: data,
        bmi,
        estimatedBodyFat: estimated_body_fat,
        visualObservations,
      });

      // Gemini is the source of truth for photo observations. Preserve its
      // validated result in the report strategy so the report cannot hide a
      // successful scan merely because the second report model summarised it
      // incorrectly.
      const structuredBodyScan = parseBodyScanAnalysis(visualObservations);
      if (structuredBodyScan) {
        aiStrategy.body_scan_insights = {
          has_body_scan: true,
          overall_summary: structuredBodyScan.overall_summary,
          observed_strengths: structuredBodyScan.observed_strengths,
          priority_improvements: structuredBodyScan.priority_improvements,
          posture_or_movement_note: structuredBodyScan.posture_or_movement_note,
        };
      }
      console.log("AI Strategy Generated:", aiStrategy);
    } catch (err) {
      console.error("OpenAI starting report error:", err);
      // Preserve the completed onboarding so the user can retry from the
      // report screen, but never present this failed state as a ready report.
      reportGenerationFailed = true;
      aiStrategy = {
        generation_status: "failed",
        generation_error: "Your personalised report could not be generated yet.",
      };
    }

    let baseline_calories = null;
    if (data.weight && data.height && data.age && data.gender) {
      let bmr = 0;
      if (data.gender === "Male") {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age + 5;
      } else if (data.gender === "Female") {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 161;
      } else {
        bmr = 10 * data.weight + 6.25 * data.height - 5 * data.age - 78;
      }

      const activityMultipliers: Record<string, number> = {
        "Mostly sitting": 1.2,
        "Lightly active": 1.375,
        "Moderately active": 1.55,
        "Very active": 1.725,
      };
      const multiplier = data.activity_level
        ? activityMultipliers[data.activity_level] || 1.2
        : 1.2;
      baseline_calories = Math.round(bmr * multiplier);
    }

    let initial_protein_target = null;
    if (data.weight) {
      let proteinMultiplier = 1.6;
      if (
        data.goal === "Build Muscle" ||
        data.goal === "Gain Weight" ||
        data.goal === "Lose Fat + Build Muscle"
      ) {
        proteinMultiplier = 2.0;
      } else if (data.goal === "Build Strength") {
        proteinMultiplier = 1.8;
      }
      initial_protein_target = Math.round(data.weight * proteinMultiplier);
    }

    const weight_trend_baseline = data.weight || null;

    // Remove massive base64 images before saving
    const safeData = stripImagePayload(data as Record<string, unknown>);

    // Save to database
    const { error: upsertError } = await supabase.from("fitness_os_profiles").upsert(
      {
        user_id: user.id,

        // Basic Info
        goal: data.goal,
        fitness_level: data.fitness_level,
        age: data.age,
        height: data.height,
        weight: data.weight,
        target_weight: data.target_weight,
        gender: data.gender,

        // Training
        training_location: data.training_location,
        equipment: data.equipment,
        training_days_per_week: data.training_days_per_week,
        workout_duration_minutes: data.workout_duration_minutes,
        preferred_training_days: data.preferred_training_days,
        preferred_training_time: data.preferred_training_time || data.workout_time,

        // Nutrition & Lifestyle
        diet_preference: data.food_type,
        food_type: data.food_type,
        food_environment: data.food_environment,
        meals_per_day: data.meals_per_day,
        available_foods: data.available_foods,
        food_allergies: data.food_allergies,
        foods_disliked: data.foods_disliked,
        foods_avoided: data.foods_avoided,
        nutrition_budget: data.nutrition_budget,
        activity_level: data.activity_level,
        daily_steps: data.daily_steps,
        sleep_duration: data.sleep_duration,
        wake_time: data.wake_time,
        workout_time: data.workout_time,
        work_time: data.work_time,
        sleep_time: data.sleep_time,
        lifestyle_description: data.lifestyle_description,

        // Physical Concerns & Injuries
        physical_problems: data.physical_problems,
        current_pain_severity: data.current_pain_severity,
        current_pain_triggers: data.current_pain_triggers,
        previous_injuries: data.previous_injuries,
        previous_injury_areas: data.previous_injury_areas,
        previous_injury_timeline: data.previous_injury_timeline,
        exercise_limitations: data.exercise_limitations,
        medical_guidance: data.medical_guidance,
        additional_health_notes: data.additional_health_notes,
        safety_acknowledged: data.safety_acknowledged,

        // Body Scans & Physique
        target_physique:
          data.target_physique ||
          (data.goal_physique_image ? "Custom Photo" : "Not specified"),

        // Computed Data
        bmi,
        baseline_calories,
        initial_protein_target,
        weight_trend_baseline,
        ai_strategy: aiStrategy,
        onboarding_data: safeData,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );

    if (upsertError) {
      console.error("Failed to save fitness profile:", upsertError);
      return NextResponse.json(
        { success: false, error: "Failed to save profile." },
        { status: 500 },
      );
    }

    // Save visual observations to scans table so generate-draft can use it
    if (images.length > 0 && visionAnalysisSucceeded) {
      await supabase.from("fitness_os_scans").upsert(
        {
          user_id: user.id,
          gemini_analysis: visualObservations,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }

    if (reportGenerationFailed) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Your onboarding was saved, but the personalised report was not created. Open the report to try again.",
        },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true, ai_strategy: aiStrategy });
  } catch (err: any) {
    console.error("Analysis Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
