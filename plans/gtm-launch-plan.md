# Dry Trip GTM Launch Plan

Last Update: March 2026

---

## 1. LAUNCH QUALIFICATION

Before planning channels and tactics, does this deserve a full launch?

| Question | Answer |
|----------|--------|
| Does this change customer behaviour or capability? | **Yes.** There is currently no way for non-drinkers to search, filter, and plan trips by quality of alcohol-free experience. Dry Trip creates an entirely new behaviour. |
| Is this differentiated from competitors? | **Yes.** No other platform scores venues on their NA programme. Club Soda lists, but doesn't score. AI planners recommend, but hallucinate. Michelin and Pinnacle ignore NA entirely. |
| Does this open new markets or segments? | **Yes.** The sober-curious, wellness, and alcohol-free travel segments have no dedicated planning tool. This is a new category. |
| Will customers notice if we don't announce it? | **No.** They won't find it organically—the category doesn't exist yet. Without a launch, Dry Trip sits undiscovered. |

**Verdict: This is a launch. Proceed to sizing.**

---

## 2. LAUNCH SIZING

### Priority Matrix

| | Retention | Acquisition |
|---|---|---|
| **Differentiated** | Priority #2 | **Priority #1** |
| **Parity** | Priority #3 | Priority #2 |

### Dry Trip Placement

- **Customer Impact:** Acquisition — there are no existing customers. This is a net-new product entering a net-new category.
- **Market Innovation:** Differentiated — no other platform scores venues on their alcohol-free experience. The Dry Score is proprietary and novel.

### **Launch Priority: #1 — Full GTM Execution**

Innovative product that wins new customers in an uncontested category. Warrants maximum effort across channels.

**However:** Dry Trip is a solo-founder MVP. "Full GTM execution" means activating every high-leverage channel within a one-person capacity. This plan optimises for impact-per-hour, not coverage breadth.

---

## 3. INTERNAL ALIGNMENT CHECK

Since Dry Trip is a solo operation, "internal alignment" means product and infrastructure readiness.

| Area | Status | Action Needed |
|------|--------|---------------|
| Product readiness | MVP live — directory, AI planner, email plan, email gate | OG images, favicon, spot-check 52 venues scoring 3 - 4 |
| Venue data quality | 107 venues across 7 cities, all with Dry Scores | Run verification SQL, backfill any missing coordinates |
| AI planner reliability | Grounded in real venue data, rate-limited, email-gated | Tested — no hallucination risk on verified venues |
| Email infrastructure | Resend configured, email plan working | Switch from `onboarding@resend.dev` to `hello@drytrip.co` |
| Analytics | PostHog events for key funnel steps | Verify all events fire correctly |
| Legal / Privacy | Privacy policy, cookie notice | Need to add before launch |
| Domain / Hosting | Vercel, drytrip.co | Confirm production domain is configured |

### Pre-Launch Blockers (Must Fix Before Launch Day)

1. OG images for social sharing (city pages, homepage, venue pages)
2. Favicon and social share image
3. Privacy policy page
4. Switch Resend to custom domain (`hello@drytrip.co`)
5. Spot-check venue data quality (52 venues scoring 3 - 4)
6. Verify PostHog analytics funnel events

### Pre-Launch Nice-to-Haves (Do If Time Allows)

- Add 1 - 2 more cities with 10+ venues each
- Structured data (Schema.org) for venue pages
- A `/press` or `/about` page with founder story

---

## 4. LAUNCH STRATEGY

### Launch Type: Category-Creation Launch

Dry Trip isn't entering an existing category — it's creating one. The launch message isn't "we're better than X." It's "this thing you've been struggling with? Someone finally built a solution."

### Core Launch Narrative

**The problem no one's solved:**
Millions of people travel without drinking. There's nowhere for them to plan trips. Google doesn't filter for it. AI planners hallucinate it. Travel guides ignore it. Dry Trip is the first platform that rates venues on the quality of their alcohol-free experience.

### Launch Angles (in priority order)

| Angle | Target Persona | Channel |
|-------|---------------|---------|
| "The travel guide rated for people who don't drink" | Mia (sober-curious) | Instagram, TikTok, SEO |
| "107 venues. Every one verified. Zero hallucinations." | James (long-term sober) | Email, Reddit, sober communities |
| "Clear-headed luxury travel" | Priya (luxury/wellness) | PR, Instagram, editorial partnerships |
| "Plan a group trip that works for everyone" | Sophie (group planner) | TikTok, Instagram, Google search |

---

## 5. GTM CHANNEL PLAN

