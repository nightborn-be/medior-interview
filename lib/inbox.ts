import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

export const INBOX_DIR = path.join(process.cwd(), "data", "inbox");

export type InboxAttachment = {
  fileName: string;
  kind: "pdf" | "image" | "other";
};

export type InboxMessage = {
  id: string;
  fileName: string;
  from: string;
  fromName: string;
  fromEmail: string;
  date: string;
  subject: string;
  attachments: InboxAttachment[];
};

function attachmentKind(fileName: string): InboxAttachment["kind"] {
  const ext = path.extname(fileName).toLowerCase();
  if (ext === ".pdf") return "pdf";
  if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) return "image";
  return "other";
}

function readHeaders(raw: string): Record<string, string> {
  const separator = raw.indexOf("\n\n");
  const headerBlock = separator === -1 ? raw : raw.slice(0, separator);
  const headers: Record<string, string> = {};
  for (const line of headerBlock.split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    headers[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim();
  }
  return headers;
}

function splitAddress(value: string) {
  const match = value.match(/^(.*)<([^>]+)>\s*$/);
  if (!match) return { name: "", email: value.trim() };
  return { name: match[1].trim(), email: match[2].trim() };
}

export function listMessages(): InboxMessage[] {
  const entries = readdirSync(INBOX_DIR).filter((name) => !name.startsWith("."));
  const emails = entries.filter((name) => name.endsWith(".eml")).sort();

  return emails.map((fileName) => {
    const id = fileName.replace(/\.eml$/, "");
    const prefix = fileName.slice(0, 2);
    const raw = readFileSync(path.join(INBOX_DIR, fileName), "utf-8");
    const headers = readHeaders(raw);
    const from = headers.from ?? "";
    const { name, email } = splitAddress(from);

    const attachments = entries
      .filter((entry) => entry !== fileName && entry.startsWith(`${prefix}-`))
      .sort()
      .map((entry) => ({ fileName: entry, kind: attachmentKind(entry) }));

    return {
      id,
      fileName,
      from,
      fromName: name || email,
      fromEmail: email,
      date: headers.date ?? "",
      subject: headers.subject ?? "",
      attachments,
    };
  });
}

export function getMessage(id: string): (InboxMessage & { raw: string }) | null {
  const message = listMessages().find((m) => m.id === id);
  if (!message) return null;
  return {
    ...message,
    raw: readFileSync(path.join(INBOX_DIR, message.fileName), "utf-8"),
  };
}

/** Nom de fichier reellement present dans data/inbox/, ou null. */
export function resolveInboxFile(fileName: string): string | null {
  const entries = readdirSync(INBOX_DIR);
  return entries.includes(fileName) ? path.join(INBOX_DIR, fileName) : null;
}

export function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("fr-BE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Brussels",
  }).format(date);
}
