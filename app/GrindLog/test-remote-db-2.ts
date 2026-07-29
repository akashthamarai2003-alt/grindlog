import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkData() {
  const { data: users } = await supabase.from('profiles').select('id');
  if (!users) return;

  for (const user of users) {
    const { count: purchasedUsedCount } = await supabase
      .from("ai_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .like("session_type", "%_purchased");

    const { data: purchases, error } = await supabase
      .from("subscriptions")
      .select("id, created_at")
      .eq("user_id", user.id)
      .eq("plan", "ai_messages_10")
      .eq("status", "active");

    console.log(`User ${user.id}: used=${purchasedUsedCount}, purchases=${purchases?.length}, error=${error?.message}`);
  }
}

checkData();
