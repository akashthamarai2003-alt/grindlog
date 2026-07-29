import { createServerSupabase } from "@/lib/services/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token, oldToken } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    if (oldToken && oldToken !== token) {
      const { error: deleteError } = await supabase
        .from("fcm_tokens")
        .delete()
        .eq("user_id", user.id)
        .eq("token", oldToken);

      if (deleteError) {
        console.error("Error removing old FCM token:", deleteError);
      }
    }

    const { error } = await supabase
      .from("fcm_tokens")
      .upsert({ user_id: user.id, token }, { onConflict: "token" });

    if (error) {
      console.error("Error inserting FCM token:", error);
      return NextResponse.json({ error: "Failed to store token" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("FCM Register Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
