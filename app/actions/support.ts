"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function submitSupportMessage(subject: string, message: string) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Not authenticated" };
    }

    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single();

    // Send email to admin
    await resend.emails.send({
      from: "GrindLog Support <onboarding@resend.dev>",
      to: "akashthamarai2003@gmail.com",
      subject: `[GrindLog Support] ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #34C759;">New Support Request</h2>
          <p><strong>From:</strong> ${profile?.display_name || 'Unknown'} (${user.email})</p>
          <p><strong>User ID:</strong> ${user.id}</p>
          <hr style="border: 1px solid #eee; my: 20px;" />
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; white-space: pre-wrap;">${message}</div>
        </div>
      `,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Failed to send support message:", err);
    return { success: false, error: "Failed to send message. Please try again." };
  }
}
