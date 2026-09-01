import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, listMessages } from "@/lib/inbox";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const messages = listMessages();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <header className="mb-8">
        <p className="text-sm text-muted-foreground">Steenland Foodservice</p>
        <h1 className="text-2xl font-semibold tracking-tight">Boite de reception orders@</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {messages.length} messages, lus depuis <code>data/inbox/</code>.
        </p>
      </header>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Expediteur</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Piece jointe</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell className="align-top">
                  <Link href={`/messages/${message.id}`} className="font-medium hover:underline">
                    {message.fromName}
                  </Link>
                  <div className="text-xs text-muted-foreground">{message.fromEmail}</div>
                </TableCell>
                <TableCell className="align-top">
                  <Link href={`/messages/${message.id}`} className="hover:underline">
                    {message.subject}
                  </Link>
                  <div className="text-xs text-muted-foreground">{message.fileName}</div>
                </TableCell>
                <TableCell className="align-top whitespace-nowrap text-sm">
                  {formatDate(message.date)}
                </TableCell>
                <TableCell className="align-top">
                  {message.attachments.length === 0 ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : (
                    message.attachments.map((attachment) => (
                      <Badge key={attachment.fileName} variant="secondary" className="mr-1">
                        {attachment.fileName}
                      </Badge>
                    ))
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
