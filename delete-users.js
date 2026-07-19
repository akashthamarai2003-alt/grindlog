require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteUsers() {
  try {
    console.log("Fetching users...");
    // We might need pagination if there are many users, but for a dev environment this is fine
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) throw error;
    
    console.log(`Found ${users.length} users.`);
    let deletedCount = 0;
    
    for (const user of users) {
      if (user.email !== 'akashthamarai2003@gmail.com') {
        console.log(`Deleting user: ${user.email} (${user.id})`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
        if (deleteError) {
          console.error(`Failed to delete ${user.email}:`, deleteError.message);
        } else {
          deletedCount++;
        }
      } else {
        console.log(`Skipping: ${user.email}`);
      }
    }
    
    console.log(`\nOperation complete. Deleted ${deletedCount} users.`);
  } catch (err) {
    console.error("Error:", err);
  }
}

deleteUsers();
