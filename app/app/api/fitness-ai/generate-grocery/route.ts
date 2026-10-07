import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { checkFitnessAILimit } from "@/lib/services/fitness-ai-limit";
import { GeneratedGroceryItemSchema } from "@/lib/fitness/ai/schemas";
import {
  validateGroceryListAgainstProfile,
} from "@/lib/fitness/validation/fitness-plan-profile";
import { z } from "zod";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";
import { generateDeterministicNutritionPlan, convertToAIPlanFormat } from "@/lib/fitness/nutrition/nutrition-engine";

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

    const { data: profile, error: profileError } = await supabase
      .from("fitness_os_profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();
    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: "Fitness profile not found." }, { status: 404 });
    }

    // 100% Deterministic grocery generation from clinical food engine (Zero LLM / AI hallucination)
    const nutritionPlan = await generateDeterministicNutritionPlan(profile);
    const formatted = convertToAIPlanFormat(nutritionPlan);

    const parsedData = GenerateGroceryResponseSchema.parse({
      grocery_list: formatted.grocery_list,
    });

    const profileCheck = validateGroceryListAgainstProfile(parsedData.grocery_list, profile, {
      enforceBudgetUtilisation: false,
    });
    if (!profileCheck.valid) {
      return NextResponse.json(
        { success: false, error: profileCheck.issues[0] || "The grocery list did not match your saved profile." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Generate Grocery Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
