---
title: "ADR-0002: Using Google Public Calendar for Events and Calendar Subscription"
status: "Accepted"
date: "2026-02-21"
authors: "Kevin MENANT"
tags: ["architecture", "decision", "events", "google-calendar", "frontend"]
supersedes: ""
superseded_by: ""
---

# ADR-0002: Using Google Public Calendar for Events and Calendar Subscription

## Status

**Accepted**

## Context

Oval Saône Rugby needed a way to manage and display events (matches, training sessions, tournaments) on the public website for each of its teams (U6, U8, U10, U12, U14). The solution had to address several requirements:

1. **Non-technical content management**: Club staff (coaches, administrators) must be able to create, update, and delete events without any technical knowledge or access to the codebase.
2. **Per-team calendars**: Each age group needs its own distinct calendar, while the website must also display an aggregated view of all teams' events.
3. **Calendar subscription**: Parents and players want to subscribe to their team's calendar from their personal calendar app (Apple Calendar, Google Calendar, Outlook) to receive automatic updates when events change.
4. **No backend infrastructure for events**: The project already uses Cloudflare D1 for convocation data, but managing a full event/calendar CRUD system with recurring events, timezone handling, and iCal export would add significant backend complexity.
5. **Zero additional hosting cost**: Consistent with [ADR-0001](adr-0001-cloudflare-pages-hosting.md), the solution should not introduce new paid services.
6. **Offline and mobile friendly**: Events should be accessible via standard calendar protocols, not just the website.

The existing D1 database stores convocation data (player responses to match summons), which is a distinct concern from the broader event calendar. Convocations reference specific events but do not manage the events themselves.

## Decision

**Google Public Calendar** was chosen as the event management and display platform. Each team has a dedicated public Google Calendar, and the website fetches events client-side via the **Google Calendar API v3**. Calendar subscription is provided through standard **iCal (ICS) URLs** with `webcal://` protocol support.

The implementation works as follows:

| Component | Role |
|---|---|
| **Google Calendar** (per team) | Source of truth for events — coaches create/edit events directly in Google Calendar |
| **Google Calendar API v3** | Client-side JavaScript fetches events from all team calendars for display on the website |
| **Google API Key** | Restricted API key (domain + API scope restricted) authenticates read-only API requests |
| **ICS URLs** | Each calendar exposes a public `.ics` URL; the Liquid template converts `https://` to `webcal://` for one-click subscription |
| **`calendars.json`** | Eleventy data file stores the API key, calendar IDs, and ICS URLs as structured build-time configuration |

The key design choices:

1. **Client-side fetching**: Events are loaded via JavaScript at page load rather than at build time, ensuring the website always shows up-to-date data without requiring a site rebuild when events change.
2. **Per-team tab navigation**: The events page provides tab-based filtering ("Tous les événements", "U6", "U8", etc.) generated from the `calendars.json` data.
3. **Shared utilities**: A `calendar-utils.js` module provides reusable functions (event card rendering, event merging for cross-team events, unique ID generation) shared between the events page and the tournaments page.
4. **ICS subscription links**: Each team has a "S'abonner au calendrier" button that triggers the native calendar app via the `webcal://` protocol, enabling real-time synchronization.

## Consequences

### Positive

- **POS-001**: **Zero development cost for event management** — Google Calendar provides a full-featured event management UI (recurring events, reminders, timezone handling, multi-user editing) at no cost, eliminating the need to build a custom CRUD backend.
- **POS-002**: **Familiar interface for content managers** — Coaches and administrators already use Google Calendar in their daily workflow; no training or onboarding is required.
- **POS-003**: **Real-time updates without rebuilds** — Since events are fetched client-side from the Google Calendar API, changes made by coaches are immediately visible on the website without triggering an Eleventy build or deployment.
- **POS-004**: **Native calendar subscription** — Parents and players can subscribe to their team's calendar via standard iCal/`webcal://` protocol, receiving automatic updates in Apple Calendar, Google Calendar, Outlook, or any standards-compliant calendar app.
- **POS-005**: **Cross-team event merging** — The `CalendarUtils.mergeIdenticalEvents()` function automatically detects events that appear in multiple team calendars (e.g., a shared tournament) and merges them into a single card with multiple team badges, avoiding duplication.

### Negative

