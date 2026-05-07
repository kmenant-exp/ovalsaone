---
title: "ADR-0001: Using Cloudflare Pages as Hosting Platform"
status: "Accepted"
date: "2026-02-21"
authors: "Kevin MENANT"
tags: ["architecture", "decision", "hosting", "cloudflare", "infrastructure"]
supersedes: ""
superseded_by: ""
---

# ADR-0001: Using Cloudflare Pages as Hosting Platform

## Status

**Accepted**

## Context

The Oval Saône rugby club needed a hosting platform for its web presence, which consists of three deployable components:

1. **Public site** (`pages/`) — an Eleventy 3 static site with server-side API endpoints for contact forms and convocation data.
2. **Admin dashboard** (`admin/`) — a Hono-based application with Google OAuth authentication and Decap CMS integration.
3. **Weekly notification worker** (`workers/weekly-notification/`) — a scheduled job that sends convocation reminders via email.

Key requirements driving the decision:

- **Low cost**: The project is for a non-profit sports club with a limited budget; ideally the hosting should be free or near-free.
- **Server-side logic**: The public site and admin dashboard require serverless functions for form handling, authentication, database queries, and email sending.
- **Database**: Convocation data and player responses need a persistent, low-latency SQL database accessible from both the site and the worker.
- **Bot protection**: Public forms need anti-bot protection.
- **Simple deployment**: The development team is small (solo developer); deployment must be straightforward and reproducible via CLI.
- **Monorepo support**: The platform must support deploying multiple independent projects (Pages projects and Workers) from a single repository.

## Decision

**Cloudflare Pages** was chosen as the hosting platform for all web-facing components, complemented by **Cloudflare Workers** for the scheduled notification job. The full Cloudflare ecosystem is leveraged:

| Service | Usage |
|---|---|
| **Cloudflare Pages** | Static site hosting + Pages Functions (serverless TypeScript) for both the public site and admin dashboard |
| **Cloudflare D1** | SQLite-based distributed database for convocations, events, and player responses |
| **Cloudflare Workers** | Cron-triggered weekly notification worker |
| **Cloudflare Turnstile** | Bot protection on public forms (contact, convocation responses) |
| **Wrangler CLI** | Deployment and local development tooling |

This decision was driven by four primary factors:

1. **Generous free tier**: Cloudflare Pages offers unlimited bandwidth, 500 builds/month, and 100,000 function invocations/day on the free plan — more than sufficient for a local rugby club's website.
2. **Integrated ecosystem**: Using D1, Workers, Turnstile, and Pages from a single provider eliminates integration complexity, reduces vendor management overhead, and allows all components to share the same D1 database binding.
3. **Simple deployment with Wrangler CLI**: A single `wrangler pages deploy` or `wrangler deploy` command handles the full build and deployment pipeline, with secrets managed via `wrangler secret put`.
4. **Pages Functions for server-side logic**: TypeScript functions colocated with the frontend code (`functions/api/`) run at the edge as serverless functions, removing the need for a separate backend service or server.

## Consequences

### Positive

- **POS-001**: **Zero hosting cost** — The free tier covers all current needs (static hosting, serverless functions, D1 database, Turnstile bot protection) with no monthly fees.
- **POS-002**: **Unified platform** — All three components (public site, admin, worker) and their shared database run on the same infrastructure, simplifying operations, monitoring, and secret management.
- **POS-003**: **Edge performance** — Static assets and Pages Functions run on Cloudflare's global edge network, providing low-latency responses for visitors regardless of location.
- **POS-004**: **Simple CI/CD** — Deployment is a single CLI command per component (`npm run deploy:pages`, `npm run deploy`), with preview deployments automatically generated for branches.
- **POS-005**: **Developer experience** — `wrangler pages dev` provides a local development server with full Pages Functions support, D1 local bindings, and hot reload.

### Negative

- **NEG-001**: **Vendor lock-in** — Deep reliance on Cloudflare-specific services (D1, Pages Functions, Turnstile, Workers Cron Triggers) makes migration to another provider a significant effort.
- **NEG-002**: **D1 maturity** — Cloudflare D1 is still a relatively young product; while stable for this project's scale, it lacks some features of mature databases (e.g., no foreign key enforcement at write time, limited query tooling).
- **NEG-003**: **Pages Functions limitations** — Pages Functions have a 10ms CPU time limit on the free plan and a 100,000 invocations/day cap, which could become restrictive if traffic grows significantly.
- **NEG-004**: **Debugging complexity** — Serverless edge functions are harder to debug than traditional servers; logs are ephemeral and distributed across Cloudflare's edge nodes.
- **NEG-005**: **Ecosystem-specific patterns** — Code follows Cloudflare-specific patterns (`PagesFunction<Env>`, `context.env.DB`, Wrangler bindings), meaning the backend code is not portable to other runtimes without refactoring.

## Alternatives Considered

### Azure Static Web Apps

- **ALT-001**: **Description**: Azure Static Web Apps (SWA) provides static site hosting with integrated Azure Functions for server-side logic, plus authentication providers, staging environments, and integration with the broader Azure ecosystem.
- **ALT-002**: **Rejection Reason**: The Azure free tier for SWA is more limited (two staging environments, smaller bandwidth allowance). More importantly, achieving the same integrated experience (database, bot protection, scheduled jobs) would require stitching together multiple Azure services (Cosmos DB or Azure SQL, Azure Functions with timer triggers, separate bot protection), increasing complexity and potentially cost. The project does not need the enterprise-scale capabilities of Azure, and the Cloudflare ecosystem provides a more cohesive, simpler solution for this use case.

### Do Nothing (Traditional Shared Hosting)

- **ALT-003**: **Description**: Host the site on traditional shared hosting (OVH, o2switch, etc.) with a PHP or Node.js backend, MySQL database, and SMTP email.
- **ALT-004**: **Rejection Reason**: Traditional hosting would require managing server infrastructure, SSL certificates, deployment pipelines, and database backups manually. The ongoing cost (~€3–5/month) is small but unnecessary given the free Cloudflare option. Shared hosting also lacks the edge performance, automatic scaling, and developer experience (local dev server, Wrangler CLI) that Cloudflare provides.

## Implementation Notes

- **IMP-001**: Each component has its own `wrangler.toml` defining D1 bindings, environment variables, and Pages/Worker settings. The public site is deployed as project `ovalsaone`, the admin as `ovalsaone-admin`, and the worker as `ovalsaone-weekly-notification`.
- **IMP-002**: Secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `GITHUB_APP_CLIENT_SECRET`) are managed via `wrangler secret put` or the Cloudflare Dashboard and are never committed to source control.
- **IMP-003**: D1 database migrations are managed via SQL files in `migrations/` directories and applied with `wrangler d1 migrations apply`. The same database (`ovalsaonedb`) is shared across all three components.
- **IMP-004**: Preview deployments are automatically available at `*.ovalsaone.pages.dev` for branch deployments, enabling testing before production merges.
- **IMP-005**: If the project outgrows the free tier, Cloudflare's paid plans (Workers Paid at $5/month) provide 10M+ function invocations and relaxed CPU limits, offering a smooth upgrade path.

## References

- **REF-001**: [Architecture Technique](../../pages/docs/architecture-technique.md) — Full technical architecture documentation for the public site
- **REF-002**: [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/) — Official platform documentation
- **REF-003**: [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/) — D1 database documentation
- **REF-004**: [Pages Functions README](../../pages/functions/README.md) — Project-specific Pages Functions documentation
- **REF-005**: [Migration Email Convocation](../../docs/migration-email-convocation.md) — Migration notes for the email/convocation system
