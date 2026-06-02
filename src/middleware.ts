import { NextRequest, NextResponse } from "next/server";

// Routes hidden behind the coming-soon gate (code is kept, just not public)
const COMING_SOON_HIDDEN = [
  "/directory",
  "/venues",
  "/plan",
  "/methodology",
  "/edit",
  "/go",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin auth guard
  if (pathname === "/admin/review") {
    const cookie = request.cookies.get("dt_admin");
    if (cookie?.value !== "1") {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // Coming-soon redirect: hide public pages until launch
  if (COMING_SOON_HIDDEN.some((route) => pathname === route || pathname.startsWith(route + "/"))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/review",
    "/directory/:path*",
    "/venues/:path*",
    "/plan",
    "/methodology",
    "/edit/:path*",
    "/go/:path*",
  ],
};
