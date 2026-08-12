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
      message: 'Swap meal scaffolded. AI disabled.',
      data: null 
    });
  } catch (error: any) {
    console.error("Error in POST /api/nutrition/swap-meal:", error);
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Failed to swap meal.' } },
      { status: 500 }
    );
  }
}
