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
  console.log("Adding name, country, preferred_language to fitness_os_profiles...");
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: `
      ALTER TABLE public.fitness_os_profiles 
      ADD COLUMN IF NOT EXISTS name TEXT,
      ADD COLUMN IF NOT EXISTS country TEXT,
      ADD COLUMN IF NOT EXISTS preferred_language TEXT;
    `
  });

  if (error) {
    console.log("RPC might not exist, trying fallback approach or just ask user to run it in SQL Editor.");
    console.log("Error:", error.message);
  } else {
    console.log("Success:", data);
  }
}

alterTable();
