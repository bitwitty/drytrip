import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth guard — protect all admin pages except login
  if (pathname.startsWith("/admin/") && pathname !== "/admin/login") {
    const cookie = request.cookies.get(ADMIN_COOKIE);
    if (!(await isAdminCookie(cookie?.value))) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
