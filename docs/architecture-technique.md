# Architecture Technique du Site Web Oval Saône

## Sommaire
1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture Frontend avec Eleventy](#architecture-frontend-avec-eleventy)
3. [Architecture Backend](#architecture-backend)
4. [Intégration Frontend-Backend](#intégration-frontend-backend)
5. [Sécurité](#sécurité)
6. [Performance](#performance)
7. [Évolutivité](#évolutivité)

## Vue d'Ensemble

Le site web Oval Saône est construit sur l'architecture Azure Static Web Apps, qui combine un générateur de site statique moderne (Eleventy) avec un backend serverless basé sur Azure Functions.

### Diagramme d'Architecture

```
┌───────────────────────────────────────────────────────────┐
│                Azure Static Web Apps                       │
│                                                           │
│  ┌───────────────────┐         ┌───────────────────┐      │
│  │                   │         │                   │      │
│  │  Frontend Eleventy│         │ Backend Serverless│      │
│  │  (Générateur de   │◄───────►│ (Azure Functions) │      │
│  │   site statique)  │   API   │                   │      │
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

1. **Frontend Eleventy** :
   - Générateur de site statique moderne (11ty)
   - Templates Liquid et Nunjucks
   - Bundling CSS/JS automatique
   - Données JSON intégrées via _data et front matter
   - Validation des formulaires côté client

2. **Backend Serverless** :
   - Azure Functions v4 (.NET 8)
   - API REST pour traitement des formulaires
   - Validation des données et envoi d'emails

3. **Azure Static Web Apps** :
   - Hébergement du site généré et du backend
   - Routage et redirection
   - CDN intégré
   - Déploiement continu via GitHub Actions

## Architecture Frontend avec Eleventy

### Vue d'ensemble d'Eleventy

Eleventy (11ty) est un générateur de site statique moderne qui transforme les templates et données en HTML statique optimisé. Il offre plusieurs avantages :

- **Performance** : Sites ultra-rapides générés statiquement
- **Flexibilité** : Support de multiples moteurs de templates
- **Simplicité** : Configuration minimale requise
- **Évolutivité** : Facilite la maintenance et l'ajout de contenu

### Flux de Build Eleventy

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Templates     │    │    Eleventy      │    │   Site Statique │
│   (.liquid)     │───▶│    Process       │───▶│   (_site/)      │
│                 │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Données JSON  │    │   CSS/JS Bundle  │    │   Assets Copiés │
│   (_data/)      │    │   (.njk)         │    │   (images, etc) │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Structure de Fichiers Eleventy

```
src/
├── _includes/                  # Templates partagés
│   └── layout.njk             # Layout principal Nunjucks
├── _data/                     # Données globales JSON
│   ├── actualites.json
│   ├── sponsors.json
│   └── teams.json
├── _site/                     # Site généré (output)
├── *.liquid                   # Pages template Liquid
├── css-bundle.njk             # Bundle CSS
├── js-bundle.njk              # Bundle JavaScript
├── css/                       # Sources CSS
│   ├── styles.css
│   ├── components/            # Styles par composant
│   └── pages/                 # Styles par page
├── js/                        # Sources JavaScript
├── assets/                    # Ressources statiques
└── eleventy.config.js         # Configuration Eleventy
```

### Système de Templates

#### Templates Liquid (.liquid)
Pages principales avec front matter YAML :

```liquid
---
layout: layout.njk
title: "Titre de la page"
hero_title: "Titre hero personnalisé"
meta_description: "Description SEO"
---

<!-- Contenu de la page -->
<section class="hero">
    <h1>{{ hero_title }}</h1>
    <p>{{ meta_description }}</p>
</section>

<!-- Utilisation des données globales -->
{% for equipe in teams.teams %}
    <div class="team-card">
        <h3>{{ equipe.name }}</h3>
        <p>{{ equipe.description }}</p>
    </div>
{% endfor %}
```

#### Layout Principal (layout.njk)
Template Nunjucks pour la structure commune :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ title }}</title>
    <link rel="stylesheet" href="/css-bundle.css">
    <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
</head>
<body>
    <!-- Bandeau cookies RGPD -->
    <div id="cookie-banner" class="cookie-banner hidden">...</div>
    
    <!-- Navigation commune -->
    <nav class="navbar" id="navbar">...</nav>
    
    <!-- Contenu de la page injecté ici -->
    {{ content | safe }}
    
    <!-- Footer commun -->
    <footer class="footer">...</footer>
    
    <!-- Scripts -->
    <script src="/bundle.js"></script>
</body>
</html>
```

### Système de Bundling

#### CSS Bundle (css-bundle.njk)
Concatène automatiquement tous les styles :

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

#### JavaScript Bundle (js-bundle.njk)
Concatène les scripts JavaScript :

```njk
---
permalink: /bundle.js
---
{% include "./js/main.js" %}
{% include "./js/data-loader.js" %}
{% include "./js/contact.js" %}
{% include "./js/inscription.js" %}
{% include "./js/boutique.js" %}
```

### Gestion des Données

#### Données Globales (_data/)
Fichiers JSON automatiquement disponibles dans tous les templates :

```json
// _data/sponsors.json
{
  "sponsors": [
    {
      "name": "Sponsor 1",
      "logo": "assets/sponsors/logo1.png",
      "url": "https://sponsor1.com",
      "category": "partenaire-principal"
    }
  ]
}
```

Utilisation dans les templates :
```liquid
<div class="sponsors-grid">
{% for sponsor in sponsors.sponsors %}
    <a href="{{ sponsor.url }}" class="sponsor-card">
        <img src="{{ sponsor.logo }}" alt="{{ sponsor.name }}">
    </a>
{% endfor %}
</div>
```

#### Front Matter dans les Pages
Données spécifiques à chaque page :

```liquid
---
layout: layout.njk
title: "École de Rugby - Oval Saône"
hero_title: "École de Rugby"
hero_subtitle: "Formation aux valeurs du rugby"
categories:
  - name: "U6-U8"
    description: "Éveil rugby"
  - name: "U10-U12"
    description: "Apprentissage technique"
---
```

### Configuration Eleventy

Le fichier `eleventy.config.js` définit le comportement d'Eleventy :

```javascript
export default function(eleventyConfig) {
    console.log("Configuring Eleventy...");
    
    // Copie des assets statiques
    eleventyConfig.addPassthroughCopy("./assets");
    
    // Configuration des répertoires
    return {
        dir: {
            input: "src",        // Dossier source
            output: "_site",     // Dossier de sortie
            includes: "_includes", // Templates partagés
            data: "_data"        // Données globales
        },
        // Formats de templates supportés
        templateFormats: ["liquid", "njk", "html", "md"],
        
        // Moteur de template par défaut
        markdownTemplateEngine: "liquid",
        htmlTemplateEngine: "liquid"
    };
};
```
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
