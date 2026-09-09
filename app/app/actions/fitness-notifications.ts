"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { getFitnessSubscriptionState } from "@/lib/fitness/subscription/access";
import { revalidatePath } from "next/cache";

export interface FitnessNotificationItem {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: "workout" | "nutrition" | "subscription" | "milestone" | "support" | "system";
  link: string;
  read: boolean;
  created_at: string;
}

interface NotificationStateStore {
  read_ids?: string[];
  dismissed_ids?: string[];
  read_all_timestamp?: string;
}

// Computes current date string in Indian Standard Time (Asia/Kolkata) e.g. "2026-09-09"
function getIstDateString(): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return `${map.year}-${map.month}-${map.day}`;
}

function formatDateReadable(dateStr: string | null | undefined): string {
  if (!dateStr) return "soon";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

/**
 * Synchronizes and retrieves all contextual real-world notifications for the active athlete.
 * Features a bulletproof two-tier architecture:
 * 1. Checks and uses in_app_notifications table if present in PostgreSQL.
 * 2. Gracefully falls back to profile-level state if the table has not yet been migrated.
 */
export async function getOrSyncFitnessNotifications(): Promise<{
  success: boolean;
  notifications: FitnessNotificationItem[];
  unreadCount: number;
  error?: string;
}> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, notifications: [], unreadCount: 0, error: "Not authenticated" };
    }

    const adminClient = createAdminClient();
    const todayDateStr = getIstDateString();

    const fetchDbTable = async () => {
      try {
        const res = await adminClient
          .from("in_app_notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);
        return { available: !res.error, data: res.data || [], error: res.error };
      } catch {
        return { available: false, data: [] as any[], error: true };
      }
    };

    // Query athlete context in parallel
    const [
      { data: profile },
      subscriptionState,
      { data: todayWorkouts },
      { data: upcomingWorkouts },
      { data: nutritionPlan },
      { data: supportMessages },
      dbTableCheck,
    ] = await Promise.all([
      adminClient
        .from("fitness_os_profiles")
        .select("name, baseline_calories, initial_protein_target, goal, workout_time, created_at, onboarding_data")
        .eq("user_id", user.id)
        .maybeSingle(),
      getFitnessSubscriptionState(user.id).catch(() => null),
      adminClient
        .from("fitness_os_workouts")
        .select("id, name, status, workout_date")
        .eq("user_id", user.id)
        .eq("workout_date", todayDateStr),
      adminClient
        .from("fitness_os_workouts")
        .select("id, name, status, workout_date")
        .eq("user_id", user.id)
        .gt("workout_date", todayDateStr)
        .order("workout_date", { ascending: true })
        .limit(1),
      adminClient
        .from("fitness_os_nutrition_plans")
        .select("daily_calories, protein_grams, guidance")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle(),
      adminClient
        .from("support_messages")
        .select("id, subject, status, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      fetchDbTable(),
    ]);

    const onboarding = (profile?.onboarding_data as Record<string, any>) || {};
    const notifState: NotificationStateStore = onboarding.in_app_notifications_state || {};
    const readIds = new Set(notifState.read_ids || []);
    const dismissedIds = new Set(notifState.dismissed_ids || []);
    const readAllTs = notifState.read_all_timestamp ? new Date(notifState.read_all_timestamp).getTime() : 0;

    // Build Candidate Notifications
    const candidates: FitnessNotificationItem[] = [];
    const nowIso = new Date().toISOString();

    // 1. WORKOUT CONTEXTUAL ALERT
    const todayWorkout = todayWorkouts?.[0];
    if (todayWorkout) {
      if (todayWorkout.status === "completed") {
        candidates.push({
          id: `workout-completed-${user.id}-${todayDateStr}`,
          user_id: user.id,
          title: "Session Crushed! 🔥",
          body: `You completed your ${todayWorkout.name} workout today. Rest, recover, and hit your protein target!`,
          type: "workout",
          link: "/workout",
          read: false,
          created_at: nowIso,
        });
      } else {
        candidates.push({
          id: `workout-scheduled-${user.id}-${todayDateStr}`,
          user_id: user.id,
          title: `Today's Grind: ${todayWorkout.name}`,
          body: "Your daily session is queued and ready. Tap to track your working sets and progressive overload.",
          type: "workout",
          link: "/workout",
          read: false,
          created_at: nowIso,
        });
      }
    } else {
      const nextWorkout = upcomingWorkouts?.[0];
      if (nextWorkout) {
        candidates.push({
          id: `workout-rest-${user.id}-${todayDateStr}`,
          user_id: user.id,
          title: "Active Recovery & Mobility Day 🧘‍♂️",
          body: `No heavy lifting scheduled today. Focus on mobility and hydration before your next session (${nextWorkout.name} on ${nextWorkout.workout_date}).`,
          type: "workout",
          link: "/workout",
          read: false,
          created_at: nowIso,
        });
      } else {
        candidates.push({
          id: `workout-plan-${user.id}-${todayDateStr}`,
          user_id: user.id,
          title: "Workout Protocol Active 🏋️‍♂️",
          body: "Your custom AI training split is loaded. Tap to view your training routine and exercise calendar.",
          type: "workout",
          link: "/workout",
          read: false,
          created_at: nowIso,
        });
      }
    }

    // 2. NUTRITION & FUEL TARGET ALERT
    const targetCalories = nutritionPlan?.daily_calories || profile?.baseline_calories || 2150;
    const targetProtein = nutritionPlan?.protein_grams || profile?.initial_protein_target || 140;
    candidates.push({
      id: `nutrition-target-${user.id}-${todayDateStr}`,
      user_id: user.id,
      title: "Daily Fuel Targets 🎯",
      body: `Daily Target: ${targetCalories.toLocaleString()} kcal & ${targetProtein}g protein. Log your meals to fuel muscle recovery and energy.`,
      type: "nutrition",
      link: "/nutrition",
      read: false,
      created_at: nowIso,
    });

    // 3. SUBSCRIPTION & BILLING ALERT
    if (subscriptionState) {
      if (subscriptionState.isGracePeriod) {
        candidates.push({
          id: `sub-grace-${user.id}-${todayDateStr}`,
          user_id: user.id,
          title: "🚨 48-Hour Gym Pass Grace Period Active",
          body: `Your monthly cycle has ended. You have ${subscriptionState.graceHoursRemaining}h remaining in your grace period. Renew now to avoid losing workout logging access.`,
          type: "subscription",
          link: "/profile/billing",
          read: false,
          created_at: nowIso,
        });
      } else if (subscriptionState.daysRemaining > 0 && subscriptionState.daysRemaining <= 5) {
        const days = subscriptionState.daysRemaining;
        candidates.push({
          id: `sub-expiring-${user.id}-${todayDateStr}`,
          user_id: user.id,
          title: `⚠️ Membership Expiring in ${days} Day${days === 1 ? "" : "s"}`,
          body: `Your plan expires on ${formatDateReadable(subscriptionState.expiresAt)}. Renew early to protect your continuous streak and lock in your rate.`,
          type: "subscription",
          link: "/profile/billing",
          read: false,
          created_at: nowIso,
        });
      } else if (subscriptionState.status === "active") {
        candidates.push({
          id: `sub-active-${user.id}-${todayDateStr.slice(0, 7)}`,
          user_id: user.id,
          title: `⚡ GrindLog ${subscriptionState.plan?.name || "Pro"} Active`,
          body: `Your monthly membership is active until ${formatDateReadable(subscriptionState.expiresAt)}. All AI workouts, nutrition plans, and coach check-ins unlocked.`,
          type: "subscription",
          link: "/profile/billing",
          read: false,
          created_at: nowIso,
        });
      } else {
        candidates.push({
          id: `sub-upgrade-${user.id}-${todayDateStr.slice(0, 7)}`,
          user_id: user.id,
          title: "Unlock Full AI Transformation 🚀",
          body: "Upgrade to GrindLog Pro for ₹99/month to unlock personalized AI splits, Indian meal plans, and 1-on-1 coach feedback.",
          type: "subscription",
          link: "/profile/billing",
          read: false,
          created_at: nowIso,
        });
      }
    }

    // 4. MESOCYCLE PROGRESSION & MONTH 2 CHECK-IN
    if (profile?.created_at) {
      const planAgeDays = Math.floor((Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
      if (planAgeDays >= 25 || onboarding.needs_monthly_checkin) {
        candidates.push({
          id: `milestone-month2-${user.id}-${todayDateStr.slice(0, 7)}`,
          user_id: user.id,
          title: "🏆 Month 1 Recalibration Ready",
          body: "You've conquered your initial mesocycle! Complete your Month 2 check-in to adjust your working weights and volume.",
          type: "milestone",
          link: "/",
          read: false,
          created_at: nowIso,
        });
      }
    }

    // 5. SUPPORT DESK UPDATES
    if (supportMessages && supportMessages.length > 0) {
      for (const msg of supportMessages) {
        if (msg.status === "resolved") {
          candidates.push({
            id: `support-resolved-${msg.id}`,
            user_id: user.id,
            title: "💬 Support Request Resolved",
            body: `Your ticket "${msg.subject}" has been marked resolved. Tap to view your conversation history with our support team.`,
            type: "support",
            link: "/support",
            read: false,
            created_at: msg.created_at || nowIso,
          });
        } else {
          candidates.push({
            id: `support-active-${msg.id}`,
            user_id: user.id,
            title: "🎧 Support Ticket Received",
            body: `Our support team has received your ticket "${msg.subject}" and will respond shortly.`,
            type: "support",
            link: "/support",
            read: false,
            created_at: msg.created_at || nowIso,
          });
        }
      }
    }

    // 6. WELCOME & PROTOCOL INITIALIZATION
    candidates.push({
      id: `welcome-${user.id}`,
      user_id: user.id,
      title: "Welcome to GrindLog OS ⚡",
      body: "Your athlete dashboard and personalized fitness protocol are initialized. Tap to view your roadmap.",
      type: "system",
      link: "/",
      read: false,
      created_at: profile?.created_at || nowIso,
    });

    // If in_app_notifications table exists in PostgreSQL, sync into it
    if (dbTableCheck.available) {
      const existingRows: any[] = dbTableCheck.data || [];
      const existingTitles = new Set(existingRows.map((r) => `${r.type}:${r.title}`));

      const rowsToInsert = candidates
        .filter((c) => !existingTitles.has(`${c.type}:${c.title}`))
        .map((c) => ({
          user_id: c.user_id,
          title: c.title,
          body: c.body,
          type: c.type,
          link: c.link,
          read: false,
          created_at: c.created_at,
        }));

      if (rowsToInsert.length > 0) {
        try {
          await adminClient.from("in_app_notifications").insert(rowsToInsert);
        } catch {
          // Graceful fallback if insert errors
        }
      }

      // Re-fetch latest from database table
      try {
        const { data: latestRows } = await adminClient
          .from("in_app_notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (latestRows && latestRows.length > 0) {
          const mapped: FitnessNotificationItem[] = latestRows.map((r: any) => ({
            id: r.id,
            user_id: r.user_id,
            title: r.title,
            body: r.body || "",
            type: (r.type as any) || "system",
            link: r.link || deriveLinkFromType(r.type),
            read: Boolean(r.read),
            created_at: r.created_at,
          }));

          const unreadCount = mapped.filter((n) => !n.read).length;
          return { success: true, notifications: mapped, unreadCount };
        }
      } catch {
        // Fall back to Tier 2
      }
    }

    // TIER 2 FALLBACK: Apply in_app_notifications_state (read_ids, dismissed_ids, readAllTs)
    const activeNotifications = candidates
      .filter((c) => !dismissedIds.has(c.id))
      .map((c) => {
        const isMarkedRead =
          readIds.has(c.id) ||
          (readAllTs > 0 && new Date(c.created_at).getTime() <= readAllTs);
        return {
          ...c,
          read: isMarkedRead,
        };
      });

    const unreadCount = activeNotifications.filter((n) => !n.read).length;
    return { success: true, notifications: activeNotifications, unreadCount };
  } catch (err: any) {
    console.error("getOrSyncFitnessNotifications error:", err);
    return { success: false, notifications: [], unreadCount: 0, error: err.message };
  }
}

function deriveLinkFromType(type: string | null | undefined): string {
  if (!type) return "/";
  if (type.includes("workout")) return "/workout";
  if (type.includes("nutrition") || type.includes("water")) return "/nutrition";
  if (type.includes("subscription") || type.includes("billing") || type.includes("plan")) return "/profile/billing";
  if (type.includes("support")) return "/support";
  if (type.includes("milestone") || type.includes("phase") || type.includes("recalibration")) return "/";
  return "/";
}

/**
 * Mark a single notification as read
 */
export async function markNotificationAsReadAction(notificationId: string): Promise<{ success: boolean }> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const adminClient = createAdminClient();

    // Try updating in in_app_notifications table if it's a UUID
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(notificationId);
    if (isUuid) {
      try {
        await adminClient
          .from("in_app_notifications")
          .update({ read: true })
          .eq("id", notificationId)
          .eq("user_id", user.id);
      } catch {
        // Fallback to profile
      }
    }

    // Persist to profile fallback state
    const { data: profile } = await adminClient
      .from("fitness_os_profiles")
      .select("onboarding_data")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      const onboarding = (profile.onboarding_data as Record<string, any>) || {};
      const notifState: NotificationStateStore = onboarding.in_app_notifications_state || {};
      const currentRead = new Set(notifState.read_ids || []);
      currentRead.add(notificationId);

      await adminClient
        .from("fitness_os_profiles")
        .update({
          onboarding_data: {
            ...onboarding,
            in_app_notifications_state: {
              ...notifState,
              read_ids: Array.from(currentRead),
            },
          },
        })
        .eq("user_id", user.id);
    }

    revalidatePath("/notifications");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("markNotificationAsReadAction error:", err);
    return { success: false };
  }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsReadAction(): Promise<{ success: boolean }> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const adminClient = createAdminClient();

    // 1. Update in table
    try {
      await adminClient
        .from("in_app_notifications")
        .update({ read: true })
        .eq("user_id", user.id);
    } catch {
      // Fallback
    }

    // 2. Update profile fallback
    const { data: profile } = await adminClient
      .from("fitness_os_profiles")
      .select("onboarding_data")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      const onboarding = (profile.onboarding_data as Record<string, any>) || {};
      const notifState: NotificationStateStore = onboarding.in_app_notifications_state || {};

      await adminClient
        .from("fitness_os_profiles")
        .update({
          onboarding_data: {
            ...onboarding,
            in_app_notifications_state: {
              ...notifState,
              read_all_timestamp: new Date().toISOString(),
            },
          },
        })
        .eq("user_id", user.id);
    }

    revalidatePath("/notifications");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("markAllNotificationsAsReadAction error:", err);
    return { success: false };
  }
}

