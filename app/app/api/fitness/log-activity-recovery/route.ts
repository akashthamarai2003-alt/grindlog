import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const [activityRes, sleepRes, planRes] = await Promise.all([
      supabase
        .from('fitness_os_activity_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('activity_date', dateParam)
        .maybeSingle(),
      supabase
        .from('fitness_os_sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('sleep_date', dateParam)
        .maybeSingle(),
      supabase
        .from('fitness_os_workout_plans')
        .select('plan_data')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .maybeSingle(),
    ]);

    const lifestyle = planRes.data?.plan_data?.lifestyle;

    return NextResponse.json({
      success: true,
      date: dateParam,
      activity: activityRes.data || null,
      sleep: sleepRes.data || null,
      targets: {
        stepTarget: Number(lifestyle?.daily_steps_target) || 8000,
        sleepTargetHours: Number(lifestyle?.sleep_target_hours) || 8,
      },
    });
  } catch (err: any) {
    console.error("Fetch Activity/Sleep Error:", err);
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

    const body = await req.json();
    const {
      date,
      steps,
      activeMinutes,
      distanceKm,
      sleepHours,
      sleepQuality,
    } = body;

    const targetDate = date ? String(date).split('T')[0] : new Date().toISOString().split('T')[0];

    let loggedCount = 0;

    // 1. Handle Activity Log (Steps, active minutes, distance)
    if (steps !== undefined && steps !== null && steps !== "") {
      const parsedSteps = Math.max(0, Math.round(Number(steps) || 0));
      const activityPayload: any = {
        user_id: user.id,
        activity_date: targetDate,
        steps: parsedSteps,
        updated_at: new Date().toISOString(),
      };

      if (activeMinutes !== undefined && activeMinutes !== null && activeMinutes !== "") {
        activityPayload.active_minutes = Math.max(0, Math.round(Number(activeMinutes) || 0));
      }
      if (distanceKm !== undefined && distanceKm !== null && distanceKm !== "") {
        activityPayload.distance_km = Math.max(0, Number(distanceKm) || 0);
      }

      const { error: actErr } = await supabase
        .from('fitness_os_activity_logs')
        .upsert(activityPayload, { onConflict: 'user_id,activity_date' });

      if (actErr) {
        console.error("Upsert activity error:", actErr);
        return NextResponse.json({ success: false, error: actErr.message }, { status: 500 });
      }
      loggedCount++;
    }

    // 2. Handle Sleep Log (Duration hours, quality score 1-10)
    if (sleepHours !== undefined && sleepHours !== null && sleepHours !== "") {
      const parsedHours = Math.max(0, Math.min(24, Number(sleepHours) || 0));
      const sleepPayload: any = {
        user_id: user.id,
        sleep_date: targetDate,
        duration_hours: parsedHours,
        updated_at: new Date().toISOString(),
      };

      if (sleepQuality !== undefined && sleepQuality !== null && sleepQuality !== "") {
        sleepPayload.quality_score = Math.max(1, Math.min(10, Math.round(Number(sleepQuality) || 7)));
      }

      const { error: slpErr } = await supabase
        .from('fitness_os_sleep_logs')
        .upsert(sleepPayload, { onConflict: 'user_id,sleep_date' });

      if (slpErr) {
        console.error("Upsert sleep error:", slpErr);
        return NextResponse.json({ success: false, error: slpErr.message }, { status: 500 });
      }
      loggedCount++;
    }

    if (loggedCount === 0) {
      return NextResponse.json({ success: false, error: 'No activity or sleep data provided.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Activity & recovery logged successfully',
      date: targetDate,
    });
  } catch (err: any) {
    console.error("Log Activity/Recovery Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
