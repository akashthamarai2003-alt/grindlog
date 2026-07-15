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

    // Insert or update the token. 
    // Using an upsert on the user_id would be best, but we'll use a direct insert 
    // with ON CONFLICT if the token is unique. Since a user can have multiple devices,
    // we want to store multiple tokens, but our SQL made token UNIQUE.
    const { error } = await supabase
      .from("fcm_tokens")
      .insert({ user_id: user.id, token: token })
      .select()
      .single();

    // If it violates unique constraint, it means the token is already registered (which is fine)
    if (error && error.code !== '23505') { 
      console.error("Error inserting FCM token:", error);
      return NextResponse.json({ error: "Failed to store token" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("FCM Register Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
