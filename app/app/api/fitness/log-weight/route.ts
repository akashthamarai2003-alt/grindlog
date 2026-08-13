import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const { weight } = await req.json();

    if (!weight || isNaN(Number(weight))) {
      return NextResponse.json({ success: false, error: 'Valid weight is required' }, { status: 400 });
    }

    // 1. Insert into body metrics history
    const { error: metricError } = await supabase
      .from('fitness_os_body_metrics')
      .insert({
        user_id: user.id,
        weight: Number(weight),
        recorded_at: new Date().toISOString()
      });

    if (metricError) throw metricError;

    // 2. Update fitness_os_profiles current weight trend/baseline
    const { error: fitProfileError } = await supabase
      .from('fitness_os_profiles')
      .update({ 
        weight: Number(weight),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (fitProfileError) throw fitProfileError;

    // 3. Update main profiles table current_weight
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        current_weight: Number(weight),
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, weight: Number(weight) });

  } catch (err: any) {
    console.error("Log Weight Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