### Tier 1: High-Impact, Low-Cost (Activate Immediately)

These channels are free or near-free and disproportionately effective for a solo founder.

#### SEO & Content (Ongoing, starts pre-launch)

| Asset | Purpose | Priority |
|-------|---------|----------|
| City guide blog posts ("Best alcohol-free bars in London") | Capture high-intent search traffic | P1 — write 3 city guides for London, Copenhagen, Melbourne |
| Venue category pages (already built) | Rank for "[city] + non-alcoholic + [category]" queries | P1 — ensure meta descriptions and OG tags are set |
| Methodology page (already built) | Build trust, earn links from journalists and bloggers | P2 — consider expanding with case studies |
| "How Dry Scores Work" explainer content | Earn links and social shares | P2 |

**Target keywords:**
- "best mocktail bars [city]"
- "alcohol-free restaurants [city]"
- "sober travel guide"
- "non-alcoholic travel planner"
- "dry bars near me [city]"
- "sober-friendly hotels [city]"

#### Social Media: Instagram (Primary social channel)

| Content Type | Frequency | Format |
|-------------|-----------|--------|
| Venue spotlights ("Dry Score: 5/5") | 3x/week | Carousel or single image with venue photo + score |
| "Top 3 NA drinks at [venue]" | 2x/week | Reels (15 - 30s) or carousel |
| City guides ("Your weekend in [city], alcohol-free") | 1x/week | Carousel (8 - 10 slides) |
| AI planner demo | 1x/week at launch, then 2x/month | Screen recording Reel |
| User-generated venue visits | As available | Stories reposts |

**Account setup:** Bio links to `/plan` (AI planner), not just homepage. Use Linktree or similar for directory + planner + waitlist.

#### Social Media: TikTok (Secondary, high-reach potential)

| Content Type | Frequency | Format |
|-------------|-----------|--------|
| "Watch me plan an alcohol-free weekend in London" | 2x/week | Screen recording of AI planner |
| "I asked AI to plan a sober trip and..." | 1x/week | Face-to-camera + screen |
| "3 bars in [city] you didn't know had amazing NA cocktails" | 1x/week | Photo slideshow or venue footage |
| Reaction to bad AI travel advice vs. Dry Trip | 1x at launch | Split-screen comparison |

#### Email: Waitlist Launch Sequence

The waitlist already has signups. Launch with a 3-email sequence:

| Email | Timing | Subject Line | Content |
|-------|--------|-------------|---------|
| **1. Launch announcement** | Launch day | "Dry Trip is live. Plan your first trip." | Product overview, link to AI planner, 3 featured venues |
| **2. First city guide** | Day 3 | "Your alcohol-free weekend in London" | Curated 3-day itinerary, top 5 venues, link to directory |
| **3. Social proof + ask** | Day 7 | "107 venues. Here's what people are planning." | Popular AI planner searches, invite to share with a friend |

#### Reddit & Sober Communities (James persona — trust-building)

| Community | Approach | Timing |
|-----------|----------|--------|
| r/stopdrinking | Share as a resource, not a promotion. "I built this because I couldn't find verified NA venues when I travelled." | Launch week |
| r/Sober | Same — personal, genuine, non-promotional | Launch week |
| r/sobertravel (if exists) | Direct relevance | Launch week |
| Club Soda community / forum | Reach out as a complementary resource | Pre-launch |
| Sober podcasts (Sober Curious, Recovery Happy Hour) | Pitch as a guest or offer as a resource to share | Pre-launch outreach, launch week air |

**Critical note:** These communities are allergic to marketing. Lead with the story, the problem, and the data. Don't sell.

---

### Tier 2: Medium-Effort, High-Credibility (Activate at Launch)

#### PR & Media Outreach

Dry Trip's launch angle is newsworthy: it's a new category, tied to a cultural trend (sober-curious movement), with a tangible product (not vapourware).

**Press targets (ranked by likelihood and impact):**

| Outlet | Angle | Contact Strategy |
|--------|-------|-----------------|
| Condé Nast Traveller | "The first travel guide rated for non-drinkers" | Pitch to travel tech / wellness editor |
| The Guardian (Travel section) | "Sober travel is booming. Now it has its own trip planner." | Pitch to freelance travel writers |
| Evening Standard (London focus) | "London's best bars for people who don't drink — rated by AI" | Pitch with London-specific data |
| Dry Drinker / NA drinks publications | "How we rate 107 venues on their alcohol-free experience" | Natural audience, high-conversion |
| Time Out London | "The best non-alcoholic nights out in London, rated" | Pitch as a data-driven listicle |
| Skift (travel industry) | "AI travel planning meets the sober-curious boom" | Industry angle, thought leadership |

