import { updateSession } from "@/lib/services/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icons|screenshots|manifest.json|sw.js|GrindLog_Legal.pdf).*)",
  ],
};
