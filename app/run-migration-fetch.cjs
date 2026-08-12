const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const envVars = envFile.split('\n').reduce((acc, line) => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    acc[key.trim()] = value.join('=').trim().replace(/^"|"$/g, '');
  }
  return acc;
}, {});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log("Missing Supabase credentials");
  process.exit(1);
}

async function runMigration() {
  const sqlPath = path.join(__dirname, "lib/db/add_missing_profile_columns.sql");
  const sqlQuery = fs.readFileSync(sqlPath, "utf-8");

  console.log("Running migration using fetch...");
  
  const res = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`
    },
    body: JSON.stringify({ sql_query: sqlQuery })
  });
  
  const text = await res.text();
  console.log("Response status:", res.status);
  console.log("Response body:", text);
}

runMigration();
