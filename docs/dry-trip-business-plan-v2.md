# DRY TRIP — Revised Business Plan & ADHD-Friendly Action Plan (v2)

**Last updated:** February 18, 2026
**Status:** Working document — revisit monthly

---

# PART 1: BUSINESS PLAN

---

## 1. Executive Summary

**Elevator Pitch:** Dry Trip is an AI-powered travel planning agent built for sober and sober-curious travelers. Users tell our AI where they want to go and what kind of trip they want — and it generates a personalized, bookable itinerary filtered through the only verified sober-friendliness rating system in travel. Every hotel, restaurant, bar, and experience comes with a "Dry Score" based on the quality of its non-alcoholic offerings, so travelers can plan with confidence instead of guesswork.

**Mission:** Make sober-friendly travel as easy to plan as any other trip — by building the dataset and AI agent that makes it possible.

**Vision:** Become the default travel intelligence layer for the 100M+ adults in North America reducing or eliminating alcohol, and the hospitality brands competing for their spend.

**Unique Value Proposition:** General AI trip planners (Layla, Mindtrip, ChatGPT) give generic, unverified sober-travel advice because they don't have the data. Niche sober travel companies sell pre-packaged group tours, not self-serve planning. Dry Trip is the only platform with (a) a proprietary, verified sober-friendliness database and (b) an AI agent that uses it to generate complete, bookable itineraries. The data is the moat. The AI is the delivery mechanism.

---

## 2. Problem Statement

### The Core Problem

Sober and sober-curious travelers have no reliable way to plan trips around their preferences. The current experience:

- **General AI planners fail them.** Ask ChatGPT or Layla "plan me a sober-friendly trip to Barcelona" and you get generic advice, hallucinated venue names, and no way to verify whether a bar actually has a serious NA program or a hotel offers AF minibar options. These tools don't have the underlying data.
- **Manual research is brutal.** It means keyword-searching TripAdvisor reviews for "mocktail," messaging hotels directly, scrolling Reddit threads, and hoping a restaurant has more than one sad mocktail. This can add hours to every trip.
- **Niche sober travel companies only do group tours.** Capsule Adventures, We Love Lucid, Hooked Travel, and FlashPack's Zero-Proof Escapes offer curated group trips ($2,000-4,000+). Great for some travelers, but most people want to plan their own trip.
- **No centralized, verified data exists.** There's no "sober-friendly" equivalent of a Michelin star, an allergy-friendly certification, or even a consistent rating system. Hospitality brands are investing in NA programs but have no channel to communicate this to the right audience.

### The Opportunity

The gap is structural, not cosmetic. It's a data problem. No one has built the verified, venue-level dataset that would make reliable sober-travel recommendations possible — for AI or for humans. Whoever builds that dataset first and wraps it in a great user experience wins.

### User Personas

**Persona 1: "Mindful Maya" — The Sober-Curious Millennial**
- Age 28, marketing manager, Austin. Doesn't identify as "sober" but drinks rarely.
- Travels 3-4x/year. Budget: $150-250/night.
- Already uses AI tools (ChatGPT, Layla) for trip planning. Expects conversational interfaces.
- Frustrated that "best bars in Barcelona" results are 100% alcohol-focused.
- Discovery: Instagram, TikTok, AI tool recommendations.

**Persona 2: "Recovery Ryan" — The Sober Traveler in Recovery**
- Age 42, software engineer, Denver. 3 years sober.
- Needs hotel minibars stocked AF. Wants to avoid venues where alcohol is the centerpiece.
- High willingness to pay for trustworthy, verified information. Has been burned by "wellness retreats" with open bars.
- Trust is paramount — one bad recommendation and he's gone.
- Discovery: Sober communities (r/stopdrinking, Tempest, The Luckiest Club), Google search.

**Persona 3: "Wellness Wendy" — The Health-Conscious Luxury Traveler**
- Age 35, entrepreneur. Travels 6-8x/year, $300-500+/night.
- Not sober per se, but alcohol doesn't fit her lifestyle. Prefers wellness resorts, adaptogenic drinks, high-end NA programs.
- Will pay premium for curated experiences. Wants Dry Trip to feel aspirational, not clinical.
- Discovery: Newsletters (Well+Good, The Zoe Report), influencer recommendations.

**Persona 4: "AI-First Alex" — The Digital Native Planner**
- Age 26, product designer, Brooklyn. Uses AI for everything. Already plans trips via Layla or ChatGPT.
- Sober-curious as a lifestyle choice, not a recovery identity. Expects to type a prompt and get a complete trip back.
- Will never browse a directory. If Dry Trip isn't conversational, it doesn't exist for this person.
- Discovery: Product Hunt, AI tool directories, TikTok, word-of-mouth.

---

## 3. Solution & Product Description

### Core Architecture

Dry Trip has two components that work together:

**Component 1: The Dry Score Database (the moat)**
A proprietary, verified dataset of venue-level sober-friendliness information that no general AI has. This is the defensible asset.

For each venue, we capture and rate:
- **Hotels:** AF minibar options, wellness amenities, whether alcohol is avoidable or central to the experience, room service NA options, proximity to sober-friendly dining/nightlife.
- **Restaurants:** Number and quality of NA cocktails/drinks, menu creativity beyond "virgin mojito," staff attitude toward non-drinkers, whether alcohol is expected/pressured.
- **Bars/Nightlife:** Dedicated NA cocktail program, vibe (is it a bar that happens to have NA options, or is it built around the AF experience?), quality of ingredients, atmosphere for non-drinkers.
- **Experiences:** Whether the activity defaults to alcohol (wine tasting → dealcoholized wine tasting), wellness-focused alternatives, cultural experiences that don't center drinking.

Each venue receives a **Dry Score (1-5):**
- 5 = Purpose-built for AF/sober experience (e.g., AF bar, sober retreat)
- 4 = Excellent NA program, welcoming to non-drinkers, multiple quality options
- 3 = Good NA options available, not the focus but solid
- 2 = Limited NA options, alcohol is clearly the default
- 1 = Minimal/no NA options, alcohol-centric experience

**Data collection methods:**
- Manual research: menus, websites, phone calls, in-person visits where possible
- AI-assisted scraping: Google Places reviews mentioning "mocktail," "non-alcoholic," "sober" + sentiment analysis
- User submissions (V2): Verified user reviews that update Dry Scores
- Venue self-reporting (V2): Hotels/restaurants claim profiles and provide their own AF data

**Component 2: The AI Travel Agent (the interface)**
A conversational AI that uses the Dry Score database to generate personalized, bookable sober-friendly itineraries.

User flow:
1. User types: "Plan me a 5-day trip to Austin. I don't drink, love fine dining and live music, budget $200/night for hotels."
2. AI agent queries the Dry Score database for Austin venues matching preferences.
3. AI generates a day-by-day itinerary with: hotel recommendation (with Dry Score + AF minibar details), daily restaurant picks (with NA menu highlights), evening activities (bars with great mocktail programs, non-alcohol experiences), booking links for each.
4. User can refine: "Make day 3 more relaxed" or "Find me a hotel with a pool."
5. User saves the itinerary, shares it, or books directly through affiliate links.

