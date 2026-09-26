import { anthropic } from "@ai-sdk/anthropic";
import { generateText, convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, type ModelMessage } from "ai";
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
  closedSlugsByDay: Record<string, Record<string, string>>;
  bySlug: Record<string, Record<string, unknown>>;
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
  const records = (venues ?? []).map((v) => ({
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
    }));
  const venueContext = JSON.stringify(records);
  const bySlug: Record<string, Record<string, unknown>> = {};
  for (const r of records) bySlug[r.slug as string] = r;
  // Map each weekday to the venues that are closed that day (from closed_days)
  const closedByDay: Record<string, string[]> = {};
  const closedSlugsByDay: Record<string, Record<string, string>> = {};
  for (const v of venues ?? []) {
    if (!v.closed_days) continue;
    const lower = String(v.closed_days).toLowerCase();
    for (const d of WEEKDAYS) {
      if (!lower.includes(d)) continue;
      (closedSlugsByDay[d] ??= {})[v.slug as string] = v.name as string;
      if ((v.dry_score ?? 0) >= 3) (closedByDay[d] ??= []).push(v.name as string);
    }
  }
  venueCache = { at: Date.now(), venueContext, venueCount: venues?.length ?? 0, closedByDay, closedSlugsByDay, bySlug };
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

// ---- Itinerary validation -------------------------------------------------
// Finds venues placed under a day heading on which they're closed.
type Violation = { day: string; slug: string; name: string };
function findClosedViolations(text: string, closedSlugsByDay: Record<string, Record<string, string>>): Violation[] {
  let day: string | null = null;
  const out: Violation[] = [];
  for (const line of text.split("\n")) {
    const h = line.match(/^#{1,2}\s+(.*)$/);
    if (h) {
      const d = WEEKDAYS.find((w) => h[1].toLowerCase().includes(w));
      if (d) day = d;
    }
    const link = line.match(/\/venues\/([a-z0-9-]+)\)/);
    if (link && day && closedSlugsByDay[day]?.[link[1]]) {
      out.push({ day, slug: link[1], name: closedSlugsByDay[day][link[1]] });
    }
  }
  return out;
}
// Last resort: drop the ### card of any venue that's still on a closed day.
function removeClosedCards(text: string, closedSlugsByDay: Record<string, Record<string, string>>): string {
  const lines = text.split("\n");
  const keep: string[] = [];
  let day: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const h = lines[i].match(/^#{1,2}\s+(.*)$/);
    if (h) {
      const d = WEEKDAYS.find((w) => h[1].toLowerCase().includes(w));
      if (d) day = d;
    }
    if (lines[i].startsWith("### ")) {
      let j = i + 1;
      while (j < lines.length && !/^#{1,3}\s/.test(lines[j])) j++;
      const block = lines.slice(i, j);
      const link = block.join("\n").match(/\/venues\/([a-z0-9-]+)\)/);
      if (link && day && closedSlugsByDay[day]?.[link[1]]) { i = j - 1; continue; }
      keep.push(...block);
      i = j - 1;
      continue;
    }
    keep.push(lines[i]);
  }
  return keep.join("\n");
}
const cap = (d: string) => d[0].toUpperCase() + d.slice(1);

// ---- Fact-check pass ------------------------------------------------------
// The finished answer is split into numbered sentences, each tagged with the
// venue card it belongs to. A second model call judges every sentence against
// that venue's record only; the code then applies its fixes, so headings,
// links and structure can't be damaged. Dry Score lines are corrected in code.
const FACT_CHECK_PROMPT = `You are a strict fact-checker for Dry Trip, a guide to alcohol-free drinking in London.
You get the database records for some venues, then a numbered list of sentences from a draft answer. Each sentence is tagged with the venue it is about, or "general".

The records are the ONLY source of truth. Judge every sentence:
- S = every claim in it is stated in, or plainly implied by, that venue's record (review_note, top_na_drink, vibe_tags, category, neighborhood, hours_note, closed_days).
- U = it contains anything the record does not say.

Opinions, impressions and evaluations are claims too. Words like "precise", "crafted with care", "serious", "proper", "not an afterthought", "on equal footing", "feels unremarkable", "punches above", "date-night ready", "no fuss", "open late", "designed to match the food", "changes with the menu", "relaxed", "romantic" are U unless the record says the same thing.
Food, décor, views, service, staff, history, awards, hours, days, ingredients, flavours and comparisons must all be in the record. A drink's ingredients must match the record exactly.
"general" sentences: S if they only frame the answer (e.g. "Here are three picks", "Want a full evening plan?") or state something true of the named venues' records; U if they make any other claim.
Any price, cost or value wording, or directions/walking times: U.

Output one line per sentence, in order, nothing else:
<number> S
<number> U | <rewritten sentence using only what the record says, same tone — or leave empty after the bar to delete it>`;

type Piece = { n: number; line: number; text: string; slug: string | null };

