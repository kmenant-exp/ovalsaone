# Site Web Oval Saône - Azure Static Web App

Site web moderne pour un club de rugby développé avec Azure Static Web App, utilisant des technologies web standard et des Azure Functions en C#.

## 🏉 Fonctionnalités

### Pages du site
- **Accueil** - Page d'accueil avec actualités et présentation
- **Équipes** - Présentation des catégories (U6, U8, U10, U12, U14, Seniors)
- **L'École** - Histoire du club, bureau et entraîneurs
- **Partenariat** - Sponsors et informations de partenariat
- **Boutique** - Produits et équipements du club
- **Inscription** - Formulaire d'inscription avec calcul automatique des catégories
- **Contact** - Formulaire de contact avec carte

### Fonctionnalités techniques
- **Design responsive** avec menu mobile hamburger
- **Navigation sticky** avec réduction au scroll
- **Effets parallax** pour les sections hero et histoire
- **Bandeau RGPD** pour la conformité cookies
- **Chargement dynamique des données** depuis des fichiers JSON
- **Validation de formulaires** côté client et serveur
- **Azure Functions C#** pour le traitement des formulaires
- **Système de cache** pour les données JSON

## 🛠️ Technologies utilisées

### Frontend
- HTML5 sémantique
- CSS3 avec Custom Properties et Grid/Flexbox
- JavaScript ES6+ modulaire
- Font Awesome pour les icônes
- Design mobile-first responsive

### Backend
- Azure Functions v4 (.NET 8)
- C# avec modèles de validation
- MailKit pour l'envoi d'emails
- API REST avec gestion CORS

### Déploiement
- Azure Static Web Apps
- SWA CLI pour le développement local
- Configuration automatique CI/CD avec GitHub

## 📁 Structure du projet

```
kme-rugby-aswapp/
├── index.html                 # Page d'accueil
├── equipes.html              # Page équipes
├── ecole.html                # Page école de rugby
├── partenariat.html          # Page partenariats
├── boutique.html             # Page boutique
├── inscription.html          # Page inscription
├── contact.html              # Page contact
├── staticwebapp.config.json  # Configuration Azure SWA
├── swa-cli.config.json       # Configuration SWA CLI
├── css/
│   └── styles.css           # Styles principaux
├── js/
│   ├── main.js              # JavaScript principal
│   ├── data-loader.js       # Chargement des données JSON
│   └── [page].js           # Scripts spécifiques par page
├── data/
│   ├── actualites.json      # Données des actualités
│   ├── equipes.json         # Données des équipes
│   ├── ecole.json           # Données de l'école
│   ├── partenariat.json     # Données des partenaires
│   ├── boutique.json        # Produits de la boutique
│   ├── inscription.json     # Tarifs et documents
│   └── sponsors.json        # Logos des sponsors
├── assets/
│   ├── *.svg               # Images et logos
│   ├── actualites/         # Images des actualités
│   ├── boutique/           # Images des produits
│   ├── sponsors/           # Logos des sponsors
│   ├── entraineurs/        # Photos des entraîneurs
│   └── bureau/             # Photos du bureau
└── api/
    ├── RugbyClubApi.csproj # Projet .NET
    ├── Program.cs          # Point d'entrée
    ├── host.json           # Configuration Functions
    ├── local.settings.json # Variables d'environnement
    ├── Functions/
    │   ├── ContactFunction.cs     # API contact
    │   └── InscriptionFunction.cs # API inscription
    ├── Models/
    │   └── FormModels.cs   # Modèles de données
    └── Services/
        └── EmailService.cs # Service d'envoi d'emails
```

## 🚀 Installation et développement

### Prérequis
- Node.js 18+ 
- .NET 8 SDK
- Azure Static Web Apps CLI
- Git

### Installation
```bash
# Cloner le repository
git clone [url-du-repo]
cd kme-rugby-aswapp

# Installer SWA CLI globalement
npm install -g @azure/static-web-apps-cli

# Restaurer les packages .NET
cd api
dotnet restore
cd ..
```

### Développement local
```bash
# Démarrer l'application en mode développement
swa start . --api-location ./api

# L'application sera disponible sur http://localhost:4280
# L'API sera disponible sur http://localhost:7071/api
```

