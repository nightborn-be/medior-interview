import "dotenv/config";

import { DEFAULT_MODEL, anthropic } from "../src/lib/anthropic";

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log(
      "ANTHROPIC_API_KEY n'est pas defini : appel au modele non teste. " +
        "L'exercice n'en a pas besoin.",
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
  // La cle est optionnelle : un echec ici ne bloque pas le setup.
  console.warn("Appel a l'API Anthropic impossible :");
  console.warn(error instanceof Error ? error.message : error);
  console.warn("L'exercice n'a pas besoin d'appel a un modele, le setup continue.");
});
