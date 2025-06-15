# Guide de Maintenance et Mise à Jour (Site Eleventy)

## Sommaire
1. [Introduction](#introduction)
2. [Maintenance du Contenu Eleventy](#maintenance-du-contenu-eleventy)
3. [Maintenance Technique](#maintenance-technique)
4. [Mise à Jour du Design](#mise-à-jour-du-design)
5. [Surveillance et Diagnostics](#surveillance-et-diagnostics)
6. [Sauvegarde et Récupération](#sauvegarde-et-récupération)
7. [Mise à Jour des Dépendances](#mise-à-jour-des-dépendances)
8. [Bonnes Pratiques](#bonnes-pratiques)

## Introduction

Ce guide explique comment maintenir et mettre à jour le site web Oval Saône développé avec Eleventy (11ty) et Azure Static Web Apps. Il couvre la maintenance du contenu via les templates et données JSON, les mises à jour techniques, et la surveillance du système.

## Maintenance du Contenu Eleventy

L'un des principaux avantages d'Eleventy est la facilité de maintenance du contenu via les fichiers JSON et le front matter des templates.

### Mise à Jour des Données JSON

#### Actualités (_data/actualites.json)

Pour ajouter une nouvelle actualité :

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
    // Autres actualités existantes...
  ]
}
```

**Workflow de mise à jour** :
1. Éditer le fichier `src/_data/actualites.json`
2. Ajouter l'image dans `src/assets/actualites/`
3. Commit et push vers GitHub
4. Le site se reconstruit automatiquement

#### Équipes (_data/teams.json)

Pour mettre à jour les informations d'une équipe :

```json
{
  "teams": [
    {
      "category": "U10-U12",
      "name": "École de Rugby",
      "description": "Description mise à jour...",
      "training_days": ["Mercredi 17h", "Samedi 14h"],
      "coach": "Nouveau Coach",
      "contact_email": "coach@example.com"
    }
  ]
}
```

#### Sponsors (_data/sponsors.json)

Pour ajouter ou modifier un sponsor :

```json
{
  "sponsors": [
    {
      "name": "Nouveau Sponsor",
      "logo": "assets/sponsors/nouveau-logo.png",
      "url": "https://nouveau-sponsor.com",
      "category": "partenaire-principal",
      "description": "Description du partenariat"
    }
  ]
}
```

### Mise à Jour du Contenu des Pages

#### Modification du Front Matter

Pour changer le contenu d'une page, éditez le front matter du fichier .liquid :

```liquid
---
layout: layout.njk
title: "Nouveau titre de page"
hero_title: "Nouveau titre hero"
hero_subtitle: "Nouveau sous-titre"
meta_description: "Nouvelle description SEO"
# Nouvelles données spécifiques
custom_section_title: "Section personnalisée"
custom_content: "Contenu personnalisé"
---

<!-- Le contenu HTML peut aussi être modifié -->
<section class="new-section">
    <h2>{{ custom_section_title }}</h2>
    <p>{{ custom_content }}</p>
</section>
```

#### Ajout de Nouvelles Pages

Pour créer une nouvelle page :

1. **Créer le fichier template** :
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

2. **Ajouter les styles spécifiques** :
   ```css
   /* Dans src/css/pages/nouvelle-page.css */
   .page-content {
       padding: 2rem;
   }
   ```

3. **Inclure les styles dans le bundle** :
   ```njk
   <!-- Dans src/css-bundle.njk -->
   {% include "./css/pages/nouvelle-page.css" %}
   ```

4. **Mettre à jour la navigation** :
   Modifier le layout principal pour inclure le lien dans le menu.

### Workflow de Publication

```
1. Éditer les fichiers (JSON, .liquid, CSS)
   ↓
2. Test local avec `npx @11ty/eleventy --serve`
   ↓
3. Commit et push vers GitHub
   ↓
4. GitHub Actions build automatique
   ↓
5. Déploiement automatique sur Azure SWA
   ↓
6. Vérification du site en production
```

### Vérifications après Mise à Jour

1. **Test local** :
   ```bash
   # Build et test du site
   npx @11ty/eleventy --config=src/eleventy.config.js --input=src --output=src/_site
   npx swa start src --api-location src/api
   ```

2. **Vérifications** :
   - Toutes les pages se chargent correctement
   - Les nouveaux contenus s'affichent
   - Les images sont accessibles
   - Pas d'erreurs JavaScript dans la console

3. **Compatibilité des navigateurs** :
   - Tester le site sur les navigateurs principaux
   - Vérifier la compatibilité mobile

4. **Performance** :
   - Vérifier les temps de chargement
   - Identifier les ressources lentes

### Vérifications Trimestrielles

Effectuez ces vérifications tous les trois mois :

1. **Mise à jour des dépendances** :
   - Vérifier les mises à jour du SDK .NET
   - Mettre à jour les packages NuGet
   - Mettre à jour les bibliothèques JavaScript

2. **Vérification de sécurité** :
   - Analyser les vulnérabilités
   - Vérifier les paramètres de sécurité Azure

3. **Révision du contenu** :
   - Vérifier que le contenu est à jour
   - Mettre à jour les informations saisonnières

## Mise à Jour du Contenu

### Modification des Fichiers JSON

Le contenu dynamique du site est stocké dans des fichiers JSON dans le dossier `data/` :

1. **Actualités (actualites.json)** :
   ```json
   [
     {
       "id": 1,
       "titre": "Nouveau titre",
       "date": "2025-06-14",
       "image": "assets/actualites/nouvelle-image.jpg",
       "contenu": "Contenu de l'actualité...",
       "lien": "#"
     },
     // Autres actualités...
   ]
   ```

2. **Équipes (equipes.json)** :
   ```json
   [
     {
       "categorie": "U6",
       "age": "Moins de 6 ans",
       "description": "Nouvelle description...",
       "entrainements": ["Mercredi 14h-15h30"],
       "image": "assets/equipes/u6-nouvelle.jpg"
     },
     // Autres équipes...
   ]
   ```

3. **Processus de mise à jour** :
   - Modifier les fichiers JSON localement
   - Tester les changements en local
   - Pousser les modifications sur GitHub
   - Vérifier le déploiement automatique

### Ajout de Nouvelles Images

1. **Préparer les images** :
   - Optimiser les images (taille et compression)
   - Utiliser des formats adaptés (JPG, PNG, WebP)
   - Respecter les dimensions recommandées

2. **Ajouter les images** :
   - Placer les images dans le dossier approprié
   - Mettre à jour les références dans les fichiers JSON
   - Vérifier l'affichage après déploiement

### Modification des Textes HTML

Pour les textes statiques dans les pages HTML :

1. **Identifier la page** :
   - Localiser le fichier HTML correspondant

2. **Modifier le contenu** :
   - Éditer le texte dans la balise appropriée
   - Préserver la structure HTML et les classes CSS

3. **Tester et déployer** :
   - Vérifier les changements localement
   - Pousser les modifications

## Modification du Design

### Changements CSS Mineurs

1. **Identifier le fichier CSS** :
   - Styles principaux : `css/styles.css`
   - Styles spécifiques : fichiers CSS dédiés

2. **Apporter les modifications** :
   - Utiliser les outils de développement du navigateur pour tester
   - Modifier les propriétés CSS

3. **Tester sur différents appareils** :
   - Vérifier la responsivité
   - Tester sur mobile et desktop

### Changements Majeurs de Design

Pour des changements importants :

1. **Créer une branche dédiée** :
   ```bash
   git checkout -b redesign-feature
   ```

2. **Développer et tester localement** :
   ```bash
   # Lancer le site en local
   npx swa start . --api-location api
   ```

3. **Créer une pull request** pour révision et prévisualisation

4. **Fusionner après validation** pour déployer en production

## Mise à Jour Technique

### Mise à Jour du Runtime .NET

1. **Mettre à jour le SDK localement** :
   ```bash
   # Installer le nouveau SDK
   dotnet new globaljson --sdk-version X.Y.Z
   ```

2. **Mettre à jour le projet** :
   - Modifier le fichier `.csproj` pour cibler la nouvelle version
   - Mettre à jour les packages NuGet

3. **Tester localement** :
   ```bash
   cd api
   dotnet build
   dotnet run
   ```

4. **Déployer** :
   - Pousser les modifications
   - Vérifier le déploiement

### Mise à Jour des Bibliothèques JavaScript

1. **Identifier les bibliothèques externes** :
   - Vérifier les versions et les CDN utilisés

2. **Mettre à jour les liens** :
   ```html
   <!-- Avant -->
   <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
   
   <!-- Après -->
   <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css" rel="stylesheet">
   ```

3. **Tester la compatibilité** avant de déployer

## Surveillance et Diagnostics

### Surveillance avec Azure

1. **Accéder aux métriques** :
   - Dans le portail Azure, aller à votre ressource Static Web App
   - Cliquer sur "Surveillance" > "Métriques"

2. **Configurer des alertes** :
   - Définir des alertes pour les erreurs HTTP
   - Surveiller les temps de réponse

3. **Analyser les logs** :
   - Consulter les logs des fonctions Azure
   - Identifier les erreurs et problèmes

### Diagnostics des Problèmes

1. **Problèmes frontend** :
   - Utiliser la console du navigateur
   - Analyser les erreurs réseau

2. **Problèmes API** :
   - Vérifier les logs des fonctions
   - Tester les endpoints avec Postman

3. **Problèmes de déploiement** :
   - Consulter les logs GitHub Actions
   - Vérifier la configuration de déploiement

## Sauvegarde et Récupération

### Sauvegarde du Code

Le code source est naturellement sauvegardé dans Git, mais prenez ces précautions supplémentaires :

1. **Créer des tags pour les versions** :
   ```bash
   git tag v1.0.0
   git push --tags
   ```

2. **Utiliser des branches pour les fonctionnalités** :
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```

3. **Considérer un miroir du dépôt** pour une sécurité supplémentaire

### Sauvegarde du Contenu

Pour le contenu dynamique dans les fichiers JSON :

1. **Sauvegarde régulière des données** :
   - Copier les fichiers JSON dans un emplacement sécurisé
   - Considérer l'automatisation de cette sauvegarde

2. **Sauvegarde des images** :
   - Conserver les originaux des images
   - Sauvegarder régulièrement le dossier `assets/`

### Récupération

En cas de problème :

1. **Retour à une version précédente** :
   ```bash
   git checkout v1.0.0
   git push -f origin main
   ```

2. **Restauration du contenu** :
   - Restaurer les fichiers JSON et images
   - Déployer à nouveau

## Bonnes Pratiques

### Gestion des Versions

1. **Suivre le versionnement sémantique** :
   - X.Y.Z (Majeur.Mineur.Correctif)
   - Incrémenter selon l'importance des changements

2. **Documenter les changements** :
   - Maintenir un fichier CHANGELOG.md
   - Décrire clairement les modifications

3. **Tester avant de déployer** :
   - Toujours tester localement
   - Utiliser les environnements de prévisualisation pour les pull requests

### Documentation

1. **Maintenir la documentation à jour** :
   - Mettre à jour ce guide après des modifications significatives
   - Documenter les nouvelles fonctionnalités

2. **Documenter les procédures opérationnelles** :
   - Créer des runbooks pour les tâches courantes
   - Documenter les problèmes rencontrés et leurs solutions

### Collaboration

1. **Utiliser les issues GitHub** pour suivre les tâches et bugs

2. **Communiquer les changements** à toutes les parties prenantes

3. **Former les nouveaux contributeurs** à la base de code

---

*Guide mis à jour le 14 juin 2025*