function splitForCheck(draft: string) {
  const lines = draft.split("\n");
  const pieces: Piece[] = [];
  const skip = new Set<number>();
  let slug: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,2}\s/.test(l)) { slug = null; continue; }
    if (l.startsWith("### ")) {
      // Card: find its slug from the review link further down the block
      let j = i + 1;
      while (j < lines.length && !/^#{1,3}\s/.test(lines[j])) j++;
      slug = lines.slice(i, j).join("\n").match(/\/venues\/([a-z0-9-]+)\)/)?.[1] ?? null;
      continue;
    }
    if (/\]\(\/venues\//.test(l)) { skip.add(i); slug = null; continue; } // link row ends the card
    if (!l.trim() || /^\*\*Dry Score/.test(l) || /^\s*\[/.test(l) || l.trim() === "---") { skip.add(i); continue; }
    for (const s of l.split(/(?<=[.!?])\s+(?=["'“A-Z])/)) {
      if (s.trim()) pieces.push({ n: pieces.length + 1, line: i, text: s.trim(), slug });
    }
  }
  return { lines, pieces };
}

// Put each card's Dry Score line back in line with the database.
function fixScoreLines(text: string, bySlug: Record<string, Record<string, unknown>>) {
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].startsWith("### ")) continue;
    let j = i + 1;
    while (j < lines.length && !/^#{1,3}\s/.test(lines[j])) j++;
    const slug = lines.slice(i, j).join("\n").match(/\/venues\/([a-z0-9-]+)\)/)?.[1];
    const rec = slug ? bySlug[slug] : undefined;
    if (!rec) continue;
    for (let k = i + 1; k < j; k++) {
      if (/^\*\*Dry Score/.test(lines[k])) {
        lines[k] = `**Dry Score: ${rec.dry_score}/5** — ${rec.neighborhood}`;
        break;
      }
    }
  }
  return lines.join("\n");
}

