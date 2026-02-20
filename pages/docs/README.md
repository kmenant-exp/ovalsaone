# Documentation du Site Web Oval Saône

## Sommaire
1. [Introduction](#introduction)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Frontend Eleventy](#frontend-eleventy)
5. [Backend (Pages Functions)](#backend-pages-functions)
6. [Installation et Développement Local](#installation-et-développement-local)
7. [Déploiement](#déploiement)
8. [Maintenance](#maintenance)

## Introduction

Le site web Oval Saône est une application web moderne pour un club de rugby, construite avec **Eleventy 3** (générateur de site statique) et déployée sur **Cloudflare Pages**. Le backend utilise des **Pages Functions en TypeScript**, une base de données **Cloudflare D1**, et **Resend** pour l'envoi d'emails.

### Objectif du Site

Le site a pour objectif de :
- Présenter le club de rugby et ses activités
- Fournir des informations sur les équipes et catégories
- Gérer les convocations de match via un système avec base de données
- Présenter les partenaires et sponsors
- Offrir une boutique en ligne pour les produits du club
- Faciliter la communication via un formulaire de contact sécurisé

### Fonctionnalités Principales

- **Pages générées avec Eleventy** : Templates Liquid et Nunjucks pour la génération des pages
- **Bundling CSS/JS automatique** : Concaténation via fichiers `.njk`
- **Galerie photo** : Filtrage par catégorie, lightbox et carousel
- **Formulaires sécurisés** : Protection Turnstile + validation serveur
- **API serverless** : Pages Functions TypeScript pour contact et convocations
- **Base de données** : Cloudflare D1 pour les convocations
- **Emails transactionnels** : Envoi via Resend API
- **CMS intégré** : Gestion du contenu via Decap CMS
- **Design responsive** : Adaptation à tous les appareils

## Architecture Technique

Le site utilise une architecture moderne combinant un frontend statique et un backend serverless sur Cloudflare.

### Vue d'ensemble

```
┌─────────────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   Cloudflare Pages  │     │  Pages Functions   │     │  Cloudflare D1   │
│   (Site statique    │────▶│  (TypeScript)      │────▶│  (SQLite)        │
│    Eleventy build)  │     │                    │     │                  │
└─────────────────────┘     └───────────────────┘     └──────────────────┘
          │                          │
          │                          │
          ▼                          ▼
┌─────────────────────┐     ┌───────────────────┐
│   CDN Cloudflare    │     │  Resend API       │
│   (distribution     │     │  (emails)         │
│    mondiale)        │     │                   │
└─────────────────────┘     └───────────────────┘
```

### Composants Clés

1. **Frontend Eleventy** :
   - Générateur de site statique avec Eleventy 3
   - Templates Liquid (.liquid) et Nunjucks (.njk)
   - Bundling CSS/JS automatique par concaténation
   - Données JSON intégrées via `_data/` et front matter
   - Build vers le dossier `_site/`

2. **Backend Serverless** :
   - Cloudflare Pages Functions (TypeScript)
   - API REST pour formulaire de contact et convocations
   - Envoi d'emails avec Resend API
   - Protection anti-bot via Cloudflare Turnstile

3. **Base de données** :
   - Cloudflare D1 (SQLite distribué)
   - Stockage des convocations et réponses
   - Migrations gérées via Wrangler

4. **Hébergement Cloudflare** :
   - CDN mondial intégré
   - HTTPS automatique
   - Headers de sécurité personnalisés
   - Déploiement via Wrangler CLI

## Structure du Projet

### Arborescence Principale

```
pages/
├── eleventy.config.js            # Configuration Eleventy
├── package.json                  # Dépendances et scripts npm
├── wrangler.toml                 # Configuration Cloudflare (D1, vars, secrets)
├── _site/                        # Site généré (output — ne pas éditer)
├── functions/                    # Pages Functions TypeScript (API)
│   ├── api/
│   │   ├── _shared.ts           # Utilitaires (Turnstile, réponses)
│   │   ├── contact.ts           # POST /api/contact
│   │   └── convocation.ts       # GET /api/convocation
│   └── tsconfig.json
├── src/                          # Code source Eleventy
│   ├── *.liquid                  # Pages templates Liquid
│   ├── _includes/
│   │   └── layout.njk           # Layout principal Nunjucks
│   ├── _data/                    # Données JSON (CMS + manuelles)
│   ├── css-bundle.njk            # Bundle CSS
│   ├── js-bundle.njk             # Bundle JavaScript
│   ├── css/                      # Styles CSS sources
│   │   ├── styles.css            # Variables et resets
│   │   ├── components/           # Styles par composant
│   │   ├── pages/                # Styles par page
│   │   └── themes/               # Thèmes
│   ├── js/                       # Scripts JavaScript ESM
│   ├── assets/                   # Images et ressources statiques
│   └── sitemap.njk               # Sitemap XML auto-généré
├── static/
│   └── _headers                  # Headers HTTP de production
├── migrations/                   # Migrations D1
└── docs/                         # Documentation
```

### Détail des Répertoires

#### Frontend Eleventy

- **Templates Liquid (*.liquid)** : Pages principales avec front matter YAML
- **Layout (_includes/layout.njk)** : Structure HTML commune (Nunjucks)
- **Données (_data/)** : Fichiers JSON accessibles globalement dans les templates
- **CSS Bundle (css-bundle.njk)** : Concaténation automatique des styles
- **JS Bundle (js-bundle.njk)** : Concaténation des scripts
- **Assets** : Images, logos et ressources statiques

#### Backend (API)

- **functions/api/contact.ts** : Traitement du formulaire de contact (POST + OPTIONS, Turnstile, Resend)
- **functions/api/convocation.ts** : Requêtes sur les convocations (D1)
- **functions/api/_shared.ts** : Utilitaires partagés (vérification Turnstile, helpers de réponse)

## Frontend Eleventy

Le site utilise **Eleventy 3** comme générateur de site statique.

### Templates Liquid (.liquid)

Les pages utilisent le format Liquid avec front matter YAML :

```liquid
---
layout: layout.njk
title: Page Title
---

<section class="content">
    <h1>{{ title }}</h1>
</section>
```

### Layout Principal (layout.njk)

Le layout Nunjucks définit la structure HTML commune :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="/css-bundle.css">
</head>
<body>
    <nav class="navbar">...</nav>
    {{ content | safe }}
    <footer>...</footer>
    <script src="/bundle.js"></script>
</body>
</html>
```

### Système de Bundling

#### CSS Bundle (css-bundle.njk)

```njk
---
permalink: /css-bundle.css
---
{% include "./css/styles.css" %}
{% include "./css/components/nav.css" %}
{% include "./css/pages/index.css" %}
<!-- Autres fichiers CSS -->
```

#### JavaScript Bundle (js-bundle.njk)

```njk
---
permalink: /bundle.js
---
{% include "./js/main.js" %}
{% include "./js/gallery.js" %}
<!-- Autres fichiers JS -->
```

### Données Globales

Les fichiers dans `_data/` sont automatiquement disponibles dans tous les templates. Certains fichiers (actualités, galerie, sponsors…) sont auto-unwrappés par `eleventy.config.js` pour compatibilité avec Decap CMS.

### Configuration Eleventy

Le fichier `eleventy.config.js` configure :
- Le parser JSON personnalisé (auto-unwrap Decap CMS)
- Les passthrough copies (assets, robots.txt, manifest)
- Les données globales SEO
- Les filtres personnalisés (jsonify, schemaText, absoluteUrl)

## Backend (Pages Functions)

Le backend est constitué de **Cloudflare Pages Functions** en TypeScript.

### Point d'entrée : Contact

- **Fichier** : `functions/api/contact.ts`
- **Endpoint** : `POST /api/contact`
- **Fonctionnement** :
  1. Gestion CORS (OPTIONS)
  2. Vérification du token Turnstile
  3. Validation des données du formulaire
  4. Envoi d'email via Resend API
  5. Réponse JSON (`ApiResponse<T>`)

### Point d'entrée : Convocation

- **Fichier** : `functions/api/convocation.ts`
- **Endpoint** : `GET /api/convocation`
- **Fonctionnement** : Requête sur la base D1 pour les données de convocation

### Variables d'environnement

Définies dans `wrangler.toml` (`[vars]`) et en secrets (`wrangler pages secret put`) :

| Variable | Type | Description |
|----------|------|-------------|
| `SMTP_FROM` | var | Email expéditeur (domaine vérifié Resend) |
| `CONTACT_EMAIL` | var | Email destinataire du formulaire contact |
| `RESEND_API_KEY` | secret | Clé API Resend |
| `TURNSTILE_SECRET_KEY` | secret | Clé Turnstile |
| `DB` | binding | Base de données D1 `ovalsaonedb` |

## Installation et Développement Local

### Prérequis

- **Node.js 18+**
- **npm**
- **Git**

### Installation

```bash
cd pages
npm install
```

### Développement Local

```bash
# Build Eleventy + servir via Wrangler Pages dev (port 8788)
npm run dev:pages
```

Le site est accessible sur **http://localhost:8788** avec les Pages Functions actives.

### Accès Local

- **Site complet** : http://localhost:8788
- **API Contact** : http://localhost:8788/api/contact
- **API Convocation** : http://localhost:8788/api/convocation

## Déploiement

### Déploiement sur Cloudflare Pages

```bash
npm run deploy:pages
```

Cette commande effectue :
1. Build Eleventy
2. PurgeCSS + cssnano + terser (minification)
3. Déploiement via `wrangler pages deploy`

### Configuration des secrets

```bash
wrangler pages secret put RESEND_API_KEY --project-name ovalsaone
wrangler pages secret put TURNSTILE_SECRET_KEY --project-name ovalsaone
```

### Domaine personnalisé

1. Dashboard Cloudflare → Workers & Pages → ovalsaone
2. Onglet Custom domains → Set up a custom domain
3. Cloudflare configure automatiquement les DNS

## Maintenance

### Mise à jour du Contenu

1. Éditer les fichiers JSON dans `src/_data/` (ou via Decap CMS)
2. Ajouter les images dans `src/assets/`
3. Tester : `npm run dev:pages`
4. Commit + push

### Troubleshooting

- **Données périmées** : `rm -rf _site && npm run build`
- **Erreurs API** : inspecter la console Wrangler
- **Emails non envoyés** : vérifier `RESEND_API_KEY`
- **Build échoue** : `rm -rf node_modules && npm install`

### Voir aussi

- [Guide de Développement](guide-developpement.md)
- [Guide de Déploiement](guide-deploiement.md)
- [Guide de Maintenance](guide-maintenance.md)
- [DEPLOIEMENT_COMPLET.md](../../DEPLOIEMENT_COMPLET.md) — Guide de déploiement from scratch

---

*Documentation mise à jour le 20 février 2026*
