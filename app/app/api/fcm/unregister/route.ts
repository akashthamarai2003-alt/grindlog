import { createServerSupabase } from "@/lib/services/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const { error } = await supabase
      .from("fcm_tokens")
      .delete()
      .eq("user_id", user.id)
      .eq("token", token);

    if (error) {
      console.error("Error removing FCM token:", error);
      return NextResponse.json({ error: "Failed to remove token" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("FCM Unregister Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
