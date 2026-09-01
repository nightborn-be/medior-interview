import "dotenv/config";
import { existsSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";

import postgres from "postgres";

import { run, waitForPostgres } from "./lib/shell";

const root = process.cwd();

function step(message: string) {
  console.log(`\n→ ${message}`);
}

function emptyDirectory(dir: string) {
  const absolute = path.isAbsolute(dir) ? dir : path.join(root, dir);
  if (!existsSync(absolute)) return;
  for (const entry of readdirSync(absolute)) {
    if (entry === ".gitkeep") continue;
    rmSync(path.join(absolute, entry), { recursive: true, force: true });
  }
}

async function main() {
  step("Demarrage de Postgres (docker compose)");
  run("docker", ["compose", "up", "-d"]);
  await waitForPostgres();

  step("Recreation de la base");
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, onnotice: () => {} });
  await sql.unsafe("drop schema if exists public cascade");
  await sql.unsafe("drop schema if exists drizzle cascade");
  await sql.unsafe("create schema public");
  await sql.end();

  step("Application des migrations");
  run("pnpm", ["exec", "drizzle-kit", "migrate"]);

  step("Chargement des donnees");
  run("pnpm", ["exec", "tsx", "scripts/seed.ts"]);

  step("Nettoyage des dossiers de l'ERP et des fichiers generes");
  for (const dir of [
    process.env.ERP_DROP_DIR ?? "./erp/drop",
    process.env.ERP_PROCESSED_DIR ?? "./erp/processed",
    process.env.ERP_REJECTED_DIR ?? "./erp/rejected",
    process.env.ERP_LOG_DIR ?? "./erp/logs",
  ]) {
    emptyDirectory(dir);
  }
  rmSync(path.join(root, ".next"), { recursive: true, force: true });

  console.log("\nRepo remis a son etat initial.");
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
