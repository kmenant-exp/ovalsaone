# Migration vers Eleventy - Site Oval Saône

## Vue d'ensemble

Cette documentation détaille la migration du site web Oval Saône d'une architecture HTML statique vers un générateur de site statique moderne utilisant Eleventy (11ty).

## Motivations de la Migration

### Problèmes de l'Ancienne Architecture

1. **Duplication de code** : Navigation et footer dupliqués sur chaque page HTML
2. **Maintenance difficile** : Modifications globales nécessitant l'édition de multiples fichiers
3. **Gestion des assets** : CSS et JS non optimisés, pas de bundling
4. **Évolutivité limitée** : Ajout de nouvelles pages laborieux
5. **Pas de système de données** : Contenu codé en dur dans le HTML

### Avantages d'Eleventy

1. **Templates réutilisables** : Layout unique pour toutes les pages
2. **Bundling automatique** : CSS et JS concaténés automatiquement
3. **Gestion de données** : Contenu externalisé en JSON
4. **Performance optimale** : Site statique ultra-rapide
5. **Développement moderne** : Hot reload et outils de développement

## Architecture Avant/Après

### Avant : HTML Statique

```
kme-rugby-aswapp/
├── index.html
├── equipes.html
├── ecole.html
├── partenariat.html
├── boutique.html
├── inscription.html
├── contact.html
├── css/
│   ├── styles.css
│   ├── cookie-banner.css
│   └── sponsors.css
├── js/
│   ├── main.js
│   ├── data-loader.js
│   └── [page].js
├── data/
│   ├── actualites.json
│   └── sponsors.json
└── assets/
```

### Après : Eleventy

```
kme-rugby-aswapp/
├── src/
│   ├── *.liquid              # Templates de pages
│   ├── _includes/
│   │   └── layout.njk        # Layout principal
│   ├── _data/               # Données globales JSON
│   ├── _site/               # Site généré
│   ├── css-bundle.njk       # Bundle CSS
│   ├── js-bundle.njk        # Bundle JS
│   ├── css/                 # Sources CSS
│   ├── js/                  # Sources JS
│   ├── assets/              # Ressources statiques
│   └── eleventy.config.js   # Configuration Eleventy
└── package.json
```

## Changements Techniques

### 1. Système de Templates

**Avant** : HTML dupliqué
```html
<!-- index.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Accueil</title>
    <link rel="stylesheet" href="css/styles.css">
</head>
<body>
    <nav>...</nav>  <!-- Dupliqué sur chaque page -->
    <main>Contenu spécifique</main>
    <footer>...</footer>  <!-- Dupliqué sur chaque page -->
</body>
</html>
```

**Après** : Templates Liquid + Layout Nunjucks
```liquid
<!-- index.liquid -->
---
layout: layout.njk
title: "Accueil - École de Rugby Oval Saône"
hero_title: "Bienvenue à l'École de Rugby"
---

<section class="hero">
    <h1>{{ hero_title }}</h1>
</section>
```

### 2. Gestion des Données

**Avant** : Données mélangées dans le HTML
```html
<div class="news-card">
    <h3>Titre de l'actualité</h3>
    <p>Description...</p>
</div>
```

**Après** : Données externalisées en JSON
```json
// _data/actualites.json
{
  "actualites": [
    {
      "title": "Titre de l'actualité",
      "description": "Description..."
    }
  ]
}
```

```liquid
<!-- Dans le template -->
{% for actualite in actualites.actualites %}
<div class="news-card">
    <h3>{{ actualite.title }}</h3>
    <p>{{ actualite.description }}</p>
</div>
{% endfor %}
```

### 3. Bundling CSS/JS

**Avant** : Inclusion manuelle
```html
<link rel="stylesheet" href="css/styles.css">
<link rel="stylesheet" href="css/cookie-banner.css">
<link rel="stylesheet" href="css/sponsors.css">
```