### MVP (Month 1-3) — "AI Agent + Starter Database"

**Included:**
- Conversational AI agent on drytrip.com (web-based, mobile-responsive)
- Dry Score database: 5 launch cities × 30 venues = 150 venue profiles
  - Launch cities: Austin, New York, London, Los Angeles, Melbourne
- AI generates text-based itineraries with venue recommendations, Dry Scores, and affiliate booking links
- Each venue has a profile page (SEO-indexed) with Dry Score breakdown, NA highlights, photos, booking link
- Destination guide pages (SEO) for each launch city — these drive organic traffic to the AI agent
- Email capture + weekly newsletter
- Landing page with demo video of the AI in action

**Not in MVP:**
- User accounts (itineraries are shareable via URL, no login required)
- User reviews
- Direct booking (affiliate links only)
- Mobile app
- Real-time pricing in AI responses (links to Booking.com etc. for pricing)
- Voice interface

### V2 (Month 4-8) — "Community + B2B"

- User accounts: save trips, preferences, favorites
- User review system: submit Dry Scores and tips, moderation layer
- Featured/sponsored listings: venues pay for enhanced profiles and priority placement
- B2B dashboard: hotels claim profiles, see analytics, get Dry Score improvement recommendations
- Expanded to 15-20 cities, 400+ venues
- AI improvements: better personalization, multi-city trip planning, budget tracking
- Brand partnership integrations: NA beverage brand recommendations woven into itineraries

### V3 (Month 9-18) — "Platform + Premium + Agentic"

- Premium tier ($9.99/month): unlimited AI itineraries, exclusive venue deals, advanced personalization, ad-free
- Agentic booking: AI doesn't just recommend — it checks availability and initiates bookings
- Mobile app (iOS first)
- Multi-modal input: upload an Instagram screenshot, AI identifies the venue and gives you its Dry Score
- B2B intelligence product: sell anonymized sober-curious traveler behavior data to hospitality brands
- API/widget: let travel bloggers embed Dry Scores on their sites
- 50+ cities, 1,500+ venues

---

## 4. Market Analysis

### The Macro Case

Alcohol reduction is a 15-year structural trend, not a TikTok moment.

- **60% of FlashPack's clientele** identify as light or non-drinkers (2025 data). This is a premium solo travel company, not a recovery organization.
- **52% of Gen Z and Millennials** say they're likely to participate in the sober-curious movement (Leger 2025 study).
- **Contiki's sober-curious trips are outperforming standard itineraries** — surprising even their own executives. "The interest has shocked me and blown my mind a bit," said their CMO.
- **Solo travel surged to 59%** of travelers in the past 5 years (TravelBoom 2026 study), up from 46% in 2025. Solo + sober-curious is a large, growing overlap.
- **The global no/low alcohol market is a $10B+ industry**, growing 31% YoY (IWSR data). Supply is growing fast — demand for discovery tools follows.
- **AI travel startup funding hit 45% of all travel tech funding** in H1 2025, up from 10% in 2023. Investors specifically want AI-native travel products.

### TAM / SAM / SOM

**TAM (Total Addressable Market)**
- ~152M US adults don't drink or are reducing (46% of adults don't drink; millions more are cutting back)
- Average annual travel spend per US adult: ~$2,000
- **TAM = $100B+** in travel spending by sober-curious Americans alone
- Add UK, Canada, Australia: **~$140B global English-speaking TAM**

**SAM (Serviceable Addressable Market)**
- Self-directed leisure travelers aged 22-50 in English-speaking markets who research trips online and are actively sober-curious
- ~15M people × $1,500 avg bookable travel spend = **$22.5B SAM**

**SOM (Serviceable Obtainable Market) — 3-Year Horizon**

| | Users | Revenue | Key Driver |
|---|---|---|---|
| Year 1 | 10,000 | $30K-60K | Affiliate + first brand partnerships. Content marketing funded. |
| Year 2 | 50,000 | $300K-500K | B2B revenue kicks in. 50+ featured listings. 8+ brand deals. |
| Year 3 | 200,000 | $1M-2M | Premium tier. 100+ B2B clients. Agentic booking. |

**Honest note:** Year 1 is a build year. Revenue won't sustain full-time living. Plan for 12-18 months of runway from savings, freelance, or a small pre-seed raise + Canadian grants.

### Assumptions Worth Stress-Testing

| Assumption | Risk | Counter |
|---|---|---|
| Sober-curious is structural, not a fad | Low. 15-year trend line + health consciousness doesn't reverse. | Monitor annual Gallup drinking data. If decline flattens, reassess. |
| General AI planners won't deeply serve this niche | Medium. They could add filters. | They can add a checkbox; they can't replicate verified venue data overnight. Speed of data collection is your runway. |
| Users will trust an AI for sober-travel recs | Medium. Sober community is trust-sensitive. | Ground every recommendation in verified data. Never hallucinate. Transparent methodology. |
| Hotels will pay for B2B analytics/placement | Medium. New category — no precedent. | Start with 5 pilot hotels. If they convert/retain, scale. If not, pivot to pure consumer. |

---

## 5. Competitive Landscape

### Category 1: Sober Travel Companies (Niche, Non-Tech)

| Competitor | What They Do | Strength | Weakness | Threat to Dry Trip |
|---|---|---|---|---|
| Capsule Adventures | Sober group adventure trips (Machu Picchu, Bali) | Strong brand, community trust, screening process | Pre-packaged only, ~$2,400+ per trip, limited destinations | LOW — different product. Potential partner. |
| We Love Lucid | AF group trips in Europe (cycling, hiking) | Budget-friendly, fun brand | Tiny scale, few trips/year | LOW — potential partner. |
| Hooked Travel | AF experience trips (Iceland, wine tours) | Creative concept (AF wine tours), strong founder story | Small, pre-packaged only | LOW — potential partner. |
| FlashPack Zero-Proof | Premium solo sober-curious trips | Established brand, high-end ($3,000+) | Expensive, few departures | LOW — different market segment. |
| Sober Vacations International | Recovery-focused cruises and resorts | 37 years in business, trust in recovery community | Recovery-focused (not sober-curious), not tech-enabled | LOW — different audience. |
| GoingDry.co | Destination guides for sober travelers | Content quality | Underdeveloped, no booking, no AI | LOW — content competitor only. |

**Assessment:** These companies are potential partners, not threats. They sell tours; you sell the planning layer. Co-marketing is the play.

### Category 2: NA Drink Finders (Local, Not Travel)

| Competitor | What They Do | Threat to Dry Trip |
|---|---|---|
| BuzzCutt | Find NA drinks at local venues | LOW — local focus, not travel-oriented |
| NA Beer Finder | Find NA beer nearby | LOW — single-category, local |
| Sober Space | Underdeveloped directory | LOW — no real traction |

