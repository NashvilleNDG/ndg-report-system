import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Lightweight middleware — no crypto/bcrypt, Edge-compatible.
 *
 * Auth protection is handled at the page level (layout.tsx, page.tsx).
 * This file exists only to set a `matcher` so that Next.js does NOT
 * intercept public static files (images, fonts, etc.) with NextAuth's
 * built-in session handling, which would redirect them to /login.
 */
export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT static assets so the logo and other
     * public files are served without any auth redirect.
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/auth|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.ico|.*\\.webp|.*\\.woff2?).*)",
  ],
};
