import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { createClient } from "@supabase/supabase-js";
import { canUseFitnessFeature } from "@/lib/fitness/subscription/access";

const FREE_EXERCISE_DB_URL = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    
    // Auth check - ensure only admin or authenticated user can trigger seed
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await canUseFitnessFeature(user.id, "exercise_library"))) {
      return NextResponse.json({ error: "The full exercise library is available on the Pro plan.", errorType: "PRO_REQUIRED" }, { status: 403 });
    }

    // Create admin client to bypass RLS for seeding global exercises
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Check if library is already populated
    const { count } = await supabaseAdmin
      .from("fitness_exercises_library")
      .select("*", { count: "exact", head: true });
      
    if (count && count > 0) {
      return NextResponse.json({ message: `Library already contains ${count} exercises.` });
    }

    // Fetch the CC0 dataset
    const res = await fetch(FREE_EXERCISE_DB_URL);
    if (!res.ok) throw new Error("Failed to fetch exercise DB");
    
    const exercisesData = await res.json();
    
    // Map to our schema
    const mappedExercises = exercisesData.map((ex: any) => ({
      slug: ex.id,
      name: ex.name,
      body_part: ex.category || "Other",
      target_muscle: (ex.primaryMuscles && ex.primaryMuscles[0]) || "Other",
      secondary_muscles: ex.secondaryMuscles || [],
      equipment: ex.equipment || "Bodyweight",
      level: ex.level || "Beginner",
      mechanic: ex.mechanic || "Compound",
      force: ex.force || "Push",
      instructions: ex.instructions || [],
      image_urls: ex.images ? ex.images.map((img: string) => `https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/${img}`) : [],
      is_custom: false,
    }));

    // Chunk the inserts to avoid payload limits
    const CHUNK_SIZE = 100;
    let insertedCount = 0;

    for (let i = 0; i < mappedExercises.length; i += CHUNK_SIZE) {
      const chunk = mappedExercises.slice(i, i + CHUNK_SIZE);
      const { error } = await supabaseAdmin.from("fitness_exercises_library").upsert(chunk, { onConflict: 'slug' });
      if (error) {
        console.error("Chunk insert error:", error);
        throw error;
      }
      insertedCount += chunk.length;
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully seeded ${insertedCount} exercises.` 
    });

  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: error.message || "Failed to seed DB" }, { status: 500 });
  }
}
