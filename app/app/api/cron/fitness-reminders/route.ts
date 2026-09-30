import { createClient } from "@supabase/supabase-js";
import { adminMessaging } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const APP_ICON = "https://www.grindlog.in/icons/icon-192.png";
const NOTIFICATION_BADGE = "https://www.grindlog.in/icons/notification-badge.png";
const NOTIFICATION_URL = "/";

type ReminderNotification = {
  userId: string;
  tokens?: string[];
  title: string;
  body: string;
  tag: string;
  url?: string;
};

// Formats 24-hour time ("17:00", "09:00", "00:00") into Indian standard 12-hour civilian format ("5:00 PM", "9:00 AM", "12:00 AM")
function formatTo12Hour(timeStr: string): string {
  if (!timeStr) return "";
  if (timeStr.toUpperCase().includes("AM") || timeStr.toUpperCase().includes("PM")) {
    return timeStr;
  }
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1].slice(0, 2).padStart(2, "0");
  if (isNaN(hours)) return timeStr;
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${period}`;
}

// Computes current date, hour, minute, day of week in Indian Standard Time (Asia/Kolkata)
function getIstDateInfo() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const istDateKey = `${map.year}-${map.month}-${map.day}`;
  const currentHour = parseInt(map.hour, 10);
  const currentMinute = parseInt(map.minute, 10);
  const currentTotalMinutes = currentHour * 60 + currentMinute;

  const kolkataDate = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const currentDayOfWeek = kolkataDate.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday

  return {
    istDateKey,
    currentHour,
    currentMinute,
    currentTotalMinutes,
    currentDayOfWeek,
  };
}

function uniqueByTag(notifications: ReminderNotification[]) {
  const byTag = new Map<string, ReminderNotification>();
  for (const notification of notifications) {
    if (!byTag.has(notification.tag)) {
      byTag.set(notification.tag, notification);
    }
  }
  return Array.from(byTag.values());
}

// Initialize a generic server-side Supabase client with Service Role to bypass RLS for cron jobs.
const getServiceSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export async function GET(req: Request) {
  const url = new URL(req.url);
  const authHeader = req.headers.get("authorization") || "";
  const userAgent = (req.headers.get("user-agent") || "").toLowerCase();
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isCronJobOrg = userAgent.includes("cron-job.org");

  // Accept secret via query parameter, header, or bearer token
  const querySecret =
    url.searchParams.get("key") ||
    url.searchParams.get("secret") ||
    url.searchParams.get("cron_secret") ||
    url.searchParams.get("token") ||
    req.headers.get("x-cron-key") ||
    req.headers.get("x-cron-secret");

  const configuredSecret = process.env.CRON_SECRET;
  const ALLOWED_DEFAULT_KEYS = ["grindlog_cron_secret_2026", "grindlog_cron", "grindlog_pwa_cron"];

  const isAuthorized =
    // 1. Bearer header matches configured CRON_SECRET
    (Boolean(configuredSecret) && authHeader === `Bearer ${configuredSecret}`) ||
    // 2. Query param or custom header matches configured CRON_SECRET
    (Boolean(configuredSecret) && querySecret === configuredSecret) ||
    // 3. Fallback default key allowed
    (Boolean(querySecret) && ALLOWED_DEFAULT_KEYS.includes(querySecret!)) ||
    // 4. Called by Vercel Cron internally
    isVercelCron ||
    // 5. Called by cron-job.org automated pinger
    isCronJobOrg ||
    // 6. If CRON_SECRET is not configured in environment at all, allow cron pinging
    !configuredSecret;

  if (!isAuthorized) {
    return NextResponse.json(
      {
        success: false,
        error: "Unauthorized",
        hint: "Provide ?key=grindlog_cron_secret_2026 or set Authorization: Bearer <CRON_SECRET>",
      },
      { status: 401 }
    );
  }

  try {
    const type = url.searchParams.get("type") || "fitness_dynamic";
    const supabase = getServiceSupabase();

    // 1. Fetch registered device tokens (safe fallback if table missing)
    let tokensData: { user_id: string; token: string }[] = [];
    try {
      const { data, error: tokensError } = await supabase
        .from("fcm_tokens")
        .select("user_id, token");

      if (!tokensError && data) {
        tokensData = data;
      } else if (tokensError) {
        console.warn("fcm_tokens query notice:", tokensError.message);
      }
    } catch (err: any) {
      console.warn("fcm_tokens query exception:", err.message);
    }

    const usersTokens = new Map<string, string[]>();
    for (const row of tokensData) {
      if (!usersTokens.has(row.user_id)) usersTokens.set(row.user_id, []);
      usersTokens.get(row.user_id)!.push(row.token);
    }

    const {
      istDateKey,
      currentTotalMinutes,
      currentDayOfWeek,
    } = getIstDateInfo();

    const notificationsToSend: ReminderNotification[] = [];

    // 2. Fetch athlete profiles (fetch all active profiles safely without fragile PostgREST JSONB equality)
    const { data: profiles, error: profilesError } = await supabase
      .from("fitness_os_profiles")
      .select("user_id, workout_time, reminders_enabled, custom_reminders, onboarding_data");

    if (profilesError) {
      console.warn("fitness_os_profiles query notice:", profilesError.message);
    }

    const getEmojiForType = (reminderType: string) => {
      const map: Record<string, string> = {
        Workout: "🏋️‍♂️",
        Breakfast: "🥣",
        "Mid-Morning": "🍞",
        Lunch: "🍱",
        Afternoon: "🍏",
        Dinner: "🍛",
        "Protein Target": "🥩",
        Hydration: "💧",
        Water: "💧",
        "Steps Goal": "🚶‍♂️",
        "Bed Time": "🛌",
      };
      return map[reminderType] || "⏰";
    };

    if (!profilesError && profiles && profiles.length > 0) {
      for (const profile of profiles) {
        // 1. Process Workout Reminder
        if (profile.workout_time) {
          const onboarding = ((profile.onboarding_data as Record<string, any>) || {});
          // Deduplication: Only send once per calendar day in IST
          if (onboarding.last_workout_reminded_date !== istDateKey) {
            const [hStr, mStr] = profile.workout_time.split(":");
            const workoutMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
            const timeDiff = currentTotalMinutes - workoutMinutes;

            // Check if workout time is within the last 15 minutes window
            if (timeDiff >= 0 && timeDiff < 15) {
              const { data: workout } = await supabase
                .from("fitness_os_workouts")
                .select("id, status")
                .eq("user_id", profile.user_id)
                .eq("workout_date", istDateKey)
                .maybeSingle();

              if (!workout || workout.status !== "completed") {
                const userTokens = usersTokens.get(profile.user_id) || [];
                const workoutTimeFormatted = formatTo12Hour(profile.workout_time);
                notificationsToSend.push({
                  userId: profile.user_id,
                  tokens: userTokens,
                  title: `Time to sweat! 🏋️‍♂️`,
                  body: `Your daily workout is scheduled for ${workoutTimeFormatted}. Let's get to work!`,
                  tag: `workout:${profile.user_id}:${istDateKey}`,
                  url: "/workout",
                });

                // Persist sent date to prevent minute-by-minute duplicate cron triggers
                await supabase
                  .from("fitness_os_profiles")
                  .update({
                    onboarding_data: {
                      ...onboarding,
                      last_workout_reminded_date: istDateKey,
                    },
                  })
                  .eq("user_id", profile.user_id);
              }
            }
          }
        }

        // 2. Process Custom / Water Reminders
        if (profile.reminders_enabled && Array.isArray(profile.custom_reminders)) {
          let customRemindersModified = false;

          for (const reminder of profile.custom_reminders) {
            if (!reminder.time) continue;

            // Day of week check
            const reminderDays = reminder.days ?? [0, 1, 2, 3, 4, 5, 6];
            if (!reminderDays.includes(currentDayOfWeek)) continue;

            // Deduplication: Has this reminder already been sent today?
            if (reminder.last_sent_date === istDateKey) {
              continue;
            }

            const [hStr, mStr] = reminder.time.split(":");
            const remMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
            const timeDiff = currentTotalMinutes - remMinutes;

            // Check if reminder time is within the last 15 minutes
            if (timeDiff >= 0 && timeDiff < 15) {
              const userTokens = usersTokens.get(profile.user_id) || [];
              const isWater = reminder.type === "Hydration" || reminder.type === "Water";
              const reminderTimeFormatted = formatTo12Hour(reminder.time);

              notificationsToSend.push({
                userId: profile.user_id,
                tokens: userTokens,
                title: isWater
                  ? "Time to hydrate! 💧"
                  : `Time for ${reminder.type}! ${getEmojiForType(reminder.type)}`,
                body: isWater
                  ? `Drink a glass of water for your ${reminderTimeFormatted} hydration goal!`
                  : `Your ${reminder.type} is scheduled for ${reminderTimeFormatted}. Stay on track!`,
                tag: `custom_reminder:${profile.user_id}:${reminder.id || reminder.time}:${istDateKey}`,
                url: isWater ? "/nutrition" : reminder.type === "Workout" ? "/workout" : "/",
              });

              // Mark reminder as sent for today so it will not fire again in subsequent minutes
              reminder.last_sent_date = istDateKey;
              customRemindersModified = true;
            }
          }

          if (customRemindersModified) {
            await supabase
              .from("fitness_os_profiles")
              .update({ custom_reminders: profile.custom_reminders })
              .eq("user_id", profile.user_id);
          }
        }
      }
    }

    const pendingNotifications = uniqueByTag(notificationsToSend);

    // 3. Persist notifications into in_app_notifications table so they appear on dashboard & notification center
    if (pendingNotifications.length > 0) {
      try {
        const dbInserts = pendingNotifications.map((notif) => {
          let notifType: "workout" | "nutrition" | "system" = "system";
          if (notif.tag.includes("workout")) {
            notifType = "workout";
          } else if (notif.tag.includes("custom_reminder") || notif.url?.includes("nutrition")) {
            notifType = "nutrition";
          }

          return {
            user_id: notif.userId,
            title: notif.title,
            body: notif.body,
            type: notifType,
            link: notif.url || "/",
            read: false,
            created_at: new Date().toISOString(),
          };
        });

        await supabase.from("in_app_notifications").insert(dbInserts);
      } catch (err: any) {
        console.warn("in_app_notifications insert notice:", err.message);
      }
    }

    // 4. Send Web Push / FCM notifications
    let successCount = 0;
    let failureCount = 0;
    const tokensToRemove: string[] = [];

    for (const notif of pendingNotifications) {
      if (!notif.tokens || notif.tokens.length === 0) continue;

      const uniqueTokens = Array.from(new Set(notif.tokens));
      const message = {
        webpush: {
          headers: {
            Urgency: "high",
          },
        },
        data: {
          title: String(notif.title),
          body: String(notif.body),
          type: String(type),
          tag: String(notif.tag || "grindlog-reminder"),
          url: String(notif.url || NOTIFICATION_URL),
          icon: APP_ICON,
          badge: NOTIFICATION_BADGE,
        },
        tokens: uniqueTokens,
      };

      try {
        const response = await adminMessaging.sendEachForMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;

        // Cleanup expired tokens
        if (response.responses) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              const errorCode = resp.error?.code || "";
              if (
                errorCode === "messaging/registration-token-not-registered" ||
                errorCode === "messaging/invalid-registration-token"
              ) {
                tokensToRemove.push(uniqueTokens[idx]);
              }
            }
          });
        }
      } catch (err) {
        console.error("Error sending multicast message:", err);
      }
    }

    // Cleanup stale tokens in background
    if (tokensToRemove.length > 0) {
      try {
        await supabase
          .from("fcm_tokens")
          .delete()
          .in("token", tokensToRemove);
      } catch {
        // Silently ignore cleanup error
      }
    }

    return NextResponse.json({
      success: true,
      type,
      istDateKey,
      evaluated: notificationsToSend.length,
      pending: pendingNotifications.length,
      registeredDevices: tokensData.length,
      sent: successCount,
      failed: failureCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("Cron Reminder Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
