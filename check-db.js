require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log("Checking database for premium profiles...");
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_premium, premium_tier, updated_at")
    .eq("is_premium", true)
    .order("updated_at", { ascending: false })
    .limit(5);

  if (profileError) {
    console.error("Error fetching profiles:", profileError);
  } else {
    console.log("Recent Premium Profiles:");
    console.table(profiles);
  }

  console.log("\nChecking coupon usage...");
  const { data: coupons, error: couponError } = await supabase
    .from("coupons")
    .select("code, used_count, max_uses, allowed_plan")
    .order("created_at", { ascending: false });

  if (couponError) {
    console.error("Error fetching coupons:", couponError);
  } else {
    console.log("Coupons:");
    console.table(coupons);
  }
}

checkDatabase();
