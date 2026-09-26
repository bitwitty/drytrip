import { NextRequest, NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Forwards a sign-up from drytrip.co's own forms to the Dry Dispatch Substack.
// Substack has no official subscribe API; this posts to the same endpoint its
// embed form uses. The email is already saved to Supabase (waitlist) by the
// form before this runs, so a failure here never loses a sign-up.

const SUBSTACK_URL =
  process.env.SUBSTACK_PUBLICATION_URL ?? "https://drydispatch.substack.com";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 5 sign-ups per IP per hour, so the endpoint can't be used to mass-subscribe
// other people's addresses.
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, "1 h"),
        prefix: "drytrip:subscribe",
      })
    : null;

export async function POST(req: NextRequest) {
  let email = "";
  try {
    const body = await req.json();
    email = String(body?.email ?? "").trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_request" }, { status: 400 });
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";
  if (ratelimit) {
    const { success } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
    }
  }

  const pageUrl = req.headers.get("referer") ?? "https://drytrip.co/";
  try {
    const res = await fetch(`${SUBSTACK_URL}/api/v1/free`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        email,
        first_url: pageUrl,
        first_referrer: "",
        current_url: pageUrl,
        current_referrer: "",
        referral_code: "",
        source: "embed",
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("[subscribe] Substack rejected sign-up", res.status, text.slice(0, 300));
      return NextResponse.json({ ok: false, error: "substack_error", status: res.status }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[subscribe] Substack request failed", err);
    return NextResponse.json({ ok: false, error: "substack_unreachable" }, { status: 502 });
  }
}
