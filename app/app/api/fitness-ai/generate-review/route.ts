import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AIInsightService } from "@/lib/services/analytics/ai-insight-service";
import { AnalyticsPeriod } from "@/types/fitness/analytics";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const clientDate = searchParams.get("clientDate") || undefined;
    const tzOffsetParam = searchParams.get("timezoneOffset");
    const timezoneOffset = tzOffsetParam !== null ? parseInt(tzOffsetParam, 10) : undefined;

    const limitCheck = await AIInsightService.checkDailyGenerationLimit(user.id, clientDate, timezoneOffset);

    return NextResponse.json(limitCheck);
  } catch (error: any) {
    console.error("AI Review Status Error:", error);
    return NextResponse.json({ error: error.message || "Failed to check status" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await canUseFitnessFeature(user.id, "ai_weekly_review"))) {
      return NextResponse.json({ error: "Weekly AI reviews are available on the Pro plan." }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const period: AnalyticsPeriod = body.period || '30D';
    const forceRefresh: boolean = !!body.forceRefresh;
    const clientDate: string | undefined = body.clientDate;
    const timezoneOffset: number | undefined = typeof body.timezoneOffset === 'number' ? body.timezoneOffset : undefined;

    // Check rate limit before executing AI generation
    const limitCheck = await AIInsightService.checkDailyGenerationLimit(user.id, clientDate, timezoneOffset);
    if (limitCheck.hasGeneratedToday) {
      return NextResponse.json({
        error: "Daily limit reached. You can generate 1 AI progress review per day. Next review available tomorrow.",
        limitReached: true,
        canGenerateToday: false,
        review: limitCheck.latestReview,
      }, { status: 429 });
    }

    const result = await AIInsightService.generateWeeklyReview(
      user.id,
      period,
      forceRefresh,
      clientDate,
      timezoneOffset
    );

    if (result.limitReached && !result.review) {
      return NextResponse.json({
        error: result.error || "Daily limit reached. Next review available tomorrow.",
        limitReached: true,
        canGenerateToday: false,
      }, { status: 429 });
    }

    if (!result.review) {
      return NextResponse.json({
        error: result.error || "Could not generate AI review with Groq. Please try again in a moment.",
        limitReached: result.limitReached,
        canGenerateToday: result.canGenerateToday,
      }, { status: 500 });
    }

    return NextResponse.json({
      review: result.review,
      limitReached: result.limitReached,
      canGenerateToday: result.canGenerateToday,
    });
  } catch (error: any) {
    console.error("AI Review API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate review" }, { status: 500 });
  }
}

