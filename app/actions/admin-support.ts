"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/services/supabase/admin-auth";

export async function fetchSupportMessages() {
  try {
    const supabase = await createServerSupabase();
    // Use service role if needed, or rely on RLS assuming admin_auth check passes
    // Wait, the client doesn't use service role by default.
    // If the RLS isn't properly configured or admin auth table isn't what we expect, 
    // we should securely fetch. We'll verify admin status first.
    const hasAccess = await isAdmin();
    if (!hasAccess) {
      return { success: false, error: "Unauthorized", data: [] };
    }

    // Use service role to bypass RLS since this is a secure admin action
    const adminSupabase = await createServerSupabase(true);
    
    const { data, error } = await adminSupabase
      .from("support_messages")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("Failed to fetch messages:", err);
    return { success: false, error: err.message, data: [] };
  }
}

export async function updateMessageStatus(id: string, newStatus: string) {
  try {
    const hasAccess = await isAdmin();
    if (!hasAccess) {
      return { success: false, error: "Unauthorized" };
    }

    const adminSupabase = await createServerSupabase(true);
    const { error } = await adminSupabase
      .from("support_messages")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) throw error;
    
    revalidatePath("/admin/support");
    return { success: true };
  } catch (err: any) {
    console.error("Failed to update status:", err);
    return { success: false, error: err.message };
  }
}
