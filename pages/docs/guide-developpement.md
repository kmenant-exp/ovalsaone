# Guide de Développement — Oval Saône

> Dernière mise à jour : 15 juin 2025

## Sommaire

1. [Prérequis](#1-prérequis)
2. [Installation et configuration](#2-installation-et-configuration)
3. [Structure du projet](#3-structure-du-projet)
4. [Développement local](#4-développement-local)
5. [Templates Liquid et layout Nunjucks](#5-templates-liquid-et-layout-nunjucks)
6. [Données JSON et Decap CMS](#6-données-json-et-decap-cms)
7. [CSS — Organisation et conventions](#7-css--organisation-et-conventions)
8. [JavaScript — Modules et bundle](#8-javascript--modules-et-bundle)
9. [Pages Functions (API TypeScript)](#9-pages-functions-api-typescript)
10. [Base de données D1](#10-base-de-données-d1)
11. [Build et déploiement](#11-build-et-déploiement)
12. [Conventions de code](#12-conventions-de-code)
13. [Dépannage](#13-dépannage)

---

## 1. Prérequis

| Outil | Version | Installation |
|---|---|---|
| Node.js | >= 18 | [nodejs.org](https://nodejs.org/) |
| npm | >= 9 | Inclus avec Node.js |
| Wrangler CLI | >= 4 | `npm install -g wrangler` |
| Git | >= 2 | [git-scm.com](https://git-scm.com/) |

### Vérifier l'installation

```bash
node --version    # v18+ requis
npm --version     # 9+
wrangler --version # 4+
git --version
```

---

## 2. Installation et configuration

### 2.1 Cloner le projet

```bash
git clone https://github.com/votre-org/ovalsaone.git
cd ovalsaone
```

### 2.2 Installer les dépendances

Chaque composant a ses propres dépendances :

```bash
# Site public
cd pages
npm install

# Dashboard admin
cd ../admin
npm install

# Worker de notification
cd ../workers/weekly-notification
npm install
```

### 2.3 Configurer les secrets locaux

Créer le fichier `pages/.dev.vars` pour les secrets de développement :

```ini
RESEND_API_KEY=re_xxxxxxxxxxxxx
TURNSTILE_SECRET_KEY=0x4AAAAAA...
```

💡 **Astuce :** Sans `RESEND_API_KEY`, l'envoi d'email renverra une erreur 500. Sans `TURNSTILE_SECRET_KEY`, la vérification Turnstile est automatiquement ignorée (mode dev).

### 2.4 Configurer la base D1 locale

```bash
cd pages
npm run db:migrate:local
```

Cela crée une base SQLite locale dans `.wrangler/state/`.

---

## 3. Structure du projet

```
ovalsaone/
├── pages/                      # Site public (Eleventy + Cloudflare Pages)
│   ├── src/                    # Sources Eleventy
│   │   ├── *.liquid            # Pages (index, contact, equipes…)
│   │   ├── _includes/
│   │   │   └── layout.njk      # Layout principal Nunjucks
│   │   ├── _data/              # Données JSON (actualites, gallery, teams…)
│   │   ├── css/                # Feuilles de style
│   │   │   ├── styles.css      # Design tokens + reset global
│   │   │   ├── components/     # Composants réutilisables
│   │   │   ├── pages/          # Styles spécifiques par page
│   │   │   └── themes/         # Thèmes (couleurs)
│   │   ├── js/                 # Modules JavaScript (ESM)
│   │   │   ├── main.js         # Comportements cross-page
│   │   │   ├── gallery.js      # Galerie photo
│   │   │   ├── contact.js      # Formulaire de contact
│   │   │   └── convocations.js # Système de convocations
│   │   ├── assets/             # Images, fonts, icônes
│   │   ├── css-bundle.njk      # Concaténation CSS
│   │   └── js-bundle.njk       # Concaténation JS
│   ├── functions/              # Cloudflare Pages Functions
│   │   └── api/
│   │       ├── _shared.ts      # Utilitaires partagés (Turnstile)
│   │       ├── contact.ts      # POST /api/contact
│   │       └── convocation.ts  # POST /api/convocation
│   ├── _site/                  # Build output (ne pas éditer)
│   ├── migrations/             # Migrations D1
│   ├── static/                 # Fichiers statiques (_headers)
│   ├── eleventy.config.js      # Configuration Eleventy
│   ├── wrangler.toml           # Configuration Wrangler/Cloudflare
│   └── package.json            # Scripts npm
├── admin/                      # Dashboard admin (Hono + Cloudflare Pages)
│   ├── public/                 # Frontend statique (HTML/CSS/JS)
│   │   └── cms/                # Decap CMS
│   ├── functions/              # Backend Hono (Pages Functions)
│   │   ├── auth/               # Google OAuth (login, callback, me)
│   │   └── api/                # API admin (convocations, events, stats)
│   └── wrangler.toml
├── workers/                    # Cloudflare Workers
│   └── weekly-notification/    # Cron Trigger (jeudi 08:00 UTC)
│       ├── src/index.ts
│       └── wrangler.toml
└── docs/                       # Documentation transversale
```

---

## 4. Développement local

### 4.1 Lancer le serveur de développement

```bash
cd pages
npm run dev:pages
```

Cette commande :
1. Build le site avec Eleventy (`npx @11ty/eleventy --input=./src`)
2. Lance Wrangler Pages Dev sur **http://localhost:8788**
3. Sert les fichiers statiques ET les Pages Functions

### 4.2 Workflow de développement

```
Modifier les sources (src/)
       │
       ▼
Arrêter le serveur (Ctrl+C)
       │
       ▼
Relancer : npm run dev:pages
       │
       ▼
Tester sur http://localhost:8788
```

📌 **Important :** Eleventy ne dispose pas de hot-reload dans cette configuration. Il faut relancer `npm run dev:pages` après chaque modification.

### 4.3 Tester les Pages Functions

Les fonctions sont automatiquement servies par Wrangler :
- `POST http://localhost:8788/api/contact` — Formulaire de contact
- `POST http://localhost:8788/api/convocation` — Convocations

Les bindings D1 locaux utilisent la base SQLite dans `.wrangler/state/`.

---

## 5. Templates Liquid et layout Nunjucks

### 5.1 Layout principal

Le layout `src/_includes/layout.njk` fournit la structure HTML commune (head, nav, footer). Chaque page Liquid l'utilise via le front matter :

```liquid
---
layout: layout.njk
title: Ma Page
description: Description pour le SEO
---

<section class="ma-page section">
  <div class="container">
    <h1>{{ title }}</h1>
    <!-- Contenu de la page -->
  </div>
</section>
```

### 5.2 Créer une nouvelle page

1. Créer `src/ma-page.liquid` avec le front matter ci-dessus
2. Le permalink est automatique : `/ma-page/`
3. Ajouter les styles si nécessaire dans `src/css/pages/`
4. Référencer les styles dans `src/css-bundle.njk`
5. Rebuilder le site

### 5.3 Boucles sur les données

```liquid
{% comment %} Les fichiers _data/*.json deviennent des variables globales {% endcomment %}
{% for team in teams %}
  <div class="team-card">
    <h3>{{ team.nom }}</h3>
    <p>{{ team.description }}</p>
  </div>
{% endfor %}
```

---

## 6. Données JSON et Decap CMS

### 6.1 Fichiers de données

Les fichiers dans `src/_data/` sont automatiquement disponibles dans les templates :

| Fichier | Variable | Contenu |
|---|---|---|
| `actualites.json` | `actualites` | Actualités du club |
| `gallery.json` | `gallery` | Albums photo |
| `teams.json` | `teams` | Équipes |
| `sponsors.json` | `sponsors` | Partenaires |
| `bureau.json` | `bureau` | Membres du bureau |
| `entraineurs.json` | `entraineurs` | Entraîneurs |

### 6.2 Auto-unwrap Decap CMS

Decap CMS encapsule les données : `{"actualites": [...]}`. Eleventy les déplie automatiquement grâce à la configuration dans `eleventy.config.js`. On itère donc directement :

```liquid
{% for actu in actualites %}  {%- comment -%} PAS actualites.actualites {%- endcomment -%}
  {{ actu.titre }}
{% endfor %}
```

### 6.3 Ajouter un nouveau fichier de données

1. Créer `src/_data/mon-fichier.json`
2. Si géré par Decap CMS, ajouter la collection dans `admin/public/cms/config.yml`
3. Si l'auto-unwrap est nécessaire, ajouter le nom dans `UNWRAP_DATA_FILES` de `eleventy.config.js`
4. Utiliser la variable `mon-fichier` dans les templates Liquid

---

## 7. CSS — Organisation et conventions

### 7.1 Architecture

```
src/css/
├── styles.css          # Design tokens (:root), reset, utilitaires globaux
├── components/         # Composants réutilisables (card, hero, gallery…)
├── pages/              # Styles spécifiques à une page (contact, equipes…)
└── themes/             # Thèmes de couleurs
```

### 7.2 Design tokens

Les variables CSS sont définies dans `styles.css` :

```css
:root {
  --color-primary: #1a472a;
  --color-secondary: #2d6a3e;
  --color-accent: #f4a020;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --border-radius: 8px;
  --transition: 0.3s ease;
}
```

### 7.3 Ajouter un composant CSS

1. Créer `src/css/components/mon-composant.css`
2. Utiliser les design tokens (`var(--color-primary)`, etc.)
3. Ajouter dans `src/css-bundle.njk` :

```nunjucks
{% include "css/components/mon-composant.css" %}
```

### 7.4 Build CSS de production

Le pipeline `build:prod` applique automatiquement :
1. **PurgeCSS** — Supprime les classes CSS inutilisées
2. **cssnano** — Minifie le CSS
3. Le fichier final est `_site/css-bundle.css`

---

## 8. JavaScript — Modules et bundle

### 8.1 Architecture

```
src/js/
├── main.js             # Comportements cross-page (nav, scroll, animations)
├── gallery.js          # Galerie photo (filtres, lightbox, carousel)
├── contact.js          # Formulaire de contact (validation, Turnstile, fetch)
├── convocations.js     # Système de convocations
└── ...
```

### 8.2 Conventions

- Les modules sont en **ES Module** (pas de bundler, pas d'import/export entre modules)
- Chaque module est autonome et utilise `DOMContentLoaded`
- Les comportements cross-page vont dans `main.js`
- La logique spécifique à une page va dans un module dédié

### 8.3 Ajouter un module JS

1. Créer `src/js/mon-module.js`
2. L'inclure dans `src/js-bundle.njk` :

```nunjucks
{% include "js/mon-module.js" %}
```

3. Le bundle final est `_site/bundle.js` (minifié par terser en production)

---

## 9. Pages Functions (API TypeScript)

### 9.1 Emplacement et conventions

Les fonctions sont dans `functions/api/`. Le routage est basé sur le système de fichiers :

| Fichier | Route | Méthode |
|---|---|---|
| `functions/api/contact.ts` | `/api/contact` | POST, OPTIONS |
| `functions/api/convocation.ts` | `/api/convocation` | POST, OPTIONS |
| `functions/api/_shared.ts` | (utilitaire partagé) | — |

### 9.2 Pattern standard

Chaque fonction suit ce pattern :

1. **Interface `Env`** — Déclare les bindings (D1, secrets, vars)
2. **Interfaces de données** — Typage du body de requête
3. **CORS headers** — Constante réutilisable
4. **Helpers** — `jsonResponse()`, `errorResponse()`, `successResponse()`
5. **Validation** — Règles de validation des champs
6. **Handler** — `onRequestPost`, `onRequestGet`, `onRequestOptions`

### 9.3 Ajouter une nouvelle fonction

1. Créer `functions/api/ma-fonction.ts`
2. Exporter un handler : `export const onRequestPost: PagesFunction<Env> = async (context) => { ... }`
3. Ajouter les bindings nécessaires dans `wrangler.toml` si pas déjà présents
4. Tester avec `npm run dev:pages` puis `curl -X POST http://localhost:8788/api/ma-fonction`

### 9.4 Bindings Wrangler

Définis dans `wrangler.toml` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "ovalsaonedb"
database_id = "cf056ba0-..."

[vars]
SMTP_FROM = "contact@ovalsaone.fr"
CONTACT_EMAIL = "ovalsaone@gmail.com"
```

Les secrets (`RESEND_API_KEY`, `TURNSTILE_SECRET_KEY`) sont dans `.dev.vars` en local et configurés via `wrangler secret put` en production.

---

## 10. Base de données D1

### 10.1 Présentation

**Cloudflare D1** est une base SQLite serverless. Le binding `DB` est disponible dans toutes les Pages Functions via `env.DB`.

### 10.2 Migrations

Les fichiers SQL sont dans `migrations/` :

```bash
# Appliquer en local
npm run db:migrate:local

# Appliquer en production
npm run db:migrate
```

### 10.3 Accès en dev

En développement local, Wrangler crée une base SQLite dans `.wrangler/state/`. Les données sont indépendantes de la production.

```bash
# Exécuter une requête en local
wrangler d1 execute ovalsaonedb --local --command "SELECT * FROM convocations"

# Exécuter en production
wrangler d1 execute ovalsaonedb --remote --command "SELECT count(*) FROM convocations"
```

---

## 11. Build et déploiement

### 11.1 Scripts npm

| Script | Commande | Description |
|---|---|---|
| `npm run build` | `npx @11ty/eleventy --input=./src` | Build Eleventy |
| `npm run build:prod` | Build + PurgeCSS + cssnano + terser | Build optimisé |
| `npm run dev:pages` | Build + `wrangler pages dev` | Dev local (port 8788) |
| `npm run deploy:pages` | `build:prod` + `wrangler pages deploy` | Déploiement production |
| `npm run db:migrate` | `wrangler d1 migrations apply` | Migrations D1 (remote) |
| `npm run db:migrate:local` | Idem `--local` | Migrations D1 (local) |

### 11.2 Pipeline de build production

```
npm run build:prod
    │
    ├── 1. Eleventy compile src/ → _site/
    ├── 2. PurgeCSS supprime le CSS inutilisé
    ├── 3. cssnano minifie le CSS
    └── 4. terser minifie le JS (supprime console.log)
```

### 11.3 Déploiement

```bash
cd pages
npm run deploy:pages
```

Cela build le site en production et le déploie sur Cloudflare Pages via Wrangler.

📌 **Déploiement automatique** : tout push sur la branche principale déclenche un build sur Cloudflare Pages.

---

## 12. Conventions de code

### Nommage

| Élément | Convention | Exemple |
|---|---|---|
| Fichiers Liquid | kebab-case | `rugby-enfants-trevoux.liquid` |
| Fichiers CSS | kebab-case | `gallery.css`, `cookie-banner.css` |
| Fichiers JS | camelCase ou kebab-case | `gallery.js`, `contact.js` |
| Classes CSS | kebab-case (BEM simplifié) | `.gallery-item`, `.card-content` |
| Variables CSS | kebab-case | `--color-primary`, `--spacing-md` |
| Fonctions TS | camelCase | `verifyTurnstile()`, `sendEmail()` |

### Bonnes pratiques

- **Pas de bundler JS** — Les modules sont concaténés via `js-bundle.njk`
- **Pas de framework CSS** — Styles custom avec design tokens
- **Pas de framework frontend** — JavaScript vanilla uniquement
- **Lazy loading** — Toujours `loading="lazy"` sur les images
- **Accessibilité** — Attributs `alt`, `aria-label`, rôles ARIA
- **Performance** — Images optimisées, PurgeCSS, minification

---

## 13. Dépannage

### Le site ne se build pas

```bash
# Nettoyer et rebuilder
rm -rf _site
npm run build
```

### Les styles ou données semblent périmés

```bash
rm -rf _site && npm run build
```

### Erreur 500 sur /api/contact

- Vérifier que `RESEND_API_KEY` est défini dans `.dev.vars`
- Consulter les logs Wrangler dans le terminal

### Turnstile échoue en local

- Normal si `TURNSTILE_SECRET_KEY` n'est pas dans `.dev.vars`
- La vérification est automatiquement ignorée en mode dev

### La base D1 est vide en local

```bash
npm run db:migrate:local
```

### Les Pages Functions ne se chargent pas

- Vérifier que Wrangler est installé : `wrangler --version`
- Vérifier que le dossier `functions/` est au bon niveau (pas dans `src/`)

---

## Voir aussi

- [architecture-technique.md](architecture-technique.md) — Architecture détaillée du projet
- [exemples-code.md](exemples-code.md) — Exemples de code prêts à l'emploi
- [guide-deploiement.md](guide-deploiement.md) — Procédure de déploiement
- [guide-maintenance.md](guide-maintenance.md) — Maintenance et suivi

*Dernière mise à jour : 15 juin 2025*