**Assessment:** These validate demand but operate in a different use case (local discovery vs. travel planning).

### Category 3: AI Trip Planners (THE REAL COMPETITION)

| Competitor | What They Do | Funding/Scale | Sober-Travel Capability | Threat Level |
|---|---|---|---|---|
| **Layla.ai** | End-to-end AI trip planner with booking | Millions of users, $49.95/yr premium | Generic. No sober-specific data. | **HIGH** |
| **Mindtrip** | AI visual trip planner, collaborative | Backed by Amex Ventures, Capital One Ventures, United Airlines Ventures. Fast Company "Most Innovative 2025." | Generic. No sober-specific data. | **HIGH** |
| **iMean AI** | Multi-city AI planner with budget tracking | Growing, technically strong | Generic. | **MEDIUM** |
| **ChatGPT** | General AI with travel capability | Billions in funding. Hundreds of millions of users. | Hallucinates sober recs. No verified data. | **HIGH** (ambient threat) |
| **Google AI Mode** | Adding hotel/flight bookings to AI search | Unlimited resources | Could add sober filters to Places data | **HIGH** (long-term) |

**Assessment:** These are the existential threat. Not because they're focused on sober travel — but because they could *add* sober-friendly filtering as a feature. Your defense:

1. **Data depth they can't replicate quickly.** Your Dry Score is based on manual verification, specific criteria, and community input. Google could auto-generate something from reviews, but it won't be as accurate or trusted.
2. **Speed.** You're building the dataset now. It takes 12-18 months to build depth. By the time a general AI planner decides this niche is worth serving, you should have a 1-2 year data lead.
3. **Community trust.** The sober-curious audience is trust-sensitive. A verified, purpose-built tool earns credibility that a generic AI filter never will.
4. **Brand identity.** People use Bumble despite Tinder. They use Strava despite Apple Fitness. Niche identity is a moat when the audience has an identity.

### Competitive Positioning Matrix

| Capability | Dry Trip | Layla/Mindtrip | Capsule/Hooked | BuzzCutt | ChatGPT |
|---|---|---|---|---|---|
| AI trip planning | ✅ | ✅ | ❌ | ❌ | ✅ (generic) |
| Sober-specific data | ✅ (verified) | ❌ | N/A (tours) | ✅ (local only) | ❌ (hallucinates) |
| Booking integration | ✅ (affiliate) | ✅ (direct) | ✅ (own tours) | ❌ | Partial |
| Full-trip coverage | ✅ | ✅ | ❌ (tours only) | ❌ (drinks only) | ✅ (generic) |
| Self-serve planning | ✅ | ✅ | ❌ | ✅ | ✅ |
| Community/reviews | V2 | ✅ | ❌ | Partial | ❌ |
| B2B for hospitality | V2 | ❌ | ❌ | ❌ | ❌ |
| Sober community trust | ✅ | ❌ | ✅ | Partial | ❌ |

**Where Dry Trip wins:** The only platform combining AI trip planning + verified sober-friendliness data + booking + sober community trust. Nobody else has all four.

---

## 6. Business Model & Revenue

### Revenue Streams

**Stream 1: Affiliate Bookings**
- Hotel commissions (Booking.com, Hotels.com): 3-6%, avg $15-40/booking
- Restaurant reservations (OpenTable): $1-2/seated diner
- Experience bookings (Viator, GetYourGuide): 8-12%, avg $8-15/booking
- Embedded in AI itinerary recommendations — frictionless.

**Stream 2: Featured/Sponsored Listings**
- Venues pay for: enhanced profiles, priority placement in AI recommendations, "Featured" badge, analytics on impressions/clicks
- Pricing: $100-300/month per venue (city-dependent)

