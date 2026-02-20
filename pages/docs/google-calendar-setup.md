# Configuration des calendriers Google Calendar

Ce guide explique comment créer et configurer des calendriers Google Calendar publics pour les équipes d'Oval Saône Rugby et récupérer les informations nécessaires pour les afficher sur la page des événements.

## Vue d'ensemble

La page des événements (`src/evenements.liquid`) affiche les calendriers publics Google Calendar de chaque équipe. Les informations de configuration sont stockées dans `src/_data/calendars.json` et comprennent :

- `apiKey` : Clé API Google pour accéder à l'API Google Calendar
- `teams` : Liste des équipes avec leurs calendriers respectifs
  - `name` : Nom de l'équipe (ex: "U6", "U8", "U10")
  - `calendarId` : Identifiant unique du calendrier (utilisé par l'API Google Calendar pour afficher les événements)
  - `icsUrl` : URL du calendrier au format iCal (utilisée avec le protocole `webcal://` pour permettre l'abonnement depuis n'importe quelle app calendrier)

## Étape 1 : Créer un calendrier Google Calendar

À faire pour chaque équipe

### 1.1 Accéder à Google Calendar

1. Connectez-vous à votre compte Google
2. Accédez à [Google Calendar](https://calendar.google.com)

### 1.2 Créer un nouveau calendrier

1. Dans le panneau de gauche, cliquez sur le **+** à côté de "Autres agendas"
2. Sélectionnez **"Créer un agenda"**
3. Remplissez les informations :
   - **Nom** : Nom de l'équipe (ex: "Oval Saône U10")
   - **Description** : Description optionnelle (ex: "Calendrier des matchs et entraînements de l'équipe U10")
   - **Fuseau horaire** : Europe/Paris
4. Cliquez sur **"Créer un agenda"**

### 1.3 Rendre le calendrier public

1. Dans la liste des calendriers (panneau de gauche), survolez le calendrier créé
2. Cliquez sur l'agenda sur l'agenda, puis dans le sous-menu, cliquez sur **"Autorisations d'accès aux événements"**
3. Faites défiler jusqu'à la section **"Autorisations d'accès aux événements"**
4. Cochez la case **"Rendre disponible publiquement"**
5. **Important** : Assurez-vous que l'option est bien définie sur **"Voir tous les détails des événements"**
6. Cliquez sur **"OK"** pour confirmer l'avertissement de confidentialité

## Étape 2 : Récupérer les informations du calendrier

### 2.1 Récupérer le `calendarId`

Toujours dans les paramètres du calendrier :

1. Faites défiler jusqu'à la section **"Intégrer l'agenda"**
2. Dans la section **"Adresse de l'agenda dans un format iCal"**, vous trouverez une URL ressemblant à :
   ```
   https://calendar.google.com/calendar/ical/[CALENDAR_ID]/public/basic.ics
   ```
3. Le `calendarId` est la partie entre `/ical/` et `/public/`
4. Exemple : 
   ```
   0746e3a0384eec71f24bfde5de57820e0784edeba1055b789bd2e0088d5ff927@group.calendar.google.com
   ```

> **Note** : Le `calendarId` se termine généralement par `@group.calendar.google.com` pour les calendriers créés manuellement.

### 2.2 Récupérer le `icsUrl`

1. Dans la section **"Adresse de l'agenda dans un format iCal"**, copiez l'URL complète
2. Le format est :
   ```
   https://calendar.google.com/calendar/ical/[CALENDAR_ID_URL_ENCODED]/public/basic.ics
   ```
3. Exemple d'URL iCal :
   ```
   https://calendar.google.com/calendar/ical/0746e3a0384eec71f24bfde5de57820e0784edeba1055b789bd2e0088d5ff927%40group.calendar.google.com/public/basic.ics
   ```

## Étape 3 : Obtenir une clé API Google Calendar

### 3.1 Créer un projet Google Cloud

1. Accédez à la [Console Google Cloud](https://console.cloud.google.com)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Nommez le projet (ex: "Oval Saône Rugby Website")

### 3.2 Activer l'API Google Calendar

1. Dans le menu de navigation, allez dans **"API et services"** > **"Bibliothèque"**
2. Recherchez **"Google Calendar API"**
3. Cliquez sur **"Google Calendar API"**
4. Cliquez sur **"Activer"**

### 3.3 Créer une clé API

1. Allez dans **"API et services"** > **"Identifiants"**
2. Cliquez sur **"+ CRÉER DES IDENTIFIANTS"** en haut
3. Sélectionnez **"Clé API"**
4. Une clé API sera générée (ex: `AIzaSyDDpMWcrT2VQlsLBc3O8QaPksTjSRo9tBQ`)
5. **Recommandé** : Cliquez sur **"Restreindre la clé"** pour sécuriser son utilisation :
   
   **Restrictions relatives aux applications** :
   - Sélectionnez **"Sites Web"**
   - Cliquez sur **"Add"** pour ajouter les sites Web autorisés :
     - `*.ovalsaone.fr/*` (pour le domaine de production)
     - `http://localhost:8002/*` (pour le développement avec Eleventy)
     - `https://*.ovalsaone.pages.dev/*` (pour les environnements de prévisualisation Cloudflare Pages)
   
   **Restrictions relatives aux API** :
   - Sélectionnez **"Restreindre la clé"**
   - Dans le menu déroulant, choisissez uniquement **"Google Calendar API"** (1 API)
   
6. Cliquez sur **"Enregistrer"**

> **Note** : Si ce champ est laissé vide dans les restrictions relatives aux sites Web, votre clé API acceptera les requêtes de n'importe quel site Web. Il est fortement recommandé de toujours spécifier les domaines autorisés.

## Étape 4 : Ajouter les informations au fichier `calendars.json`

Une fois toutes les informations récupérées, ajoutez-les au fichier `src/_data/calendars.json` :

```json
{
  "apiKey": "VOTRE_CLE_API_GOOGLE",
  "teams": [
    {
      "name": "U10",
      "calendarId": "votre_calendar_id@group.calendar.google.com",
      "icsUrl": "https://calendar.google.com/calendar/ical/calendar_id_url_encoded%40group.calendar.google.com/public/basic.ics"
    }
  ]
}
```

> **Note** : L'URL ICS est stockée en `https://` dans le fichier JSON. Le template Liquid la convertit automatiquement en `webcal://` pour déclencher l'abonnement dans l'app calendrier de l'utilisateur (Apple Calendar, Outlook, Google Calendar, etc.).