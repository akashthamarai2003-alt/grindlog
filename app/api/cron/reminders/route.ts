import { createClient } from "@supabase/supabase-js";
import { adminMessaging } from "@/lib/firebase/server";
import { NextResponse } from "next/server";

const APP_ICON = "https://grindlog-lake.vercel.app/icons/icon-192.png";
const NOTIFICATION_BADGE = "https://grindlog-lake.vercel.app/icons/notification-badge.png";
const NOTIFICATION_URL = "/dashboard";

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

function hashTag(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return `gl-${Math.abs(hash).toString(36)}`;
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
    const type = searchParams.get("type"); // morning, dynamic

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

    const userIds = Array.from(usersTokens.keys());
    const istTime = getIstDate();
    const istDateKey = istTime.toISOString().split("T")[0];
    const notificationsToSend: ReminderNotification[] = [];

    if (type === "morning") {
      for (const userId of userIds) {
        notificationsToSend.push({
          userId,
          tokens: usersTokens.get(userId),
          title: "Rise and Grind! \u{1F305}",
          body: "Good morning! Check your planner to see your targets for today.",
          tag: `morning:${userId}:${istDateKey}`,
          url: NOTIFICATION_URL,
        });
      }
    } else if (type === "dynamic") {
      const currentHour = istTime.getUTCHours();
      const currentMinute = istTime.getUTCMinutes();
      const currentTotalMinutes = currentHour * 60 + currentMinute;

      const { data: habits, error: habitsError } = await supabase
        .from("habits")
        .select("id, user_id, name, reminder_time")
        .eq("is_active", true)
        .eq("is_archived", false)
        .not("reminder_time", "is", null);

      if (!habitsError && habits) {
        for (const habit of habits) {
          if (!habit.reminder_time) continue;

          const [hStr, mStr] = habit.reminder_time.split(":");
          const habitMinutes = parseInt(hStr, 10) * 60 + parseInt(mStr, 10);

          if (habitMinutes === currentTotalMinutes) {
            const userTokens = usersTokens.get(habit.user_id);
            if (userTokens) {
              notificationsToSend.push({
                userId: habit.user_id,
                tokens: userTokens,
                title: `Time for ${habit.name}! \u23F0`,
                body: `Your habit is scheduled for ${habit.reminder_time}. Let's get it done!`,
                tag: `habit:${habit.id}:${istDateKey}:${habit.reminder_time}`,
                url: NOTIFICATION_URL,
              });
            }
          }
        }
      }

      if (currentHour === 9 && currentMinute === 0) {
        for (const userId of userIds) {
          const userTokens = usersTokens.get(userId);
          if (!userTokens) continue;

          const yesterday = new Date(istTime);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split("T")[0];

          const { data: logs } = await supabase
            .from("habit_logs")
            .select("status, streak_after")
            .eq("user_id", userId)
            .eq("date", yesterdayStr)
            .eq("status", "missed");

          if (logs && logs.length > 0) {
            notificationsToSend.push({
              userId,
              tokens: userTokens,
              title: "Don't Give Up! \u2764\uFE0F\u200D\u{1FA79}",
              body: "You missed a habit yesterday, but today is a fresh start. Rebuild that streak!",
              tag: `streak:${userId}:${istDateKey}`,
              url: NOTIFICATION_URL,
            });
            continue;
          }

          const twoDaysAgo = new Date(istTime);
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          const twoDaysAgoStr = twoDaysAgo.toISOString();

          const { data: recentLogs } = await supabase
            .from("habit_logs")
            .select("id")
            .eq("user_id", userId)
            .gte("created_at", twoDaysAgoStr)
            .limit(1);

          if (!recentLogs || recentLogs.length === 0) {
            notificationsToSend.push({
              userId,
              tokens: userTokens,
              title: "We miss you! \u{1F331}",
              body: "You haven't logged any habits in 2 days. Come back and water your tree!",
              tag: `inactive:${userId}:${istDateKey}`,
              url: NOTIFICATION_URL,
            });
          }
        }
      }
    } else if (type === "test") {
      // Bypass time checks and send a direct test notification to everyone
      for (const userId of userIds) {
        notificationsToSend.push({
          userId,
          tokens: usersTokens.get(userId),
          title: "Test Notification! \uD83D\uDE80",
          body: "This is a test to verify the background service worker.",
          tag: `test:${userId}:${Date.now()}`, // Unique tag every time to bypass deduplication
          url: NOTIFICATION_URL,
        });
      }
    } else {
      return NextResponse.json({ error: "Invalid reminder type" }, { status: 400 });
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
        data: {
          title: String(notif.title),
          body: String(notif.body),
          type: String(type || 'general'),
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
