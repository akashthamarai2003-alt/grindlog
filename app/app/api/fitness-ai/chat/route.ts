import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AIInsightService } from "@/lib/services/analytics/ai-insight-service";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";

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

    // 1. Enforce AI Daily Generations Limit
    const limitCheck = await checkFitnessAILimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          error: `Daily AI limit reached (${limitCheck.limit}/${limitCheck.limit} used). Your daily generations reset tomorrow.`,
          limitReached: true,
          remaining: 0,
          limit: limitCheck.limit,
          used: limitCheck.used,
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const question: string = body.question;
    const messages: { role: "user" | "assistant"; content: string }[] = body.messages || [];

    if (!question && messages.length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const chatMessages = messages.length > 0 ? messages : [{ role: "user" as const, content: question }];

    // 2. Generate AI response
    const responseText = await AIInsightService.askProgressQuestion(user.id, chatMessages);

    // 3. Log usage to fitness_os_ai_sessions so daily limit is accurately decremented
    const lastUserPrompt = question || chatMessages.filter((m) => m.role === "user").slice(-1)[0]?.content || "chat";
    await logFitnessAIUsage(user.id, "chatbot_message", lastUserPrompt, responseText, "primary", 100);

    // 4. Return updated usage info to client
    const updatedCheck = await checkFitnessAILimit(supabase, user.id);

    return NextResponse.json({
      reply: responseText,
      remaining: updatedCheck.remaining,
      limit: updatedCheck.limit,
      used: updatedCheck.used,
    });
  } catch (error: any) {
    console.error("AI Chat API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to chat" }, { status: 500 });
  }
}
