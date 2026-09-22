import "dotenv/config";
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";

import cron from "node-cron";

import { db, schema, sql } from "../src/lib/db";

/**
 * Simulateur du job d'import de l'ERP.
 * Le comportement attendu est decrit dans erp-import-spec.md (en/ ou fr/).
 */

const root = process.cwd();

const DROP_DIR = resolve(process.env.ERP_DROP_DIR ?? "./erp/drop");
const PROCESSED_DIR = resolve(process.env.ERP_PROCESSED_DIR ?? "./erp/processed");
const REJECTED_DIR = resolve(process.env.ERP_REJECTED_DIR ?? "./erp/rejected");
const LOG_DIR = resolve(process.env.ERP_LOG_DIR ?? "./erp/logs");
const IMPORT_CRON = process.env.ERP_IMPORT_CRON ?? "0 23 * * *";

const HEADER = "customer_code;sku_code;quantity;requested_delivery_date";
const MAX_DATA_LINES = 5000;

function resolve(dir: string) {
  return path.isAbsolute(dir) ? dir : path.join(root, dir);
}

function ensureDirectories() {
  for (const dir of [DROP_DIR, PROCESSED_DIR, REJECTED_DIR, LOG_DIR]) {
    mkdirSync(dir, { recursive: true });
  }
}

function timestamp() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function journal(message: string) {
  const day = new Date().toISOString().slice(0, 10);
  appendFileSync(path.join(LOG_DIR, `import-${day}.log`), `${timestamp()}  ${message}\n`, "utf-8");
  console.log(message);
}

function moveWithoutOverwrite(from: string, toDir: string, name: string) {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  let target = path.join(toDir, name);
  let index = 1;
  while (existsSync(target)) {
    target = path.join(toDir, `${base}-${index}${ext}`);
    index += 1;
  }
  renameSync(from, target);
  return target;
}

// ------------------------------------------------------------- validation

type ParsedLine = {
  customerCode: string;
  skuCode: string;
  quantity: string;
  requestedDeliveryDate: string;
};

type Problem = { line: number; reason: string };

const CUSTOMER_CODE = /^K\d{5}$/;
const SKU_CODE = /^\d{6}$/;
const QUANTITY = /^\d+(\.\d{1,3})?$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string) {
  const [y, m, d] = value.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  return (
    date.getUTCFullYear() === y && date.getUTCMonth() === m - 1 && date.getUTCDate() === d
  );
}

function validateFileName(name: string): string | null {
  if (path.extname(name) !== ".csv") {
    return "l'extension doit etre .csv en minuscules";
  }
  if (/\s/.test(name)) {
    return "le nom de fichier ne peut pas contenir d'espace";
  }
  // eslint-disable-next-line no-control-regex
  if (/[^\x20-\x7E]/.test(name)) {
    return "le nom de fichier ne peut contenir que des caracteres ASCII";
  }
  return null;
}

async function validateFile(
  raw: Buffer,
): Promise<{ lines: ParsedLine[]; problems: Problem[] }> {
  const problems: Problem[] = [];
  const lines: ParsedLine[] = [];

  const content = raw.toString("latin1");

  if (content.length === 0) {
    problems.push({ line: 0, reason: "fichier vide" });
    return { lines, problems };
  }

  if (/(^|[^\r])\n/.test(content)) {
    problems.push({
      line: 0,
      reason: "fins de ligne invalides : CRLF attendu (\\r\\n)",
    });
    return { lines, problems };
  }

  const rows = content.split("\r\n");
  if (rows.length > 0 && rows[rows.length - 1] === "") {
    rows.pop();
  }

  if (rows[0] !== HEADER) {
    problems.push({
      line: 1,
      reason: `ligne d'en-tete attendue "${HEADER}", trouve "${rows[0] ?? ""}"`,
    });
    return { lines, problems };
  }

  const dataRows = rows.slice(1);
  if (dataRows.length === 0) {
    problems.push({ line: 0, reason: "aucune ligne de donnees" });
    return { lines, problems };
  }
  if (dataRows.length > MAX_DATA_LINES) {
    problems.push({
      line: 0,
      reason: `${dataRows.length} lignes de donnees, maximum ${MAX_DATA_LINES}`,
    });
    return { lines, problems };
  }

  const knownCustomers = new Set(
    (await db.select({ code: schema.customers.code }).from(schema.customers)).map((c) => c.code),
  );
  const knownSkus = new Set(
    (await db.select({ code: schema.products.skuCode }).from(schema.products)).map((p) => p.code),
  );

  dataRows.forEach((row, index) => {
    const lineNumber = index + 2;

    if (row === "") {
      problems.push({ line: lineNumber, reason: "ligne vide" });
      return;
    }
    if (row.includes('"')) {
      problems.push({ line: lineNumber, reason: "les guillemets ne sont pas supportes" });
      return;
    }

    const fields = row.split(";");
    if (fields.length !== 4) {
      problems.push({
        line: lineNumber,
        reason: `${fields.length} champ(s) au lieu de 4, separateur attendu ";"`,
      });
      return;
    }

    const [customerCode, skuCode, quantity, requestedDeliveryDate] = fields;

    if (!CUSTOMER_CODE.test(customerCode)) {
      problems.push({
        line: lineNumber,
        reason: `customer_code "${customerCode}" : format attendu K suivi de 5 chiffres`,
      });
    } else if (!knownCustomers.has(customerCode)) {
      problems.push({
        line: lineNumber,
        reason: `customer_code "${customerCode}" : client inconnu`,
      });
    }

    if (!SKU_CODE.test(skuCode)) {
      problems.push({
        line: lineNumber,
        reason: `sku_code "${skuCode}" : format attendu 6 chiffres`,
      });
    } else if (!knownSkus.has(skuCode)) {
      problems.push({ line: lineNumber, reason: `sku_code "${skuCode}" : article inconnu` });
    }

    if (!QUANTITY.test(quantity)) {
      problems.push({
        line: lineNumber,
        reason: `quantity "${quantity}" : decimal a 3 decimales maximum, separateur "."`,
      });
    } else {
      const value = Number(quantity);
      if (!(value > 0)) {
        problems.push({ line: lineNumber, reason: `quantity "${quantity}" : doit etre > 0` });
      } else if (value > 9999.999) {
        problems.push({
          line: lineNumber,
          reason: `quantity "${quantity}" : doit etre <= 9999.999`,
        });
      }
    }

    if (!ISO_DATE.test(requestedDeliveryDate) || !isRealDate(requestedDeliveryDate)) {
      problems.push({
        line: lineNumber,
        reason: `requested_delivery_date "${requestedDeliveryDate}" : format attendu YYYY-MM-DD`,
      });
    }

    lines.push({ customerCode, skuCode, quantity, requestedDeliveryDate });
  });

  return { lines, problems };
}

