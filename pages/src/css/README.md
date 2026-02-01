# Architecture CSS du Site

Ce dossier contient l'ensemble des styles CSS du site de rugby, organisés selon une architecture modulaire.

## Structure générale

```
css/
├── README.md              # Ce fichier
├── styles.css            # Styles globaux et variables CSS
├── cookie-banner.css     # Styles pour le bandeau de cookies
├── sponsors.css          # Styles pour la section sponsors
├── components/           # Composants réutilisables
│   ├── README.md
│   ├── footer.css       # Footer du site
│   └── nav.css          # Navigation principale
└── pages/               # Styles spécifiques aux pages
    ├── README.md
    ├── index.css        # Page d'accueil
    ├── contact.css      # Page de contact
    ├── ecole.css        # Page école de rugby
    ├── equipes.css      # Page équipes
    ├── inscription.css  # Page inscription
    ├── boutique.css     # Page boutique
    └── partenariat.css  # Page partenariat
```

## Ordre d'inclusion dans les pages HTML

Pour une page type, les CSS doivent être inclus dans cet ordre :

```html
<head>
    <!-- 1. Styles globaux et variables -->
    <link rel="stylesheet" href="css/styles.css">
    
    <!-- 2. Composants réutilisables -->
    <link rel="stylesheet" href="css/components/nav.css">
    <link rel="stylesheet" href="css/components/footer.css">
    
    <!-- 3. Styles spécifiques à la page -->
    <link rel="stylesheet" href="css/pages/[page-name].css">
    
    <!-- 4. Styles utilitaires -->
    <link rel="stylesheet" href="css/cookie-banner.css">
    <link rel="stylesheet" href="css/sponsors.css">
</head>
```

## Variables CSS globales

Le fichier `styles.css` définit les variables CSS utilisées dans tout le projet :

- **Couleurs** : `--primary-color`, `--secondary-color`, `--accent-color`, etc.
- **Espacements** : `--spacing-1` à `--spacing-24`
- **Tailles de police** : `--font-size-xs` à `--font-size-4xl`
- **Autres** : `--border-radius`, `--box-shadow`, etc.

## Composants modulaires

### Navigation (`components/nav.css`)
- Barre de navigation fixe responsive
- Menu mobile avec animation hamburger
- Effets de survol et états actifs

### Footer (`components/footer.css`)
- Footer responsive avec grille
- Sections contact, liens, réseaux sociaux
- Intégration Instagram

## Pages spécialisées

Chaque page a son propre fichier CSS dans `pages/` contenant uniquement les styles spécifiques à cette page.

## Maintenance

Lors de l'ajout de nouveaux styles :

1. **Styles globaux** → `styles.css`
2. **Nouveau composant réutilisable** → `components/[nom].css`
3. **Styles spécifiques à une page** → `pages/[page].css`

## Responsive Design

Tous les composants et pages sont conçus avec une approche mobile-first et utilisent des media queries pour s'adapter aux différentes tailles d'écran.
