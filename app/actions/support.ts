"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";

export async function submitSupportMessage(subject: string, message: string) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();

    // Insert message into the database
    const { error } = await supabase.from("support_messages").insert({
      user_id: user.id,
      user_email: user.email,
      user_name: profile?.display_name || 'Unknown',
      subject,
      message,
      status: 'new'
    });

    if (error) throw error;

    return { success: true };
  } catch (err: any) {
    console.error("Failed to send support message:", err);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}

export async function getUserSupportMessages() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated", data: [] };
    }

    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error("Failed to fetch user support messages:", err);
    return { success: false, error: err.message, data: [] };
  }
}
