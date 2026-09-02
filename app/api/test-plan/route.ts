import { NextResponse } from "next/server";
import { generateOpenAIResponseJSON } from "@/lib/services/openai/client";
import { GeneratedPlanSchema } from "@/lib/fitness/ai/schemas";
import { FITNESS_PLAN_SYSTEM_PROMPT } from "@/lib/fitness/ai/prompts";

export async function GET() {
  const profile = { goal: "Build Muscle", fitness_level: "Beginner", weight: 70, height: 175 };
  const userPrompt = "Build a plan for this profile: " + JSON.stringify(profile);
  
  try {
    const aiResponse = await generateOpenAIResponseJSON({
      systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 10000,
      reasoningEffort: "low",
    });
    
    const parsed = GeneratedPlanSchema.safeParse(aiResponse);
    if (!parsed.success) {
      return NextResponse.json({ success: false, aiResponse, errors: parsed.error.errors });
    }
    return NextResponse.json({ success: true, aiResponse });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}
