require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function alterTable() {
  console.log("Adding razorpay_payment_id to profiles...");
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: "alter table public.profiles add column if not exists razorpay_payment_id text;"
  });

  if (error) {
    console.log("RPC might not exist, trying fallback approach or just ask user to run it in SQL Editor.");
    console.log("Error:", error.message);
  } else {
    console.log("Success:", data);
  }
}

alterTable();