/**
 * Clear/Dismiss all notifications
 */
export async function clearAllNotificationsAction(currentIds?: string[]): Promise<{ success: boolean }> {
  try {
    const supabase = await createServerSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return { success: false };

    const adminClient = createAdminClient();

    // 1. Delete from table
    try {
      await adminClient
        .from("in_app_notifications")
        .delete()
        .eq("user_id", user.id);
    } catch {
      // Fallback
    }

    // 2. Record dismissed IDs in profile state
    const { data: profile } = await adminClient
      .from("fitness_os_profiles")
      .select("onboarding_data")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profile) {
      const onboarding = (profile.onboarding_data as Record<string, any>) || {};
      const notifState: NotificationStateStore = onboarding.in_app_notifications_state || {};
      const currentDismissed = new Set(notifState.dismissed_ids || []);

      if (currentIds && currentIds.length > 0) {
        currentIds.forEach((id) => currentDismissed.add(id));
      }

      await adminClient
        .from("fitness_os_profiles")
        .update({
          onboarding_data: {
            ...onboarding,
            in_app_notifications_state: {
              ...notifState,
              dismissed_ids: Array.from(currentDismissed),
              read_all_timestamp: new Date().toISOString(),
            },
          },
        })
        .eq("user_id", user.id);
    }

    revalidatePath("/notifications");
    revalidatePath("/");
    return { success: true };
  } catch (err) {
    console.error("clearAllNotificationsAction error:", err);
    return { success: false };
  }
}

/**
 * Lightweight unread notifications count query for dashboard bell icon
 */
export async function getUnreadNotificationsCountAction(): Promise<number> {
  try {
    const { unreadCount } = await getOrSyncFitnessNotifications();
    return unreadCount;
  } catch {
    return 0;
  }
}
