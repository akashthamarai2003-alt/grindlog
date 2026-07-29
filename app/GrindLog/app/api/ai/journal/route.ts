import { NextResponse } from "next/server";
import { generateAIResponse } from "@/lib/services/groq/client";
import { createServerSupabase } from "@/lib/services/supabase/server";

const JOURNAL_PROMPT = `You are an AI assistant analyzing a user's daily journal entry in a habit tracking app. 
Provide a short, empathetic 2-sentence summary/insight of their day based on what they wrote. 
Then, on a new line, provide a single word sentiment: 'positive', 'neutral', or 'negative'.

Format your response exactly like this:
SUMMARY: [your 2-sentence insight]
SENTIMENT: [positive/neutral/negative]`;

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase.from("profiles").select("premium_level").eq("id", user.id).single();
    if (profile?.premium_level !== "pro") {
      return NextResponse.json({ error: "Upgrade to Pro to use the AI Journal feature." }, { status: 403 });
    }

    const { content, mood, energy, focus } = await request.json();

    const userPrompt = `Journal Content: "${content}"\nMood Rating (1-5): ${mood || "N/A"}\nEnergy Rating (1-5): ${energy || "N/A"}\nFocus Rating (1-5): ${focus || "N/A"}`;

    const response = await generateAIResponse({
      systemPrompt: JOURNAL_PROMPT,
      userPrompt,
      model: "fast",
      maxTokens: 300,
    });

    let summary = response;
    let sentiment = "neutral";

    const parts = response.split("SENTIMENT:");
    if (parts.length === 2) {
      summary = parts[0].replace("SUMMARY:", "").trim();
      sentiment = parts[1].trim().toLowerCase().replace(/[^a-z]/g, '');
      if (!["positive", "neutral", "negative"].includes(sentiment)) {
        sentiment = "neutral";
      }
    }

    return NextResponse.json({ summary, sentiment });
  } catch (error) {
    console.error("AI Journal error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
