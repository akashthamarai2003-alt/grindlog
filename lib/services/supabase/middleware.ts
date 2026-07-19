import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin-login")) {
    const adminCookie = request.cookies.get("admin_auth")?.value;
    const validPwd = process.env.ADMIN_PASSWORD || "admin";

    if (adminCookie !== validPwd) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin-login";
      return NextResponse.redirect(url);
    }
    
    // If we got here, they are an authenticated admin via the custom login page.
    // We do NOT need to check their Supabase user for admin routes because admin routes use the Service Role key.
    return response;
  }

  const publicPaths = [
    "/",
    "/auth/signup",
    "/auth/signin",
    "/auth/callback",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/admin-login",
    "/onboarding",
    "/terms",
    "/privacy",
    "/refund",
  ];

  const isPublicPath = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/signin";
    return NextResponse.redirect(url);
  }

  if (user && isPublicPath && !["/auth/reset-password", "/terms", "/privacy", "/refund"].includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|screenshots|manifest.json|sw.js).*)",
  ],
};
