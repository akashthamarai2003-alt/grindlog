import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/services/supabase/server";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import { CoachResponseSchema, CoachResponseData } from "@/lib/fitness/ai/schemas";
import { buildFitnessCoachContext } from "@/lib/fitness/ai/context";
import { FITNESS_COACH_SYSTEM_PROMPT, buildFitnessCoachPrompt } from "@/lib/fitness/ai/prompts";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";
import { AIUsageService } from "@/lib/services/ai/ai-usage-service";
import { enforceRateLimit } from "@/lib/security/rate-limiter";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authData.user.id;

    if (!(await canUseFitnessFeature(userId, "ai_coach"))) {
      return NextResponse.json({ error: "AI coach support is available on the Pro plan." }, { status: 403 });
    }

    // 1. Rate Limiting (10 req/min per user)
    const rateLimitRes = enforceRateLimit(req, "ai", userId);
    if (rateLimitRes) return rateLimitRes;

    // 2. Atomic reservation check
    const reservation = await AIUsageService.checkAndReserve(userId, "coach_message");
    if (!reservation.allowed) {
      return NextResponse.json(
        {
          error: reservation.error || "Daily AI limit reached. Your daily quota resets tomorrow.",
          limitReached: true,
          remaining: 0,
          limit: reservation.limit || 0,
          used: reservation.used || 0,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      await AIUsageService.releaseReservation(reservation.reservationId!);
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
    }

    if (message.length > 2000) {
      await AIUsageService.releaseReservation(reservation.reservationId!);
      return NextResponse.json({ error: "Message exceeds 2,000 character limit" }, { status: 400 });
    }

    // Determine or Create Session
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from("fitness_os_coach_sessions")
        .insert({ user_id: userId, title: "Coach Session" })
        .select("id")
        .single();
      if (sessionError || !newSession) {
        await AIUsageService.releaseReservation(reservation.reservationId!);
        throw new Error("Failed to create coach session");
      }
      activeSessionId = newSession.id;
    } else {
      // Verify ownership
      const { data: existingSession, error: sessionError } = await supabase
        .from("fitness_os_coach_sessions")
        .select("id")
        .eq("id", activeSessionId)
        .eq("user_id", userId)
        .single();
        
      if (sessionError || !existingSession) {
        await AIUsageService.releaseReservation(reservation.reservationId!);
        return NextResponse.json({ error: "Session not found or access denied" }, { status: 403 });
      }
    }

    // Save User Message
    await supabase.from("fitness_os_coach_messages").insert({
      session_id: activeSessionId,
      user_id: userId,
      role: "user",
      content: message
    });

    // Build Context and Prompt
    const context = await buildFitnessCoachContext(userId);
    const userPrompt = buildFitnessCoachPrompt(context, message);

    let validatedData: CoachResponseData;
    try {
      // Call Groq AI
      const aiResponse = await generateAIResponseJSON<CoachResponseData>({
        systemPrompt: FITNESS_COACH_SYSTEM_PROMPT,
        userPrompt,
        model: "fast",
        maxTokens: 500,
      });

      // Validate Response
      validatedData = CoachResponseSchema.parse(aiResponse);

      // Save AI Response
      await supabase.from("fitness_os_coach_messages").insert({
        session_id: activeSessionId,
        user_id: userId,
        role: "assistant",
        content: JSON.stringify(validatedData)
      });

      // Commit reservation
      await AIUsageService.completeReservation(reservation.reservationId!, {
        prompt: userPrompt,
        response: JSON.stringify(validatedData),
        model: "fast",
        tokens: 500,
      });
    } catch (aiErr) {
      await AIUsageService.releaseReservation(reservation.reservationId!);
      throw aiErr;
    }

    return NextResponse.json({
      sessionId: activeSessionId,
      message: validatedData.message,
      tone: validatedData.tone,
      recommendations: validatedData.recommendations,
      warnings: validatedData.warnings,
      remaining: Math.max(0, (reservation.remaining ?? 1) - 1),
      limit: reservation.limit,
      used: reservation.used,
    });

  } catch (error: any) {
    console.error("Coach API Error:", error);
    // Generic error fallback for Zod parse failures or other unexpected errors
    return NextResponse.json({ error: "An unexpected error occurred while analyzing your request. Please try again." }, { status: 500 });
  }
}
