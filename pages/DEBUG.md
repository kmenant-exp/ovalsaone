# Lancement du projet en mode debug

## Solutions de debug disponibles

### 1. Via VS Code Debug (Recommandé)

1. Ouvrez VS Code dans le dossier du projet
2. Allez dans le panneau Debug (Ctrl+Shift+D)
3. Sélectionnez "Start Static Web App" dans la liste déroulante
4. Cliquez sur le bouton de lancement (▶️)

Le projet se lancera sur `http://127.0.0.1:4280`

### 2. Via le terminal

```bash
# Installer les dépendances si ce n'est pas fait
npm install

# Lancer le projet
npm run dev
```

### 3. Via les tâches VS Code

1. Ouvrez la palette de commandes (Cmd+Shift+P)
2. Tapez "Tasks: Run Task"
3. Sélectionnez "Start SWA CLI"

## Debug de l'API .NET

Pour débugger l'API .NET Functions :

1. Lancez d'abord SWA avec une des méthodes ci-dessus
2. Dans VS Code Debug, sélectionnez "Attach to .NET Functions"
3. Sélectionnez le processus `func` dans la liste

## Ports utilisés

- **4280** : Application complète (SWA + API)
- **7071** : API Functions (automatiquement lancée par SWA)

## Problèmes courants

### Port déjà utilisé
Si vous obtenez une erreur "Port already in use" :
```bash
# Tuer tous les processus SWA/Functions en cours
pkill -f swa && pkill -f func
```

### Problème de résolution localhost
La configuration utilise `127.0.0.1` au lieu de `localhost` pour éviter les problèmes de résolution DNS.

### API non disponible
Si l'API ne répond pas :
1. Vérifiez que .NET SDK est installé : `dotnet --version`
2. Compilez l'API manuellement : `npm run build:api`
3. Relancez le projet

## URLs d'accès

- **Application** : http://127.0.0.1:4280
- **API Direct** : http://localhost:7071/api/
- **Contact API** : http://localhost:7071/api/Contact
- **Inscription API** : http://localhost:7071/api/Inscription
