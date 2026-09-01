import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate, getMessage } from "@/lib/inbox";

export const dynamic = "force-dynamic";

export default async function MessagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const message = getMessage(id);

  if (!message) notFound();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:underline">
        ← Boite de reception
      </Link>

      <header className="mt-4 mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">{message.subject}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {message.from} · {formatDate(message.date)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          <code>data/inbox/{message.fileName}</code>
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contenu brut</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="overflow-x-auto rounded-md bg-muted p-4 text-sm whitespace-pre-wrap">
            {message.raw}
          </pre>
        </CardContent>
      </Card>

      {message.attachments.map((attachment) => (
        <Card key={attachment.fileName} className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">
              Piece jointe : <code>{attachment.fileName}</code>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attachment.kind === "pdf" ? (
              <iframe
                src={`/api/inbox/${attachment.fileName}`}
                title={attachment.fileName}
                className="h-[840px] w-full rounded-md border"
              />
            ) : attachment.kind === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`/api/inbox/${attachment.fileName}`}
                alt={attachment.fileName}
                className="max-h-[840px] rounded-md border"
              />
            ) : (
              <a
                href={`/api/inbox/${attachment.fileName}`}
                className="text-sm underline"
                target="_blank"
                rel="noreferrer"
              >
                Ouvrir {attachment.fileName}
              </a>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              <code>data/inbox/{attachment.fileName}</code>
            </p>
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
