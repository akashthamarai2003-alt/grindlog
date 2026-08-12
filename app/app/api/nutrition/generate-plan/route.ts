import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";

export async function POST() {
  try {
    const supabase = await createServerSupabase();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated.' } },
        { status: 401 }
      );
    }

    // SCAFFOLD: AI integration disabled for now
    return NextResponse.json({ 
      success: true, 
      message: 'Plan generation scaffolded. AI disabled.',
      data: [] 
    });
  } catch (error: any) {
    console.error("Error in POST /api/nutrition/generate-plan:", error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to generate plan.' } },
      { status: 500 }
    );
  }
}
