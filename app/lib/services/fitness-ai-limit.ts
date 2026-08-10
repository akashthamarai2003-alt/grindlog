import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/services/supabase/admin";

// Basic limits for Fitness AI OS
const FREE_DAILY_FITNESS_LIMIT = 2; // Generation takes a lot
const PRO_DAILY_FITNESS_LIMIT = 10;

export async function checkFitnessAILimit(supabase: SupabaseClient, userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // 1. Check user tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, premium_level")
    .eq("id", userId)
    .single();

  let dailyFreeLimit = FREE_DAILY_FITNESS_LIMIT;
  if (profile?.is_premium && profile?.premium_level === "pro") {
    dailyFreeLimit = PRO_DAILY_FITNESS_LIMIT;
  }

  // 2. Count today's fitness AI sessions
  const adminClient = createAdminClient();
  
  const { count, error } = await adminClient
    .from("fitness_os_ai_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString());

  if (error) {
    console.error("Error checking Fitness AI limit:", error);
    return { allowed: false, count: 0, error };
  }
  
  const todayCount = count || 0;

  if (todayCount < dailyFreeLimit) {
    return { allowed: true, count: todayCount };
  }

  return {
    allowed: false,
    count: todayCount
  };
}

export async function logFitnessAIUsage(userId: string, sessionType: string, prompt: string = "", response: string = "", model: string = "system", tokens: number = 0) {
  try {
    const adminClient = createAdminClient();

    const { error } = await adminClient.from("fitness_os_ai_sessions").insert({
      user_id: userId,
      session_type: sessionType,
      prompt,
      response,
      model,
      tokens_used: tokens,
    } as any);

    if (error) {
      console.error("Supabase Fitness AI session insert error:", error);
    }
  } catch (error) {
    console.error("Failed to log Fitness AI usage:", error);
  }
}
