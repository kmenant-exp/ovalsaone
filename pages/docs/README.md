# Documentation du Site Web Oval Saône

## Sommaire
1. [Introduction](#introduction)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Frontend Eleventy](#frontend-eleventy)
5. [Backend (Azure Functions)](#backend-azure-functions)
6. [Configuration Azure Static Web Apps](#configuration-azure-static-web-apps)
7. [Installation et Développement Local](#installation-et-développement-local)
8. [Déploiement](#déploiement)
9. [Maintenance](#maintenance)

## Introduction

Le site web Oval Saône est une application web moderne pour un club de rugby, développée avec **Eleventy** (11ty) et Azure Static Web Apps. Il combine un générateur de site statique moderne (Eleventy) avec un backend serverless basé sur Azure Functions en C#.

### Objectif du Site

Le site a pour objectif de :
- Présenter le club de rugby et ses activités
- Fournir des informations sur les équipes et catégories
- Permettre l'inscription en ligne des nouveaux membres
- Présenter les partenaires et sponsors
- Offrir une boutique en ligne pour les produits du club
- Faciliter la communication via un formulaire de contact

### Fonctionnalités Principales

- **Pages générées avec Eleventy** : Utilisation de templates Liquid et Nunjucks pour la génération des pages
- **Système de templating moderne** : Layouts partagés et composants réutilisables
- **Bundling CSS automatique** : Concaténation automatique des feuilles de style
- **Pages interactives** : Boutique, Inscription, Contact avec JavaScript côté client
- **Fonctions API serverless** : Traitement des formulaires et envoi d'emails avec Azure Functions
- **Chargement dynamique** : Contenu géré via fichiers JSON et front matter
- **Design responsive** : Adaptation à tous les appareils

## Architecture Technique

Le site utilise une architecture moderne combinant un frontend statique et un backend serverless.

### Vue d'ensemble

```
┌─────────────────────┐     ┌───────────────────┐
│   Azure Static      │     │  Azure Functions  │
│   Web App Frontend  │────▶│  Backend (C#)     │
│   (Eleventy Build)  │     │                   │
└─────────────────────┘     └───────────────────┘
          │                          │
          │                          │
          ▼                          ▼
┌─────────────────────┐     ┌───────────────────┐
│   CDN               │     │  Service Email    │
│   (Intégré à SWA)   │     │                   │
└─────────────────────┘     └───────────────────┘
```

### Composants Clés

1. **Frontend Eleventy** : 
   - Générateur de site statique avec Eleventy (11ty)
   - Templates Liquid (.liquid) et Nunjucks (.njk)
   - Bundling CSS automatique avec concaténation
   - Données JSON intégrées via front matter et fichiers _data
   - Build automatique vers le dossier _site

2. **Backend Serverless** :
   - Azure Functions v4 (.NET 8)
   - API REST pour traitement des formulaires
   - Envoi d'emails avec MailKit

3. **Sécurité** :
   - CORS configuré pour l'API
   - Validation des données côté client et serveur
   - Conformité RGPD avec bannière de cookies

## Structure du Projet

La structure du projet est organisée de manière logique pour séparer les différentes parties de l'application.

### Arborescence Principale

```
kme-rugby-aswapp/
├── src/                              # Code source Eleventy
│   ├── *.liquid                      # Pages templates Liquid
│   ├── _includes/                    # Templates partagés (layouts)
│   │   └── layout.njk                # Layout principal Nunjucks
│   ├── _data/                        # Données JSON globales
│   │   ├── actualites.json
│   │   ├── sponsors.json
│   │   └── teams.json
│   ├── _site/                        # Site généré (output Eleventy)
│   ├── css-bundle.njk                # Bundle CSS automatique
│   ├── js-bundle.njk                 # Bundle JavaScript automatique
│   ├── css/                          # Styles CSS sources
│   ├── js/                           # Scripts JavaScript
│   ├── assets/                       # Images et ressources statiques
│   ├── api/                          # Azure Functions (Backend)
│   ├── staticwebapp.config.json      # Configuration Azure SWA
│   └── eleventy.config.js            # Configuration Eleventy
├── package.json                      # Dépendances Node.js et scripts
└── docs/                             # Documentation
```

### Détail des Répertoires

#### Frontend Eleventy

- **Templates Liquid (*.liquid)** : Pages principales du site avec front matter YAML
- **Layouts (_includes/)** : Templates Nunjucks partagés pour la structure commune
- **Données (_data/)** : Fichiers JSON contenant les données dynamiques accessibles globalement
- **CSS Bundle (css-bundle.njk)** : Fichier de concaténation automatique des styles CSS
- **Styles CSS (css/)** : Feuilles de style organisées par composants et pages
- **Scripts JavaScript (js/)** : Scripts pour l'interactivité côté client
- **Assets** : Images, logos et autres ressources statiques
- **Site généré (_site/)** : Dossier de sortie d'Eleventy contenant le site compilé

#### Backend (API)

- **Functions** : Points d'entrée API
- **Models** : Modèles de données avec validation
- **Services** : Services (email, etc.)

## Frontend Eleventy

Le site utilise **Eleventy (11ty)** comme générateur de site statique moderne. Cette approche offre de nombreux avantages par rapport à du HTML statique traditionnel.

### Avantages d'Eleventy

- **Templates réutilisables** : Évite la duplication de code avec des layouts partagés
- **Données centralisées** : Gestion des données via JSON et front matter
- **Bundling automatique** : Concaténation des CSS et JS
- **Performance optimale** : Génération de pages statiques ultra-rapides
- **Développement moderne** : Hot reload et outils de développement intégrés

### Structure des Templates

#### Pages Liquid (.liquid)
Les pages principales utilisent le format Liquid avec front matter YAML :

```liquid
---
layout: layout.njk
title: Page Title
custom_data: "valeur"
---

<section class="content">
    <h1>{{ title }}</h1>
    <p>{{ custom_data }}</p>
</section>
```

#### Layout Principal (layout.njk)
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
    <!-- Navigation commune -->
    <nav class="navbar">...</nav>
    
    <!-- Contenu de la page -->
    {{ content | safe }}
    
    <!-- Footer commun -->
    <footer>...</footer>
</body>
</html>
```

### Système de Bundling

#### CSS Bundle (css-bundle.njk)
Concaténation automatique de tous les styles :

```njk
---
permalink: /css-bundle.css
---
{% include "./css/styles.css" %}
{% include "./css/components/button.css" %}
{% include "./css/components/nav.css" %}
{% include "./css/pages/index.css" %}
<!-- Autres fichiers CSS -->
```

#### JavaScript Bundle (js-bundle.njk)
Concaténation des scripts JavaScript :

```njk
---
permalink: /bundle.js
---
{% include "./js/main.js" %}
{% include "./js/data-loader.js" %}
{% include "./js/contact.js" %}
<!-- Autres fichiers JS -->
```

### Données Globales

Les fichiers dans `_data/` sont automatiquement disponibles dans tous les templates :

```json
// _data/sponsors.json
{
  "sponsors": [
    {
      "name": "Sponsor 1",
      "logo": "assets/sponsors/logo1.png",
      "url": "https://sponsor1.com"
    }
  ]
}
```

Utilisation dans les templates :
```liquid
{% for sponsor in sponsors.sponsors %}
    <img src="{{ sponsor.logo }}" alt="{{ sponsor.name }}">
{% endfor %}
```

### Configuration Eleventy

Le fichier `eleventy.config.js` configure le comportement d'Eleventy :

```javascript
export default function(eleventyConfig) {
    // Copie des assets statiques
    eleventyConfig.addPassthroughCopy("./assets");
    
    // Autres configurations
    return {
        dir: {
            input: "src",
            output: "_site"
        }
    };
};
```

### Pages du Site

1. **index.liquid** : Page d'accueil avec données du front matter
2. **equipes.liquid** : Présentation des différentes catégories
3. **ecole.liquid** : Histoire du club, bureau et entraîneurs
4. **partenariat.liquid** : Sponsors et informations de partenariat
5. **boutique.liquid** : Produits et équipements du club
6. **inscription.liquid** : Formulaire d'inscription
7. **contact.liquid** : Formulaire de contact avec carte

### Données JSON

- **actualites.json** : Actualités affichées sur la page d'accueil
- **equipes.json** : Données des équipes par catégorie
- **ecole.json** : Informations sur l'école de rugby
- **partenariat.json** : Données des partenaires
- **boutique.json** : Produits de la boutique
- **inscription.json** : Tarifs et documents d'inscription

## Backend (Azure Functions)

Le backend est construit avec Azure Functions v4 en C#, utilisant .NET 8.

### Points d'Entrée API

1. **ContactFunction.cs** : Traitement du formulaire de contact
   - Endpoint: `/api/Contact`
   - Méthode: POST
   - Validation des données avec Data Annotations
   - Envoi d'email via EmailService

2. **InscriptionFunction.cs** : Traitement du formulaire d'inscription
   - Endpoint: `/api/Inscription`
   - Méthode: POST
   - Validation complète des données
   - Envoi d'email de confirmation

### Modèles de Données

Les modèles sont définis dans **FormModels.cs** avec validation via Data Annotations :

1. **ContactFormModel** : 
   - Nom, Prénom, Email, Téléphone, Sujet, Message
   - Validation des champs obligatoires et formats

2. **InscriptionFormModel** : 
   - Informations de l'enfant (nom, prénom, date de naissance)
   - Informations du responsable
   - Catégorie et tarifs

### Service Email

**EmailService.cs** gère l'envoi d'emails avec MailKit :
- Configuration SMTP via variables d'environnement
- Templates d'emails pour contact et inscription
- Gestion des pièces jointes pour les inscriptions

## Configuration Azure Static Web Apps

La configuration d'Azure Static Web Apps est définie dans les fichiers suivants :

### staticwebapp.config.json

```json
{
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/api/*", "/*.{css,js,json,png,jpg,svg}"]
  },
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  },
  "globalHeaders": {
    "cache-control": "no-cache"
  }
}
```

Cette configuration définit :
- Les routes API accessibles de manière anonyme
- Le fallback vers index.html pour le routage SPA
- La gestion des erreurs 404
- Les en-têtes globaux pour le cache

### swa-cli.config.json

```json
{
  "$schema": "https://aka.ms/azure/static-web-apps-cli/schema",
  "configurations": {
    "kme-rugby-aswapp": {
      "appLocation": ".",
      "outputLocation": "."
    }
  }
}
```

Cette configuration est utilisée par le CLI SWA pour le développement local.

## Installation et Développement Local

### Prérequis

- **Node.js 18+** (pour Eleventy et SWA CLI)
- **.NET 8 SDK** (pour Azure Functions)
- **Azure Functions Core Tools v4**
- **Azure Static Web Apps CLI**
- **Eleventy (11ty)** (inclus dans les dépendances)

### Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/votre-utilisateur/kme-rugby-aswapp.git
   cd kme-rugby-aswapp
   ```

2. **Installer les dépendances Node.js** :
   ```bash
   # Installer les dépendances du projet (Eleventy et SWA CLI)
   npm install
   
   # Installer globalement les outils Azure (optionnel)
   npm install -g azure-functions-core-tools@4
   npm install -g @azure/static-web-apps-cli
   ```

3. **Installer les dépendances .NET** :
   ```bash
   # Installer les dépendances du projet API
   cd src/api
   dotnet restore
   cd ../..
   ```

4. **Configurer les variables d'environnement** :
   - Créer/modifier le fichier `src/api/local.settings.json` :
   ```json
   {
     "IsEncrypted": false,
     "Values": {
       "AzureWebJobsStorage": "UseDevelopmentStorage=true",
       "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
       "SMTP_HOST": "votre-serveur-smtp.com",
       "SMTP_PORT": "587",
       "SMTP_USERNAME": "votre-email@exemple.com",
       "SMTP_PASSWORD": "votre-mot-de-passe",
       "EMAIL_FROM": "no-reply@votre-domaine.com",
       "EMAIL_TO": "contact@votre-domaine.com"
     }
   }
   ```

### Développement Local

#### Option 1 : Développement avec Eleventy + SWA CLI (Recommandé)

1. **Construire le site avec Eleventy** :
   ```bash
   # Générer le site statique dans src/_site
   npx @11ty/eleventy --config=src/eleventy.config.js --input=src --output=src/_site
   ```

2. **Compiler les fonctions Azure** :
   ```bash
   cd src/api
   dotnet build
   cd ../..
   ```

3. **Lancer le site avec SWA CLI** :
   ```bash
   # Utilise la configuration dans swa-cli.config.json
   npm run dev
   
   # Ou manuellement :
   npx swa start src --api-location src/api --host 127.0.0.1 --port 4280
   ```

#### Option 2 : Utiliser les tâches VS Code

Le projet inclut des tâches VS Code préconfigurées :

- **Build Functions** : Compile le projet Azure Functions
- **Start SWA CLI** : Démarre le site complet en mode développement
- **Stop SWA CLI** : Arrête le serveur de développement

Pour utiliser ces tâches :
1. Ouvrir VS Code dans le répertoire du projet
2. Appuyer sur `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)
3. Taper "Tasks: Run Task" et sélectionner la tâche souhaitée

#### Développement en mode Watch

Pour le développement avec rechargement automatique :

```bash
# Terminal 1 : Watch Eleventy (reconstruction automatique)
npx @11ty/eleventy --config=src/eleventy.config.js --input=src --output=src/_site --watch

# Terminal 2 : SWA CLI en mode développement
npx swa start src --api-location src/api
```

### Accès Local

Une fois le développement démarré :
- **Frontend** : http://localhost:4280
- **API Backend** : http://localhost:4280/api
- **Site Eleventy compilé** : Disponible dans `src/_site/`

### Structure de Développement

```
Navigateur ──→ SWA CLI (localhost:4280) ──→ Site Eleventy (src/_site/)
                      │
                      └──→ Azure Functions (src/api/)
   
   Ou utiliser les tâches VS Code fournies :
   - `Build Functions` : Compile le projet API
   - `Start SWA CLI` : Démarre le site en mode développement

3. **Accéder au site** :
   - Frontend : http://localhost:4280
   - Backend API : http://localhost:4280/api

## Déploiement

### Déploiement sur Azure Static Web Apps

1. **Prérequis** :
   - Un compte Azure avec un abonnement actif
   - GitHub ou Azure DevOps pour l'intégration CI/CD

2. **Créer une ressource Azure Static Web Apps** :
   - Dans le portail Azure, chercher "Static Web Apps"
   - Cliquer sur "Créer"
   - Configurer avec les paramètres suivants :
     - Source du code : GitHub/Azure DevOps
     - Organisation et dépôt
     - Branche : main
     - App location : /
     - Api location : api
     - Output location : .

3. **Configurer les variables d'environnement** :
   - Dans le portail Azure, aller dans la ressource SWA
   - Naviguer vers "Configuration"
   - Ajouter les mêmes variables que dans `local.settings.json`

4. **Déploiement automatique** :
   - Les modifications poussées sur la branche main sont automatiquement déployées
   - Le workflow GitHub Actions est automatiquement configuré

### Configuration GitHub Actions

Un workflow GitHub Actions est automatiquement créé pour déployer le site :

```yaml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy
    steps:
      - uses: actions/checkout@v2
      - name: Build And Deploy
        id: builddeploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          app_location: "/"
          api_location: "api"
          output_location: "."
          
  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

## Maintenance

### Mise à jour du Contenu

1. **Actualités et contenu dynamique** :
   - Modifier les fichiers JSON dans le dossier `data/`
   - Ajouter les images correspondantes dans `assets/`

2. **Pages et design** :
   - Modifier les fichiers HTML/CSS/JS correspondants
   - Tester localement avant de déployer

### Déboggage

1. **Logs des Azure Functions** :
   - Consulter les logs dans le portail Azure
   - Section "Functions" > Choisir la fonction > "Monitor"

2. **Problèmes de déploiement** :
   - Vérifier les logs GitHub Actions
   - Consulter le statut du déploiement dans le portail Azure

### Backups

1. **Code source** :
   - Sauvegardé dans le dépôt Git
   - Faire des releases pour les versions majeures

2. **Contenu dynamique** :
   - Sauvegarder régulièrement les fichiers JSON
   - Considérer une migration vers une base de données pour les sites à fort trafic

## Conclusion

Cette documentation couvre les aspects essentiels du site web Oval Saône. Pour toute question ou assistance supplémentaire, veuillez contacter l'équipe de développement.

---

*Documentation créée le 14 juin 2025*
