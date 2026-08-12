import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      fitness_os_profiles (user_id),
      subscriptions (
        id,
        plan,
        status,
        started_at,
        expires_at,
        razorpay_subscription_id,
        razorpay_payment_id
      )
    `)
    .limit(1);

  if (error) {
    console.error("Query Error:", error);
  } else {
    console.log("Success! Data:", data);
  }
}

run();
