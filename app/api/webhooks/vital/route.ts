import { NextResponse } from 'next/server';
import { createServerSupabase } from "@/lib/services/supabase/server";

// Vital API Webhook Example Payload for daily.data.updated
interface VitalWebhookPayload {
  event_type: string;
  data: {
    user_id: string; // The Vital user ID (which maps to our Supabase user ID)
    date: string;
    metrics: {
      steps?: number;
      calories_active?: number;
      sleep_duration?: number;
      sleep_quality?: number;
    }
  }
}

export async function POST(req: Request) {
  try {
    // 1. Verify webhook signature (Skipped in prototype)
    // const signature = req.headers.get('x-vital-signature');

    const payload: VitalWebhookPayload = await req.json();

    // We only care about daily summaries updates from wearables
    if (payload.event_type !== 'daily.data.updated') {
      return NextResponse.json({ received: true });
    }

    const { user_id, date, metrics } = payload.data;
    
    // In a real app, you would map Vital's user_id to your Supabase user.id
    // For this prototype, we assume they are the same or we do a lookup.
    const supabase = await createServerSupabase();

    // Auto-log Steps
    if (metrics.steps) {
      await supabase.from('fitness_os_activity_logs').upsert({
        user_id: user_id,
        activity_date: date,
        steps: metrics.steps,
      }, { onConflict: 'user_id,activity_date' });
    }

    // Auto-log Sleep
    if (metrics.sleep_duration) {
      await supabase.from('fitness_os_sleep_logs').upsert({
        user_id: user_id,
        sleep_date: date,
        duration_hours: metrics.sleep_duration / 3600, // vital returns seconds
        quality_score: metrics.sleep_quality || 80
      }, { onConflict: 'user_id,sleep_date' });
    }

    return NextResponse.json({ success: true, processed: true });

  } catch (error: any) {
    console.error("Vital Webhook Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
