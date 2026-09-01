# Steenland Foodservice

Repository de travail. Next.js (App Router) + TypeScript, PostgreSQL via Docker,
Drizzle ORM, Tailwind + shadcn/ui, SDK Anthropic.

## Prérequis

- Node 20 ou plus
- pnpm
- Docker (avec `docker compose`)
- Une clé API Anthropic

## Démarrage

```bash
pnpm install
```

Copiez `.env.example` vers `.env` et renseignez `ANTHROPIC_API_KEY`.

```bash
cp .env.example .env
```

Puis :

```bash
pnpm run setup
```

`setup` démarre PostgreSQL, applique les migrations, charge les données et vérifie
l'accès à l'API Anthropic. Note : `pnpm setup` sans `run` est une commande interne de
pnpm, il faut donc écrire `pnpm run setup`.

```bash
pnpm dev
```

L'application écoute sur http://localhost:3000 et affiche la boîte de réception
`orders@` : les 8 messages de `data/inbox/`, avec leur contenu brut et leurs pièces
jointes.

## Contenu du repository

| Chemin | Contenu |
| --- | --- |
| `app/` | Application Next.js |
| `components/ui/` | Composants shadcn/ui |
| `lib/db/` | Client Drizzle et schéma des tables |
| `lib/anthropic.ts` | Client Anthropic partagé |
| `lib/inbox.ts` | Lecture des fichiers de `data/inbox/` |
| `data/catalog.csv` | Catalogue produits, 300 SKU |
| `data/inbox/` | 8 commandes reçues : emails, un PDF joint, une photo |
| `docs/erp-import-spec.md` | Spécification du dossier d'import de l'ERP |
| `drizzle/` | Migrations |
| `erp/` | Dossiers de dépôt, de traitement et de rejet du simulateur ERP |
| `scripts/` | Scripts de setup, de seed, simulateur ERP, appel Claude |
| `tests/` | Tests Vitest |

## Données

`data/catalog.csv` : `sku_code`, `description_nl`, `description_fr`, `packaging`,
`unit`, `category`. Séparateur virgule, encodage UTF-8.

`data/inbox/` : 8 fichiers `.eml` en texte brut. Les pièces jointes sont des fichiers
séparés qui portent le même préfixe numérique que l'email (`06-*`, `07-*`) et sont
également nommées dans l'en-tête `X-Attachment`.

Base de données (`lib/db/schema.ts`) :

- `customers` — 40 clients. Les expéditeurs des 8 emails y figurent.
- `products` — les 300 SKU de `data/catalog.csv`.
- `order_history` / `order_history_lines` — 6 mois d'historique de commandes.
- `erp_orders` — lignes avalées par le simulateur d'import de l'ERP.

Les emails d'exemple sont datés du 27 août 2026 et l'historique couvre les six mois
qui précèdent cette date.

## Simulateur d'import ERP

`scripts/erp-import-simulator.ts` joue le rôle du job d'import décrit dans
`docs/erp-import-spec.md`. Il surveille un dossier de dépôt, valide les fichiers qui
s'y trouvent, écrit les lignes acceptées dans la table `erp_orders`, déplace les
fichiers acceptés vers `erp/processed/` et les fichiers refusés vers `erp/rejected/`
accompagnés d'un journal de rejet.

Un passage à la demande :

```bash
pnpm erp:run-once
```

En continu, selon la planification :

```bash
pnpm erp:simulator
```

La planification vient de `ERP_IMPORT_CRON` dans `.env` (valeur par défaut :
`0 23 * * *`). Les chemins des dossiers viennent de `ERP_DROP_DIR`,
`ERP_PROCESSED_DIR`, `ERP_REJECTED_DIR` et `ERP_LOG_DIR`.

## Appeler Claude

Le client est dans `lib/anthropic.ts`. Un appel d'exemple :

```bash
pnpm hello-claude
```

## Commandes

| Commande | Effet |
| --- | --- |
| `pnpm run setup` | Base de données, migrations, données, vérification de l'API |
| `pnpm dev` | Serveur de développement |
| `pnpm test` | Tests Vitest |
| `pnpm reset` | Remet le repository dans son état initial |
| `pnpm db:generate` | Génère une migration à partir de `lib/db/schema.ts` |
| `pnpm db:migrate` | Applique les migrations |
| `pnpm db:seed` | Recharge les données |
| `pnpm erp:run-once` | Un passage du job d'import de l'ERP |
| `pnpm erp:simulator` | Job d'import de l'ERP en continu |
| `pnpm hello-claude` | Appel d'exemple à l'API Anthropic |

## Réinitialisation

```bash
pnpm reset
```

Recrée la base, rejoue les migrations et le seed, vide `erp/drop`, `erp/processed`,
`erp/rejected` et `erp/logs`, et supprime le cache de build.
