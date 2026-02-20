# Guide d'ajout de photos à la galerie

> Dernière mise à jour : 15 juin 2025

Ce guide vous explique **pas à pas** comment ajouter de nouvelles photos à la galerie du site, **sans connaissances techniques**.

---

## 📋 Ce dont vous avez besoin

1. **Un accès au dashboard admin** du site (demandez à l'administrateur)
2. **Vos photos** organisées sur votre ordinateur
   - Format : JPG ou PNG
   - Taille recommandée : moins de 2 Mo par photo

---

## 🎯 Étape 1 : Préparer vos photos

### 1.1 Organiser vos photos

Sur votre ordinateur, rassemblez les photos d'un même événement dans un dossier.

**Nommage recommandé :**
- `tournoi-lyon-20251215`
- `match-u12-20251220`
- `entrainement-u8-20251210`
- `barbecue-club-20251225`

### 1.2 Choisir la photo de couverture

Sélectionnez **une photo principale** qui représentera l'album dans la grille de la galerie.

### 1.3 Vérifier la qualité des photos

✅ **Conseils :**
- Résolution minimum : 1200 × 800 pixels
- Poids maximum : 2 Mo par photo (pour un chargement rapide)
- Orientation : horizontale de préférence
- Formats acceptés : JPG, JPEG, PNG

---

## 🖥️ Étape 2 : Se connecter au dashboard admin

1. Rendez-vous sur **l'URL du dashboard admin** (communiquée par l'administrateur)
2. Connectez-vous avec votre **compte Google** autorisé
3. Dans le menu latéral, cliquez sur **« Galerie »**

---

## 📸 Étape 3 : Créer un nouvel album

### 3.1 Ajouter un album

1. Cliquez sur le bouton **« Ajouter un album »** (ou « New »)
2. Remplissez les champs suivants :

| Champ | Description | Exemple |
|---|---|---|
| **Titre** | Nom de l'album | `Tournoi de Lyon U14` |
| **Description** | Courte description (optionnel) | `Photos du tournoi inter-clubs` |
| **Catégorie** | Type d'événement | Matchs / Entraînements / Événements / Équipes |
| **Date** | Date de l'événement | `15/03/2025` |
| **Texte alternatif** | Description pour l'accessibilité (optionnel) | `Équipe U14 au tournoi de Lyon` |

### 3.2 Ajouter la photo de couverture

1. Cliquez sur **« Image principale (couverture) »**
2. Cliquez sur **« Choisir un fichier »** ou glissez-déposez votre photo
3. Sélectionnez la photo qui apparaîtra dans la grille

### 3.3 Ajouter les photos de l'album

1. Dans la section **« Photos de l'album »**, cliquez sur **« Ajouter »**
2. Pour chaque photo :
   - Cliquez sur **« Photo »**
   - Sélectionnez le fichier sur votre ordinateur
3. Répétez pour toutes les photos de l'album

💡 **Astuce :** Vous pouvez ajouter autant de photos que vous souhaitez. Elles seront visibles dans le carousel/lightbox quand un visiteur clique sur l'album.

### 3.4 Publier

1. Vérifiez les informations saisies
2. Cliquez sur **« Publish »** (ou « Publier »)
3. Le CMS commit automatiquement les changements
4. Le site se reconstruit automatiquement (quelques minutes)

---

## ✅ Étape 4 : Vérifier le résultat

1. Attendez **2-3 minutes** après la publication (le temps du build automatique)
2. Rendez-vous sur la **page d'accueil** du site
3. Faites défiler jusqu'à la section **Galerie**
4. Vérifiez que :
   - ✅ Votre album apparaît dans la grille
   - ✅ La photo de couverture est correcte
   - ✅ Le filtrage par catégorie fonctionne
   - ✅ En cliquant sur l'album, toutes les photos s'affichent dans le carousel

---

## 🔄 Modifier un album existant

1. Connectez-vous au dashboard admin
2. Dans **« Galerie »**, cliquez sur l'album à modifier
3. Modifiez les champs souhaités (titre, photos, catégorie…)
4. Cliquez sur **« Publish »**
5. Les modifications seront visibles après le rebuild automatique

---

## ❌ Supprimer un album

1. Connectez-vous au dashboard admin
2. Dans **« Galerie »**, cliquez sur l'album à supprimer
3. Cliquez sur **« Delete »** (ou « Supprimer »)
4. Confirmez la suppression
5. Le site se reconstruit et l'album disparaît

---

## 📂 Les catégories disponibles

| Catégorie | Usage |
|---|---|
| **Matchs** | Rencontres, tournois, compétitions |
| **Entraînements** | Séances d'entraînement, stages |
| **Événements** | BBQ, fêtes, cérémonies, sorties |
| **Équipes** | Photos de groupe, photos officielles |

---

## ❓ Questions fréquentes

### Combien de temps avant que les photos apparaissent ?
Le build automatique prend **2-3 minutes** après la publication dans le CMS.

### Quelle taille maximale pour une photo ?
**2 Mo** par photo. Au-delà, le chargement sera lent pour les visiteurs. Utilisez un outil comme [TinyPNG](https://tinypng.com/) pour compresser vos photos.

### Combien de photos par album ?
Pas de limite technique, mais **10-20 photos** par album est un bon équilibre entre richesse du contenu et temps de chargement.

### Puis-je changer l'ordre des photos ?
Oui, dans le CMS, vous pouvez réordonner les photos de l'album en les glissant-déposant.

### Les photos sont-elles redimensionnées automatiquement ?
Non. Redimensionnez vos photos **avant** l'upload pour de meilleures performances. Taille recommandée : 1600 × 1200 px.

---

## Voir aussi

- [gallery-feature.md](gallery-feature.md) — Fonctionnalités de la galerie
- [gallery-architecture.md](gallery-architecture.md) — Architecture technique de la galerie

*Dernière mise à jour : 15 juin 2025*