**Press assets to prepare:**
- One-page press fact sheet (what, why, how, numbers)
- 3 - 5 high-res venue photos (with permission)
- Founder headshot and bio
- 2 - 3 pull quotes / data points for journalists to use
- Methodology one-pager

#### Partnerships: NA Drinks Brands

Non-alcoholic drinks brands have marketing budgets and overlapping audiences. Offer:

| Partner Type | What We Offer | What We Get |
|-------------|---------------|-------------|
| NA spirits (Seedlip, Lyre's, Monday) | Venue data showing where their products are served | Social media cross-promotion, potential co-branded content |
| NA beer (Athletic Brewing, Lucky Saint) | Inclusion in venue spotlights | Audience exposure, newsletter swaps |
| Wellness hotels / groups | Dry Score badge for their listing | Venue credibility, potential co-marketing |

**Start with 2 - 3 outreach emails to NA brands. Low effort, high signal.**

---

### Tier 3: Paid Channels (Activate Post-Launch, Budget Permitting)

Do NOT spend on paid until organic channels are validated and the funnel is converting.

#### When to activate paid:

- Waitlist-to-active conversion rate is above 30%
- AI planner email gate converts above 40%
- At least 100 organic visitors/day
- You have budget to test (minimum £500/month)

#### Paid channel priorities (when ready):

| Channel | Format | Budget | Target |
|---------|--------|--------|--------|
| Instagram/Meta Ads | Carousel ads featuring venue scores | £300/month test | Interest: travel + wellness + sober-curious |
| Google Ads | Search ads on "[city] mocktail bars" keywords | £200/month test | High-intent search terms |
| TikTok Ads | Boosted organic content that performed well | £100/month test | 25 - 40, travel interest |

---

## 6. LAUNCH TIMELINE

### Phase 1: Pre-Launch (2 weeks before launch day)

| Week | Tasks |
|------|-------|
| **Week -2** | Fix pre-launch blockers (OG images, favicon, privacy policy, Resend domain). Prepare press fact sheet. Draft waitlist email sequence. Set up Instagram account with 5 - 7 posts ready to publish. |
| **Week -1** | Reach out to 5 - 10 press contacts. Reach out to 2 - 3 NA brand partners. Finalise and schedule waitlist email sequence. Write first 2 blog posts (city guides). Record 3 TikTok/Reels. Spot-check venue data. Run analytics smoke test. |

### Phase 2: Launch Week

| Day | Action |
|-----|--------|
| **Day 1 (Launch)** | Send waitlist launch email. Publish launch post on Instagram + TikTok. Post to personal LinkedIn / X. Share in 1 - 2 sober communities (Reddit, Club Soda). Publish first blog post. |
| **Day 2** | Respond to all comments and DMs. Monitor analytics for conversion drops. Post a "behind the scenes" Story. |
| **Day 3** | Send waitlist email #2 (city guide). Post venue spotlight on Instagram. Share on a second Reddit community. |
| **Day 4 - 5** | Continue social posting cadence. Follow up with press contacts who opened but didn't reply. Monitor AI planner usage and email gate conversion. |
| **Day 6 - 7** | Send waitlist email #3 (social proof). Publish second blog post. Post TikTok showing AI planner in action. First weekly performance review. |

### Phase 3: Post-Launch (Weeks 2 - 4)

| Week | Focus |
|------|-------|
| **Week 2** | Settle into posting cadence (5x/week Instagram, 3x/week TikTok). Publish 1 blog post. Evaluate PR responses and follow up. Begin NA brand partnership conversations. |
| **Week 3** | First monthly newsletter to all signups. Analyse top-performing content and double down. Evaluate whether to activate paid channels. Add new venues or cities if pipeline is ready. |
| **Week 4** | Full post-launch review (see Section 8). Decide on next city expansion. Plan month 2 content calendar. |

---

## 7. SUCCESS METRICS

### Launch Week Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Waitlist email open rate | > 40% | Resend analytics |
| Waitlist email CTR | > 8% | Resend analytics |
| New email signups (email gate) | 50+ | Supabase waitlist table |
| AI planner conversations started | 100+ | PostHog |
| AI plans emailed | 20+ | Resend send count |
| Directory page views | 500+ | PostHog |
| Instagram followers | 200+ | Instagram insights |
| Press coverage secured | 1 - 2 articles | Manual tracking |

### Month 1 Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Total email signups | 300+ | Supabase |
| Monthly active users (AI planner) | 150+ | PostHog |
| Organic search traffic | 200+ sessions | PostHog / Vercel Analytics |
| Instagram followers | 500+ | Instagram insights |
| Email newsletter subscribers | 200+ | Resend |
| Press mentions | 3 - 5 | Manual tracking |
| NA brand partnership conversations | 2 - 3 active | Manual tracking |

### Key Funnel Metrics (Ongoing)

| Funnel Step | Target Rate |
|-------------|-------------|
| Landing page → AI planner | > 15% |
| AI planner → email gate triggered | > 60% |
| Email gate → email submitted | > 40% |
| Email submitted → plan emailed | > 25% |
| Directory visit → venue click-through | > 10% |

---

## 8. POST-LAUNCH REVIEW FRAMEWORK

Conduct at end of Week 4. Answer these questions:

### Performance

- Did we hit launch week and month 1 targets? Where did we over/under-perform?
- Which channels drove the most signups? The most engaged users?
- What was the email gate conversion rate? Is 2 free messages the right number?
- Which content formats performed best on social?
- Did any press coverage land? What was the response?

### Product

- What are the top 5 AI planner queries? Do they reveal unmet needs?
- Are users emailing plans? Copying plans? Both?
- Which cities and venues get the most traffic?
- Any bug reports or UX friction points from real users?

### Learnings

- What took more time than expected?
- What should we stop doing?
- What should we do more of?
- What's the single highest-leverage action for month 2?

### Next Phase Decision

Based on month 1 data, decide:
- **Expand cities?** Add 1 - 2 new cities if demand signals are strong
- **Activate paid?** Only if organic funnel is converting and CAC math works
- **Build features?** Only if user feedback points to specific gaps
- **Pursue partnerships?** If NA brand conversations show mutual value
- **Monetisation exploration?** If usage data supports a revenue model hypothesis

---

## 9. LAUNCH ASSETS CHECKLIST

### Must Have (Before Launch Day)

- [ ] OG images for homepage, directory, city pages, venue pages
- [ ] Favicon and social share image
- [ ] Privacy policy page
- [ ] Custom Resend domain (`hello@drytrip.co`)
- [ ] Instagram account with 5 - 7 pre-loaded posts
- [ ] Waitlist email sequence (3 emails, drafted and scheduled)
- [ ] Press fact sheet (1-page PDF)
- [ ] 3 - 5 high-res venue photos with permission
- [ ] Founder bio and headshot
- [ ] Blog post #1: "Best alcohol-free bars in London"
- [ ] PostHog analytics verified end-to-end

### Nice to Have (Launch Week)

- [ ] TikTok account with 3 pre-recorded videos
- [ ] Blog post #2: "How Dry Scores work"
- [ ] NA brand outreach emails (2 - 3)
- [ ] Press outreach emails (5 - 10)
- [ ] Reddit post drafts for sober communities
- [ ] LinkedIn launch announcement draft

### Post-Launch (Weeks 2 - 4)

- [ ] Monthly newsletter template
- [ ] Content calendar for month 2
- [ ] Partnership one-pager for NA brands
- [ ] Paid ads creative (if activating)

---

## 10. BUDGET ESTIMATE

| Category | Month 1 | Notes |
|----------|---------|-------|
| Hosting (Vercel) | £0 - £20 | Free tier likely sufficient at launch |
| Email (Resend) | £0 | Free tier: 100 emails/day |
| Analytics (PostHog) | £0 | Free tier sufficient |
| Domain | Already paid | drytrip.co |
| Supabase | £0 - £25 | Free tier likely sufficient |
| AI (Anthropic API) | £10 - £50 | Based on chat volume |
| Instagram / TikTok | £0 | Organic only at launch |
| Press outreach | £0 | DIY, no agency |
| Paid ads (if activated) | £0 - £500 | Only post-validation |
| **Total** | **£10 - £95** | Excluding optional paid ads |

This is a near-zero-cost launch. The primary investment is time, not money.

---

## APPENDIX: KEY DOCUMENTS

| Document | Location | Status |
|----------|----------|--------|
| Positioning Framework | `plans/positioning-framework.md` | Complete |
| Messaging Framework | `plans/messaging-framework.md` | Complete |
| ICP & Personas | `plans/icp-personas.md` | Complete |
| GTM Launch Plan | `plans/gtm-launch-plan.md` | Complete |
| MVP Build Plan | `plans/mvp-build.md` | In progress |
