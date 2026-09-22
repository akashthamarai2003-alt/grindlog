import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import {
  parseBodyScanAnalysis,
  analyzeBodyScanImages,
  BodyScanImageInput,
} from "@/lib/fitness/body-scan";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    
    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    if (!(await canUseFitnessFeature(user.id, "advanced_progress_analysis"))) {
      return NextResponse.json({ success: false, error: "Advanced body-scan analysis is available on the Pro plan.", errorType: "PRO_REQUIRED" }, { status: 403 });
    }

    const { images } = await req.json();

    if (!images || typeof images !== "object") {
      return NextResponse.json({ success: false, error: "Images payload missing or invalid" }, { status: 400 });
    }

    // Prepare images for AI Vision
    const imageInputs: BodyScanImageInput[] = [];
    const imageLabels: Record<string, string> = {
      front: "CURRENT BODY — FRONT VIEW",
      side: "CURRENT BODY — SIDE VIEW",
      back: "CURRENT BODY — BACK VIEW",
      goal: "GOAL PHYSIQUE — INSPIRATION ONLY, NOT THE USER'S CURRENT BODY",
    };
    for (const [view, base64Str] of Object.entries(images as Record<string, string>)) {
      if (base64Str && base64Str.startsWith('data:image')) {
        const [meta, rawData] = base64Str.split(',');
        const mimeType = meta.split(';')[0].split(':')[1] || "image/jpeg";
        imageInputs.push({
          label: imageLabels[view] || `CURRENT BODY — ${view.toUpperCase()} VIEW`,
          data: rawData,
          mimeType,
        });
      }
    }

    if (imageInputs.length === 0) {
      return NextResponse.json({ success: false, error: "Could not process uploaded images" }, { status: 400 });
    }

    // Call dual-AI Vision pipeline (Gemini with safety overrides + OpenAI Vision fallback)
    const visionResult = await analyzeBodyScanImages(imageInputs);
    if (!visionResult.success || !visionResult.analysis) {
      throw new Error(visionResult.error || "Vision models were unable to analyze the body photos");
    }

    const analysis = visionResult.analysis;

    // 5. Save to Database (Text Analysis ONLY)
    const adminClient = createAdminClient();
    const { error: dbError } = await adminClient
      .from('fitness_os_scans')
      .upsert({
        user_id: user.id,
        front_url: null,
        side_url: null,
        back_url: null,
        goal_url: null,
        gemini_analysis: JSON.stringify(analysis),
        updated_at: new Date().toISOString()
      }, { onConflict: "user_id" });

    if (dbError) {
      console.error("Database save error:", dbError);
      return NextResponse.json({ success: false, error: "Failed to save analysis." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { analysis } });

  } catch (error: any) {
    console.error("Scanner API Error:", error);
    return NextResponse.json({ success: false, error: `Vision AI Error: ${error.message || "Unknown error"}` }, { status: 500 });
  }
}
