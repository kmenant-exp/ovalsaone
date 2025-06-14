# Architecture Technique du Site Web Oval Saône

## Sommaire
1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Frontend](#architecture-frontend)
3. [Architecture Backend](#architecture-backend)
4. [Intégration Frontend-Backend](#intégration-frontend-backend)
5. [Sécurité](#sécurité)
6. [Performance](#performance)
7. [Évolutivité](#évolutivité)

## Vue d'Ensemble

Le site web Oval Saône est construit sur l'architecture Azure Static Web Apps, qui combine un frontend statique avec un backend serverless basé sur Azure Functions.

### Diagramme d'Architecture

```
┌───────────────────────────────────────────────────────────┐
│                Azure Static Web Apps                       │
│                                                           │
│  ┌───────────────────┐         ┌───────────────────┐      │
│  │                   │         │                   │      │
│  │  Frontend Statique│         │ Backend Serverless│      │
│  │  (HTML/CSS/JS)    │◄───────►│ (Azure Functions) │      │
│  │                   │   API   │                   │      │
│  └───────────────────┘         └───────────────────┘      │
│            │                            │                 │
└────────────┼────────────────────────────┼─────────────────┘
             │                            │
             ▼                            ▼
    ┌─────────────────┐         ┌──────────────────┐
    │      CDN        │         │   Email Service  │
    │ (Azure Front    │         │   (SMTP)         │
    │  Door)          │         │                  │
    └─────────────────┘         └──────────────────┘
```

### Composants Principaux

1. **Frontend Statique** :
   - HTML5, CSS3, JavaScript ES6+
   - Chargement de données depuis des fichiers JSON
   - Validation des formulaires côté client

2. **Backend Serverless** :
   - Azure Functions v4 (.NET 8)
   - API REST pour traitement des formulaires
   - Validation des données et envoi d'emails

3. **Azure Static Web Apps** :
   - Hébergement du frontend et du backend
   - Routage et redirection
   - CDN intégré
   - Déploiement continu via GitHub Actions

## Architecture Frontend

### Structure de Fichiers

```
src/
├── index.html, equipes.html, etc.  # Pages HTML
├── css/
│   ├── styles.css                  # Styles principaux
│   ├── cookie-banner.css           # Styles du bandeau RGPD
│   └── sponsors.css                # Styles des sponsors
├── js/
│   ├── main.js                     # Code JS principal
│   ├── data-loader.js              # Module de chargement JSON
│   └── [page].js                   # Scripts spécifiques
├── data/
│   ├── actualites.json             # Données JSON
│   └── ...
└── assets/
    ├── logo.png, favicon.svg       # Images
    └── ...
```

### Chargement de Données

Le site utilise un modèle de chargement asynchrone pour les données :

```javascript
// Module data-loader.js
export async function loadData(jsonFile) {
    const response = await fetch(`data/${jsonFile}`);
    return await response.json();
}

// Utilisation dans une page
import { loadData } from './data-loader.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await loadData('exemple.json');
        renderContent(data);
    } catch (error) {
        console.error('Erreur de chargement:', error);
        showErrorMessage();
    }
});
```

### Principes de Design

1. **Responsive Design** :
   - Approche mobile-first
   - Media queries pour différentes tailles d'écran
   - Flexbox et Grid pour les layouts

2. **Composants Réutilisables** :
   - Sections modulaires (header, footer, cartes)
   - Styles cohérents avec variables CSS
   - JavaScript organisé en modules

3. **Performance** :
   - Chargement asynchrone des scripts
   - Images optimisées
   - Minification en production

## Architecture Backend

### Structure de l'API

```
api/
├── Program.cs                 # Point d'entrée
├── host.json                  # Configuration Azure Functions
├── local.settings.json        # Variables d'environnement (local)
├── Functions/
│   ├── ContactFunction.cs     # Traitement formulaire contact
│   └── InscriptionFunction.cs # Traitement formulaire inscription
├── Models/
│   └── FormModels.cs          # Modèles de données avec validation
└── Services/
    └── EmailService.cs        # Service d'envoi d'emails
```

### Points d'Entrée API

1. **Contact** :
   - Endpoint: `/api/Contact`
   - Méthode: POST
   - Traite les soumissions du formulaire de contact
   - Envoie des emails via le service d'email

2. **Inscription** :
   - Endpoint: `/api/Inscription`
   - Méthode: POST
   - Traite les soumissions du formulaire d'inscription
   - Valide les données et envoie des confirmations

### Modèle d'Exécution

Les Azure Functions utilisent le modèle "Isolated Process" de .NET 8 :

```csharp
// Exemple simplifié
[Function("Contact")]
public async Task<HttpResponseData> RunAsync(
    [HttpTrigger(AuthorizationLevel.Anonymous, "post", "options")] HttpRequestData req)
{
    // 1. Validation des en-têtes CORS pour OPTIONS
    if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase)) {
        // Retourner réponse CORS
    }

    // 2. Désérialiser et valider les données
    var contactForm = JsonSerializer.Deserialize<ContactFormModel>(requestBody);
    if (!Validator.TryValidateObject(contactForm, validationContext, validationResults, true)) {
        // Retourner erreurs de validation
    }

    // 3. Traitement (envoi d'email)
    await _emailService.SendContactEmailAsync(...);

    // 4. Réponse de succès
    return response;
}
```

## Intégration Frontend-Backend

### Communication API

Le frontend communique avec le backend via des requêtes fetch :

```javascript
// Exemple d'envoi d'un formulaire
async function submitForm(formData) {
    try {
        const response = await fetch('/api/Contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error(result.message || 'Une erreur est survenue');
        }
        
        return result;
    } catch (error) {
        console.error('Erreur API:', error);
        throw error;
    }
}
```

### Gestion des Erreurs

1. **Côté Client** :
   - Validation avant envoi API
   - Gestion des erreurs réseau
   - Affichage des messages d'erreur

2. **Côté Serveur** :
   - Validation des données entrantes
   - Journalisation des erreurs
   - Réponses HTTP avec codes appropriés

## Sécurité

### Protection CORS

Les Azure Functions sont configurées pour gérer les requêtes CORS :

```csharp
// Gestion CORS pour OPTIONS
if (req.Method.Equals("OPTIONS", StringComparison.OrdinalIgnoreCase))
{
    var optionsResponse = req.CreateResponse(HttpStatusCode.OK);
    optionsResponse.Headers.Add("Access-Control-Allow-Origin", "*");
    optionsResponse.Headers.Add("Access-Control-Allow-Methods", "POST, OPTIONS");
    optionsResponse.Headers.Add("Access-Control-Allow-Headers", "Content-Type");
    return optionsResponse;
}
```

### Validation des Données

1. **Validation Côté Client** :
   - Vérification des champs obligatoires
   - Validation des formats (email, téléphone)
   - Prévention de l'envoi de formulaires invalides

2. **Validation Côté Serveur** :
   - Utilisation de Data Annotations
   - Vérification complète des modèles
   - Protection contre les attaques d'injection

### Sécurité Azure Static Web Apps

- **Authentification** : Possibilité d'ajouter des providers d'authentification
- **Autorisation** : Contrôle d'accès basé sur les rôles
- **HTTPS** : Certificats SSL/TLS gérés automatiquement

## Performance

### Optimisations Frontend

1. **Chargement des Ressources** :
   - Scripts avec attribut `defer`
   - Préchargement des ressources critiques
   - Lazy loading des images

2. **Rendu Optimisé** :
   - Éviter le FOUC (Flash of Unstyled Content)
   - Minimiser le CLS (Cumulative Layout Shift)
   - Animation optimisées pour le GPU

### Optimisations Backend

1. **Temps de Réponse** :
   - Temps de démarrage à froid minimisé
   - Opérations asynchrones
   - Validation efficace

2. **Mise en Cache** :
   - Configuration des en-têtes de cache
   - Cache des réponses API côté client
   - Cache des données JSON

## Évolutivité

### Extensions Possibles

1. **Base de Données** :
   - Migration vers Azure Cosmos DB pour le contenu dynamique
   - Tableau de bord d'administration pour la gestion du contenu

2. **Authentification** :
   - Ajout d'une zone membre
   - Authentification avec Azure AD B2C

3. **Paiement en Ligne** :
   - Intégration d'un système de paiement pour la boutique
   - Gestion des commandes et du stock

### Mise à l'Échelle

Azure Static Web Apps s'adapte automatiquement à la charge :

- **Frontend** : CDN global pour la distribution du contenu
- **Backend** : Mise à l'échelle automatique des fonctions Azure
- **Ressources** : Adaptation selon le trafic

---

*Documentation d'architecture mise à jour le 14 juin 2025*
