import dotenv from "dotenv";
import path from "node:path";
import process from "node:process";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

async function main() {
  const { data: logs, error: logErr } = await supabase.from("food_logs").select("*").limit(1);
  console.log("Food logs columns:", logs ? Object.keys(logs[0] || {}) : logErr);

  const { data: foods, error: foodErr } = await supabase.from("foods").select("*").limit(1);
  console.log("Foods columns:", foods ? Object.keys(foods[0] || {}) : foodErr);
}

main().catch(console.error);
