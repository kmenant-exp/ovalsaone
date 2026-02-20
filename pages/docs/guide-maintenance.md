# Guide de Maintenance et Mise à Jour

## Sommaire
1. [Introduction](#introduction)
2. [Maintenance du Contenu](#maintenance-du-contenu)
3. [Maintenance Technique](#maintenance-technique)
4. [Mise à Jour du Design](#mise-à-jour-du-design)
5. [Surveillance et Diagnostics](#surveillance-et-diagnostics)
6. [Sauvegarde et Récupération](#sauvegarde-et-récupération)
7. [Bonnes Pratiques](#bonnes-pratiques)

## Introduction

Ce guide explique comment maintenir et mettre à jour le site web Oval Saône développé avec **Eleventy 3** et hébergé sur **Cloudflare Pages**. Il couvre la maintenance du contenu via Decap CMS et les fichiers JSON, les mises à jour techniques, et la surveillance du système.

## Maintenance du Contenu

### Via Decap CMS (recommandé)

Le moyen le plus simple de mettre à jour le contenu est d'utiliser le **panneau d'administration Decap CMS** :

1. Accéder à `https://ovalsaone-admin.pages.dev/cms/`
2. S'authentifier avec un compte autorisé
3. Modifier les actualités, équipes, sponsors, galerie, etc.
4. Les modifications sont commitées sur GitHub et déclenchent un redéploiement

### Via les fichiers JSON (_data/)

Les fichiers JSON dans `src/_data/` sont la source de vérité pour le contenu dynamique. Certains sont gérés par Decap CMS, d'autres manuellement.

⚠️ **Note** : Les fichiers gérés par Decap CMS utilisent le format `{"key": [...]}` et sont auto-unwrapped par `eleventy.config.js`. Dans les templates, on itère directement (`{% for item in actualites %}` et non `{% for item in actualites.actualites %}`).

#### Actualités (actualites.json)

```json
{
  "actualites": [
    {
      "id": 4,
      "title": "Nouvelle actualité",
      "excerpt": "Description courte de l'actualité...",
      "date": "2025-06-15",
      "image": "assets/actualites/nouvelle-actu.jpg",
      "content": "Contenu complet de l'actualité..."
    }
  ]
}
```

**Workflow** :
1. Éditer `src/_data/actualites.json`
2. Ajouter l'image dans `src/assets/actualites/`
3. Tester : `npm run dev:pages` → http://localhost:8788
4. Commit et push

#### Équipes (teams.json)

```json
{
  "teams": [
    {
      "category": "U10-U12",
      "name": "École de Rugby",
      "description": "Description mise à jour...",
      "training_days": ["Mercredi 17h", "Samedi 14h"],
      "coach": "Nouveau Coach"
    }
  ]
}
```

#### Sponsors (sponsors.json)

```json
{
  "sponsors": [
    {
      "name": "Nouveau Sponsor",
      "logo": "assets/sponsors/nouveau-logo.png",
      "url": "https://nouveau-sponsor.com",
      "category": "partenaire-principal"
    }
  ]
}
```

### Ajout de Nouvelles Pages

1. **Créer le fichier template** dans `src/` :
   ```liquid
   ---
   layout: layout.njk
   title: "Nouvelle Page"
   permalink: /nouvelle-page/
   ---
   
   <section class="page-content">
       <h1>{{ title }}</h1>
       <p>Contenu de la nouvelle page...</p>
   </section>
   ```

2. **Ajouter les styles** dans `src/css/pages/nouvelle-page.css`

3. **Inclure dans le bundle** — ajouter dans `src/css-bundle.njk` :
   ```njk
   {% include "./css/pages/nouvelle-page.css" %}
   ```

4. **Mettre à jour la navigation** dans `src/_includes/layout.njk`

### Workflow de Publication

```
1. Éditer les fichiers (JSON, .liquid, CSS)
   ↓
2. Test local : npm run dev:pages → http://localhost:8788
   ↓
3. Commit et push vers GitHub
   ↓
4. Déploiement via npm run deploy:pages (ou déploiement automatique si connecté)
   ↓
5. Vérification du site en production
```

### Vérifications après Mise à Jour

1. **Test local** :
   ```bash
   npm run dev:pages
   # Ouvrir http://localhost:8788
   ```

2. **Vérifications** :
   - Toutes les pages se chargent correctement
   - Les nouveaux contenus s'affichent
   - Les images sont accessibles
   - Pas d'erreurs JavaScript dans la console
   - Les formulaires fonctionnent (API + Turnstile)

3. **Compatibilité** :
   - Tester sur navigateurs principaux + mobile

### Vérifications Trimestrielles

1. **Mise à jour des dépendances** :
   ```bash
   cd pages
   npm outdated          # Voir les dépendances obsolètes
   npm update            # Mettre à jour les patch/minor
   npm audit             # Vérifier les vulnérabilités
   ```

2. **Vérification de sécurité** :
   - Vérifier les alertes Dependabot sur GitHub
   - Valider les clés API (Resend, Turnstile)
   - Vérifier les secrets Cloudflare

3. **Révision du contenu** :
   - Vérifier les informations de saison
   - Mettre à jour les horaires d'entraînement
   - Actualiser les photos et actualités

## Maintenance Technique

### Mise à Jour des Dépendances Node.js

```bash
cd pages

# Vérifier les dépendances obsolètes
npm outdated

# Mettre à jour les dépendances
npm update

# Pour une mise à jour majeure (ex : Eleventy, Wrangler)
npm install @11ty/eleventy@latest
npm install wrangler@latest --save-dev

# Tester après mise à jour
npm run build
npm run dev:pages
```

### Mise à Jour des Bibliothèques Frontend

Les bibliothèques externes (Font Awesome, etc.) sont chargées via CDN dans `layout.njk`. Pour les mettre à jour :

1. Vérifier la dernière version sur le site officiel ou cdnjs
2. Modifier l'URL dans `src/_includes/layout.njk`
3. Tester la compatibilité

### Migrations D1

Pour modifier le schéma de la base de données :

1. Créer un fichier de migration dans `migrations/` :
   ```sql
   -- migrations/0003_add_new_table.sql
   CREATE TABLE IF NOT EXISTS new_table (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     ...
   );
   ```

2. Appliquer localement : `npm run db:migrate:local`
3. Appliquer en production : `npm run db:migrate`

## Mise à Jour du Design

### Changements CSS Mineurs

1. Identifier le fichier CSS concerné dans `src/css/` (composants, pages, thèmes)
2. Utiliser les DevTools du navigateur pour tester les changements
3. Modifier le fichier source
4. Vérifier que le fichier est inclus dans `css-bundle.njk`
5. Tester la responsivité (mobile-first)

### Changements Majeurs

1. **Créer une branche dédiée** :
   ```bash
   git checkout -b redesign-feature
   ```

2. **Développer et tester** :
   ```bash
   npm run dev:pages
   ```

3. **Créer une pull request** pour révision

4. **Fusionner après validation** → le déploiement se fait via `npm run deploy:pages`

💡 Si le repo est connecté à Cloudflare Pages, les pull requests génèrent automatiquement un environnement de prévisualisation.

## Surveillance et Diagnostics

### Logs Cloudflare

1. **Logs en temps réel** :
   ```bash
   wrangler pages deployment tail --project-name ovalsaone
   ```

2. **Dashboard Cloudflare** :
   - Workers & Pages → ovalsaone → Deployments
   - Voir les logs de chaque déploiement
   - Métriques de requêtes, erreurs, latence

3. **Logs D1** :
   ```bash
   wrangler d1 execute ovalsaonedb --command="SELECT * FROM convocations ORDER BY id DESC LIMIT 5"
   ```

### Diagnostics des Problèmes

1. **Problèmes frontend** :
   - Console du navigateur (erreurs JS)
   - Onglet Network (requêtes API échouées)
   - Supprimer `_site/` et relancer `npm run build`

2. **Problèmes API** :
   - Vérifier les logs : `wrangler pages deployment tail`
   - Tester l'endpoint manuellement :
     ```bash
     curl -X POST http://localhost:8788/api/contact \
       -H "Content-Type: application/json" \
       -d '{"nom":"Test","prenom":"Test","email":"test@test.com","sujet":"Test","message":"Message de test"}'
     ```

3. **Emails non envoyés** :
   - Vérifier `RESEND_API_KEY` : `wrangler pages secret list --project-name ovalsaone`
   - Consulter le Dashboard Resend pour les logs d'envoi
   - En local, sans `RESEND_API_KEY`, les emails sont simulés dans la console

4. **Problèmes de déploiement** :
   - Vérifier le build : `npm run build`
   - Vérifier les erreurs Wrangler : `npm run deploy:pages`
   - Vérifier les bindings D1 dans le Dashboard Cloudflare

## Sauvegarde et Récupération

### Sauvegarde du Code

Le code source est sauvegardé dans Git :

1. **Tags de version** :
   ```bash
   git tag v1.0.0
   git push --tags
   ```

2. **Branches de fonctionnalités** :
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```

### Sauvegarde de la Base D1

```bash
# Export de la base D1
wrangler d1 export ovalsaonedb --output=backup.sql

# Ou requête spécifique
wrangler d1 execute ovalsaonedb --command="SELECT * FROM convocations" --json > convocations-backup.json
```

### Sauvegarde du Contenu

- **Fichiers JSON** : Versionnés dans Git (`src/_data/`)
- **Images** : Versionnées dans Git (`src/assets/`)
- **Base D1** : Export régulier via Wrangler

### Récupération

```bash
# Retour à une version précédente
git checkout v1.0.0

# Redéployer
npm run deploy:pages

# Restaurer la base D1
wrangler d1 execute ovalsaonedb --file=backup.sql
```

## Bonnes Pratiques

### Gestion des Versions

1. **Versionnement sémantique** : X.Y.Z (Majeur.Mineur.Correctif)
2. **Commits atomiques** avec messages clairs
3. **Tester localement** avant chaque push

### Documentation

1. Mettre à jour ce guide après des modifications significatives
2. Documenter les nouvelles fonctionnalités
3. Maintenir les README à jour dans chaque composant

### Sécurité

1. **Ne jamais commiter de secrets** — utiliser `wrangler pages secret put`
2. **Vérifier régulièrement** les dépendances (`npm audit`)
3. **Turnstile** protège les formulaires publics

### Collaboration

1. **Issues GitHub** pour suivre les tâches et bugs
2. **Pull requests** pour les changements importants
3. **Environnements de prévisualisation** Cloudflare pour valider avant fusion

## Voir aussi

- [Guide de Développement](guide-developpement.md)
- [Guide de Déploiement](guide-deploiement.md)
- [Architecture Technique](architecture-technique.md)
- [FAQ](faq.md)

---

*Guide mis à jour le 20 février 2026*
