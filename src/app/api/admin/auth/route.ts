import { NextRequest, NextResponse } from "next/server";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD not configured" },
      { status: 500 }
    );
  }

  if (password === adminPassword) {
    // Set cookie server-side so it carries HttpOnly — JS in the browser cannot
    // read or forge it, which closes the document.cookie bypass.
    const response = NextResponse.json({ ok: true });
    response.cookies.set("dt_admin", "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400, // 1 day
      path: "/",
    });
    return response;
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const posthog = getPostHogClient();
  posthog.capture({
    distinctId: ip,
    event: "admin_auth_failed",
    properties: { ip },
  });

  return NextResponse.json({ error: "Invalid password" }, { status: 401 });
}
