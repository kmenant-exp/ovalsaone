# Copilot Instructions for Oval Saône Web Project

## Architecture Overview
- **Frontend**: Static site generated with Eleventy (11ty) using Liquid and Nunjucks templates. Data is loaded from JSON files in `src/_data/` and injected into templates. CSS and JS are bundled via Nunjucks includes (`css-bundle.njk`, `js-bundle.njk`).
- **Backend**: Azure Functions v4 (.NET 8, C#) in `src/api/`. Handles form submissions (contact, inscription) with strong validation and sends emails via MailKit. Data models and validation are in `Models/`.
- **Deployment**: Azure Static Web Apps (SWA). Local dev uses SWA CLI (`swa start src --api-location src/api`).

## Key Workflows
- **Build static site**: Eleventy builds from `src/` to `_site/`. Use `npm run start` for local dev (see `package.json`).
- **API development**: Use `dotnet build` in `src/api/`. Run locally with SWA CLI or Azure Functions Core Tools (`func start`).
- **Data updates**: Edit JSON in `src/_data/` (e.g., `teams.json`, `sponsors.json`). These are auto-injected into templates.
- **CSS/JS**: Modular CSS in `src/css/` (global, components, pages). Bundle order matters (see `src/css/README.md`). JS is modular in `src/js/`.

## Project Conventions
- **No IDs in JSON**: Data files in `_data/` should not use numeric IDs unless strictly required by logic.
- **Templates**: Use Liquid for pages, Nunjucks for layouts. Always set `layout: layout.njk` in front matter.
- **Assets**: Place images in `src/assets/` and reference with relative paths.
- **Validation**: All form data is validated both client-side (JS) and server-side (C# models).
- **CORS**: API endpoints are CORS-enabled for frontend integration.

## Examples
- To add a new team: Edit `src/_data/teams.json`, then reference in `equipes.liquid`.
- To add a new API: Create a new Function in `src/api/Functions/`, define model in `Models/`, register in `Program.cs`.
- To update styles: Edit or add CSS in `src/css/components/` or `src/css/pages/`, then include in `css-bundle.njk`.

## External Integrations
- **MailKit** for email (see `Services/EmailService.cs`).
- **Azure Static Web Apps** for hosting and CI/CD.

## Troubleshooting
- If data changes don't appear, ensure Eleventy rebuilds (`npm run start`).
- For API issues, check logs from Azure Functions or SWA CLI output.

## Key Files/Dirs
- `src/_data/` — global JSON data
- `src/api/` — Azure Functions backend
- `src/css/` — modular CSS
- `src/js/` — modular JS
- `src/_includes/` — shared layouts
- `eleventy.config.js` — Eleventy config
- `staticwebapp.config.json` — SWA config
- `swa-cli.config.json` — SWA CLI config

---
For more, see `docs/` and `README.md`.
