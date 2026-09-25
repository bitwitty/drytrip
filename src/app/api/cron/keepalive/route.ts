import { Redis } from "@upstash/redis";

// Weekly Vercel Cron (see vercel.json) that touches the Upstash rate-limit DB.
// Upstash deletes free databases after 14 days with no activity; this keeps it alive.
// Cheap and idempotent: one SET per call, throttled per instance so it can't be spammed.
let lastTouch = 0;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return Response.json({ ok: false, reason: "upstash-not-configured" }, { status: 500 });
  }
  const now = Date.now();
  if (now - lastTouch < 60 * 60 * 1000) {
    return Response.json({ ok: true, skipped: true });
  }
  try {
    await Redis.fromEnv().set("drytrip:keepalive", new Date(now).toISOString());
    lastTouch = now;
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: (e as Error).name }, { status: 502 });
  }
}