// A card whose whole description was removed gets the venue's vetted note instead.
function refillEmptyCards(text: string, bySlug: Record<string, Record<string, unknown>>) {
  const lines = text.split("\n");
  const out: string[] = [];
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    if (!lines[i].startsWith("### ")) continue;
    // The card runs to its review-link row (or the next heading)
    let j = i + 1;
    while (j < lines.length && !/^#{1,3}\s/.test(lines[j])) {
      j++;
      if (/\]\(\/venues\//.test(lines[j - 1])) break;
    }
    const block = lines.slice(i + 1, j);
    const slug = block.join("\n").match(/\/venues\/([a-z0-9-]+)\)/)?.[1];
    const note = slug ? (bySlug[slug]?.review_note as string | undefined) : undefined;
    const hasBody = block.some((l) => l.trim() && !/^\*\*Dry Score/.test(l) && !/^\s*\[/.test(l) && !/\]\(\/venues\//.test(l));
    if (hasBody || !note) continue;
    for (const b of block) {
      out.push(b);
      if (/^\*\*Dry Score/.test(b)) out.push("", note);
    }
    i = j - 1;
  }
  return out.join("\n").replace(/\n{3,}/g, "\n\n");
}

async function factCheck(
  modelId: string,
  draft: string,
  bySlug: Record<string, Record<string, unknown>>
): Promise<{ text: string; changed: boolean }> {
  const scored = fixScoreLines(draft, bySlug);
  const slugs = [...new Set([...scored.matchAll(/\/venues\/([a-z0-9-]+)\)/g)].map((m) => m[1]))];
  const records = slugs.map((s) => bySlug[s]).filter(Boolean);
  if (records.length === 0) return { text: scored, changed: scored !== draft };
  const { lines, pieces } = splitForCheck(scored);
  if (pieces.length === 0) return { text: scored, changed: scored !== draft };
  try {
    const numbered = pieces
      .map((p) => `${p.n} [${p.slug ? (bySlug[p.slug]?.name as string) ?? p.slug : "general"}] ${p.text}`)
      .join("\n");
    const { text: out } = await generateText({
      model: anthropic(modelId),
      system: FACT_CHECK_PROMPT,
      messages: [{
        role: "user",
        content: `## Venue records\n${JSON.stringify(records, (k, v) => (k === "booking_url" || k === "slug" || k === "city" ? undefined : v))}\n\n## Sentences\n${numbered}`,
      }],
      maxOutputTokens: 1500,
      temperature: 0,
    });
    const fixes = new Map<number, string>();
    for (const row of out.split("\n")) {
      const m = row.trim().match(/^(\d+)\s+U\s*(?:\|\s*(.*))?$/);
      if (m) fixes.set(Number(m[1]), (m[2] ?? "").trim());
    }
    if (fixes.size === 0) return { text: scored, changed: scored !== draft };
    // Safety: if the checker wants to delete most of the answer, something went wrong — keep it
    const deletions = [...fixes.values()].filter((f) => !f).length;
    if (deletions > pieces.length * 0.6) {
      console.warn("[chat] fact-check rejected (too many deletions)", deletions, pieces.length);
      return { text: scored, changed: scored !== draft };
    }
    const newLines = [...lines];
    const byLine = new Map<number, Piece[]>();
    for (const p of pieces) byLine.set(p.line, [...(byLine.get(p.line) ?? []), p]);
    for (const [ln, ps] of byLine) {
      if (!ps.some((p) => fixes.has(p.n))) continue;
      newLines[ln] = ps
        .map((p) => (fixes.has(p.n) ? fixes.get(p.n)! : p.text))
        .filter(Boolean)
        .join(" ");
    }
    // Drop lines emptied by deletions, and collapse the blank lines they leave
    let text = newLines
      .filter((l, i) => !(byLine.has(i) && !l.trim()))
      .join("\n")
      .replace(/\n{3,}/g, "\n\n");
    text = refillEmptyCards(text, bySlug);
    console.warn("[chat] fact-check changed", JSON.stringify(
      [...fixes].map(([n, f]) => ({ was: pieces[n - 1]?.text, now: f || "(removed)" }))
    ));
    return { text, changed: true };
  } catch (e) {
    console.error("[chat] fact-check failed, sending draft", e);
    return { text: scored, changed: scored !== draft };
  }
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
    let closedSlugsByDay: Record<string, Record<string, string>>;
    let bySlug: Record<string, Record<string, unknown>>;
    try {
      ({ venueContext, venueCount, closedByDay, closedSlugsByDay, bySlug } = await getVenueContext());
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

    // Which weekdays does this conversation ask about?
    const userText = messages
      .filter((m: { role?: string }) => m.role === "user")
      .map((m: { parts?: { type: string; text?: string }[] }) =>
        (m.parts ?? []).map((p) => (p.type === "text" ? p.text ?? "" : "")).join(" ")
      )
      .join(" ");
    const requestDays = daysInRequest(userText);
    const closedLines = requestDays
      .filter((d) => closedByDay[d]?.length)
      .map((d) => `- ${cap(d)}: ${closedByDay[d].join(", ")}`);
    const closedNotice: ModelMessage[] = closedLines.length
      ? [{
          role: "system",
          content: `## CLOSED — hard rule for this request\nThese venues are closed on these days. Do NOT place any of them on the listed day; choose a different venue instead:\n${closedLines.join("\n")}`,
        }]
      : [];

    // Every answer is written in full, checked, and only then sent:
    //  1. day-specific requests: check each venue against its closed days, retry once, strip leftovers
    //  2. all answers: a fact-check pass against the cited venues' own records
    const baseMessages = [
      {
        // The system prompt + venue list is identical across requests, so mark it
        // cacheable: Anthropic reuses it instead of re-reading ~7k tokens each time.
        role: "system" as const,
        content: `${TRIP_PLANNER_SYSTEM_PROMPT}\n\n## Current venue data (${venueCount} individually audited London venues)\n${venueContext}`,
        providerOptions: { anthropic: { cacheControl: { type: "ephemeral" as const } } },
      },
      ...closedNotice,
      ...(await convertToModelMessages(messages)),
    ] as ModelMessage[];
    const gen = async (msgs: ModelMessage[]) => {
      const r = await generateText({
        model: anthropic(modelId),
        messages: msgs,
        maxOutputTokens: 2000,
        temperature: 0.3, // lower = less embellishment beyond the venue data
      });
      const a = (r.providerMetadata?.anthropic ?? {}) as Record<string, unknown>;
      console.log("[chat] usage", JSON.stringify({
        model: modelId,
        input: r.usage.inputTokens,
        output: r.usage.outputTokens,
        cachedInput: r.usage.cachedInputTokens,
        cacheCreation: a.cacheCreationInputTokens,
      }));
      return r;
    };
    let { text } = await gen(baseMessages);
    if (closedLines.length) {
      let violations = findClosedViolations(text, closedSlugsByDay);
      if (violations.length) {
        const fix = violations.map((v) => `${v.name} is closed on ${cap(v.day)}`).join("; ");
        console.warn("[chat] closed-day violation, retrying:", fix);
        ({ text } = await gen([
          ...baseMessages,
          { role: "assistant", content: text },
          { role: "user", content: `Correction needed: ${fix}. Replace each with a different venue from the data that is open that day. Reply with the full corrected answer only — no mention of the correction.` },
        ]));
        violations = findClosedViolations(text, closedSlugsByDay);
      }
      if (violations.length) {
        console.warn("[chat] closed-day violation after retry, removing cards:", JSON.stringify(violations));
        text = removeClosedCards(text, closedSlugsByDay);
      }
    }
    ({ text } = await factCheck(modelId, text, bySlug));
    void logRuleBreaches(modelId, text);
    const finalText = text;
    const stream = createUIMessageStream({
      execute: ({ writer }) => {
        const id = "answer";
        writer.write({ type: "start" });
        writer.write({ type: "text-start", id });
        for (let i = 0; i < finalText.length; i += 60) {
          writer.write({ type: "text-delta", id, delta: finalText.slice(i, i + 60) });
        }
        writer.write({ type: "text-end", id });
        writer.write({ type: "finish" });
      },
    });
    return createUIMessageStreamResponse({ stream });
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
