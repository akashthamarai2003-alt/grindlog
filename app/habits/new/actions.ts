"use server"

import { generateAIResponse } from "@/lib/services/groq/client";

const SUGGEST_PROMPT = `You are an AI habit coach. Suggest a highly effective daily habit.
Return ONLY a valid JSON object matching this schema, no markdown blocks, no other text:
{
  "name": "Short habit name (max 25 chars)",
  "category": "Fitness" | "Learning" | "Health" | "Mindfulness" | "Finance" | "Social" | "Work" | "Creative" | "Other",
  "emoji": "Single emoji",
  "targetCount": number (1 to 5)
}`;

export async function suggestHabitAction() {
  try {
    const response = await generateAIResponse({
      systemPrompt: SUGGEST_PROMPT,
      userPrompt: "Suggest a great habit.",
      model: "fast",
      maxTokens: 200,
    });
    
    const cleanJson = response.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(error);
    // Fallback
    return {
      name: "Drink Water",
      category: "Health",
      emoji: "💧",
      targetCount: 4,
    };
  }
}
