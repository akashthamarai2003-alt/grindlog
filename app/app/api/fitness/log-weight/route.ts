import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const [profileRes, metricsRes] = await Promise.all([
      supabase
        .from('fitness_os_profiles')
        .select('weight, target_weight, weight_trend_baseline, created_at')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('fitness_os_body_metrics')
        .select('id, weight, recorded_at')
        .eq('user_id', user.id)
        .not('weight', 'is', null)
        .order('recorded_at', { ascending: false })
        .limit(7)
    ]);

    const fitProfile = profileRes.data;
    const recentLogs = metricsRes.data || [];

    // Latest recorded weight
    const latestLoggedWeight = recentLogs[0]?.weight ?? fitProfile?.weight ?? null;

    return NextResponse.json({
      success: true,
      currentWeight: latestLoggedWeight !== null ? Number(latestLoggedWeight) : null,
      targetWeight: fitProfile?.target_weight ? Number(fitProfile.target_weight) : null,
      baselineWeight: fitProfile?.weight_trend_baseline ? Number(fitProfile.weight_trend_baseline) : null,
      recentLogs
    });
  } catch (err: any) {
    console.error("Fetch Log Weight Info Error:", err);
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
    const { weight, date } = body;

    if (weight === undefined || weight === null || weight === '' || isNaN(Number(weight))) {
      return NextResponse.json({ success: false, error: 'Please enter a valid weight number.' }, { status: 400 });
    }

    const numWeight = Number(weight);

    // Realistic human weight validation
    if (numWeight < 20) {
      return NextResponse.json({ success: false, error: 'Weight must be at least 20 kg.' }, { status: 400 });
    }
    if (numWeight > 350) {
      return NextResponse.json({ success: false, error: 'Weight cannot exceed 350 kg.' }, { status: 400 });
    }

    // Clean rounding to max 2 decimal places
    const cleanWeight = Math.round(numWeight * 100) / 100;
    const recordedAt = date ? new Date(date).toISOString() : new Date().toISOString();

    // 1. Insert into body metrics history
    const { error: metricError } = await supabase
      .from('fitness_os_body_metrics')
      .insert({
        user_id: user.id,
        weight: cleanWeight,
        recorded_at: recordedAt
      });

    if (metricError) throw metricError;

    // 2. Update fitness_os_profiles current weight trend/baseline
    const { error: fitProfileError } = await supabase
      .from('fitness_os_profiles')
      .update({ 
        weight: cleanWeight,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (fitProfileError) throw fitProfileError;

    // 3. Update main profiles table current_weight
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        current_weight: cleanWeight,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, weight: cleanWeight });

  } catch (err: any) {
    console.error("Log Weight Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
