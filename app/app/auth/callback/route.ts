import { createServerSupabase } from "@/lib/services/supabase/server";
import { createAdminClient } from "@/lib/services/supabase/admin";
import { NextResponse } from "next/server";
import { getSafeRedirect } from "@/lib/utils/redirect";

export const dynamic = "force-dynamic";

function returnBridgeHtml(deepLink: string, intentLink: string, statusText: string) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
  <title>GrindLog</title>
  <style>
    * { box-sizing: border-box; }
    body {
      background-color: #0A1108;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      padding: 24px;
      text-align: center;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 3px solid rgba(34, 197, 94, 0.2);
      border-top-color: #22c55e;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin-bottom: 24px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    h2 {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #FFFFFF;
    }
    p {
      margin: 0 0 28px 0;
      font-size: 14px;
      color: #94A3B8;
      max-width: 280px;
      line-height: 1.5;
    }
    .btn {
      background-color: #22c55e;
      color: #0A1108;
      font-size: 15px;
      font-weight: 700;
      padding: 14px 28px;
      border-radius: 12px;
      text-decoration: none;
      display: inline-block;
      box-shadow: 0 4px 14px rgba(34, 197, 94, 0.3);
    }
  </style>
</head>
<body>
  <div class="spinner"></div>
  <h2>${statusText}</h2>
  <p>Returning you to GrindLog. If the app does not open automatically, tap below.</p>
  <a class="btn" id="openBtn" href="${deepLink}">Open GrindLog</a>
  <script>
    window.location.replace("${deepLink}");
    setTimeout(function() {
      window.location.href = "${intentLink}";
    }, 400);
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || searchParams.get("redirect");
  const error = searchParams.get("error") || searchParams.get("error_code");
  const errorDescription = searchParams.get("error_description");
  const isApp = searchParams.get("app") === "true";

  if (error) {
    const errorMsg = errorDescription || error;
    if (isApp) {
      const appErrorUrl = `com.grindlog.app://auth/callback?error=${encodeURIComponent(errorMsg)}`;
      return returnBridgeHtml(appErrorUrl, appErrorUrl, "Authentication error: " + errorMsg);
    }
    return NextResponse.redirect(`${origin}/auth/signin?error=${encodeURIComponent(errorMsg)}`);
  }

  if (isApp && code) {
    const safeNext = next ? encodeURIComponent(next) : "";
    const deepLink = `com.grindlog.app://auth/callback?code=${encodeURIComponent(code)}${safeNext ? `&next=${safeNext}` : ""}`;
    const intentLink = `intent://auth/callback?code=${encodeURIComponent(code)}${safeNext ? `&next=${safeNext}` : ""}#Intent;scheme=com.grindlog.app;package=com.grindlog.app;end`;

    return returnBridgeHtml(deepLink, intentLink, "Logging into GrindLog...");
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
