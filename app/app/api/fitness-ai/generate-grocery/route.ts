import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { GeneratedGroceryItemSchema } from "@/lib/fitness/ai/schemas";
import { generateOpenAIResponseJSON } from "@/lib/services/openai/client";
import {
  parseBudgetPlanningReference,
  validateGroceryListAgainstProfile,
} from "@/lib/fitness/validation/fitness-plan-profile";
import { z } from "zod";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

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

    if (!(await canUseFitnessFeature(user.id, "ai_plan_adjustments"))) {
      return NextResponse.json({ success: false, error: "Grocery planning is available on the Pro plan.", errorType: "PRO_REQUIRED" }, { status: 403 });
    }

    const limitCheck = await checkFitnessAILimit(supabase, user.id);
    if (!limitCheck.allowed) {
      return NextResponse.json({ success: false, error: "Fitness AI limit reached." }, { status: 429 });
    }

    const body = await req.json();
    const { currentNutritionPlan, optimizeBudgetMode, currentTotalCost } = body;

    if (!currentNutritionPlan) {
      return NextResponse.json({ success: false, error: "Missing nutrition plan." }, { status: 400 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Fitness profile not found." }, { status: 404 });
    }

    const systemPrompt = `You are the Fitness AI OS intelligent coaching assistant.
Your goal is to generate a structured, highly personalized monthly grocery list based on the user's existing nutrition plan.

CRITICAL RULES:
1. OUTPUT JSON ONLY. You must strictly follow the JSON schema provided.
2. NO MEDICAL ADVICE.
3. Use the user's food environment context to determine what foods they actually need to buy vs what is already provided.
4. Do not recommend foods they are allergic to or avoiding.
5. The quantities should reflect approximately 30 days of consumption.
6. The estimated_price MUST ALWAYS be greater than 0 for every single item. NEVER output 0 for eggs, meat, or staple foods.
7. NEVER use "dozen" or "dozens" as a unit. You MUST use "pieces". Example: 30 pieces.`;

    const userPrompt = `Here is my existing nutrition plan and profile:
Profile:
- Food Environment: ${profile.food_environment || "Home"}
- Budget: ${profile.nutrition_budget || "Not specified"}
- Monthly planning reference: ${parseBudgetPlanningReference(profile.nutrition_budget) || "Not specified"} INR
- Diet Preference (Food Type): ${profile.food_type || profile.diet_preference || "Balanced"}
- Allergies: ${profile.food_allergies || "None"}
- Disliked/Avoided Foods: ${[profile.foods_disliked, profile.foods_avoided].filter(Boolean).join(", ") || "None"}
- Available Foods: ${Array.isArray(profile.available_foods) ? profile.available_foods.join(", ") : "None"}

Current Nutrition Plan:
${JSON.stringify(currentNutritionPlan, null, 2)}

Instructions:
${optimizeBudgetMode 
  ? `My current estimated grocery cost is ₹${currentTotalCost}, but my budget is only ${profile.nutrition_budget}. Your previous list was OVER BUDGET. You MUST strictly reduce the estimated_price totals by substituting expensive items with cheaper alternatives (like replacing expensive meats/supplements with affordable whole foods) or slightly reducing quantities while ensuring adequate nutrition. Return the newly optimized grocery_list.` 
  : `Generate a practical monthly 'grocery_list' based directly on the nutrition plan above. Prioritize foods already available to me. Do not recommend purchasing foods already provided by my food environment. The monthly planning reference is the spend target: when three or more compatible foods are available, make a varied, useful list that uses 80-95% of that reference. Do not create excessive portions or add unnecessary foods merely to spend money. Quantities should represent realistic 30-day consumption for one person. Prices are estimated only and should never be treated as exact market prices.`}

Respond entirely in JSON format matching this schema: 
{ 
  "grocery_list": [ 
    { 
      "name": string, 
      "monthly_quantity": number, 
      "unit": string, // MUST be one of: "kg", "grams", "liters", "pieces", "units", "packets", "bunches", "tins"
      "estimated_price": number, 
      "category": string, 
      "is_optional": boolean, 
      "reason": string 
    } 
  ] 
}
CRITICAL: For eggs, NEVER use "dozen" or "dozens". If you want 36 eggs, use {"monthly_quantity": 36, "unit": "pieces"}. Every single item MUST have a realistic estimated_price > 0. Never output 0 for prices.`;

    const aiResponse = await generateOpenAIResponseJSON<z.infer<typeof GenerateGroceryResponseSchema>>({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
    });
    const parsedData = GenerateGroceryResponseSchema.parse(aiResponse);

    const profileCheck = validateGroceryListAgainstProfile(parsedData.grocery_list, profile, {
      enforceBudgetUtilisation: true,
    });
    if (!profileCheck.valid) {
      return NextResponse.json(
        { success: false, error: profileCheck.issues[0] || "The grocery list did not match your saved profile." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Fitness AI Generate Grocery Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
