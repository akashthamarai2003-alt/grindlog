import { OnboardingData } from "@/types/fitness/onboarding";

export const FITNESS_PLAN_SYSTEM_PROMPT = `You are the Fitness AI OS intelligent coaching assistant.
Your goal is to generate a structured, highly personalized fitness and nutrition plan based on the user's profile.

CRITICAL RULES:
1. OUTPUT JSON ONLY. You must strictly follow the JSON schema provided. No markdown block backticks around JSON unless required, no conversational text before or after the JSON.
2. NO MEDICAL ADVICE. You must not diagnose diseases, prescribe medication, or guarantee medical outcomes. If the user mentions a medical condition, recommend consulting a doctor in the plan description or guidance.
3. NO EXTREME RESTRICTIONS. Do not recommend starvation, dangerous dehydration, or steroid use.
4. RESPECT ALLERGIES AND PREFERENCES. The nutrition guidance must explicitly avoid any allergies or food avoidances provided.
5. RESPECT EQUIPMENT. Only generate exercises that can be performed in the user's training location with their available equipment.
6. NO IDS. Do not invent any UUIDs. The database handles ID generation.

For workout schedules, generate workouts exactly starting from tomorrow or the current week, distributing them according to the user's preferred days and 'training_days_per_week'.
`;

export function buildFitnessPlanPrompt(profile: Partial<OnboardingData>, todayDateStr: string): string {
  return `Please generate a personalized fitness plan for me.
  
User Profile:
- Goal: ${profile.goal}
- Fitness Level: ${profile.fitness_level}
- Age: ${profile.age}
- Gender: ${profile.gender}
- Current Weight: ${profile.weight} kg
- Target Weight: ${profile.target_weight} kg
- Height: ${profile.height} cm
- Training Location: ${profile.training_location}
- Available Equipment: ${profile.equipment?.join(", ") || "None specified"}
- Training Days per week: ${profile.training_days_per_week}
- Workout Duration: ${profile.workout_duration_minutes} minutes
- Diet Preference: ${profile.diet_preference}
- Allergies: ${profile.allergies?.join(", ") || "None"}
- Food Avoidances: ${profile.food_avoidances?.join(", ") || "None"}
- Meals per day: ${profile.meals_per_day}
- Activity Level: ${profile.activity_level}
- Sleep Target: ${profile.sleep_duration} hours
- Lifestyle Context: ${profile.lifestyle_description || "N/A"}

Current Date: ${todayDateStr}

Instructions:
1. Generate a 'plan' object with a highly motivating name, description, and goal.
2. Generate an array of 'workouts' matching my 'training_days_per_week'. Each workout should have a 'workout_date' (YYYY-MM-DD) distributed across the next 7 days, starting from ${todayDateStr}.
3. Generate 'exercises' for each workout that fit within my ${profile.workout_duration_minutes} minute duration and match my ${profile.training_location} / ${profile.equipment?.join(", ") || "None"} constraints.
4. Generate 'nutrition' providing a safe daily_calories target and protein_grams. Respect my diet: ${profile.diet_preference}, avoiding: ${profile.allergies?.join(", ")} and ${profile.food_avoidances?.join(", ")}.
5. Generate 'lifestyle' targets suitable for my profile.

Respond entirely in JSON format matching the expected schema.`;
}
