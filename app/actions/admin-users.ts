"use server";

import { createAdminClient } from "@/lib/services/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteUserAdminAction(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    const supabaseAdmin = createAdminClient();

    // 1. Clean up user records from dependent tables
    const tablesWithUserId = [
      "season_progress",
      "user_quests",
      "user_achievements",
      "subscriptions",
      "habit_logs",
      "habits",
      "journal_entries",
      "goals",
      "fitness_logs",
      "in_app_notifications",
      "ai_usage",
      "support_messages",
    ];

    for (const table of tablesWithUserId) {
      try {
        const { error } = await supabaseAdmin.from(table).delete().eq("user_id", userId);
        if (error) {
          console.warn(`Table cleanup notice (${table}):`, error.message || error);
        }
      } catch (e) {
        console.warn(`Table cleanup exception (${table}):`, e);
      }
    }

    // Delete profile record (referenced by profile id)
    try {
      const { error: profileErr } = await supabaseAdmin.from("profiles").delete().eq("id", userId);
      if (profileErr) {
        console.warn("Profile cleanup notice:", profileErr.message || profileErr);
      }
    } catch (e) {
      console.warn("Profile cleanup exception:", e);
    }

    // 2. Delete user from Supabase Auth (auth.users)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Supabase Auth delete user error:", authError);
      const errorMessage = typeof authError === "string" 
        ? authError 
        : authError.message || (typeof authError === "object" ? JSON.stringify(authError) : "Failed to delete user auth record");
      return { success: false, error: errorMessage };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Delete user admin action error:", error);
    const errorMessage = typeof error === "string" 
      ? error 
      : error?.message || (typeof error === "object" ? JSON.stringify(error) : "Failed to delete user");
    return { success: false, error: errorMessage };
  }
}
