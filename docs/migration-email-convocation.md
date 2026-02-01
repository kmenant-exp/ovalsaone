# Migration : Ajout de l'email comme critère de convocation

**Date** : 1er février 2026

## Changements effectués

### 1. Base de données (D1)
- **Nouvelle migration** : `0003_add_email_column.sql`
  - Ajout de la colonne `email TEXT` à la table `convocations`
  - Ajout d'un index sur `email` pour améliorer les performances
  - **Index unique composite** sur `(event_name, event_date, email)` pour garantir qu'un email ne peut répondre qu'une seule fois par événement

### 2. Backend (Cloudflare Pages Functions)
**Fichier** : `functions/api/convocation.ts`

#### Interface ConvocationForm
- Ajout du champ `email: string`

#### Validation
- Ajout de règles de validation pour l'email :
  - Format email valide (regex)
  - Longueur maximale de 100 caractères
  - Champ requis

#### Logique de vérification
**Avant** :
```typescript
findExistingConvocation(eventName, eventDate, firstName, lastName)
```
Utilisait 4 critères : nom de l'événement, date, prénom, nom

**Après** :
```typescript
findExistingConvocation(eventName, eventDate, email)
```
Utilise 3 critères : nom de l'événement, date, **email**

#### Opérations de base de données
- **INSERT** : Ajout du champ `email` (normalisé en minuscules)
- **UPDATE** : 
  - Critère WHERE basé sur `email` au lieu de `first_name` + `last_name`
  - Mise à jour également de `first_name` et `last_name` (permet de corriger des typos)

### 3. Frontend (JavaScript)
**Fichier** : `pages/src/js/convocations.js`

#### Formulaire HTML
- Ajout d'un champ email après le nom :
  ```html
  <input type="email" id="conv-email" name="email" required 
         placeholder="votre@email.com" maxlength="100">
  ```

#### Soumission
- Ajout de `email: form.email.value.trim()` dans les données envoyées à l'API

### 4. Worker de notification
**Fichier** : `workers/weekly-notification/src/index.ts`

- Ajout du champ `email: string` dans l'interface `Convocation`

## Impacts et bénéfices

### ✅ Avantages
1. **Identification unique** : L'email est un identifiant plus fiable que prénom + nom (évite les homonymes)
2. **Mise à jour intelligente** : Si quelqu'un change son nom/prénom (typo, mariage, etc.), la convocation est correctement mise à jour
3. **Traçabilité** : Possibilité future d'envoyer des confirmations par email
4. **RGPD** : Base pour gérer les consentements et droits des utilisateurs

### ⚠️ Considérations
1. **Migration des données existantes** : Les convocations existantes auront `email = NULL`
   - Option 1 : Migrer manuellement les emails connus
   - Option 2 : Attendre que les utilisateurs re-soumettent avec leur email

2. **Contrainte d'unicité** : L'index unique empêche les doublons automatiquement
   - Si un email tente de soumettre deux fois, la seconde sera une mise à jour

## Déploiement

### Étape 1 : Appliquer la migration D1
```bash
cd workers/weekly-notification
npx wrangler d1 migrations apply DB --local  # Test en local
npx wrangler d1 migrations apply DB           # Production
```

### Étape 2 : Déployer le backend
```bash
cd pages
npm run deploy:pages
```

### Étape 3 : Les modifications frontend sont incluses dans le build statique

## Tests à effectuer

- [ ] Créer une nouvelle convocation avec un email
- [ ] Vérifier que le même email ne peut pas créer deux convocations pour le même événement
- [ ] Modifier une convocation existante (vérifier UPDATE)
- [ ] Tester la validation d'email invalide
- [ ] Vérifier que les notifications hebdomadaires fonctionnent toujours
- [ ] Tester avec/sans covoiturage

## Rollback

Si besoin de revenir en arrière :
1. Restaurer les fichiers TypeScript depuis le commit précédent
2. La colonne `email` peut rester en DB (sera simplement ignorée)
3. Redéployer

## Prochaines étapes possibles

1. Envoyer des emails de confirmation après soumission
2. Permettre aux utilisateurs de voir leurs convocations via leur email
3. Implémenter un système d'authentification basé sur l'email
4. Ajouter des rappels automatiques par email
