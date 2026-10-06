import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { NextResponse } from "next/server";
import { getSafeRedirect } from "@/lib/utils/redirect";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || searchParams.get("redirect");
  const error = searchParams.get("error") || searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    const errorMsg = errorDescription || error;
    return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(errorMsg)}`);
  }

  if (code) {
    const supabase = await createServerSupabase();
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && data?.user) {
      // Check whether this user has finished onboarding
      const admin = createAdminClient();
      const { data: profile } = await admin
        .from("fitness_os_profiles")
        .select("onboarding_completed")
        .eq("user_id", data.user.id)
        .maybeSingle();

      // Brand new users without a completed profile must always be directed to onboarding!
      if (!profile?.onboarding_completed) {
        return NextResponse.redirect(`${origin}/onboarding`);
      }

      const safeNext = getSafeRedirect(next);
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`);
}
