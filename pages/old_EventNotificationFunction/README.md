# Event Notification Function

Azure Function qui envoie un récapitulatif hebdomadaire des convocations par email.

## 📋 Description

Cette fonction Azure Timer s'exécute **tous les jeudis à 8h00** et :
1. Récupère les convocations des 7 prochains jours depuis Azure Table Storage (table `Convocations`)
2. Génère un tableau HTML formaté avec les détails
3. Envoie un email à plusieurs destinataires via Gmail SMTP

## 🏗️ Structure du projet

```
EventNotificationFunction/
├── EventNotificationFunction.csproj
├── Program.cs                              # Configuration DI et host
├── host.json                               # Configuration Azure Functions
├── local.settings.json                     # Variables d'environnement (local)
├── Functions/
│   └── WeeklyNotificationFunction.cs       # Timer Trigger (CRON: jeudi 8h)
├── Models/
│   └── ConvocationEntity.cs                # Entité Azure Table Storage
└── Services/
    ├── IConvocationTableService.cs         # Interface service Table
    ├── ConvocationTableService.cs          # Lecture Azure Table Storage
    ├── INotificationEmailService.cs        # Interface service Email
    └── NotificationEmailService.cs         # Envoi email via MailKit
```

## ⚙️ Configuration

### Variables d'environnement

Configurez ces variables dans `local.settings.json` (local) ou dans les **Application Settings** d'Azure (production) :

| Variable | Description | Exemple |
|----------|-------------|---------|
| `AZURE_STORAGE_CONNECTION_STRING` | Connexion Azure Storage | `DefaultEndpointsProtocol=https;AccountName=...` |
| `SMTP_HOST` | Serveur SMTP Gmail | `smtp.gmail.com` |
| `SMTP_PORT` | Port SMTP | `587` |
| `SMTP_USER` | Adresse email Gmail | `votre-email@gmail.com` |
| `SMTP_PASS` | Mot de passe d'application Gmail | `xxxx xxxx xxxx xxxx` |
| `SMTP_FROM` | Adresse expéditeur | `votre-email@gmail.com` |
| `NOTIFICATION_EMAILS` | Destinataires (séparés par `;`) | `admin@club.fr;coach@club.fr` |

### Mot de passe d'application Gmail

1. Activez la **vérification en deux étapes** sur votre compte Google
2. Générez un **mot de passe d'application** : [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Utilisez ce mot de passe dans `SMTP_PASS`

## 🚀 Déploiement

### Local

```bash
# Restaurer les packages
dotnet restore

# Compiler
dotnet build

# Exécuter en local
func start
```

### Azure

```bash
# Déployer vers Azure Functions
func azure functionapp publish <nom-de-votre-function-app>
```

Configurez ensuite les variables d'environnement dans le portail Azure :
**Function App → Configuration → Application settings**

## 📧 Format de l'email

L'email généré contient :
- **Sujet** : `Convocations de la semaine - DD/MM/YYYY`
- **Corps** : Tableau HTML avec colonnes :
  - Événement
  - Date (format DD/MM/YYYY)
  - Prénom
  - Nom
  - Statut (badge coloré : Présent/Absent/Peut-être)
  - Covoiturage (Oui/Non)
  - Places proposées

## ⏰ Planification

- **CRON expression** : `0 0 8 * * 4`
  - `0` secondes
  - `0` minutes
  - `8` heures (8h00)
  - `*` tous les jours du mois
  - `*` tous les mois
  - `4` jeudi (0=dimanche, 1=lundi, ..., 6=samedi)

Pour modifier la fréquence, éditez l'attribut `[TimerTrigger]` dans [WeeklyNotificationFunction.cs](Functions/WeeklyNotificationFunction.cs).

## 🧪 Test local

En mode développement, si les credentials SMTP ne sont pas configurés, la fonction affiche l'email dans la console au lieu de l'envoyer :

```
⚠️  SMTP credentials not configured - logging email content instead:
From: your-email@gmail.com
To: admin@example.com, coach@example.com
Subject: Convocations de la semaine - 26/01/2026
Body: [HTML content]
```

## 📦 Dépendances

- **Azure.Data.Tables** (v12.8.3) - Accès Azure Table Storage
- **MailKit** (v4.3.0) - Envoi d'emails via SMTP
- **Microsoft.Azure.Functions.Worker** (v1.19.0) - Runtime Azure Functions Isolated
- **Microsoft.Azure.Functions.Worker.Extensions.Timer** (v4.3.0) - Timer Trigger

## 🔒 Sécurité

- Ne commitez **jamais** `local.settings.json` (déjà dans `.gitignore`)
- Utilisez Azure Key Vault pour stocker les secrets en production
- Le mot de passe d'application Gmail est révocable à tout moment
- La connexion SMTP utilise **TLS/SSL** (port 587)

## 📝 Logs

Les logs sont disponibles :
- **Localement** : Console
- **Azure** : Application Insights / Live Metrics / Log Stream

Emojis dans les logs pour faciliter le débogage :
- 🕒 Timer exécuté
- 📊 Requête vers Azure Table
- ✅ Succès
- ⚠️ Avertissement
- ❌ Erreur
