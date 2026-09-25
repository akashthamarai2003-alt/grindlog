import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { parseBodyScanAnalysis } from "@/lib/fitness/body-scan";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const admin = createAdminClient();
    const [{ data: scan }, { data: profile }] = await Promise.all([
      admin
        .from("fitness_os_scans")
        .select("gemini_analysis, updated_at")
        .eq("user_id", user.id)
        .maybeSingle(),
      admin
        .from("fitness_os_profiles")
        .select("ai_strategy, onboarding_data, target_physique")
        .eq("user_id", user.id)
        .maybeSingle(),
    ]);

    // 1. Check if structured analysis is ready from scans table or profile strategy
    const directBodyScan = parseBodyScanAnalysis(scan?.gemini_analysis);
    const aiStrategy =
      profile?.ai_strategy && typeof profile.ai_strategy === "object"
        ? (profile.ai_strategy as Record<string, any>)
        : null;
    const strategyScan = aiStrategy?.body_scan_insights;

    const insights = directBodyScan || (strategyScan?.has_body_scan ? strategyScan : null);

    if (insights) {
      return NextResponse.json({
        success: true,
        status: "ready",
        insights: {
          overall_summary: String(insights.overall_summary || ""),
          observed_strengths: Array.isArray(insights.observed_strengths)
            ? insights.observed_strengths.filter((i: unknown) => typeof i === "string" && i.trim())
            : [],
          priority_improvements: Array.isArray(insights.priority_improvements)
            ? insights.priority_improvements.filter((i: unknown) => typeof i === "string" && i.trim())
            : [],
          posture_or_movement_note: insights.posture_or_movement_note || null,
          goal_gap: insights.goal_gap || null,
        },
      });
    }

    // 2. Check if analysis is actively running
    const onboardingData =
      profile?.onboarding_data && typeof profile.onboarding_data === "object"
        ? (profile.onboarding_data as Record<string, any>)
        : null;

    const isAnalyzing =
      scan?.gemini_analysis === "ANALYZING" ||
      onboardingData?.has_uploaded_photos === true ||
      profile?.target_physique === "Custom Photo" ||
      Boolean(scan && !scan.gemini_analysis);

    if (isAnalyzing) {
      return NextResponse.json({
        success: true,
        status: "analyzing",
      });
    }

    return NextResponse.json({
      success: true,
      status: "none",
    });
  } catch (error) {
    console.error("[ScanStatus] Error checking scan status:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check scan status" },
      { status: 500 }
    );
  }
}
