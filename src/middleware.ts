import { NextRequest, NextResponse } from "next/server";

/**
 * Protect /admin/review from unauthenticated access.
 * The dt_admin cookie is HttpOnly (set server-side in /api/admin/auth),
 * so it cannot be forged via document.cookie in the browser.
 */
export function middleware(request: NextRequest) {
  const cookie = request.cookies.get("dt_admin");
  if (cookie?.value !== "1") {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/admin/review",
};