**Stream 3: Brand Partnerships**
- NA beverage companies (Athletic Brewing, Seedlip, Lyre's, Monday, Ghia) sponsor destination guides, get woven into AI recommendations ("This bar uses Lyre's for their mocktail program"), or run co-branded campaigns
- Pricing: $3,000-15,000/campaign depending on scope

**Stream 4: B2B Sober-Curious Intelligence (NEW)**
- Hotels and restaurant groups pay for:
  - Dry Score audit + improvement roadmap ("Here's how to go from a 2 to a 4")
  - Premium platform placement + analytics dashboard
  - Anonymized data: what sober-curious travelers search for, value, and book in your market
- Pricing: $500-2,000/month per enterprise client
- This is the highest-margin, fastest-to-revenue stream. Hotels are already investing in NA programs — they'll pay for intelligence on whether it's working.

**Stream 5: Premium Tier (V3)**
- $9.99/month or $79/year
- Unlimited AI itineraries, exclusive venue deals, advanced personalization, ad-free, offline access
- Target: power users planning 3+ trips/year

### Revenue Projections

| Stream | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Affiliate bookings | $8,000 | $120,000 | $480,000 |
| Featured listings | $6,000 | $72,000 | $288,000 |
| Brand partnerships | $15,000 | $100,000 | $300,000 |
| B2B Intelligence | $6,000 | $96,000 | $360,000 |
| Premium tier | $0 | $36,000 | $180,000 |
| **Total** | **$35,000** | **$424,000** | **$1,608,000** |

**Year 1 assumptions:**
- 10K users by month 12, 80 affiliate bookings/month by Q4
- 5 featured listings from month 6 at $100/month avg
- 3 brand partnerships at $5K avg
- 3 B2B pilot clients from month 8 at $500/month avg

**Year 2 assumptions:**
- 50K users, 5x booking volume, 40 featured listings, 10 brand deals, 16 B2B clients, premium launch with 300 subscribers by year-end

**Year 3 assumptions:**
- 200K users, 100+ featured listings, major brand deals, 30 B2B clients at higher ARPU, 1,500 premium subscribers

**Critical caveat:** Year 1 revenue ($35K) is supplementary income, not a salary. Budget for 12-18 months of runway from savings, freelance work, and/or Canadian grants (see Funding section). This is a compounding business — the inflection comes in Year 2 when B2B + brand revenue layers on top of growing affiliate income.
## 7. Go-to-Market Strategy

### Phase 1: First 1,000 Users (Month 1-3)

**AI-Native Distribution (Primary — NEW)**

This is a 2026 startup. Your launch channels should include AI-native distribution:

- **Product Hunt launch.** Time it for when the AI agent is functional with at least 3 cities. AI products still get strong attention on PH.
- **AI tool directories.** Submit to: There's An AI For That, FutureTools, AItoolsclub, TopAI.tools. These drive qualified traffic from people already looking for AI solutions.
- **"Best AI trip planners" articles.** Pitch Dry Trip to the writers behind the Unite.AI, Jotform, iMean AI comparison articles. These rank highly and drive sustained traffic. Your angle: "the only AI trip planner built specifically for sober-curious travelers."
- **Free viral tool:** Build a simple "Is this hotel sober-friendly?" checker — user enters a hotel name, gets a Dry Score + explanation. Embeddable, shareable, linkable. This is a top-of-funnel awareness play.

**Content-Led SEO (Secondary — still important)**

SEO drives compounding organic traffic. But now it serves as a marketing channel that funnels users to the AI agent, not as the product itself.

- Publish 20-30 SEO destination guides targeting long-tail keywords:
  - "best mocktail bars in [city]"
  - "sober friendly hotels [city]"
  - "things to do in [city] without drinking"
  - "AI sober travel planner"
- Each guide: 1,500-2,500 words, 5-10 venue recommendations with Dry Scores, CTA to "Plan your trip with our AI →"
- Target keywords with 500-5,000 monthly searches and low competition

**Social Media**

- **TikTok/Reels (highest priority).** Demo-first content: "Watch me plan an entire sober trip to Barcelona in 60 seconds with AI." Screen recordings of the AI agent in action are inherently engaging and demonstrate the product.
- **Instagram.** Venue spotlights, destination showcases, behind-the-scenes of building the product. Post 3-5x/week.
- AI-generate visuals where it makes sense, but your photography background means you can create authentic content that stands out from pure AI imagery. Use both.
- Hashtags: #sobercurious, #drytripping, #sobertravel, #alcoholfree, #mindfuldrinking, #aitravelplanner

**Community Seeding**

- Post genuinely in: r/stopdrinking, r/sobertravel, r/sobercurious, Tempest, The Luckiest Club
- Offer free AI trip planning to community members during beta. Their feedback improves the product AND creates word-of-mouth.

**PR / Media**

- Pitch to: Forbes Travel, CNN Travel, BBC Travel, Well+Good, Condé Nast Traveler, The Points Guy, Skift
- Primary angle: "A solo female founder in BC is building the AI trip planner for sober travelers — and the data shows this is a $100B market nobody's serving."
- Secondary angle: "Sober-curious travel in 2026: how AI is making it easier to plan trips without alcohol."

**Partnership Outreach — Sober Travel Companies**

- Reach out to Capsule Adventures, We Love Lucid, Hooked Travel, FlashPack.
- Pitch: "Your customers plan independent travel before and after your group trips. Dry Trip helps them do that. Let's co-market."
- These companies have built audiences you can tap without competing.

**Partnership Outreach — NA Brands**

- Contact Athletic Brewing, Seedlip, Lyre's, Monday, Ghia with: "We're building the platform your customers use to travel. Want to sponsor a city guide or get your brand into our AI recommendations?"
- Start with Athletic Brewing (most marketing-forward) and Ghia (strong DTC community).

### Phase 2: 1,000-10,000 Users (Month 4-8)

- Double down on whatever's working from Phase 1
- Launch newsletter: weekly "Dry Trip Dispatch" with new destinations, venue spotlights, AI tips
- Guest posts on travel and wellness blogs
- Podcast appearances (sober lifestyle, travel, AI/startup pods)
- Onboard first 10-20 paying featured listings
- Close first B2B pilot clients (hotels)
- Expand to 15-20 cities

### SEO Keyword Strategy

**High-priority keyword clusters:**

| Cluster | Example Keywords | Monthly Search Volume (est.) | Competition |
|---|---|---|---|
| City + sober travel | "sober travel Austin," "dry trip NYC" | 500-2,000 each | Low |
| City + mocktail bars | "best mocktail bars London," "mocktail bars LA" | 1,000-5,000 each | Low-Medium |
| City + AF hotels | "alcohol free hotels NYC," "sober friendly hotels" | 200-1,000 each | Very Low |
| General sober travel | "sober vacation ideas," "dry trip destinations" | 2,000-10,000 | Medium |
| AI + sober travel | "AI sober travel planner," "plan sober trip AI" | New/growing | Very Low |

**Technical SEO:**
- URL structure: drytrip.com/destinations/austin, drytrip.com/venues/austin/bar-name
- Schema markup: LocalBusiness, Restaurant, Hotel + custom structured data for Dry Score
- SSG for venue pages and guides (fast + SEO-optimized)
- Internal linking: every guide links to venue profiles, every venue links to the AI agent

---

## 8. Tech Stack

### Revised for AI-Native Architecture

| Layer | Tool | Why |
|---|---|---|
| **Frontend** | Next.js (React) + Tailwind CSS | SEO via SSR/SSG, AI tools generate Tailwind well, fast iteration |
| **Hosting** | Vercel | Free tier, instant deploys, built for Next.js |
| **Database** | Supabase (PostgreSQL) | Free tier, built-in auth (V2), pgvector extension for semantic search |
| **LLM API** | Claude API (Anthropic) | High-quality reasoning, strong at following complex instructions, good for structured output. Alternative: OpenAI API. |
| **RAG / Data Retrieval** | Supabase pgvector + structured SQL queries | MVP: simple SQL filters (city + venue type + Dry Score). V2: add vector embeddings for semantic search ("find me a chill bar with good NA cocktails near the beach"). No need for LangChain or Pinecone at MVP. |
| **Prompt Engineering** | Custom system prompt + few-shot examples | Define the AI's persona, knowledge boundaries, output format, and safety rails (never recommend an unverified venue). |
| **Maps** | Google Maps API or Mapbox | Venue location display in itineraries |
| **Booking Affiliates** | Booking.com Affiliate API, Viator Partner API | Hotel and experience booking links embedded in AI responses |
| **Venue Base Data** | Google Places API | Base venue data (photos, ratings, hours). Enrich with your Dry Score data. |
| **Email** | ConvertKit (newsletter) + Resend (transactional) | ConvertKit free up to 1,000 subs. Resend for welcome emails, itinerary sharing. |
| **Analytics** | PostHog | Product analytics, feature flags, session replay. Free tier is generous. |
| **AI Dev Tools** | Claude Code + Cursor | Claude Code for pair programming, Cursor as primary IDE |

### MVP Architecture (Keep It Simple)

```
User → Next.js Chat UI → API Route → Claude API
                                        ↓
                              System Prompt includes:
                              - Persona & rules
                              - Venue data from Supabase query
                              - Output format instructions
                                        ↓
                              Claude generates itinerary
                                        ↓
                              Response rendered with venue cards,
                              Dry Scores, booking links
```

**How the AI grounding works (MVP-simple version):**
1. User says: "Plan me a 3-day sober trip to Austin, budget $200/night, I love live music and food."
2. Your API route queries Supabase: `SELECT * FROM venues WHERE city = 'Austin' AND dry_score >= 3 ORDER BY dry_score DESC`
3. The venue results are injected into the Claude API system prompt as context.
4. Claude generates a structured itinerary using ONLY the venues in the provided context.
5. The system prompt explicitly instructs: "Only recommend venues from the provided data. Never invent or hallucinate venues. If you don't have enough data for a full itinerary, say so honestly and offer what you have."

**This is achievable in 2-3 weeks of focused vibe-coding.** The chat UI is standard Next.js. The Supabase query is basic SQL. The Claude API integration is well-documented. The hard part is the data curation, not the code.

### APIs You Need

| API | Purpose | Cost |
|---|---|---|
| Claude API (Anthropic) | Powers the AI agent | ~$0.003-0.015 per conversation (Haiku for simple queries, Sonnet for complex) |
| Google Places API | Base venue data, photos | First $200/month free |
| Booking.com Affiliate API | Hotel booking links | Free (commission-based) |
| Viator Partner API | Experience booking links | Free (commission-based) |
| Google Maps JavaScript API | Interactive maps | First $200/month free |

**Monthly API costs at 10K users:** Estimated $50-200/month. Very manageable.

---

## 9. Team & Hiring Plan

### Solo Phase (Month 1-8)

You handle: AI agent development (vibe-coding), Dry Score database curation, content creation, SEO, social media, partnership outreach, product direction.

This is viable because:
- The AI agent is buildable with vibe-coding tools (Claude Code + Cursor + well-documented APIs)
- Content creation and venue research are your core skills
- Partnership outreach leverages your existing hospitality connections

**Invest in yourself first:** Before your first hire, invest a focused weekend in learning:
- RAG patterns and prompt engineering (Claude docs, Anthropic cookbook)
- Supabase pgvector basics
- API integration patterns in Next.js

This is the highest-leverage skill investment you can make. The gap between "vibe coder who understands AI architecture" and "vibe coder who doesn't" is the gap between building a competitive product and building a toy.

### First Hire (Month 6-9)

Hire when you have: 1,000+ monthly visitors, revenue or funding, and a clear bottleneck.

**Priority order:**

1. **Part-time venue researcher/data curator** ($15-25/hr, freelance, ~10-15 hrs/week)
   - Scales the Dry Score database (your moat). This is the first bottleneck.
   - Find someone in the sober-curious community who travels. They'll understand the rating criteria intuitively.

2. **Part-time developer** ($50-100/hr, contract) or **technical co-founder**
   - When the AI agent outgrows vibe-coding (V2: user accounts, reviews, B2B dashboard)
   - A technical co-founder is ideal if you can find one aligned with the mission

3. **Community/social media manager** ($20-35/hr, part-time)
   - When social channels are growing but you can't keep up

### Don't Hire Early

- A full-time developer before product-market fit
- A marketing agency (you ARE the marketing)
- A designer (use Tailwind + templates + AI-generated design)

---

## 10. Risks & Mitigation

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| 1 | **General AI planners add sober-friendly filters** (Layla, Google, etc.) | HIGH (12-18 months) | HIGH | Move fast on database depth. By the time they add a checkbox, you should have 1,500+ verified venues they can't replicate overnight. Build brand loyalty that survives feature parity. Bumble exists despite Tinder. |
| 2 | **AI hallucination erodes trust** | MEDIUM | VERY HIGH | Ground every AI recommendation in verified database. Never let the AI recommend an unverified venue. When data is missing, say so honestly. For this audience, one bad rec = permanent trust damage. |
| 3 | **Solo founder burnout / ADHD paralysis** | HIGH | HIGH | ADHD action plan (Part 2). Founder community (Indie Hackers, On Deck). Accountability partner. Hard rule: stuck 30 min → switch to "Stuck? Do This" task. |
| 4 | **Affiliate revenue too thin to sustain** | MEDIUM-HIGH | MEDIUM | Diversify early. B2B intelligence + featured listings + brand partnerships are higher margin. Affiliates are the floor, not the ceiling. |
| 5 | **SEO/content doesn't rank fast enough** | MEDIUM | MEDIUM | Target very specific long-tail keywords (low competition). Supplement with social, PR, Product Hunt, AI directories for faster early traction. SEO compounds over 6-12 months. |
| 6 | **Not enough venues with good NA programs in some cities** | MEDIUM | MEDIUM | Launch with cities where the AF scene is proven (Austin, NYC, London, LA, Melbourne). The platform itself accelerates venue adoption — hotels see the traffic, improve their offerings. |
| 7 | **Platform risk (Claude API pricing changes, Booking.com affiliate terms change)** | LOW-MEDIUM | MEDIUM | Keep architecture modular — LLM layer is swappable (Claude ↔ OpenAI ↔ open-source). Diversify affiliate partnerships. Don't depend on one API for >50% of revenue. |

---

## 11. Funding Strategy

### Recommended Path: Bootstrap + Canadian Grants → Small Pre-Seed if Traction Warrants

**Phase 1: Bootstrap + Grants (Month 1-9)**

Your MVP costs are minimal:
- Hosting (Vercel): Free-$20/month
- Domain: $15/year
- APIs (Claude, Google Places, Maps): $50-200/month
- ConvertKit: Free up to 1,000 subs
- Supabase: Free tier
- **Total: ~$100-300/month**

**Canadian Grants to Apply for Immediately:**

| Program | Amount | Type | Timeline |
|---|---|---|---|
| **IRAP (NRC)** | Up to $50K-$500K | Non-dilutive grant for AI R&D | Apply Month 1. 2-3 month review. |
| **Innovate BC** | Varies | Venture Acceleration Program — mentorship + funding | Apply Month 1. |
| **Futurpreneur** | Up to $60K | Startup loan (if under 39) | Apply Month 1. |
| **BDC (Business Development Bank)** | Varies | AI-focused lending | Apply when revenue exists. |
| **SRED Tax Credits** | 15-35% of R&D expenses | Tax credit on AI development work | Claim annually. Track dev hours from Day 1. |
| **Canada Digital Adoption Program** | Up to $15K | Digital transformation grant | Check eligibility. |

**Non-dilutive capital is your best friend.** A $50K IRAP grant funds 6+ months of focused development without giving up equity. Apply in Month 1, not Month 6.

**Phase 2: Pre-Seed Raise (Month 9-12) — Only if Warranted**

Raise when you have:
- 5,000+ monthly active users
- Revenue growing month-over-month (even if small)
- Clear product-market fit signals (engagement, retention, user feedback)
- A specific use of funds (hire developer, scale data, paid acquisition)

**Raise details:**
- Target: $150K-500K pre-seed
- Use: 12-18 months runway with 1-2 hires
- Don't raise more than needed. Dilution at pre-seed is expensive.

**Target investors:**
- **Travel-focused angels:** AngelList travel/hospitality vertical
- **Wellness/consumer health investors:** Understand the sober-curious macro trend
- **Canadian-focused funds:** Impression Ventures, Relay Ventures, Golden Ventures, Luge Capital
- **NA beverage venture arms:** Athletic Brewing has invested in aligned brands. Diageo Ventures (Seedlip's parent)
- **Accelerators:** Techstars (travel vertical), Y Combinator (when you have traction), Creative Destruction Lab (Canadian, strong AI focus)

**What NOT to do:**
- Don't pitch VCs before meaningful traction (they want hockey sticks)
- Don't take money from investors who don't understand sober-curious (you'll waste time educating them)
- Don't skip the grant applications — it's literally free money for AI development in Canada

---

## 12. Key Metrics & KPIs

### Core Metrics by Stage

**Launch Metrics (Month 1-3) — "Is anyone using this?"**

| Metric | Target | Tool |
|---|---|---|
| Website visitors | 1,000-3,000/month | PostHog |
| AI conversations started | 200-500/month | Internal logging |
| Itineraries generated | 100-300/month | Internal logging |
| Email subscribers | 200-500 | ConvertKit |
| Avg. conversation length | 3+ messages | Internal logging |
| Affiliate click-through rate | 3-5% of itinerary viewers | Affiliate dashboard |
| Venue profiles in database | 150+ | Internal count |

**Growth Metrics (Month 4-8) — "Is this working?"**

| Metric | Target |
|---|---|
| Monthly visitors | 5,000-15,000 |
| AI conversations/month | 1,000-3,000 |
| Itineraries saved/shared | 200-500/month |
| Affiliate bookings/month | 30-80 |
| Featured listings sold | 10-20 |
| Email subscribers | 1,500-3,000 |
| Cities covered | 15-20 |
| Venue database size | 400+ |
| SEO keywords ranking page 1 | 15-30 |
| Return visitor rate | >25% |

**PMF Metrics (Month 9-12) — "Is this a real business?"**

| Metric | Target |
|---|---|
| Monthly visitors | 20,000-50,000 |
| AI conversations/month | 5,000-10,000 |
| AI-to-booking conversion | 2-4% |
| Monthly revenue | $2,000-5,000 |
| B2B clients (pilot) | 3-5 |
| User-submitted reviews | 50-100/month |
| NPS score | 40+ |
| Brand partnership pipeline | 5-10 active conversations |

### AI-Specific Metrics (Track from Day 1)

| Metric | What It Tells You |
|---|---|
| Conversations per user | Engagement depth — are people using the AI or bouncing? |
| Itineraries completed (not abandoned) | Product quality — is the AI delivering useful results? |
| Venues recommended per itinerary | Data coverage — are you constrained by database size? |
| "I don't have data for that city" rate | Expansion priority signal |
| User thumbs up/down on responses | AI quality over time |
| Hallucination rate (QA check) | Trust maintenance — this MUST stay near zero |
| Dry Score accuracy (user-reported) | Data quality — are your ratings trustworthy? |

### North Star Metric

**"Completed itineraries with at least one booking click."**

This captures the full value chain: user engaged with the AI → got a useful result → took action toward booking. It's the single number that tells you whether the product is working.
---

# PART 2: ADHD-FRIENDLY ACTION PLAN (Revised for AI-Native Product)

---

## Philosophy

Every task ≤25 minutes. Highest-dopamine tasks first (seeing AI magic > spreadsheet work). Themed sprint days. Built-in rewards. When you finish a task, physically check it off.

**Key shift from v1:** The first week prioritizes getting the AI working, not writing blog posts. Seeing your AI agent recommend sober-friendly bars in Austin is more motivating than a Google Doc with SEO keywords. Build the thing that excites you first.

---

## DAY 1 KICKOFF — Your Next 2 Hours

**Hour 1: Make It Real (Brand + Public Commitment)**

- [ ] **10 min:** Buy the domain. Check drytrip.com, drytrip.co, getdrytrip.com, drytrip.ai. Buy the best available on Namecheap.
- [ ] **10 min:** Open Canva. Create a quick logo for Dry Trip. Don't overthink it — text logo with a clean font + your brand color. Save as PNG.
- [ ] **10 min:** Pick a color palette at coolors.co. Save 2-3 you like. Write down your one-sentence tagline. Draft 5, pick 1. (e.g., "Plan trips worth remembering." / "The AI travel agent for the sober-curious.")
- [ ] **10 min:** Create Instagram (@drytrip or @drytriptravel). Upload logo, write bio with tagline. Follow 20 accounts in sober-curious / travel space. Post a "coming soon" Story.
- [ ] **10 min:** Set up a Notion workspace. Create pages: "Business Plan" (paste this doc), "Dry Score Database" (empty table), "Content Calendar," "Task Tracker," "Outreach Tracker."
- [ ] **10 min:** Set up a landing page on Carrd.co ($19/year). Logo, tagline, email signup ("Be first to plan your sober-friendly trip with AI"), one paragraph describing Dry Trip. Connect to ConvertKit (free tier).

**Hour 2: Touch the AI (Immediate Dopamine)**

- [ ] **5 min:** Sign up for the Claude API at console.anthropic.com. Add $5 credit. Get your API key.
- [ ] **15 min:** Open Cursor. Create a new Next.js project: `npx create-next-app@latest dry-trip --tailwind`. Open it. Run `npm run dev`. See "Hello World" in your browser.
- [ ] **20 min:** Create a simple chat interface. In Cursor, describe what you want: "Create a chat page where I can type a message and see a response. Use the Claude API to respond. The system prompt should say: 'You are Dry Trip, an AI travel agent for sober-curious travelers. Help users plan trips to destinations where they can enjoy great food, nightlife, and experiences without alcohol.'" Let Cursor build it. Get it working.
- [ ] **15 min:** Test it. Type "Plan me a 3-day trip to Austin without alcohol." See what Claude says. It'll be generic (no Dry Score data yet), but you'll see the product concept working. Screenshot this. This is your prototype.
- [ ] **5 min:** Share the screenshot on your personal social media. "Building something. Day 1." Commit publicly.

**✅ Day 1 Reward:** You have a domain, a brand, a landing page, a social presence, and a working AI chat prototype. You went from idea to functional AI in 2 hours. Order your favorite NA drink.

---

## WEEK 1 SPRINT

### Monday: "Build the Database" Day 🗄️

The AI is only as good as the data you feed it. Today you build the foundation.

- [ ] **25 min:** Create the Dry Score database in Supabase. Sign up (free), create a project, create a `venues` table with columns: id, name, city, country, type (hotel/restaurant/bar/experience), dry_score (1-5), na_highlights (text), description (text), price_range, address, website_url, booking_url, google_place_id, latitude, longitude, created_at.
- [ ] **25 min:** Research Austin mocktail bars. Google "best mocktail bars Austin 2025" and "alcohol free bars Austin." Open the top 10 results. For each venue, note: name, type, website, what makes it sober-friendly.
- [ ] **25 min:** Enter 10 Austin bar/restaurant venues into your Supabase database. For each: name, city, type, your estimated Dry Score, NA highlights (e.g., "12-item mocktail menu, craft NA cocktails, no pressure to drink"), short description, website URL.
- [ ] **25 min:** Research Austin hotels. Google "Austin hotel non-alcoholic minibar" and "Austin wellness hotel." Check top 5 hotel websites for AF amenities. Enter into Supabase.
- [ ] **25 min:** Research Austin experiences (live music venues that aren't bars-first, food tours, outdoor activities, wellness). Enter 5-10 into Supabase.
- [ ] **25 min:** You should now have ~25 Austin venues in your database. Review them. Make sure Dry Scores feel consistent. Write a 1-paragraph "Dry Score Methodology" doc in Notion so you're consistent as you scale.

**Deliverable:** Supabase database with ~25 Austin venues, each with a Dry Score and NA highlights.

### Tuesday: "Connect the AI to Your Data" Day 🤖

This is the magic day. The AI goes from generic to specific.

- [ ] **25 min:** In Cursor, connect your Next.js app to Supabase. Install `@supabase/supabase-js`. Create a helper function that queries venues by city.
- [ ] **25 min:** Modify your chat API route: before calling Claude, query Supabase for venues matching the user's destination. Inject the results into the system prompt as context. (e.g., "Here are the verified sober-friendly venues in Austin: [venue data]. Only recommend venues from this list. Never invent venues.")
- [ ] **25 min:** Test it. Ask the AI "Plan me a 3-day trip to Austin, I love food and live music, don't drink." It should now recommend ACTUAL venues from your database with real Dry Scores.
- [ ] **25 min:** Refine the system prompt. Make the AI output structured itineraries: Day 1, Day 2, Day 3 with morning/afternoon/evening activities. Include Dry Scores and NA highlights for each venue. Include booking links where available.
- [ ] **25 min:** Test edge cases. Ask for a city you DON'T have data for (Barcelona). The AI should say: "I don't have verified sober-friendly venue data for Barcelona yet — it's coming soon! In the meantime, here are general tips for sober travel in Barcelona." NOT hallucinate venues.
- [ ] **25 min:** Test 5 more Austin queries with different preferences (budget traveler, luxury, nightlife-focused, wellness-focused). Note where the AI is strong and weak. Log issues in Notion.

**Deliverable:** Working AI agent that recommends real, verified venues from your database. This is your MVP product.

### Wednesday: "Make It Beautiful" Day 🎨

The AI works. Now make it look like a real product.

- [ ] **25 min:** Design the chat interface. Use Tailwind to make it clean and inviting. Your brand colors, your logo in the header, a placeholder "Try asking: 'Plan a sober trip to Austin'" in the chat input.
- [ ] **25 min:** Create venue cards that display in the chat response. Each card shows: venue name, type badge, Dry Score (visual stars or number), one-line NA highlight, "Book →" button (links to booking URL).
- [ ] **25 min:** Create a homepage. Hero section: headline ("Plan sober-friendly trips with AI"), subheadline, big "Start Planning" button that opens the chat. Below: "How it works" 3-step section, sample itinerary screenshot, email signup.
- [ ] **25 min:** Create a simple venue page template: `/venues/[slug]`. When someone clicks a venue card, they see: full description, Dry Score with breakdown, NA menu highlights, map, photos (placeholder for now), booking button.
- [ ] **25 min:** Create a city page template: `/destinations/austin`. Hero, intro text, grid of featured venues, "Plan your Austin trip →" CTA to the AI agent.
- [ ] **25 min:** Deploy to Vercel with your custom domain. Push to GitHub, connect Vercel, configure your domain DNS. Get drytrip.com (or your domain) pointing to the live site.

**Deliverable:** Live, styled website on your custom domain with AI chat, homepage, venue pages, and city page.

### Thursday: "Data Expansion" Day 📊

More data = better AI recommendations = more cities you can serve.

- [ ] **25 min:** Research NYC sober-friendly bars. Google "best mocktail bars NYC 2025," "alcohol free bars New York," "sober nightlife NYC." Pull top 15 venues.
- [ ] **25 min:** Enter 15 NYC bar/restaurant venues into Supabase with Dry Scores and NA highlights.
- [ ] **25 min:** Research NYC hotels with AF focus. Enter 5-8 hotels.
- [ ] **25 min:** Research NYC experiences (Broadway shows, food tours, wellness, comedy clubs, museums). Enter 5-8.
- [ ] **25 min:** Research London. Same process — bars, restaurants, hotels. Enter 15-20 venues. (London has a strong AF bar scene — Sans Bar, Redemption Bar, etc.)
- [ ] **25 min:** Test the AI for NYC and London queries. Verify it pulls correct venues. Fix any data issues.

**Deliverable:** Database expanded to ~75-80 venues across Austin, NYC, London. AI works for 3 cities.

### Friday: "Launch Prep & Outreach" Day 🚀

- [ ] **25 min:** Create 5 pieces of social content in Canva: 1 "What is Dry Trip" intro, 1 AI demo screenshot, 1 stat graphic ("60% of FlashPack travelers don't drink often"), 1 venue spotlight, 1 question post. Schedule via Buffer or Later.
- [ ] **25 min:** Record a 60-sec TikTok: screen recording of you using the Dry Trip AI to plan a trip. Voiceover: "I'm building the AI trip planner for people who don't drink. Watch me plan 3 days in Austin in 60 seconds." Post it.
- [ ] **25 min:** Draft outreach email template for NA brands. Send to Athletic Brewing and Seedlip. "We're building an AI travel planner for sober-curious travelers. Your brand is in our venue recommendations. Want to explore a partnership?"
- [ ] **25 min:** Draft outreach email for sober travel companies. Send to Capsule Adventures and We Love Lucid. "We're building the AI planning layer for sober travel. Your audience plans independent travel too — let's co-market."
- [ ] **25 min:** Write a Twitter/X thread: "I'm building an AI startup for sober travelers. Here's why this is a $100B market nobody's serving." Use stats from your business plan. Post it.
- [ ] **25 min:** Draft your Product Hunt launch copy. You won't launch this week, but having the copy ready means you can launch in Week 2-3 when you have more data.

**Deliverable:** Social content scheduled, outreach sent, Product Hunt draft ready, TikTok posted.

**✅ End of Week 1 Reward:** You have a live AI travel agent, 75+ venues across 3 cities, social presence, and outreach in motion. Take Saturday completely off. You earned it.

---

## WEEKS 2-4 PLAN

### Week 2: "Content + Data Scale"

- [ ] Write and publish your first 2 SEO destination guides (Austin + NYC) on the site. Each guide: 1,500 words, venue recommendations with Dry Scores, CTA to the AI agent.
- [ ] Add 2 more cities to the database (LA + Melbourne). Target 30 venues each.
- [ ] Apply to Booking.com and Viator affiliate programs.
- [ ] Apply to IRAP and Futurpreneur grants. (Do this NOW, not later.)
- [ ] Post 5x on Instagram, 2x on TikTok.
- [ ] Send first newsletter to email list.
- [ ] Product Hunt soft-launch or "Ship" page to start collecting upvotes.

### Week 3: "Polish + Partnerships"

- [ ] Publish 2 more destination guides (London + LA). Total: 4 guides live.
- [ ] Refine AI prompt based on user testing feedback. Improve itinerary structure, add budget awareness, handle multi-day trips better.
- [ ] Integrate affiliate links into AI responses (Booking.com for hotels, Viator for experiences).
- [ ] Pitch 3 media outlets (Forbes Travel, Well+Good, Skift).
- [ ] Submit to 5 AI tool directories (There's An AI For That, FutureTools, etc.).
- [ ] Post in 3 Reddit communities (genuine value, not spam).
- [ ] Follow up on brand outreach emails sent Week 1.

### Week 4: "Soft Launch"

- [ ] Target: 150+ venue profiles across 5 cities. AI works reliably for all 5.
- [ ] Soft launch: share broadly across all channels, email list, Reddit, personal network.
- [ ] Product Hunt launch (if ready) or schedule for early Month 2.
- [ ] Reach out to 5 travel bloggers/influencers for coverage.
- [ ] Set up PostHog analytics properly. Track: page views, AI conversations, itineraries generated, affiliate clicks.
- [ ] Review all Week 1-4 metrics. What's working? What's not?
- [ ] Plan Month 2 priorities based on data.

---

## MONTH 2-3 PLAN

### Month 2: "Growth + First Revenue"

**Product:**
- Expand to 10-15 cities, 300+ venue profiles
- Add user feedback mechanism (thumbs up/down on AI responses + "Report inaccuracy" on venues)
- Improve AI: multi-day trip planning, budget tracking, dietary preferences alongside sober preferences
- Add "Is this hotel sober-friendly?" standalone checker tool (viral/embeddable)

**Content & SEO:**
- Publish 8 more destination guides (12 total)
- Monitor keyword rankings — update guides based on performance
- Guest post on 2-3 travel/wellness blogs

**Revenue:**
- Onboard first 5-10 featured listings ($100-200/month each)
- Close first brand partnership ($3K-5K)
- First affiliate commissions should start trickling in
- Pitch first B2B pilot to 3-5 hotels (offer free 30-day trial of premium placement + Dry Score audit)

**Community:**
- Hit 1,000 social followers (combined)
- Newsletter: 500+ subscribers
- Start collecting user testimonials

### Month 3: "MVP Launch + Validation"

**Product:**
- Official MVP launch. Press release + full media push.
- 15+ cities, 400+ venues
- AI agent handles 80%+ of trip queries without fallback to "we don't have data for that city"
- Filtering: by city, venue type, Dry Score, price range

**Revenue:**
- Target: $500-1,500/month from affiliates + listings + first brand deal
- B2B: convert 1-2 pilot hotels to paying clients

**Validation:**
- Survey your users. What do they love? What's missing? What would they pay for?
- Analyze AI conversation logs: what are people asking for that you can't serve yet?
- Track North Star Metric: "Completed itineraries with at least one booking click"
- NPS survey to early users

**Decision point:** Based on validation data, decide:
- Bootstrap further? (if metrics are growing but slowly)
- Start fundraising conversations? (if PMF signals are strong)
- Pivot B2B-first? (if hotels are converting but consumer traction is slow)

---

## "STUCK? DO THIS" — 5 Low-Effort Tasks When Motivation Is Low

All <15 minutes. Minimal brainpower. Still move the needle.

1. **[ ] Add 3 venues to the database.** Google "best mocktail bar [pick a random city]," grab top 3 results, enter name + website + estimated Dry Score into Supabase. 5 minutes. Your moat just got 3 venues wider.

2. **[ ] Test the AI with a weird query and log the result.** Try "plan me a sober bachelorette party in Nashville" or "what's the best sober nightlife in Tokyo." If the AI handles it well, great. If not, note the failure in your Notion log. Every failure is a product improvement roadmap item. 5 minutes.

3. **[ ] Comment on 5 sober-curious Instagram or Reddit posts.** Genuine engagement, not self-promo. "Love this! What was your favorite NA cocktail there?" Builds visibility without creating anything. 10 minutes.

4. **[ ] Send 1 outreach email.** Copy your template, swap the brand/venue name, personalize one line, hit send. One email can open a door. 5 minutes.

5. **[ ] Improve one AI prompt instruction.** Open your system prompt file. Add one improvement: maybe "When recommending hotels, always mention the minibar situation" or "End every itinerary with a 'Pro tip' about sober travel in that city." Small prompt tweaks have outsized impact. 10 minutes.

---

## ACCOUNTABILITY SYSTEM

### Weekly Check-In (Every Sunday, 15 min)
- [ ] Review what you completed this week
- [ ] Check metrics: visitors, AI conversations, email signups, social followers
- [ ] Rate your energy/motivation 1-10
- [ ] Identify the #1 thing that moved the needle most
- [ ] Set 3 priorities for next week (no more than 3)
- [ ] Post a weekly update somewhere public (Twitter, community group, or accountability partner)

### Milestone Rewards

| Milestone | Reward |
|---|---|
| Day 1 completed (AI prototype working) | Favorite NA drink |
| Week 1 completed (live product, 3 cities) | Take Saturday fully off, no guilt |
| 50 venues in database | Fancy dinner at a restaurant you'd feature on Dry Trip |
| First AI conversation from a stranger | Screenshot it. Tell someone you trust. This is real. |
| Website live on custom domain | Post a "we're live" celebration on social |
| First $1 in affiliate revenue | Frame the screenshot. First dollar is the hardest. |
| IRAP grant approved | Champagne (NA, obviously) |
| 1,000 email subscribers | Buy yourself something you've been wanting |
| First brand partnership signed | Take a weekend trip and test venues for Dry Trip |
| First B2B client pays | Plan a proper celebration. You have a real business. |

---

## NOTION TEMPLATE STRUCTURE

### Task Tracker Database
Columns: Task Name | Status (To Do / In Progress / Done / Blocked) | Sprint Day Theme | Time Estimate (min) | Priority (🔴🟡🟢) | Due Date | Notes

### Dry Score Database (mirrors Supabase)
Columns: Venue Name | City | Country | Type (Hotel / Restaurant / Bar / Experience) | Dry Score (1-5) | NA Highlights | Price Range | Booking URL | Website | Status (Researched / In Supabase / Published) | Notes

### Content Calendar
Columns: Title | Type (Guide / Listicle / Social / Newsletter / Video) | Status | Target Keyword | Publish Date | Platform | URL | CTA (link to AI agent?)

### Competitor Tracker
Columns: Competitor | Category (Sober Travel / AI Planner / NA Finder) | URL | What They Do Well | What They Miss | Threat Level | Screenshots | Last Reviewed

### Outreach Tracker
Columns: Contact/Brand | Type (Media / NA Brand / Venue / Influencer / Sober Travel Co / Hotel B2B) | Status (Draft / Sent / Replied / Meeting / Closed / Dead) | Email | Notes | Date Sent | Follow-Up Date

### AI Quality Log
Columns: Query | Date | Response Quality (Good / OK / Bad) | Issue | Fix Needed | Fixed? | Notes

### Grant Applications
Columns: Program | Amount | Deadline | Status (Researching / Drafting / Submitted / Approved / Rejected) | Documents Needed | Contact | Notes

---

*This is a living plan. Revisit and revise monthly. The best plan is the one you actually execute. When in doubt, do the next small thing.*
