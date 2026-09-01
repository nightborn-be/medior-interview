import "dotenv/config";

import { DEFAULT_MODEL, anthropic } from "../lib/anthropic";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn(
      "ANTHROPIC_API_KEY n'est pas defini dans .env : l'appel au modele n'a pas ete teste.",
    );
    return;
  }

  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 16,
    messages: [{ role: "user", content: "Reponds uniquement par: ok" }],
  });

  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  console.log(`API Anthropic joignable (${DEFAULT_MODEL}) : ${text}`);
}

main().catch((error) => {
  console.error("Appel a l'API Anthropic impossible :");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
