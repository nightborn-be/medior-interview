# Steenland Foodservice

> **Tu viens d'arriver ici ?** L'exercice est dans **[`ENONCE.md`](ENONCE.md)**. Lis-le en
> premier, puis le compte rendu de l'appel client dans [`FAITS-CLIENT.md`](FAITS-CLIENT.md).
> Tes réponses vont dans le dossier [`rendu/`](rendu/), dont les squelettes sont déjà en place.

Ce README ne documente que la technique : comment démarrer, ce qu'il y a où, quelles commandes
existent.

Next.js (App Router) + TypeScript, PostgreSQL via Docker, Drizzle ORM, Tailwind + shadcn/ui.

## Prérequis

- Node 20 ou plus
- pnpm
- Docker (avec `docker compose`)

## Démarrage

```bash
pnpm install
```

```bash
pnpm run setup
```

`setup` copie `.env.example` vers `.env` si besoin, démarre PostgreSQL, applique les migrations
et charge les données. Note : `pnpm setup` sans `run` est une commande interne de pnpm, il faut
donc écrire `pnpm run setup`.

```bash
pnpm dev
```

L'application écoute sur http://localhost:3000 et affiche la boîte de réception `orders@` : les
8 commandes de `data/inbox/`, avec leur contenu brut et leurs pièces jointes.

Si un problème d'installation te bloque plus de dix minutes, note-le dans ton rendu et
contourne-le.

## Contenu du repository

| Chemin | Contenu |
| --- | --- |
| `ENONCE.md` | L'exercice |
| `FAITS-CLIENT.md` | Compte rendu de l'appel de cadrage avec le client |
| `rendu/` | Les fichiers que tu remplis |
| `data/catalog.csv` | Catalogue produits, 300 SKU |
| `data/lignes-transcrites.json` | Les 8 commandes, transcrites telles que les clients les ont écrites |
| `data/inbox/` | Les mêmes commandes dans leur format d'origine : emails, un PDF joint, une photo |
| `docs/erp-import-spec.md` | Spécification du dossier d'import de l'ERP |
| `docs/annexe-plan-exemple.md` | Un plan de build Nightborn complet, sur un autre projet |
| `scripts/` | Setup, seed, reset, simulateur ERP |
| `app/`, `components/ui/`, `lib/` | L'application Next.js |
| `drizzle/` | Migrations |
| `erp/` | Dossiers de dépôt, de traitement et de rejet du simulateur ERP |
| `tests/` | Tests Vitest |

## Données

`data/catalog.csv` : `sku_code`, `description_nl`, `description_fr`, `packaging`, `unit`,
`category`. Séparateur virgule, encodage UTF-8.

`data/lignes-transcrites.json` : les lignes des 8 commandes, telles quelles, avec le code client
et la mention de livraison quand il y en a une. Aucun rapprochement avec le catalogue n'a été
fait.

`data/inbox/` : 8 fichiers `.eml` en texte brut. Les pièces jointes sont des fichiers séparés
qui portent le même préfixe numérique que l'email (`06-*`, `07-*`) et sont aussi nommées dans
l'en-tête `X-Attachment`.

Base de données (`lib/db/schema.ts`) :

- `customers` : 40 clients. Les expéditeurs des 8 commandes y figurent.
- `products` : les 300 SKU de `data/catalog.csv`.
- `order_history` / `order_history_lines` : 6 mois d'historique de commandes.
- `erp_orders` : lignes avalées par le simulateur d'import de l'ERP.

Les commandes d'exemple sont datées du 27 août 2026 et l'historique couvre les six mois qui
précèdent cette date.

## Simulateur d'import ERP

`scripts/erp-import-simulator.ts` joue le rôle du job d'import décrit dans
`docs/erp-import-spec.md`. Il surveille un dossier de dépôt, valide les fichiers qui s'y
trouvent, écrit les lignes acceptées dans la table `erp_orders`, déplace les fichiers acceptés
vers `erp/processed/` et les fichiers refusés vers `erp/rejected/` accompagnés d'un journal de
rejet.

Un passage à la demande :

```bash
pnpm erp:run-once
```

En continu, selon la planification :

```bash
pnpm erp:simulator
```

La planification vient de `ERP_IMPORT_CRON` dans `.env` (valeur par défaut : `0 23 * * *`). Les
chemins des dossiers viennent de `ERP_DROP_DIR`, `ERP_PROCESSED_DIR`, `ERP_REJECTED_DIR` et
`ERP_LOG_DIR`.

## Appeler un modèle (optionnel)

L'exercice ne demande aucun appel à un modèle. Si tu veux quand même en faire, le SDK Anthropic
est installé et le client est dans `lib/anthropic.ts`. Renseigne `ANTHROPIC_API_KEY` dans `.env`,
puis :

```bash
pnpm hello-claude
```

Sans clé, tout le reste fonctionne normalement.

## Commandes

| Commande | Effet |
| --- | --- |
| `pnpm run setup` | Base de données, migrations, données |
| `pnpm dev` | Serveur de développement |
| `pnpm test` | Tests Vitest |
| `pnpm reset` | Remet le repository dans son état initial |
| `pnpm db:generate` | Génère une migration à partir de `lib/db/schema.ts` |
| `pnpm db:migrate` | Applique les migrations |
| `pnpm db:seed` | Recharge les données |
| `pnpm erp:run-once` | Un passage du job d'import de l'ERP |
| `pnpm erp:simulator` | Job d'import de l'ERP en continu |
| `pnpm hello-claude` | Appel d'exemple à l'API Anthropic (nécessite une clé) |

## Réinitialisation

```bash
pnpm reset
```

Recrée la base, rejoue les migrations et le seed, vide `erp/drop`, `erp/processed`,
`erp/rejected` et `erp/logs`, et supprime le cache de build.
