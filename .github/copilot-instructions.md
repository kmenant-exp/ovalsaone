# Copilot Instructions for Oval Saône Web Project

## Stack snapshot
- Eleventy 3 static frontend in `src/` with Liquid page templates and a shared Nunjucks layout (`_includes/layout.njk`); the generated site lands in `_site/` and should never be edited directly.
- Azure Functions v4 (.NET 8) backend in `src/api/` exposes HTTP endpoints (currently `Contact`) and uses MailKit via `Services/EmailService.cs` for email delivery.
- Azure Static Web Apps hosts frontend + API together; routing, headers and auth tweaks live in `src/staticwebapp.config.json`.

## Frontend workflow
- Liquid pages under `src/*.liquid` must declare `layout: layout.njk`; global data from `_data/*.json` is auto-injected (e.g. `actualites`, `gallery`, `teams`). Check `docs/guide-developpement.md` for data field expectations.
- Run `npm run start` for the Eleventy dev server on http://localhost:8002 with live reload. Use `npm run start:swa` (or `npm run dev`) to proxy the static build through SWA CLI and attach the Functions API on http://127.0.0.1:4280.
- Build with `npm run build`; new assets belong in `src/assets/` so Eleventy can copy them into `_site/`.

## CSS & JS patterns
- Global design tokens and resets live in `src/css/styles.css`; component and page styles sit under `src/css/components/` and `src/css/pages/`.
- `css-bundle.njk` controls the inclusion order—add new component/page styles there or they will be missing in production.
- JavaScript modules in `src/js/` are ESM. `js-bundle.njk` pulls them together (see `gallery.js` wiring in `docs/gallery-feature.md`); keep cross-page behaviors in `main.js` and scope page logic to dedicated modules.

## Data & content
- JSON files in `_data/` are the single source of truth for dynamic sections. Preserve existing shapes (`actualites.actualites`, `gallery`, `teams`) and keep asset paths relative to `src/`.
- Avoid introducing numeric IDs unless the template already relies on them; iteration order often controls display (see `_data/teams.json`).
- Gallery entries require a matching image in `src/assets/gallery/` and metadata in `_data/gallery.json`; the feature uses filters + lightbox defined in `src/index.liquid` and `src/js/gallery.js`.

## Azure Functions specifics
- `Functions/ContactFunction.cs` handles POST + OPTIONS, returns an `ApiResponse<T>` JSON envelope, and explicitly sets CORS headers—reuse this structure for new endpoints.
- `EmailService` reads SMTP settings from environment variables (`SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `CONTACT_EMAIL`). When creds are missing it logs the rendered email instead of sending, which is the expected local behavior.
- Use the VS Code "Build Functions" task or `npm run build:api` to compile the backend; SWA CLI scripts start the Functions host automatically, but `dotnet build` helps catch compile errors early.

## Deployment & configuration
- `staticwebapp.config.json` governs headers, route rewrites, and API auth—edit here rather than touching `_site/` outputs.
- `swa-cli.config.json` mirrors production routing locally; update it alongside script changes to keep ports in sync.
- Production secrets belong in Azure App Settings (`SMTP_*`, `CONTACT_EMAIL`, etc.). Never commit `local.settings.json`; rely on environment variables when testing locally.

## Troubleshooting tips
- If data or styles look stale, restart Eleventy (`npm run start`) after deleting `_site/` to force a clean rebuild.
- For API or email issues, inspect the Functions host logs (`func: host start` task) and Application Insights; ensure OPTIONS responses include CORS headers when debugging frontend fetches.
- Mail delivery failures locally almost always mean missing SMTP variables—use the console log fallback to validate the rendered email payload.

## Key references
- `docs/guide-developpement.md` for a full walkthrough of workflows and conventions.
- `docs/gallery-feature.md` for the gallery data contract, JS behavior, and customization options.
- Repository `README.md` for high-level feature overview and deployment steps.
