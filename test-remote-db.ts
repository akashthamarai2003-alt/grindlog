import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function testInsert() {
  const { data: users } = await supabase.auth.admin.listUsers();
  if (!users || users.users.length === 0) {
    console.log("No users found");
    return;
  }
  const user = users.users[0];

  console.log("Testing insert...");
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      plan: "ai_messages_10",
      status: "active",
      razorpay_order_id: "test_order_" + Date.now(),
      razorpay_payment_id: "test_payment_" + Date.now(),
    })
    .select();

  console.log("Error:", error);
  console.log("Data:", data);

  // Clean up
  if (data && data.length > 0) {
    await supabase.from("subscriptions").delete().eq("id", data[0].id);
  }
}

testInsert();
