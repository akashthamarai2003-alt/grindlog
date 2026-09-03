import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { AIInsightService } from "@/lib/services/analytics/ai-insight-service";
import { AnalyticsPeriod } from "@/types/fitness/analytics";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

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

    const body = await req.json();
    const period: AnalyticsPeriod = body.period || '30D';
    const forceRefresh: boolean = !!body.forceRefresh;

    const review = await AIInsightService.generateWeeklyReview(user.id, period, forceRefresh);

    return NextResponse.json({ review });
  } catch (error: any) {
    console.error("AI Review API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate review" }, { status: 500 });
  }
}
