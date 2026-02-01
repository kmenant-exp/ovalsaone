# Oval Saône - Admin Dashboard

Interface d'administration pour le suivi des convocations du club de rugby Oval Saône.

## Fonctionnalités

- 📋 **Liste des convocations** : Affiche tous les joueurs convoqués avec filtres par tournoi et statut
- 📊 **Statistiques** : Nombre de présents, absents, en attente par événement
- 🚗 **Covoiturage** : Suivi des besoins de transport et places proposées
- 🔒 **Authentification Google** : Accès sécurisé réservé aux administrateurs autorisés

## Architecture

- **Frontend** : Alpine.js + CSS personnalisé (basé sur les couleurs du logo)
- **Backend** : Hono.js sur Cloudflare Pages Functions
- **Base de données** : Cloudflare D1 (SQLite)
- **Authentification** : Google OAuth 2.0 avec liste blanche en D1

## Prérequis

- Node.js 18+
- Compte Cloudflare avec accès à la base D1 `ovalsaonedb`
- Identifiants OAuth Google (voir configuration ci-dessous)

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
│   └── logo.png         # Logo Oval Saône
├── functions/
│   └── [[route]].ts     # API Hono (auth + endpoints)
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
