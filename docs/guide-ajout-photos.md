# Guide d'ajout de photos à la galerie

Ce guide vous explique **pas à pas** comment ajouter de nouvelles photos à la galerie du site, **sans connaissances techniques**.

---

## 📋 Ce dont vous avez besoin

1. **Azure Storage Explorer** installé sur votre ordinateur
   - Téléchargement gratuit : [https://azure.microsoft.com/fr-fr/products/storage/storage-explorer](https://azure.microsoft.com/fr-fr/products/storage/storage-explorer)
   - Compatible Windows, Mac et Linux

2. **Les identifiants de connexion** au compte de stockage Azure
   - Fournis par l'administrateur du site
   - Nom du compte : `stovalsaoneprd`

3. **Vos photos** organisées dans un dossier sur votre ordinateur
   - Format : JPG ou PNG
   - Taille recommandée : moins de 2 Mo par photo

---

## 🎯 Étape 1 : Préparer vos photos

### 1.1 Créer un dossier pour votre album

Sur votre ordinateur, créez un nouveau dossier avec un nom clair :

**Format recommandé :** `type-evenement-date`

**Exemples :**
- `tournoi-lyon-20251215`
- `match-u12-20251220`
- `entrainement-u8-20251210`
- `barbecue-club-20251225`

### 1.2 Copier vos photos dans ce dossier

1. Sélectionnez toutes les photos de votre événement
2. Copiez-les dans le dossier que vous venez de créer
3. **Important :** Choisissez **une photo principale** qui représentera l'album dans la grille
   - Renommez-la en `Image1.jpeg` ou notez son nom exact

### 1.3 Vérifier la qualité des photos

✅ **Conseils :**
- Résolution minimum : 1200 x 800 pixels
- Poids maximum : 2 Mo par photo (pour un chargement rapide)
- Orientation : horizontal de préférence

💡 **Astuce :** Si vos photos sont trop lourdes, vous pouvez les compresser avec un outil gratuit comme [TinyPNG](https://tinypng.com) ou [Squoosh](https://squoosh.app).

---

## 🔐 Étape 2 : Se connecter à Azure Storage Explorer

### 2.1 Ouvrir Azure Storage Explorer

Lancez l'application Azure Storage Explorer sur votre ordinateur.

### 2.2 Se connecter au compte de stockage

1. Dans le menu de gauche, cliquez sur l'icône **"Connecter"** (icône de prise électrique) ou **"Ouvrir la boîte de dialogue Connexion"**

2. Choisissez l'option : **"Compte de stockage ou service"**

3. Sélectionnez : **"Chaîne de connexion"**

4. Collez la **chaîne de connexion** fournie par l'administrateur dans le champ prévu
   - Format : `DefaultEndpointsProtocol=https;AccountName=...`

5. Cliquez sur **"Suivant"** puis **"Connecter"**

### 2.3 Vérifier la connexion

Dans le panneau de gauche, vous devriez maintenant voir :
```
📦 stovalsaoneprd (Compte de stockage)
  └── 📁 Conteneurs de blobs
      └── 📁 medias
```

---

## 📤 Étape 3 : Télécharger vos photos

### 3.1 Ouvrir le conteneur "medias"

1. Dans le panneau de gauche, **double-cliquez** sur **"Conteneurs de blobs"**
2. **Double-cliquez** sur le dossier **"medias"**

Vous verrez la liste des albums déjà existants (par exemple : `tournoi-trevoux-20251010`, `tournoi-lyon-20251110`).

### 3.2 Créer un nouveau dossier pour votre album

1. Cliquez sur le bouton **"Nouveau dossier"** dans la barre d'outils en haut (icône de dossier avec un +)

2. Entrez le **nom de votre dossier** (celui que vous avez créé à l'étape 1.1)
   - Exemple : `match-u12-20251220`

3. Validez en appuyant sur **Entrée**

### 3.3 Télécharger vos photos

1. **Double-cliquez** sur le dossier que vous venez de créer pour l'ouvrir

2. Cliquez sur le bouton **"Charger"** dans la barre d'outils (icône de flèche vers le haut)

3. Sélectionnez **"Charger des fichiers"**

4. Dans la fenêtre qui s'ouvre :
   - Cliquez sur **"..."** à côté de "Fichiers"
   - Naviguez vers le dossier sur votre ordinateur contenant vos photos
   - Sélectionnez **toutes vos photos** (Ctrl+A sur Windows, Cmd+A sur Mac)
   - Cliquez sur **"Ouvrir"**

5. Vérifiez les options :
   - **Type de blob :** Blob de blocs
   - Laissez les autres options par défaut

6. Cliquez sur **"Charger"**

7. **Attendez** que le téléchargement se termine (une barre de progression s'affiche)

### 3.4 Vérifier le téléchargement

Une fois terminé, vous devriez voir toutes vos photos listées dans le dossier :
- `Image1.jpeg` (votre photo principale)
- `Image2.jpeg`
- `Image3.jpeg`
- etc.

---

## 📝 Étape 4 : Ajouter l'album au site web

### 4.1 Récupérer l'URL de votre photo principale

1. Dans Azure Storage Explorer, **cliquez une fois** sur votre photo principale (`Image1.jpeg`)

2. Dans le panneau de **propriétés** à droite, cherchez **"URI"** ou **"URL"**

3. **Copiez** l'URL complète
   - Format : `https://stovalsaoneprd.blob.core.windows.net/medias/match-u12-20251220/Image1.jpeg`

4. **Notez cette URL** quelque part (bloc-notes, email à vous-même)

### 4.2 Récupérer l'URL du dossier

L'URL du dossier est simplement l'URL de la photo **sans le nom du fichier** :

Si votre photo est :
```
https://stovalsaoneprd.blob.core.windows.net/medias/match-u12-20251220/Image1.jpeg
```

L'URL du dossier est :
```
https://stovalsaoneprd.blob.core.windows.net/medias/match-u12-20251220
```

**Notez cette URL également.**

### 4.3 Modifier le fichier de configuration sur GitHub

1. **Allez sur GitHub** dans votre navigateur : [https://github.com/laetitia-gente/ovalsaone](https://github.com/laetitia-gente/ovalsaone)

2. **Connectez-vous** à votre compte GitHub (si ce n'est pas déjà fait)

3. **Naviguez** vers le fichier à modifier :
   - Cliquez sur le dossier **`src`**
   - Cliquez sur le dossier **`_data`**
   - Cliquez sur le fichier **`gallery.json`**

4. **Activez le mode édition** :
   - Cliquez sur l'icône **crayon** ✏️ en haut à droite du fichier (tooltip : "Edit this file")

5. Le fichier contient une liste d'albums. Vous allez **ajouter le vôtre**.

**Structure actuelle :**
```json
[
  {
    "titre": "Tournoi de Trévoux",
    "description": "Nos jeunes en action",
    "date": "2025-10-10",
    "mainImage": "https://stovalsaoneprd.blob.core.windows.net/medias/tournoi-trevoux-20251010/Image1.jpeg",
    "storageUrl": "https://stovalsaoneprd.blob.core.windows.net/medias/tournoi-trevoux-20251010",
    "categorie": "matches",
    "alt": "Tournoi de Trévoux - 10 octobre 2025"
  },
  {
    "titre": "Tournoi de Lyon",
    "description": "Tournoi à Lyon",
    "date": "2025-11-10",
    "mainImage": "https://stovalsaoneprd.blob.core.windows.net/medias/tournoi-lyon-20251110/Image1.jpeg",
    "storageUrl": "https://stovalsaoneprd.blob.core.windows.net/medias/tournoi-lyon-20251110",
    "categorie": "matches",
    "alt": "Tournoi de Lyon - 10 novembre 2025"
  }
]
```

### 4.4 Ajouter votre nouvel album

**Avant le dernier `]`, ajoutez une virgule puis votre nouvel album :**

```json
[
  {
    "titre": "Tournoi de Trévoux",
    "description": "Nos jeunes en action",
    "date": "2025-10-10",
    "mainImage": "https://stovalsaoneprd.blob.core.windows.net/medias/tournoi-trevoux-20251010/Image1.jpeg",
    "storageUrl": "https://stovalsaoneprd.blob.core.windows.net/medias/tournoi-trevoux-20251010",
    "categorie": "matches",
    "alt": "Tournoi de Trévoux - 10 octobre 2025"
  },
  {
    "titre": "Tournoi de Lyon",
    "description": "Tournoi à Lyon",
    "date": "2025-11-10",
    "mainImage": "https://stovalsaoneprd.blob.core.windows.net/medias/tournoi-lyon-20251110/Image1.jpeg",
    "storageUrl": "https://stovalsaoneprd.blob.core.windows.net/medias/tournoi-lyon-20251110",
    "categorie": "matches",
    "alt": "Tournoi de Lyon - 10 novembre 2025"
  },
  {
    "titre": "Match U12 contre Villefranche",
    "description": "Belle victoire de nos U12",
    "date": "2025-12-20",
    "mainImage": "https://stovalsaoneprd.blob.core.windows.net/medias/match-u12-20251220/Image1.jpeg",
    "storageUrl": "https://stovalsaoneprd.blob.core.windows.net/medias/match-u12-20251220",
    "categorie": "matches",
    "alt": "Match U12 contre Villefranche - 20 décembre 2025"
  }
]
```

### 4.5 Remplir les champs

Pour votre nouvel album, remplissez :

| Champ | Description | Exemple |
|-------|-------------|---------|
| **titre** | Titre de l'album | `"Match U12 contre Villefranche"` |
| **description** | Description courte | `"Belle victoire de nos U12"` |
| **date** | Date au format AAAA-MM-JJ | `"2025-12-20"` |
| **mainImage** | URL de votre photo principale | L'URL que vous avez copiée à l'étape 4.1 |
| **storageUrl** | URL du dossier (sans le nom de fichier) | L'URL que vous avez notée à l'étape 4.2 |
| **categorie** | Catégorie de l'album | `"matches"`, `"entrainements"`, `"evenements"`, ou `"equipes"` |
| **alt** | Texte alternatif pour l'accessibilité | `"Match U12 contre Villefranche - 20 décembre 2025"` |

### 4.6 Vérifier la syntaxe

⚠️ **Important :**
- **Virgules :** Chaque album doit être séparé par une virgule `,`
- **Dernier album :** Le dernier album **ne doit PAS** avoir de virgule après
- **Guillemets :** Tous les textes doivent être entre guillemets `""`
- **Accolades :** Vérifiez que toutes les `{` sont fermées par `}`

💡 **Astuce :** GitHub affiche le fichier avec coloration syntaxique qui aide à repérer les erreurs.

### 4.7 Valider les modifications

1. **Descendez** en bas de la page GitHub

2. Dans la section **"Commit changes"** :
   - **Titre du commit** : Entrez un message court décrivant votre ajout
     - Exemple : `Ajout galerie : Match U12 contre Villefranche`
   - **Description** (optionnel) : Vous pouvez ajouter plus de détails si nécessaire

3. Laissez l'option **"Commit directly to the `main` branch"** sélectionnée

4. Cliquez sur le bouton vert **"Commit changes"**

---

## 🚀 Étape 5 : Vérifier la publication

### 5.1 Déploiement automatique

Une fois que vous avez cliqué sur "Commit changes", le site se met à jour **automatiquement**.

⏱️ **Temps d'attente :** 2 à 5 minutes

### 5.2 Suivre le déploiement (optionnel)

Pour voir la progression du déploiement :

1. Sur la page GitHub du projet, cliquez sur l'onglet **"Actions"** (en haut)

2. Vous verrez une ligne avec votre message de commit et une icône :
   - 🟡 **Point orange** = En cours de déploiement
   - ✅ **Coche verte** = Déploiement réussi
   - ❌ **Croix rouge** = Erreur (contactez l'administrateur)

3. Cliquez sur la ligne pour voir les détails du déploiement

### 5.3 Vérifier sur le site

Une fois le déploiement terminé (coche verte) :

1. **Ouvrez** le site dans votre navigateur : [https://ovalsaone.com](https://ovalsaone.com)

2. **Rafraîchissez** la page (F5 ou Ctrl+R)

3. **Vérifiez** que :
   - ✅ Votre nouvel album apparaît dans la galerie
   - ✅ La photo principale s'affiche correctement
   - ✅ En cliquant sur l'album, toutes vos photos se chargent dans le carrousel
   - ✅ Le filtre de catégorie fonctionne correctement

---

## 🎨 Les catégories disponibles

Choisissez la catégorie qui correspond le mieux à votre album :

| Catégorie | Code à utiliser | Description |
|-----------|----------------|-------------|
| **Matchs** | `"matches"` | Photos de matchs officiels |
| **Entraînements** | `"entrainements"` | Photos des séances d'entraînement |
| **Événements** | `"evenements"` | Barbecues, fêtes, tournois amicaux |
| **Équipes** | `"equipes"` | Photos de groupe, portraits d'équipe |

---

## 🆘 Problèmes courants

### ❌ Mes photos ne s'affichent pas

**Vérifiez :**
1. Les URLs dans `gallery.json` sont correctes (copiées depuis Azure Storage Explorer)
2. Les photos ont bien été téléchargées dans Azure (vérifiez dans Storage Explorer)
3. Le fichier `gallery.json` n'a pas d'erreur de syntaxe (pas de virgule manquante)

### ❌ Erreur lors du commit sur GitHub

**Message :** "Invalid JSON" ou erreur de syntaxe

**Solution :** Il y a probablement une erreur de syntaxe dans `gallery.json`
- Vérifiez que chaque `{` a son `}`
- Vérifiez les virgules entre les albums
- Vérifiez que tous les champs ont des guillemets
- Utilisez un validateur JSON en ligne : [https://jsonlint.com](https://jsonlint.com)

### ❌ Le site ne se met pas à jour

**Solution :**
1. Vérifiez que le commit a bien été effectué (visible dans l'historique GitHub)
2. Vérifiez l'onglet "Actions" sur GitHub pour voir si le déploiement a réussi
3. Attendez 3-5 minutes que le déploiement automatique se termine
4. Videz le cache de votre navigateur (Ctrl+F5 ou Cmd+Shift+R)

### ❌ "Accès refusé" dans Azure Storage Explorer

**Solution :** Contactez l'administrateur pour obtenir les bons identifiants de connexion.

---

## 📞 Besoin d'aide ?

Si vous rencontrez un problème :

1. **Vérifiez** que vous avez suivi toutes les étapes dans l'ordre
2. **Relisez** la section "Problèmes courants" ci-dessus
3. **Vérifiez** l'onglet "Actions" sur GitHub pour voir les erreurs de déploiement
4. **Contactez** l'administrateur du site en fournissant :
   - Le message d'erreur exact (si affiché)
   - L'étape où vous êtes bloqué
   - Une capture d'écran si possible
   - Le lien du commit GitHub si disponible

---

## ✅ Checklist complète

Avant de publier, vérifiez que :

- [ ] Vos photos sont optimisées (< 2 Mo chacune)
- [ ] Vous avez créé un dossier avec un nom clair
- [ ] Les photos sont téléchargées dans Azure Storage
- [ ] L'URL de la photo principale est correcte
- [ ] L'URL du dossier est correcte (sans nom de fichier)
- [ ] Vous avez modifié `gallery.json` sur GitHub
- [ ] Tous les champs sont remplis (titre, description, date, etc.)
- [ ] La syntaxe JSON est correcte (pas d'erreur visible)
- [ ] Vous avez fait "Commit changes" sur GitHub
- [ ] Le déploiement automatique est terminé (coche verte dans Actions)
- [ ] Vous avez vérifié le site en ligne

---

## 🎉 Félicitations !

Vous savez maintenant comment ajouter des photos à la galerie du site !

**Récapitulatif :**
1. ✅ Préparer vos photos
2. ✅ Se connecter à Azure Storage Explorer
3. ✅ Télécharger vos photos dans Azure
4. ✅ Modifier `gallery.json` sur GitHub
5. ✅ Vérifier la publication automatique

**Temps nécessaire :** 10-15 minutes une fois que vous maîtrisez le processus.

**Avantages de cette méthode :**
- 🌐 Modifiable depuis n'importe quel ordinateur avec un navigateur
- 🔒 Historique complet des modifications sur GitHub
- 🚀 Déploiement automatique sans commandes techniques
- ✅ Pas besoin d'installer Git ou VS Code localement

---

**Date de création :** 14 décembre 2025  
**Dernière mise à jour :** 14 décembre 2025
