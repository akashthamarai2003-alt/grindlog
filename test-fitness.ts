import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  const { data } = await supabase.from("fitness_os_profiles").select("user_id");
  const { data: users } = await supabase.from("profiles").select("id, email, display_name");

  console.log("Fitness OS User IDs:", data?.map(d => d.user_id));
  
  if (data && users) {
    const fitnessUsers = users.filter(u => data.some(d => d.user_id === u.id));
    console.log("Users identified as Fitness:", fitnessUsers.map(u => u.email));
  }
}
run();
