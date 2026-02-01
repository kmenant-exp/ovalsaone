# Guide de Déploiement Complet - Oval Saône

Ce document détaille toutes les étapes nécessaires pour redéployer l'ensemble du projet depuis zéro, incluant la création des comptes nécessaires et la configuration complète de l'infrastructure.

## Table des matières

1. [Prérequis](#prérequis)
2. [Création des comptes](#création-des-comptes)
3. [Configuration locale](#configuration-locale)
4. [Déploiement de la base de données](#déploiement-de-la-base-de-données)
5. [Déploiement du site principal (Cloudflare Pages)](#déploiement-du-site-principal-cloudflare-pages)
6. [Déploiement du Worker de notifications](#déploiement-du-worker-de-notifications)
7. [Configuration finale](#configuration-finale)
8. [Vérifications](#vérifications)
9. [Troubleshooting](#troubleshooting)

---

## 1. Prérequis

### Outils nécessaires

- **Node.js** (version 18 ou supérieure)
- **npm** ou **yarn**
- **Git**
- **Un éditeur de code** (VS Code recommandé)

### Vérification de l'installation

```bash
node --version  # Doit afficher v18.x ou supérieur
npm --version   # Doit afficher 9.x ou supérieur
git --version   # N'importe quelle version récente
```

---

## 2. Création des comptes

### 2.1 Compte Cloudflare

1. **Créer un compte Cloudflare** :
   - Aller sur [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
   - Remplir le formulaire avec votre email et mot de passe
   - Vérifier votre email

2. **Choisir le plan** :
   - Pour ce projet, le **plan Free** est suffisant
   - Vous pouvez upgrader plus tard si nécessaire

3. **Obtenir votre API Token** :
   - Aller dans **My Profile** → **API Tokens**
   - Cliquer sur **Create Token**
   - Utiliser le template **Edit Cloudflare Workers**
   - Configurer les permissions :
     - Account : `Cloudflare Workers Scripts` - Edit
     - Zone : `Cloudflare Workers Scripts` - Edit
     - Account : `D1` - Edit
   - Cliquer sur **Continue to summary** puis **Create Token**
   - **IMPORTANT** : Copier le token immédiatement (il ne sera plus visible)

4. **Configurer le domaine (optionnel)** :
   - Si vous avez un domaine personnalisé (ex: ovalsaone.fr)
   - Aller dans **Websites** → **Add a site**
   - Suivre les instructions pour pointer les DNS vers Cloudflare

### 2.2 Compte Resend

1. **Créer un compte Resend** :
   - Aller sur [https://resend.com/signup](https://resend.com/signup)
   - Créer un compte (gratuit pour 100 emails/jour, 3000/mois)

2. **Vérifier votre domaine d'envoi** :
   - Aller dans **Domains** → **Add Domain**
   - Entrer votre domaine (ex: ovalsaone.fr)
   - Copier les enregistrements DNS fournis par Resend
   - Les ajouter dans votre configuration DNS (via Cloudflare si vous l'utilisez)
   - Attendre la vérification (peut prendre quelques minutes)

3. **Créer une clé API** :
   - Aller dans **API Keys**
   - Cliquer sur **Create API Key**
   - Donner un nom descriptif (ex: "Production Oval Saône")
   - Choisir les permissions : **Sending access**
   - Cliquer sur **Create**
   - **IMPORTANT** : Copier la clé immédiatement (elle ne sera plus visible)
   - Format : `re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Configuration du domaine d'envoi** :
   - Une fois le domaine vérifié, noter l'adresse email que vous utiliserez
   - Exemple : `contact@ovalsaone.fr` ou `noreply@ovalsaone.fr`

---

## 3. Configuration locale

### 3.1 Cloner le repository

```bash
git clone <url-du-repository>
cd ovalsaone
```

### 3.2 Installer Wrangler (CLI Cloudflare)

```bash
npm install -g wrangler
```

### 3.3 Authentifier Wrangler avec Cloudflare

```bash
wrangler login
```

Cela ouvrira un navigateur pour autoriser l'accès à votre compte Cloudflare.

### 3.4 Installer les dépendances

```bash
# Pages (site principal)
cd pages
npm install

# Worker de notifications
cd ../workers/weekly-notification
npm install
```

---

## 4. Déploiement de la base de données

### 4.1 Créer la base de données D1

```bash
cd workers/weekly-notification
wrangler d1 create ovalsaonedb
```

Cette commande affichera :
```
✅ Successfully created DB 'ovalsaonedb' in region WEUR
Created your database using D1's new storage backend. The new storage backend is not yet recommended for production workloads, but backs up your data via point-in-time restore.

[[d1_databases]]
binding = "DB"
database_name = "ovalsaonedb"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 4.2 Copier l'ID de la base de données

Copier le `database_id` affiché et le mettre dans les deux fichiers `wrangler.toml` :

1. **`workers/weekly-notification/wrangler.toml`** :
```toml
[[d1_databases]]
binding = "DB"
database_name = "ovalsaonedb"
database_id = "VOTRE_DATABASE_ID_ICI"
```

2. **`pages/wrangler.toml`** :
```toml
[[d1_databases]]
binding = "DB"
database_name = "ovalsaonedb"
database_id = "VOTRE_DATABASE_ID_ICI"
```

### 4.3 Exécuter les migrations

```bash
cd workers/weekly-notification
wrangler d1 execute ovalsaonedb --file=./migrations/0001_initial.sql
```

Vous devriez voir :
```
🌀 Executing on remote database ovalsaonedb (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx):
🌀 To execute on your local development database, pass the --local flag.
🚣 Executed 2 commands in 0.123ms
```

---

## 5. Déploiement du site principal (Cloudflare Pages)

### 5.1 Configurer les variables d'environnement

Éditer `pages/wrangler.toml` :

```toml
[vars]
SMTP_FROM = "contact@ovalsaone.fr"  # Votre email vérifié dans Resend
CONTACT_EMAIL = "contact@ovalsaone.fr"  # Email qui recevra les messages du formulaire
```

### 5.2 Configurer le secret Resend

```bash
cd pages
wrangler pages secret put RESEND_API_KEY
```

Coller votre clé API Resend quand demandé.

### 5.3 Build et déploiement

```bash
cd pages
npm run deploy:pages
```

Cette commande va :
1. Build le site Eleventy (`npm run build:prod`)
2. Minifier CSS et JS
3. Déployer sur Cloudflare Pages

### 5.4 Noter l'URL de production

À la fin du déploiement, vous verrez :
```
✨ Deployment complete! Take a peek over at https://ovalsaone.pages.dev
```

### 5.5 Configurer un domaine personnalisé (optionnel)

1. Aller sur le **Cloudflare Dashboard**
2. **Workers & Pages** → **ovalsaone**
3. Onglet **Custom domains**
4. Cliquer sur **Set up a custom domain**
5. Entrer votre domaine (ex: `www.ovalsaone.fr` ou `ovalsaone.fr`)
6. Cloudflare configurera automatiquement les DNS

---

## 6. Déploiement du Worker de notifications

### 6.1 Configurer les variables d'environnement

Éditer `workers/weekly-notification/wrangler.toml` :

```toml
[vars]
SMTP_FROM = "noreply@ovalsaone.fr"  # Email d'envoi
NOTIFICATION_EMAILS = "admin1@example.com;admin2@example.com"  # Emails séparés par ;
```

### 6.2 Configurer les secrets

```bash
cd workers/weekly-notification

# Configurer la clé API Resend
wrangler secret put RESEND_API_KEY

# Configurer les emails de notification (optionnel si déjà dans vars)
wrangler secret put NOTIFICATION_EMAILS
```

### 6.3 Déployer le Worker

```bash
npm run deploy
```

Cette commande va :
1. Build le TypeScript
2. Déployer le Worker avec le Cron Trigger configuré

### 6.4 Vérifier le Cron

Le Worker est configuré pour s'exécuter **tous les jeudis à 8h00 UTC**.

Pour vérifier :
```bash
wrangler tail
```

Ou dans le Dashboard Cloudflare :
- **Workers & Pages** → **ovalsaone-weekly-notification**
- Onglet **Triggers** pour voir le Cron

---

## 7. Configuration finale

### 7.1 Vérifier les bindings D1

Dans le **Cloudflare Dashboard** :

1. **Pages (ovalsaone)** :
   - Workers & Pages → ovalsaone → Settings → Functions
   - Vérifier que le binding D1 est présent

2. **Worker (ovalsaone-weekly-notification)** :
   - Workers & Pages → ovalsaone-weekly-notification → Settings → Variables
   - Vérifier que le binding D1 est présent

### 7.2 Configurer les emails de notification

Dans le Dashboard Cloudflare :
- Workers & Pages → ovalsaone-weekly-notification
- Settings → Variables and Secrets
- Modifier `NOTIFICATION_EMAILS` si nécessaire

### 7.3 Tester le formulaire de contact

1. Aller sur votre site : `https://ovalsaone.pages.dev/contact/`
2. Remplir et envoyer le formulaire
3. Vérifier la réception de l'email

### 7.4 Tester la convocation

1. Aller sur : `https://ovalsaone.pages.dev/convocation/`
2. Remplir le formulaire
3. Vérifier que les données sont enregistrées

---

## 8. Vérifications

### 8.1 Vérifier la base de données

```bash
cd workers/weekly-notification
wrangler d1 execute ovalsaonedb --command="SELECT * FROM convocations LIMIT 5"
```

### 8.2 Vérifier les logs du Worker

```bash
cd workers/weekly-notification
wrangler tail
```

### 8.3 Tester manuellement le Worker de notifications

Créer un fichier test ou utiliser curl :

```bash
curl -X POST https://ovalsaone-weekly-notification.YOUR_SUBDOMAIN.workers.dev
```

### 8.4 Vérifier les métriques Cloudflare

Dans le Dashboard :
- **Analytics & Logs** pour voir le trafic
- **D1** → ovalsaonedb pour voir l'utilisation de la base de données

---

## 9. Troubleshooting

### Problème : Le formulaire de contact ne fonctionne pas

**Solutions** :
1. Vérifier que `RESEND_API_KEY` est bien configuré :
   ```bash
   cd pages
   wrangler pages secret list
   ```

2. Vérifier les logs :
   ```bash
   wrangler pages deployment tail
   ```

3. Vérifier la configuration dans `wrangler.toml` (SMTP_FROM, CONTACT_EMAIL)

### Problème : Les notifications ne sont pas envoyées

**Solutions** :
1. Vérifier le Cron :
   ```bash
   cd workers/weekly-notification
   wrangler tail
   ```

2. Déclencher manuellement :
   ```bash
   curl -X POST https://ovalsaone-weekly-notification.YOUR_SUBDOMAIN.workers.dev
   ```

3. Vérifier les secrets :
   ```bash
   wrangler secret list
   ```

### Problème : Erreur D1 "Database not found"

**Solutions** :
1. Vérifier que `database_id` est correct dans `wrangler.toml`
2. Lister les bases de données :
   ```bash
   wrangler d1 list
   ```
3. Rebind la base dans le Dashboard si nécessaire

### Problème : Build Eleventy échoue

**Solutions** :
1. Supprimer `node_modules` et réinstaller :
   ```bash
   cd pages
   rm -rf node_modules package-lock.json
   npm install
   ```

2. Vérifier la version de Node.js :
   ```bash
   node --version  # Doit être >= 18
   ```

### Problème : Domaine vérifié Resend mais emails non reçus

**Solutions** :
1. Vérifier SPF, DKIM, DMARC dans les DNS
2. Vérifier les logs Resend dans le Dashboard
3. Tester avec l'email de test Resend : `onboarding@resend.dev`
4. Vérifier les spams

---

## Résumé des commandes principales

```bash
# Installation initiale
npm install -g wrangler
wrangler login

# Créer et configurer D1
cd workers/weekly-notification
wrangler d1 create ovalsaonedb
wrangler d1 execute ovalsaonedb --file=./migrations/0001_initial.sql

# Configurer les secrets
wrangler secret put RESEND_API_KEY
wrangler secret put NOTIFICATION_EMAILS

# Déployer le Worker
npm run deploy

# Déployer le site Pages
cd ../../pages
wrangler pages secret put RESEND_API_KEY
npm run deploy:pages
```

---

## Checklist finale

- [ ] Compte Cloudflare créé et vérifié
- [ ] Compte Resend créé et domaine vérifié
- [ ] Wrangler installé et authentifié
- [ ] Base de données D1 créée et migrée
- [ ] `database_id` copié dans les deux `wrangler.toml`
- [ ] Secrets `RESEND_API_KEY` configurés (Pages + Worker)
- [ ] Variables d'environnement configurées
- [ ] Site Pages déployé et accessible
- [ ] Worker de notifications déployé
- [ ] Cron configuré (jeudis 8h UTC)
- [ ] Formulaire de contact testé
- [ ] Formulaire de convocation testé
- [ ] Notifications testées
- [ ] Domaine personnalisé configuré (optionnel)

---

## Support et ressources

- **Documentation Cloudflare Workers** : [https://developers.cloudflare.com/workers/](https://developers.cloudflare.com/workers/)
- **Documentation Cloudflare Pages** : [https://developers.cloudflare.com/pages/](https://developers.cloudflare.com/pages/)
- **Documentation D1** : [https://developers.cloudflare.com/d1/](https://developers.cloudflare.com/d1/)
- **Documentation Resend** : [https://resend.com/docs](https://resend.com/docs)
- **Eleventy (SSG)** : [https://www.11ty.dev/docs/](https://www.11ty.dev/docs/)

---

**Date de dernière mise à jour** : 1er février 2026
