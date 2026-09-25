import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { TRIP_PLANNER_SYSTEM_PROMPT } from "@/lib/prompts";
import { getPostHogClient } from "@/lib/posthog-server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Persistent rate limiter: 100 messages per IP per 24h, survives deploys.
// Only created when Upstash is configured; otherwise we fall back to the
// in-memory limiter below so the paid LLM endpoint is never unlimited.
const chatRatelimit =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(100, "24 h"),
        prefix: "drytrip:chat",
      })
    : null;

// Fallback: per-instance in-memory limit (stricter than Upstash, 40/IP/24h).
// Not shared across serverless instances, but caps runaway use if Upstash is down.
const FALLBACK_LIMIT = 40;
const fallbackHits = new Map<string, number[]>();
function fallbackAllowed(ip: string): boolean {
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const hits = (fallbackHits.get(ip) ?? []).filter((t) => t > dayAgo);
  if (hits.length >= FALLBACK_LIMIT) {
    fallbackHits.set(ip, hits);
    return false;
  }
  hits.push(now);
  fallbackHits.set(ip, hits);
  if (fallbackHits.size > 5000) fallbackHits.clear(); // bound memory
  return true;
}

export async function POST(req: NextRequest) {
  // Block cross-origin requests (CSRF protection)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && new URL(origin).host !== host) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Prefer x-real-ip (set by Vercel's infrastructure, not spoofable by clients)
  const ip =
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  const distinctId =
    req.headers.get("x-posthog-distinct-id") || ip;

  const posthog = getPostHogClient();

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || JSON.stringify(messages).length > 50_000) {
      return new Response(JSON.stringify({ error: "Message too long." }), {
        status: 413,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Session-level rate limit (20 messages per session)
    if (messages.length > 20) {
      posthog.capture({
        distinctId,
        event: "chat_rate_limited",
        properties: { scope: "session_messages", message_count: messages.length },
      });
      return new Response(
        JSON.stringify({
          error:
            "You've been busy planning! Start a new conversation to keep exploring.",
        }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }

    // IP-level rate limit (100 messages per IP per 24h, persists across deploys)
    let ipAllowed = true;
    try {
      if (!chatRatelimit) throw new Error("Upstash not configured");
      ({ success: ipAllowed } = await chatRatelimit.limit(ip));
    } catch (rateLimitErr) {
      // Upstash unreachable or not configured — use the in-memory fallback
      // instead of letting the request through unlimited.
      console.error("[chat] rate limit check failed, using fallback:", rateLimitErr);
      ipAllowed = fallbackAllowed(ip);
    }
    {
      if (!ipAllowed) {
        posthog.capture({
          distinctId,
          event: "chat_rate_limited",
          properties: { scope: "ip_daily", ip },
        });
        return new Response(
          JSON.stringify({
            error: "You've hit the daily limit. Come back tomorrow to keep planning.",
          }),
          { status: 429, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Fetch published London venues (London-only launch; expand when more cities are audited)
    const { data: venues, error: venueError } = await supabaseAdmin
      .from("venues")
      .select(
        "name, slug, neighborhood, city, category, dry_score, top_na_drink, vibe_tags, hours_note, booking_url, website_url"
      )
      .eq("status", "Published")
      .eq("city", "London");

    if (venueError) {
      console.error("[chat] venue fetch failed:", venueError.message);
      return new Response(
        JSON.stringify({ error: "Unable to load venue data — please try again." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    const venueContext = venues
      ? JSON.stringify(
          venues.map((v) => ({
            name: v.name,
            slug: v.slug,
            neighborhood: v.neighborhood,
            city: v.city,
            category: v.category,
            dry_score: v.dry_score,
            top_na_drink: v.top_na_drink,
            vibe_tags: v.vibe_tags,
            hours_note: v.hours_note,
            booking_url: v.booking_url || v.website_url || null,
          }))
        )
      : "[]";

    const result = streamText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      system: `${TRIP_PLANNER_SYSTEM_PROMPT}\n\n## Current venue data (${venues?.length ?? 0} individually audited London venues)\n${venueContext}`,
      messages: await convertToModelMessages(messages),
      maxOutputTokens: 2000,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[chat] error:", errMsg, err);
    posthog.capture({
      distinctId,
      event: "chat_request_errored",
      properties: {
        message: errMsg,
      },
    });
    posthog.captureException(err instanceof Error ? err : new Error(String(err)), distinctId);
    // Include error type (not full message) for debugging — safe to expose
    const errorType = err instanceof Error ? err.constructor.name : "UnknownError";
    return new Response(
      JSON.stringify({ error: `Something went wrong (${errorType}) — please try again.` }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
