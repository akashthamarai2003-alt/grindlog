"use server";

import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponse, generateAIResponseJSON, GROQ_MODELS } from "@/lib/services/groq/client";
import { revalidatePath } from "next/cache";

// Helper to get user context
async function getUserContext() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  return { supabase, user };
}

// 1. AI Habit Generator Action
export async function generateHabitsAction(goal: string) {
  try {
    const { supabase, user } = await getUserContext();

    const systemPrompt = `You are a world-class performance and habit design coach. Your task is to design a set of 3 to 5 daily habits specifically tailored to help the user achieve their goal.
Return a JSON array of objects. Each object must strictly match the following typescript structure:
{
  "name": string, // short, actionable habit name (e.g., "Deep Work Block", "Hydrate first thing")
  "emoji": string, // single emoji matching the habit
  "target_count": number, // positive integer, how many times/units per day
  "target_unit": string, // unit of measurement (e.g., "pages", "minutes", "times", "ml")
  "color": string, // hex color, choose from: "#34C759" (green), "#007AFF" (blue), "#FF9500" (orange), "#AF52DE" (purple), "#FF2D55" (red)
  "description": string // 1-sentence description explaining how this habit contributes directly to the goal
}`;

    const userPrompt = `My goal is: "${goal}"`;
    const habits = await generateAIResponseJSON<any[]>({ systemPrompt, userPrompt });
    return { success: true, habits };
  } catch (error: any) {
    console.error("AI Habit Generator Error:", error);
    return { success: false, error: error.message || "Failed to generate habits" };
  }
}

// Helper to save a habit
export async function addHabitFromAIAction(habit: {
  name: string;
  emoji: string;
  target_count: number;
  target_unit: string;
  color: string;
}) {
  try {
    const { supabase, user } = await getUserContext();
    const { data, error } = await supabase
      .from("habits")
      .insert({
        user_id: user.id,
        name: habit.name,
        emoji: habit.emoji,
        target_count: habit.target_count,
        target_unit: habit.target_unit,
        color: habit.color,
        is_active: true,
        current_streak: 0,
        total_completions: 0
      })
      .select()
      .single();

    if (error) throw error;
    revalidatePath("/dashboard");
    return { success: true, habit: data };
  } catch (error: any) {
    console.error("Add AI Habit Error:", error);
    return { success: false, error: error.message || "Failed to add habit" };
  }
}

// 2. AI Weekly Report Action
export async function generateWeeklyReportAction() {
  try {
    const { supabase, user } = await getUserContext();

    // Fetch user habits
    const { data: habits } = await supabase
      .from("habits")
      .select("id, name")
      .eq("user_id", user.id)
      .eq("is_active", true);

    // Fetch logs from last 7 days
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);
    const startStr = sevenDaysAgo.toISOString().split("T")[0];

    const { data: logs } = await supabase
      .from("habit_logs")
      .select("habit_id, date, status")
      .eq("user_id", user.id)
      .gte("date", startStr);

    const systemPrompt = `You are an elite data analyst and wellness consultant. Analyze the user's habit performance log for the past 7 days.
Calculate an overall progress score from 0-100.
Provide an executive report in JSON format with the following fields:
{
  "score": number, // 0-100 rating based on completed habits vs total possible completions
  "summary": string, // 2-3 sentence encouraging, data-backed summary of their performance
  "completedCount": number, // total completed logs count
  "skippedCount": number, // total skipped logs count
  "highlights": string[], // 2-3 bullet achievements (e.g. "Completed all workout sessions", "Perfect hydrated streak")
  "improvements": string[] // 2 actionable recommendations for next week (e.g., "Try shifting your study habit to mornings")
}`;

    const userPrompt = `Habits: ${JSON.stringify(habits || [])}\nLogs (past 7 days): ${JSON.stringify(logs || [])}`;
    const report = await generateAIResponseJSON<any>({ systemPrompt, userPrompt });
    return { success: true, report };
  } catch (error: any) {
    console.error("Weekly Report Error:", error);
    return { success: false, error: error.message || "Failed to generate weekly report" };
  }
}

