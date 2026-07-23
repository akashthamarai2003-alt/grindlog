import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { Resend } from "resend";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const supabaseAdmin = createAdminClient();

    // Check if user exists
    const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = usersData?.users.some(u => u.email?.toLowerCase() === cleanEmail);

    if (userError || !userExists) {
      // Return success without leaking whether account exists for security
      return NextResponse.json({ success: true });
    }

    const origin = new URL(request.url).origin;
    const redirectTo = `${origin}/auth/reset-password`;

    let emailSent = false;

    // Attempt 1: Try Resend email sending if key exists
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
          type: "recovery",
          email: cleanEmail,
          options: { redirectTo },
        });

        if (!linkError && linkData?.properties?.action_link) {
          const resetLink = linkData.properties.action_link;
          const fromAddress = process.env.RESEND_FROM_EMAIL || "GrindLog <onboarding@resend.dev>";
          const { error: resendError } = await resend.emails.send({
            from: fromAddress,
            to: [cleanEmail],
            replyTo: "grindlogapp6@gmail.com",
            subject: "Reset your GrindLog password",
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                  <img src="${origin}/icons/icon-512.png" alt="GrindLog Logo" style="width: 80px; height: 80px; border-radius: 20px;" />
                </div>
                <h2 style="color: #34C759; margin-bottom: 20px; text-align: center;">Reset Your Password</h2>
                <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
                  We received a request to reset the password for your GrindLog account (${cleanEmail}).
                </p>
                <div style="margin: 30px 0; text-align: center;">
                  <a href="${resetLink}" style="background-color: #34C759; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    Reset Password
                  </a>
                </div>
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                  Or copy and paste this link into your browser:<br>
                  <a href="${resetLink}" style="color: #34C759; word-break: break-all;">${resetLink}</a>
                </p>
              </div>
            `,
          });

          if (!resendError) {
            emailSent = true;
          } else {
            console.warn("Resend email delivery fallback notice:", resendError.message || resendError);
          }
        }
      } catch (e) {
        console.warn("Resend attempt failed, falling back to Supabase auth mailer:", e);
      }
    }

    // Attempt 2: Fallback to Supabase Native Reset Email if Resend failed or restricted
    if (!emailSent) {
      const { error: supaError } = await supabaseAdmin.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (supaError) {
        console.error("Supabase reset email error:", supaError);
        return NextResponse.json({ error: supaError.message || "Failed to send reset email. Please try again." }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
