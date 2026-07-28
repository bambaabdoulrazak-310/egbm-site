# Cahier des charges — Site web EGBM

## 1. Contexte

EGBM (Entreprise Générale Bamba Mamadou) est une SARL unipersonnelle basée à Korhogo,
Côte d'Ivoire, active dans trois secteurs :
- Génie civil / BTP
- Distribution agro-chimique (engrais, herbicides, insecticides)
- Fourniture de matériaux industriels (tôles, contreplaqué, fil de fer, etc.)

Objectif : construire un vrai site web fonctionnel (pas une démo) pour remplacer/compléter
le prototype visuel déjà réalisé (fichier `egbm-site.jsx` joint), qui sert de référence
de design et de fonctionnalités mais tourne uniquement en mémoire, sans base de données
ni authentification réelle.

## 2. Structure générale : deux volets

### A. Site client (public, sans connexion)
Accessible à tout le monde, aucune authentification requise.
- **Accueil** : présentation d'EGBM, secteurs d'activité, chiffres clés
- **Produits** : catalogue filtrable par catégorie (BTP / Agro-chimique / Matériaux
  industriels), avec nom, prix, disponibilité
- **Services** : liste des services proposés
- **Publications / Événements** : fil d'actualités et d'événements (ex. salons,
  arrivages de stock, promotions)
- **Commande** : panier + formulaire (nom, téléphone, adresse) pour passer commande
- **Contact** : coordonnées, formulaire de contact
- **Réseaux sociaux** : liens Facebook et WhatsApp (numéro WhatsApp EGBM :
  +225 05 56 80 42 86) visibles en pied de page et sur la page Contact

### B. Espace entreprise (privé, connexion obligatoire)
Réservé au personnel autorisé. Le site client ne doit jamais être visible pour un
utilisateur non authentifié qui tenterait d'accéder à cette partie.
- **Tableau de bord** : chiffre d'affaires (basé sur les commandes), nombre de
  commandes en attente, stock total, produits les plus vendus (graphique simple)
- **Produits** : ajout / modification / suppression de produits (nom, catégorie,
  prix, stock, photo)
- **Publications** : création et gestion des publications/événements affichés côté
  client
- **Commandes** : liste des commandes reçues depuis le site client, avec changement
  de statut (Nouvelle / En cours / Livrée)
- **Facturation** : génération de Factures, Proformas et Devis avec calcul
  automatique (sous-total, TVA 18 %, total), numérotation automatique, aperçu
  imprimable
- **Utilisateurs & autorisations** (réservé au rôle Administrateur) : inviter
  d'autres personnes avec un accès "Gestionnaire" à l'espace entreprise, révoquer
  un accès

## 3. Rôles et permissions

| Rôle | Site client | Espace entreprise | Gérer les utilisateurs |
|---|---|---|---|
| Visiteur / Client | Oui | Non | Non |
| Gestionnaire | Oui | Oui (produits, publications, commandes, facturation) | Non |
| Administrateur (propriétaire) | Oui | Oui (tout) | Oui |

L'authentification doit être réelle et sécurisée (mots de passe hachés, sessions ou
tokens sécurisés côté serveur) — le prototype actuel simule ce système côté
navigateur uniquement et n'est pas sécurisé.

## 4. Modèle de données (suggestion)

- **Produit** : id, nom, catégorie, prix, stock, quantité vendue, photo, description
- **Publication** : id, type (Publication / Événement), titre, texte, date
- **Commande** : id, client (nom, téléphone, adresse), articles (produit, quantité,
  prix), total, statut, date
- **Document de facturation** : numéro, type (Facture / Proforma / Devis), client,
  lignes (produit, quantité, prix unitaire), sous-total, TVA, total, date
- **Utilisateur** : id, nom, email, mot de passe (haché), rôle (Administrateur /
  Gestionnaire)

## 5. Exigences non-fonctionnelles

- **Sauvegardes régulières** de la base de données
- **Environnements séparés** : test/développement vs production, pour tester les
  changements sans affecter le site que voient les clients
- **Historique du code** via Git/GitHub pour pouvoir revenir à une version stable
- **Hébergement fiable** avec bon taux de disponibilité
- **Responsive** : le site doit s'afficher correctement sur mobile, tablette et
  desktop (le prototype fourni contient déjà les ajustements responsive à reprendre)
- Éviter les dépendances lourdes ou instables pour les graphiques/visualisations
  (le prototype a eu un problème de page blanche en production à cause d'une
  bibliothèque de graphiques incompatible — préférer une solution simple et légère,
  ou bien tester soigneusement la compatibilité des versions avant de l'utiliser)

## 6. Identité visuelle

- Logo EGBM fourni (rond, couleurs orange / vert / blanc / or, silhouette de tête
  d'éléphant, bandeau "SARL")
- Palette du prototype : orange (#E8681E), vert (#128A4C), or/jaune sécurité
  (#F0A81C), gris ciment (#57544C), fond sable (#EAE4D6)
- Typographie du prototype : titres en police condensée type "Barlow Condensed",
  corps de texte en "Inter", données/numéros de documents en police monospace type
  "IBM Plex Mono"

## 7. Référence

Le fichier `egbm-site.jsx` joint est un prototype fonctionnel (React + Tailwind)
illustrant l'ensemble des écrans, du parcours utilisateur et du design attendu.
Il peut servir de base de code ou simplement de référence visuelle/fonctionnelle
selon la stack technique choisie pour la version définitive.
