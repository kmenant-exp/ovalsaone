# Architecture Technique du Site Web Oval Saône

## Sommaire
1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Frontend avec Eleventy](#architecture-frontend-avec-eleventy)
3. [Architecture Backend](#architecture-backend)
4. [Intégration Frontend-Backend](#intégration-frontend-backend)
5. [Sécurité](#sécurité)
6. [Performance](#performance)
7. [Évolutivité](#évolutivité)

## Vue d'Ensemble

Le site web Oval Saône est construit sur l'écosystème **Cloudflare**, combinant un générateur de site statique moderne (Eleventy 3) avec un backend serverless en TypeScript.

### Diagramme d'Architecture

```
┌───────────────────────────────────────────────────────────────────┐
│                       Cloudflare Pages                            │
│                                                                   │
│  ┌───────────────────┐         ┌───────────────────────────┐     │
│  │                   │         │                           │     │
│  │  Frontend Eleventy│         │  Pages Functions          │     │
│  │  (Site statique   │◄───────►│  (TypeScript)             │     │
│  │   _site/)         │   API   │                           │     │
│  └───────────────────┘         └───────────────────────────┘     │
│            │                       │              │              │
└────────────┼───────────────────────┼──────────────┼──────────────┘
             │                       │              │
             ▼                       ▼              ▼
    ┌─────────────────┐   ┌──────────────────┐  ┌──────────────┐
    │   CDN Cloudflare │   │   Resend API     │  │ Cloudflare   │
    │   (distribution  │   │   (emails)       │  │ D1 (SQLite)  │
    │    mondiale)     │   │                  │  │              │
    └─────────────────┘   └──────────────────┘  └──────────────┘
```

### Composants Principaux

1. **Frontend Eleventy 3** :
   - Générateur de site statique
   - Templates Liquid et Nunjucks
   - Bundling CSS/JS par concaténation
   - Données JSON via `_data/` et front matter
   - Validation des formulaires côté client
   - Protection anti-bot via Cloudflare Turnstile

2. **Backend Serverless** :
   - Cloudflare Pages Functions (TypeScript)
   - API REST pour formulaire de contact et convocations
   - Envoi d'emails via Resend API
   - Vérification Turnstile côté serveur

3. **Base de données** :
   - Cloudflare D1 (SQLite distribué)
   - Convocations et réponses des joueurs

4. **Cloudflare Pages** :
   - Hébergement du site statique et des Functions
   - CDN mondial intégré
   - HTTPS automatique
   - Déploiement via Wrangler CLI

## Architecture Frontend avec Eleventy

### Vue d'ensemble d'Eleventy

Eleventy 3 transforme les templates et données en HTML statique optimisé :

- **Performance** : Sites ultra-rapides
- **Flexibilité** : Templates Liquid et Nunjucks
- **Simplicité** : Configuration minimale (`eleventy.config.js`)
- **Intégration CMS** : Auto-unwrap des fichiers Decap CMS

### Flux de Build Eleventy

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Templates     │    │    Eleventy 3    │    │   Site Statique │
│   (.liquid)     │───▶│    Process       │───▶│   (_site/)      │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Données JSON  │    │   CSS/JS Bundle  │    │   Assets Copiés │
│   (_data/)      │    │   (.njk)         │    │   (images, etc) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Structure de Fichiers

```
src/
├── _includes/                  # Templates partagés
│   └── layout.njk             # Layout principal Nunjucks
├── _data/                     # Données globales JSON
│   ├── actualites.json        # Actualités (Decap CMS)
│   ├── gallery.json           # Galerie photo (Decap CMS)
│   ├── sponsors.json          # Sponsors (Decap CMS)
│   ├── teams.json             # Équipes (Decap CMS)
│   ├── bureau.json            # Bureau (Decap CMS)
│   ├── entraineurs.json       # Entraîneurs (Decap CMS)
│   ├── calendars.json         # Config Google Calendar
│   ├── turnstile.json         # Config Turnstile
│   └── page_*.json            # Données par page
├── *.liquid                   # Pages templates
├── css-bundle.njk             # Bundle CSS
├── js-bundle.njk              # Bundle JS
├── css/                       # Sources CSS
│   ├── styles.css             # Variables et resets
│   ├── components/            # Styles par composant
│   ├── pages/                 # Styles par page
│   └── themes/                # Thèmes
├── js/                        # Sources JavaScript ESM
│   ├── main.js                # Comportements cross-page
│   ├── gallery.js             # Galerie photo
│   ├── contact.js             # Formulaire contact
│   ├── convocations.js        # Convocations
│   ├── calendar-utils.js      # Utilitaires calendrier
│   └── ...                    # Autres modules par page
├── assets/                    # Ressources statiques
└── sitemap.njk                # Sitemap XML
```

### Système de Templates

#### Templates Liquid (.liquid)

```liquid
---
layout: layout.njk
title: "Titre de la page"
---

<section class="hero">
    <h1>{{ title }}</h1>
</section>

{% for equipe in teams %}
    <div class="team-card">
        <h3>{{ equipe.name }}</h3>
    </div>
{% endfor %}
```

💡 Les fichiers Decap CMS wrappés (`{"key": [...]}`) sont auto-unwrappés par `eleventy.config.js`, donc `teams` est directement itérable.

### Système de Bundling

**CSS** (`css-bundle.njk`) et **JS** (`js-bundle.njk`) concatènent les sources en un seul fichier chacun. En production, PurgeCSS + cssnano + terser optimisent les bundles.

### Gestion des Données

Les fichiers JSON dans `_data/` sont automatiquement disponibles dans tous les templates par leur nom de fichier (sans extension) :

```liquid
{% for actu in actualites %}
    <article>{{ actu.title }}</article>
{% endfor %}
```

## Architecture Backend

### Structure de l'API

```
functions/
├── api/
│   ├── _shared.ts           # Utilitaires partagés
│   │   ├── verifyTurnstile() # Vérification anti-bot
│   │   └── helpers          # Réponses JSON, CORS
│   ├── contact.ts           # POST /api/contact
│   └── convocation.ts       # GET /api/convocation
└── tsconfig.json
```

### Points d'Entrée API

1. **Contact** (`contact.ts`) :
   - Endpoint: `POST /api/contact` + `OPTIONS` (CORS)
   - Vérification Turnstile
   - Validation des données du formulaire
   - Envoi d'email via Resend API
   - Réponse JSON `ApiResponse<T>`

2. **Convocation** (`convocation.ts`) :
   - Endpoint: `GET /api/convocation`
   - Requête sur la base D1
   - Données de convocation

### Pattern de la Pages Function

```typescript
import type { PagesFunction } from '@cloudflare/workers-types';
import { verifyTurnstile } from './_shared';

interface Env {
  RESEND_API_KEY: string;
  SMTP_FROM: string;
  CONTACT_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
  DB: D1Database;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  // 1. Vérifier le token Turnstile
  // 2. Valider les données
  // 3. Envoyer l'email via Resend
  // 4. Retourner la réponse JSON
};
```

### Bindings et Variables

Définis dans `wrangler.toml` :

```toml
[vars]
SMTP_FROM = "contact@ovalsaone.fr"
CONTACT_EMAIL = "kevin.menant@gmail.com"

[[d1_databases]]
binding = "DB"
database_name = "ovalsaonedb"
database_id = "..."
```

Secrets (via `wrangler pages secret put`) :
- `RESEND_API_KEY`
- `TURNSTILE_SECRET_KEY`

## Intégration Frontend-Backend

### Communication API

Le frontend communique avec le backend via `fetch` :

```javascript
const response = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
});
const result = await response.json();
```

### Gestion des Erreurs

1. **Côté Client** : Validation avant envoi, gestion des erreurs réseau, messages utilisateur
2. **Côté Serveur** : Validation des données, vérification Turnstile, réponses HTTP avec codes appropriés

## Sécurité

### Cloudflare Turnstile

Protection anti-bot intégrée dans les formulaires :
- Widget côté client générant un token
- Vérification du token côté serveur dans la Pages Function
- Ignoré en développement local (quand `TURNSTILE_SECRET_KEY` n'est pas défini)

### Protection CORS

Les Pages Functions gèrent les en-têtes CORS explicitement :

```typescript
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};
```

### Validation des Données

1. **Côté Client** : Validation HTML5 + JavaScript
2. **Côté Serveur** : Vérification TypeScript dans les Pages Functions

### Headers de Sécurité

Configurés dans `static/_headers` pour la production.

### HTTPS

Certificats SSL/TLS gérés automatiquement par Cloudflare.

## Performance

### Optimisations Frontend

- **Build de production** : PurgeCSS (CSS inutilisé supprimé), cssnano (minification CSS), terser (minification JS)
- **Lazy loading** : Images avec `loading="lazy"`
- **CDN Cloudflare** : Distribution mondiale automatique
- **Site statique** : Pas de rendu côté serveur, temps de réponse minimal

### Optimisations Backend

- **Edge Computing** : Pages Functions exécutées au plus proche de l'utilisateur
- **D1** : Base SQLite distribuée avec faible latence
- **Resend** : API HTTP directe, pas de connexion SMTP

## Évolutivité

### Extensions Réalisées

- ✅ **Base de données** : Cloudflare D1 pour les convocations
- ✅ **Dashboard admin** : Interface d'administration avec Hono + Google OAuth
- ✅ **CMS intégré** : Decap CMS pour l'édition du contenu
- ✅ **Worker Cron** : Notifications hebdomadaires automatiques

### Extensions Possibles

- Système de paiement en ligne pour la boutique
- Zone membre avec authentification
- Statistiques avancées de fréquentation

### Mise à l'Échelle

Cloudflare s'adapte automatiquement :
- **Frontend** : CDN mondial
- **Backend** : Pages Functions distribuées
- **Base de données** : D1 avec réplication

---

*Documentation d'architecture mise à jour le 20 février 2026*