- **NEG-001**: **Dependency on Google services** — The events feature is entirely dependent on Google Calendar API availability. If Google experiences an outage or deprecates the API, the events page will display an error state until an alternative is implemented.
- **NEG-002**: **API key exposed client-side** — The Google API key is embedded in the page source (`window.calendarConfig`). While the key is restricted to specific domains and the Calendar API scope only, it is still visible in the browser, which requires careful restriction management in the Google Cloud Console.
- **NEG-003**: **No server-side rendering of events** — Events are loaded client-side, meaning they are not available in the initial HTML. This has implications for SEO (search engines may not index event content) and for users with JavaScript disabled (they see only a loading message).
- **NEG-004**: **Google Calendar API quotas** — The free tier allows 1,000,000 queries/day, which is more than sufficient for a local rugby club, but the per-user rate limit (100 requests per 100 seconds) could theoretically be hit under unusual traffic patterns.
- **NEG-005**: **Limited coordination with convocation system** — The D1-based convocation system and the Google Calendar events are managed separately. There is no automated link between creating a calendar event and generating a convocation, requiring coaches to maintain both systems in sync.

## Alternatives Considered

### Custom Event CRUD in Admin Dashboard

- **ALT-001**: **Description**: Build a full event management system within the existing admin dashboard (`admin/`), storing events in the D1 database with a custom UI for creating, editing, and deleting events, plus a server-side iCal export endpoint.
- **ALT-002**: **Rejection Reason**: Building a calendar management system with proper recurring event support, timezone handling, conflict detection, and iCal export is a significant engineering effort for a solo developer. Google Calendar already provides all of this for free with a polished, well-tested UI. The maintenance burden of a custom solution would far outweigh any benefits for a small club.

### Embed Google Calendar iframe

- **ALT-003**: **Description**: Use Google Calendar's built-in embed feature (`<iframe>`) to display calendars directly on the website without any custom JavaScript or API integration.
- **ALT-004**: **Rejection Reason**: The embedded iframe provides very limited customization — the styling cannot match the site's design system, it does not support a tabbed per-team view, and it renders poorly on mobile. The iframe does not support the merged cross-team event display or the custom event card format used across the events and tournaments pages. It also introduces a visible third-party element that degrades the perceived quality of the site.

### Decap CMS-Managed Events in Eleventy Data

- **ALT-005**: **Description**: Use the existing Decap CMS setup (already used for actualités and other content) to manage events as JSON data files in the repository, rendered at build time by Eleventy.
- **ALT-006**: **Rejection Reason**: Decap CMS is well-suited for static blog-like content but lacks native calendar features — recurring events, timezone management, reminders, and especially iCal/ICS export would all need to be custom-built. Content changes would also require a Git commit and Cloudflare Pages rebuild before appearing on the site, introducing a delay that is acceptable for news articles but not for time-sensitive event updates. Coaches would also need to learn the CMS interface instead of using their familiar Google Calendar.

## Implementation Notes

- **IMP-001**: Each team's calendar configuration is stored in [`pages/src/_data/calendars.json`](../../pages/src/_data/calendars.json) with three fields per team: `name`, `calendarId`, and `icsUrl`. Adding a new team calendar requires only appending an entry to this file.
- **IMP-002**: The Google API key is restricted in the Google Cloud Console to specific referrer domains (`*.ovalsaone.fr/*`, `http://localhost:8002/*`, `https://*.ovalsaone.pages.dev/*`) and scoped to the Google Calendar API only. If the domain changes, the API key restrictions must be updated. Setup instructions are documented in [`pages/docs/google-calendar-setup.md`](../../pages/docs/google-calendar-setup.md).
- **IMP-003**: The events page (`evenements.liquid`) fetches events spanning from 6 months ago to 3 months ahead, with tab-based filtering and past/upcoming event separation. The `CalendarLoader` class in `calendar-utils.js` handles parallel loading of all team calendars.
- **IMP-004**: ICS URLs are stored as `https://` in the data file. The Liquid template converts them to `webcal://` protocol at render time, which triggers the native calendar subscription dialog on all major platforms (iOS, macOS, Windows, Android).
- **IMP-005**: To monitor for API deprecation or quota issues, check the Google Cloud Console dashboard periodically. If the Google Calendar API is ever deprecated, the fallback plan would be migrating to a self-hosted CalDAV server or the custom CRUD approach described in ALT-001.

## References

- **REF-001**: [ADR-0001: Cloudflare Pages Hosting](adr-0001-cloudflare-pages-hosting.md) — Hosting platform decision that constrains the events solution to client-side or Pages Functions approaches
- **REF-002**: [Google Calendar Setup Guide](../../pages/docs/google-calendar-setup.md) — Step-by-step guide for creating team calendars, retrieving IDs, and configuring the API key
- **REF-003**: [Google Calendar API v3 Documentation](https://developers.google.com/calendar/api/v3/reference) — Official API reference
- **REF-004**: [Architecture Technique](../../pages/docs/architecture-technique.md) — Technical architecture documentation for the public site
- **REF-005**: [calendars.json data file](../../pages/src/_data/calendars.json) — Current calendar configuration with all team IDs and ICS URLs
