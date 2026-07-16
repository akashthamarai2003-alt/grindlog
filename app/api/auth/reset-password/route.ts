import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabaseAdmin = createAdminClient();
    
    // Check if the user exists
    const { data: usersData, error: userError } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = usersData?.users.some(u => u.email === email);

    if (userError || !userExists) {
      // Don't leak whether the user exists or not
      return NextResponse.json({ success: true });
    }

    // Generate the recovery link
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
      },
    });

    if (error) {
      console.error("Generate link error:", error);
      return NextResponse.json({ error: "Failed to generate reset link" }, { status: 500 });
    }

    const resetLink = data.properties.action_link;

    // Send the email using Resend
    const { error: resendError } = await resend.emails.send({
      from: "GrindLog <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your GrindLog password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://grindlog-lake.vercel.app/icons/icon-512.png" alt="GrindLog Logo" style="width: 80px; height: 80px; border-radius: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
          </div>
          <h2 style="color: #34C759; margin-bottom: 20px; text-align: center;">Reset Your Password</h2>
          <p style="font-size: 16px; color: #333; line-height: 1.5; text-align: center;">
            We received a request to reset the password for your GrindLog account.
            If you didn't make this request, you can safely ignore this email.
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
          <hr style="border: none; border-top: 1px solid #eaeaea; margin: 30px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">
            Grow into your best self with GrindLog.
          </p>
        </div>
      `,
    });

    if (resendError) {
      console.error("Resend error:", resendError);
      return NextResponse.json({ error: "Failed to send email via Resend" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
