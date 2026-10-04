import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { getV2NutritionDay } from "@/lib/services/nutrition/v2-ui-data";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    const { data: profile, error: profileError } = await supabase.from("fitness_os_profiles")
      .select("nutrition_engine_v2").eq("user_id", user.id).maybeSingle();
    if (profileError) throw profileError;
    if (profile?.nutrition_engine_v2 !== true) {
      return NextResponse.json({ error: "V2_NOT_ENABLED" }, { status: 403 });
    }
    const date = new URL(request.url).searchParams.get("date") || undefined;
    if (date && (!/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      Number.isNaN(Date.parse(`${date}T00:00:00Z`)))) {
      return NextResponse.json({ error: "INVALID_DATE" }, { status: 400 });
    }
    const data = await getV2NutritionDay(user.id, date);
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("V2 nutrition day read failed:", error);
    return NextResponse.json({ error: "Could not load this day's nutrition." }, { status: 500 });
  }
}
