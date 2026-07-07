import { NextResponse } from "next/server";
import { generateAIResponse } from "@/services/groq/client";
import { createServerSupabase } from "@/services/supabase/server";

const MOTIVATION_PROMPT = `You are a motivational habit coach. Generate ONE short, punchy motivational message (max 2 sentences). 
Be specific to the user's current situation. Use warm, energetic language. Include exactly 1 relevant emoji. 
Never be generic. Reference their streak, time of day, or specific habit.`;

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { streaks, timeOfDay, completedToday, totalToday } = body;

    const userPrompt = `
Streaks: ${JSON.stringify(streaks)}
Time of day: ${timeOfDay}
Completed today: ${completedToday}/${totalToday}

Generate one motivational message.`;

    const response = await generateAIResponse({
      systemPrompt: MOTIVATION_PROMPT,
      userPrompt,
      model: "fast",
      maxTokens: 100,
    });

    return NextResponse.json({ message: response.trim() });
  } catch {
    return NextResponse.json(
      { message: "🌱 Every small step waters your tree. Keep going!" },
    );
  }
}
