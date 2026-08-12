import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AINutritionService } from "@/lib/services/nutrition/ai-nutrition-service";

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

    // Since we don't have AbortSignal support deeply plumbed into our Groq SDK wrapper natively here without modifications,
    // we enforce the timeout at the proxy/serverless function layer (Vercel edge functions or maxDuration).
    // The underlying fetch in Groq SDK will respect standard timeouts.
    
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
