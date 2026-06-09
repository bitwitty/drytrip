# Dry Trip

An editorially curated directory of hotels, restaurants, and bars that take the non-alcoholic experience seriously. London is live with 100+ venues, each individually audited and scored on a published rubric.

**Live at [drytrip.co](https://drytrip.co)**

## What it does

- **Venue directory** with filtering by category, neighbourhood, and search. Map view via Mapbox.
- **Dry Score (1-5)** — a published scoring rubric based on NA drink count, house-made options, dedicated menus, and zero-proof pairings. Every venue is scored and editorially reviewed before going live.
- **AI trip planner** — a chat interface powered by Claude that builds itineraries from the audited venue data, with the ability to email or copy plans.
- **Editorial content** — long-form articles via TinaCMS and MDX.
- **Venue pipeline** — scripts for adding, enriching, and batch-processing venues with automated coordinate backfill and data validation.
- **City voting** — users vote on the next city to launch.

## How it works

Venues go through a discovery and enrichment pipeline before being editorially reviewed and published. The AI trip planner has full context of audited venues and builds itineraries conversationally — it doesn't hallucinate restaurants.

Rate limiting (Upstash Redis) gates the AI chat at 100 messages/IP/day with a 20-message session cap. Users hit an email gate after 2 free messages, feeding the waitlist.

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 16, React 19, TypeScript |
| Database | Supabase (PostgreSQL) |
| AI | Claude Sonnet 4.5 via Vercel AI SDK |
| Maps | Mapbox GL JS |
| CMS | TinaCMS + MDX |
| Rate limiting | Upstash Redis |
| Email | Resend |
| Analytics | PostHog |
| Hosting | Vercel |

## Local development

```bash
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

## Status

London is live with 100+ venues. City expansion is next — voting is open on the site.