// ----------------------------------------------------------------- passage

function writeRejectionLog(target: string, name: string, problems: Problem[]) {
  const body = [
    `Fichier   : ${name}`,
    `Traite le : ${timestamp()}`,
    `Resultat  : REFUSE`,
    "",
    "Le fichier entier est refuse. Aucune ligne n'a ete importee.",
    "",
    ...problems.map((p) => (p.line === 0 ? `  fichier : ${p.reason}` : `  ligne ${p.line} : ${p.reason}`)),
    "",
  ].join("\n");
  writeFileSync(`${target}.log`, body, "utf-8");
}

async function runPass() {
  ensureDirectories();

  const entries = readdirSync(DROP_DIR).filter((name) => {
    if (name === ".gitkeep" || name.startsWith(".")) return false;
    return statSync(path.join(DROP_DIR, name)).isFile();
  });

  journal(`Job d'import : ${entries.length} fichier(s) dans ${path.relative(root, DROP_DIR)}`);

  for (const name of entries.sort()) {
    const from = path.join(DROP_DIR, name);

    const nameProblem = validateFileName(name);
    if (nameProblem) {
      const target = moveWithoutOverwrite(from, REJECTED_DIR, name);
      writeRejectionLog(target, name, [{ line: 0, reason: nameProblem }]);
      journal(`  ${name} : REFUSE (${nameProblem})`);
      continue;
    }

    const { lines, problems } = await validateFile(readFileSync(from));

    if (problems.length > 0) {
      const target = moveWithoutOverwrite(from, REJECTED_DIR, name);
      writeRejectionLog(target, name, problems);
      journal(
        `  ${name} : REFUSE (${problems.length} probleme(s)) -> ${path.relative(root, target)}.log`,
      );
      continue;
    }

    await db.insert(schema.erpOrders).values(
      lines.map((line) => ({
        sourceFile: name,
        customerCode: line.customerCode,
        skuCode: line.skuCode,
        quantity: line.quantity,
        requestedDeliveryDate: line.requestedDeliveryDate,
      })),
    );

    const target = moveWithoutOverwrite(from, PROCESSED_DIR, name);
    journal(`  ${name} : ACCEPTE (${lines.length} ligne(s)) -> ${path.relative(root, target)}`);
  }
}

async function main() {
  const once = process.argv.includes("--once");
  ensureDirectories();

  if (once) {
    await runPass();
    await sql.end();
    return;
  }

  if (!cron.validate(IMPORT_CRON)) {
    console.error(`ERP_IMPORT_CRON invalide : "${IMPORT_CRON}"`);
    process.exit(1);
  }

  console.log(`Dossier surveille  : ${path.relative(root, DROP_DIR)}`);
  console.log(`Dossier accepte    : ${path.relative(root, PROCESSED_DIR)}`);
  console.log(`Dossier refuse     : ${path.relative(root, REJECTED_DIR)}`);
  console.log(`Journal            : ${path.relative(root, LOG_DIR)}`);
  console.log(`Planification      : ${IMPORT_CRON}`);
  console.log("Ctrl+C pour arreter.");

  cron.schedule(IMPORT_CRON, () => {
    runPass().catch((error) => console.error(error));
  });
}

main().catch(async (error) => {
  console.error(error);
  await sql.end();
  process.exit(1);
});
