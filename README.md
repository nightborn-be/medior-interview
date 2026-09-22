# Steenland Foodservice

> **Start here.** The exercise exists in two languages. Pick one and stay in it.
>
> - **English** → [`en/EXERCISE.md`](en/EXERCISE.md), then [`en/CLIENT-FACTS.md`](en/CLIENT-FACTS.md). Your answers go in [`en/answers/`](en/answers/).
> - **Français** → [`fr/ENONCE.md`](fr/ENONCE.md), puis [`fr/FAITS-CLIENT.md`](fr/FAITS-CLIENT.md). Tes réponses vont dans [`fr/rendu/`](fr/rendu/).
>
> Fill in **one** of the two answer folders, not both. Leave the other one as it is.

This README only documents the technical side: how to start, what lives where, which commands
exist. Every path below is relative to the root of the repository.

Next.js (App Router) + TypeScript, PostgreSQL via Docker, Drizzle ORM, Tailwind + shadcn/ui.

## Requirements

- Node 20 or later
- pnpm
- Docker (with `docker compose`)

## Getting started

```bash
pnpm install
```

```bash
pnpm run setup
```

`setup` copies `.env.example` to `.env` if needed, starts PostgreSQL, applies the migrations and
loads the data. Note: `pnpm setup` without `run` is an internal pnpm command, so you have to
write `pnpm run setup`.

```bash
pnpm dev
```

The application listens on http://localhost:3000 and shows the `orders@` inbox: the 8 orders
from `data/inbox/`, with their raw content and their attachments.

If a setup problem blocks you for more than ten minutes, write it down in your answers and work
around it.

## Repository contents

| Path | Contents |
| --- | --- |
| `en/`, `fr/` | The same documents in English and in French: the exercise, the client call notes, the ERP specification, the build plan example, and the answer templates |
| `data/catalog.csv` | Product catalogue, 300 SKUs |
| `data/lignes-transcrites.json` | The 8 orders, transcribed exactly as the customers wrote them |
| `data/inbox/` | The same orders in their original format: emails, one attached PDF, one photo |
| `scripts/` | Setup, seed, reset, ERP simulator |
| `src/` | The Next.js application: `src/app/`, `src/components/ui/`, `src/lib/` |
| `drizzle/` | Migrations |
| `erp/` | Drop, processed and rejected folders for the ERP simulator |
| `tests/` | Vitest tests |

Inside each language folder:

| `en/` | `fr/` |
| --- | --- |
| `EXERCISE.md` | `ENONCE.md` |
| `CLIENT-FACTS.md` | `FAITS-CLIENT.md` |
| `erp-import-spec.md` | `erp-import-spec.md` |
| `build-plan-example.md` | `annexe-plan-exemple.md` |
| `answers/` | `rendu/` |

## Data

The data is **not** translated. The product descriptions and the customer orders are in Dutch and
French because that is what the customers actually write, and that multilingual catalogue is the
real difficulty of the case.

`data/catalog.csv`: `sku_code`, `description_nl`, `description_fr`, `packaging`, `unit`,
`category`. Comma separated, UTF-8.

`data/lignes-transcrites.json`: the lines of the 8 orders, as written, with the customer code and
the delivery mention when there is one. No match against the catalogue has been made. The field
names are French: `commandes` are the orders, `lignes` the order lines, `client` the customer
name, `langue` the language, `fichier_source` the original file, `mention_livraison` any delivery
date the customer mentioned, and `recu_le` the time it arrived.

`data/inbox/`: 8 plain-text `.eml` files. Attachments are separate files carrying the same
numeric prefix as the email (`06-*`, `07-*`) and are also named in the `X-Attachment` header.

Database (`src/lib/db/schema.ts`):

- `customers` : 40 customers. The senders of the 8 orders are among them.
- `products` : the 300 SKUs from `data/catalog.csv`.
- `order_history` / `order_history_lines` : 6 months of order history.
- `erp_orders` : lines swallowed by the ERP import simulator.

The sample orders are dated 27 August 2026 and the history covers the six months before that
date.

## ERP import simulator

`scripts/erp-import-simulator.ts` plays the role of the import job described in
`en/erp-import-spec.md`. It watches a drop folder, validates the files it finds there, writes
accepted lines into the `erp_orders` table, moves accepted files to `erp/processed/` and rejected
files to `erp/rejected/` along with a rejection log.

A single pass on demand:

```bash
pnpm erp:run-once
```

Continuously, on schedule:

```bash
pnpm erp:simulator
```

The schedule comes from `ERP_IMPORT_CRON` in `.env` (default: `0 23 * * *`). The folder paths come
from `ERP_DROP_DIR`, `ERP_PROCESSED_DIR`, `ERP_REJECTED_DIR` and `ERP_LOG_DIR`.

## Calling a model (optional)

The exercise requires no model call at all. If you want to make one anyway, the Anthropic SDK is
installed and the client is in `src/lib/anthropic.ts`. Set `ANTHROPIC_API_KEY` in `.env`, then:

```bash
pnpm hello-claude
```

Without a key, everything else works normally.

## Commands

| Command | Effect |
| --- | --- |
| `pnpm run setup` | Database, migrations, data |
| `pnpm dev` | Development server |
| `pnpm test` | Vitest tests |
| `pnpm reset` | Puts the repository back to its initial state |
| `pnpm db:generate` | Generates a migration from `src/lib/db/schema.ts` |
| `pnpm db:migrate` | Applies the migrations |
| `pnpm db:seed` | Reloads the data |
| `pnpm erp:run-once` | One pass of the ERP import job |
| `pnpm erp:simulator` | ERP import job, continuously |
| `pnpm hello-claude` | Sample call to the Anthropic API (needs a key) |

## Reset

```bash
pnpm reset
```

Recreates the database, replays the migrations and the seed, empties `erp/drop`,
`erp/processed`, `erp/rejected` and `erp/logs`, and deletes the build cache.
