import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { generateAIResponse } from "@/lib/services/groq/client";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ sessionId: string; exerciseId: string }> }
) {
  try {
    const resolvedParams = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const action = body.action;

    if (action === "generate") {
      const reason = body.reason || "Other";
      
      const { data: exercise } = await supabase
        .from("fitness_os_exercises")
        .select("name")
        .eq("id", resolvedParams.exerciseId)
        .single();
        
      const { data: profile } = await supabase
        .from("fitness_os_profiles")
        .select("equipment")
        .eq("id", user.id)
        .single();

      const equipmentList = profile?.equipment && Array.isArray(profile.equipment) ? profile.equipment.join(", ") : "None";

      const systemPrompt = `You are an expert personal trainer AI. You need to suggest 3 alternative exercises. 
Return ONLY a valid JSON array. Do not include markdown code blocks, just raw JSON.
Format: [{"name": "Exercise Name", "target": "Primary Muscle", "match": "95%"}]`;

      const userPrompt = `The user wants to replace the exercise "${exercise?.name || "the current exercise"}".
Reason for replacement: ${reason}.
Available equipment: ${equipmentList}.
Suggest exactly 3 alternative exercises that target similar muscles but address the reason for replacing.
Return ONLY the JSON array.`;

      const aiResponseText = await generateAIResponse({
        systemPrompt,
        userPrompt,
        temperature: 0.7
      });

      let alternatives = [];
      try {
        const jsonStart = aiResponseText.indexOf('[');
        const jsonEnd = aiResponseText.lastIndexOf(']') + 1;
        const jsonStr = jsonStart >= 0 ? aiResponseText.slice(jsonStart, jsonEnd) : aiResponseText;
        alternatives = JSON.parse(jsonStr);
      } catch (e) {
        console.error("Failed to parse AI response:", aiResponseText);
        // Fallbacks
        alternatives = [
          { name: "Alternative Exercise 1", target: "Similar", match: "90%" },
          { name: "Alternative Exercise 2", target: "Similar", match: "85%" }
        ];
      }

      return NextResponse.json({ success: true, alternatives });
    } 
    else if (action === "replace") {
      const newExerciseName = body.newExerciseName;
      if (!newExerciseName) throw new Error("newExerciseName required");
      
      const { error: updateErr } = await supabase
        .from("fitness_os_exercises")
        .update({ name: newExerciseName })
        .eq("id", resolvedParams.exerciseId);

      if (updateErr) throw updateErr;

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error(`POST /api/workouts/sessions/[sessionId]/exercises/[exerciseId]/replace error:`, error);
    return NextResponse.json({ error: error.message || "Failed to process replace" }, { status: 500 });
  }
}
