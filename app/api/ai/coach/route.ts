import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/services/groq/client";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { checkAILimit } from "@/lib/services/ai-limit";

const COACH_PROMPT = `You are a compassionate, expert habit coach named "GrindLog Coach". 
You speak warmly but professionally. Use emojis sparingly. 
Keep responses to 2-4 sentences. Be encouraging but honest.
Reference the user's actual stats when provided. Never make up data.
If you don't know something, say so. Never give medical or financial advice.`;

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("premium_level").eq("id", user.id).single();
    if (profile?.premium_level !== "pro") {
      return NextResponse.json({ error: "Upgrade to Pro to use the AI Coach." }, { status: 403 });
    }

    const { message, context } = await request.json();

    const limitCheck = await checkAILimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { error: "Daily AI limit reached (10/10). Please come back tomorrow!" },
        { status: 429 }
      );
    }

    const userPrompt = context
      ? `User's stats: ${JSON.stringify(context)}\n\nUser message: ${message}`
      : message;

    const response = await generateAIResponse({
      systemPrompt: COACH_PROMPT,
      userPrompt,
      model: "fast",
      maxTokens: 300,
    });

    await supabase.from("ai_sessions").insert({
      user_id: user.id,
      session_type: "coach_chat",
      prompt: userPrompt,
      response,
      model: "fast",
      tokens_used: 0,
    } as any);

    return NextResponse.json({ response });
  } catch (error) {
    console.error("AI Coach error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
