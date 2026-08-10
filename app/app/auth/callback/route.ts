import { createServerSupabase } from "@/lib/services/supabase/server";
import { NextResponse } from "next/server";
import { getSafeRedirect } from "@/lib/utils/redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || searchParams.get("redirect");
  const safeNext = getSafeRedirect(next);

  if (code) {
    const supabase = await createServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${safeNext}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_callback_error`);
}
