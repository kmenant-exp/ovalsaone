# FAQ - Questions Fréquemment Posées

## Sommaire
1. [Questions Générales](#questions-générales)
2. [Questions Utilisateurs](#questions-utilisateurs)
3. [Questions Techniques](#questions-techniques)
4. [Troubleshooting](#troubleshooting)

## Questions Générales

### Qu'est-ce que le site web Oval Saône ?
Le site web Oval Saône est une application web moderne pour un club de rugby, construite avec **Eleventy 3** (générateur de site statique) et déployée sur **Cloudflare Pages**. Le backend utilise des Pages Functions en TypeScript, une base de données Cloudflare D1, et Resend pour l'envoi d'emails.

### Quelles sont les principales fonctionnalités du site ?
- Pages informatives (Accueil, Équipes, École de rugby, Événements, Partenariat)
- Pages interactives (Boutique, Inscription, Contact, FAQ)
- Galerie photo avec filtres et lightbox
- Formulaire de contact avec protection Turnstile et envoi via Resend
- Système de convocations avec base de données D1
- Calendrier Google intégré
- Contenu gérable via Decap CMS
- Design responsive adapté à tous les appareils

### Qui peut utiliser ce site ?
Le site est destiné à plusieurs types d'utilisateurs :
- Visiteurs (parents, joueurs, supporters) recherchant des informations sur le club
- Nouveaux membres souhaitant s'inscrire
- Administrateurs gérant le contenu via le dashboard admin ou Decap CMS
- Partenaires et sponsors potentiels

## Questions Utilisateurs

### Comment mettre à jour les actualités sur la page d'accueil ?
Deux méthodes possibles :

**Via Decap CMS (recommandé)** :
1. Se connecter à l'admin (`/cms/`)
2. Naviguer vers la collection Actualités
3. Ajouter ou modifier une entrée

**Manuellement** :
1. Éditer `src/_data/actualites.json`
2. Ajouter l'image dans `src/assets/actualites/`
3. Commit + push

### Comment modifier les tarifs d'inscription ?
Éditer le fichier `src/_data/page_inscription.json` et commit + push.

### Les formulaires de contact sont-ils traités automatiquement ?
Oui, le formulaire de contact est traité par une Pages Function TypeScript (`functions/api/contact.ts`) qui :
1. Vérifie le token Turnstile (anti-bot)
2. Valide les données
3. Envoie un email via l'API Resend

## Questions Techniques

### Comment déployer une nouvelle version du site ?
```bash
cd pages
npm run deploy:pages
```
Cette commande effectue un build de production (Eleventy + PurgeCSS + minification) puis déploie sur Cloudflare Pages.

Pour plus de détails, consultez le [Guide de Déploiement](guide-deploiement.md).

### Comment ajouter une nouvelle page au site ?
1. Créer un fichier `.liquid` dans `src/` avec le front matter `layout: layout.njk`
2. Ajouter les styles dans `src/css/pages/` et les inclure dans `src/css-bundle.njk`
3. Ajouter le lien dans la navigation du layout
4. Build et tester avec `npm run dev:pages`

### Comment configurer l'envoi d'emails ?
L'envoi d'emails utilise **Resend** (pas de SMTP). Configuration :
1. `RESEND_API_KEY` : défini comme secret via `wrangler pages secret put`
2. `SMTP_FROM` et `CONTACT_EMAIL` : définis dans `wrangler.toml` (section `[vars]`)

### Comment ajouter un domaine personnalisé ?
1. Aller dans le **Dashboard Cloudflare** → Workers & Pages → ovalsaone
2. Onglet **Custom domains** → Set up a custom domain
3. Cloudflare configure automatiquement les DNS si le domaine est géré par Cloudflare

## Troubleshooting

### Les images ne s'affichent pas correctement
1. Vérifiez les chemins dans les fichiers JSON (`src/_data/`)
2. Vérifiez que les images existent dans `src/assets/`
3. Supprimez `_site/` et relancez `npm run build`
4. Videz le cache du navigateur

### Les formulaires ne s'envoient pas
1. Vérifiez la console du navigateur pour les erreurs
2. En local : vérifiez que `RESEND_API_KEY` est configuré dans `.dev.vars`
3. En production : vérifiez le secret via `wrangler pages secret list`
4. Consultez les logs avec `wrangler pages deployment tail`

### Le build Eleventy échoue
1. Supprimer `node_modules` et `_site/`, puis `npm install && npm run build`
2. Vérifier que Node.js >= 18 est installé

---

*Dernière mise à jour : 20 février 2026*

### Le contenu JSON ne se charge pas
Si le contenu dynamique ne s'affiche pas :
1. Vérifiez que les fichiers JSON sont correctement formatés (pas d'erreurs de syntaxe)
2. Ouvrez la console du navigateur pour voir les erreurs
3. Assurez-vous que data-loader.js est bien inclus dans la page
4. Vérifiez que les chemins vers les fichiers JSON sont corrects

### Erreurs dans la console du navigateur
Pour les erreurs JavaScript :
1. Ouvrez les outils de développement du navigateur (F12)
2. Consultez l'onglet "Console" pour voir les erreurs
3. Recherchez les messages d'erreur dans la documentation ou demandez de l'aide

### Le site ne se déploie pas correctement
Si le déploiement échoue :
1. Vérifiez les logs GitHub Actions
2. Assurez-vous que la structure du projet correspond à la configuration
3. Vérifiez que le projet compile correctement en local
4. Consultez le dashboard Cloudflare pour les logs de déploiement

---

*FAQ mise à jour le 14 juin 2025*
