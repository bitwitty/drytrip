import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth guard — protect all admin pages except login
  if (pathname.startsWith("/admin/") && pathname !== "/admin/login") {
    const cookie = request.cookies.get("dt_admin");
    if (cookie?.value !== "1") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
