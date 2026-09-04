import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

const MEASUREMENT_LIMITS: Record<string, { label: string; min: number; max: number }> = {
  waist: { label: "Waist", min: 40, max: 200 },
  chest: { label: "Chest", min: 50, max: 220 },
  hip: { label: "Hip", min: 50, max: 220 },
  neck: { label: "Neck", min: 20, max: 70 },
  left_arm: { label: "Left Arm", min: 15, max: 75 },
  right_arm: { label: "Right Arm", min: 15, max: 75 },
  left_thigh: { label: "Left Thigh", min: 25, max: 120 },
  right_thigh: { label: "Right Thigh", min: 25, max: 120 },
};

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    // Fetch the latest entry with any non-null measurement
    const { data: latest } = await supabase
      .from('fitness_os_body_metrics')
      .select('waist, chest, hip, neck, left_arm, right_arm, left_thigh, right_thigh, recorded_at')
      .eq('user_id', user.id)
      .or('waist.not.is.null,chest.not.is.null,hip.not.is.null,neck.not.is.null,left_arm.not.is.null,right_arm.not.is.null,left_thigh.not.is.null,right_thigh.not.is.null')
      .order('recorded_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      latest: latest || null
    });
  } catch (err: any) {
    console.error("Fetch Latest Measurements Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

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

    const body = await req.json();
    const { waist, chest, hip, neck, left_arm, right_arm, left_thigh, right_thigh, date } = body;

    const parsed: Record<string, number | null> = {};
    let filledCount = 0;

    for (const [key, config] of Object.entries(MEASUREMENT_LIMITS)) {
      const rawVal = body[key];
      if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
        const num = Number(rawVal);
        if (isNaN(num)) {
          return NextResponse.json({ success: false, error: `Invalid number entered for ${config.label}.` }, { status: 400 });
        }
        if (num < config.min || num > config.max) {
          return NextResponse.json({
            success: false,
            error: `${config.label} measurement must be between ${config.min} cm and ${config.max} cm.`
          }, { status: 400 });
        }
        // Round to 1 decimal place
        parsed[key] = Math.round(num * 10) / 10;
        filledCount++;
      } else {
        parsed[key] = null;
      }
    }

    if (filledCount === 0) {
      return NextResponse.json({ success: false, error: 'Please enter at least one valid measurement.' }, { status: 400 });
    }

    const recordedAt = date ? new Date(date).toISOString() : new Date().toISOString();

    const { error: metricError } = await supabase
      .from('fitness_os_body_metrics')
      .insert({
        user_id: user.id,
        waist: parsed.waist,
        chest: parsed.chest,
        hip: parsed.hip,
        neck: parsed.neck,
        left_arm: parsed.left_arm,
        right_arm: parsed.right_arm,
        left_thigh: parsed.left_thigh,
        right_thigh: parsed.right_thigh,
        recorded_at: recordedAt
      });

    if (metricError) throw metricError;

    return NextResponse.json({ success: true, recordedAt });

  } catch (err: any) {
    console.error("Log Measurements Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
