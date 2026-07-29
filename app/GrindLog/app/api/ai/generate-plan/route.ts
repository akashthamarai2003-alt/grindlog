import { NextResponse } from "next/server";
import { generateAIResponseJSON } from "@/lib/services/groq/client";
import { createServerSupabase } from "@/lib/services/supabase/server";
import type { AIHabitPlan } from "@/types";

const SYSTEM_PROMPT = `You are a world-class habit formation coach. Based on the user's preferences, create a personalized habit plan.

Rules:
- Generate 3-5 core habits ordered by impact
- Each habit must have: name, emoji (single emoji), category, frequency, preferredTime, targetCount, targetUnit, and a 1-sentence reason
- Categories: fitness, learning, health, mindfulness, finance, social, work, creative, other
- Frequencies: daily, weekly, weekdays, weekends
- Preferred times: morning, afternoon, evening, night, anytime
- Target count should be realistic (1-8)
- Include 1 optional "stretch" habit
- Add a 2-sentence motivational insight specific to their goal
- Include suggested habit order

Respond with valid JSON in this exact format:
{
  "habits": [
    {
      "name": "Morning Run",
      "emoji": "🏃",
      "category": "fitness",
      "frequency": "daily",
      "preferredTime": "morning",
      "targetCount": 1,
      "targetUnit": "times",
      "reason": "Kickstart metabolism and build discipline"
    }
  ],
  "insight": "Two sentence motivational insight...",
  "suggestedOrder": ["Morning Run", "Read", "Meditate"]
}`;

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { goal, level, times, duration } = body;

    const userPrompt = `
Goal: ${goal}
Experience Level: ${level}
Available Times: ${times?.join(", ") || "anytime"}
Time Budget: ${duration || 30} minutes/day

Generate a personalized habit plan for this user.`;

    const plan = await generateAIResponseJSON<AIHabitPlan>({
      systemPrompt: SYSTEM_PROMPT,
      userPrompt,
      model: "primary",
    });

    // Save AI session
    await supabase.from("ai_sessions").insert({
      user_id: user.id,
      session_type: "plan_generation",
      prompt: userPrompt,
      response: JSON.stringify(plan),
      model: "primary",
      tokens_used: 0,
    } as any);

    // Mark user as having created AI plan
    await supabase
      .from("profiles")
      .update({ ai_plan_created: true, xp: 150 })
      .eq("id", user.id);

    return NextResponse.json({ plan });
  } catch (error) {
    console.error("AI Plan generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 },
    );
  }
}
