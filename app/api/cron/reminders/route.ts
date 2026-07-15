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
        notificationsToSend.push({
          tokens: usersTokens.get(userId),
          title: "Rise and Grind! 🌅",
          body: "Good morning! Check your planner to see your targets for today."
        });
      }
    } 
    else if (type === "afternoon") {
      for (const userId of userIds) {
        notificationsToSend.push({
          tokens: usersTokens.get(userId),
          title: "Halfway There! ⚡",
          body: "Afternoon check-in. Keep your momentum going and knock out those habits!"
        });
      }
    } 
    else if (type === "night") {
      for (const userId of userIds) {
        notificationsToSend.push({
          tokens: usersTokens.get(userId),
          title: "Time to wrap up! 🌙",
          body: "Did you forget to log your habits? Review your day before midnight."
        });
      }
    } 
    else if (type === "tree") {
      for (const userId of userIds) {
        notificationsToSend.push({
          tokens: usersTokens.get(userId),
          title: "Your Tree is Thirsty! 🌱",
          body: "Water your tree by completing a habit today. Don't let it wither!"
        });
      }
    }
    else if (type === "ai") {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      
      for (const userId of userIds) {
        try {
          const chatCompletion = await groq.chat.completions.create({
            messages: [
              {
                role: "system",
                content: "You are a tough-love AI habit coach. Generate a single, short (max 15 words) push notification message to motivate the user to complete their habits today. Be punchy, intense, and modern. No emojis, just raw motivation."
              }
            ],
            model: "llama3-8b-8192",
            temperature: 0.9,
          });

          const aiMessage = chatCompletion.choices[0]?.message?.content || "No excuses. Execute your habits today.";

          notificationsToSend.push({
            tokens: usersTokens.get(userId),
            title: "AI Coach 🧠",
            body: aiMessage.replace(/["']/g, "")
          });
        } catch (aiError) {
          console.error("Groq error", aiError);
        }
      }
    }
    else if (type === "streak") {
      for (const userId of userIds) {
        notificationsToSend.push({
          tokens: usersTokens.get(userId),
          title: "Protect Your Streak! 🔥",
          body: "You've worked hard for this momentum. Don't break the chain today!"
        });
      }
    } 
    else {
      return NextResponse.json({ error: "Invalid reminder type" }, { status: 400 });
    }

    // 4. Send Notifications via Firebase Admin
    let successCount = 0;
    let failureCount = 0;

    for (const notif of notificationsToSend) {
      if (!notif.tokens || notif.tokens.length === 0) continue;
      
      const message = {
        notification: {
          title: notif.title,
          body: notif.body,
          imageUrl: "https://grindlog-lake.vercel.app/icons/icon-192.png"
        },
        tokens: notif.tokens, // Multicast to all devices of the user
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
