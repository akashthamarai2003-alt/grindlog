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

  if (pathname.startsWith("/admin")) {
    const basicAuth = request.headers.get("authorization");
    const url = request.nextUrl;

    if (basicAuth) {
      const authValue = basicAuth.split(" ")[1];
      const [authUser, pwd] = atob(authValue).split(":");

      const validUser = process.env.ADMIN_USERNAME || "admin";
      const validPwd = process.env.ADMIN_PASSWORD || "admin";

      if (authUser === validUser && pwd === validPwd) {
        // Authenticated
      } else {
        return new NextResponse("Auth required", {
          status: 401,
          headers: { "WWW-Authenticate": "Basic realm=\"Secure Area\"" },
        });
      }
    } else {
      return new NextResponse("Auth required", {
        status: 401,
        headers: { "WWW-Authenticate": "Basic realm=\"Secure Area\"" },
      });
    }

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/signin";
      return NextResponse.redirect(url);
    }
    
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
    const userEmail = user.email?.toLowerCase();
    
    // If ADMIN_EMAILS is set, enforce it. If not, allow any logged-in user who passes the Basic Auth password prompt.
    if (process.env.ADMIN_EMAILS && (!userEmail || !adminEmails.includes(userEmail))) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  const publicPaths = [
    "/",
    "/auth/signup",
    "/auth/signin",
    "/auth/callback",
    "/auth/forgot-password",
    "/auth/reset-password",
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
