# Composant Boutons - Documentation

Ce fichier CSS centralise tous les styles de boutons utilisés dans l'application Oval Saône.

## Classes disponibles

### Classes de base
- `.btn` : Style de base pour tous les boutons

### Types de boutons
- `.btn-primary` : Bouton principal (vert club)
- `.btn-secondary` : Bouton secondaire (bordure verte, fond clair)
- `.btn-outline-white` : Bouton avec bordure blanche (pour fonds sombres)

### Tailles
- `.btn-large` : Bouton large avec style majuscule
- `.btn-small` : Bouton petit

### Styles spéciaux
- `.btn-gradient` : Bouton avec gradient (style partenariat)
- `.btn-submit` : Bouton de soumission de formulaire

### États
- `.btn:disabled` ou `.btn.loading` : État désactivé

## Exemples d'utilisation

```html
<!-- Bouton principal standard -->
<a href="#" class="btn btn-primary">Mon bouton</a>

<!-- Bouton large pour call-to-action -->
<a href="#" class="btn btn-primary btn-large">Nous rejoindre</a>

<!-- Bouton avec gradient (partenariat) -->
<a href="#" class="btn btn-primary btn-large btn-gradient">
    <i class="fas fa-handshake"></i>
    Devenir Partenaire
</a>

<!-- Bouton de formulaire -->
<button type="submit" class="btn-submit">Envoyer</button>
```

## Notes importantes

- Tous les boutons héritent des transitions et animations de base
- Les icônes dans les boutons sont automatiquement stylées
- Le composant est entièrement responsive
- Les variables CSS du projet sont utilisées pour la cohérence

## Integration

Pour utiliser ce composant, ajoutez l'import CSS dans vos pages HTML :

```html
<link rel="stylesheet" href="css/components/button.css">
```
