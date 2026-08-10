import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/services/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { data: subscription } = await supabase
      .from("fitness_os_subscriptions")
      .select("*")
      .eq("user_id", authData.user.id)
      .single();

    return NextResponse.json({ subscription: subscription || null });
  } catch (error: any) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
