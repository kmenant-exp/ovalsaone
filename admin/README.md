# Oval Saône - Admin Dashboard

Interface d'administration pour le suivi des convocations du club de rugby Oval Saône.

## Fonctionnalités

- 📋 **Liste des convocations** : Affiche tous les joueurs convoqués avec filtres par tournoi et statut
- 📊 **Statistiques** : Nombre de présents, absents, en attente par événement
- 🚗 **Covoiturage** : Suivi des besoins de transport et places proposées
- 🔒 **Authentification Google** : Accès sécurisé réservé aux administrateurs autorisés
- ✏️ **CMS (Decap CMS)** : Édition visuelle du contenu du site (actualités, galerie, équipes, bureau, etc.) via `/cms/`

## Architecture

- **Frontend** : Alpine.js + CSS personnalisé (basé sur les couleurs du logo)
- **Backend** : Hono.js sur Cloudflare Pages Functions
- **Base de données** : Cloudflare D1 (SQLite)
- **Authentification** : Google OAuth 2.0 avec liste blanche en D1
- **CMS** : Decap CMS v3 (édition du contenu via l'API GitHub)

## Prérequis

- Node.js 18+
- Compte Cloudflare avec accès à la base D1 `ovalsaonedb`
- Identifiants OAuth Google (voir configuration ci-dessous)
- GitHub App installée sur le repo du site (voir configuration ci-dessous)

## Installation

```bash
# Depuis la racine du repo
cd admin

# Installer les dépendances
npm install

# Appliquer les migrations D1 (si pas encore fait)
npm run db:migrate:local   # Local
npm run db:migrate         # Production
```

## Configuration Google OAuth

### 1. Créer un projet Google Cloud

1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créer un nouveau projet ou utiliser un existant
3. Activer l'API "Google+ API" ou "People API"

### 2. Configurer OAuth 2.0

1. Aller dans **APIs & Services > Credentials**
2. Cliquer **Create Credentials > OAuth client ID**
3. Sélectionner **Web application**
4. Configurer les **Authorized redirect URIs** :
   - Production : `https://ovalsaone-admin.pages.dev/auth/callback`
   - Développement : `http://localhost:8788/auth/callback`
5. Noter le **Client ID** et **Client Secret**

### 3. Configurer les variables d'environnement

```bash
# Dans wrangler.toml, définir le Client ID
# [vars]
# GOOGLE_CLIENT_ID = "votre-client-id.apps.googleusercontent.com"

# Définir les secrets via wrangler CLI
wrangler secret put GOOGLE_CLIENT_SECRET
# Coller le Client Secret

wrangler secret put JWT_SECRET
# Générer une chaîne aléatoire (ex: openssl rand -hex 32)
```

## Configuration GitHub App (Decap CMS)

Le CMS utilise une **GitHub App** pour éditer le contenu du site. Contrairement à un OAuth App classique, une GitHub App génère des tokens scopés uniquement aux repos où elle est installée — aucun accès aux autres dépôts du compte.

### 1. Créer la GitHub App

1. Aller sur https://github.com/settings/apps/new
2. Remplir les champs :
   - **GitHub App name** : `Oval Saône CMS`
   - **Homepage URL** : `https://ovalsaone-admin.pages.dev`
   - **Callback URL** : `https://ovalsaone-admin.pages.dev/oauth/callback`
   - **Webhook** : décocher « Active »
3. Configurer les **permissions** → Repository :

   | Permission | Niveau |
   |------------|--------|
   | Contents   | Read & Write |
   | Metadata   | Read-only |

4. **Where can this app be installed?** : « Only on this account »
5. Cliquer **Create GitHub App**

### 2. Récupérer les identifiants

Sur la page de l'App après création :

| Information | Où la trouver | Variable |
|-------------|---------------|----------|
| App ID | En haut de la page | `GITHUB_APP_ID` |
| Client ID | Section « OAuth » | `GITHUB_APP_CLIENT_ID` |
| Client secret | Bouton « Generate a new client secret » | `GITHUB_APP_CLIENT_SECRET` (secret) |
| Private key | Bouton « Generate a private key » (fichier `.pem`) | `GITHUB_APP_PRIVATE_KEY` (secret) |

### 3. Installer l'App sur le repo

1. Page de l'App → onglet **Install App**
2. Sélectionner le compte propriétaire du repo
3. Choisir **« Only select repositories »** → sélectionner `ovalsaone`
4. Cliquer **Install**
5. Noter le **Installation ID** visible dans l'URL : `https://github.com/settings/installations/{ID}`

### 4. Configurer les variables

Dans `wrangler.toml` :

```toml
[vars]
GITHUB_APP_ID = "<App ID>"
GITHUB_APP_CLIENT_ID = "<Client ID>"
GITHUB_APP_INSTALLATION_ID = "<Installation ID>"
```

Configurer les secrets :

```bash
cd admin

# Client secret de l'App
wrangler pages secret put GITHUB_APP_CLIENT_SECRET --project-name ovalsaone-admin

# Clé privée PEM (coller le contenu du fichier .pem avec les retours à la ligne remplacés par \n)
wrangler pages secret put GITHUB_APP_PRIVATE_KEY --project-name ovalsaone-admin
```

> **Astuce** pour la clé privée : `awk 'NF {printf "%s\\n", $0}' private-key.pem | pbcopy` copie le contenu avec les `\n` échappés dans le presse-papiers.

## Développement local

```bash
# Lancer le serveur de développement
npm run dev

# Le dashboard est accessible sur http://localhost:8788
```

> **Note** : En développement local, l'authentification Google nécessite que `http://localhost:8788/auth/callback` soit dans les URIs autorisées.

## Déploiement

```bash
# Déployer sur Cloudflare Pages
npm run deploy
```

Le site sera accessible sur `https://ovalsaone-admin.pages.dev`.

## Gestion des administrateurs

### Ajouter un administrateur

```sql
-- Via wrangler d1 execute
INSERT INTO admin_users (email, name) VALUES ('email@example.com', 'Nom Complet');
```

```bash
# Commande complète
cd admin
wrangler d1 execute DB --remote --command "INSERT INTO admin_users (email, name) VALUES ('email@example.com', 'Nom');"
```

### Supprimer un administrateur

```bash
wrangler d1 execute DB --remote --command "DELETE FROM admin_users WHERE email = 'email@example.com';"
```

### Lister les administrateurs

```bash
wrangler d1 execute DB --remote --command "SELECT * FROM admin_users;"
```

## Structure du projet

```
admin/
├── migrations/          → Symlink vers workers/weekly-notification/migrations/
├── public/
│   ├── index.html       # Dashboard principal
│   ├── login.html       # Page de connexion
│   ├── app.js           # Logique Alpine.js
│   ├── styles.css       # Styles CSS
│   ├── logo.png         # Logo Oval Saône
│   └── cms/
│       ├── index.html   # Page hôte Decap CMS
│       └── config.yml   # Configuration des collections CMS
├── functions/
│   └── [[route]].ts     # API Hono (auth + OAuth + endpoints)
├── package.json
├── tsconfig.json
├── wrangler.toml
└── README.md
```

## API Endpoints

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/auth/google` | Redirige vers Google OAuth |
| GET | `/auth/callback` | Callback OAuth, crée la session |
| GET | `/auth/logout` | Déconnexion |
| GET | `/auth/me` | Vérifie l'authentification |
| GET | `/oauth/auth` | Redirige vers GitHub App OAuth (popup Decap CMS) |
| GET | `/oauth/callback` | Callback GitHub, génère un token scopé au repo |
| GET | `/assets/*` | Proxy d'images vers le site principal (aperçus CMS) |
| GET | `/api/events` | Liste des tournois (event_name + event_date) |
| GET | `/api/convocations?event=&response=` | Liste filtrée des convocations |
| GET | `/api/stats?event=` | Statistiques pour un événement |

## Schéma de la base de données

### Table `convocations`

| Colonne | Type | Description |
|---------|------|-------------|
| id | INTEGER | Clé primaire |
| event_name | TEXT | Nom du tournoi |
| event_date | TEXT | Date (YYYY-MM-DD) |
| first_name | TEXT | Prénom |
| last_name | TEXT | Nom |
| email | TEXT | Email |
| response | TEXT | 'présent', 'absent', 'pending' |
| needs_carpool | INTEGER | 0/1 - Besoin de covoiturage |
| carpool_seats | INTEGER | Places proposées |
| created_at | TEXT | Date de création |
| updated_at | TEXT | Date de mise à jour |

### Table `admin_users`

| Colonne | Type | Description |
|---------|------|-------------|
| email | TEXT | Email (clé primaire) |
| name | TEXT | Nom de l'admin |
| created_at | TEXT | Date d'ajout |

## Troubleshooting

### "Votre compte n'est pas autorisé"
L'email utilisé pour la connexion Google n'est pas dans la table `admin_users`. Ajoutez-le avec la commande SQL ci-dessus.

### Erreur de token OAuth
Vérifiez que les URIs de redirection dans Google Cloud Console correspondent exactement à celles utilisées.

### Base de données vide
Assurez-vous d'avoir appliqué les migrations D1 :
```bash
npm run db:migrate
```
