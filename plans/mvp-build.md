---
planStatus:
  planId: plan-dry-trip-mvp
  title: Dry Trip MVP Build
  status: ready-to-launch
  planType: initiative
  priority: high
  owner: kat
  stakeholders: []
  tags:
    - mvp
    - ai-chat
    - data
    - directory
    - venues
    - map
    - multi-city
    - brand
  created: "2026-02-18"
  updated: "2026-03-09T12:00:00.000Z"
  progress: 98
---
# Dry Trip MVP Build Plan

> Build an AI-powered luxury travel planner for alcohol-free experiences. Users chat with an AI backed by verified London venue data, browse an interactive directory with map, and click through to book.

## Goal

A working product where a user can:
1. Chat with an AI that plans trips using verified London venue data
2. Browse a directory of London venues with real Dry Scores and an interactive map
3. Click into a venue detail page with NA highlights, descriptions, and booking links
4. Trust the data (methodology page, honest AI, never hallucinate)

**North star metric:** Completed itineraries with at least one booking click.

---

## Key Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| Launch city | London only | Existing data for other cities is unreliable. Commit fully to one city done well. Architecture supports multi-city expansion. |
| Data approach | Build a proper pipeline before launch | Old scraper produced 83% garbage. New pipeline: Google Places + menu/review scraping + Claude scoring + manual additions. |
| Pipeline output | Drafts written to Supabase | Kat reviews via visual admin page, edits in Supabase dashboard, flips to Published. |
| AI model | Claude Sonnet via Vercel AI SDK | 15x cheaper than Opus, excellent for structured recommendations. |
| Venue pages | SSG with ISR | SEO + speed, ~30-50 pages is trivial. |
| A/B testing | Killed | Not enough traffic for significance. Variant A copy is permanent. |
| Map provider | Mapbox GL JS | Brand-aligned styling (muted/editorial). Free tier 50K loads/month. Custom map style matches forest/linen/sandstone palette. |
| Map layout | Stacked (~350px on desktop), cards below | 30-40 venues don't justify split view. Stacked keeps the grid layout and lets the map breathe. |
| Mobile map | Fully collapsed with "Show Map" toggle | Mobile real estate too precious for a peek. When expanded, ~85vh with close button. |
| Directory routing | `/directory/[city]` with 301 redirect from `/directory` | SEO-ready for multi-city. Internal links point to `/directory/london`. |
| City selector | In page header, part of the title | City is higher-level context than category. Renders as "London ▾" dropdown. |
| Hero headline | "Clear-headed luxury travel" | Direct, premium, double-meaning. Pairs well with subhead. |
| "Sober" in UI copy | Drop from all in-product copy | Directory title, chat empty state, AI responses all avoid "sober." Keep in SEO meta and methodology page only. |
| Verified badge | Detail page sidebar only | On cards it's noise. Show "Last verified: Feb 2026" in sidebar, hide if >6 months old. |

---

## Competitive Context

Dry Trip competes against AI trip planners, not other sober travel companies. The real competition:
- **Layla.ai** — millions of users, $49.95/yr premium, end-to-end booking
- **Mindtrip** — backed by Amex Ventures, Capital One Ventures, United Airlines Ventures
- **ChatGPT / Google AI Mode** — unlimited resources, ambient threat

