import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("jeu de donnees du repo", () => {
  it("le catalogue contient 300 SKU", () => {
    const csv = readFileSync(path.join(root, "data", "catalog.csv"), "utf-8").trim();
    const lines = csv.split("\n");
    expect(lines[0]).toBe("sku_code,description_nl,description_fr,packaging,unit,category");
    expect(lines.length - 1).toBe(300);
  });

  it("la boite de reception contient 8 messages", () => {
    const files = readdirSync(path.join(root, "data", "inbox"));
    expect(files.filter((f) => f.endsWith(".eml")).length).toBe(8);
  });

  it("les squelettes de rendu existent dans les deux langues", () => {
    const fr = readdirSync(path.join(root, "fr", "rendu")).filter((f) => f.endsWith(".md"));
    const en = readdirSync(path.join(root, "en", "answers")).filter((f) => f.endsWith(".md"));
    expect(fr).toHaveLength(6);
    expect(en).toHaveLength(6);
  });

  it("chaque commande transcrite pointe vers un fichier existant de data/inbox/", () => {
    const inbox = new Set(readdirSync(path.join(root, "data", "inbox")));
    const transcrites = JSON.parse(
      readFileSync(path.join(root, "data", "lignes-transcrites.json"), "utf-8"),
    ) as { commandes: { fichier_source: string; lignes: string[] }[] };

    expect(transcrites.commandes).toHaveLength(8);
    for (const commande of transcrites.commandes) {
      expect(inbox.has(commande.fichier_source)).toBe(true);
      expect(commande.lignes.length).toBeGreaterThan(0);
    }
  });
});
