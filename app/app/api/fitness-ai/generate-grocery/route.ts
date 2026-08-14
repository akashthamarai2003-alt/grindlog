import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { GeneratedGroceryItemSchema } from "@/lib/fitness/ai/schemas";
import { getGroqClient } from "@/lib/services/groq/client";
import { z } from "zod";

const GenerateGroceryResponseSchema = z.object({
  grocery_list: z.array(GeneratedGroceryItemSchema)
});

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
    const { profile, currentNutritionPlan } = body;

    if (!profile || !currentNutritionPlan) {
      return NextResponse.json({ success: false, error: "Missing profile or nutrition plan." }, { status: 400 });
    }

    const systemPrompt = `You are the Fitness AI OS intelligent coaching assistant.
Your goal is to generate a structured, highly personalized monthly grocery list based on the user's existing nutrition plan.

CRITICAL RULES:
1. OUTPUT JSON ONLY. You must strictly follow the JSON schema provided.
2. NO MEDICAL ADVICE.
3. Use the user's food environment context to determine what foods they actually need to buy vs what is already provided (e.g. by a PG/Hostel/Office).
4. Do not recommend foods they are allergic to or avoiding.
5. The quantities should reflect approximately 30 days of consumption.
6. The prices must be estimated in the local currency.`;

    const userPrompt = `Here is my existing nutrition plan and profile:
Profile:
- Food Environment: ${profile.food_environment || "Home"}
- Budget: ${profile.nutrition_budget || "Not specified"}
- Diet Preference (Food Type): ${profile.food_type || profile.diet_preference || "Balanced"}
- Allergies: ${profile.food_allergies || "None"}
- Disliked/Avoided Foods: ${[profile.foods_disliked, profile.foods_avoided].filter(Boolean).join(", ") || "None"}
- Available Foods: ${Array.isArray(profile.available_foods) ? profile.available_foods.join(", ") : "None"}

Current Nutrition Plan:
${JSON.stringify(currentNutritionPlan, null, 2)}

Instructions:
Generate a practical monthly 'grocery_list' based directly on the nutrition plan above. Prioritize foods already available to me. Do not recommend purchasing foods already provided by my food environment. Respect my monthly food budget. Quantities should represent realistic 30-day consumption for one person. Prices are estimated only and should never be treated as exact market prices.

Respond entirely in JSON format matching this schema: { "grocery_list": [ { "name": string, "monthly_quantity": number, "unit": string, "estimated_price": number, "category": string, "is_optional": boolean, "reason": string } ] }`;

    const groq = getGroqClient();
    
    const response = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const aiResponseText = response.choices[0]?.message?.content || "{}";
    const parsedData = GenerateGroceryResponseSchema.parse(JSON.parse(aiResponseText));

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Fitness AI Generate Grocery Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
