import { createClient } from "@supabase/supabase-js";
import { adminMessaging } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

const APP_ICON = "https://www.grindlog.in/icons/icon-192.png";
const NOTIFICATION_BADGE = "https://www.grindlog.in/icons/notification-badge.png";
const NOTIFICATION_URL = "/fitness";

type ReminderNotification = {
  userId: string;
  tokens?: string[];
  title: string;
  body: string;
  tag: string;
  url?: string;
};

function getIstDate() {
  return new Date(Date.now() + 5.5 * 60 * 60 * 1000);
}

function getIstDayBoundsUtc(istTime: Date) {
  const startOfIstDayUtc =
    Date.UTC(istTime.getUTCFullYear(), istTime.getUTCMonth(), istTime.getUTCDate()) -
    5.5 * 60 * 60 * 1000;

  return {
    start: new Date(startOfIstDayUtc),
    end: new Date(startOfIstDayUtc + 24 * 60 * 60 * 1000),
  };
}

function notificationKey(
  notification: Pick<ReminderNotification, "userId" | "title" | "body">,
  type: string | null
) {
  return JSON.stringify([
    notification.userId,
    type,
    notification.title,
    notification.body,
  ]);
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
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "fitness_dynamic";

    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      // Skipping strict auth for local testing, but recommend uncommenting in production.
    }

    const supabase = getServiceSupabase();

    const { data: tokensData, error: tokensError } = await supabase
      .from("fcm_tokens")
      .select("user_id, token");

    if (tokensError || !tokensData) {
      throw new Error("Failed to fetch FCM tokens");
    }

    if (tokensData.length === 0) {
      return NextResponse.json({ message: "No devices registered for notifications." });
    }

    const usersTokens = new Map<string, string[]>();
    for (const row of tokensData) {
      if (!usersTokens.has(row.user_id)) usersTokens.set(row.user_id, []);
      usersTokens.get(row.user_id)!.push(row.token);
    }

    const istTime = getIstDate();
    const istDateKey = istTime.toISOString().split("T")[0];
    const notificationsToSend: ReminderNotification[] = [];

    const currentHour = istTime.getUTCHours();
    const currentMinute = istTime.getUTCMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // Fitness Workout & Custom Reminders
    const { data: profiles, error: profilesError } = await supabase
      .from("fitness_os_profiles")
      .select("user_id, workout_time, reminders_enabled, custom_reminders")
      .or("workout_time.not.is.null,custom_reminders.not.eq.[]");

    const getEmojiForType = (type: string) => {
      const map: Record<string, string> = {
        "Breakfast": "🥣",
        "Mid-Morning": "🍞",
        "Lunch": "🍱",
        "Afternoon": "🍏",
        "Dinner": "🍛",
        "Bed Time": "🛌"
      };
      return map[type] || "⏰";
    };

    if (!profilesError && profiles) {
      for (const profile of profiles) {
        if (profile.workout_time) {
          const [hStr, mStr] = profile.workout_time.split(":");
          const workoutMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
          const timeDiff = currentTotalMinutes - workoutMinutes;

          // Check if workout time is within the last 15 minutes
          if (timeDiff >= 0 && timeDiff < 15) {
            const { data: workout } = await supabase
              .from("fitness_os_workouts")
              .select("id, status")
              .eq("user_id", profile.user_id)
              .eq("workout_date", istDateKey)
              .maybeSingle();

            if (workout && workout.status !== "completed") {
              const userTokens = usersTokens.get(profile.user_id);
              if (userTokens) {
                notificationsToSend.push({
                  userId: profile.user_id,
                  tokens: userTokens,
                  title: `Time to sweat! 🏋️‍♂️`,
                  body: `Your daily workout is scheduled for ${profile.workout_time}. Let's get to work!`,
                  tag: `workout:${profile.user_id}:${istDateKey}`,
                  url: "/fitness/workout",
                });
              }
            }
          }
        }

        // Process Custom Reminders
        if (profile.reminders_enabled && Array.isArray(profile.custom_reminders)) {
          for (const reminder of profile.custom_reminders) {
            if (!reminder.time) continue;

            const [hStr, mStr] = reminder.time.split(":");
            const remMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);
            const timeDiff = currentTotalMinutes - remMinutes;

            // Check if reminder time is within the last 15 minutes
            if (timeDiff >= 0 && timeDiff < 15) {
              const userTokens = usersTokens.get(profile.user_id);
              if (userTokens) {
                notificationsToSend.push({
                  userId: profile.user_id,
                  tokens: userTokens,
                  title: `Time for ${reminder.type}! ${getEmojiForType(reminder.type)}`,
                  body: `Your ${reminder.type} is scheduled for ${reminder.time}. Stay on track!`,
                  tag: `custom_reminder:${profile.user_id}:${reminder.type}:${istDateKey}`,
                  url: "/fitness",
                });
              }
            }
          }
        }
      }
    }

    let pendingNotifications = uniqueByTag(notificationsToSend);
    let skippedDuplicateCount = 0;

    if (pendingNotifications.length > 0) {
      const { start, end } = getIstDayBoundsUtc(istTime);
      const pendingUserIds = Array.from(new Set(pendingNotifications.map((notif) => notif.userId)));
      const { data: existingNotifications, error: existingError } = await supabase
        .from("in_app_notifications")
        .select("user_id, title, body, type")
        .in("user_id", pendingUserIds)
        .eq("type", type)
        .gte("created_at", start.toISOString())
        .lt("created_at", end.toISOString());

      if (existingError) {
        console.error("Error checking existing notifications:", existingError);
      } else if (existingNotifications) {
        const existingKeys = new Set(
          existingNotifications.map((notif) =>
            notificationKey(
              {
                userId: notif.user_id,
                title: notif.title,
                body: notif.body || "",
              },
              notif.type
            )
          )
        );

        const beforeFilterCount = pendingNotifications.length;
        pendingNotifications = pendingNotifications.filter(
          (notif) => !existingKeys.has(notificationKey(notif, type))
        );
        skippedDuplicateCount = beforeFilterCount - pendingNotifications.length;
      }
    }

    if (pendingNotifications.length > 0) {
      const dbInserts = pendingNotifications.map((notif) => ({
        user_id: notif.userId,
        title: notif.title,
        body: notif.body,
        type,
        read: false,
      }));

      const { error: insertError } = await supabase.from("in_app_notifications").insert(dbInserts);
      if (insertError) {
        console.error("Error saving in-app notifications:", insertError);
      }
    }

    let successCount = 0;
    let failureCount = 0;

    for (const notif of pendingNotifications) {
      if (!notif.tokens || notif.tokens.length === 0) continue;

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
          tag: String(notif.tag || 'grindlog-reminder'),
          url: String(notif.url || NOTIFICATION_URL),
          icon: APP_ICON,
          badge: NOTIFICATION_BADGE,
        },
        tokens: Array.from(new Set(notif.tokens)),
      };

      try {
        const response = await adminMessaging.sendEachForMulticast(message);
        successCount += response.successCount;
        failureCount += response.failureCount;
      } catch (err) {
        console.error("Error sending multicast message:", err);
      }
    }

    return NextResponse.json({
      success: true,
      type,
      sent: successCount,
      failed: failureCount,
      skippedDuplicates: skippedDuplicateCount,
    });
  } catch (err: any) {
    console.error("Cron Reminder Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
