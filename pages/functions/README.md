# Cloudflare Pages Functions

Ce dossier contient les fonctions serverless déployées avec Cloudflare Pages.

## Structure

```
functions/
├── api/
│   └── contact.ts    # Endpoint POST /api/contact
├── tsconfig.json     # Configuration TypeScript
└── README.md
```

## Endpoint disponible

### POST /api/contact

Gère les soumissions du formulaire de contact.

**Request body:**
```json
{
  "nom": "Dupont",
  "prenom": "Jean",
  "email": "jean.dupont@example.com",
  "telephone": "06 12 34 56 78",  // optionnel
  "sujet": "Demande d'information",
  "message": "Votre message..."
}
```

**Response (succès):**
```json
{
  "Success": true,
  "Message": "Votre message a été envoyé avec succès. Nous vous contacterons bientôt."
}
```

**Response (erreur):**
```json
{
  "Success": false,
  "Message": "Données invalides",
  "Errors": ["Le nom est requis", "L'email n'est pas valide"]
}
```

## Variables d'environnement

Configurer dans le Dashboard Cloudflare (Settings > Environment Variables) :

| Variable | Description | Obligatoire |
|----------|-------------|-------------|
| `RESEND_API_KEY` | Clé API Resend | Oui (production) |
| `SMTP_FROM` | Email expéditeur (vérifié dans Resend) | Oui |
| `CONTACT_EMAIL` | Email destinataire des messages | Oui |

## Développement local

```bash
# Lancer le dev server avec les Functions
npm run dev:pages
```

Le site sera accessible sur `http://localhost:8788` avec les fonctions actives.

## Déploiement

```bash
# Déployer sur Cloudflare Pages
npm run deploy:pages
```

Ou via le Dashboard Cloudflare connecté à votre repo Git pour un déploiement automatique.

## Configuration des secrets

Via Wrangler CLI :
```bash
wrangler pages secret put RESEND_API_KEY --project-name ovalsaone
```

Ou via le Dashboard Cloudflare :
1. Aller dans Pages > ovalsaone > Settings > Environment Variables
2. Ajouter `RESEND_API_KEY` comme secret

## Migration depuis le Worker standalone

L'ancien code du dossier `/worker` a été consolidé dans `/functions/api/contact.ts`.
La structure Pages Functions permet un déploiement unifié du site statique et des API.
