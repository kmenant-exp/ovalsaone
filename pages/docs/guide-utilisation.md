# Guide d'Utilisation du Site Web Oval Saône

## Sommaire
1. [Introduction](#introduction)
2. [Navigation sur le Site](#navigation-sur-le-site)
3. [Pages Principales](#pages-principales)
4. [Formulaires](#formulaires)
5. [Chargement de Données](#chargement-de-données)
6. [Problèmes Courants](#problèmes-courants)

## Introduction

Ce guide est destiné aux utilisateurs et aux administrateurs du site web Oval Saône. Il explique comment naviguer sur le site, utiliser les formulaires et mettre à jour le contenu.

## Navigation sur le Site

### Menu Principal

Le site dispose d'un menu de navigation responsive qui s'adapte à tous les appareils :

- Sur desktop : Menu horizontal en haut de la page
- Sur mobile : Menu hamburger avec icône dans le coin supérieur droit

### Comportement du Menu

- Le menu devient "sticky" et se réduit lors du défilement
- Sur mobile, le menu s'ouvre en plein écran en cliquant sur l'icône hamburger

### Pied de Page

Le pied de page contient :
- Les liens vers les réseaux sociaux
- Les informations de contact
- Les mentions légales et politique de confidentialité

## Pages Principales

### Accueil (index.html)

La page d'accueil présente :
- Un carrousel d'images en en-tête
- Les actualités récentes chargées depuis actualites.json
- Une présentation du club
- Une section avec les sponsors

### Équipes (equipes.html)

Cette page présente toutes les catégories d'équipes :
- U6, U8, U10, U12, U14, Seniors
- Chaque section affiche des informations sur la catégorie
- Les données sont chargées depuis equipes.json

### L'École (ecole.html)

Cette page contient :
- L'histoire du club avec effet parallax
- La présentation du bureau (photos et rôles)
- La liste des entraîneurs par catégorie
- Les données sont chargées depuis ecole.json

### Partenariat (partenariat.html)

La page partenariat présente :
- Les avantages d'être partenaire
- Les différentes formules de partenariat
- Les logos des sponsors actuels
- Les données sont chargées depuis partenariat.json

### Boutique (boutique.html)

La boutique en ligne affiche :
- Des produits classés par catégorie
- Des informations de prix et taille
- Des images de produits
- Un système de filtre
- Les données sont chargées depuis boutique.json

### Inscription (inscription.html)

Le formulaire d'inscription permet :
- De saisir les informations de l'enfant
- De déterminer automatiquement la catégorie selon l'âge
- D'afficher les tarifs correspondants
- De soumettre la demande d'inscription
- Les tarifs sont chargés depuis inscription.json

### Contact (contact.html)

La page contact inclut :
- Un formulaire de contact
- Une carte de localisation
- Les informations de contact du club

## Formulaires

### Formulaire de Contact

1. **Champs** :
   - Nom (obligatoire)
   - Prénom (obligatoire)
   - Email (obligatoire, format validé)
   - Téléphone (optionnel)
   - Sujet (obligatoire)
   - Message (obligatoire)

2. **Soumission** :
   - Les champs sont validés côté client
   - Les données sont envoyées à l'API `/api/Contact`
   - Un message de confirmation s'affiche en cas de succès
   - Les erreurs sont affichées en cas de problème

### Formulaire d'Inscription

1. **Champs** :
   - Informations sur l'enfant (nom, prénom, date de naissance)
   - Catégorie (calculée automatiquement)
   - Informations du responsable
   - Acceptation des conditions

2. **Fonctionnalités** :
   - Calcul automatique de la catégorie selon l'âge
   - Affichage des tarifs correspondants
   - Validation complète des données
   - Envoi d'un email de confirmation

## Chargement de Données

### Fichiers JSON

Le site utilise des fichiers JSON pour le contenu dynamique :

1. **actualites.json** : Actualités de la page d'accueil
   ```json
   [
     {
       "id": 1,
       "titre": "Titre de l'actualité",
       "date": "2025-06-01",
       "image": "assets/actualites/image1.jpg",
       "contenu": "Texte de l'actualité...",
       "lien": "#"
     },
     ...
   ]
   ```

2. **equipes.json** : Informations sur les équipes
   ```json
   [
     {
       "categorie": "U6",
       "age": "Moins de 6 ans",
       "description": "Description de la catégorie...",
       "entrainements": ["Mercredi 14h-15h30"],
       "image": "assets/equipes/u6.jpg"
     },
     ...
   ]
   ```

3. **partenariat.json** : Informations sur les partenariats
   ```json
   {
     "formules": [
       {
         "nom": "Bronze",
         "prix": "500€",
         "avantages": ["Avantage 1", "Avantage 2", ...]
       },
       ...
     ],
     "sponsors": [
       {
         "nom": "Nom du sponsor",
         "logo": "assets/sponsors/logo1.png",
         "lien": "https://sponsor.com"
       },
       ...
     ]
   }
   ```

### Mise à Jour du Contenu

Pour mettre à jour le contenu du site :

1. Modifier les fichiers JSON correspondants
2. Ajouter les nouvelles images dans les dossiers appropriés
3. Déployer les modifications sur Azure Static Web Apps

## Problèmes Courants

### Problèmes de Formulaire

1. **Le formulaire ne s'envoie pas** :
   - Vérifier que tous les champs obligatoires sont remplis
   - Vérifier le format de l'email
   - Vérifier la connexion internet

2. **Message d'erreur après soumission** :
   - Vérifier les logs des Azure Functions
   - S'assurer que le service d'email est correctement configuré

### Problèmes d'Affichage

1. **Images qui ne s'affichent pas** :
   - Vérifier que les chemins dans les fichiers JSON sont corrects
   - S'assurer que les images sont présentes dans le bon dossier

2. **Contenu non mis à jour** :
   - Vider le cache du navigateur
   - Vérifier que les modifications ont été déployées

### Support

Pour toute assistance supplémentaire, contactez l'administrateur du site à admin@ovalsaone.fr.

---

*Guide mis à jour le 14 juin 2025*
