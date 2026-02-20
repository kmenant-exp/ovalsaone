# Site Web Oval Saône

Site web du club de rugby Oval Saône, construit avec Eleventy 3 (SSG) et déployé sur Cloudflare Pages avec des Pages Functions en TypeScript.

## 🏉 Fonctionnalités

### Pages du site
- **Accueil** — Actualités, galerie photo, sponsors
- **Équipes** — Catégories (U6, U8, U10, U12, U14, Seniors)
- **École de rugby** — Histoire du club, bureau, entraîneurs
- **Événements** — Calendrier Google intégré
- **Partenariat** — Sponsors et informations partenaires
- **Boutique** — Produits et équipements du club
- **Inscription** — Formulaire d'inscription avec catégories automatiques
- **Contact** — Formulaire avec vérification Turnstile et envoi via Resend
- **FAQ** — Questions fréquentes
- **Convocations** — Réponse aux convocations de match

### Fonctionnalités techniques
- **Design responsive** mobile-first avec menu hamburger
- **Navigation sticky** avec réduction au scroll
- **Effets parallax** (hero, histoire)
- **Galerie photo** avec filtres, lightbox et carousel
- **Validation des formulaires** côté client + serveur (Turnstile)
- **Pages Functions TypeScript** pour contact et convocations
- **Base de données D1** pour les convocations
- **Envoi d'emails** via Resend API
- **Decap CMS** pour l'édition du contenu (via admin)

## 🛠️ Technologies

| Couche | Technologies |
|--------|-------------|
| **Frontend** | Eleventy 3, Liquid, Nunjucks, CSS3 Grid/Flexbox, JavaScript ES6+, Font Awesome |
| **Backend** | Cloudflare Pages Functions (TypeScript) |
| **Base de données** | Cloudflare D1 (SQLite distribué) |
| **Email** | Resend API |
| **Anti-bot** | Cloudflare Turnstile |
| **CMS** | Decap CMS (via admin) |
| **Déploiement** | Cloudflare Pages, Wrangler CLI |

## 📁 Structure du projet

```
pages/
├── eleventy.config.js         # Configuration Eleventy
├── package.json               # Dépendances et scripts npm
├── wrangler.toml              # Configuration Cloudflare (bindings, vars, D1)
├── _site/                     # Site généré (output Eleventy — ne pas éditer)
├── functions/                 # Pages Functions TypeScript (API)
│   ├── api/
│   │   ├── _shared.ts        # Utilitaires partagés (Turnstile, réponses)
│   │   ├── contact.ts        # POST /api/contact
│   │   └── convocation.ts    # GET /api/convocation
│   └── tsconfig.json
├── src/                       # Code source Eleventy
│   ├── *.liquid               # Pages templates
│   ├── _includes/
│   │   └── layout.njk        # Layout principal Nunjucks
│   ├── _data/                 # Données JSON (Decap CMS + manuelles)
│   ├── css/                   # Styles CSS
│   │   ├── styles.css         # Variables et resets
│   │   ├── components/        # Composants (nav, footer, hero…)
│   │   ├── pages/             # Styles par page
│   │   └── themes/            # Thèmes
│   ├── js/                    # Scripts JavaScript ESM
│   ├── assets/                # Images et ressources
│   ├── css-bundle.njk         # Concaténation CSS
│   └── js-bundle.njk          # Concaténation JS
├── static/
│   └── _headers               # Headers HTTP de production
├── migrations/                # Migrations D1
└── docs/                      # Documentation technique
```

## 🚀 Installation et développement

### Prérequis
- Node.js 18+
- npm
- Git

### Installation

```bash
cd pages
npm install
```

### Développement local

```bash
# Build Eleventy + servir via Wrangler Pages dev (port 8788)
npm run dev:pages
```

Le site est accessible sur **http://localhost:8788** avec les Pages Functions actives.

### Build seul

```bash
npm run build              # Build standard
npm run build:prod         # Build + PurgeCSS + cssnano + terser
```

### Déploiement

```bash
npm run deploy:pages       # Build prod + déploiement Cloudflare Pages
```

### Configuration des secrets

```bash
# Clé API Resend (emails)
wrangler pages secret put RESEND_API_KEY --project-name ovalsaone

# Clé Turnstile (protection anti-bot)
wrangler pages secret put TURNSTILE_SECRET_KEY --project-name ovalsaone
```

### Migrations D1

```bash
npm run db:migrate         # Appliquer les migrations (remote)
npm run db:migrate:local   # Appliquer les migrations (local)
```

## 📝 Gestion du contenu

Le contenu dynamique est géré via les fichiers JSON dans `src/_data/`. Certains sont éditables via Decap CMS (actualités, galerie, bureau, équipes, sponsors, entraîneurs).

Pour modifier manuellement :
1. Éditer le fichier JSON concerné dans `src/_data/`
2. Ajouter les images associées dans `src/assets/`
3. Lancer `npm run build` pour vérifier
4. Commit + push pour déclencher le déploiement

## 🔧 Personnalisation

### Couleurs et styles
Les design tokens sont dans `src/css/styles.css` via des custom properties CSS.

### Ajouter un style
1. Créer le fichier dans `src/css/components/` ou `src/css/pages/`
2. L'inclure dans `src/css-bundle.njk`

### Ajouter un script
1. Créer le module dans `src/js/`
2. L'inclure dans `src/js-bundle.njk`

## 🔒 Sécurité

- **HTTPS** automatique via Cloudflare
- **Turnstile** sur les formulaires (protection anti-bot)
- **Validation serveur** dans les Pages Functions
- **CORS** explicites sur les endpoints API
- **Headers de sécurité** configurés dans `static/_headers`

## 📱 Compatibilité

- Design responsive (mobile, tablette, desktop)
- Navigateurs modernes (Chrome, Firefox, Safari, Edge)
- Progressive Enhancement

## 📚 Documentation

Voir le dossier [docs/](docs/index.md) pour la documentation complète.

## 🆘 Troubleshooting

- **Données périmées** : supprimer `_site/` et relancer `npm run build`
- **API en erreur** : inspecter la console Wrangler avec `npm run dev:pages`
- **Emails non envoyés** : vérifier `RESEND_API_KEY` (voir [DEBUG.md](DEBUG.md))

---

*Dernière mise à jour : 20 février 2026*
