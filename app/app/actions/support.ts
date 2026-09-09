"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { revalidatePath } from "next/cache";

export async function submitSupportMessage(subject: string, message: string) {
  try {
    if (!subject?.trim() || !message?.trim()) {
      return { success: false, error: "Please enter both a subject and a message." };
    }

    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    // Resolve user's display name from Fitness OS profile or main profile
    const [fitnessProfileRes, profileRes] = await Promise.all([
      supabase.from("fitness_os_profiles").select("name").eq("user_id", user.id).maybeSingle(),
      supabase.from("profiles").select("display_name, name").eq("id", user.id).maybeSingle(),
    ]);

    const resolvedName =
      fitnessProfileRes.data?.name ||
      profileRes.data?.display_name ||
      profileRes.data?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "Athlete";

    const adminClient = createAdminClient();

    // Insert message into the database
    const { error } = await adminClient.from("support_messages").insert({
      user_id: user.id,
      user_email: user.email,
      user_name: resolvedName,
      subject: subject.trim(),
      message: message.trim(),
      status: "new",
    });

    if (error) throw error;

    revalidatePath("/admin/support");
    revalidatePath("/support");

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

    const adminClient = createAdminClient();

    const { data, error } = await adminClient
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
