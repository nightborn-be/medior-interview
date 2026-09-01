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
});
