import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getOnboardingCompletionIssues, OnboardingSchema } from "@/types/fitness/onboarding";
import {
  generateStartingReport,
  hasGeneratedStartingReport,
  buildDeterministicStartingReport,
} from "@/lib/services/fitness/starting-report-service";
import {
  getGenerationRetryAfterSeconds,
  recordGenerationAttempt,
} from "@/lib/services/fitness-ai-generation-guard";
import { FITNESS_REPORT_MODEL } from "@/lib/services/openai/client";
import {
  BodyScanAnalysis,
  BODY_SCAN_RESPONSE_INSTRUCTIONS,
  parseBodyScanAnalysis,
  analyzeBodyScanImages,
  buildFallbackBodyScan,
  BodyScanImageInput,
} from "@/lib/fitness/body-scan";
import { PhotoGuard } from "@/lib/security/photo-guard";
import { enforceRateLimit } from "@/lib/security/rate-limiter";

export const maxDuration = 60;

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

  const hasPhotos = Boolean(
    body_scan_front ||
      body_scan_left ||
      body_scan_right ||
      body_scan_back ||
      body_scan_inspiration ||
      goal_physique_image,
  );

  return {
    ...safeData,
    has_uploaded_photos: hasPhotos,
  };
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

    // Rate Limiting (10 req/min per user)
    const rateLimitRes = enforceRateLimit(req, "ai", user.id);
    if (rateLimitRes) return rateLimitRes;

    const payload = await req.json();
    const result = OnboardingSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: "Invalid data provided" },
        { status: 400 },
      );
    }

    const data = result.data;
    const completionIssues = getOnboardingCompletionIssues(data);
    if (completionIssues.length > 0) {
      return NextResponse.json(
        { success: false, error: `Please complete onboarding before continuing: ${completionIssues.join("; ")}.` },
        { status: 400 },
      );
    }
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

    // Optional: Extract and validate images for AI Vision via PhotoGuard
    const rawImageInputs = [
      { label: "CURRENT BODY — FRONT VIEW", base64Str: data.body_scan_front },
      { label: "CURRENT BODY — LEFT SIDE VIEW", base64Str: data.body_scan_left },
      { label: "CURRENT BODY — RIGHT SIDE VIEW", base64Str: data.body_scan_right },
      { label: "CURRENT BODY — BACK VIEW", base64Str: data.body_scan_back },
      {
        label: "GOAL PHYSIQUE — INSPIRATION ONLY, NOT THE USER'S CURRENT BODY",
        base64Str: data.goal_physique_image || data.body_scan_inspiration,
      },
    ].filter((item) => Boolean(item.base64Str));

    const images: BodyScanImageInput[] = [];
    let photoHash: string | undefined;

    if (rawImageInputs.length > 0) {
      const validation = PhotoGuard.validateImages(rawImageInputs);
      if (!validation.valid || !validation.images || !validation.photoHash) {
        return NextResponse.json(
          { success: false, error: validation.error || "Invalid photo payload" },
          { status: 400 }
        );
      }
      photoHash = validation.photoHash;
      for (const img of validation.images) {
        images.push({
          label: img.label,
          data: img.data,
          mimeType: img.mimeType,
        });
      }
    }

    let visualObservations = "No photos provided.";
    let visionAnalysisSucceeded = false;

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
      bmr = Math.max(800, bmr);

      const activityMultipliers: Record<string, number> = {
        "Mostly sitting": 1.2,
        "Mostly sedentary": 1.2,
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
        data.goal === "Lose Fat + Build Muscle" ||
        data.goal === "Cut"
      ) {
        proteinMultiplier = 2.0;
      } else if (data.goal === "Build Strength") {
        proteinMultiplier = 1.8;
      }
      initial_protein_target = Math.round(data.weight * proteinMultiplier);
    }

    const weight_trend_baseline = data.weight || null;
    const safeData = stripImagePayload(data as Record<string, unknown>);

    // Save profile IMMEDIATELY so closing the app or a network disconnect never drops the user back to Step 1
    const admin = createAdminClient();
    const initialProfilePayload = {
      user_id: user.id,
      name: data.name ? data.name.trim() : null,
      country: data.country || null,
      preferred_language: data.preferred_language || null,
      goal: data.goal,
      fitness_level: data.fitness_level,
      age: data.age,
      height: data.height,
      weight: data.weight,
      target_weight: data.target_weight,
      gender: data.gender,
      waist_cm: data.waist_cm || null,
      chest_cm: data.chest_cm || null,
      arm_cm: data.arm_cm || null,
      thigh_cm: data.thigh_cm || null,
      training_location: data.training_location,
      equipment: data.equipment,
      training_days_per_week: data.training_days_per_week,
      workout_duration_minutes: data.workout_duration_minutes,
      preferred_training_days: data.preferred_training_days,
      preferred_training_time: data.preferred_training_time || data.workout_time,
      diet_preference: data.food_type,
      food_type: data.food_type,
      food_environment: data.food_environment,
      meals_per_day: data.meals_per_day,
      available_foods: data.available_foods,
      food_allergies: data.food_allergies,
      foods_disliked: data.foods_disliked,
      foods_avoided: data.foods_avoided,
      nutrition_medical_conditions: data.nutrition_medical_conditions,
      nutrition_budget: data.nutrition_budget,
      activity_level: data.activity_level,
      daily_steps: data.daily_steps,
      sleep_duration: data.sleep_duration,
      wake_time: data.wake_time,
      workout_time: data.workout_time,
      work_time: data.work_time,
      sleep_time: data.sleep_time,
      lifestyle_description: data.lifestyle_description,
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
      target_physique:
        data.target_physique ||
        (data.goal_physique_image ? "Custom Photo" : "Not specified"),
      bmi,
      baseline_calories,
      initial_protein_target,
      weight_trend_baseline,
      ai_strategy: buildDeterministicStartingReport(
        data,
        bmi,
        estimated_body_fat,
        images.length > 0 ? "ANALYZING" : "No photos provided."
      ),
      onboarding_data: {
        ...(safeData && typeof safeData === "object" ? safeData : {}),
        has_uploaded_photos: images.length > 0,
        estimated_body_fat: estimated_body_fat || null,
      },
      onboarding_completed: true,
      updated_at: new Date().toISOString(),
    };

    await admin.from("fitness_os_profiles").upsert(initialProfilePayload, { onConflict: "user_id" });

    // Mark scan as analyzing in fitness_os_scans so scan-status and report page immediately know
    if (images.length > 0) {
      await admin.from("fitness_os_scans").upsert(
        {
          user_id: user.id,
          gemini_analysis: "ANALYZING",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
    }

    // Instantly calculate and persist fresh nutrition targets for this user
    try {
      const { NutritionService } = await import("@/lib/services/nutrition/nutrition-service");
      await NutritionService.recalculateTargetsForUser(user.id, {
        ...data,
        bmi,
        baseline_calories,
        initial_protein_target,
      });
    } catch (e) {
      console.warn("[Analyze] Background target recalculation notice:", e);
    }

    // 1. Kick off background AI Vision Analysis if photos were uploaded (non-blocking)
    if (images.length > 0) {
      void (async () => {
        try {
          const cached = photoHash ? await PhotoGuard.getCachedAnalysis(user.id, photoHash) : null;
          let structuredBodyScan: BodyScanAnalysis | null = null;
          let visualObservationsText = "";

          if (cached) {
            console.log(`[Analyze:Bg] Reusing cached photo analysis for user ${user.id} (hash: ${photoHash?.slice(0, 10)})`);
            structuredBodyScan = cached;
            visualObservationsText = JSON.stringify(cached);
          } else {
            console.log(`[Analyze:Bg] Analyzing ${images.length} body-scan images with AI vision in background...`);
            const visionResult = await analyzeBodyScanImages(images);
            if (visionResult.success && visionResult.analysis) {
              structuredBodyScan = visionResult.analysis;
              visualObservationsText = visionResult.rawText || JSON.stringify(visionResult.analysis);
              if (photoHash) {
                PhotoGuard.setCachedAnalysis(user.id, photoHash, visionResult.analysis);
              }
              console.log(`[Analyze:Bg] Vision analysis succeeded via ${visionResult.provider}!`);
            } else {
              console.warn("[Analyze:Bg] Vision analysis failed or unavailable:", visionResult.error);
              structuredBodyScan = buildFallbackBodyScan(data, bmi, estimated_body_fat);
              visualObservationsText = JSON.stringify(structuredBodyScan);
              if (photoHash) {
                PhotoGuard.setCachedAnalysis(user.id, photoHash, structuredBodyScan);
              }
              console.log("[Analyze:Bg] Generated biometric photo analysis fallback.");
            }
          }

          if (structuredBodyScan) {
            await admin.from("fitness_os_scans").upsert(
              {
                user_id: user.id,
                gemini_analysis: visualObservationsText || JSON.stringify(structuredBodyScan),
                updated_at: new Date().toISOString(),
              },
              { onConflict: "user_id" },
            );

            const { data: prof } = await admin
              .from("fitness_os_profiles")
              .select("ai_strategy")
              .eq("user_id", user.id)
              .maybeSingle();

            const curStrat = (prof?.ai_strategy && typeof prof.ai_strategy === "object")
              ? (prof.ai_strategy as Record<string, any>)
              : {};

            await admin
              .from("fitness_os_profiles")
              .update({
                ai_strategy: {
                  ...curStrat,
                  body_scan_insights: {
                    has_body_scan: true,
                    overall_summary: structuredBodyScan.overall_summary,
                    observed_strengths: structuredBodyScan.observed_strengths,
                    priority_improvements: structuredBodyScan.priority_improvements,
                    posture_or_movement_note: structuredBodyScan.posture_or_movement_note,
                    goal_gap: structuredBodyScan.goal_gap || null,
                  },
                },
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", user.id);
            console.log(`[Analyze:Bg] Photo analysis updated in database for user ${user.id}.`);
          }
        } catch (bgErr) {
          console.error("[Analyze:Bg] Background vision analysis error:", bgErr);
        }
      })();
    }

    // 2. Update user name in profiles table if provided
    if (data.name && data.name.trim()) {
      const cleanName = data.name.trim();
      const { error: nameErr } = await supabase
        .from("profiles")
        .update({ display_name: cleanName, name: cleanName })
        .eq("id", user.id);

      if (nameErr) {
        await admin
          .from("profiles")
          .update({ display_name: cleanName, name: cleanName })
          .eq("id", user.id);
      }

      try {
        await supabase.auth.updateUser({
          data: { name: cleanName, full_name: cleanName },
        });
      } catch (authErr) {
        console.warn("Could not update auth user metadata name:", authErr);
      }
    }

    // 3. Immediately return strategy in < 50ms total!
    return NextResponse.json({
      success: true,
      ai_strategy: initialProfilePayload.ai_strategy,
    });
  } catch (err: any) {
    console.error("Analysis Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
