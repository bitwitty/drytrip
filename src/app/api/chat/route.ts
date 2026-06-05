import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { TRIP_PLANNER_SYSTEM_PROMPT } from "@/lib/prompts";
import { getPostHogClient } from "@/lib/posthog-server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Persistent rate limiter: 100 messages per IP per 24h, survives deploys
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "24 h"),
  prefix: "drytrip:chat",
});

export async function POST(req: NextRequest) {
  // Block cross-origin requests (CSRF protection)
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (origin && host && !origin.endsWith(host)) {
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

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    posthog.capture({
      distinctId,
      event: "chat_rate_limited",
      properties: { scope: "ip_daily", ip },
    });
    return new Response(
      JSON.stringify({
        error: "You've been busy planning! Come back tomorrow for more recommendations.",
      }),
      { status: 429, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const { messages } = await req.json();

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

    // Fetch published London venues (London-only launch; expand when more cities are audited)
    const { data: venues } = await supabaseAdmin
      .from("venues")
      .select(
        "name, slug, neighborhood, city, category, dry_score, top_na_drink, short_description, vibe_tags, price_range, hours_note, ai_context, booking_url, website_url"
      )
      .eq("status", "Published")
      .eq("city", "London");

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
            short_description: v.short_description,
            vibe_tags: v.vibe_tags,
            price_range: v.price_range,
            hours_note: v.hours_note,
            ai_context: v.ai_context,
            has_booking: !!(v.booking_url || v.website_url),
          }))
        )
      : "[]";

    const result = streamText({
      model: anthropic("claude-sonnet-4-5-20250929"),
      system: `${TRIP_PLANNER_SYSTEM_PROMPT}\n\n## Current venue data (${venues?.length ?? 0} individually audited London venues)\n${venueContext}`,
      messages: await convertToModelMessages(messages),
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
    return new Response(
      JSON.stringify({ error: errMsg }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
