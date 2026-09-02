import { generateOpenAIResponseJSON } from "../app/lib/services/openai/client";
import { GeneratedPlanSchema } from "../app/lib/fitness/ai/schemas";
import { FITNESS_PLAN_SYSTEM_PROMPT } from "../app/lib/fitness/ai/prompts";

async function test() {
  const profile = { goal: "Build Muscle", fitness_level: "Beginner", weight: 70, height: 175 };
  const userPrompt = "Build a plan for this profile: " + JSON.stringify(profile);
  
  try {
    console.log("Generating plan...");
    const aiResponse = await generateOpenAIResponseJSON({
      systemPrompt: FITNESS_PLAN_SYSTEM_PROMPT,
      userPrompt,
      maxTokens: 10000,
      reasoningEffort: "low",
    });
    
    console.log("AI Response keys:", Object.keys(aiResponse as any));
    
    const parsed = GeneratedPlanSchema.safeParse(aiResponse);
    if (!parsed.success) {
      console.error("Zod Error:", JSON.stringify(parsed.error.errors, null, 2));
    } else {
      console.log("Success!");
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
test();
