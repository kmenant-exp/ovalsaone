# Photo Gallery — Résumé d'implémentation

> Dernière mise à jour : 15 juin 2025

## ✅ Fonctionnalités

La galerie photo est intégrée à la page d'accueil avec les fonctionnalités suivantes :

### Design
- **Grille responsive** adaptée à toutes les tailles d'écran (3 colonnes desktop, 2 tablette, 1 mobile)
- **Effets de survol** avec overlay montrant titre, date et bouton « Voir les photos »
- **Animations** d'apparition progressives (`fade-in-up`)
- Positionnée entre la section « Histoire » et « Sponsors »

### Fonctionnalités
1. **Filtrage par catégorie** — Matchs, Entraînements, Événements, Équipes
2. **Lightbox interactive** — Affichage plein écran au clic
3. **Carousel multi-photos** — Navigation entre les photos d'un album (← → / clavier)
4. **Compteur de photos** — Indicateur « 3 / 12 » dans le carousel
5. **Chargement progressif** — 6 albums visibles, bouton « Voir plus » pour le reste
6. **Plein écran** — API Fullscreen pour une immersion totale
7. **Lazy loading** — Chargement différé des images

## 🔧 Architecture technique

### Stockage des images

Les photos sont stockées **localement** dans le repository Git :

```
src/assets/gallery/
├── tournoi-lyon/
│   ├── cover.jpg         (photo de couverture)
│   ├── photo1.jpg
│   ├── photo2.jpg
│   └── photo3.jpg
├── match-u12/
│   ├── cover.jpg
│   └── ...
```

Les images sont servies par le **CDN Cloudflare Pages** — pas de service tiers.

### Données (gallery.json)

```json
{
  "gallery": [
    {
      "titre": "Tournoi de Lyon",
      "description": "Photos du tournoi U14",
      "mainImage": "/assets/gallery/tournoi-lyon/cover.jpg",
      "alt": "Tournoi de Lyon U14",
      "categorie": "matches",
      "date": "2025-03-15",
      "images": [
        "/assets/gallery/tournoi-lyon/photo1.jpg",
        "/assets/gallery/tournoi-lyon/photo2.jpg"
      ]
    }
  ]
}
```

### Gestion du contenu

Les albums sont gérés via **Decap CMS** (dashboard admin) :
- Collection `gallery` dans `admin/public/cms/config.yml`
- Upload d'images vers `pages/src/assets/gallery/`
- Chemins publics : `/assets/gallery/...`
- Commit automatique dans le repo Git → rebuild Cloudflare Pages

### Build (Eleventy)

1. `eleventy.config.js` charge `gallery.json` et auto-unwrap le wrapper Decap CMS
2. La variable `gallery` est disponible dans les templates Liquid
3. `index.liquid` itère sur `gallery` pour générer la grille HTML
4. Les données d'album sont encodées dans les `data-attributes` des boutons

### Runtime (JavaScript)

`src/js/gallery.js` (608 lignes) gère :

| Fonction | Rôle |
|---|---|
| `initGallery()` | Parse les data-attributes, initialise les composants |
| `setupFilters()` | Gestion des boutons de filtre par catégorie |
| `filterGallery(category)` | Affiche/masque les albums selon la catégorie |
| `setupLightbox()` | Événements de clic pour ouvrir la lightbox |
| `openLightbox(photos)` | Crée le modal carousel avec navigation |
| `setupLoadMore()` | Bouton « Voir plus » pour charger les albums cachés |

## 📁 Fichiers modifiés

| Fichier | Modifications |
|---|---|
| `src/index.liquid` | Section `.gallery` avec grille, filtres, lightbox |
| `src/js/gallery.js` | Logique complète de la galerie (608 lignes) |
| `src/css/components/gallery.css` | Styles grille, overlay, lightbox, carousel |
| `src/_data/gallery.json` | Données des albums |
| `src/css-bundle.njk` | Import du CSS galerie |
| `src/js-bundle.njk` | Import du JS galerie |
| `admin/public/cms/config.yml` | Collection Decap CMS pour la galerie |

## 🚀 Ajout de photos

Pour ajouter des photos, voir le [guide d'ajout de photos](docs/guide-ajout-photos.md).

En résumé :
1. Se connecter au dashboard admin (Decap CMS)
2. Aller dans la collection « Galerie »
3. Créer un album, uploader les photos
4. Publier → le site se rebuild automatiquement

## Voir aussi

- [docs/gallery-feature.md](docs/gallery-feature.md) — Documentation fonctionnelle
- [docs/gallery-architecture.md](docs/gallery-architecture.md) — Architecture technique
- [docs/guide-ajout-photos.md](docs/guide-ajout-photos.md) — Guide utilisateur

*Dernière mise à jour : 15 juin 2025*
