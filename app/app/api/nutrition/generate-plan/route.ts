import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AINutritionService } from "@/lib/services/nutrition/ai-nutrition-service";
import { V2PlanService } from "@/lib/services/nutrition/v2-plan-service";
import { NutritionService } from "@/lib/services/nutrition/nutrition-service";
import { isFitnessPro } from "@/lib/fitness/subscription/access";
import { verifyAdminSession } from "@/app/actions/admin-auth";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const forceV2 = searchParams.get('v2') === 'true' || searchParams.get('engine') === 'v2';

    const { data: profile } = await supabase
      .from('fitness_os_profiles')
      .select('nutrition_engine_v2')
      .eq('user_id', user.id)
      .maybeSingle();

    const isV2 = V2PlanService.isNutritionV2Enabled(user.id, profile, { forceV2 });
    const eligibility = await NutritionService.getWeeklyPlanEligibility(user.id);

    return NextResponse.json({
      success: true,
      data: {
        ...eligibility,
        nutrition_engine_v2: isV2,
        planner_version: isV2 ? V2PlanService.PLANNER_VERSION : 'v1-legacy',
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: error?.message || 'Failed to check eligibility' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const forceV2 = searchParams.get('v2') === 'true' || searchParams.get('engine') === 'v2';

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const requestedV2 = forceV2 || body?.v2 === true || body?.engine === 'v2';
    const isAdmin = await verifyAdminSession().catch(() => false);

    const { data: profile } = await supabase
      .from('fitness_os_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const isV2 = V2PlanService.isNutritionV2Enabled(user.id, profile, { 
      forceV2: requestedV2, 
      isAdmin 
    });

    // Source of truth for all plans: V2 deterministic unified planner (Zero AI / LLM dependency)
    // Validated against GrindLog deterministic nutrition rules and automated acceptance tests.
    const result = await V2PlanService.generateV2MealPlan(user.id, {
      forceV2: requestedV2,
      startDate: body?.start_date,
    });

    NutritionService.invalidateServerCache(user.id);
    try {
      revalidatePath("/nutrition");
      revalidatePath("/");
      revalidatePath("/grocery");
    } catch {}

    return NextResponse.json({ 
      success: true, 
      engine: isV2 ? 'v2' : 'v1',
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

    if (
      message.startsWith('PROFILE_INCOMPLETE:') ||
      message.startsWith('AGE_RESTRICTED_NUTRITION_PLAN:') ||
      message.startsWith('CLINICAL_REVIEW_REQUIRED:') ||
      message.startsWith('PLAN_VALIDATION_FAILED:')
    ) {
      const [code, ...details] = message.split(':');
      return NextResponse.json(
        { success: false, error: { code, message: details.join(':').trim() } },
        { status: 422 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message } },
      { status: 500 }
    );
  }
}
