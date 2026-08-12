import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envFile = readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  const sqlPath = path.join(__dirname, "app/lib/db/add_missing_profile_columns.sql");
  const sqlQuery = readFileSync(sqlPath, "utf-8");

  console.log("Running migration...");
  const { data, error } = await supabase.rpc('execute_sql', { sql_query: sqlQuery });

  if (error) {
    console.error("Migration Error:", error.message);
  } else {
    console.log("Migration Success!");
  }
}

runMigration();
