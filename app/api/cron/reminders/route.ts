import { createClient } from "@supabase/supabase-js";
import { adminMessaging } from "@/lib/firebase/server";
import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { isHabitScheduled } from "@/lib/habit-utils";

// Initialize a generic server-side Supabase client with Service Role to bypass RLS for cron jobs
// Ensure you have NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your env
const getServiceSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for cron jobs
  );
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // morning, afternoon, night, ai, tree, streak

    // Optional: Add an authorization header check here to ensure only your cron job can hit this
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      // return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      // Skipping strict auth for local testing, but recommend uncommenting in production
    }

    const supabase = getServiceSupabase();

    // 1. Fetch all tokens
    const { data: tokensData, error: tokensError } = await supabase
      .from("fcm_tokens")
      .select("user_id, token");

    if (tokensError || !tokensData) {
      throw new Error("Failed to fetch FCM tokens");
    }

    if (tokensData.length === 0) {
      return NextResponse.json({ message: "No devices registered for notifications." });
    }

    // Map users to their tokens
    const usersTokens = new Map<string, string[]>();
    for (const row of tokensData) {
      if (!usersTokens.has(row.user_id)) usersTokens.set(row.user_id, []);
      usersTokens.get(row.user_id)!.push(row.token);
    }

    // 2. Fetch all users who have tokens
    const userIds = Array.from(usersTokens.keys());

    // 3. Process Reminders based on type
    const notificationsToSend: any[] = [];

    if (type === "morning") {
      for (const userId of userIds) {
        notificationsToSend.push({ userId, tokens: usersTokens.get(userId), title: "Rise and Grind! 🌅", body: "Good morning! Check your planner to see your targets for today." });
      }
    } else if (type === "dynamic") {
      // DYNAMIC SMART REMINDERS (Runs every 15 minutes)
      // 1. Convert current UTC time to IST (UTC + 5:30)
      const now = new Date();
      
      const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
      const currentHour = istTime.getUTCHours();
      const currentMinute = istTime.getUTCMinutes();
      
      // Calculate a 15-minute window for habits (e.g. 07:15 to 07:29)
      const startMinutes = currentHour * 60 + currentMinute;
      const endMinutes = startMinutes + 14; 
      
      // Fetch all active habits
      const { data: habits, error: habitsError } = await supabase
        .from('habits')
        .select('id, user_id, name, reminder_time')
        .eq('is_active', true)
        .eq('is_archived', false)
        .not('reminder_time', 'is', null);
        
      if (!habitsError && habits) {
        for (const habit of habits) {
          if (!habit.reminder_time) continue;
          
          const [hStr, mStr] = habit.reminder_time.split(':');
          const habitMinutes = parseInt(hStr) * 60 + parseInt(mStr);
          
          // If habit falls in the current 15-min window
          if (habitMinutes >= startMinutes && habitMinutes <= endMinutes) {
             const userTokens = usersTokens.get(habit.user_id);
             if (userTokens) {
               notificationsToSend.push({
                 userId: habit.user_id,
                 tokens: userTokens,
                 title: `Time for ${habit.name}! ⏰`,
                 body: `Your habit is scheduled for ${habit.reminder_time}. Let's get it done!`
               });
             }
          }
        }
      }
      
      // 2. DAILY 9:00 AM CHECKS (Inactivity & Streaks)
      if (currentHour === 9 && currentMinute < 15) {
        
        // Fetch users to check activity
        for (const userId of userIds) {
          const userTokens = usersTokens.get(userId);
          if (!userTokens) continue;
          
          // Check if they broke a streak yesterday
          // Fetch yesterday's logs
          const yesterday = new Date(istTime);
          yesterday.setDate(yesterday.getDate() - 1);
          const yesterdayStr = yesterday.toISOString().split('T')[0];
          
          const { data: logs } = await supabase
            .from('habit_logs')
            .select('status, streak_after')
            .eq('user_id', userId)
            .eq('date', yesterdayStr)
            .eq('status', 'missed');
            
          if (logs && logs.length > 0) {
             notificationsToSend.push({
               userId: userId,
               tokens: userTokens,
               title: "Don't Give Up! ❤️‍🩹",
               body: "You missed a habit yesterday, but today is a fresh start. Rebuild that streak!"
             });
             continue; // Skip inactivity check if we already sent a streak reminder
          }
          
          // Check for 48-hour inactivity
          const twoDaysAgo = new Date(istTime);
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          const twoDaysAgoStr = twoDaysAgo.toISOString();
          
          const { data: recentLogs } = await supabase
            .from('habit_logs')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', twoDaysAgoStr)
            .limit(1);
            
          if (!recentLogs || recentLogs.length === 0) {
            notificationsToSend.push({
               userId: userId,
               tokens: userTokens,
               title: "We miss you! 🌱",
               body: "You haven't logged any habits in 2 days. Come back and water your tree!"
             });
          }
        }
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid reminder type" }, { status: 400 });
    }
    // 4. Save to In-App Notifications Database
    if (notificationsToSend.length > 0) {
      const dbInserts = notificationsToSend.map(notif => ({
        user_id: notif.userId,
        title: notif.title,
        body: notif.body,
        type: type,
        read: false
      }));

      const { error: insertError } = await supabase.from('in_app_notifications').insert(dbInserts);
      if (insertError) {
        console.error("Error saving in-app notifications:", insertError);
      }
    }

    // 5. Send Notifications via Firebase Admin
    let successCount = 0;
    let failureCount = 0;

    for (const notif of notificationsToSend) {
      if (!notif.tokens || notif.tokens.length === 0) continue;
      
      const message = {
        data: {
          title: notif.title,
          body: notif.body,
          type: type
        },
        tokens: Array.from(new Set(notif.tokens)), // Deduplicate tokens just in case
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
      failed: failureCount 
    });

  } catch (err: any) {
    console.error("Cron Reminder Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
