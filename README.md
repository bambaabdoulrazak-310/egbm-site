# EGBM — Site web

Site web d'EGBM (Entreprise Générale Bamba Mamadou, Korhogo, Côte d'Ivoire) : catalogue
public + commandes, et un espace entreprise privé (produits, publications, commandes,
facturation, utilisateurs). Voir [doc/extracted/cahier-des-charges-egbm.md](doc/extracted/cahier-des-charges-egbm.md)
pour les exigences complètes.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, TypeScript, Server Actions)
- [Prisma ORM](https://www.prisma.io) 7 + PostgreSQL
- Authentification maison (cookies httpOnly signés avec [jose](https://github.com/panva/jose), mots de passe hachés avec bcryptjs) — pas d'OAuth requis par le cahier des charges
- Tailwind CSS v4

> Ce projet a été généré avec des versions très récentes de Next.js et Prisma. Avant de
> modifier `src/proxy.ts`, l'authentification, ou le schéma Prisma, relisez
> `AGENTS.md` et la documentation embarquée dans `node_modules/next/dist/docs` /
> `.claude/skills/prisma-*` : plusieurs conventions ont changé par rapport aux versions
> antérieures (ex. `middleware.ts` → `proxy.ts`, Prisma Client nécessite un driver adapter).

## Installation locale

### 1. Prérequis

- Node.js 20+ (LTS recommandé)
- Une base PostgreSQL accessible en développement — deux options :
  - **Neon** (recommandé, gratuit, aucune installation) : créez un projet sur
    [neon.tech](https://neon.tech) et récupérez la chaîne de connexion.
  - **PostgreSQL local**.

### 2. Configuration

```bash
npm install
cp .env.example .env.local
```

Éditez `.env.local` :

- `DATABASE_URL` — votre chaîne de connexion Postgres.
- `AUTH_SECRET` — valeur aléatoire longue (`openssl rand -base64 32`).
- `BLOB_READ_WRITE_TOKEN` — pour l'upload des photos produits (Vercel Storage → Blob).
  En local, sans ce token, la création de produit fonctionne mais l'envoi de photo échoue.
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` / `SEED_ADMIN_NAME` — compte Administrateur
  créé par le seed (uniquement utilisé par le script, jamais stocké en clair ailleurs).

### 3. Base de données

```bash
npx prisma migrate deploy   # applique les migrations existantes
npx prisma db seed          # crée le compte Administrateur + données de démo
```

(En développement actif sur le schéma, `npx prisma migrate dev` régénère aussi le client
et crée de nouvelles migrations à partir de vos changements dans `prisma/schema.prisma`.)

### 4. Lancer le site

```bash
npm run dev
```

- Site public : http://localhost:3000
- Espace entreprise : http://localhost:3000/connexion (compte seedé ci-dessus)

## Structure du projet

```
src/app/(site)/          pages publiques (accueil, produits, commande, contact...)
src/app/connexion/       page de connexion
src/app/espace-entreprise/  espace protégé (dashboard, produits, facturation, utilisateurs...)
src/lib/actions/         Server Actions (mutations : commandes, produits, facturation...)
src/lib/session.ts       sessions signées (JWT httpOnly)
src/lib/auth-guard.ts    garde-fous serveur (requireSession / requireAdmin)
src/proxy.ts             première ligne de défense sur /espace-entreprise/**
prisma/schema.prisma     modèle de données
```

Rôles : **Administrateur** (tout, y compris gestion des utilisateurs) et **Gestionnaire**
(produits, publications, commandes, facturation). Voir `src/lib/actions/users.ts`.

## Déploiement (VPS + Docker)

Le projet inclut un `Dockerfile`, un `docker-compose.yml` (app + PostgreSQL + Caddy pour
le HTTPS automatique) et un script de sauvegarde.

Sur le VPS (Docker + Docker Compose installés) :

```bash
git clone <votre-repo> egbm && cd egbm
cp .env.production.example .env
# éditez .env : POSTGRES_PASSWORD, AUTH_SECRET, DOMAIN (votre nom de domaine, pointé vers le VPS)

docker compose up -d --build
```

Les migrations sont appliquées automatiquement au démarrage du conteneur `app`
(`docker-entrypoint.sh`). Pour créer le compte Administrateur la première fois :

```bash
docker compose exec -e SEED_ADMIN_EMAIL=admin@egbm.ci -e SEED_ADMIN_PASSWORD=... \
  -e SEED_ADMIN_NAME="Administrateur EGBM" app npx prisma db seed
```

Les photos de produits sont stockées sur [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
(pas sur le disque local — celui-ci n'est pas persistant en environnement serverless).
Créez un store dans Vercel (Storage → Create Database → Blob), connectez-le au
projet, et le token `BLOB_READ_WRITE_TOKEN` sera injecté automatiquement. Pour
un déploiement VPS/Docker, ajoutez ce même token dans `.env` (voir
`.env.production.example`) — Vercel Blob fonctionne indépendamment de l'hébergement.

### Environnements séparés

- **Développement** : `.env.local` + votre base Neon/locale, `npm run dev`.
- **Production** : `.env` sur le VPS (jamais commit) + base Postgres dédiée dans le conteneur
  `db`. Ne jamais pointer le développement vers la base de production.

### Sauvegardes

`scripts/backup-db.sh` fait un `pg_dump` compressé du conteneur `db` et purge les
sauvegardes de plus de 14 jours. À planifier via cron sur le VPS :

```bash
crontab -e
# 0 3 * * * /chemin/vers/egbm/scripts/backup-db.sh >> /var/log/egbm-backup.log 2>&1
```

### Mettre à jour la prod

```bash
git pull
docker compose up -d --build
```

## Historique du code

Dépôt Git initialisé dans ce dossier. Poussez-le vers GitHub/GitLab dès que possible pour
avoir une sauvegarde distante et pouvoir revenir à une version stable :

```bash
git remote add origin <url-de-votre-repo>
git push -u origin master
```

## Commandes utiles

```bash
npm run dev             # serveur de développement
npm run build            # build de production (vérifie aussi les types)
npm run lint              # ESLint
npx prisma studio         # explorateur de base de données
npx prisma migrate dev    # nouvelle migration à partir du schéma
```
