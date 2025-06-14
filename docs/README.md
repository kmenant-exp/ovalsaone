# Documentation du Site Web Oval Saône

## Sommaire
1. [Introduction](#introduction)
2. [Architecture Technique](#architecture-technique)
3. [Structure du Projet](#structure-du-projet)
4. [Frontend](#frontend)
5. [Backend (Azure Functions)](#backend-azure-functions)
6. [Configuration Azure Static Web Apps](#configuration-azure-static-web-apps)
7. [Installation et Développement Local](#installation-et-développement-local)
8. [Déploiement](#déploiement)
9. [Maintenance](#maintenance)

## Introduction

Le site web Oval Saône est une application web moderne pour un club de rugby, développée avec Azure Static Web Apps. Il combine un frontend statique (HTML, CSS, JavaScript) avec un backend serverless basé sur Azure Functions en C#.

### Objectif du Site

Le site a pour objectif de :
- Présenter le club de rugby et ses activités
- Fournir des informations sur les équipes et catégories
- Permettre l'inscription en ligne des nouveaux membres
- Présenter les partenaires et sponsors
- Offrir une boutique en ligne pour les produits du club
- Faciliter la communication via un formulaire de contact

### Fonctionnalités Principales

- **Pages informatives** : Accueil, Équipes, École de rugby, Partenariat
- **Pages interactives** : Boutique, Inscription, Contact
- **Fonctions API serverless** : Traitement des formulaires et envoi d'emails
- **Chargement dynamique** : Contenu géré via fichiers JSON
- **Design responsive** : Adaptation à tous les appareils

## Architecture Technique

Le site utilise une architecture moderne combinant un frontend statique et un backend serverless.

### Vue d'ensemble

```
┌─────────────────────┐     ┌───────────────────┐
│   Azure Static      │     │  Azure Functions  │
│   Web App Frontend  │────▶│  Backend (C#)     │
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

1. **Frontend Statique** : 
   - HTML5, CSS3, JavaScript ES6+
   - Hébergé sur Azure Static Web Apps
   - Utilise des fichiers de données JSON pour le contenu dynamique

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
├── index.html, equipes.html, etc...  # Pages HTML principales
├── staticwebapp.config.json          # Configuration Azure SWA
├── css/                              # Styles CSS
├── js/                               # Scripts JavaScript
├── data/                             # Données JSON
├── assets/                           # Images et ressources statiques
└── api/                              # Azure Functions (Backend)
```

### Détail des Répertoires

#### Frontend

- **Pages HTML** : Pages principales du site
- **CSS** : Styles pour le design responsive
- **JavaScript** : Scripts pour l'interactivité et le chargement des données
- **Data** : Fichiers JSON contenant les données dynamiques
- **Assets** : Images, logos et autres ressources statiques

#### Backend (API)

- **Functions** : Points d'entrée API
- **Models** : Modèles de données avec validation
- **Services** : Services (email, etc.)

## Frontend

Le frontend est construit avec des technologies web standard, organisées de manière modulaire.

### Pages HTML

1. **index.html** : Page d'accueil avec actualités et présentation
2. **equipes.html** : Présentation des différentes catégories
3. **ecole.html** : Histoire du club, bureau et entraîneurs
4. **partenariat.html** : Sponsors et informations de partenariat
5. **boutique.html** : Produits et équipements du club
6. **inscription.html** : Formulaire d'inscription
7. **contact.html** : Formulaire de contact avec carte

### CSS

- **styles.css** : Styles principaux (responsive, mobile-first)
- **cookie-banner.css** : Styles pour le bandeau RGPD
- **sponsors.css** : Styles pour l'affichage des sponsors

### JavaScript

- **main.js** : Fonctionnalités communes (navigation, menu mobile)
- **data-loader.js** : Module pour charger les données JSON
- **[page].js** : Scripts spécifiques par page (ex: inscription.js, contact.js)

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

- Node.js 18+
- .NET 8 SDK
- Azure Functions Core Tools
- Azure Static Web Apps CLI

### Installation

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/votre-utilisateur/kme-rugby-aswapp.git
   cd kme-rugby-aswapp
   ```

2. **Installer les dépendances** :
   ```bash
   # Installer SWA CLI
   npm install -g @azure/static-web-apps-cli
   
   # Installer Azure Functions Core Tools (si nécessaire)
   npm install -g azure-functions-core-tools@4
   
   # Installer les dépendances du projet API
   cd api
   dotnet restore
   ```

3. **Configurer les variables d'environnement** :
   - Créer/modifier le fichier `api/local.settings.json` :
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

### Exécution Locale

1. **Compiler les fonctions Azure** :
   ```bash
   cd api
   dotnet build
   ```

2. **Lancer le site avec SWA CLI** :
   ```bash
   npx swa start . --api-location api
   ```
   
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