**Après** : Bundle automatique
```njk
<!-- css-bundle.njk -->
---
permalink: /css-bundle.css
---
{% include "./css/styles.css" %}
{% include "./css/components/button.css" %}
{% include "./css/components/nav.css" %}
```

## Processus de Migration

### Étape 1 : Configuration Eleventy

1. Installation d'Eleventy
```bash
npm install --save-dev @11ty/eleventy
```

2. Configuration `eleventy.config.js`
```javascript
export default function(eleventyConfig) {
    eleventyConfig.addPassthroughCopy("./assets");
    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
};
```

### Étape 2 : Création du Layout Principal

Conversion de la structure HTML commune en layout Nunjucks :

```html
<!-- _includes/layout.njk -->
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

### Étape 3 : Conversion des Pages HTML

Transformation de chaque page HTML en template Liquid :

```liquid
---
layout: layout.njk
title: "Titre de la page"
custom_data: "valeur"
---

<!-- Contenu spécifique à la page -->
<section>
    <h1>{{ title }}</h1>
</section>
```

### Étape 4 : Externalisation des Données

Migration des données codées en dur vers des fichiers JSON :

1. Création des fichiers dans `_data/`
2. Remplacement du HTML statique par des boucles Liquid
3. Test de l'affichage des données

### Étape 5 : Mise en Place du Bundling

1. Création de `css-bundle.njk` et `js-bundle.njk`
2. Inclusion de tous les fichiers CSS/JS
3. Mise à jour du layout pour utiliser les bundles

### Étape 6 : Tests et Validation

1. Build local : `npx @11ty/eleventy`
2. Test du site généré
3. Validation de toutes les fonctionnalités
4. Mise à jour de la configuration de déploiement

## Impact sur le Workflow de Développement

### Avant

```
Édition HTML → Test → Commit → Déploiement
```

### Après

```
Édition Templates/Données → Build Eleventy → Test → Commit → Build Auto → Déploiement
```

## Bénéfices Constatés

### Performance

- **Bundling CSS/JS** : Réduction du nombre de requêtes HTTP
- **Site statique** : Temps de chargement optimisés
- **CDN intégré** : Distribution mondiale via Azure Static Web Apps

### Maintenabilité

- **Moins de duplication** : Layout unique pour toutes les pages
- **Données centralisées** : Mise à jour simplifiée du contenu
- **Structure modulaire** : CSS organisé par composants

### Évolutivité

- **Ajout de pages simplifié** : Nouveau fichier .liquid
- **Système de données flexible** : Extension facile des modèles JSON
- **Templates réutilisables** : Composants partageables

## Migration du Déploiement

### Configuration GitHub Actions

Mise à jour du workflow pour inclure le build Eleventy :

```yaml
- name: Build Eleventy site
  run: npx @11ty/eleventy --config=src/eleventy.config.js --input=src --output=src/_site

- name: Build And Deploy
  uses: Azure/static-web-apps-deploy@v1
  with:
    app_location: "src/_site"  # Site généré par Eleventy
    api_location: "src/api"
    output_location: ""
```

## Recommandations pour l'Avenir

### Maintenance

1. **Mise à jour régulière d'Eleventy** : Suivre les versions et nouvelles fonctionnalités
2. **Optimisation continue** : Profiter des nouveaux plugins Eleventy
3. **Formation équipe** : S'assurer que l'équipe maîtrise Liquid et Nunjucks

### Évolutions Possibles

1. **Plugins Eleventy** : Image optimization, sitemap, RSS
2. **TypeScript** : Migration vers des templates plus typés
3. **Headless CMS** : Intégration avec un CMS pour les éditeurs non-techniques

## Conclusion

La migration vers Eleventy a considérablement amélioré la maintenabilité et les performances du site Oval Saône. Le système de templates et de données permet une évolution plus rapide et une maintenance simplifiée, tout en conservant les avantages d'un site statique ultra-performant.
