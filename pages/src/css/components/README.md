# CSS Components

Ce dossier contient les composants CSS réutilisables du site.

## Composants disponibles

- `footer.css` - Styles pour le footer du site (toutes les pages)
- `nav.css` - Styles pour la navigation du site (toutes les pages)

## Utilisation

Chaque composant CSS doit être inclus dans les pages HTML qui l'utilisent :

```html
<link rel="stylesheet" href="css/components/footer.css">
<link rel="stylesheet" href="css/components/nav.css">
```

## Structure de la navigation

La navigation contient :
- `.navbar` - Barre de navigation fixe avec effet de scroll
- `.nav-container` - Conteneur principal avec largeur max
- `.nav-logo` - Logo et nom du club
- `.nav-menu` - Menu de navigation principal
- `.nav-link` - Liens de navigation avec effets hover
- `.nav-toggle` - Bouton menu mobile (hamburger)
- `.bar` - Barres du bouton hamburger
- `.menu-overlay` - Overlay pour fermer le menu mobile

## Structure du footer

Le footer contient :
- `.footer` - Conteneur principal avec fond sombre
- `.footer-grid` - Grille responsive pour les sections
- `.footer-section` - Sections individuelles (contact, liens, réseaux sociaux)
- `.footer-bottom` - Ligne de copyright en bas
- `.social-links` - Liens vers les réseaux sociaux
- `.instagram-embed` - Styles pour l'embed Instagram

## Responsive

Les composants s'adaptent automatiquement aux écrans mobiles :
- La navigation utilise un menu mobile avec animation
- Le footer utilise une grille responsive
