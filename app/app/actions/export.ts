"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";

export async function exportUserData() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Fetch all relevant data for the user
    const [
      { data: profile },
      { data: habits },
      { data: habitLogs },
      { data: journalEntries },
      { data: goals },
      { data: fitnessLogs },
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("habits").select("*").eq("user_id", user.id),
      supabase.from("habit_logs").select("*").eq("user_id", user.id),
      supabase.from("journal_entries").select("*").eq("user_id", user.id),
      supabase.from("goals").select("*").eq("user_id", user.id),
      supabase.from("fitness_logs").select("*").eq("user_id", user.id),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        id: user.id,
        email: user.email,
      },
      profile: profile || {},
      habits: habits || [],
      habitLogs: habitLogs || [],
      journalEntries: journalEntries || [],
      goals: goals || [],
      fitnessLogs: fitnessLogs || [],
    };

    return { success: true, data: exportData };
  } catch (error: any) {
    console.error("Export data error:", error);
    return { success: false, error: error.message || "Failed to export data" };
  }
}
