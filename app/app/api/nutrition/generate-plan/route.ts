import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AINutritionService } from "@/lib/services/nutrition/ai-nutrition-service";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { isFitnessPro } from "@/lib/fitness/subscription/access";

export async function GET() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const eligibility = await NutritionService.getWeeklyPlanEligibility(user.id);
    return NextResponse.json({ success: true, data: eligibility });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to check eligibility' } },
      { status: 500 }
    );
  }
}

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

    if (!(await isFitnessPro(user.id))) {
      return NextResponse.json(
        { success: false, error: { code: 'PRO_REQUIRED', message: 'The 7-day diet plan is available on the Pro plan.' } },
        { status: 403 }
      );
    }

    // Pro users can generate a personalized weekly 7-day plan (1/week, max 4/month).
    const result = await AINutritionService.generateMealPlan(user.id);
    NutritionService.invalidateServerCache(user.id);
    try {
      revalidatePath("/nutrition");
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ 
      success: true, 
      data: result 
    });
  } catch (error: any) {
    console.error("Error in POST /api/nutrition/generate-plan:", error);
    
    const message = error.message || "Failed to generate plan.";
    
    if (
      message.includes("limit") || 
      message.includes("Weekly") || 
      message.includes("weekly") || 
      message.includes("unlocks") ||
      message.includes("running") ||
      message.includes("cooldown")
    ) {
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

    if (message.startsWith('PROFILE_INCOMPLETE:') || message.startsWith('CLINICAL_REVIEW_REQUIRED:') || message.startsWith('PLAN_VALIDATION_FAILED:')) {
      const [code, ...details] = message.split(':');
      return NextResponse.json(
        { success: false, error: { code, message: details.join(':').trim() } },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: message } },
      { status: 500 }
    );
  }
}