// 3. AI Coach Action
export async function getCoachResponseAction(chatHistory: { role: string; content: string }[]) {
  try {
    const { supabase, user } = await getUserContext();

    // Fetch today's context
    const todayStr = new Date().toISOString().split("T")[0];
    const { data: habits } = await supabase
      .from("habits")
      .select("name, emoji, current_streak")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const { data: logs } = await supabase
      .from("habit_logs")
      .select("habit_id, status")
      .eq("user_id", user.id)
      .eq("date", todayStr);

    const systemPrompt = `You are "GrindLog AI Coach", a supportive, insightful, and action-oriented growth coach.
The user is tracking the following habits: ${JSON.stringify(habits || [])}.
Today's completions: ${JSON.stringify(logs || [])}.
Use this context to address the user's query. Be concise, empathetic, and always end with a highly actionable next step or reflection question. Speak directly, keep responses under 4 sentences where possible.`;

    const groq = getGroqClientFromImport();
    const completion = await groq.chat.completions.create({
      model: GROQ_MODELS.primary,
      messages: [
        { role: "system", content: systemPrompt },
        ...chatHistory.map(m => ({ role: m.role as "user" | "assistant", content: m.content }))
      ],
      max_tokens: 512,
      temperature: 0.7,
    });

    return { success: true, content: completion.choices[0]?.message?.content || "" };
  } catch (error: any) {
    console.error("AI Coach Action Error:", error);
    return { success: false, error: error.message || "Failed to get coach response" };
  }
}

// Helper to bypass client circular imports
import { getGroqClient } from "@/lib/services/groq/client";
function getGroqClientFromImport() {
  return getGroqClient();
}

// 4. AI Predictions Action
export async function generatePredictionsAction() {
  try {
    const { supabase, user } = await getUserContext();

    const { data: habits } = await supabase
      .from("habits")
      .select("id, name, current_streak")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const today = new Date();
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(today.getDate() - 14);
    const startStr = fourteenDaysAgo.toISOString().split("T")[0];

    const { data: logs } = await supabase
      .from("habit_logs")
      .select("habit_id, date, status")
      .eq("user_id", user.id)
      .gte("date", startStr);

    const systemPrompt = `You are an AI behavioral scientist. Analyze the user's 14-day history to predict their likelihood of completing each habit tomorrow.
Respond with a JSON array of objects. Each object should match this structure:
{
  "habitId": string,
  "habitName": string,
  "probability": number, // 0 to 100 percentage likelihood of success
  "insight": string // 1-sentence prediction warning or strategic tip (e.g. "High risk of skip tomorrow since weekends are your weak spot.")
}`;

    const userPrompt = `Habits: ${JSON.stringify(habits || [])}\nLogs (past 14 days): ${JSON.stringify(logs || [])}`;
    const predictions = await generateAIResponseJSON<any[]>({ systemPrompt, userPrompt });
    return { success: true, predictions };
  } catch (error: any) {
    console.error("AI Predictions Error:", error);
    return { success: false, error: error.message || "Failed to generate predictions" };
  }
}

// 5. AI Motivation Action
export async function generateMotivationAction() {
  try {
    const { supabase, user } = await getUserContext();

    const { data: profile } = await supabase
      .from("profiles")
      .select("xp, level")
      .eq("id", user.id)
      .single();

    const { data: habits } = await supabase
      .from("habits")
      .select("name, current_streak")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const systemPrompt = `You are a high-energy mental performance coach. Based on the user's level, XP, and active habits, write a daily spark card.
Respond with a JSON object matching this structure:
{
  "quote": string, // short, powerful, unconventional quote
  "author": string, // author of the quote
  "action": string, // 1 concrete growth challenge to complete today (e.g. "Do 10 pushups right now")
  "focus": string // 1-sentence customized personal focus statement based on their habits
}`;

    const userPrompt = `Profile: ${JSON.stringify(profile || {})}\nHabits: ${JSON.stringify(habits || [])}`;
    const motivation = await generateAIResponseJSON<any>({ systemPrompt, userPrompt });
    return { success: true, motivation };
  } catch (error: any) {
    console.error("AI Motivation Error:", error);
    return { success: false, error: error.message || "Failed to generate motivation" };
  }
}

