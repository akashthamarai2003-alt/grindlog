require("dotenv").config({ path: ".env.local" });
const { createClient } = require("@supabase/supabase-js");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addHardcoreAchievements() {
  const achievements = [
    { key: "quarterly_master", name: "Quarterly Master", description: "90-day streak on any habit", emoji: "💎", category: "streaks", xp_reward: 2000, coins_reward: 1000, sort_order: 15 },
    { key: "half_year_hero", name: "Half-Year Hero", description: "180-day streak on any habit", emoji: "🦸", category: "streaks", xp_reward: 5000, coins_reward: 2500, sort_order: 16 },
    { key: "thousand_club", name: "The 1000 Club", description: "Complete 1,000 habits total", emoji: "💯", category: "consistency", xp_reward: 10000, coins_reward: 5000, sort_order: 25 },
    { key: "grind_legend", name: "Grind Legend", description: "Complete 5,000 habits total", emoji: "👑", category: "legendary", xp_reward: 50000, coins_reward: 20000, sort_order: 30 }
  ];

  for (const ach of achievements) {
    const { error } = await supabase.from("achievements").insert(ach);
    if (error && error.code !== '23505') { // Ignore unique constraint violations
      console.error("Error inserting", ach.name, error.message);
    } else {
      console.log("Successfully added/verified", ach.name);
    }
  }
}

addHardcoreAchievements();
