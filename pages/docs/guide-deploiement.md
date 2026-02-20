# Guide de Déploiement sur Cloudflare Pages

## Sommaire
1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Configuration Cloudflare](#configuration-cloudflare)
4. [Déploiement du Site](#déploiement-du-site)
5. [Configuration des Secrets](#configuration-des-secrets)
6. [Domaine Personnalisé](#domaine-personnalisé)
7. [Déploiement Continu](#déploiement-continu)
8. [Résolution des Problèmes](#résolution-des-problèmes)

## Introduction

Ce guide explique comment déployer le site web Oval Saône sur **Cloudflare Pages**. Il couvre la configuration initiale, le déploiement via Wrangler CLI, et les bonnes pratiques pour maintenir le site en production.

## Prérequis

1. **Un compte Cloudflare** (plan Free suffisant)
2. **Node.js 18+** installé localement
3. **Wrangler CLI** installé (`npm install -g wrangler`)
4. **Authentification Wrangler** : `wrangler login`
5. **Un compte Resend** avec un domaine vérifié (pour les emails)

## Configuration Cloudflare

### Base de données D1

La base D1 `ovalsaonedb` doit être créée avant le premier déploiement :

```bash
wrangler d1 create ovalsaonedb
```

Copier le `database_id` dans `wrangler.toml` :

```toml
[[d1_databases]]
binding = "DB"
database_name = "ovalsaonedb"
database_id = "VOTRE_DATABASE_ID"
```

Appliquer les migrations :

```bash
npm run db:migrate
```

### Variables d'environnement

Définies dans `wrangler.toml` (section `[vars]`) :

```toml
[vars]
SMTP_FROM = "contact@ovalsaone.fr"
CONTACT_EMAIL = "contact@ovalsaone.fr"
```

## Déploiement du Site

### Déploiement manuel (Wrangler CLI)

```bash
cd pages

# Build de production + déploiement
npm run deploy:pages
```

Cette commande exécute :
1. `npm run build` — Génération du site avec Eleventy
2. `npm run minify` — PurgeCSS + cssnano + terser
3. `wrangler pages deploy _site --project-name ovalsaone`

### Premier déploiement

Lors du premier déploiement, Cloudflare Pages crée automatiquement le projet. L'URL sera :

```
https://ovalsaone.pages.dev
```

## Configuration des Secrets

Les secrets ne sont **jamais** stockés dans le code. Ils sont configurés via Wrangler ou le Dashboard Cloudflare.

### Via Wrangler CLI

```bash
cd pages

# Clé API Resend (envoi d'emails)
wrangler pages secret put RESEND_API_KEY --project-name ovalsaone

# Clé Turnstile (protection anti-bot)
wrangler pages secret put TURNSTILE_SECRET_KEY --project-name ovalsaone
```

### Via le Dashboard Cloudflare

1. Workers & Pages → ovalsaone → Settings → Environment Variables
2. Ajouter les variables en tant que secrets (chiffrées)

### Résumé des variables

| Variable | Type | Description |
|----------|------|-------------|
| `SMTP_FROM` | var (`wrangler.toml`) | Email expéditeur |
| `CONTACT_EMAIL` | var (`wrangler.toml`) | Email destinataire formulaire |
| `RESEND_API_KEY` | secret | Clé API Resend |
| `TURNSTILE_SECRET_KEY` | secret | Clé Turnstile |
| `DB` | binding D1 | Base de données `ovalsaonedb` |

## Domaine Personnalisé

1. Dashboard Cloudflare → Workers & Pages → ovalsaone
2. Onglet **Custom domains** → Set up a custom domain
3. Entrer le domaine (ex : `ovalsaone.fr` ou `www.ovalsaone.fr`)
4. Si le domaine est géré par Cloudflare, les DNS sont configurés automatiquement
5. HTTPS est activé automatiquement

## Déploiement Continu

### Option 1 : Déploiement manuel

Chaque `npm run deploy:pages` publie une nouvelle version.

### Option 2 : Connecter le repo GitHub

1. Dashboard Cloudflare → Workers & Pages → Create application → Pages
2. Connect to Git → Sélectionner le repo
3. Configurer :
   - **Build command** : `cd pages && npm run build:prod`
   - **Build output directory** : `pages/_site`
4. Chaque push sur `main` déclenche un déploiement automatique

### Environnements de prévisualisation

Cloudflare Pages crée automatiquement des environnements de prévisualisation pour les branches et pull requests.

## Résolution des Problèmes

### Le déploiement échoue

1. Vérifier que la version de Node.js est >= 18
2. Vérifier les logs du build : `npm run build`
3. Supprimer `_site/` et `node_modules/` puis réessayer

### L'API ne fonctionne pas

1. Vérifier les logs : `wrangler pages deployment tail`
2. Vérifier que les secrets sont configurés : `wrangler pages secret list`
3. Vérifier les bindings D1 dans le Dashboard

### Emails non envoyés

1. Vérifier `RESEND_API_KEY` : `wrangler pages secret list`
2. Vérifier que le domaine est vérifié dans Resend
3. Consulter les logs Resend dans le Dashboard Resend

### Problèmes de domaine

1. Vérifier la propagation DNS (peut prendre jusqu'à 48h)
2. Vérifier les enregistrements dans le Dashboard Cloudflare → DNS

### Commandes utiles

```bash
# Lister les déploiements
wrangler pages deployment list --project-name ovalsaone

# Voir les logs en temps réel
wrangler pages deployment tail --project-name ovalsaone

# Lister les secrets
wrangler pages secret list --project-name ovalsaone

# Consulter la base D1
wrangler d1 execute ovalsaonedb --command="SELECT * FROM convocations LIMIT 5"
```

## Voir aussi

- [DEPLOIEMENT_COMPLET.md](../../DEPLOIEMENT_COMPLET.md) — Guide de déploiement from scratch (comptes, D1, Worker, Admin)
- [Guide de Maintenance](guide-maintenance.md)
- [Architecture Technique](architecture-technique.md)

---

*Guide mis à jour le 20 février 2026*
