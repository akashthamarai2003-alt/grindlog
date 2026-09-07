import { NextRequest, NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { WorkoutService } from "@/lib/services/fitness/workout-service";
import { requireFitnessSubscription } from "@/lib/fitness/subscription/access";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await requireFitnessSubscription(user.id))) {
      return NextResponse.json(
        { error: "Active paid plan required", errorType: "PAYMENT_REQUIRED" },
        { status: 402 }
      );
    }

    const result = await WorkoutService.completeSession(user.id, sessionId);
    
    return NextResponse.json(result);
  } catch (error: any) {
    console.error(`PATCH /api/workouts/sessions/[sessionId]/complete error:`, error);
    return NextResponse.json({ error: error.message || "Failed to complete session" }, { status: 500 });
  }
}
