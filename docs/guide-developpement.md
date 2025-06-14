# Guide de Développement du Site Web Oval Saône

## Sommaire
1. [Introduction](#introduction)
2. [Configuration de l'Environnement](#configuration-de-lenvironnement)
3. [Structure du Code](#structure-du-code)
4. [Frontend](#frontend)
5. [Backend (Azure Functions)](#backend-azure-functions)
6. [Développement Local](#développement-local)
7. [Déploiement](#déploiement)
8. [Bonnes Pratiques](#bonnes-pratiques)
9. [Résolution des Problèmes](#résolution-des-problèmes)

## Introduction

Ce guide est destiné aux développeurs qui maintiennent ou étendent le site web Oval Saône. Il couvre les aspects techniques du développement, du déploiement et de la maintenance.

## Configuration de l'Environnement

### Prérequis

- **Node.js** : Version 18.0.0 ou supérieure
- **.NET SDK** : Version 8.0 ou supérieure
- **Azure Functions Core Tools** : Version 4.x
- **Azure Static Web Apps CLI** : Dernière version
- **Visual Studio Code** (recommandé)
- **Git**

### Extensions VS Code Recommandées

- Azure Functions
- Azure Static Web Apps
- C#
- ESLint
- Live Server

### Installation des Outils

```bash
# Node.js (via nvm pour macOS)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
nvm install 18
nvm use 18

# .NET SDK
brew install dotnet-sdk

# Azure Functions Core Tools
npm install -g azure-functions-core-tools@4

# Azure Static Web Apps CLI
npm install -g @azure/static-web-apps-cli
```

## Structure du Code

### Architecture Globale

```
kme-rugby-aswapp/
├── src/               # Code source frontend
│   ├── *.html         # Pages HTML
│   ├── css/           # Styles CSS
│   ├── js/            # Scripts JavaScript
│   ├── data/          # Données JSON
│   └── assets/        # Ressources statiques
├── api/               # Code source backend (Azure Functions)
│   ├── Functions/     # Définitions des fonctions
│   ├── Models/        # Modèles de données
│   └── Services/      # Services (email, etc.)
├── docs/              # Documentation
├── swa-cli.config.json # Configuration SWA CLI
└── .vscode/           # Configuration VS Code
```

### Conventions de Nommage

- **Fichiers HTML** : Noms en minuscules, séparés par des tirets (exemple: `page-exemple.html`)
- **Classes CSS** : Noms en minuscules, séparés par des tirets (exemple: `.component-name`)
- **JavaScript** : camelCase pour les variables et fonctions, PascalCase pour les classes
- **C#** : PascalCase pour les classes, méthodes et propriétés publiques, camelCase pour les variables locales

## Frontend

### HTML

Le site utilise HTML5 sémantique avec une structure commune pour toutes les pages :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <!-- Méta-données et liens CSS -->
</head>
<body>
    <!-- Bandeau cookies RGPD -->
    <div id="cookie-banner">...</div>
    
    <!-- Navigation -->
    <nav class="navbar">...</nav>
    
    <!-- Contenu principal -->
    <main>
        <!-- Sections spécifiques à la page -->
    </main>
    
    <!-- Pied de page -->
    <footer>...</footer>
    
    <!-- Scripts -->
    <script src="js/main.js" type="module"></script>
    <script src="js/page-specifique.js" type="module"></script>
</body>
</html>
```

### CSS

Les styles sont organisés de façon modulaire :

- **styles.css** : Styles de base et composants communs
- **cookie-banner.css** : Styles pour le bandeau RGPD
- **sponsors.css** : Styles pour l'affichage des sponsors

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

2. **Configurer les variables d'environnement** :
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

### Exécution du Projet

1. **Compiler les fonctions Azure** :
   ```bash
   cd api
   dotnet build
   ```

2. **Lancer le site avec SWA CLI** :
   ```bash
   # À la racine du projet
   npx swa start . --api-location api
   ```

3. **Utiliser les tâches VS Code** :
   - `Build Functions` : Compile le projet API
   - `Start SWA CLI` : Démarre le site en mode développement

### Tests Locaux

1. **Tester les fonctions API** :
   - Utiliser Postman ou curl pour tester les endpoints
   - Exemple avec curl :
   ```bash
   curl -X POST http://localhost:4280/api/Contact \
     -H "Content-Type: application/json" \
     -d '{
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
