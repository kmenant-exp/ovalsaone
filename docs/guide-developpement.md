# Guide de Développement du Site Web Oval Saône

## Sommaire
1. [Introduction](#introduction)
2. [Configuration de l'Environnement](#configuration-de-lenvironnement)
3. [Structure du Code](#structure-du-code)
4. [Frontend Eleventy](#frontend-eleventy)
5. [Backend (Azure Functions)](#backend-azure-functions)
6. [Développement Local](#développement-local)
7. [Déploiement](#déploiement)
8. [Bonnes Pratiques](#bonnes-pratiques)
9. [Résolution des Problèmes](#résolution-des-problèmes)

## Introduction

Ce guide est destiné aux développeurs qui maintiennent ou étendent le site web Oval Saône. Il couvre les aspects techniques du développement avec Eleventy, du déploiement et de la maintenance.

## Configuration de l'Environnement

### Prérequis

- **Node.js** : Version 18.0.0 ou supérieure (pour Eleventy et SWA CLI)
- **.NET SDK** : Version 8.0 ou supérieure (pour Azure Functions)
- **Azure Functions Core Tools** : Version 4.x
- **Azure Static Web Apps CLI** : Dernière version
- **Eleventy** : Version 3.x (inclus dans package.json)
- **Visual Studio Code** (recommandé)
- **Git**

### Extensions VS Code Recommandées

- **Azure Functions** : Développement Azure Functions
- **Azure Static Web Apps** : Intégration SWA
- **C#** : Support du langage C#
- **Liquid** : Syntaxe highlighting pour templates Liquid
- **Nunjucks** : Support des templates Nunjucks
- **ESLint** : Linting JavaScript
- **Live Server** : Serveur de développement

### Installation des Outils

```bash
# Node.js (via nvm pour macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install 18
nvm use 18

# .NET SDK
brew install dotnet-sdk

# Cloner le projet et installer les dépendances
git clone https://github.com/votre-repo/kme-rugby-aswapp.git
cd kme-rugby-aswapp
npm install

# Les outils Azure peuvent être installés globalement (optionnel)
npm install -g azure-functions-core-tools@4
npm install -g @azure/static-web-apps-cli

# Les dépendances .NET
cd src/api
dotnet restore
```

## Structure du Code

### Architecture Globale

```
kme-rugby-aswapp/
├── src/                       # Code source Eleventy
│   ├── *.liquid               # Pages templates Liquid
│   ├── _includes/             # Templates partagés
│   │   └── layout.njk         # Layout principal Nunjucks
│   ├── _data/                 # Données JSON globales
│   │   ├── actualites.json
│   │   ├── sponsors.json
│   │   └── teams.json
│   ├── _site/                 # Site généré (output Eleventy)
│   ├── css-bundle.njk         # Bundle CSS automatique
│   ├── js-bundle.njk          # Bundle JavaScript automatique
│   ├── css/                   # Styles CSS sources
│   │   ├── styles.css
│   │   ├── components/        # Styles par composant
│   │   └── pages/             # Styles par page
│   ├── js/                    # Scripts JavaScript
│   ├── assets/                # Ressources statiques
│   ├── api/                   # Azure Functions (Backend)
│   │   ├── Functions/         # Définitions des fonctions
│   │   ├── Models/            # Modèles de données
│   │   └── Services/          # Services (email, etc.)
│   ├── staticwebapp.config.json # Configuration Azure SWA
│   └── eleventy.config.js     # Configuration Eleventy
├── package.json               # Dépendances Node.js et scripts
├── swa-cli.config.json        # Configuration SWA CLI
├── docs/                      # Documentation
└── .vscode/                   # Configuration VS Code
```

### Conventions de Nommage

- **Templates Liquid** : Noms en minuscules, séparés par des tirets (exemple: `page-exemple.liquid`)
- **Fichiers de données** : Noms en minuscules, format JSON (exemple: `actualites.json`)
- **Classes CSS** : Noms en minuscules, séparés par des tirets (exemple: `.component-name`)
- **JavaScript** : camelCase pour les variables et fonctions, PascalCase pour les classes
- **C#** : PascalCase pour les classes, méthodes et propriétés publiques, camelCase pour les variables locales
- **Assets** : Noms descriptifs en minuscules avec tirets (exemple: `hero-image.jpg`)

## Frontend Eleventy

Le frontend utilise Eleventy (11ty) comme générateur de site statique moderne, offrant de nombreux avantages pour le développement et la maintenance.

### Workflow de Développement Eleventy

```
Édition Templates ──▶ Build Eleventy ──▶ Site Statique ──▶ SWA CLI ──▶ Navigateur
   (.liquid)            (npm script)        (_site/)       (dev server)
```

### Templates Liquid

Les pages principales utilisent le format Liquid avec front matter YAML :

```liquid
---
layout: layout.njk
title: "Titre de la page"
hero_title: "Titre personnalisé"
meta_description: "Description SEO"
custom_data: "Données spécifiques"
---

<!-- Contenu de la page avec variables -->
<section class="hero">
    <h1>{{ hero_title }}</h1>
    <p>{{ meta_description }}</p>
</section>

<!-- Utilisation des données globales -->
{% for actualite in actualites.actualites %}
    <article class="news-card">
        <h3>{{ actualite.title }}</h3>
        <p>{{ actualite.excerpt }}</p>
        <time datetime="{{ actualite.date }}">{{ actualite.date | date: "%d/%m/%Y" }}</time>
    </article>
{% endfor %}

<!-- Logique conditionnelle -->
{% if custom_data %}
    <div class="custom-section">
        {{ custom_data }}
    </div>
{% endif %}
```

### Layout Principal (layout.njk)

Le layout Nunjucks définit la structure HTML commune :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    
    <!-- SEO Meta Tags -->
    {% if meta_description %}
    <meta name="description" content="{{ meta_description }}">
    {% endif %}
    
    <!-- Styles bundlés -->
    <link rel="stylesheet" href="/css-bundle.css">
    
    <!-- External Resources -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
</head>
<body>
    <!-- Bandeau cookies RGPD -->
    <div id="cookie-banner" class="cookie-banner hidden">
        <div class="cookie-content">
            <p>Ce site utilise des cookies pour améliorer votre expérience...</p>
            <div class="cookie-buttons">
                <button id="accept-cookies" class="btn btn-primary">Accepter</button>
                <button id="decline-cookies" class="btn btn-secondary">Refuser</button>
            </div>
        </div>
    </div>
    
    <!-- Navigation commune -->
    <nav class="navbar" id="navbar">
        <div class="nav-container">
            <!-- Navigation menu généré automatiquement -->
        </div>
    </nav>
    
    <!-- Contenu de la page injecté ici -->
    {{ content | safe }}
    
    <!-- Footer commun -->
    <footer class="footer">
        <!-- Footer content -->
    </footer>
    
    <!-- Scripts bundlés -->
    <script src="/bundle.js"></script>
</body>
</html>
```

### Système de Bundling CSS

Le fichier `css-bundle.njk` concatène automatiquement tous les styles :

```njk
---
permalink: /css-bundle.css
---
{% include "./css/styles.css" %}
{% include "./css/components/button.css" %}
{% include "./css/components/footer.css" %}
{% include "./css/components/nav.css" %}
{% include "./css/components/page-hero.css" %}
{% include "./css/components/cookie-banner.css" %}
{% include "./css/pages/index.css" %}
{% include "./css/pages/equipes.css" %}
{% include "./css/pages/ecole.css" %}
{% include "./css/pages/partenariat.css" %}
{% include "./css/pages/boutique.css" %}
{% include "./css/pages/inscription.css" %}
{% include "./css/pages/contact.css" %}
```

### Organisation des Styles CSS

```
css/
├── styles.css                 # Styles de base et variables CSS
├── components/                # Styles par composant
│   ├── button.css            # Boutons
│   ├── footer.css            # Pied de page
│   ├── nav.css               # Navigation
│   ├── page-hero.css         # Section hero
│   └── cookie-banner.css     # Bandeau RGPD
└── pages/                    # Styles spécifiques par page
    ├── index.css             # Page d'accueil
    ├── equipes.css           # Page équipes
    ├── ecole.css             # Page école
    ├── partenariat.css       # Page partenariat
    ├── boutique.css          # Page boutique
    ├── inscription.css       # Page inscription
    └── contact.css           # Page contact
```

### Gestion des Données

#### Données Globales (_data/)

Les fichiers JSON dans `_data/` sont automatiquement disponibles dans tous les templates :

```json
// _data/actualites.json
{
  "actualites": [
    {
      "id": 1,
      "title": "Reprise des entraînements",
      "excerpt": "Les entraînements reprennent le 5 septembre...",
      "date": "2025-08-20",
      "image": "assets/actualites/reprise.jpg"
    }
  ]
}

// _data/teams.json
{
  "teams": [
    {
      "category": "U6-U8",
      "name": "École de Rugby",
      "description": "Éveil rugby pour les plus petits",
      "training_days": ["Mercredi", "Samedi"],
      "coach": "Coach Name"
    }
  ]
}

// _data/sponsors.json
{
  "sponsors": [
    {
      "name": "Sponsor Principal",
      "logo": "assets/sponsors/logo-principal.png",
      "url": "https://sponsor.com",
      "category": "partenaire-principal"
    }
  ]
}
```

#### Utilisation des Données dans les Templates

```liquid
<!-- Affichage des actualités -->
<section class="news-section">
    <h2>Actualités</h2>
    <div class="news-grid">
    {% for actualite in actualites.actualites limit: 3 %}
        <article class="news-card">
            <img src="{{ actualite.image }}" alt="{{ actualite.title }}">
            <h3>{{ actualite.title }}</h3>
            <p>{{ actualite.excerpt }}</p>
            <time datetime="{{ actualite.date }}">
                {{ actualite.date | date: "%d/%m/%Y" }}
            </time>
        </article>
    {% endfor %}
    </div>
</section>

<!-- Affichage des équipes -->
<section class="teams-section">
    <h2>Nos Équipes</h2>
    <div class="teams-grid">
    {% for team in teams.teams %}
        <div class="team-card">
            <h3>{{ team.category }}</h3>
            <h4>{{ team.name }}</h4>
            <p>{{ team.description }}</p>
            <div class="training-info">
                <strong>Entraînements :</strong>
                {% for day in team.training_days %}
                    {{ day }}{% unless forloop.last %}, {% endunless %}
                {% endfor %}
            </div>
            <div class="coach-info">
                <strong>Entraîneur :</strong> {{ team.coach }}
            </div>
        </div>
    {% endfor %}
    </div>
</section>
```

Approche mobile-first avec des media queries pour les écrans plus larges :

```css
/* Base (mobile first) */
.container {
    padding: 1rem;
}

/* Tablettes et écrans plus larges */
@media (min-width: 768px) {
    .container {
        padding: 2rem;
    }
}

/* Desktop */
@media (min-width: 1024px) {
    .container {
        max-width: 1200px;
        margin: 0 auto;
    }
}
```

### JavaScript

Le code JavaScript est organisé en modules ES6 :

```javascript
// data-loader.js - Module pour charger les données JSON
export async function loadData(jsonFile) {
    try {
        const response = await fetch(`data/${jsonFile}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Erreur de chargement ${jsonFile}:`, error);
        return null;
    }
}

// Utilisation dans une page
import { loadData } from './data-loader.js';

document.addEventListener('DOMContentLoaded', async () => {
    const data = await loadData('exemple.json');
    // Utiliser les données...
});
```

## Backend (Azure Functions)

### Structure des Azure Functions

Les Azure Functions sont organisées selon le modèle d'architecture C# isolé :

```csharp
// ContactFunction.cs
using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using RugbyClubApi.Models;
using RugbyClubApi.Services;

namespace RugbyClubApi.Functions;

public class ContactFunction
{
    private readonly ILogger _logger;
    private readonly IEmailService _emailService;

    public ContactFunction(ILoggerFactory loggerFactory)
    {
        _logger = loggerFactory.CreateLogger<ContactFunction>();
        _emailService = new EmailService();
    }

    [Function("Contact")]
    public async Task<HttpResponseData> RunAsync(
        [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options")] HttpRequestData req)
    {
        // Implémentation...
    }
}
```

### Modèles de Données

Les modèles utilisent les Data Annotations pour la validation :

```csharp
// FormModels.cs
using System.ComponentModel.DataAnnotations;

namespace RugbyClubApi.Models;

public class ContactFormModel
{
    [Required(ErrorMessage = "Le nom est obligatoire")]
    [StringLength(50, MinimumLength = 2, ErrorMessage = "Le nom doit contenir entre 2 et 50 caractères")]
    public string Nom { get; set; } = string.Empty;
    
    // Autres propriétés...
}
```

### Services

Les services suivent le modèle d'injection de dépendances :

```csharp
// EmailService.cs
namespace RugbyClubApi.Services;

public interface IEmailService
{
    Task SendContactEmailAsync(string nom, string prenom, string email, string? telephone, string sujet, string message);
    Task SendInscriptionEmailAsync(/* paramètres... */);
}

public class EmailService : IEmailService
{
    // Implémentation...
}
```

## Développement Local

### Configuration Locale

1. **Cloner le dépôt** :
   ```bash
   git clone https://github.com/votre-utilisateur/kme-rugby-aswapp.git
   cd kme-rugby-aswapp
   ```

2. **Installer les dépendances** :
   ```bash
   # Dépendances Node.js (Eleventy, SWA CLI)
   npm install
   
   # Dépendances .NET pour l'API
   cd src/api
   dotnet restore
   cd ../..
   ```

3. **Configurer les variables d'environnement** :
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

### Workflows de Développement

#### Option 1 : Développement Standard (Recommandé)

1. **Build Eleventy** :
   ```bash
   # Générer le site statique
   npx @11ty/eleventy --config=src/eleventy.config.js --input=src --output=src/_site
   ```

2. **Compiler les Azure Functions** :
   ```bash
   cd src/api
   dotnet build
   cd ../..
   ```

3. **Lancer SWA CLI** :
   ```bash
   # Utilise la configuration dans swa-cli.config.json
   npm run dev
   
   # Ou manuellement :
   npx swa start src --api-location src/api --host 127.0.0.1 --port 4280
   ```

#### Option 2 : Développement avec Watch Mode

Pour un développement avec rechargement automatique :

```bash
# Terminal 1 : Watch Eleventy (reconstruction automatique)
npx @11ty/eleventy --config=src/eleventy.config.js --input=src --output=src/_site --watch

# Terminal 2 : Watch .NET (compilation automatique)
cd src/api
dotnet watch build

# Terminal 3 : SWA CLI pour servir l'application
npx swa start src --api-location src/api
```

#### Option 3 : Utiliser les Tâches VS Code

Le projet inclut des tâches VS Code préconfigurées :

- **Build Functions** : Compile le projet Azure Functions
- **Start SWA CLI** : Démarre le site complet en mode développement
- **Stop SWA CLI** : Arrête le serveur de développement

Raccourcis VS Code :
1. `Ctrl+Shift+P` (ou `Cmd+Shift+P` sur Mac)
2. "Tasks: Run Task"
3. Sélectionner la tâche

### Workflow Typique de Développement

```
1. Éditer templates (.liquid) ou données (_data/*.json)
   ↓
2. Build Eleventy (manuel ou automatique avec --watch)
   ↓
3. Tester dans le navigateur (localhost:4280)
   ↓
4. Éditer API (.cs) si nécessaire
   ↓
5. Build .NET (manuel ou automatique avec dotnet watch)
   ↓
6. Tester les APIs (Postman/curl)
   ↓
7. Commit et push
```

### Tests Locaux

#### Tests Frontend

1. **Tester la génération Eleventy** :
   ```bash
   # Vérifier que le build fonctionne
   npx @11ty/eleventy --config=src/eleventy.config.js --input=src --output=src/_site
   
   # Vérifier le contenu généré
   ls -la src/_site/
   ```

2. **Tester les templates** :
   - Modifier un fichier .liquid
   - Vérifier la régénération dans _site/
   - Actualiser le navigateur

3. **Tester les données** :
   - Modifier un fichier JSON dans _data/
   - Vérifier l'impact sur les pages concernées

#### Tests API

1. **Tester les fonctions Azure** :
   ```bash
   # Exemple : Test du formulaire de contact
   curl -X POST http://localhost:4280/api/Contact \
     -H "Content-Type: application/json" \
     -d '{
       "nom": "Test",
       "email": "test@exemple.com",
       "message": "Message de test"
     }'
   
   # Exemple : Test du formulaire d'inscription
   curl -X POST http://localhost:4280/api/Inscription \
     -H "Content-Type: application/json" \
     -d '{
       "nomEnfant": "Prénom Nom",
       "dateNaissance": "2010-05-15",
       "nomParent": "Parent Test",
       "emailParent": "parent@exemple.com",
       "telephoneParent": "0123456789",
       "categorie": "U10-U12"
     }'
   ```

2. **Utiliser les DevTools** :
   - Onglet Network pour vérifier les requêtes API
   - Onglet Console pour les erreurs JavaScript
   - Onglet Application pour vérifier les données locales

### Débogage

#### Débogage Frontend

1. **Erreurs de build Eleventy** :
   ```bash
   # Mode verbose pour plus d'informations
   npx @11ty/eleventy --config=src/eleventy.config.js --input=src --output=src/_site --debug
   ```

2. **Erreurs de templates** :
   - Vérifier la syntaxe Liquid
   - Vérifier l'existence des variables
   - Utiliser des filtres debug : `{{ variable | json }}`

#### Débogage Backend

1. **Erreurs Azure Functions** :
   ```bash
   # Logs détaillés
   func start --verbose
   ```

2. **Débogage VS Code** :
   - Configurer les breakpoints dans VS Code
   - Utiliser F5 pour démarrer en mode debug
       "nom": "Test",
       "prenom": "User",
       "email": "test@example.com",
       "telephone": "0123456789",
       "sujet": "Test API",
       "message": "Ceci est un message de test."
     }'
   ```

2. **Tester le frontend** :
   - Accéder à http://localhost:4280
   - Tester les formulaires et la navigation
   - Vérifier la responsivité avec les outils de développement du navigateur

## Déploiement

### Déploiement sur Azure Static Web Apps

1. **Via GitHub Actions** (automatique) :
   - Pousser les modifications sur la branche main
   - Le workflow GitHub Actions déclenche le déploiement

2. **Via Azure CLI** (manuel) :
   ```bash
   # Installer l'extension SWA pour Azure CLI
   az extension add --name staticwebapps
   
   # Déployer
   az staticwebapp deploy \
     --source . \
     --api-location api \
     --app-location . \
     --token <token_de_déploiement>
   ```

### Configuration des Secrets

Pour ajouter ou modifier des secrets d'environnement :

1. **Dans le portail Azure** :
   - Accéder à la ressource Static Web App
   - Naviguer vers "Configuration" > "Application settings"
   - Ajouter ou modifier les variables

2. **Via Azure CLI** :
   ```bash
   az staticwebapp appsettings set \
     --name nom-de-votre-app \
     --setting-names SMTP_HOST=nouveau-serveur.com
   ```

## Bonnes Pratiques

### Sécurité

1. **Validation des données** :
   - Toujours valider les entrées côté client ET serveur
   - Utiliser les Data Annotations dans les modèles C#
   - Valider les formulaires en JavaScript avant soumission

2. **Protection CORS** :
   - Limiter les origines autorisées en production
   - Configurer correctement les en-têtes CORS

3. **Variables d'environnement** :
   - Ne jamais stocker de secrets dans le code
   - Utiliser les variables d'environnement d'Azure

### Performance

1. **Optimisation des images** :
   - Utiliser des formats optimisés (WebP, SVG)
   - Dimensionner correctement les images
   - Utiliser des attributs width/height pour éviter le CLS

2. **Chargement asynchrone** :
   - Charger les scripts avec `defer` ou `async`
   - Utiliser `fetch` avec async/await pour les données JSON

3. **Mise en cache** :
   - Configurer les en-têtes de cache pour les ressources statiques
   - Mettre en cache les données JSON côté client

### Maintenance

1. **Versionnement** :
   - Suivre les principes du versionnement sémantique
   - Faire des commits atomiques avec messages clairs

2. **Documentation** :
   - Documenter les fonctions et classes importantes
   - Mettre à jour la documentation lorsque le code change

3. **Tests** :
   - Écrire des tests unitaires pour les fonctions critiques
   - Tester manuellement sur différents appareils et navigateurs

## Résolution des Problèmes

### Problèmes Courants de Développement

1. **Les fonctions Azure ne démarrent pas** :
   - Vérifier que .NET 8 SDK est installé
   - Vérifier que local.settings.json est correctement configuré
   - Essayer de nettoyer et reconstruire : `dotnet clean && dotnet build`

2. **CORS dans SWA CLI** :
   - Vérifier que l'API est accessible sur localhost:4280/api
   - Vérifier les en-têtes CORS dans les réponses API

3. **Problèmes de déploiement** :
   - Vérifier les logs GitHub Actions
   - S'assurer que la structure du projet correspond à la configuration de déploiement

### Debugging

1. **Fonctions Azure** :
   - Utiliser les logs avec `_logger.LogInformation()` ou `_logger.LogError()`
   - Consulter les logs dans le terminal ou le portail Azure

2. **Frontend** :
   - Utiliser les outils de développement du navigateur
   - Ajouter des `console.log()` stratégiques

### Support

Pour les problèmes techniques non résolus, contacter :
- **Développement** : dev@ovalsaone.fr
- **Azure Static Web Apps** : Consulter la [documentation officielle](https://docs.microsoft.com/fr-fr/azure/static-web-apps/)

---

*Guide mis à jour le 14 juin 2025*
