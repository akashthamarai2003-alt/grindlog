"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const adminAuth = cookieStore.get("admin_auth");
  return adminAuth?.value === (process.env.ADMIN_PASSWORD || "admin");
}

export async function fetchSupportMessages() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
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
    const isAdmin = await verifyAdmin();
    if (!isAdmin) {
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
