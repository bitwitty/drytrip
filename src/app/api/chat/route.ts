import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { TRIP_PLANNER_SYSTEM_PROMPT } from "@/lib/prompts";
import { getPostHogClient } from "@/lib/posthog-server";

// Simple in-memory rate limiter
const rateLimits = new Map<string, number[]>();

function checkRateLimit(ip: string): { allowed: boolean; message?: string } {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  const timestamps = rateLimits.get(ip) || [];
  const recent = timestamps.filter((t) => now - t < dayMs);

  if (recent.length >= 100) {
    return {
      allowed: false,
      message:
        "You've been busy planning! Come back tomorrow for more recommendations.",
    };
  }

  recent.push(now);
  rateLimits.set(ip, recent);
  return { allowed: true };
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const distinctId =
    req.headers.get("x-posthog-distinct-id") || ip;

  const posthog = getPostHogClient();

  const rateCheck = checkRateLimit(ip);
  if (!rateCheck.allowed) {
    posthog.capture({
      distinctId,
      event: "chat_rate_limited",
      properties: { scope: "ip_daily", ip },
    });
    return new Response(JSON.stringify({ error: rateCheck.message }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    });
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

    // Fetch all published venues across all cities
    const { data: venues } = await supabaseAdmin
      .from("venues")
      .select(
        "name, slug, neighborhood, city, category, dry_score, top_na_drink, short_description, vibe_tags, price_range, hours_note, ai_context, booking_url, website_url"
      )
      .eq("status", "Published");

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
      system: `${TRIP_PLANNER_SYSTEM_PROMPT}\n\n## Current venue data (${venues?.length ?? 0} verified venues across all cities)\n${venueContext}`,
      messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    posthog.capture({
      distinctId,
      event: "chat_request_errored",
      properties: {
        message: err instanceof Error ? err.message : String(err),
      },
    });
    posthog.captureException(err instanceof Error ? err : new Error(String(err)), distinctId);
    return new Response(
      JSON.stringify({ error: "Something went wrong. Please try again." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