### Configuration email (optionnel)
Pour tester l'envoi d'emails en local, configurer les variables dans `api/local.settings.json` :
```json
{
  "Values": {
    "SMTP_HOST": "smtp.gmail.com",
    "SMTP_PORT": "587",
    "SMTP_USER": "votre-email@gmail.com",
    "SMTP_PASS": "votre-mot-de-passe-app",
    "CONTACT_EMAIL": "contact@rugbyclub.fr",
    "INSCRIPTION_EMAIL": "secretaire@rugbyclub.fr"
  }
}
```

## 📝 Gestion du contenu

### Actualités
Éditer `data/actualites.json` pour ajouter/modifier les actualités :
```json
{
  "actualites": [
    {
      "id": 1,
      "titre": "Titre de l'actualité",
      "extrait": "Résumé court",
      "date": "2024-09-01",
      "image": "assets/actualites/image.svg",
      "contenu": "Contenu complet..."
    }
  ]
}
```

### Équipes et catégories
Éditer `data/equipes.json` pour gérer les catégories :
```json
{
  "categories": [
    {
      "id": 1,
      "nom": "U6",
      "description": "École de rugby pour les moins de 6 ans",
      "age_min": 3,
      "age_max": 5,
      "entraineur": {
        "nom": "Nom de l'entraîneur",
        "experience": "5 ans d'expérience",
        "diplomes": ["Éducateur Rugby", "BAFA"]
      }
    }
  ]
}
```

### Sponsors et partenaires
Éditer `data/sponsors.json` et `data/partenariat.json` pour gérer les partenariats.

## 🔧 Personnalisation

### Couleurs et styles
Les couleurs principales sont définies dans `css/styles.css` via des custom properties :
```css
:root {
  --color-primary: #1a5f1a;    /* Vert rugby */
  --color-secondary: #2d5016;   /* Vert foncé */
  --color-accent: #4caf50;      /* Vert clair */
}
```

### Logo et images
- Remplacer `assets/logo.svg` par votre logo
- Remplacer `assets/hero-image.svg` par votre image hero
- Ajouter vos images dans les dossiers correspondants

## 🚀 Déploiement sur Azure

### Via GitHub Actions (recommandé)
1. Créer un repository GitHub
2. Pousser le code
3. Créer une Azure Static Web App depuis le portail Azure
4. Connecter le repository GitHub
5. Azure configure automatiquement le workflow CI/CD

### Via SWA CLI
```bash
# Se connecter à Azure
swa login

# Déployer
swa deploy
```

### Configuration de production
- Configurer les variables d'environnement dans Azure
- Ajouter un domaine personnalisé
- Configurer les certificats SSL automatiques

## 📧 Configuration email de production

Dans le portail Azure, configurer les Application Settings :
- `SMTP_HOST` : serveur SMTP
- `SMTP_PORT` : port SMTP (587)
- `SMTP_USER` : nom d'utilisateur SMTP
- `SMTP_PASS` : mot de passe SMTP
- `CONTACT_EMAIL` : email de destination pour les contacts
- `INSCRIPTION_EMAIL` : email de destination pour les inscriptions

## 🔒 Sécurité et RGPD

- Bandeau de cookies conforme RGPD
- Validation stricte des formulaires
- Protection contre les injections (paramètres SQL non utilisés)
- HTTPS automatique avec Azure
- Headers de sécurité configurés

## 📱 Compatibilité

- Responsive design pour mobile, tablette et desktop
- Compatible avec tous les navigateurs modernes
- Progressive Enhancement
- Accessibilité WCAG de base

## 🆘 Support et maintenance

### Logs et monitoring
- Consulter les logs dans Application Insights
- Surveiller les métriques de performance
- Alertes automatiques en cas d'erreur

### Mises à jour
- Mise à jour automatique des dépendances de sécurité
- Tests automatisés via GitHub Actions
- Rollback facile via le portail Azure

## 📄 Licence

Ce projet est un template pour clubs de rugby. Libre d'utilisation et de modification.

## 🤝 Contribution

1. Fork le project
2. Créer une branche feature
3. Commiter les changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

---

**Développé avec ❤️ pour la communauté rugby**
