# Déploiement Azure avec Azure Developer CLI (azd)

## 📋 Prérequis

1. **Azure Developer CLI (azd)** installé
   ```bash
   # macOS
   brew tap azure/azd && brew install azd
   
   # Windows
   winget install microsoft.azd
   
   # Linux
   curl -fsSL https://aka.ms/install-azd.sh | bash
   ```

2. **Azure CLI** installé (optionnel mais recommandé)
   ```bash
   # macOS
   brew install azure-cli
   ```

3. **Compte Azure** avec les permissions nécessaires

## 🚀 Déploiement initial

### 1. Se connecter à Azure

```bash
azd auth login
```

### 2. Initialiser l'environnement

```bash
# Créer un nouvel environnement (ex: dev, prod, staging)
azd env new <nom-environnement>

# Exemple:
azd env new ovalsaone-prod
```

### 3. Configurer le Storage Account existant

```bash
# Nom du Storage Account existant (obligatoire)
azd env set AZURE_STORAGE_ACCOUNT_NAME "stovalsaoneprd"

# Optionnel: si le Storage Account est dans un autre Resource Group
azd env set AZURE_STORAGE_RESOURCE_GROUP "rg-ovalsaone-existing"
```

### 4. Configurer les variables d'environnement SMTP

```bash
# Configurer Gmail SMTP
azd env set SMTP_USER "votre-email@gmail.com"
azd env set SMTP_PASS "votre-mot-de-passe-application"
azd env set SMTP_FROM "votre-email@gmail.com"
azd env set NOTIFICATION_EMAILS "admin@club.fr;coach@club.fr"

# Optionnel: choisir la région Azure
azd env set AZURE_LOCATION "francecentral"

# Obligatoire: Storage Account existant
azd env set AZURE_STORAGE_ACCOUNT_NAME "stovalsaoneprd"
```

### 5. Provisionner l'infrastructure et déployer

```bash
# Tout en une commande
azd up

# Ou séparément:
azd provision  # Crée les ressources Azure
azd deploy     # Déploie le code
```

## 🔄 Déploiements suivants

Pour les déploiements après le premier :

```bash
# Déployer uniquement le code (pas de changement d'infrastructure)
azd deploy

# Ou tout redéployer (infrastructure + code)
azd up
```

## 📦 Ressources créées

L'infrastructure Bicep crée automatiquement :

| Ressource | Description |
|-----------|-----------⚠️ **Utilise l'existant** (via `AZURE_STORAGE_ACCOUNT_NAME`) |
| **App Service Plan** | `asp-<environment-name>` (Y1 Consumption) |
| **Application Insights** | `appi-<environment-name>` |
| **Log Analytics** | `log-<environment-name>` |

> **Note :** Le Storage Account et la table `Convocations` doivent déjà exister. Le déploiement les référence sans les créer.`Convocations` |
| **App Service Plan** | `asp-<environment-name>` (Y1 Consumption) |
| **Application Insights** | `appi-<environment-name>` |
| **Log Analytics** | `log-<environment-name>` |

## 🔧 Configuration post-déploiement

### Vérifier les variables d'environnement

```bash
# Lister toutes les variables
azd env get-values

# Voir une variable spécifique
azd env get-value AZURE_FUNCTION_APP_NAME
```

### Mettre à jour les paramètres SMTP dans le portail Azure

Si vous préférez configurer via le portail :

1. Aller dans le portail Azure
2. Trouver votre Function App : `func-<environment-name>`
3. **Configuration** → **Application settings**
4. Modifier :
   - `SMTP_USER`
   - `SMTP_PASS`
   - `SMTP_FROM`
   - `NOTIFICATION_EMAILS`

### Tester la fonction déployée

```bash
# Récupérer l'URL de la fonction
FUNCTION_URL=$(azd env get-value AZURE_FUNCTION_APP_URL)

# Tester l'endpoint HTTP
curl "$FUNCTION_URL/api/TestNotification"
```

## 📊 Monitoring et logs

### Voir les logs en temps réel

```bash
# Logs de la fonction
azd monitor --logs

# Ou via Azure CLI
az functionapp log tail --name func-<environment-name> --resource-group rg-<environment-name>
```

### Ouvrir Application Insights

```bash
azd monitor
```

### Voir les métriques dans le portail

```bash
# Ouvrir le portail Azure sur la Function App
azd show
```

## 🗑️ Supprimer les ressources

Pour supprimer complètement l'environnement :

```bash
# Supprimer toutes les ressources Azure
azd down

# Ou supprimer avec confirmation
azd down --force --purge
```

## 🔐 Sécurité : Mot de passe d'application Gmail

Pour `SMTP_PASS`, **n'utilisez jamais votre mot de passe Gmail principal**.

1. Activez la **vérification en deux étapes** : [myaccount.google.com/signinoptions/two-step-verification](https://myaccount.google.com/signinoptions/two-step-verification)
2. Générez un **mot de passe d'application** : [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Utilisez ce mot de passe à 16 caractères dans `SMTP_PASS`

## 📝 Structure des fichiers azd

```
functions/EventNotificationFunction/
├── azure.yaml                    # Configuration azd principale
├── infra/
│   ├── main.bicep               # Point d'entrée Bicep
│   ├── resources.bicep          # Définition des ressources Azure
│   └── main.parameters.json     # Paramètres pour Bicep
└── .azure/
    └── <env-name>/
        └── .env                 # Variables d'environnement (gitignored)
```

## 🆘 Dépannage

### Erreur : "SMTP credentials not configured"

Les variables SMTP ne sont pas définies. Configurez-les :

```bash
azd env set SMTP_USER "your-email@gmail.com"
azd env set SMTP_PASS "your-app-password"
azd env set SMTP_FROM "your-email@gmail.com"
azd env set NOTIFICATION_EMAILS "email1@example.com;email2@example.com"

# Puis redéployez pour appliquer les changements
azd deploy
```

### Erreur : "The listener for function 'WeeklyNotification' was unable to start"

Le Timer Trigger nécessite un Storage Account. Vérifiez que `AzureWebJobsStorage` est bien configuré.

### Voir les logs détaillés

```bash
# Logs détaillés lors du déploiement
azd deploy --debug

# Logs de provisioning
azd provision --debug
```

## 📚 Ressources

- [Azure Developer CLI Documentation](https://learn.microsoft.com/azure/developer/azure-developer-cli/)
- [Azure Functions Documentation](https://learn.microsoft.com/azure/azure-functions/)
- [Bicep Documentation](https://learn.microsoft.com/azure/azure-resource-manager/bicep/)
