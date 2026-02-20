# Architecture de la Galerie Photo

> Dernière mise à jour : 15 juin 2025

## Vue d'ensemble

La galerie affiche des albums photo sur la page d'accueil avec filtrage par catégorie, lightbox interactive et carousel multi-photos. Les images sont stockées localement et servies par le CDN Cloudflare Pages.

## Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                       UTILISATEUR                            │
│                    (Navigateur web)                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE PAGES CDN                             │
│  Sert les fichiers statiques (HTML, CSS, JS, images)         │
│  URL : ovalsaone.pages.dev / www.ovalsaone.fr                │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
   index.html    css-bundle.css   bundle.js
   (galerie)     (styles)        (gallery.js)
        │
        ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUILD ELEVENTY                             │
│                                                              │
│  src/index.liquid ──► Lit gallery.json ──► Génère HTML       │
│                       ({% for photo in gallery %})           │
└──────────────────────┬──────────────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
  gallery.json    assets/gallery/   gallery.js
  (métadonnées)   (fichiers image)  (interactivité)
```

## Flux de données

### 1. Build (Eleventy)

```
src/_data/gallery.json
    │
    ▼
eleventy.config.js (auto-unwrap du wrapper Decap CMS)
    │
    ▼
Variable globale `gallery` disponible dans les templates
    │
    ▼
src/index.liquid
    │  {% for photo in sortedGallery %}
    │    <article class="gallery-item" data-category="{{ photo.categorie }}">
    │      <img src="{{ photo.mainImage }}" />
    │      <button data-photo-images='{{ photo.images | jsonify }}'>
    │    </article>
    │  {% endfor %}
    │
    ▼
_site/index.html (HTML statique avec données embarquées)
```

### 2. Runtime (Navigateur)

```
gallery.js (DOMContentLoaded)
    │
    ├── initGallery()
    │     └── Parse les data-attributes des .gallery-item
    │
    ├── setupFilters()
    │     └── Click sur .gallery-filter-btn → filterGallery(category)
    │
    ├── setupLightbox()
    │     └── Click sur .gallery-view-btn → openLightbox(photos)
    │         ├── Carousel avec navigation ← →
    │         ├── Plein écran (fullscreen API)
    │         └── Fermeture ESC / click extérieur
    │
    └── setupLoadMore()
          └── Click "Voir plus" → révèle les .gallery-item-hidden
```

## Modèle de données

### gallery.json

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
        "/assets/gallery/tournoi-lyon/photo2.jpg",
        "/assets/gallery/tournoi-lyon/photo3.jpg"
      ]
    }
  ]
}
```

### Catégories disponibles

| Valeur | Libellé | Filtre |
|---|---|---|
| `matches` | Matchs | Rencontres et tournois |
| `entrainements` | Entraînements | Séances d'entraînement |
| `evenements` | Événements | BBQ, fêtes, cérémonies |
| `equipes` | Équipes | Photos de groupe |

## Fichiers impliqués

| Fichier | Rôle |
|---|---|
| `src/_data/gallery.json` | Données des albums |
| `src/index.liquid` (section `.gallery`) | Template Liquid de la grille |
| `src/js/gallery.js` | Filtres, lightbox, carousel (608 lignes) |
| `src/css/components/gallery.css` | Styles de la galerie |
| `src/assets/gallery/` | Images (organisées en sous-dossiers par album) |
| `admin/public/cms/config.yml` | Configuration Decap CMS pour la collection gallery |

## Gestion du contenu

Les albums sont gérés via **Decap CMS** dans le dashboard admin :

1. L'administrateur crée/modifie un album dans le CMS
2. Decap CMS commit les changements dans `gallery.json` + upload les images dans `src/assets/gallery/`
3. Cloudflare Pages détecte le push Git et rebuild le site
4. Les nouvelles photos sont disponibles sur le site

📌 **Pas besoin de rebuild manuel** — le déploiement est automatique via Cloudflare Pages.

## Voir aussi

- [gallery-feature.md](gallery-feature.md) — Fonctionnalités de la galerie
- [guide-ajout-photos.md](guide-ajout-photos.md) — Guide d'ajout de photos

*Dernière mise à jour : 15 juin 2025*
