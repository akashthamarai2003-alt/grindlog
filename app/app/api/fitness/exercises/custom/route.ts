import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).substring(2, 7);
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, target_muscle, equipment, mechanic, force, instructions } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = generateSlug(name);

    const { error } = await supabase.from("fitness_exercises_library").insert({
      slug,
      name,
      target_muscle,
      equipment,
      mechanic,
      force,
      instructions: instructions || [],
      is_custom: true,
      created_by: user.id
    });

    if (error) throw error;

    return NextResponse.json({ success: true, slug });

  } catch (error: any) {
    console.error("POST custom exercise error:", error);
    return NextResponse.json({ error: error.message || "Failed to create exercise" }, { status: 500 });
  }
}
