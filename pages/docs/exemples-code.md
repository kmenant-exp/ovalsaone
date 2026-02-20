# Exemples de Code — Oval Saône

> Dernière mise à jour : 15 juin 2025

Ce document fournit des exemples de code concrets pour le développement et la maintenance du site Oval Saône.

## Sommaire

1. [Templates Liquid](#1-templates-liquid)
2. [Pages Functions (TypeScript)](#2-pages-functions-typescript)
3. [Base de données D1](#3-base-de-données-d1)
4. [JavaScript frontend](#4-javascript-frontend)
5. [Configuration Eleventy](#5-configuration-eleventy)
6. [CSS — Composants](#6-css--composants)

---

## 1. Templates Liquid

### Boucle sur des données JSON

Les fichiers `src/_data/*.json` sont auto-injectés comme variables globales dans les templates.

```liquid
{% comment %} Afficher les actualités (src/_data/actualites.json) {% endcomment %}
{% assign sortedActu = actualites | sort: 'date' | reverse %}
{% for actu in sortedActu %}
  <article class="actu-card">
    <img src="{{ actu.image }}" alt="{{ actu.titre }}" loading="lazy">
    <h3>{{ actu.titre }}</h3>
    <time>{{ actu.date | date: '%d/%m/%Y' }}</time>
    <p>{{ actu.contenu | truncate: 150 }}</p>
  </article>
{% endfor %}
```

### Galerie avec filtres

```liquid
{% assign sortedGallery = gallery | sort: 'date' | reverse %}
{% for photo in sortedGallery %}
  <article class="gallery-item" data-category="{{ photo.categorie }}">
    <div class="gallery-image-container">
      <img src="{{ photo.mainImage }}" alt="{{ photo.alt }}" loading="lazy">
      <div class="gallery-overlay">
        <h3>{{ photo.titre }}</h3>
        <p>{{ photo.date | date: '%d/%m/%Y' }}</p>
        <button class="gallery-view-btn"
                data-photo-titre="{{ photo.titre }}"
                data-photo-images='{{ photo.images | jsonify }}'>
          Voir les photos
        </button>
      </div>
    </div>
  </article>
{% endfor %}
```

### Utilisation du layout

Chaque page `.liquid` déclare le layout Nunjucks partagé :

```liquid
---
layout: layout.njk
title: Contact
description: Contactez Oval Saône
---

<section class="contact section">
  <h1>{{ title }}</h1>
  {%- comment -%} Contenu de la page {%- endcomment -%}
</section>
```

---

## 2. Pages Functions (TypeScript)

### Structure d'une Pages Function

Les fonctions backend sont dans `functions/api/`. Elles s'exécutent comme **Cloudflare Pages Functions**.

```typescript
// functions/api/exemple.ts
import type { PagesFunction } from '@cloudflare/workers-types';

interface Env {
  DB: D1Database;
  RESEND_API_KEY: string;
}

// Handler GET
export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;

  try {
    const result = await env.DB.prepare('SELECT * FROM ma_table').all();

    return new Response(JSON.stringify({
      success: true,
      message: 'Données récupérées',
      data: result.results,
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'Erreur serveur',
    }), { status: 500 });
  }
};
```

### Pattern complet : endpoint POST avec validation

Exemple basé sur le pattern de `contact.ts` :

```typescript
// functions/api/contact.ts (simplifié)
import type { PagesFunction } from '@cloudflare/workers-types';
import { verifyTurnstile } from './_shared';

interface Env {
  RESEND_API_KEY: string;
  SMTP_FROM: string;
  CONTACT_EMAIL: string;
  TURNSTILE_SECRET_KEY: string;
}

interface ContactForm {
  nom: string;
  prenom: string;
  email: string;
  sujet: string;
  message: string;
  'cf-turnstile-response'?: string;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Preflight CORS
export const onRequestOptions: PagesFunction<Env> = async () => {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
};

// Handler POST
export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const data: ContactForm = await request.json();

    // 1. Validation
    const errors = validateForm(data);
    if (errors.length > 0) {
      return errorResponse('Données invalides', 400, errors);
    }

    // 2. Vérification Turnstile
    const turnstile = await verifyTurnstile(
      data['cf-turnstile-response'] || '',
      env.TURNSTILE_SECRET_KEY
    );
    if (!turnstile.success) {
      return errorResponse('Vérification de sécurité échouée', 403);
    }

    // 3. Envoi email via Resend
    const emailResult = await sendEmail(env, data);
    if (!emailResult.ok) {
      return errorResponse('Erreur envoi email', 500);
    }

    return successResponse('Message envoyé avec succès');
  } catch (error) {
    return errorResponse('Erreur serveur', 500);
  }
};

async function sendEmail(env: Env, data: ContactForm): Promise<Response> {
  return fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.SMTP_FROM,
      to: [env.CONTACT_EMAIL],
      subject: `[Contact] ${data.sujet}`,
      html: `<p><strong>${data.prenom} ${data.nom}</strong> (${data.email})</p>
             <p>${data.message}</p>`,
    }),
  });
}
```

### Vérification Turnstile (utilitaire partagé)

```typescript
// functions/api/_shared.ts
const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(
  token: string,
  secretKey: string,
  remoteIp?: string | null
): Promise<{ success: boolean; error?: string }> {
  // Skip en dev si pas de clé configurée
  if (!secretKey) {
    console.warn('TURNSTILE_SECRET_KEY non configurée, vérification ignorée');
    return { success: true };
  }

  if (!token) {
    return { success: false, error: 'Token Turnstile manquant' };
  }

  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteIp) formData.append('remoteip', remoteIp);

  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });

  const result = await response.json();
  return result.success
    ? { success: true }
    : { success: false, error: 'Vérification échouée' };
}
```

---

## 3. Base de données D1

### Requêtes D1 dans une Pages Function

```typescript
// Lecture simple
const result = await env.DB.prepare(
  'SELECT * FROM convocations WHERE event_date >= date("now") ORDER BY event_date'
).all();

// Lecture avec paramètre
const row = await env.DB.prepare(
  'SELECT * FROM convocations WHERE id = ?'
).bind(convocationId).first();

// Insertion
await env.DB.prepare(
  'INSERT INTO convocations (event_name, event_date, equipe, prenom, nom, email, statut) VALUES (?, ?, ?, ?, ?, ?, ?)'
).bind(data.eventName, data.eventDate, data.equipe, data.prenom, data.nom, data.email, data.statut).run();
```

### Migrations D1

Les migrations sont dans le dossier `migrations/` de chaque composant.

```sql
-- migrations/0001_create_convocations.sql
CREATE TABLE IF NOT EXISTS convocations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  event_date TEXT NOT NULL,
  equipe TEXT NOT NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  statut TEXT NOT NULL CHECK (statut IN ('Present', 'Absent')),
  besoin_covoiturage BOOLEAN DEFAULT 0,
  places_proposees INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);
```

Appliquer les migrations :

```bash
# Local
npm run db:migrate:local

# Production
npm run db:migrate
```

---

## 4. JavaScript frontend

### Formulaire avec Turnstile et fetch

```javascript
// src/js/contact.js (pattern simplifié)
async function handleSubmit(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Le token Turnstile est automatiquement inclus par le widget
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.Success || result.success) {
      showMessage('Message envoyé !', 'success');
      form.reset();
      turnstile.reset(); // Reset le widget Turnstile
    } else {
      showMessage(result.Message || result.message, 'error');
    }
  } catch (error) {
    showMessage('Erreur de connexion', 'error');
  }
}
```

### Chargement différé (pattern galerie)

```javascript
// Afficher les éléments cachés au clic "Voir plus"
function setupLoadMore() {
  const btn = document.getElementById('btn-gallery-load-more');
  if (!btn) return;

  btn.addEventListener('click', function() {
    const hiddenItems = document.querySelectorAll('.gallery-item-hidden');
    hiddenItems.forEach(function(item, index) {
      item.classList.remove('gallery-item-hidden');
      item.style.display = 'block';
      setTimeout(function() {
        item.classList.add('fade-in-up');
      }, index * 100);
    });
    btn.style.display = 'none';
  });
}
```

---

## 5. Configuration Eleventy

### Auto-unwrap des fichiers Decap CMS

Decap CMS encapsule les données dans un wrapper `{"key": [...]}`. Eleventy les déplie automatiquement :

```javascript
// eleventy.config.js (extrait)
const UNWRAP_DATA_FILES = new Set([
  'actualites', 'bureau', 'teams', 'sponsors', 'entraineurs', 'gallery'
]);

module.exports = function(eleventyConfig) {
  eleventyConfig.addDataExtension('json', {
    parser: (rawContent, filePath) => {
      const parsed = JSON.parse(rawContent);
      const baseName = path.basename(filePath, '.json');

      // Auto-unwrap si le fichier a une seule clé correspondant au nom
      if (UNWRAP_DATA_FILES.has(baseName) && parsed[baseName]) {
        return parsed[baseName];
      }
      return parsed;
    }
  });

  // Passthrough copies
  eleventyConfig.addPassthroughCopy('src/assets');

  return {
    dir: { input: 'src', output: '_site', includes: '_includes', data: '_data' }
  };
};
```

### Ajouter une nouvelle page

1. Créer `src/ma-page.liquid`
2. Déclarer le front matter :

```liquid
---
layout: layout.njk
title: Ma Page
description: Description pour le SEO
permalink: /ma-page/
---

<section class="ma-page section">
  <div class="container">
    <h1>{{ title }}</h1>
    <!-- Contenu -->
  </div>
</section>
```

3. Ajouter les styles dans `src/css/pages/ma-page.css`
4. Référencer dans `src/css-bundle.njk`
5. Rebuilder : `npm run build`

---

## 6. CSS — Composants

### Structure des styles

```css
/* src/css/styles.css — Design tokens et reset */
:root {
  --color-primary: #1a472a;
  --color-secondary: #2d6a3e;
  --color-accent: #f4a020;
  --color-text: #333;
  --color-bg: #fff;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  --border-radius: 8px;
  --transition: 0.3s ease;
}
```

### Pattern de composant CSS

```css
/* src/css/components/card.css */
.card {
  background: var(--color-bg);
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform var(--transition);
}

.card:hover {
  transform: translateY(-4px);
}

.card-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.card-content {
  padding: var(--spacing-md);
}
```

### Inclusion dans le bundle

Ajouter le fichier dans `src/css-bundle.njk` pour qu'il soit inclus dans le bundle CSS de production :

```nunjucks
---
permalink: css-bundle.css
---
{% include "css/styles.css" %}
{% include "css/components/card.css" %}
{% include "css/components/gallery.css" %}
{% include "css/pages/contact.css" %}
{# Ajouter les nouveaux fichiers ici #}
```

---

## Voir aussi

- [guide-developpement.md](guide-developpement.md) — Guide de développement complet
- [architecture-technique.md](architecture-technique.md) — Architecture du projet

*Dernière mise à jour : 15 juin 2025*
