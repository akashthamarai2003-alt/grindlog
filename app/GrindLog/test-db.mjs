import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
  const { data: user } = await supabase.from('profiles').select('id, email').eq('email', 'aiforbusiness990@gmail.com').single();
  if (!user) {
    console.log("User not found");
    return;
  }
  console.log("User ID:", user.id);

  // Manually insert a mock subscription for this user
  const { data: sub, error } = await supabase.from('subscriptions').insert({
    user_id: user.id,
    plan: "monthly_pro",
    status: "active",
    razorpay_order_id: "order_test123",
    razorpay_payment_id: "pay_test123",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  }).select();

  if (error) {
    console.error("Insert error:", error);
  } else {
    console.log("Inserted mock subscription:", sub);
  }
}

run();
