# Intégration Google Maps pour les Événements

## Vue d'ensemble

Les adresses des événements (tournois, matchs, etc.) affichées sur le site sont désormais cliquables et s'ouvrent directement dans Google Maps. Sur mobile, cela lance automatiquement l'application de navigation.

## Implémentation

### Architecture JavaScript

Le code utilise un **namespace global** (`window.CalendarUtils`) au lieu de modules ES6 pour éviter les problèmes de compatibilité avec le système de bundling Eleventy qui concatène tous les scripts en un seul fichier `bundle.js`.

### Modification JavaScript

Dans [src/js/calendar-utils.js](../src/js/calendar-utils.js), les fonctions sont exposées via le namespace global :

```javascript
// Namespace global pour éviter les conflits
window.CalendarUtils = window.CalendarUtils || {};

// Fonction pour générer le lien Google Maps
window.CalendarUtils.createEventCard = function(event, isUpcoming = true) {
    // ...
    
    // Génère le lien Google Maps pour l'adresse
    let locationHtml = '';
    if (event.location) {
        const encodedLocation = encodeURIComponent(event.location);
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedLocation}`;
        locationHtml = `<a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="event-location">
            <span class="location-icon">📍</span>${event.location}
        </a>`;
    }
    // ...
};
```

Les fichiers [src/js/tournaments.js](../src/js/tournaments.js) et [src/js/evenements.js](../src/js/evenements.js) utilisent ensuite ces fonctions via `window.CalendarUtils.*` au lieu d'imports ES6.

### Format du lien

Le lien utilise l'API Google Maps Search avec le format :
```
https://www.google.com/maps/search/?api=1&query=[adresse encodée]
```

Ce format :
- Fonctionne sur tous les appareils (desktop, mobile, tablette)
- Ouvre l'application Google Maps sur mobile si installée
- Sinon, ouvre Google Maps dans le navigateur web
- Encode correctement les caractères spéciaux et espaces dans l'adresse

### Styles CSS

Dans [src/css/components/calendar-event.css](../src/css/components/calendar-event.css), les styles suivants ont été ajoutés :

```css
.event-location {
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    color: #666;
    transition: color 0.2s ease;
    gap: 0.25rem;
}

.event-location:hover {
    color: var(--primary-color);
    text-decoration: underline;
}

.location-icon {
    font-size: 1em;
}
```

## Fonctionnalités

### Sur Desktop
- Clic sur l'adresse → ouverture de Google Maps dans un nouvel onglet
- Survol de l'adresse → changement de couleur et soulignement

### Sur Mobile
- Tap sur l'adresse → ouverture de l'app Google Maps (si installée)
- Sinon → ouverture de Google Maps dans le navigateur mobile
- Navigation directe vers le lieu

## Pages concernées

Cette fonctionnalité s'applique à toutes les pages qui affichent des événements :

- **Page d'accueil** ([src/index.liquid](../src/index.liquid)) - Section tournois
- **Page événements** ([src/evenements.liquid](../src/evenements.liquid)) - Tous les événements

## Données sources

Les adresses proviennent des calendriers Google Calendar configurés dans [src/_data/calendars.json](../src/_data/calendars.json). Le champ `location` des événements Google Calendar est automatiquement récupéré et transformé en lien.

## Accessibilité

- Attribut `rel="noopener noreferrer"` pour la sécurité lors de l'ouverture dans un nouvel onglet
- Icône 📍 visuelle pour identifier rapidement les liens de localisation
- Transition douce au survol pour un retour visuel clair

## Test

Pour tester localement :

```bash
# Lancer le serveur de développement avec l'API
npm run start:swa

# Ou juste le frontend
npm run start
```

Puis accéder à :
- http://localhost:8002 (Eleventy seul)
- http://127.0.0.1:4280 (SWA CLI avec API)

Vérifier que les adresses des événements :
1. Sont cliquables
2. Affichent une icône 📍
3. Changent de couleur au survol
4. Ouvrent Google Maps dans un nouvel onglet

### Exemple visuel

Voici à quoi ressemble un événement avec l'adresse cliquable :

```html
<!-- Avant (texte simple) -->
<span class="event-location">Stade Municipal, 69000 Lyon</span>

<!-- Après (lien cliquable) -->
<a href="https://www.google.com/maps/search/?api=1&query=Stade%20Municipal%2C%2069000%20Lyon" 
   target="_blank" 
   rel="noopener noreferrer" 
   class="event-location">
    <span class="location-icon">📍</span>Stade Municipal, 69000 Lyon
</a>
```

### Test sur mobile

Pour tester sur mobile :
1. Déployez sur Azure Static Web Apps ou utilisez un tunnel (ngrok, cloudflared)
2. Ouvrez le site sur votre smartphone
3. Tapez sur une adresse d'événement
4. Vérifiez que Google Maps s'ouvre (application native si installée, sinon navigateur)
5. Vérifiez que l'itinéraire peut être lancé directement

## Notes techniques

### Encodage des caractères

La fonction `encodeURIComponent()` est utilisée pour encoder correctement l'adresse avant de l'ajouter à l'URL. Cela permet de gérer :
- Les espaces
- Les caractères accentués
- Les caractères spéciaux (virgules, points, etc.)

### Compatibilité

Le format d'URL utilisé est compatible avec :
- Tous les navigateurs modernes (Chrome, Firefox, Safari, Edge)
- iOS Safari et Android Chrome
- Applications Google Maps natives sur iOS et Android

### Sécurité

- `target="_blank"` : ouvre dans un nouvel onglet
- `rel="noopener noreferrer"` : empêche les vulnérabilités liées à `window.opener` et masque le référent

## Dépannage

### Erreur "Uncaught SyntaxError: Unexpected token 'export'"

**Cause** : Les scripts utilisaient des modules ES6 (`export`/`import`) mais étaient concaténés sans être chargés comme modules.

**Solution** : Les modules ES6 ont été convertis en fonctions globales utilisant le namespace `window.CalendarUtils` pour maintenir la compatibilité avec le système de bundling Eleventy.

### Les liens Google Maps ne fonctionnent pas

Vérifiez que :
1. Le champ `location` existe dans les événements Google Calendar
2. Le bundle JavaScript est bien chargé (`/bundle.js`)
3. `window.CalendarUtils` est défini dans la console du navigateur
4. Aucune erreur JavaScript n'est affichée dans la console

### L'icône 📍 ne s'affiche pas

Vérifiez que :
1. Le fichier CSS `calendar-event.css` est bien inclus dans `css-bundle.njk`
2. Le build CSS a été exécuté (`npm run build`)
3. Les styles `.event-location` et `.location-icon` sont présents dans `/css-bundle.css`
