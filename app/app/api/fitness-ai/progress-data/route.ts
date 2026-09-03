import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { ProgressAnalyticsService } from "@/lib/services/analytics/progress-service";
import { AnalyticsPeriod } from "@/types/fitness/analytics";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await canUseFitnessFeature(user.id, "advanced_progress_analysis"))) {
      return NextResponse.json({ error: "Progress tracking is available on the Pro plan.", errorType: "PRO_REQUIRED" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const periodParam = searchParams.get('period') as AnalyticsPeriod;
    const validPeriods: AnalyticsPeriod[] = ['7D', '30D', '3M', '6M', 'ALL'];
    
    const period = validPeriods.includes(periodParam) ? periodParam : '30D';

    const data = await ProgressAnalyticsService.getAggregatedProgress(user.id, period);

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Failed to fetch progress data:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
