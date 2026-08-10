import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/services/supabase/server";
import { checkFitnessAILimit, logFitnessAIUsage } from "@/lib/services/fitness-ai-limit";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import { CoachResponseSchema, CoachResponseData } from "@/lib/fitness/ai/schemas";
import { buildFitnessCoachContext } from "@/lib/fitness/ai/context";
import { FITNESS_COACH_SYSTEM_PROMPT, buildFitnessCoachPrompt } from "@/lib/fitness/ai/prompts";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = authData.user.id;

    // Check rate limit
    const limitCheck = await checkFitnessAILimit(supabase, userId);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "Fitness AI daily limit reached." }, { status: 429 });
    }

    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message format" }, { status: 400 });
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

    // Call Groq AI
    const aiResponse = await generateAIResponseJSON<CoachResponseData>({
      systemPrompt: FITNESS_COACH_SYSTEM_PROMPT,
      userPrompt,
      model: "fast",
      maxTokens: 500,
    });

    // Validate Response
    const validatedData = CoachResponseSchema.parse(aiResponse);

    // Save AI Response
    await supabase.from("fitness_os_coach_messages").insert({
      session_id: activeSessionId,
      user_id: userId,
      role: "assistant",
      content: JSON.stringify(validatedData)
    });

    // Log Usage
    await logFitnessAIUsage(userId, "coach_message", userPrompt, JSON.stringify(validatedData), "fast", 500);

    return NextResponse.json({
      sessionId: activeSessionId,
      message: validatedData.message,
      tone: validatedData.tone,
      recommendations: validatedData.recommendations,
      warnings: validatedData.warnings
    });

  } catch (error: any) {
    console.error("Coach API Error:", error);
    // Generic error fallback for Zod parse failures or other unexpected errors
    return NextResponse.json({ error: "An unexpected error occurred while analyzing your request. Please try again." }, { status: 500 });
  }
}
