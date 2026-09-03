import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponse } from "@/lib/services/groq/client";

export class AiWorkoutCoachService {
  static async getOrGenerateCoachNote(userId: string, workoutId: string) {
    const supabase = await createServerSupabase();
    
    // 1. Verify ownership of the workout
    const { data: workout, error: wErr } = await supabase
      .from("fitness_os_workouts")
      .select("user_id, name")
      .eq("id", workoutId)
      .single();

    if (wErr || !workout) throw new Error("WORKOUT_NOT_FOUND");
    if (workout.user_id !== userId) throw new Error("UNAUTHORIZED");

    // 2. Check if a note already exists (permanent cache)
    const { data: existingNote } = await supabase
      .from("workout_ai_notes")
      .select("note")
      .eq("workout_id", workoutId)
      .maybeSingle();

    if (existingNote?.note) {
      return existingNote.note;
    }

    // 3. Generate Note via AI
    let note = "";
    let isRealAI = false;
    try {
      const prompt = `You are an elite AI fitness coach analyzing a workout. 
The user is performing: ${workout.name}.
Write a single, highly motivating and technical 1-2 sentence tip (under 120 characters) focused on form, intensity, or breathing.
Example: "Keep your core tight and control the negative on every rep to maximize hypertrophy."`;

      note = await generateAIResponse({ 
        systemPrompt: "You are an elite AI fitness coach analyzing workout performance.",
        userPrompt: prompt, 
        model: "fast" 
      });
      if (note && note.trim().length > 10) {
        isRealAI = true;
      }
    } catch (e) {
      console.error("AI generation failed for AI Coach Note:", e);
      // Fail gracefully
      note = `Focus on form and maintain intensity during your ${workout.name} workout.`;
    }

    // Only cache genuine AI responses so future page refreshes hit cache instantly
    if (isRealAI) {
      await supabase.from("ai_usage_logs").insert({
        user_id: userId,
        feature: "workout_coach_note",
        prompt_version: "workout-coach-v1",
        tokens_used: 50
      });

      await supabase.from("workout_ai_notes").insert({
        user_id: userId,
        workout_id: workoutId,
        note: note.trim(),
        prompt_version: "workout-coach-v1"
      });
    }

    return note;
  }
}
