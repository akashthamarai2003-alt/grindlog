import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateStartingReport } from "@/lib/services/fitness/starting-report-service";
import { FITNESS_REPORT_MODEL } from "@/lib/services/openai/client";
import {
  getGenerationRetryAfterSeconds,
  recordGenerationAttempt,
} from "@/lib/services/fitness-ai-generation-guard";
import { OnboardingSchema } from "@/types/fitness/onboarding";
import { parseBodyScanAnalysis } from "@/lib/fitness/body-scan";

export async function POST() {
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

    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("onboarding_data, bmi")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json(
        { success: false, error: "Onboarding profile not found." },
        { status: 404 },
      );
    }

    const retryAfterSeconds = await getGenerationRetryAfterSeconds(
      supabase,
      user.id,
      "starting_report_attempt",
    );
    if (retryAfterSeconds > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Please wait ${retryAfterSeconds} seconds before trying to create the report again.`,
          retryAfterSeconds,
        },
        { status: 429 },
      );
    }

    const parsedOnboarding = OnboardingSchema.safeParse(profile.onboarding_data);
    if (!parsedOnboarding.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Saved onboarding data is incomplete. Please review it first.",
        },
        { status: 422 },
      );
    }

    const { data: scan } = await supabase
      .from("fitness_os_scans")
      .select("gemini_analysis")
      .eq("user_id", user.id)
      .maybeSingle();

    // One explicit action creates one request. The persisted attempt record prevents
    // failed responses, reloads, or multiple tabs from causing a retry storm.
    await recordGenerationAttempt(
      supabase,
      user.id,
      "starting_report_attempt",
      FITNESS_REPORT_MODEL,
    );
    const aiStrategy = await generateStartingReport({
      onboarding: parsedOnboarding.data,
      bmi: typeof profile.bmi === "number" ? profile.bmi : null,
      estimatedBodyFat: null,
      visualObservations:
        typeof scan?.gemini_analysis === "string"
          ? scan.gemini_analysis
          : "No photos provided.",
    });

    const structuredBodyScan = parseBodyScanAnalysis(scan?.gemini_analysis);
    if (structuredBodyScan) {
      aiStrategy.body_scan_insights = {
        has_body_scan: true,
        overall_summary: structuredBodyScan.overall_summary,
        observed_strengths: structuredBodyScan.observed_strengths,
        priority_improvements: structuredBodyScan.priority_improvements,
        posture_or_movement_note: structuredBodyScan.posture_or_movement_note,
      };
    }

    const { error: updateError } = await supabase
      .from("fitness_os_profiles")
      .update({ ai_strategy: aiStrategy, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to save regenerated starting report:", updateError);
      return NextResponse.json(
        { success: false, error: "Could not save your report." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Starting report regeneration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Your personalised report could not be generated. Please try again.",
      },
      { status: 500 },
    );
  }
}
