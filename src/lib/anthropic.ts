import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";

/**
 * Client Anthropic partage. La cle vient de ANTHROPIC_API_KEY (.env).
 */
export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Modele utilise par defaut dans ce repo. */
export const DEFAULT_MODEL = "claude-sonnet-5";
