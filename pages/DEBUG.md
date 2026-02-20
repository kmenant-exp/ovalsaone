# Lancement du projet en mode debug

## Solutions de debug disponibles

### 1. Via le terminal (Recommandé)

```bash
# Installer les dépendances si ce n'est pas fait
cd pages
npm install

# Build Eleventy + lancer Wrangler Pages dev
npm run dev:pages
```

Le site sera accessible sur `http://localhost:8788` avec les Pages Functions actives.

### 2. Build seul (sans serveur)

```bash
# Générer le site statique dans _site/
npm run build
```

## Debug des Pages Functions (API)

Les Pages Functions TypeScript sont dans `functions/api/`. Pour les déboguer :

1. Lancez `npm run dev:pages` — Wrangler affiche les logs des fonctions dans le terminal
2. Ouvrez les DevTools du navigateur (onglet Network) pour inspecter les requêtes
3. Les erreurs des fonctions apparaissent directement dans la console Wrangler

## Ports utilisés

- **8788** : Application complète (site statique + Pages Functions via Wrangler)

## Problèmes courants

### Port déjà utilisé
Si vous obtenez une erreur "Port already in use" :
```bash
# Tuer les processus Wrangler en cours
pkill -f wrangler
```

### Données ou styles obsolètes
Si le contenu semble périmé :
```bash
rm -rf _site && npm run build
```

### API non disponible
Si les endpoints `/api/*` ne répondent pas :
1. Vérifiez que les fichiers TypeScript dans `functions/api/` compilent sans erreur
2. Consultez la sortie du terminal Wrangler pour les logs d'erreur
3. Vérifiez que `wrangler.toml` est correctement configuré

### Emails non envoyés en local
La variable `RESEND_API_KEY` n'est pas disponible en local par défaut. La fonction retourne une erreur 500 descriptive. Pour tester l'envoi réel, ajoutez le secret dans un fichier `.dev.vars` :
```
RESEND_API_KEY=re_votre_cle_api
```

### Turnstile ignoré en dev
La vérification Turnstile est automatiquement ignorée quand `TURNSTILE_SECRET_KEY` n'est pas défini (mode développement).

## URLs d'accès

- **Site complet** : http://localhost:8788
- **Contact API** : http://localhost:8788/api/contact
- **Convocation API** : http://localhost:8788/api/convocation
