# Dry Trip Positioning Framework

Last Update: March 2026

## POSITIONING STATEMENT

For **travellers who don't drink (or don't always want to)** who **struggle to find venues that take the non-alcoholic experience seriously**, **Dry Trip** is an **AI-powered travel planner and verified venue directory** that delivers **curated, scored, and trustworthy recommendations for hotels, restaurants, and bars with exceptional alcohol-free programmes**.

Unlike **general AI trip planners (Layla, Mindtrip, ChatGPT)** which hallucinate venue details and have no verified alcohol-free data, or **bar rating systems (Pinnacle Guide, Michelin)** which rate overall quality with NA options as an afterthought, Dry Trip **is the only platform that rates venues specifically on the quality of their non-drinking experience, backed by a proprietary Dry Score and real venue data that the AI is grounded in**.

---

## CUSTOMERS

### Customers That Care

- **Sober-curious travellers** exploring a life with less alcohol who want to know they won't be stuck with sparkling water at dinner
- **People in recovery** who need to plan trips with certainty that venues genuinely cater to non-drinkers, not just tolerate them
- **Health-conscious luxury travellers** who prioritise wellness, sharp mornings, and full autonomy over their experience
- **Pregnant travellers** looking for restaurants, bars, and hotels where they can still have an elevated evening without alcohol
- **Partners/friends of non-drinkers** who want to plan group trips that work for everyone without making it awkward
- **Dry January / Sober October participants** who discover they enjoy not drinking and want to maintain the lifestyle when they travel
- **Hospitality professionals and NA brand marketers** who want to understand the competitive landscape of alcohol-free programmes worldwide
- **Travel planners and concierges** serving clients with dietary or lifestyle preferences around alcohol

### Customer Use Cases

- Planning a 3-day trip to London and wanting every dinner, bar visit, and hotel to have great non-alcoholic options
- Searching for a date night restaurant in Berlin where the zero-proof cocktails are as thoughtful as the wine list
- A couple where one person drinks and one doesn't, looking for bars they'll both enjoy
- A wellness-focused traveller checking if a boutique hotel has an alcohol-free minibar before booking
- Someone moving to a new city (e.g., Melbourne, Copenhagen) and wanting to find their local NA spots before arriving
- A group organiser planning a hen/stag weekend that doesn't revolve around getting drunk
- A travel writer or influencer researching the best zero-proof experiences in a city for a feature

### Customer Problems & Pain Points

- **No reliable way to find venues that genuinely cater to non-drinkers.** Google doesn't distinguish between a bar with one mocktail and a bar with a 15-item zero-proof programme. The information doesn't exist in a structured way.
- **AI trip planners hallucinate.** Ask ChatGPT for "alcohol-free bars in London" and it will confidently recommend venues that don't exist, or describe NA menus that are fabricated. Users can't trust the output.
- **Venue websites bury or omit their NA offerings.** Even venues with great alcohol-free programmes rarely feature them prominently. You have to dig through menus, call ahead, or just show up and hope.
- **Existing rating systems ignore the non-drinking experience.** Michelin rates food quality. TripAdvisor rates overall experience. Pinnacle Guide rates cocktail craft. None of them rate how well a venue serves people who don't drink.
- **Social pressure and awkwardness.** Non-drinkers often feel like an afterthought at venues. Finding places where not drinking is normal—or even celebrated—requires word-of-mouth knowledge that's hard to access.
- **Planning trips around not drinking is exhausting.** It requires checking multiple sources, reading reviews for stray mentions of "mocktails," and still arriving unsure. The cognitive load is disproportionate to the task.
- **Fear of missing out on the "real" experience.** Travellers worry that skipping alcohol means skipping the best parts of a city's nightlife and dining culture. They need proof that great experiences exist without it.

---

## PRODUCT & OFFERING

### What are the product capabilities?

- Browse a curated directory of 107+ verified venues across 7 cities, filtered by category, neighbourhood, and Dry Score
- Chat with an AI trip planner that builds personalised, day-by-day itineraries grounded in real venue data
- View each venue's Dry Score (1 - 5), top non-alcoholic drink, vibe tags, and neighbourhood on an interactive map
- Email a complete trip plan to yourself for offline reference
- Discover venues through spatial exploration (interactive Mapbox map with category-coded pins and clustering)
- Click through to book or visit a venue directly from the directory or AI response
- Read the methodology behind every score for full transparency

