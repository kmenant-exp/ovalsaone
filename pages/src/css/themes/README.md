# Thème Glassmorphism - Oval Saône

## Description

Ce thème applique un style **glassmorphism** moderne au site Oval Saône, caractérisé par :

- 🔮 **Effet verre givré** : Fonds semi-transparents avec flou (`backdrop-filter: blur`)
- ✨ **Bordures subtiles** : Bordures blanches/colorées légères avec opacité
- 🌟 **Ombres douces** : Ombres diffuses et effets de lueur (glow)
- 🎨 **Dégradés élégants** : Transitions de couleurs fluides
- 🌊 **Animations fluides** : Effets de shimmer et de rotation subtils

## Structure des fichiers

```
src/css/themes/
└── glassmorphism.css    # Thème glassmorphism complet
```

## Activation du thème

Le thème est inclus dans `css-bundle.njk`. Pour le désactiver, commentez la ligne :

```njk
{# {% include "./css/themes/glassmorphism.css" %} #}
```

## Variables CSS disponibles

Le thème définit ses propres variables pour personnalisation :

### Fonds glassmorphism
```css
--glass-bg: rgba(255, 255, 255, 0.15);
--glass-bg-light: rgba(255, 255, 255, 0.25);
--glass-bg-dark: rgba(14, 49, 96, 0.65);
--glass-bg-card: rgba(255, 255, 255, 0.85);
--glass-bg-card-hover: rgba(255, 255, 255, 0.95);
```

### Bordures
```css
--glass-border: rgba(255, 255, 255, 0.3);
--glass-border-light: rgba(255, 255, 255, 0.5);
--glass-border-accent: rgba(7, 191, 239, 0.4);
--glass-border-gold: rgba(243, 167, 18, 0.5);
```

### Effets de flou
```css
--glass-blur: blur(12px);
--glass-blur-light: blur(8px);
--glass-blur-heavy: blur(20px);
```

### Ombres
```css
--glass-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
--glass-shadow-lg: 0 15px 45px rgba(0, 0, 0, 0.15);
--glass-shadow-inset: inset 0 1px 1px rgba(255, 255, 255, 0.3);
--glass-shadow-glow: 0 0 40px rgba(7, 191, 239, 0.15);
```

## Composants stylisés

Le thème applique le glassmorphism aux composants suivants :

| Composant | Effet |
|-----------|-------|
| Navigation | Fond flou avec bordure dorée |
| Hero | Contenu avec effet verre + animation glow |
| Boutons | Effet de brillance au survol |
| Cartes | Fond semi-transparent + ombre portée |
| Formulaires | Champs avec fond flou |
| Footer | Dégradé sombre avec effet verre |
| Sections parallax | Conservées avec overlay glassmorphism |

## Compatibilité

### Navigateurs supportés
- ✅ Chrome 76+
- ✅ Firefox 103+
- ✅ Safari 9+
- ✅ Edge 79+

### Fallback
Le thème inclut un fallback pour les navigateurs sans support de `backdrop-filter` :

```css
@supports not (backdrop-filter: blur(10px)) {
    /* Styles de secours avec fonds opaques */
}
```

### Performance mobile
- Le flou est réduit sur mobile pour de meilleures performances
- Les animations respectent `prefers-reduced-motion`

## Personnalisation

### Changer l'intensité du flou

Modifiez les variables `--glass-blur-*` dans `:root` :

```css
:root {
    --glass-blur: blur(16px);  /* Plus de flou */
    --glass-blur-light: blur(10px);
}
```

### Ajuster la transparence des cartes

```css
:root {
    --glass-bg-card: rgba(255, 255, 255, 0.7);  /* Plus transparent */
}
```

### Désactiver les animations

Ajoutez dans votre CSS personnalisé :

```css
.hero-content::after,
.section-title::after {
    animation: none !important;
}
```

## Captures d'écran

Le thème transforme visuellement :

1. **Hero** : Contenu dans une boîte de verre avec effet de lueur tournante
2. **Navigation** : Barre transparente floutée avec bordure dorée
3. **Cartes** : Effet de lévitation au survol avec glow turquoise
4. **Formulaires** : Champs de saisie avec fond semi-transparent

## Notes techniques

- Le parallax existant est **conservé** - seuls les overlays sont stylisés
- Les couleurs du thème principal (bleu marine, turquoise, doré) sont respectées
- Le thème utilise les variables CSS existantes + ses propres variables glassmorphism
