require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixConstraint() {
  console.log("Fixing meal_plans unique_user_date constraint...");
  const sql = `
    ALTER TABLE public.meal_plans DROP CONSTRAINT IF EXISTS unique_user_date;
    ALTER TABLE public.meal_plans DROP CONSTRAINT IF EXISTS unique_user_date_meal_type;
    ALTER TABLE public.meal_plans ADD CONSTRAINT unique_user_date_meal_type UNIQUE (user_id, date, meal_type);
  `;
  
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: sql });

  if (error) {
    console.log("RPC execute_sql failed or not available:", error.message);
  } else {
    console.log("Successfully updated meal_plans unique constraint!", data);
  }
}

fixConstraint();