### What are the product features?

- **Dry Score rating system** — proprietary 1 - 5 scale rating the quality of a venue's alcohol-free experience, not just whether they serve NA drinks
- **AI trip planner** — Claude Sonnet-powered conversational planner that only recommends verified venues, never hallucinates, and structures itineraries by day and neighbourhood
- **Interactive map** — Mapbox GL JS with category-coded pins (Hotel = amber, Restaurant = sage, Bar = sandstone), pin size by Dry Score, clustering, and click-through popups
- **Venue detail pages** — SSG pages with Dry Score explanation, top NA drink spotlight, "Why we recommend it" bullets, mini-map with nearby venues, and booking CTA
- **Email-your-plan** — one-click branded HTML email of the full conversation, formatted with both sides of the dialogue
- **City directory pages** — per-city SEO-optimised pages with category/neighbourhood filters, search, and sort
- **Email capture** — 2 free AI messages, then email gate to continue planning (captures highest-intent users)

### What are the product benefits?

- **Eliminates guesswork** — every venue has been researched, scored, and verified. No more Googling "does this bar have mocktails."
- **Saves hours of research** — the AI planner builds a complete multi-day itinerary in minutes, not hours of tab-switching and review-reading
- **Builds confidence** — knowing your Dry Score 5 restaurant has a world-class NA programme means you show up relaxed, not anxious
- **Prevents bad experiences** — a Dry Score of 2 tells you "they have some options but it's not a destination for it." No surprises.
- **Discovers venues you'd never find** — bars and restaurants with hidden NA programmes that don't advertise them prominently
- **Makes not drinking feel normal** — the entire platform treats alcohol-free as a positive choice, not a restriction
- **Works for mixed groups** — helps plan trips where drinkers and non-drinkers both have great options

### Key Unique Attributes

- **Proprietary Dry Score** — the only structured rating system for alcohol-free venue quality, anywhere. Nobody else scores this axis.
- **Verified venue database** — 107 venues across 7 cities, each researched through menu analysis, review mining, and human review. Not scraped. Not crowdsourced.
- **Grounded AI** — the trip planner only recommends venues from its verified database. It cannot hallucinate because it doesn't generate venue information—it retrieves it.
- **Spatial discovery** — the interactive map lets you see the NA landscape of a city at a glance. Chatbots can't do this.
- **Editorial voice** — the AI speaks like a knowledgeable concierge, not a search engine. Confident, specific, opinionated. "Go here" instead of "you might consider."
- **First-mover in a growing market** — the sober-curious movement is accelerating, and no dedicated product exists for this audience at this quality level.
- **Brand identity** — "clear-headed luxury travel" positions alcohol-free as aspirational, not clinical. The design language (linen, forest, sandstone) signals premium editorial, not medical or recovery-focused.

### Embedded Value (and Proof)

- 107 published venues across 7 cities (London, New York, Berlin, Melbourne, Los Angeles, Copenhagen, Dubai)
- Every venue fact-checked via Perplexity Deep Research audit (March 2026)
- All venue descriptions rewritten in human voice with anti-AI-slop filtering
- 100% of published venues have verified coordinates for map display
- Dry Score methodology published transparently at /methodology
- AI chat rate-limited and grounded—zero hallucination by design
- Built and launched in under 3 weeks from concept to live product

### How does the product work?

1. **Discover** — A traveller finds Dry Trip through search, social media, or word of mouth
2. **Browse** — They explore the directory and map for their destination city, filtering by category and neighbourhood
3. **Plan** — They open the AI trip planner and describe their trip. The AI builds a personalised itinerary using verified venues.
4. **Save** — They email the plan to themselves or copy it for offline use
5. **Go** — They click through to book or visit venues directly, armed with Dry Score confidence

### What does it look like?

- Clean, editorial design with a warm palette (linen background, forest text, sandstone accents)
- Serif headings (Cormorant Garamond) paired with clean sans-serif UI text (Montserrat)
- Interactive Mapbox map with custom-styled pins matching the brand palette
- Conversational AI interface with suggested prompts, inline markdown rendering, and branded email output
- Mobile-responsive across all pages with touch-optimised controls
- No stock photography—typography-led design that feels premium and intentional

