import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

// Next.js 16: the `middleware` convention is renamed to `proxy` (nodejs runtime).
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files and Next.js internals.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
