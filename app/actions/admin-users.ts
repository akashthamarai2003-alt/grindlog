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

export async function sendUserEmailAdminAction(toEmail: string, subject: string, message: string) {
  try {
    if (!toEmail || !toEmail.trim()) {
      return { success: false, error: "Recipient email is required" };
    }
    if (!subject || !subject.trim()) {
      return { success: false, error: "Subject line is required" };
    }
    if (!message || !message.trim()) {
      return { success: false, error: "Message content is required" };
    }

    const cleanEmail = toEmail.trim();

    if (process.env.RESEND_API_KEY) {
      const { Resend } = await import("resend");
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const safeSubject = subject.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      const safeMessage = message.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");

      const formattedHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 16px; background-color: #ffffff;">
          <div style="text-align: center; margin-bottom: 20px; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px;">
            <h2 style="color: #34C759; margin: 0; font-size: 20px;">GrindLog Support</h2>
          </div>
          <h3 style="color: #111827; margin-bottom: 16px; font-size: 16px;">${safeSubject}</h3>
          <div style="font-size: 14px; color: #374151; line-height: 1.6; background-color: #f9fafb; padding: 16px; border-radius: 12px; border: 1px solid #f3f4f6;">
            ${safeMessage}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0 16px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin: 0;">
            Sent by GrindLog Support • <a href="https://grindlog.in" style="color: #34C759; text-decoration: none;">grindlog.in</a>
          </p>
        </div>
      `;

      const fromAddress = process.env.RESEND_FROM_EMAIL || "GrindLog <grindlogapp6@gmail.com>";

      const { data, error } = await resend.emails.send({
        from: fromAddress,
        to: [cleanEmail],
        subject: subject.trim(),
        html: formattedHtml,
      });

      if (error) {
        console.error("Resend send email error:", error);
        return { success: false, error: error.message || "Failed to send email via Resend" };
      }

      return { success: true, messageId: data?.id };
    } else {
      return { 
        success: false, 
        error: "RESEND_API_KEY is not configured in server environment. Please use the 'Open in Mail App' button to dispatch via your default email application." 
      };
    }
  } catch (error: any) {
    console.error("sendUserEmailAdminAction error:", error);
    return { success: false, error: error.message || "Failed to send email" };
  }
}
