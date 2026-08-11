import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { GeneratedPlanSchema, GeneratedPlanData } from "@/lib/fitness/ai/schemas";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { FITNESS_PLAN_SYSTEM_PROMPT } from "@/lib/fitness/ai/prompts";
import { getGroqClient } from "@/lib/services/groq/client";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const limitCheck = await checkFitnessAILimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, error: "Fitness AI limit reached." }, { status: 429 });
    }

    const body = await req.json();
    const { currentPlan, prompt } = body;

    if (!currentPlan || !prompt) {
      return NextResponse.json({ success: false, error: "Missing plan or prompt." }, { status: 400 });
    }

    const systemPrompt = `You are an elite AI Fitness Coach modifying a user's generated workout plan based on their request.
If the user indicates an injury or pain (e.g. "my shoulder hurts"), you must actively remove aggravating exercises and substitute them with safe alternatives, or remove them entirely. You should also explicitly add a warning note advising them that you are not a medical professional and they should seek medical evaluation if pain persists.
Ensure you return the ENTIRE updated plan matching the exact schema of the provided JSON.

Schema Rules:
- plan (name, description, goal)
- workouts (array of objects: title, workout_date, duration_minutes, exercises)
- exercises (array of objects: name, exercise_order, sets, reps_string, target_reps_num, rest_seconds, notes)
- nutrition (optional)
- lifestyle (optional)

Output ONLY valid JSON matching this schema.`;

    const userPrompt = `Here is the current plan:
${JSON.stringify(currentPlan, null, 2)}

User request: "${prompt}"

Modify the JSON appropriately and return the full updated JSON.`;

    const groq = getGroqClient();
    
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(response.choices[0]?.message?.content || "{}");

    // Validate
    const parsed = GeneratedPlanSchema.safeParse(aiResponse);
    if (!parsed.success) {
      console.error("Modulation validation failed:", parsed.error);
      return NextResponse.json({ success: false, error: "Failed to modify plan." }, { status: 500 });
    }

    // Safety check - we could reuse runFitnessAISafetyCheck if we want
    return NextResponse.json({ success: true, data: parsed.data });

  } catch (error: any) {
    console.error("Modulate Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
