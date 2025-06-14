# Guide de Déploiement sur Azure Static Web Apps

## Sommaire
1. [Introduction](#introduction)
2. [Prérequis](#prérequis)
3. [Configuration Azure](#configuration-azure)
4. [Configuration GitHub Actions](#configuration-github-actions)
5. [Déploiement Initial](#déploiement-initial)
6. [Déploiements Continus](#déploiements-continus)
7. [Configuration Avancée](#configuration-avancée)
8. [Résolution des Problèmes](#résolution-des-problèmes)

## Introduction

Ce guide explique comment déployer le site web Oval Saône sur Azure Static Web Apps. Il couvre la configuration initiale, l'intégration avec GitHub Actions pour le déploiement continu, et les bonnes pratiques pour maintenir le site en production.

## Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Un compte Azure** avec un abonnement actif
2. **Un dépôt GitHub** contenant le code du site
3. **Les droits d'administration** sur le dépôt GitHub et l'abonnement Azure
4. **Azure CLI** installé localement (optionnel pour les déploiements manuels)

## Configuration Azure

### Création d'une Ressource Azure Static Web Apps

1. **Accéder au portail Azure** :
   - Connectez-vous à [portal.azure.com](https://portal.azure.com)
   - Recherchez "Static Web Apps" dans la barre de recherche

2. **Créer une nouvelle ressource** :
   - Cliquez sur "Créer"
   - Sélectionnez votre abonnement
   - Créez ou sélectionnez un groupe de ressources
   - Nommez votre application (ex: "oval-saone-web")
   - Sélectionnez une région proche (ex: "West Europe")

3. **Configurer la source du code** :
   - Plan : Free (ou Standard pour plus de fonctionnalités)
   - Source de déploiement : GitHub
   - Organisation GitHub : Votre organisation
   - Dépôt : kme-rugby-aswapp
   - Branche : main

4. **Configurer les détails de build** :
   - Type de build : Custom
   - Emplacement de l'application : / (racine)
   - Emplacement de l'API : api
   - Emplacement de sortie : . (racine)

5. **Finaliser la création** :
   - Cliquez sur "Vérifier + créer"
   - Cliquez sur "Créer"

### Configuration des Variables d'Environnement

1. **Accéder aux paramètres d'application** :
   - Allez dans votre ressource Static Web App
   - Cliquez sur "Configuration" dans le menu de gauche
   - Cliquez sur "Ajouter" pour chaque variable

2. **Ajouter les variables d'environnement** :
   ```
   SMTP_HOST=votre-serveur-smtp.com
   SMTP_PORT=587
   SMTP_USERNAME=votre-email@exemple.com
   SMTP_PASSWORD=votre-mot-de-passe
   EMAIL_FROM=no-reply@votre-domaine.com
   EMAIL_TO=contact@votre-domaine.com
   ```

3. **Sauvegarder les changements** :
   - Cliquez sur "Enregistrer"

## Configuration GitHub Actions

Lors de la création de votre ressource Azure Static Web App, un workflow GitHub Actions est automatiquement ajouté à votre dépôt.

### Vérification du Workflow

1. **Accéder au fichier de workflow** :
   - Allez dans votre dépôt GitHub
   - Accédez à `.github/workflows/`
   - Vous devriez voir un fichier comme `azure-static-web-apps-*.yml`

2. **Structure du workflow** :
   ```yaml
   name: Azure Static Web Apps CI/CD

   on:
     push:
       branches:
         - main
     pull_request:
       types: [opened, synchronize, reopened, closed]
       branches:
         - main

   jobs:
     build_and_deploy_job:
       if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
       runs-on: ubuntu-latest
       name: Build and Deploy
       steps:
         - uses: actions/checkout@v2
         - name: Build And Deploy
           id: builddeploy
           uses: Azure/static-web-apps-deploy@v1
           with:
             azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
             repo_token: ${{ secrets.GITHUB_TOKEN }}
             app_location: "/"
             api_location: "api"
             output_location: "."
   ```

### Personnalisation du Workflow (si nécessaire)

Si vous devez personnaliser le workflow, vous pouvez modifier le fichier YAML :

1. **Ajouter des étapes de build supplémentaires** :
   ```yaml
   steps:
     - uses: actions/checkout@v2
     
     - name: Setup .NET
       uses: actions/setup-dotnet@v1
       with:
         dotnet-version: '8.0.x'
     
     - name: Build API
       run: |
         cd api
         dotnet build --configuration Release
     
     - name: Build And Deploy
       id: builddeploy
       uses: Azure/static-web-apps-deploy@v1
       with:
         # ... configuration existante
   ```

2. **Ajouter des environnements de déploiement** :
   ```yaml
   jobs:
     build_and_deploy_job:
       environment: production
       # ... configuration existante
   ```

## Déploiement Initial

Une fois la ressource Azure Static Web App créée et le workflow GitHub Actions configuré :

1. **Le déploiement initial se déclenche automatiquement** lors de la création de la ressource.

2. **Suivre le déploiement** :
   - Dans GitHub, accédez à l'onglet "Actions"
   - Vous devriez voir un workflow en cours d'exécution
   - Attendez que le workflow se termine avec succès

3. **Vérifier le déploiement** :
   - Dans le portail Azure, accédez à votre ressource Static Web App
   - Cliquez sur "Vue d'ensemble"
   - Utilisez l'URL fournie pour accéder au site déployé

## Déploiements Continus

Une fois le déploiement initial réussi, les déploiements continus sont automatisés :

1. **Déploiement via push** :
   - Chaque push sur la branche `main` déclenche un déploiement
   - Les modifications sont déployées automatiquement

2. **Déploiement via pull request** :
   - Les pull requests créent des environnements de prévisualisation
   - Vous pouvez tester les modifications avant de les fusionner

3. **Révision et validation** :
   - Vérifiez toujours le résultat du déploiement dans les Actions GitHub
   - Testez le site après chaque déploiement

## Configuration Avancée

### Configuration du Domaine Personnalisé

1. **Ajouter un domaine personnalisé** :
   - Dans le portail Azure, allez dans votre ressource Static Web App
   - Cliquez sur "Domaines personnalisés"
   - Cliquez sur "Ajouter"
   - Suivez les instructions pour configurer votre domaine

2. **Configuration DNS** :
   - Ajoutez les enregistrements DNS requis chez votre fournisseur
   - Validez la propriété du domaine

### Configuration de l'Authentification

Si vous souhaitez ajouter une authentification :

1. **Configurer des fournisseurs d'authentification** :
   - Dans le portail Azure, allez dans "Authentification"
   - Cliquez sur "Ajouter un fournisseur"
   - Choisissez un fournisseur (Azure AD, GitHub, etc.)
   - Suivez les instructions de configuration

2. **Configurer les rôles et les autorisations** :
   - Modifiez `staticwebapp.config.json` pour définir les routes protégées :
   ```json
   {
     "routes": [
       {
         "route": "/admin/*",
         "allowedRoles": ["authenticated", "admin"]
       }
     ],
     "auth": {
       "identityProviders": {
         "azureActiveDirectory": {
           "registration": {
             "openIdIssuer": "https://login.microsoftonline.com/<tenant-id>/v2.0",
             "clientIdSettingName": "AAD_CLIENT_ID",
             "clientSecretSettingName": "AAD_CLIENT_SECRET"
           }
         }
       }
     }
   }
   ```

## Résolution des Problèmes

### Problèmes de Déploiement

1. **Le déploiement échoue** :
   - Vérifiez les logs dans GitHub Actions
   - Assurez-vous que la structure du projet correspond à la configuration
   - Vérifiez que l'API compile correctement

2. **L'API ne fonctionne pas** :
   - Vérifiez que les fonctions sont correctement déployées
   - Vérifiez les variables d'environnement dans Azure
   - Consultez les logs dans le portail Azure

3. **Problèmes de domaine personnalisé** :
   - Vérifiez que les enregistrements DNS sont correctement configurés
   - Attendez la propagation DNS (jusqu'à 48h)

### Commandes Utiles (Azure CLI)

```bash
# Lister les ressources Static Web Apps
az staticwebapp list

# Obtenir les détails d'une application
az staticwebapp show --name nom-de-votre-app

# Obtenir le token de déploiement
az staticwebapp secrets list --name nom-de-votre-app

# Déploiement manuel (si nécessaire)
az staticwebapp deploy --name nom-de-votre-app --source .
```

### Support et Ressources

- **Documentation Azure Static Web Apps** : [Documentation officielle](https://docs.microsoft.com/fr-fr/azure/static-web-apps/)
- **GitHub Issues** : Créer une issue dans le dépôt pour signaler des problèmes
- **Support Azure** : Ouvrir un ticket de support dans le portail Azure

---

*Guide mis à jour le 14 juin 2025*