---

## MARKET / PRODUCT CATEGORY / FRAME OF REFERENCE

### Market Category

- AI Travel Planner
- Alcohol-Free Lifestyle Platform
- Travel Venue Directory
- Wellness Travel Guide
- Sober-Curious Travel Resource
- Luxury Travel Recommendation Engine
- Niche Travel Discovery Platform

### Relevant Trends

- **Sober-curious movement** — 30% of UK adults now identify as non-drinkers or low-drinkers. The demographic is growing fastest among 18 - 35s.
- **Rise of zero-proof spirits and cocktails** — brands like Seedlip, Lyre's, and Athletic Brewing have created a multi-billion dollar NA beverage market, driving venue adoption of NA programmes.
- **AI-powered travel planning** — Layla.ai, Mindtrip, and Google AI Mode are normalising conversational trip planning. Users expect it.
- **Wellness tourism boom** — the global wellness tourism market is projected to reach $1.3 trillion by 2028. Alcohol-free travel is a natural extension.
- **Mindful drinking culture** — Dry January participation has doubled in 5 years. "Mindful drinking" is entering mainstream vocabulary.
- **Demand for verified, trustworthy recommendations** — post-AI-slop fatigue is driving demand for curated, human-verified content over algorithmically generated suggestions.
- **Premiumisation of non-alcoholic experiences** — luxury hotels and Michelin restaurants are investing in NA programmes as a differentiator, creating supply that needs a discovery layer.

---

## COMPETITIVE ALTERNATIVES

### If you didn't exist, what would customers use?

#### Direct Competitors (same JTBD: find great alcohol-free venues when travelling)

There are **no direct competitors** offering a verified, scored directory of alcohol-free venue quality combined with an AI trip planner. This category effectively does not exist yet. Dry Trip is creating it.

The closest things people use today are:

- **Club Soda Guide (UK)** — community-submitted listings of "mindful drinking" venues. Unverified, no scoring system, UK-only, no AI, basic UX.
- **Dry Atlas (US)** — lists NA bottle shops and "sober bars." More focused on NA product retail than venue experiences. No scoring, no trip planning.
- **Zero Proof Nation (US)** — Instagram-first community recommending NA products and occasional bar mentions. Not a structured venue tool.

#### Secondary Competitors (same JTBD: plan trips with great food/drink, different solution)

*Global:*
- **Layla.ai** — AI trip planner with millions of users, $49.95/yr premium. End-to-end booking integration. No alcohol-free data. Will hallucinate NA offerings if asked.
- **Mindtrip** — backed by Amex Ventures, Capital One, United Airlines Ventures. Conversational travel planning. Zero awareness of alcohol-free considerations.
- **ChatGPT / Google AI Mode** — unlimited resources, can answer anything. Will confidently fabricate venue names, NA menus, and Dry Scores that don't exist. No verification layer.
- **Perplexity AI** — can research venues in real-time. Better than ChatGPT for factual accuracy but still no structured alcohol-free data. Requires the user to know what to ask.
- **TripAdvisor** — the legacy directory. Massive database but no NA-specific filtering. You'd have to read hundreds of reviews hoping someone mentions mocktails.
- **Google Maps** — universal discovery tool. No way to filter for quality of NA experience. A "4.5 star bar" tells you nothing about whether they serve decent zero-proof drinks.
- **The Infatuation / Eater** — editorial restaurant guides with strong voice. Occasionally mention NA drinks but it's never the focus. No structured scoring.

*UK-specific:*
- **Time Out London** — editorial city guide. Occasional "best mocktail bars" listicle that's outdated within months. No ongoing verification.
- **SquareMeal** — UK restaurant booking platform. Filters for cuisine, price, occasion—never for quality of NA drinks.

#### Indirect Competitors (different JTBD: rate overall venue quality)

