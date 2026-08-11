import { NextResponse } from "next/server";
import { createServerSupabase } from "@/lib/services/supabase/server";
import { GeneratedPlanSchema } from "@/lib/fitness/ai/schemas";

export async function POST(req: Request) {
  try {
    const supabase = await createServerSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = GeneratedPlanSchema.safeParse(body.plan);
    
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: "Invalid plan format." }, { status: 400 });
    }

    const planData = parsed.data;

    // Atomic Database Transaction via RPC
    const { data: planId, error: rpcError } = await supabase.rpc("create_fitness_os_plan_transaction", {
      payload: planData
    });

    if (rpcError || !planId) {
      console.error("Save Plan Transaction failed:", rpcError);
      return NextResponse.json({ success: false, error: "Failed to save the generated plan." }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { planId } });
  } catch (error: any) {
    console.error("Save Plan Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
