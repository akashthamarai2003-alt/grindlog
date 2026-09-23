import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { analyzeBodyScanImages, BodyScanImageInput } from "@/lib/fitness/body-scan";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";
import { PhotoGuard } from "@/lib/security/photo-guard";
import { AIUsageService } from "@/lib/services/ai/ai-usage-service";
import { enforceRateLimit } from "@/lib/security/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();

    // 1. Authenticate user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    // 2. Rate limit (10 req/min)
    const rateLimitRes = enforceRateLimit(req, "ai", user.id);
    if (rateLimitRes) return rateLimitRes;

    // 3. Subscription authorization (server-side only)
    if (!(await canUseFitnessFeature(user.id, "advanced_progress_analysis"))) {
      return NextResponse.json(
        {
          success: false,
          error: "Advanced body-scan analysis is available on the Pro plan.",
          errorType: "PRO_REQUIRED",
        },
        { status: 403 }
      );
    }

    const { images } = await req.json();
    if (!images || typeof images !== "object") {
      return NextResponse.json(
        { success: false, error: "Images payload missing or invalid" },
        { status: 400 }
      );
    }

    // 4. PhotoGuard: validate MIME magic bytes, size caps (5MB/image, 15MB total)
    const imageLabels: Record<string, string> = {
      front: "CURRENT BODY — FRONT VIEW",
      side: "CURRENT BODY — SIDE VIEW",
      back: "CURRENT BODY — BACK VIEW",
      goal: "GOAL PHYSIQUE — INSPIRATION ONLY, NOT THE USER'S CURRENT BODY",
    };

    const rawInputs = Object.entries(images as Record<string, string>).map(([view, base64Str]) => ({
      label: imageLabels[view] || `CURRENT BODY — ${view.toUpperCase()} VIEW`,
      base64Str,
    }));

    const validation = PhotoGuard.validateImages(rawInputs);
    if (!validation.valid || !validation.images || !validation.photoHash) {
      return NextResponse.json(
        { success: false, error: validation.error || "Invalid image payload" },
        { status: 400 }
      );
    }

    const photoHash = validation.photoHash;

    // 5. Photo Idempotency: Check if an identical submission was already analyzed for this user
    const cachedAnalysis = await PhotoGuard.getCachedAnalysis(user.id, photoHash);
    if (cachedAnalysis) {
      console.log(`[PhotoGuard] Reusing cached analysis for user ${user.id} (hash: ${photoHash.slice(0, 10)})`);
      return NextResponse.json({
        success: true,
        reused: true,
        data: { analysis: cachedAnalysis },
      });
    }

    // 6. Quota Reservation (atomic concurrency protection)
    const reservation = await AIUsageService.checkAndReserve(user.id, "body_scan_analysis");
    if (!reservation.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: reservation.error || "Daily AI limit reached. Please upgrade or try again tomorrow.",
          limitReached: true,
          remaining: 0,
        },
        { status: 429 }
      );
    }

    // Prepare images for AI Vision
    const imageInputs: BodyScanImageInput[] = validation.images.map((img) => ({
      label: img.label,
      data: img.data,
      mimeType: img.mimeType,
    }));

    let analysis: any;
    try {
      // 7. Call dual/triple-AI Vision pipeline (Gemini -> Groq -> OpenAI Vision)
      const visionResult = await analyzeBodyScanImages(imageInputs);
      if (!visionResult.success || !visionResult.analysis) {
        throw new Error(visionResult.error || "Vision models were unable to analyze the body photos");
      }

      analysis = visionResult.analysis;

      // 8. Commit reservation with photo hash in prompt for durable idempotency lookup
      await AIUsageService.completeReservation(reservation.reservationId!, {
        prompt: `body_scan photo_hash:${photoHash}`,
        response: JSON.stringify(analysis),
        model: visionResult.provider || "gemini",
        tokens: 300,
      });

      // Cache analysis in PhotoGuard
      PhotoGuard.setCachedAnalysis(user.id, photoHash, analysis);
    } catch (aiErr) {
      // Release reservation on failure so user quota is preserved
      await AIUsageService.releaseReservation(reservation.reservationId!);
      throw aiErr;
    }

    // 9. Save to Database (Text Analysis ONLY)
    const adminClient = createAdminClient();
    const { error: dbError } = await adminClient
      .from("fitness_os_scans")
      .upsert(
        {
          user_id: user.id,
          front_url: null,
          side_url: null,
          back_url: null,
          goal_url: null,
          gemini_analysis: JSON.stringify(analysis),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (dbError) {
      console.error("[Scanner] Database save error:", dbError);
      return NextResponse.json(
        { success: false, error: "Failed to save analysis results." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: { analysis } });
  } catch (error: any) {
    console.error("Scanner API Error:", error?.message || error);
    return NextResponse.json(
      { success: false, error: "An error occurred while analyzing the body photos. Please try again." },
      { status: 500 }
    );
  }
}
