import { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/services/supabase/admin";

const DAILY_LIMIT = 10;
export const AI_LIMIT_ERROR_MESSAGE = "Daily AI limit reached (10/10). Please come back tomorrow!";

export async function checkAILimit(supabase: SupabaseClient, userId: string) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // 1. Check if user is premium
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", userId)
    .single();

  if (profile?.is_premium) {
    return { allowed: true, count: 0 };
  }

  // 2. Count today's FREE messages
  const adminClient = createAdminClient();
  const { count: todayFreeCount, error } = await adminClient
    .from("ai_sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfDay.toISOString())
    .not("session_type", "like", "%_purchased");

  if (error) {
    console.error("Error checking AI limit:", error);
    return { allowed: false, count: 0, error };
  }

  if ((todayFreeCount || 0) < DAILY_LIMIT) {
    return { allowed: true, count: todayFreeCount || 0 };
  }

  // 3. User exhausted free limit. Check purchased messages.
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
    return { allowed: true, count: todayFreeCount || 0, isUsingPurchased: true };
  }

  return {
    allowed: false,
    count: todayFreeCount || 0
  };
}

export async function logAIUsage(supabase: SupabaseClient, userId: string, sessionType: string, prompt: string = "", response: string = "") {
  try {
    const adminClient = createAdminClient();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const { count: todayFreeCount } = await adminClient
      .from("ai_sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", startOfDay.toISOString())
      .not("session_type", "like", "%_purchased");

    let finalSessionType = sessionType;
    if ((todayFreeCount || 0) >= DAILY_LIMIT) {
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
