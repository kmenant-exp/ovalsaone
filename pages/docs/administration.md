# Guide d'administration du site Oval Saône

Ce guide explique comment mettre à jour le contenu du site web sans connaissances techniques avancées. Toutes les modifications se font en éditant des fichiers texte simples.

## Table des matières

1. [Prérequis](#prérequis)
2. [Accéder aux fichiers via GitHub](#accéder-aux-fichiers-via-github)
3. [Modifier les pages du site](#modifier-les-pages-du-site)
4. [Mettre à jour les données](#mettre-à-jour-les-données)
5. [Gérer les événements (Google Calendar)](#gérer-les-événements-google-calendar)
6. [Gérer la galerie photos](#gérer-la-galerie-photos)
7. [Ajouter ou modifier des images](#ajouter-ou-modifier-des-images)
8. [Publier les modifications](#publier-les-modifications)

---

## Prérequis

Pour mettre à jour le site, vous aurez besoin de :
- Un compte GitHub avec accès au repository du site
- Un navigateur web moderne
- Un accès au dashboard admin (Decap CMS) pour la galerie photos

**Note :** La majorité des modifications se font directement via l'interface web de GitHub, sans besoin d'installer d'outils sur votre ordinateur.

---

## Accéder aux fichiers via GitHub

L'administration du site se fait principalement via l'interface web de GitHub. Voici comment accéder aux fichiers :

### Se connecter au repository

1. Rendez-vous sur : https://github.com/laetitia-gente/ovalsaone
2. Connectez-vous avec votre compte GitHub
3. Assurez-vous d'avoir les droits d'écriture sur le repository

### Naviguer dans les fichiers

#### Fichiers des pages
- Page d'accueil : `src/index.liquid`
- Page contact : `src/contact.liquid`
- Page équipes : `src/equipes.liquid`
- Page école de rugby : `src/ecole.liquid`
- Page boutique : `src/boutique.liquid`
- Page événements : `src/evenements.liquid`
- Page inscription : `src/inscription.liquid`
- Page partenariat : `src/partenariat.liquid`

#### Fichiers de données
- Actualités : `src/_data/actualites.json`
- Équipes : `src/_data/teams.json`
- Sponsors : `src/_data/sponsors.json`
- Bureau : `src/_data/bureau.json`
- Entraîneurs : `src/_data/entraineurs.json`
- Calendriers : `src/_data/calendars.json`
- Contact : `src/_data/contact.json`
- Galerie : `src/_data/gallery.json`

#### Dossiers d'images
- `src/assets/` : Toutes les images du site
- `src/assets/sponsors/` : Logos des sponsors
- `src/assets/bureau/` : Photos du bureau
- `src/assets/entraineurs/` : Photos des entraîneurs
- `src/assets/actualites/` : Images des actualités

### Éditer un fichier dans GitHub

1. **Naviguez jusqu'au fichier** à modifier en cliquant sur les dossiers
2. **Cliquez sur le nom du fichier** pour l'ouvrir
3. **Cliquez sur l'icône crayon** (✏️) en haut à droite pour éditer
4. **Effectuez vos modifications** dans l'éditeur
5. **Prévisualisez vos modifications** avec l'onglet "Preview"
6. **Décrivez vos modifications** dans la section "Commit changes" en bas
7. **Cliquez sur "Commit changes"** pour sauvegarder

### Ajouter un nouveau fichier

1. **Naviguez jusqu'au dossier** où ajouter le fichier
2. **Cliquez sur "Add file"** puis "Create new file"
3. **Tapez le nom du fichier** (avec son extension)
4. **Ajoutez le contenu** dans l'éditeur
5. **Décrivez l'ajout** dans "Commit new file"
6. **Cliquez sur "Commit new file"**

### Télécharger des images

1. **Naviguez jusqu'au dossier** `src/assets/` (ou sous-dossier approprié)
2. **Cliquez sur "Add file"** puis "Upload files"
3. **Glissez-déposez vos images** ou cliquez sur "choose your files"
4. **Décrivez l'ajout** dans "Commit changes"
5. **Cliquez sur "Commit changes"**

**⚠️ Attention :** Respectez la structure des dossiers et les conventions de nommage.

---

## Modifier les pages du site

### Qu'est-ce que le Frontmatter ?

Chaque page du site commence par une section appelée **Frontmatter**, délimitée par trois tirets (`---`). Cette section contient les informations de base de la page.

**Exemple de Frontmatter :**

```yaml
---
layout: layout.njk
title: Nous contacter
description: Contactez l'Oval Saône Rugby Club
---
```

### Comment modifier le Frontmatter

1. **Naviguez vers le fichier** de la page à modifier sur GitHub :
   - Page d'accueil : `src/index.liquid`
   - Page contact : `src/contact.liquid`
   - Page équipes : `src/equipes.liquid`
   - Page école de rugby : `src/ecole.liquid`
   - Page boutique : `src/boutique.liquid`
   - Page événements : `src/evenements.liquid`
   - Page inscription : `src/inscription.liquid`
   - Page partenariat : `src/partenariat.liquid`

2. **Cliquez sur l'icône crayon** (✏️) pour éditer le fichier

3. **Modifiez les valeurs** entre les tirets (`---`)

   - `title` : Le titre de la page (affiché dans l'onglet du navigateur)
   - `description` : La description pour les moteurs de recherche
   - `layout` : **Ne pas modifier** (toujours `layout.njk`)

4. **Décrivez vos modifications** dans la section "Commit changes"
5. **Cliquez sur "Commit changes"** pour sauvegarder

**⚠️ Important :** Ne supprimez pas les lignes `---` et ne modifiez pas la ligne `layout: layout.njk`.

---

## Mettre à jour les données

Les données du site (équipes, sponsors, bureau, etc.) sont stockées dans des fichiers JSON situés dans le dossier `src/_data/`.

### Format JSON

Les fichiers JSON utilisent une structure simple avec des accolades `{}`, des crochets `[]`, et des virgules `,`.

**Règles importantes :**
- Chaque propriété est entre guillemets : `"nom": "valeur"`
- Les valeurs textuelles sont entre guillemets : `"Jean Dupont"`
- Les nombres n'ont pas de guillemets : `42`
- Les listes utilisent des crochets : `[item1, item2]`
- Chaque élément est séparé par une virgule `,`
- **Pas de virgule après le dernier élément**

### Fichiers de données disponibles

#### 1. `actualites.json` - Les actualités

```json
[
  {
    "titre": "Titre de l'actualité",
    "extrait": "Court résumé de l'actualité",
    "date": "2025-10-20",
    "image": "assets/actualites/image.jpg",
    "contenu": "Texte complet de l'actualité..."
  }
]
```

**Pour ajouter une actualité :**
1. Naviguez vers `src/_data/actualites.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Ajoutez un nouvel objet en haut de la liste
4. Remplissez les champs :
   - `titre` : Le titre de l'actualité
   - `extrait` : Un court résumé (affiché dans la liste)
   - `date` : La date au format `AAAA-MM-JJ`
   - `image` : Chemin de l'image (commence par `assets/`)
   - `contenu` : Le texte complet de l'actualité
5. Décrivez vos modifications et cliquez sur "Commit changes"

#### 2. `teams.json` - Les équipes

```json
[
  {
    "name": "U6",
    "description": "École de rugby pour les moins de 6 ans",
    "min_age": 3,
    "max_age": 5,
    "players_count": 15,
    "coaches": [
      {
        "name": "Prénom Nom"
      }
    ],
    "schedule": [
      {
        "day": "Samedi",
        "time": "10h00-11h00"
      }
    ]
  }
]
```

**Pour modifier une équipe :**
1. Naviguez vers `src/_data/teams.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Trouvez l'équipe à modifier
4. Changez les valeurs souhaitées :
   - `name` : Nom de la catégorie (U6, U8, U10, etc.)
   - `description` : Description de l'équipe
   - `min_age` / `max_age` : Tranche d'âge
   - `players_count` : Nombre de joueurs
   - `coaches` : Liste des entraîneurs (tableau d'objets avec `name`)
   - `schedule` : Horaires d'entraînement (tableau avec `day` et `time`)
5. Décrivez vos modifications et cliquez sur "Commit changes"

#### 3. `sponsors.json` - Les sponsors

```json
[
  {
    "nom": "Nom du sponsor",
    "logo": "/assets/sponsors/logo.png",
    "description": "Description de l'entreprise",
    "website": "https://www.exemple.com",
    "telephone": "01 23 45 67 89",
    "email": "contact@exemple.com",
    "adresse": "Adresse complète",
    "partenariat_depuis": 2021,
    "type": "partenaire"
  }
]
```

**Types disponibles :** `"sponsor_or"` (sponsor or), `"partenaire"` (partenaire)

**Pour ajouter un sponsor :**
1. Naviguez vers `src/_data/sponsors.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Ajoutez un nouvel objet dans la liste
4. Remplissez les champs :
   - `nom` : Nom de l'entreprise
   - `logo` : Chemin du logo (commence par `/assets/`)
   - `description` : Présentation de l'entreprise
   - `website` : Site web
   - `telephone` : Numéro de téléphone (optionnel)
   - `email` : Email de contact (optionnel)
   - `adresse` : Adresse (optionnel)
   - `partenariat_depuis` : Année de début du partenariat
   - `type` : `"sponsor_or"` ou `"partenaire"`
5. Décrivez vos modifications et cliquez sur "Commit changes"

#### 4. `bureau.json` - Les membres du bureau

```json
[
  {
    "nom": "DUPONT",
    "prenom": "Jean",
    "poste": "Président",
    "description": "Biographie et rôle du membre...",
    "photo": "/assets/bureau/default.jpg"
  }
]
```

**Pour modifier un membre du bureau :**
1. Naviguez vers `src/_data/bureau.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Trouvez le membre à modifier
4. Changez les valeurs :
   - `nom` : Nom de famille (en majuscules)
   - `prenom` : Prénom
   - `poste` : Fonction au bureau
   - `description` : Biographie et présentation du rôle
   - `photo` : Chemin de la photo (commence par `/assets/`)
5. Décrivez vos modifications et cliquez sur "Commit changes"

#### 5. `entraineurs.json` - Les entraîneurs

```json
[
  {
    "nom": "Martin",
    "prenom": "Marie",
    "categories": ["U12", "U14"],
    "experience": "Formation éducateur",
    "diplomes": [
      "Éducateur Rugby",
      "CQP Technicien Rugby"
    ],
    "photo": "/assets/entraineurs/default.jpg",
    "specialites": [
      "Stratégie de jeu",
      "Analyse technique"
    ]
  }
]
```

**Pour modifier un entraîneur :**
1. Naviguez vers `src/_data/entraineurs.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Trouvez l'entraîneur à modifier
4. Changez les valeurs :
   - `nom` : Nom de famille
   - `prenom` : Prénom
   - `categories` : Liste des catégories entraînées (ex: `["U8"]`)
   - `experience` : Description de l'expérience
   - `diplomes` : Liste des diplômes (tableau)
   - `photo` : Chemin de la photo
   - `specialites` : Liste des spécialités (tableau)
5. Décrivez vos modifications et cliquez sur "Commit changes"

#### 6. `calendars.json` - Les calendriers des équipes

```json
{
  "apiKey": "AIzaSyDDpMWcrT2VQlsLBc3O8QaPksTjSRo9tBQ",
  "teams": [
    {
      "name": "U6",
      "calendarId": "identifiant_calendrier@group.calendar.google.com",
      "icsUrl": "https://calendar.google.com/calendar/ical/...ics"
    }
  ]
}
```

**Pour ajouter un calendrier d'équipe :**
1. Naviguez vers `src/_data/calendars.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Dans la liste `teams`, ajoutez un nouvel objet
4. Remplissez les champs :
   - `name` : Nom de l'équipe (doit correspondre à `teams.json`)
   - `calendarId` : ID du calendrier Google (pour l'affichage des événements via l'API)
   - `icsUrl` : URL ICS du calendrier (pour l'abonnement des utilisateurs)
5. Décrivez vos modifications et cliquez sur "Commit changes"

**⚠️ Note :** Les URL proviennent de Google Calendar. Ne modifiez pas l'`apiKey` sans consulter l'équipe technique.

---

## Gérer les événements (Google Calendar)

Les événements du site sont synchronisés automatiquement depuis des calendriers publics Google Calendar. Chaque équipe possède son propre calendrier.

### Principe de fonctionnement

1. Vous créez ou modifiez des événements dans **Google Calendar**
2. Les événements sont automatiquement affichés sur la page **Événements** du site
3. Les visiteurs peuvent voir tous les événements ou filtrer par équipe
4. Les visiteurs peuvent également s'abonner aux calendriers

### Accéder aux calendriers Google

#### Méthode 1 : Via les liens dans le code

1. Ouvrez `src/_data/calendars.json`
2. Trouvez l'équipe concernée
3. Copiez l'URL dans le champ `calendarUrl`
4. Ouvrez cette URL dans votre navigateur

#### Méthode 2 : Depuis Google Calendar directement

1. Connectez-vous à Google Calendar : https://calendar.google.com
2. Dans la liste de gauche, cherchez les calendriers du club
3. Cliquez sur le calendrier de l'équipe souhaitée

### Ajouter un événement

1. **Ouvrez le calendrier** de l'équipe concernée dans Google Calendar
2. **Cliquez sur le jour** où aura lieu l'événement
3. **Remplissez les informations :**
   - **Titre** : Nom de l'événement (ex: "Match U10 vs Lyon")
   - **Date et heure** : Début et fin de l'événement
   - **Lieu** : Adresse du lieu (ex: "Stade Municipal, Trévoux")
   - **Description** : Détails supplémentaires (optionnel)
4. **Enregistrez**

**L'événement apparaîtra automatiquement sur le site dans les 5-10 minutes.**

### Modifier un événement

1. Ouvrez le calendrier dans Google Calendar
2. Cliquez sur l'événement à modifier
3. Cliquez sur l'icône **crayon** (éditer)
4. Modifiez les informations souhaitées
5. Enregistrez

### Supprimer un événement

1. Ouvrez le calendrier dans Google Calendar
2. Cliquez sur l'événement à supprimer
3. Cliquez sur l'icône **corbeille** (supprimer)
4. Confirmez la suppression

### Bonnes pratiques pour les événements

#### Nommage des événements

Utilisez un format cohérent pour les titres :
- **Matchs** : `Match [Équipe] vs [Adversaire]` (ex: "Match U12 vs Villefranche")
- **Entraînements** : `Entraînement [Équipe]` (ex: "Entraînement U8")
- **Tournois** : `Tournoi [Lieu]` (ex: "Tournoi de Trévoux")
- **Événements spéciaux** : `[Type] - [Description]` (ex: "Assemblée Générale", "Barbecue du club")

#### Informations obligatoires

Pour une bonne lisibilité sur le site, renseignez toujours :
- ✅ **Titre clair et descriptif**
- ✅ **Date et heure de début**
- ✅ **Date et heure de fin**
- ✅ **Lieu** (si applicable)

#### Informations optionnelles mais recommandées

- **Description** : Ajoutez des détails importants (équipement nécessaire, consignes, etc.)
- **Couleur** : Utilisez des couleurs pour différencier les types d'événements :
  - 🔵 Bleu : Matchs à domicile
  - 🔴 Rouge : Matchs à l'extérieur
  - 🟢 Vert : Entraînements
  - 🟡 Jaune : Événements spéciaux

### Créer un calendrier pour une nouvelle équipe

Si vous ajoutez une nouvelle équipe au club, suivez ces étapes :

#### Étape 1 : Créer le calendrier dans Google

1. Allez sur https://calendar.google.com
2. Dans le menu de gauche, cliquez sur **+** à côté de "Autres agendas"
3. Sélectionnez **Créer un agenda**
4. Remplissez les informations :
   - **Nom** : `Oval Saône - [Équipe]` (ex: "Oval Saône - U16")
   - **Description** : "Calendrier des matchs et entraînements [Équipe]"
5. Cliquez sur **Créer un agenda**

#### Étape 2 : Rendre le calendrier public

1. Dans la liste des calendriers, trouvez le nouveau calendrier
2. Cliquez sur les **3 points** à droite du nom
3. Sélectionnez **Paramètres et partage**
4. Faites défiler jusqu'à **Autorisations d'accès**
5. Cochez **Rendre disponible publiquement**
6. ⚠️ Assurez-vous que les visiteurs peuvent voir **tous les détails**

#### Étape 3 : Récupérer les informations du calendrier

1. Dans les **Paramètres et partage** du calendrier
2. Faites défiler jusqu'à **Intégrer l'agenda**
3. Copiez l'**ID de l'agenda** (format : `xxxxx@group.calendar.google.com`)
4. Notez également :
   - L'URL publique du calendrier
   - L'adresse iCal (URL se terminant par `.ics`)

#### Étape 4 : Ajouter le calendrier au site

1. Ouvrez `src/_data/calendars.json`
2. Dans la liste `teams`, ajoutez un nouvel objet :

```json
{
  "name": "U16",
  "calendarId": "xxxxx@group.calendar.google.com",
  "calendarUrl": "https://calendar.google.com/calendar/u/0?cid=xxxxx",
  "icsUrl": "https://calendar.google.com/calendar/ical/xxxxx@group.calendar.google.com/public/basic.ics"
}
```

3. Enregistrez et publiez (voir section [Publier les modifications](#publier-les-modifications))

### Résolution de problèmes

#### Les événements n'apparaissent pas sur le site

**Causes possibles :**
- Le calendrier n'est pas public → Vérifiez les paramètres de partage
- L'API Key est incorrecte → Contactez l'équipe technique
- Le `calendarId` est incorrect → Vérifiez dans `calendars.json`

**Solution :**
1. Vérifiez que le calendrier est bien public dans Google Calendar
2. Attendez 5-10 minutes après la création d'un événement
3. Videz le cache du navigateur (`Ctrl+F5` ou `Cmd+Shift+R`)

#### Les événements s'affichent dans le mauvais ordre

**Cause :** L'heure de début n'est pas correctement définie

**Solution :**
1. Ouvrez l'événement dans Google Calendar
2. Vérifiez que l'heure de début est correcte
3. Enregistrez les modifications

#### Un événement apparaît pour plusieurs équipes

**Cause :** L'événement a été ajouté au mauvais calendrier

**Solution :**
1. Supprimez l'événement du calendrier incorrect
2. Recréez-le dans le bon calendrier

#### 7. `contact.json` - Informations de contact

```json
{
  "address": "Stade CHAMALAN, Chemin de la passerelle, 69650 QUINCIEUX",
  "phone": "06 24 63 58 42",
  "email": "edr.ovalsaone@gmail.com"
}
```

**Pour modifier les informations de contact :**
1. Naviguez vers `src/_data/contact.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Modifiez directement les valeurs :
   - `address` : Adresse complète du club
   - `phone` : Numéro de téléphone
   - `email` : Email de contact
4. Décrivez vos modifications et cliquez sur "Commit changes"

#### 8. `gallery.json` - Configuration de la galerie

```json
[
  {
    "titre": "Tournoi de Trévoux",
    "description": "Nos jeunes en action",
    "date": "2025-10-10",
    "mainImage": "/assets/gallery/tournoi-trevoux-20251010/cover.jpg",
    "categorie": "matches",
    "alt": "Tournoi de Trévoux - 10 octobre 2025",
    "images": [
      "/assets/gallery/tournoi-trevoux-20251010/photo1.jpg",
      "/assets/gallery/tournoi-trevoux-20251010/photo2.jpg"
    ]
  }
]
```

**Pour ajouter un album :**
1. Naviguez vers `src/_data/gallery.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Ajoutez un nouvel objet dans la liste
4. Remplissez les champs :
   - `titre` : Titre de l'album
   - `description` : Description courte
   - `date` : Date au format `AAAA-MM-JJ`
   - `mainImage` : Chemin relatif de l'image de couverture (ex : `/assets/gallery/mon-album/cover.jpg`)
   - `categorie` : Catégorie de l'album (ex: `"matches"`, `"entrainements"`, `"evenements"`, `"équipes"`)
   - `alt` : Texte alternatif pour l'accessibilité
   - `images` : Liste des chemins des photos de l'album
5. Décrivez vos modifications et cliquez sur "Commit changes"

💡 **Astuce :** Utilisez plutôt le dashboard admin (Decap CMS) pour gérer la galerie plus facilement.

**Convention de nommage des dossiers :**
- Format : `evenement-lieu-AAAAMMJJ`
- Exemple : `tournoi-trevoux-20251010`
- Tout en minuscules, sans espaces ni accents

---

## Gérer la galerie photos

La galerie utilise des **images locales** stockées dans `src/assets/gallery/`. Les albums sont gérés via **Decap CMS** (dashboard admin) ou manuellement via GitHub.

### Méthode recommandée : Decap CMS

1. Connectez-vous au **dashboard admin** du site
2. Dans le menu, cliquez sur **« Galerie »**
3. Cliquez sur **« Ajouter un album »**
4. Remplissez les champs et uploadez vos photos
5. Cliquez sur **« Publish »**
6. Le site se reconstruit automatiquement (2-3 minutes)

📌 Voir le [guide d'ajout de photos](guide-ajout-photos.md) pour des instructions détaillées.

### Méthode alternative : via GitHub

#### Étape 1 : Ajouter les photos

1. Naviguez vers `src/assets/gallery/` sur GitHub
2. Créez un nouveau dossier (ex : `tournoi-nom-AAAAMMJJ`)
3. Uploadez vos photos dans ce dossier

**Convention de nommage des albums :**
- Format : `evenement-lieu-AAAAMMJJ`
- Exemple : `tournoi-trevoux-20251010`
- Tout en minuscules, sans espaces ni accents

#### Étape 2 : Déclarer l'album dans gallery.json

1. Naviguez vers `src/_data/gallery.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Ajoutez un nouvel objet dans la liste (voir structure dans la section précédente)
4. **Important** : Les chemins des images doivent correspondre aux fichiers uploadés dans `src/assets/gallery/`
5. Décrivez vos modifications et cliquez sur "Commit changes"

### Supprimer un album

1. Naviguez vers `src/_data/gallery.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Supprimez l'objet correspondant à l'album
4. Décrivez vos modifications et cliquez sur "Commit changes"
5. *Optionnel* : Supprimez le dossier correspondant dans `src/assets/gallery/`

### Modifier un album existant

1. Naviguez vers `src/_data/gallery.json` sur GitHub
2. Cliquez sur l'icône crayon (✏️) pour éditer
3. Trouvez l'album à modifier
4. Changez les valeurs souhaitées (`titre`, `description`, etc.)
5. Décrivez vos modifications et cliquez sur "Commit changes"

---

## Ajouter ou modifier des images

### Images des pages (logos, photos d'équipe, etc.)

1. **Naviguez vers le dossier approprié** sur GitHub :
   - Photos d'équipes : `src/assets/equipes/`
   - Logos de sponsors : `src/assets/sponsors/`
   - Photos du bureau : `src/assets/bureau/`
   - Photos d'entraîneurs : `src/assets/entraineurs/`
   - Actualités : `src/assets/actualites/`
   - Autres images : `src/assets/`

2. **Cliquez sur "Add file"** puis "Upload files"

3. **Glissez-déposez vos images** ou cliquez sur "choose your files"

4. **Référencez l'image** dans le fichier JSON correspondant :
   ```json
   "image": "/assets/equipes/seniors-masculins.jpg"
   ```

5. **Décrivez l'ajout** et cliquez sur "Commit changes"

**Formats recommandés :** JPG, PNG, WebP

**Taille recommandée :** Max 2 Mo par image

### Images de la galerie

Les images de la galerie se gèrent via le **dashboard admin (Decap CMS)** ou en ajoutant les fichiers dans `src/assets/gallery/` sur GitHub (voir section [Gérer la galerie photos](#gérer-la-galerie-photos)).

---

## Publier les modifications

Avec l'interface GitHub, vos modifications sont automatiquement publiées dès que vous cliquez sur "Commit changes".

### Processus automatique

1. **Effectuez vos modifications** via l'interface GitHub (édition de fichiers, ajout d'images, etc.)
2. **Cliquez sur "Commit changes"** avec un message descriptif
3. **GitHub déclenche automatiquement** le déploiement sur Cloudflare Pages
4. **Attendez 2-5 minutes** pour que les modifications apparaissent sur le site

### Vérifier la publication

1. Attendez 2-5 minutes après le commit
2. Visitez le site : https://www.ovalsaone.fr
3. Vérifiez que vos modifications sont visibles
4. Si besoin, rafraîchissez la page avec `Ctrl+F5` (Windows) ou `Cmd+Shift+R` (Mac)

### Suivre le déploiement

Vous pouvez suivre l'état du déploiement :

1. **Dans GitHub** : Rendez-vous dans l'onglet "Actions" du repository
2. **Dans Cloudflare** : Consultez le dashboard Cloudflare Pages pour voir les logs de déploiement

### Bonnes pratiques pour les commits

#### Messages de commit descriptifs

Utilisez des messages clairs qui décrivent vos modifications :
- ✅ "Ajout de l'actualité sur le tournoi de Trévoux"
- ✅ "Mise à jour des sponsors - ajout Entreprise XYZ"
- ✅ "Modification des horaires de l'équipe U12"
- ❌ "update"
- ❌ "modif"

#### Commits atomiques

Regroupez les modifications logiquement :
- Un commit par actualité ajoutée
- Un commit par sponsor ajouté
- Un commit pour toutes les modifications d'une même équipe

---

## Résolution de problèmes courants

### Erreur de syntaxe JSON

**Symptôme :** Le site ne se construit pas ou affiche une erreur dans l'onglet "Actions" de GitHub.

**Solution :**
- Vérifiez qu'il n'y a pas de virgule après le dernier élément d'une liste
- Vérifiez que toutes les accolades `{}` et crochets `[]` sont fermés
- Utilisez l'onglet "Preview" de GitHub lors de l'édition pour détecter les erreurs
- Utilisez un validateur JSON en ligne : https://jsonlint.com

### Les modifications ne sont pas visibles sur le site

**Symptôme :** Le site n'a pas changé après le commit.

**Solution :**
- Attendez 5-10 minutes (le déploiement peut prendre du temps)
- Vérifiez l'onglet "Actions" de GitHub pour voir si le déploiement s'est bien passé
- Videz le cache du navigateur (`Ctrl+F5` ou `Cmd+Shift+R`)
- Consultez les logs de déploiement dans le dashboard Cloudflare Pages

### Erreur lors du commit sur GitHub

**Symptôme :** Message d'erreur lors de la sauvegarde.

**Solution :**
- Vérifiez que vous avez les droits d'écriture sur le repository
- Assurez-vous d'avoir fourni un message de commit
- Actualisez la page et réessayez

### Les images ne s'affichent pas

**Symptôme :** Images cassées ou non visibles.

**Solution :**
- Vérifiez que le chemin est correct (commence par `/assets/`)
- Vérifiez que le nom du fichier correspond exactement (majuscules/minuscules)
- Vérifiez que l'image a bien été téléchargée dans le bon dossier sur GitHub
- Attendez quelques minutes après l'upload pour que l'image soit disponible

### La galerie ne charge pas les photos

**Symptôme :** Album vide ou erreur de chargement.

**Solution :**
- Vérifiez que les chemins dans `gallery.json` correspondent aux fichiers dans `src/assets/gallery/`
- Vérifiez que les images sont bien présentes dans le dossier
- Vérifiez le format des images (JPG, PNG)

---

## Aide supplémentaire

Pour plus d'informations techniques :
- **Guide de développement :** `docs/guide-developpement.md`
- **Guide de maintenance :** `docs/guide-maintenance.md`
- **Architecture de la galerie :** `docs/gallery-architecture.md`

**Contact technique :** Si vous rencontrez des problèmes, contactez l'équipe technique du club.

---

*Dernière mise à jour : 15 juin 2025*
