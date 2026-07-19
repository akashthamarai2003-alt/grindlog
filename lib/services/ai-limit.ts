import { SupabaseClient } from "@supabase/supabase-js";

const DAILY_LIMIT = 10;

export async function checkAILimit(supabase: SupabaseClient, userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("ai_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    console.error("Error checking AI limit:", error);
    return { allowed: false, count: 0, error };
  }

  return {
    allowed: (count || 0) < DAILY_LIMIT,
    count: count || 0
  };
}

export async function logAIUsage(supabase: SupabaseClient, userId: string, sessionType: string, prompt: string = "", response: string = "") {
  try {
    await supabase.from("ai_sessions").insert({
      user_id: userId,
      session_type: sessionType,
      prompt,
      response,
      model: "system",
      tokens_used: 0,
    } as any);
  } catch (error) {
    console.error("Failed to log AI usage:", error);
  }
}