**Why Dry Trip wins:** None of them have verified alcohol-free data (they hallucinate), a proprietary Dry Score rating system, community identity ("built for us"), or spatial discovery (the map shows what chatbots can't).

Every feature should reinforce these advantages:
- Venue cards always show Dry Score — it's the brand symbol
- The map is not optional — it's visual proof this isn't just another chatbot
- "Never hallucinate" is the core brand promise, reinforced at every touchpoint
- The AI personality matters — knowledgeable insider, not search engine

---

## Venues Schema

```sql
-- Core identity
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
name            TEXT NOT NULL
slug            TEXT UNIQUE NOT NULL          -- for /venues/[slug]
city            TEXT NOT NULL                 -- "London" for MVP
country         TEXT NOT NULL
category        TEXT NOT NULL                 -- Hotel / Restaurant / Bar
neighborhood    TEXT                          -- "Soho", "Shoreditch" etc.

-- Dry Score data
dry_score       INTEGER CHECK (1-5)
top_na_drink    TEXT
na_drink_count  INTEGER                      -- how many NA options
description     TEXT                          -- pipeline-generated analysis
short_description TEXT                       -- human-written pitch (~100 chars)

-- Links
website_url     TEXT
menu_url        TEXT
booking_url     TEXT                          -- affiliate link (revenue path)
image_url       TEXT

-- Features
af_minibar      BOOLEAN DEFAULT false
zero_proof_pairing BOOLEAN DEFAULT false
vibe_tags       TEXT[]                        -- ["rooftop","date-night","cozy"]
price_range     TEXT                          -- $ / $$ / $$$ / $$$$
hours_note      TEXT                          -- "Open late weekends"

-- Pipeline & review
google_place_id TEXT
status          TEXT DEFAULT 'Draft'          -- Draft / Published / Rejected
notes           TEXT                          -- internal review comments
featured        BOOLEAN DEFAULT false         -- editorial picks / sponsored

-- Verification & source
source          TEXT DEFAULT 'manual'         -- 'manual' | 'pipeline' | 'community'
last_verified   DATE                          -- when data was last confirmed accurate
verified_by     TEXT                          -- 'kat' | 'pipeline' | 'community'

-- AI context
ai_context      TEXT                          -- notes injected into system prompt

-- Location
latitude        FLOAT
longitude       FLOAT

-- Timestamps
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

**Why these fields matter:**
- `neighborhood` — the AI needs this to build walkable day plans
- `short_description` — pipeline descriptions read like rubrics; AI chat needs a human pitch
- `booking_url` — separate from website_url; this is the affiliate revenue path
- `vibe_tags` — enables prompts like "find me a cozy bar for a date night"
- `na_drink_count` — structured signal vs inconsistent description mentions
- `ai_context` — nuance notes ("great for groups but loud on weekends")
- `featured` — maps to the Featured/Sponsored Listings revenue stream
- `lat/lng` — required for the interactive map and proximity-based recommendations
- `source` / `last_verified` / `verified_by` — trust infrastructure; "Verified Feb 2026" badge on detail pages

### Reviews Table (Stub — No UI)

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  author_name TEXT,
  author_email TEXT,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT now()
);
```

Schema-only. No review UI in this build. Exists so the data model is ready when community features launch.

---

## Image & Visual Strategy

**Decision: Launch without venue photos. Restraint is luxury.**

| Surface | Approach | Details |
| --- | --- | --- |
| Directory cards | Typography-only | Big serif name is the hero. Category label in tracked-out uppercase. Generous padding. |
| Venue detail pages | Dark typographic hero | Full-width forest green band with linen type. Dry Score prominent. |
| AI chat cards | Typography-only, always | Compact inline format: category tag, name, score, top drink. Concierge tone. |
| Category coding | Thin accent line at card top | Subtle color variation by category. |

**When photos are added (post-MVP):**
- Hire one photographer for 2-3 day London sprint (~800-1500 GBP)
- Style guide: natural light, warm-toned, interiors over exteriors, slightly desaturated film look
- Aspect ratio: 4:3 for cards, 16:9 for heroes
- Format: WebP with JPEG fallback, lazy-loaded

---

## Build Phases

### Phase 0: Venue Research Pipeline ✓
**Goal:** Build a reliable pipeline that discovers, scrapes, and scores venues. Curate ~30-40 publishable London venues.
**Estimate:** 3-4 days
**Status:** DONE

#### 0.1 Build the Pipeline

Create `scripts/pipeline.ts` that:
1. **Discovery:** Takes a city + category, queries Google Places API for top venues
2. **Scraping:** For each venue, scrapes website/menu pages for NA offerings
3. **Review mining:** Pulls Google reviews mentioning "mocktail", "non-alcoholic" for extra signal
4. **Scoring:** Sends all collected data to Claude to generate: dry_score, top_na_drink, na_drink_count, description, vibe_tags
5. **Output:** Upserts results into Supabase as `status: 'Draft'`
6. **Slug generation:** `kebab-case(name)-kebab-case(city)`. Deduplicate with numeric suffix. Slugs are immutable.

Also accepts manual venue additions via `scripts/add-venue.ts`.

#### 0.2 Evolve Supabase Schema

Run migration SQL with full venues schema + venue_clicks table + reviews table stub + verification fields.

#### 0.3 Run Pipeline on London

Execute for Bars, Restaurants, Hotels. Review output quality. Iterate on scoring prompt.

#### 0.4 Manual Enrichment

For venues with likely good NA programs, manually research and add/update.

**Target:** ~30-40 Published venues with `short_description` and `vibe_tags` filled in.

#### 0.5 Lock Down Google API Key

Restrict in Google Cloud Console (HTTP referrer restrictions, Places API only).

#### 0.6 Backfill Lat/Lng Coordinates

Run `scripts/backfill-coords.ts` to ensure 100% of Published venues have latitude and longitude. **Gate:** Map cannot ship until this is complete.

#### 0.7 Set Initial Verification Data

Bulk update all Published venues:
```sql
UPDATE venues SET last_verified = CURRENT_DATE, verified_by = 'kat', source = 'pipeline' WHERE status = 'Published';
```

**Phase 0 quality gate:** At least 25 Published venues with `short_description`, `vibe_tags`, and lat/lng filled in.

#### 0.8 Phase 0 Testing Checklist

- [ ] Pipeline runs end-to-end without errors for at least one category
- [ ] At least one venue upserted to Supabase with correct schema fields
- [ ] `dry_score` values are integers 1-5
- [ ] Slugs generated correctly in `name-city` kebab-case format
- [ ] Duplicate slug deduplication works
- [ ] Manual venue addition flow works
- [ ] 25+ venues have `short_description` and `vibe_tags` and are Published
- [ ] 100% of Published venues have `latitude` and `longitude`
- [ ] `reviews` table exists with correct constraints
- [ ] `source`, `last_verified`, `verified_by` columns exist on venues
- [ ] No API keys logged to console or files
- [ ] Google API key restrictions applied

**Phase 0 deliverable:** Working pipeline, 30-40 curated London venues, full schema with reviews stub and verification fields, coords backfilled.

---

### Phase 1: Core Product Pages ✓
**Goal:** Build the pages users interact with, including the interactive map.
**Estimate:** 4-6 days (includes map)
**Status:** DONE

#### 1.1 Extract Shared Layout + Design Tokens
**Status:** DONE

Extract Nav and Footer. Nav links: Home, Directory, Plan a Trip.

Design tokens in `globals.css`:
```css
--color-amber: #C4963C;     /* booking CTAs, featured badges, hotel map pins */
--color-sage: #7A8B6F;      /* success, positive indicators, restaurant map pins */
--color-clay: #B85C38;      /* errors, warnings */
--color-mist: #E8E4DD;      /* borders, dividers, subtle bg */
```

Component radius system: cards `rounded-2xl`, buttons `rounded-lg`, pills `rounded-full`.

Install PostHog and add provider wrapper.

#### 1.2 Kill A/B Testing
**Status:** DONE

Removed. Variant A copy is permanent. Page server-renders for SEO.

#### 1.3 Directory Page
**Status:** DONE

Current state: `/directory` with category filter + sort by Dry Score. Needs to become `/directory/[city]` with city selector and map.

**Updated spec (see 1.8 and 1.9 below):**
- Route becomes `/directory/[city]` (starting with `/directory/london`)
- `/directory` 301 redirects to `/directory/london`
- City selector dropdown in page header: `"London ▾"` next to the title
- Title: `"London Venues"` with subtitle `"Rated for the quality of their alcohol-free experience."`
- Keep category filter (Hotel / Restaurant / Bar) and sort by Dry Score
- Interactive Mapbox map above the card grid (see Phase 1.10)
- CTA card at end of grid: "Not finding what you need? Plan a custom trip with our AI."

#### 1.4 Venue Detail Pages (`/venues/[slug]`)
**Status:** DONE (includes mini-map, verified badge, proximity-based related venues)

Server Component with `generateStaticParams`. `revalidate = 3600`.

Page structure:
1. Dark typographic hero (forest green band with linen type)
2. Venue name + category badge + neighborhood + city
3. Dry Score badge (prominent, with 1-sentence explanation)
4. Short description
5. "Why we recommend it" — 2-3 bullets
6. **Mini-map** showing venue location + nearby Dry Trip venues (see Phase 1.10)
7. Top NA drink spotlight
8. Key details sidebar: price range, hours, neighborhood, website, **"Last verified: Feb 2026"** badge
9. Booking CTA (`--color-amber`)
10. Related venues (using lat/lng proximity, falling back to neighborhood matching)

#### 1.5 Booking CTAs & Click Tracking
**Status:** DONE

CTA strategy: Route all outbound clicks through `/go/[venue-id]` for tracking. Category-specific language (Hotels: "Check Availability", Restaurants: "Reserve a Table", Bars: "Visit Website").

`venue_clicks` table tracks venue_id, source, timestamp, session_id.

#### 1.6 Methodology Page (`/methodology`)
**Status:** DONE

What is a Dry Score, how venues are rated, data collection methods, how to submit corrections.

#### 1.7 Phase 1.1-1.6 Testing Checklist
**Status:** DONE

All original Phase 1 checklist items passed.

#### 1.8 City-Slug Routing
**Status:** DONE

**Files:**
- `src/app/directory/[city]/page.tsx` (NEW — move directory logic here)
- `src/app/directory/page.tsx` (becomes 301 redirect)
- `src/components/Nav.tsx` (update directory link to `/directory/london`)
- `src/app/api/chat/route.ts` (accept optional `city` param, default "London")

**City selector in header:**
- Dropdown next to h1: `"London ▾ Venues"`
- At launch, only "London" in the list
- Visually: subtle, label-like — Montserrat small caps, forest/60 color, small chevron

**AI chat city-awareness:**
- Chat API route accepts optional `city` field, changes `.eq("city", "London")` to `.eq("city", city)`
- System prompt references "the provided city's venues" instead of hardcoding London

#### 1.9 Brand Copy Updates
**Status:** DONE

**Landing page hero** (`src/app/page.tsx`):
- Old: "Travel at full resolution."
- New: **"Clear-headed luxury travel."**
- Subhead: "AI-powered trip planning backed by verified alcohol-free venue data. No guesswork. No judgment. No hangovers."

**Chat empty state** (`src/app/plan/page.tsx`):
- Old: "Plan a sober-friendly trip"
- New: **"Where to next?"**
- Subhead: "Tell me where you're going. I'll find the best places that don't revolve around drinking."

**System prompt** (`src/lib/prompts.ts`):
- Add rule: "Never use the word 'sober' unless the user does first. Use 'alcohol-free', 'zero-proof', or just describe the venue naturally. The absence of alcohol is a feature, not an identity."
- Update opening to reference "exceptional alcohol-free experiences" instead of "sober-friendly trips"

**Directory title:**
- Old: "London Sober-Friendly Venues"
- New: **"London Venues"** with subtitle "Rated for the quality of their alcohol-free experience."

#### 1.10 Interactive Map (Phase 1.8 from Addendum)
**Status:** DONE
**Dependencies:** Phase 0 coords backfilled (0.6) ✓, city-slug routing done (1.8) ✓

**Install:**
```bash
npm install mapbox-gl
npm install -D @types/mapbox-gl
```

Add `NEXT_PUBLIC_MAPBOX_TOKEN` to `.env` and Vercel.

**Mapbox Studio custom style** based on `light-v11`:
- Land: linen-ish (#F5F2ED), Water: mist (#E8E4DD), Roads: sandstone/30, Labels: forest/40, Parks: sage/20

**`src/components/VenueMap.tsx`****:**

```typescript
interface VenueMapProps {
  venues: Venue[];
  center?: [number, number];   // [lng, lat]
  zoom?: number;               // 12 for city, 15 for detail
  highlightId?: string;        // venue to highlight
  interactive?: boolean;       // click popups (default true)
  className?: string;
}
```

Features:
- GeoJSON source + circle/symbol layer for all venues
- **Pin color by category:** Hotel = amber (#C4963C), Restaurant = sage (#7A8B6F), Bar = sandstone (#D9C5B2)
- **Pin size by Dry Score:** 5 = 12px, 4 = 10px, 3 = 8px, 1-2 = 6px
- **Clustering** at zoom < 13 with venue count
- **Click popup:** Venue name (serif, bold), Dry Score badge, category, top NA drink, "View Details →" link
- **Lazy loaded** via `dynamic()` with `ssr: false` (~200KB)

**Directory page integration** (`/directory/[city]`):
- Desktop: map above card grid, 350px, rounded-2xl, border-sandstone/30
- Category filter syncs with map (animate bounds to fit visible pins)
- Default: London center [-0.1276, 51.5074], zoom 11.5
- Mobile: collapsed by default, "Show Map" toggle in filter area, expands to ~85vh overlay with close button

**Venue detail page integration** (`/venues/[slug]`):
- 250px mini-map below "Why we recommend it"
- Venue as highlighted pin (larger, pulsing ring)
- Nearby Dry Trip venues as smaller pins
- `getRelatedVenues()` updated to use lat/lng proximity (Haversine/bounding box), falling back to neighborhood matching

**Verified badge** in detail page sidebar:
- "Last verified: February 2026" — only if `last_verified` exists and <6 months old
- Small, understated, same style as other detail items
- `CheckCircle` icon from lucide-react

#### 1.11 Phase 1 Testing Checklist (Updated)

**1.8 City-slug routing:**
- [ ] `/directory/london` loads correctly with all venues
- [ ] `/directory` 301 redirects to `/directory/london`
- [ ] City selector dropdown renders in page header
- [ ] Nav "Directory" link points to `/directory/london`
- [ ] AI chat route accepts optional `city` parameter
- [ ] AI chat still works correctly end-to-end
- [ ] No broken links (grep for `/directory"` without city slug)

**1.9 Brand copy:**
- [ ] Landing page hero says "Clear-headed luxury travel."
- [ ] Chat empty state says "Where to next?"
- [ ] Chat subtitle updated
- [ ] System prompt includes "never use sober" rule
- [ ] AI response avoids "sober" when user hasn't used it (manual test)
- [ ] Directory title says "London Venues" with alcohol-free subtitle

**1.10 Interactive map:**
- [ ] Map renders on `/directory/london` with all Published venue pins
- [ ] Pins color-coded by category (Hotel=amber, Restaurant=sage, Bar=sandstone)
- [ ] Pin click shows popup with name, Dry Score, category, top NA drink, "View Details" link
- [ ] Category filter updates map pins
- [ ] Pin clustering works when zoomed out
- [ ] Mobile: "Show Map" toggle shows/hides correctly
- [ ] Mobile: expanded map is ~85vh with close button
- [ ] Venue detail shows mini-map with location + nearby venues
- [ ] Mini-map nearby venues use lat/lng proximity
- [ ] Verified badge shows in detail sidebar (when last_verified <6 months old)
- [ ] No Mapbox token in server bundle
- [ ] `npm run build` passes
- [ ] Map lazy-loads (doesn't block initial page load)

**Phase 1 deliverable:** Directory at `/directory/london` with map, venue detail pages with mini-map + verified badge, city-slug routing, updated brand copy, methodology page, shared layout.

---

### Phase 2: AI Trip Planner (The Core Product) ✓
**Goal:** Build the conversational AI that makes Dry Trip a product, not a directory.
**Estimate:** 3-4 days
**Status:** DONE (2.1-2.3, 2.5 complete; 2.4 stretch deferred)

#### 2.1 Install Vercel AI SDK
**Status:** DONE

#### 2.2 Create API Route (`/api/chat/route.ts`)
**Status:** DONE (city-aware filtering, tone shift applied)

**Flow:**
```
User message
  -> Extract city/intent from message
  -> Query Supabase for matching venues (city, category, dry_score)
  -> Inject venue data + ai_context into Claude system prompt
  -> Stream response back to client
```

**System prompt** in `src/lib/prompts.ts`:

**AI voice:** Knowledgeable concierge meets editorial travel writer. Confident, specific, opinionated. Third person, not "I."

Example tone: "Lyaness is your best bet on the South Bank — they have a proper zero-proof programme, not just an afterthought. The Forest is the standout, made with clarified mushroom and birch sap. Worth booking ahead for a window seat."

**System prompt rules:**
- Only recommend venues from provided data. Never invent venues.
- Always include Dry Score and top NA drink.
- If city not in database, acknowledge honestly, suggest London, offer general tips.
- Structure itineraries as Day 1/2/3 with morning/afternoon/evening.
- Use neighborhood data for walkable, proximity-aware day plans.
- Be confident and specific. No hedging — say "go here."
- Never preachy about sobriety. Treat not drinking as unremarkable.
- **Never use the word "sober" unless the user does first.** Use "alcohol-free", "zero-proof", or describe naturally.
- When data is thin, be honest: "We have X verified venues in London so far."

**Rate limiting:** 20 messages/session, 100 messages/IP/day. In-memory rate limiter.

**Venue rendering:** Vercel AI SDK tool calling → `recommend_venue` tool → frontend renders inline venue cards.

#### 2.3 Create Chat UI (`/plan`)
**Status:** DONE (copy updated)

**Empty state:**
```
"Where to next?"
[smaller] Tell me where you're going. I'll find the best places that don't revolve around drinking.

[Chat input: "Where do you want to go?"]

[Suggested prompts:]
- "Plan a 3-day trip to London with great nightlife"
- "Best mocktail bars in Soho"
- "London hotel with AF minibar for a weekend trip"
- "Date night in London — no alcohol, lots of personality"

[Trust strip:]
40+ verified venues | Never hallucinates | London coverage
```

#### 2.4 Shareable Itineraries + Email Capture *(STRETCH — deferred)*

#### 2.5 Feedback Mechanism
**Status:** DONE

Thumbs up/down on each AI response.

#### 2.6 Phase 2 Testing Checklist

**2.2 API route:**
- [ ] Streaming response works
- [ ] Response includes real venue data (not hallucinated)
- [ ] Rate limit triggers at 20 messages/session
- [ ] Rate limit triggers at 100 messages/IP/day
- [ ] City-aware filtering works (accepts `city` param)
- [ ] System prompt enforces "no sober" rule
- [ ] Non-London city acknowledged honestly

**2.3 Chat UI:**
- [ ] Empty state says "Where to next?" with updated subtitle
- [ ] Typing indicator shows while streaming
- [ ] Venue cards render with Dry Score, NA drink, CTA
- [ ] Follow-up pills appear after AI response
- [ ] Mobile: input at bottom, cards stack, pills scroll

**2.5 Feedback:**
- [ ] Thumbs up/down appears and captures events

**Phase 2 deliverable:** Working AI chat at /plan, grounded in real venue data, inline venue cards, honest gap handling, feedback tracking, city-aware, tone-shifted.

---

### Phase 3: Launch Polish ✓
**Goal:** Update the landing page, add analytics, prepare for real users.
**Estimate:** 1-2 days
**Status:** DONE

#### 3.1 Update Landing Page

- Hero: **"Clear-headed luxury travel."** with updated subhead
- Hero CTA: "Start Planning" → `/plan` (primary)
- "Browse the Directory" → `/directory/london` (secondary)
- Replace fictional VenueCard with one real London venue card + "What is a Dry Score?" explainer
- Add venue count credibility signal ("40+ verified venues in London")
- Reframe waitlist as newsletter: "Get weekly alcohol-free travel tips" (below the fold)

#### 3.2 Admin Review Page (`/admin/review`)

Password-protected. Filter by status. Renders venue cards for visual QA. Publish/Reject buttons. Notes textarea. Dead simple.

#### 3.3 Analytics Events Audit

PostHog coverage:
- Page views (automatic)
- AI conversations started
- Conversation depth (3+ messages)
- Booking link clicks (north star)
- Venue detail page views
- Directory → detail click-through
- Thumbs up/down
- Map interactions (pin clicks, filter changes)

#### 3.4 Design System Polish

Animation timing, hover states, focus ring consistency.

#### 3.5 Open Graph / Social Sharing

OG meta tags for homepage, venue detail pages, directory page.

#### 3.6 Update CLAUDE.md

Document all routes, AI chat architecture, pipeline, map setup, env vars.

#### 3.7 Phase 3 Testing Checklist

**3.1 Landing page:**
- [ ] Hero says "Clear-headed luxury travel."
- [ ] "Start Planning" routes to `/plan`
- [ ] "Browse the Directory" routes to `/directory/london`
- [ ] Real venue card renders with actual data
- [ ] Venue count signal is accurate
- [ ] Waitlist form below fold, reframed as newsletter

**3.2 Admin:**
- [ ] Password required
- [ ] Status filter works
- [ ] Publish/Reject buttons work
- [ ] Notes save

**3.3 Analytics:**
- [ ] PostHog events for all key actions
- [ ] Booking clicks in PostHog cross-check with `venue_clicks` table

**3.4-3.5 Polish + OG:**
- [ ] Hover states consistent
- [ ] Focus rings visible
- [ ] No layout shift (CLS)
- [ ] OG previews correct on all key pages

**3.6 CLAUDE.md:**
- [ ] All routes documented
- [ ] Map setup documented
- [ ] Env vars documented

**Pre-launch:**
- [ ] `npm run build` — zero errors
- [ ] `npm run lint` — clean
- [ ] Vercel preview loads without errors
- [ ] All pages work at 375px mobile viewport
- [ ] No console errors in production

**Phase 3 deliverable:** Updated landing page, admin workflow, analytics, polish, OG tags.

---

## Current Codebase State (Updated 2026-03-09)

| Feature | Status | Notes |
| --- | --- | --- |
| Pipeline + data (Phase 0) | DONE | Pipeline, backfill coords, verification SQL all built |
| Shared layout (1.1) | DONE | Nav, Footer, Logo, PostHog |
| Kill A/B (1.2) | DONE | Variant A permanent |
| Directory page (1.3) | DONE | Category/neighborhood/search filters, mobile toggle |
| Venue detail pages (1.4) | DONE | Mini-map, verified badge, proximity-based related venues |
| Booking CTAs (1.5) | DONE | Click tracking via /go/[id] |
| Methodology (1.6) | DONE | Full 1-5 scale explanation |
| City-slug routing (1.8) | DONE | /directory/[city], city selector, city-aware chat |
| Brand copy updates (1.9) | DONE | "Clear-headed luxury travel", "Where to next?", "no sober" rule |
| Interactive map (1.10) | DONE | Mapbox with clustering, category pins, popups, mini-maps |
| AI chat API (2.1-2.2) | DONE | Streaming, all-cities context, rate limiting, tone-shifted |
| Chat UI (2.3) | DONE | Empty state, suggested prompts, trust strip, markdown rendering fixed |
| Feedback (2.5) | DONE | Thumbs up/down with PostHog |
| Admin review (3.2) | DONE | Password-protected, status filter, publish/reject |
| Landing page update (3.1) | DONE | Hero, featured venue, venue count, newsletter |
| Analytics audit (3.3) | DONE | PostHog events across all key actions |
| OG tags (3.5) | DONE | Root layout + venue detail + dynamic OG image route |
| CLAUDE.md (3.6) | DONE | Comprehensive documentation |
| **7-city expansion** | **DONE** | Berlin, Melbourne, LA, Copenhagen, Dubai added to London + NYC |
| **Venue fact-check** | **DONE** | Perplexity deep research audit, 32 corrections applied |
| **Description rewrite** | **DONE** | All 112 venues rewritten in human voice (anti-AI-slop) |

### Venue Data Summary (2026-03-09)

| City | Published | Score 5 | Score 4 | Score 3 | Notes |
| --- | --- | --- | --- | --- | --- |
| London | 63 | 3 | 29 | 31 | Strongest coverage. 52 venues at 3-4 not individually fact-checked by Perplexity. |
| New York | 14 | 9 | 1 | 4 | Strong AF bar scene (Hekate, Mockingbird, No More Cafe, Soft Bar). |
| Berlin | 9 | 3 | 3 | 3 | Fine dining NA pairings (CODA, Cookies Cream, Bricole). |
| Copenhagen | 8 | 2 | 3 | 3 | World-class (Geranium, Jordnær). Thin on bars. |
| Los Angeles | 7 | 1 | 2 | 4 | Free Spirited is the standout. Masiosare flagged as pop-up. |
| Melbourne | 3 | 0 | 1 | 2 | Thin. Brunswick Aces + Navi + Sip & Enjoy (bottle shop). |
| Dubai | 3 | 1 | 1 | 1 | NoLo + 11 Woodfire are strong. |
| **Total** | **107** | | | | |

---

## Remaining Build Order

**All build phases are complete.** The product is live at https://www.drytrip.co with 107 venues across 7 cities.

### Pre-launch checklist

| Task | Status | Notes |
| --- | --- | --- |
| Run verification SQL | DONE (2026-03-08) | 98 venues stamped: last_verified, verified_by, source |
| Confirm Mapbox token in Vercel env vars | DONE (2026-03-08) | Confirmed in both local .env and Vercel Production |
| Confirm all Vercel env vars | DONE (2026-03-08) | 9 vars confirmed: Supabase, Mapbox, Anthropic, Admin, Google Places |
| 7-city pipeline + publish + fact-check | DONE (2026-03-09) | Perplexity audit: 6 removed, 4 upgraded, 9 downgraded, 7 fact fixes |
| Description rewrite (all 107 venues) | DONE (2026-03-09) | Human-voice bullets, anti-AI-slop prompt |
| Chat API fix (UIMessage conversion) | DONE (2026-03-09) | Was broken — added convertToModelMessages() |
| Chat heading markdown fix | DONE (2026-03-09) | Bold text in headings now renders properly |
| SEO meta tags for city pages | DONE (2026-03-09) | Per-city title + description + OpenGraph for all 7 directory pages |
| Backfill lat/lng for all venues | DONE (2026-03-09) | All 107 published venues have coordinates |
| Landing page venue count | DONE (2026-03-09) | Dynamic from Supabase (auto-updates). Plan page updated to "107". |
| Methodology page | DONE (2026-03-09) | Already city-agnostic — no London-specific references |
| Mobile responsiveness fixes | DONE (2026-03-09) | Viewport meta, nav touch targets (44px+), responsive typography, trust strip gap |
| Set up affiliate links for top venues | BLOCKED | Booking.com rejected (saw waitlist page). Reapply after live launch. |
| OG images for city pages | TODO | Currently only root + venue detail have OG images |
| Spot-check 52 London 3-4 venues | TODO | Perplexity only verified top-scoring London venues |
| Thin city coverage (Melbourne 3, Dubai 3) | FLAG | Consider flagging in UI or running more targeted pipeline searches |
| Run verification SQL for new cities | TODO | New city venues need last_verified, verified_by stamped |
| Favicon / social share image | TODO | Need brand assets — currently using favicon.svg |

---

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_PLACES_API_KEY=
ANTHROPIC_API_KEY=
ADMIN_PASSWORD=
NEXT_PUBLIC_MAPBOX_TOKEN=          # NEW: Mapbox GL JS access token
NEXT_PUBLIC_MAPBOX_STYLE=          # NEW: optional custom style URL
```

---

## What's NOT in This Plan (Post-MVP)

1. ~~**Second city** (NYC or Melbourne) — proves the pipeline scales~~ DONE — now 7 cities
2. **Shareable itineraries with mini-map** — viral distribution
3. **User reviews** — activates the `reviews` table stub
4. **"Is this hotel sober-friendly?" checker** — embeddable viral tool
5. **B2B dashboard** — hotels pay for Dry Score audits
6. **Premium tier** ($9.99/month)
7. ~~**Multi-city trip planning** — "3 days London, 2 days Paris"~~ DONE — chat context includes all cities
8. User accounts / saved itineraries
9. Booking API integrations
10. Mobile app
11. pgvector / semantic search
12. AI chat itinerary map (stretch feature from addendum — defer to post-MVP)
13. **Deepen thin cities** — Melbourne (3) and Dubai (3) need more venues
14. **Venue photos** — hire photographer or source from venues directly

---

## Technical Decisions

| Decision | Choice | Rationale |
| --- | --- | --- |
| AI SDK | Vercel AI SDK (`ai` + `@ai-sdk/anthropic`) | Purpose-built for Next.js streaming chat |
| LLM | Claude Sonnet | 15x cheaper than Opus, excellent for structured recs |
| Venue cards in chat | Tool calling + rendered cards | Cards with booking CTAs shorten path to north star |
| Venue pages | SSG with ISR | SEO + speed |
| Chat architecture | Route Handler + `useChat()` | Proven pattern for streaming + conversation state |
| Data pipeline | TypeScript + Google Places + Claude | Automated discovery + AI scoring + human review |
| Venue slugs | `name-city` kebab-case | Unique, readable, SEO-friendly |
| Map provider | Mapbox GL JS | Brand-aligned styling, free tier, custom styles |
| Map loading | `dynamic()` with `ssr: false` | ~200KB lazy-loaded, no SSR |
| Directory routing | `/directory/[city]` | Multi-city ready, SEO-friendly |
