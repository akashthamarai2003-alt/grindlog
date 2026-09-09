import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AINutritionService } from "@/lib/services/nutrition/ai-nutrition-service";
import { isFitnessPro } from "@/lib/fitness/subscription/access";

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    // Luna AI Meal Plan generation is powered by Groq (Free Tier)
    // Authenticated users can generate their personalized 30-day plan
    const result = await AINutritionService.generateMealPlan(user.id);

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    console.error("Error in POST /api/nutrition/generate-plan:", error);
    
    const message = error.message || "Failed to generate plan.";
    
    if (message.includes("daily limit")) {
      return NextResponse.json(
        { success: false, error: { code: 'RATE_LIMIT_EXCEEDED', message } },
        { status: 429 }
      );
    }
    
    if (message.includes("TARGET_NOT_FOUND")) {
      return NextResponse.json(
        { success: false, error: { code: 'TARGET_NOT_FOUND', message: 'Set your daily targets first.' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: message } },
      { status: 500 }
    );
  }
}
