import { copyFileSync, existsSync } from "node:fs";
import path from "node:path";

import { run, waitForPostgres } from "./lib/shell";

const root = process.cwd();

function step(message: string) {
  console.log(`\n→ ${message}`);
}

async function main() {
  const envPath = path.join(root, ".env");
  if (!existsSync(envPath)) {
    step(".env absent, copie depuis .env.example");
    copyFileSync(path.join(root, ".env.example"), envPath);
  }

  step("Demarrage de Postgres (docker compose)");
  run("docker", ["compose", "up", "-d"]);

  step("Attente de Postgres");
  await waitForPostgres();
  console.log("Postgres est pret.");

  step("Application des migrations");
  run("pnpm", ["exec", "drizzle-kit", "migrate"]);

  step("Chargement des donnees");
  run("pnpm", ["exec", "tsx", "scripts/seed.ts"]);

  step("Verification de l'acces a l'API Anthropic (optionnel)");
  run("pnpm", ["exec", "tsx", "scripts/check-anthropic.ts"]);

  console.log("\nSetup termine. Lancez `pnpm dev`.");
}

main().catch((error) => {
  console.error(`\n${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
