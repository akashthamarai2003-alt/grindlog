import { updateSession } from "@/lib/services/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|assets|images|videos|favicon.ico|icons|screenshots|manifest.json|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js|html|mp4|webm|ogg|wav|mp3|m4v|mov)$).*)",
  ],
};
