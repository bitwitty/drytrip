import { anthropic } from "@ai-sdk/anthropic";
import { streamText, convertToModelMessages } from "ai";
import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { TRIP_PLANNER_SYSTEM_PROMPT } from "@/lib/prompts";
import { getPostHogClient } from "@/lib/posthog-server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/admin-auth";

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

// ---- Output rule check ---------------------------------------------------
// Scans each finished answer for brand-rule breaches and logs them to
// planner_rule_flags (service role only). Logging only; answers aren't altered.
const RULES: { rule: string; re: RegExp }[] = [
  { rule: "price", re: /£\s?\d|\$\s?\d|\bcheap\b|expensive|affordab|value for money|happy hour|minimum spend/i },
  { rule: "banned-brand", re: /seedlip|opius|midi ruby|smiling wolf|martini vibrante|cleanco|real drinks|everleaf|lyre'?s|caleño|caleno|feragaia/i },
  { rule: "award-claim", re: /michelin|award-winning|world'?s (best|50)|\bstarred\b/i },
];
async function logRuleBreaches(model: string, text: string) {
  try {
    const rows = RULES.flatMap(({ rule, re }) => {
      const i = text.search(re);
      return i === -1 ? [] : [{ model, rule, excerpt: text.slice(Math.max(0, i - 80), i + 80) }];
    });
    if (rows.length === 0) return;
    console.warn("[chat] rule-check", JSON.stringify(rows));
    await supabaseAdmin.from("planner_rule_flags").insert(rows);
  } catch (e) {
    console.error("[chat] rule-check logging failed", e);
  }
}

// ---- Venue context cache -------------------------------------------------
const VENUE_TTL_MS = 5 * 60 * 1000;
let venueCache: {
  at: number;
  venueContext: string;
  venueCount: number;
  closedByDay: Record<string, string[]>;
} | null = null;

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

async function getVenueContext() {
  if (venueCache && Date.now() - venueCache.at < VENUE_TTL_MS) return venueCache;
  // Fetch published London venues (London-only launch; expand when more cities are audited)
  const { data: venues, error } = await supabaseAdmin
    .from("venues")
    .select(
      "name, slug, neighborhood, city, category, dry_score, top_na_drink, planner_note, vibe_tags, hours_note, closed_days, booking_url, website_url"
    )
    .eq("status", "Published")
    .eq("city", "London")
    .order("slug"); // stable order keeps the prompt byte-identical for caching
  if (error) throw new Error(error.message);
  const venueContext = JSON.stringify(
    (venues ?? []).map((v) => ({
      name: v.name,
      slug: v.slug,
      neighborhood: v.neighborhood,
      city: v.city,
      category: v.category,
      dry_score: v.dry_score,
      top_na_drink: v.top_na_drink,
      review_note: v.planner_note,
      vibe_tags: v.vibe_tags,
      hours_note: v.hours_note,
      closed_days: v.closed_days,
      booking_url: v.booking_url || v.website_url || null,
    }))
  );
  // Map each weekday to the venues that are closed that day (from closed_days)
  const closedByDay: Record<string, string[]> = {};
  for (const v of venues ?? []) {
    if (!v.closed_days || (v.dry_score ?? 0) < 3) continue;
    const lower = String(v.closed_days).toLowerCase();
    for (const d of WEEKDAYS) {
      if (lower.includes(d)) (closedByDay[d] ??= []).push(v.name as string);
    }
  }
  venueCache = { at: Date.now(), venueContext, venueCount: venues?.length ?? 0, closedByDay };
  return venueCache;
}

// Work out which weekdays the user's request is about (named days, ranges,
// "weekend", "today/tonight", "tomorrow"), using London time for relative days.
function daysInRequest(text: string): string[] {
  const t = text.toLowerCase();
  const found = new Set<string>();
  for (const d of WEEKDAYS) if (new RegExp(`\\b${d}s?\\b`).test(t)) found.add(d);
  const range = t.match(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\s+(?:to|through|until|till|-|–)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (range) {
    let i = WEEKDAYS.indexOf(range[1]);
    const end = WEEKDAYS.indexOf(range[2]);
    for (let n = 0; n < 7; n++) { found.add(WEEKDAYS[i]); if (i === end) break; i = (i + 1) % 7; }
  }
  // Trip spans like "land Saturday … leave Monday": include the days in between
  if (/\b(land|arriv|leav|depart|fly out|flying|until|through)/.test(t)) {
    const mentioned = [...t.matchAll(/\b(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/g)].map((m) => m[1]);
    if (mentioned.length >= 2) {
      let i = WEEKDAYS.indexOf(mentioned[0]);
      const end = WEEKDAYS.indexOf(mentioned[mentioned.length - 1]);
      for (let n = 0; n < 7; n++) { found.add(WEEKDAYS[i]); if (i === end) break; i = (i + 1) % 7; }
    }
  }
  if (/\bweekend\b/.test(t)) ["friday", "saturday", "sunday"].forEach((d) => found.add(d));
  const londonToday = new Date().toLocaleDateString("en-GB", { weekday: "long", timeZone: "Europe/London" }).toLowerCase();
  const ti = WEEKDAYS.indexOf(londonToday);
  if (ti >= 0 && /\b(today|tonight|this evening|this afternoon)\b/.test(t)) found.add(WEEKDAYS[ti]);
  if (ti >= 0 && /\btomorrow\b/.test(t)) found.add(WEEKDAYS[(ti + 1) % 7]);
  return WEEKDAYS.filter((d) => found.has(d));
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

    // Venue list changes rarely; cache it per server instance for 5 minutes
    // so each question doesn't wait on a database round trip.
    let venueContext: string;
    let venueCount: number;
    let closedByDay: Record<string, string[]>;
    try {
      ({ venueContext, venueCount, closedByDay } = await getVenueContext());
    } catch (venueErr) {
      console.error("[chat] venue fetch failed:", venueErr);
      return new Response(
        JSON.stringify({ error: "Unable to load venue data — please try again." }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      );
    }

    // Default model: Haiku (about 2x faster, fewer rule breaches in the Sept 2026 A/B test).
    // A logged-in admin can still request Sonnet via the x-planner-model header to compare.
    let modelId = "claude-haiku-4-5";
    if (
      req.headers.get("x-planner-model") === "sonnet" &&
      (await isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value))
    ) {
      modelId = "claude-sonnet-4-5-20250929";
    }

    const result = streamText({
      model: anthropic(modelId),
      messages: [
        {
          // The system prompt + venue list is identical across requests, so mark it
          // cacheable: Anthropic reuses it instead of re-reading ~7k tokens each time
          // (faster first word, ~90% cheaper input on cache hits).
          role: "system",
          content: `${TRIP_PLANNER_SYSTEM_PROMPT}\n\n## Current venue data (${venueCount} individually audited London venues)\n${venueContext}`,
          providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
        },
        // Per-request closed-venue list for the days this conversation mentions.
        // Kept short and next to the question so the model can't miss it.
        ...(() => {
          const userText = messages
            .filter((m: { role?: string }) => m.role === "user")
            .map((m: { parts?: { type: string; text?: string }[] }) =>
              (m.parts ?? []).map((p) => (p.type === "text" ? p.text ?? "" : "")).join(" ")
            )
            .join(" ");
          const lines = daysInRequest(userText)
            .filter((d) => closedByDay[d]?.length)
            .map((d) => `- ${d[0].toUpperCase() + d.slice(1)}: ${closedByDay[d].join(", ")}`);
          if (lines.length === 0) return [];
          return [{
            role: "system" as const,
            content: `## CLOSED — hard rule for this request\nThese venues are closed on these days. Do NOT place any of them on the listed day; choose a different venue instead:\n${lines.join("\n")}`,
          }];
        })(),
        ...(await convertToModelMessages(messages)),
      ],
      maxOutputTokens: 2000,
      temperature: 0.3, // lower = less embellishment beyond the venue data
      onFinish: ({ usage, providerMetadata, text }) => {
        void logRuleBreaches(modelId, text);
        // Visible in Vercel runtime logs — confirms whether prompt caching is hitting.
        const a = (providerMetadata?.anthropic ?? {}) as Record<string, unknown>;
        console.log("[chat] usage", JSON.stringify({
          model: modelId,
          input: usage.inputTokens,
          output: usage.outputTokens,
          cachedInput: usage.cachedInputTokens,
          cacheCreation: a.cacheCreationInputTokens,
        }));
      },
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
