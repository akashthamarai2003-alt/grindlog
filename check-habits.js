const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const envLines = fs.readFileSync(".env.local", "utf8").split("\n");
const env = {};
for (const line of envLines) {
  if (line && line.includes("=")) {
    const [k, ...v] = line.split("=");
    env[k.trim()] = v.join("=").trim().replace(/['"]/g, '');
  }
}

const supabase = createClient(
  env["NEXT_PUBLIC_SUPABASE_URL"],
  env["SUPABASE_SERVICE_ROLE_KEY"]
);

async function main() {
  const { data: profiles } = await supabase.from("profiles").select("id, display_name");
  console.log(profiles);
}
main();
