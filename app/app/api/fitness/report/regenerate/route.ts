import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateStartingReport } from "@/lib/services/fitness/starting-report-service";
import { OnboardingSchema } from "@/types/fitness/onboarding";

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("onboarding_data, bmi")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Onboarding profile not found." }, { status: 404 });
    }

    const parsedOnboarding = OnboardingSchema.safeParse(profile.onboarding_data);
    if (!parsedOnboarding.success) {
      return NextResponse.json({ success: false, error: "Saved onboarding data is incomplete. Please review it first." }, { status: 422 });
    }

    const { data: scan } = await supabase
      .from("fitness_os_scans")
      .select("gemini_analysis")
      .eq("user_id", user.id)
      .maybeSingle();

    // One explicit user action creates one compact OpenAI report request.
    const aiStrategy = await generateStartingReport({
      onboarding: parsedOnboarding.data,
      bmi: typeof profile.bmi === "number" ? profile.bmi : null,
      estimatedBodyFat: null,
      visualObservations: typeof scan?.gemini_analysis === "string"
        ? scan.gemini_analysis
        : "No photos provided.",
    });

    const { error: updateError } = await supabase
      .from("fitness_os_profiles")
      .update({ ai_strategy: aiStrategy, updated_at: new Date().toISOString() })
      .eq("user_id", user.id);

    if (updateError) {
      console.error("Failed to save regenerated starting report:", updateError);
      return NextResponse.json({ success: false, error: "Could not save your report." }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Starting report regeneration error:", error);
    return NextResponse.json({
      success: false,
      error: "Your personalised report could not be generated. Please try again.",
    }, { status: 500 });
  }
}
