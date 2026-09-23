import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AIInsightService } from "@/lib/services/analytics/ai-insight-service";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { AIUsageService } from "@/lib/services/ai/ai-usage-service";
import { enforceRateLimit } from "@/lib/security/rate-limiter";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const limitCheck = await checkFitnessAILimit(supabase, user.id);
    return NextResponse.json(limitCheck, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to check limit" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await canUseFitnessFeature(user.id, "ai_coach"))) {
      return NextResponse.json({ error: "AI Coach support is available on the Pro plan.", errorType: "PRO_REQUIRED" }, { status: 403 });
    }

    // 1. Rate Limiting (10 req/min per user)
    const rateLimitRes = enforceRateLimit(req, "ai", user.id);
    if (rateLimitRes) return rateLimitRes;

    // 2. Enforce AI Daily Generations Limit via atomic reservation
    const reservation = await AIUsageService.checkAndReserve(user.id, "chatbot_message");
    if (!reservation.allowed) {
      return NextResponse.json(
        {
          error: reservation.error || "Daily AI limit reached. Please upgrade or try again tomorrow.",
          limitReached: true,
          remaining: 0,
          limit: reservation.limit || 0,
          used: reservation.used || 0,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const question: string = body.question;
    const messages: { role: "user" | "assistant"; content: string }[] = body.messages || [];

    if (!question && messages.length === 0) {
      await AIUsageService.releaseReservation(reservation.reservationId!);
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Input validation: cap question length to prevent token abuse
    if (question && question.length > 2000) {
      await AIUsageService.releaseReservation(reservation.reservationId!);
      return NextResponse.json({ error: "Message exceeds 2,000 character limit" }, { status: 400 });
    }

    const chatMessages = messages.length > 0 ? messages : [{ role: "user" as const, content: question }];
    const lastUserPrompt = question || chatMessages.filter((m) => m.role === "user").slice(-1)[0]?.content || "chat";

    let responseText: string;
    try {
      // 3. Generate AI response
      responseText = await AIInsightService.askProgressQuestion(user.id, chatMessages);

      // 4. Commit usage to database
      await AIUsageService.completeReservation(reservation.reservationId!, {
        prompt: lastUserPrompt,
        response: responseText,
        model: "primary",
        tokens: 100,
      });
    } catch (aiErr) {
      // Release quota reservation on AI provider failure so user is not penalized
      await AIUsageService.releaseReservation(reservation.reservationId!);
      throw aiErr;
    }

    return NextResponse.json({
      reply: responseText,
      remaining: Math.max(0, (reservation.remaining ?? 1) - 1),
      limit: reservation.limit,
      used: reservation.used,
    });
  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: "Failed to generate AI response. Please try again." }, { status: 500 });
  }
}
