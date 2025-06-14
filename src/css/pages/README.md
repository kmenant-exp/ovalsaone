# CSS spécifiques aux pages

Ce dossier contient les fichiers CSS spécifiques à chaque page du site.

## Structure

- `index.css` - Styles spécifiques à la page d'accueil (hero, actualités, histoire)
- `equipes.css` - Styles spécifiques à la page équipes
- `ecole.css` - Styles spécifiques à la page école
- `inscription.css` - Styles spécifiques à la page inscription (formulaires, tarifs)
- `contact.css` - Styles spécifiques à la page contact
- `boutique.css` - Styles spécifiques à la page boutique
- `partenariat.css` - Styles spécifiques à la page partenariat

## Utilisation

Chaque fichier CSS de ce dossier est inclus dans sa page HTML correspondante via un lien :

```html
<link rel="stylesheet" href="css/pages/[nom-page].css">
```

## Styles partagés

Les styles communs à toutes les pages se trouvent dans :
- `../styles.css` - Styles principaux (navigation, footer, formulaires, etc.)
- `../cookie-banner.css` - Styles pour le bandeau cookies
- `../sponsors.css` - Styles pour le carrousel de sponsors
