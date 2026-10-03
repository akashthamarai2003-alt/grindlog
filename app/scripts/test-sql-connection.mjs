import dotenv from "dotenv";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing SUPABASE credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Testing connection to Supabase...");
  const { data, error } = await supabase.rpc("execute_sql", { sql_query: "SELECT current_database(), version();" });
  if (error) {
    console.error("execute_sql RPC failed or not present:", error);
  } else {
    console.log("execute_sql RPC succeeded:", data);
  }
}

main().catch(console.error);
