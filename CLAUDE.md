# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Dry Trip** is a Next.js MVP for a luxury travel directory focused on alcohol-free and sobriety-forward travel. It surfaces London venues (hotels, restaurants, bars) with a "Dry Score" rating, highlights top non-alcoholic drinks, and includes an AI-powered trip planner.

## Commands

```bash
npm run dev          # Development server at localhost:3000
npm run build        # Production build
npm run lint         # ESLint check
npm run pipeline     # Discover & score venues: npm run pipeline london Bar|Hotel|Restaurant|--all
npm run add:venue    # Add a venue manually: npm run add:venue "Name" "City" "Category"
```

No test framework is set up yet.

## Tech Stack

- **Framework:** Next.js 16 with App Router
- **Styling:** Tailwind CSS v4 (PostCSS plugin) — no `tailwind.config.js`, config is inline in `globals.css`
- **Database:** Supabase (PostgreSQL)
- **AI:** Vercel AI SDK (`ai` + `@ai-sdk/anthropic` + `@ai-sdk/react`) with Claude Sonnet
- **Icons:** lucide-react
- **Language:** TypeScript 5.9.3 (strict mode, path alias `@/*` → `./src/*`)

## Architecture

### Routes

| Route | Type | Description |
|---|---|---|
| `/` | Server Component | Landing page with waitlist form |
| `/directory` | Client Component | Venue directory with category filter + sort |
| `/venues/[slug]` | Server Component (dynamic) | Venue detail page |
| `/plan` | Client Component | AI trip planner chat UI |
| `/methodology` | Server Component | How Dry Scores work |
| `/admin/review` | Client Component | Password-protected venue review page |
| `/go/[id]` | Route Handler | Outbound click redirect + tracking |
| `/api/chat` | Route Handler | AI chat streaming endpoint |
| `/api/admin/auth` | Route Handler | Admin password verification |

### Data Fetching Pattern
- Client components use the Supabase anon client via `useEffect`
- Server components and API routes use `supabaseAdmin` (service-role key)
- Venue detail pages are dynamic (`force-dynamic`) — switch to SSG with ISR when data is stable

### Key Database Tables
- **`waitlist`** — email signups
- **`venues`** — full venue schema with slug, neighborhood, dry_score (1–5), vibe_tags, short_description, ai_context, and more. See `scripts/migrate-venues.sql` for full schema.
- **`venue_clicks`** — outbound click tracking (venue_id, source, session_id)

### AI Chat Architecture
- System prompt in `src/lib/prompts.ts`
- API route at `src/app/api/chat/route.ts` fetches all published London venues and injects into context
- Rate limited: 20 messages/session, 100 messages/IP/day (in-memory)
- Chat UI uses `useChat()` from `@ai-sdk/react`

### Shared Components
- `Nav.tsx` — site-wide navigation (Home, Directory, Plan a Trip)
- `Footer.tsx` — copyright + Instagram link
- `Logo.tsx` — SVG logo + wordmark

### Design System
Brand tokens in `src/app/globals.css`:
- `--color-linen`: #F9F7F2 (background)
- `--color-forest`: #1B3022 (primary dark)
- `--color-sandstone`: #D9C5B2 (accent)
- `--color-amber`: #C4963C (booking CTAs)
- `--color-sage`: #7A8B6F (success states)
- `--color-clay`: #B85C38 (errors)
- `--color-mist`: #E8E4DD (borders)
- Fonts: Cormorant Garamond (serif/display), Montserrat (sans/UI)

### Venue Pipeline
- `scripts/pipeline.ts` — hybrid discovery pipeline: Google Places API → website scraping → review mining → Claude scoring → Supabase upsert as Draft
- `scripts/add-venue.ts` — manually add a venue by name, Claude researches and generates all fields
- `scripts/backfill-coords.ts` — backfill lat/lng for Published venues missing coordinates
- `scripts/migrate-venues.sql` — full schema migration (run in Supabase SQL Editor)

### A/B Testing
Removed. Variant A copy ("Travel at full resolution") is now the permanent landing page. The `ab.ts` file is still in the codebase but no longer imported.

## Environment Variables

Required in `.env`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_PLACES_API_KEY=
ANTHROPIC_API_KEY=
ADMIN_PASSWORD=           # For /admin/review access
```
