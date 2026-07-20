import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/services/supabase/admin";

const PRO_DAILY_LIMIT = 10;
export const AI_LIMIT_ERROR_MESSAGE = "AI limit reached. Please top up to continue!";

export async function checkAILimit(supabase: SupabaseClient, userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // 1. Check user tier
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium, premium_level")
    .eq("id", userId)
    .single();

  let dailyFreeLimit = 0;
  if (profile?.is_premium && profile?.premium_level === "pro") {
    dailyFreeLimit = PRO_DAILY_LIMIT;
  }

  // 2. Count today's FREE messages if they have a limit
  const adminClient = createAdminClient();
  let todayFreeCount = 0;
  
  if (dailyFreeLimit > 0) {
    const { count, error } = await adminClient
      .from("ai_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString())
      .not("session_type", "like", "%_purchased");

    if (error) {
      console.error("Error checking AI limit:", error);
      return { allowed: false, count: 0, error };
    }
    todayFreeCount = count || 0;
  }

  if (todayFreeCount < dailyFreeLimit) {
    return { allowed: true, count: todayFreeCount };
  }

  // 3. User exhausted free limit (or has none). Check purchased messages.
  const { count: purchasedUsedCount } = await adminClient
    .from("ai_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .like("session_type", "%_purchased");

  const { data: purchases } = await adminClient
    .from("subscriptions")
    .select("id")
    .eq("user_id", userId)
    .eq("plan", "ai_messages_10")
    .eq("status", "active");

  const totalPurchasedAllowed = (purchases?.length || 0) * 10;
  
  if ((purchasedUsedCount || 0) < totalPurchasedAllowed) {
    return { allowed: true, count: todayFreeCount, isUsingPurchased: true };
  }

  return {
    allowed: false,
    count: todayFreeCount
  };
}

export async function logAIUsage(supabase: SupabaseClient, userId: string, sessionType: string, prompt: string = "", response: string = "") {
  try {
    const adminClient = createAdminClient();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_premium, premium_level")
      .eq("id", userId)
      .single();

    let dailyFreeLimit = 0;
    if (profile?.is_premium && profile?.premium_level === "pro") {
      dailyFreeLimit = PRO_DAILY_LIMIT;
    }

    let todayFreeCount = 0;
    if (dailyFreeLimit > 0) {
      const { count } = await adminClient
        .from("ai_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", startOfDay.toISOString())
        .not("session_type", "like", "%_purchased");
      todayFreeCount = count || 0;
    }

    let finalSessionType = sessionType;
    if (todayFreeCount >= dailyFreeLimit) {
      finalSessionType = sessionType + "_purchased";
    }

    const { error } = await adminClient.from("ai_sessions").insert({
      user_id: userId,
      session_type: finalSessionType,
      prompt,
      response,
      model: "system",
      tokens_used: 0,
    } as any);

    if (error) {
      console.error("Supabase AI session insert error:", error);
    }
  } catch (error) {
    console.error("Failed to log AI usage:", error);
  }
}