- **Michelin Guide** — rates food quality at restaurants. May mention NA pairings as a footnote. Does not rate hotels or bars for NA experience. The gold standard for dining, irrelevant for this specific need.
- **The Pinnacle Guide** — rates cocktail bar excellence (1 - 3 PINs). Requires venues to have 2+ NA cocktails as a baseline. But their focus is cocktail craft, not the non-drinking experience. Having a PIN means decent NA options exist—it doesn't mean the venue is great for someone who doesn't drink.
- **The World's 50 Best Bars** — prestige ranking for cocktail bars globally. Some listed bars have world-class NA programmes (e.g., Lyaness, Connaught Bar). But the list is about cocktail excellence, not NA quality. No filtering or scoring for non-drinkers.
- **Forbes Travel Guide** — luxury hotel ratings. Evaluates service, facilities, dining. An AF minibar or NA room service programme would be invisible in their rating.
- **Condé Nast Traveller / Travel + Leisure** — luxury travel editorial. Occasional feature on "best hotels for wellness" that might tangentially touch on NA options. Not a dedicated resource.

### How do these alternatives fall short for customers?

**Club Soda Guide:**
Community-submitted listings with no verification or scoring. A venue can self-list with zero quality check. The UX is dated. UK-only. No trip planning capability. Useful as a starting point but unreliable as a decision-making tool.

**Dry Atlas:**
Focused primarily on NA product retail (bottle shops, where to buy Seedlip) rather than the venue experience. Useful if you want to buy NA spirits—not useful if you want to find a restaurant with a world-class zero-proof pairing menu.

**Zero Proof Nation:**
An Instagram community, not a tool. Great for discovering NA products but the venue recommendations are scattered across posts with no searchable database, no scoring, and no trip planning.

**Layla.ai:**
Excellent AI trip planner with booking integration and a large user base. But it has zero awareness of alcohol-free venue quality. Ask it for "the best NA bar in London" and it will either hallucinate a venue or recommend a generic cocktail bar. The data layer for this specific need doesn't exist in their system.

**Mindtrip:**
Well-funded, well-designed conversational trip planner. Same fundamental problem as Layla—no structured data on alcohol-free programmes. It can recommend "great bars in Berlin" but cannot distinguish between a bar with warm lemonade and a bar with a 15-item zero-proof cocktail menu.

**ChatGPT / Google AI Mode:**
Will confidently generate detailed recommendations including venue names, addresses, and specific NA drinks—many of which are fabricated. The user has no way to verify the output without doing the research themselves, which defeats the purpose. This is the most dangerous alternative because it feels authoritative while being unreliable.

**Perplexity AI:**
Better than ChatGPT at citing sources, but still lacks structured data. It can find articles mentioning a bar's mocktail menu, but it can't score that bar against others, doesn't maintain a verified database, and requires sophisticated prompting to get useful results.

**TripAdvisor:**
No NA-specific filtering. To find out if a restaurant has good non-alcoholic options, you'd need to search reviews for "mocktail," "non-alcoholic," or "zero proof" and hope someone mentioned it. Even then, you're reading one person's subjective experience with no standardised scoring.

**Google Maps:**
Universally useful for finding venues. Completely useless for assessing the quality of their alcohol-free experience. A 4.8-star restaurant might serve the best food in the city and still hand you a Heineken 0.0 as their only NA option.

**Michelin Guide:**
The definitive authority for restaurant quality. But Michelin rates food, service, and ambiance. A Michelin 3-star restaurant can have an abysmal non-alcoholic experience (many do). Michelin has no mechanism for surfacing NA quality—it's simply outside their rating axis.

**The Pinnacle Guide:**
The closest thing to a relevant authority, as they require 2+ NA cocktails as a baseline for consideration. But they're rating cocktail bar excellence, not the non-drinking experience. A bar can earn 3 PINs for exceptional cocktails while still making non-drinkers feel like second-class guests. The PIN tells you NA options exist—it doesn't tell you they're good or that the venue is welcoming for someone who doesn't drink.

**The World's 50 Best Bars / Forbes / Condé Nast Traveller:**
Prestige authorities that occasionally intersect with alcohol-free quality by accident. Some World's 50 Best bars have incredible NA programmes. But there's no way to discover this through their lists—you'd have to know to look for it. These guides are designed for a drinker's perspective.

**The Infatuation / Eater / Time Out:**
Strong editorial voices with trustworthy recommendations. But alcohol-free coverage is limited to occasional listicles ("Best Mocktail Bars in London") that go stale within months. No ongoing verification, no scoring, no trip planning integration. A single article is useful; a comprehensive, living database is what's needed.
