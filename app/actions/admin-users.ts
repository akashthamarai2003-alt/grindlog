"use server";

import { createAdminClient } from "@/lib/services/supabase/admin";
import { revalidatePath } from "next/cache";

export async function deleteUserAdminAction(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    const supabaseAdmin = createAdminClient();

    // 1. Delete user records from database tables
    const tablesToClean = [
      "habit_logs",
      "habits",
      "fitness_logs",
      "goals",
      "journal_entries",
      "in_app_notifications",
      "user_achievements",
      "subscriptions",
      "ai_usage",
      "support_messages",
      "profiles",
    ];

    for (const table of tablesToClean) {
      try {
        if (table === "profiles") {
          await supabaseAdmin.from("profiles").delete().eq("id", userId);
        } else {
          await supabaseAdmin.from(table).delete().eq("user_id", userId);
        }
      } catch (e) {
        console.warn(`Clean table notice (${table}):`, e);
      }
    }

    // 2. Delete user from Supabase Auth (auth.users)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);

    if (authError) {
      console.error("Supabase Auth delete user error:", authError);
      return { success: false, error: authError.message || "Failed to delete user auth record" };
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error: any) {
    console.error("Delete user admin action error:", error);
    return { success: false, error: error.message || "Failed to delete user" };
  }
}
