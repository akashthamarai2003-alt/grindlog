import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    if (!(await canUseFitnessFeature(user.id, "advanced_progress_analysis"))) {
      return NextResponse.json({ success: false, error: "Progress tracking is available on the Pro plan.", errorType: "PRO_REQUIRED" }, { status: 403 });
    }

    const { waist, chest, hip, neck, left_arm, right_arm, left_thigh, right_thigh } = await req.json();

    const { error: metricError } = await supabase
      .from('fitness_os_body_metrics')
      .insert({
        user_id: user.id,
        waist: waist ? Number(waist) : null,
        chest: chest ? Number(chest) : null,
        hip: hip ? Number(hip) : null,
        neck: neck ? Number(neck) : null,
        left_arm: left_arm ? Number(left_arm) : null,
        right_arm: right_arm ? Number(right_arm) : null,
        left_thigh: left_thigh ? Number(left_thigh) : null,
        right_thigh: right_thigh ? Number(right_thigh) : null,
        recorded_at: new Date().toISOString()
      });

    if (metricError) throw metricError;

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error("Log Measurements Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
