import { readFileSync } from "node:fs";
import path from "node:path";

import { resolveInboxFile } from "@/lib/inbox";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".eml": "message/rfc822",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ file: string }> },
) {
  const { file } = await params;
  const absolute = resolveInboxFile(path.basename(file));

  if (!absolute) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = readFileSync(absolute);
  const contentType = CONTENT_TYPES[path.extname(absolute).toLowerCase()] ?? "application/octet-stream";

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${path.basename(absolute)}"`,
    },
  });
}
