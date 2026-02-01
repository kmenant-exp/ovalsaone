# FAQ - Questions Fréquemment Posées

## Sommaire
1. [Questions Générales](#questions-générales)
2. [Questions Utilisateurs](#questions-utilisateurs)
3. [Questions Techniques](#questions-techniques)
4. [Troubleshooting](#troubleshooting)

## Questions Générales

### Qu'est-ce que le site web Oval Saône ?
Le site web Oval Saône est une application web moderne pour un club de rugby, développée avec Azure Static Web Apps. Il combine un frontend statique (HTML, CSS, JavaScript) avec un backend serverless basé sur Azure Functions en C#.

### Quelles sont les principales fonctionnalités du site ?
- Pages informatives (Accueil, Équipes, École de rugby, Partenariat)
- Pages interactives (Boutique, Inscription, Contact)
- Formulaires de contact et d'inscription
- Affichage dynamique du contenu via des fichiers JSON
- Design responsive adapté à tous les appareils

### Qui peut utiliser ce site ?
Le site est destiné à plusieurs types d'utilisateurs :
- Visiteurs (parents, joueurs, supporters) recherchant des informations sur le club
- Nouveaux membres souhaitant s'inscrire
- Administrateurs gérant le contenu du site
- Partenaires et sponsors potentiels

## Questions Utilisateurs

### Comment mettre à jour les actualités sur la page d'accueil ?
Les actualités sont stockées dans le fichier `data/actualites.json`. Pour ajouter ou modifier une actualité :
1. Ouvrez ce fichier
2. Ajoutez une nouvelle entrée au format JSON avec titre, date, image, et contenu
3. Ajoutez l'image correspondante dans le dossier `assets/actualites/`
4. Déployez les modifications

### Comment ajouter un nouveau produit à la boutique ?
Pour ajouter un produit dans la boutique :
1. Ouvrez le fichier `data/boutique.json`
2. Ajoutez une nouvelle entrée avec la catégorie, le nom, le prix, la description et l'image
3. Ajoutez l'image du produit dans le dossier `assets/boutique/`
4. Déployez les modifications

### Comment modifier les tarifs d'inscription ?
Les tarifs sont définis dans le fichier `data/inscription.json`. Pour les modifier :
1. Ouvrez ce fichier
2. Modifiez les valeurs des différentes catégories
3. Déployez les modifications

### Les formulaires d'inscription sont-ils traités automatiquement ?
Oui, les formulaires sont traités automatiquement par des Azure Functions :
- Le formulaire de contact envoie un email à l'adresse configurée
- Le formulaire d'inscription envoie les détails par email et confirme à l'utilisateur

## Questions Techniques

### Comment déployer une nouvelle version du site ?
Le déploiement se fait automatiquement via GitHub Actions :
1. Poussez vos modifications sur la branche principale (main)
2. GitHub Actions déclenche automatiquement le déploiement
3. Le site est déployé sur Azure Static Web Apps

Pour plus de détails, consultez le [Guide de Déploiement](guide-deploiement.md).

### Comment ajouter une nouvelle page au site ?
Pour ajouter une nouvelle page :
1. Créez un nouveau fichier HTML dans le dossier racine
2. Copiez la structure de base d'une page existante (navigation, footer)
3. Ajoutez votre contenu spécifique
4. Liez la page dans le menu de navigation
5. Créez un fichier JavaScript correspondant si nécessaire

### Comment configurer l'envoi d'emails pour les formulaires ?
L'envoi d'emails est configuré via des variables d'environnement dans Azure :
1. Accédez à votre ressource Azure Static Web App
2. Allez dans "Configuration"
3. Configurez les variables : SMTP_HOST, SMTP_PORT, SMTP_USERNAME, SMTP_PASSWORD, EMAIL_FROM, EMAIL_TO

### Comment ajouter un domaine personnalisé ?
Pour ajouter un domaine personnalisé :
1. Dans le portail Azure, accédez à votre ressource Static Web App
2. Allez dans "Domaines personnalisés"
3. Suivez les instructions pour ajouter et valider votre domaine
4. Configurez les enregistrements DNS chez votre fournisseur

## Troubleshooting

### Les images ne s'affichent pas correctement
Si les images ne s'affichent pas :
1. Vérifiez que les chemins dans les fichiers JSON sont corrects
2. Assurez-vous que les images existent dans le bon dossier
3. Vérifiez les extensions des fichiers (sensible à la casse)
4. Videz le cache du navigateur

### Les formulaires ne s'envoient pas
Si les formulaires ne fonctionnent pas :
1. Vérifiez que tous les champs obligatoires sont remplis
2. Vérifiez la console du navigateur pour les erreurs JavaScript
3. Assurez-vous que l'API backend est déployée correctement
4. Vérifiez les logs des Azure Functions dans le portail Azure

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
4. Consultez le portail Azure pour les erreurs de déploiement

---

*FAQ mise à jour le 14 juin 2025*