// 6. AI Habit Suggestions Action
export async function generateSuggestionsAction() {
  try {
    const { supabase, user } = await getUserContext();

    const { data: habits } = await supabase
      .from("habits")
      .select("name, emoji, color")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const systemPrompt = `You are a behavioral systems engineer. Examine the user's current habits and suggest 3 complementary habits to balance their life (physical, mental, and productivity).
Respond with a JSON array of objects matching this structure:
{
  "name": string, // short, clear name
  "emoji": string, // single matching emoji
  "target_count": number, // positive integer
  "target_unit": string, // e.g. "minutes", "times", "ml"
  "color": string, // hex color, e.g. "#FF9500"
  "reason": string // 1-sentence explanation of why this fits their routine
}`;

    const userPrompt = `Current habits: ${JSON.stringify(habits || [])}`;
    const suggestions = await generateAIResponseJSON<any[]>({ systemPrompt, userPrompt });
    return { success: true, suggestions };
  } catch (error: any) {
    console.error("AI Suggestions Error:", error);
    return { success: false, error: error.message || "Failed to generate suggestions" };
  }
}

// 7. AI Schedule Builder Action
export async function generateScheduleBuilderAction(wakeTime: string, sleepTime: string, focus: string) {
  try {
    const { supabase, user } = await getUserContext();

    const { data: habits } = await supabase
      .from("habits")
      .select("name, emoji")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const systemPrompt = `You are a time-blocking productivity expert. Create an optimized daily routine based on the user's wake time, sleep time, core focus, and active habits.
Respond with a JSON array of objects matching this structure:
{
  "time": string, // e.g. "07:30 AM"
  "activity": string, // name of activity or routine block
  "emoji": string, // matching emoji
  "isHabit": boolean // true if this block directly integrates one of their active habits
}`;

    const userPrompt = `Wake time: ${wakeTime}\nSleep time: ${sleepTime}\nFocus area: ${focus}\nActive Habits: ${JSON.stringify(habits || [])}`;
    const schedule = await generateAIResponseJSON<any[]>({ systemPrompt, userPrompt });
    return { success: true, schedule };
  } catch (error: any) {
    console.error("AI Schedule Builder Error:", error);
    return { success: false, error: error.message || "Failed to build schedule" };
  }
}

// 8. AI Reflection Action
export async function generateReflectionAction(text: string) {
  try {
    const { supabase, user } = await getUserContext();

    const { data: habits } = await supabase
      .from("habits")
      .select("name")
      .eq("user_id", user.id)
      .eq("is_active", true);

    const systemPrompt = `You are a cognitive behavioral therapist. Analyze the user's daily journal entry and offer insights and reframing advice.
Respond with a JSON object matching this structure:
{
  "summary": string, // 2-sentence empathetic response identifying their emotional state and offering validation
  "insights": string[], // 2 key cognitive insights or reframing thoughts
  "actionableTask": string // 1 concrete small task they should do tomorrow to act on this reflection
}`;

    const userPrompt = `Reflection Journal: "${text}"\nActive Habits: ${JSON.stringify(habits || [])}`;
    const reflection = await generateAIResponseJSON<any>({ systemPrompt, userPrompt });
    return { success: true, reflection };
  } catch (error: any) {
    console.error("AI Reflection Error:", error);
    return { success: false, error: error.message || "Failed to generate reflection analysis" };
  }
}
