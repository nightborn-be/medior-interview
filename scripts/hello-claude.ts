import "dotenv/config";

import { DEFAULT_MODEL, anthropic } from "../src/lib/anthropic";

async function main() {
  const response = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: "Presente-toi en deux phrases, en francais.",
      },
    ],
  });

  for (const block of response.content) {
    if (block.type === "text") {
      console.log(block.text);
    }
  }

  console.log(
    `\n[${response.model}] tokens: ${response.usage.input_tokens} entree / ${response.usage.output_tokens} sortie`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
