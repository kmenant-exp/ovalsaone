# Copilot Instructions for Oval Saône Web Project

## Stack snapshot
The project is a **monorepo** with three deployable units, all hosted on **Cloudflare**:

| Component | Path | Runtime | Deploys to |
|---|---|---|---|
| **Public site** | `pages/` | Eleventy 3 SSG + Cloudflare Pages Functions (TypeScript) | Cloudflare Pages (`ovalsaone`) |
| **Admin dashboard** | `admin/` | Hono + Cloudflare Pages Functions (TypeScript) | Cloudflare Pages (`ovalsaone-admin`) |
| **Weekly notification** | `workers/weekly-notification/` | Cloudflare Worker (TypeScript, Cron Trigger) | Cloudflare Workers |

Shared resources:
- **Cloudflare D1** database `ovalsaonedb` — bound to all three components for convocations, events, etc.
- **Resend** for transactional email (`RESEND_API_KEY` secret).
- **Cloudflare Turnstile** for bot protection on public forms (`TURNSTILE_SECRET_KEY` secret).

## Public site (`pages/`)

### Frontend workflow
- Eleventy 3 with Liquid page templates and a shared Nunjucks layout (`src/_includes/layout.njk`); the generated site lands in `_site/` and should **never** be edited directly.
- Liquid pages under `src/*.liquid` must declare `layout: layout.njk`; global data from `src/_data/*.json` is auto-injected (e.g. `actualites`, `gallery`, `teams`). Decap CMS–wrapped files (`{"key": [...]}`) are auto-unwrapped in `eleventy.config.js`.
- Run `npm run build` to generate the site. Use `npm run dev:pages` to build then serve via `wrangler pages dev` on http://localhost:8788 (includes Pages Functions).
- Production build: `npm run build:prod` (build + PurgeCSS + cssnano + terser). Deploy: `npm run deploy:pages`.

### CSS & JS patterns
- Global design tokens and resets live in `src/css/styles.css`; component and page styles sit under `src/css/components/` and `src/css/pages/`. A theme layer is in `src/css/themes/`.
- `css-bundle.njk` controls the inclusion order — add new component/page styles there or they will be missing in production.
- JavaScript modules in `src/js/` are ESM. `js-bundle.njk` pulls them together; keep cross-page behaviors in `main.js` and scope page logic to dedicated modules (e.g. `gallery.js`, `contact.js`, `convocations.js`).

### Data & content
- JSON files in `src/_data/` are the single source of truth for dynamic sections. Preserve existing shapes and keep asset paths relative to `src/`.
- Some data files are managed by **Decap CMS** via the admin panel; the `UNWRAP_DATA_FILES` set in `eleventy.config.js` lists files that get auto-unwrapped.
- Gallery entries require a matching image in `src/assets/gallery/` and metadata in `_data/gallery.json`.

### Pages Functions (API)
- TypeScript functions live in `pages/functions/api/`. They run as **Cloudflare Pages Functions** (not Azure Functions).
- `contact.ts` handles POST + OPTIONS, returns an `ApiResponse<T>` JSON envelope, sets explicit CORS headers, validates via Turnstile, and sends email via Resend API. Reuse this pattern for new endpoints.
- `convocation.ts` queries the D1 database for convocation data.
- Shared utilities (Turnstile verification, response helpers) live in `functions/api/_shared.ts`.
- Environment bindings are typed per-function (`interface Env`) and come from `wrangler.toml` vars + secrets.

## Admin dashboard (`admin/`)
- Static HTML/CSS/JS frontend in `admin/public/`; served via Cloudflare Pages.
- Backend logic uses **Hono** framework in `admin/functions/` as Pages Functions.
- Auth via Google OAuth (`auth/google.ts`, `auth/callback.ts`, `auth/me.ts`); JWT-based sessions.
- Integrates **Decap CMS** (`public/cms/`) backed by a GitHub App for content editing.
- API endpoints in `admin/functions/api/` for convocations, events, and stats.

## Weekly notification worker (`workers/weekly-notification/`)
- Standalone Cloudflare Worker with a **Cron Trigger** (every Thursday 08:00 UTC).
- Reads upcoming convocations from D1 and sends reminder emails via Resend.
- Deploy: `npm run deploy` from the worker directory; secrets via `wrangler secret put`.

## Deployment & configuration
- Each component has its own `wrangler.toml` defining D1 bindings, vars, and Pages/Worker settings.
- Production secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`, `GOOGLE_CLIENT_SECRET`, `JWT_SECRET`, `GITHUB_APP_CLIENT_SECRET`) are set via `wrangler secret put` or the Cloudflare Dashboard — **never commit them**.
- Static headers and redirects go in `pages/static/_headers`.
- D1 migrations: `npm run db:migrate` (remote) or `npm run db:migrate:local` (local) from any component directory.

## Troubleshooting tips
- If data or styles look stale, delete `pages/_site/` and re-run `npm run build` to force a clean rebuild.
- For API issues, run `npm run dev:pages` and inspect the Wrangler console output; Pages Functions logs appear inline.
- Mail delivery failures locally usually mean missing `RESEND_API_KEY` — the function will return a 500 with a descriptive error.
- Turnstile verification is skipped when `TURNSTILE_SECRET_KEY` is not set (dev mode).

## Key references
- `pages/docs/guide-developpement.md` for a full walkthrough of frontend workflows and conventions.
- `pages/docs/gallery-feature.md` for the gallery data contract, JS behavior, and customization options.
- `pages/docs/architecture-technique.md` for technical architecture documentation.
- `docs/migration-email-convocation.md` for email/convocation migration notes.
- Repository `README.md` for high-level feature overview and deployment steps.
