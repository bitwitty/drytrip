<wizard-report>
# PostHog post-wizard report

The wizard has completed a deep integration of PostHog analytics into Dry Trip. The existing partial integration (PostHogProvider, waitlist form, AI planner, and directory) was extended with server-side event tracking, user identification, additional client-side events, a reverse proxy for better ad-blocker resistance, and error tracking.

## Second pass — error & friction tracking (April 2026)

A follow-up wizard run added 5 server-side error / rate-limit / security events to fill visibility gaps in the critical AI planner and email flows. No existing tracking was modified.

| Event | Description | File |
|---|---|---|
| `chat_rate_limited` | Fires when a user hits the per-IP daily cap (100/day) or per-session message cap (20/session) on the AI planner. Friction signal for the core feature. | `src/app/api/chat/route.ts` |
| `chat_request_errored` | Server-side caught exception during chat request handling. Pairs with `posthog.captureException` for full error tracking. | `src/app/api/chat/route.ts` |
| `plan_email_failed` | Resend API error or caught exception while sending the trip plan email. Pairs with existing `plan_email_sent` for a success-rate view. | `src/app/api/email-plan/route.ts` |
| `admin_auth_failed` | Failed admin password attempt on `/admin/review`. Security signal for brute-force detection. | `src/app/api/admin/auth/route.ts` |
| `ai_chat_retried` | User clicked the Retry button after an AI chat error. UX recovery signal. | `src/app/plan/page.tsx` |

**Other changes in this pass:**

- `src/app/api/chat/route.ts` — Wrapped the handler in try/catch, imported `getPostHogClient`, added `posthog.captureException` on error path, and threaded a `distinctId` from the `x-posthog-distinct-id` header (falling back to IP) so server events correlate with client sessions.
- `src/app/api/email-plan/route.ts` — Added `plan_email_failed` capture for both Resend errors and exception path; added `posthog.captureException` on the catch branch.
- `src/app/api/admin/auth/route.ts` — Imported `getPostHogClient` and added `admin_auth_failed` capture (distinctId = IP) on invalid password.
- `src/app/plan/page.tsx` — Added `ai_chat_retried` capture inside the Retry button's `onClick` handler.

**Note on dashboards:** This pass did not create new PostHog insights (no PostHog MCP was available in this environment). The existing "Analytics basics" dashboard from the first run still applies. Suggested follow-up insights to build manually in PostHog:

- **Chat error rate** (trend) — `chat_request_errored` per day, broken down by `message`
- **Rate limit friction** (trend) — `chat_rate_limited` per day, broken down by `scope` (`ip_daily` vs `session_messages`)
- **Plan email success rate** (formula insight) — `plan_email_sent` / (`plan_email_sent` + `plan_email_failed`)
- **AI error → recovery funnel** — `chat_request_errored` → `ai_chat_retried`
- **Admin brute-force watch** (trend) — `admin_auth_failed` per day, broken down by `ip`

---

## First pass (original wizard run)


## Summary of changes

- **`src/components/PostHogProvider.tsx`** — Added `defaults: "2026-01-30"`, `capture_exceptions: true`, `debug` mode, and switched `api_host` to `/ingest` (reverse proxy).
- **`next.config.ts`** — Added `/ingest` rewrites to proxy PostHog requests through the app (EU region), plus `skipTrailingSlashRedirect: true`.
- **`src/lib/posthog-server.ts`** *(new)* — Server-side PostHog client using `posthog-node` for API route event tracking.
- **`src/app/go/[id]/route.ts`** — Added server-side `venue_outbound_clicked` event (primary conversion tracking).
- **`src/app/api/email-plan/route.ts`** — Added server-side `plan_email_sent` event on successful email delivery.
- **`src/app/plan/page.tsx`** — Added `ai_suggestion_used` event + `posthog.identify()` on both email gate flows.
- **`src/app/directory/[city]/page.tsx`** — Added `directory_search_used` event on search input blur.
- **`src/components/WaitlistForm.tsx`** — Added `posthog.identify()` on newsletter signup success.
- **`.env.local`** — Set `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` and `NEXT_PUBLIC_POSTHOG_HOST`.

## Action required

Run the following to install the server-side PostHog package (blocked during setup due to network sandbox):

```bash
npm add posthog-node
```

## Events

| Event | Description | File |
|---|---|---|
| `newsletter_subscribed` | User successfully joins the waitlist/newsletter | `src/components/WaitlistForm.tsx` |
| `email_gate_completed` | User provides email to unlock continued AI planning | `src/app/plan/page.tsx` |
| `plan_emailed` | User requests their plan be emailed (client-side trigger) | `src/app/plan/page.tsx` |
| `plan_email_prompt_shown` | Email prompt shown inline in planner action bar | `src/app/plan/page.tsx` |
| `plan_copied` | User copies the AI plan to clipboard | `src/app/plan/page.tsx` |
| `ai_conversation_started` | First AI response received in the planner | `src/app/plan/page.tsx` |
| `ai_conversation_depth_3` | User reaches 3 AI responses (engagement milestone) | `src/app/plan/page.tsx` |
| `ai_feedback` | User rates an AI response thumbs up or down | `src/app/plan/page.tsx` |
| `ai_suggestion_used` | User clicks a suggested prompt on the empty state | `src/app/plan/page.tsx` |
| `venue_detail_viewed` | User views a venue detail page | `src/components/VenueDetailTracker.tsx` |
| `venue_outbound_clicked` | User clicks through to a venue's website/booking (primary conversion) | `src/app/go/[id]/route.ts` |
| `directory_filter_changed` | User changes category or neighbourhood filter | `src/app/directory/[city]/page.tsx` |
| `directory_map_opened` | User opens the map on mobile | `src/app/directory/[city]/page.tsx` |
| `directory_venue_clicked` | User clicks a venue card in the directory | `src/app/directory/[city]/page.tsx` |
| `directory_search_used` | User performs a search in the venue directory | `src/app/directory/[city]/page.tsx` |
| `plan_email_sent` | Trip plan successfully emailed (server-side confirmation) | `src/app/api/email-plan/route.ts` |

## Next steps

We've built some insights and a dashboard for you to keep an eye on user behavior, based on the events we just instrumented:

- **Dashboard — Analytics basics:** https://eu.posthog.com/project/152999/dashboard/603390
- **Venue detail → outbound click conversion** (funnel): https://eu.posthog.com/project/152999/insights/nvlN375p
- **Newsletter signups over time** (trend): https://eu.posthog.com/project/152999/insights/CODA5PlV
- **AI planner conversion funnel** (ai_conversation_started → email_gate_completed → plan_emailed): https://eu.posthog.com/project/152999/insights/SZeIO9Bo
- **Directory clicks vs venue detail views** (trend): https://eu.posthog.com/project/152999/insights/9jNtWr5d
- **AI response feedback** (thumbs up vs down by week): https://eu.posthog.com/project/152999/insights/r09ggYRZ

### Agent skill

We've left an agent skill folder in your project at `.claude/skills/integration-nextjs-app-router/`. You can use this context for further agent development when using Claude Code. This will help ensure the model provides the most up-to-date approaches for integrating PostHog.

</wizard-report>
