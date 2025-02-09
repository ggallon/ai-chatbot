import { auth } from '@/app/(auth)/auth';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/lib/db/queries/document';

import type { Document } from '@/lib/db/schema';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const documents = await getDocumentsById({ id });
  const [document] = documents;
  if (!document) {
    return new Response('Not Found', { status: 404 });
  }

  if (document.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(documents, { status: 200 });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const { title, content, kind }: Pick<Document, 'title' | 'content' | 'kind'> =
    await request.json();

  await saveDocument({
    id,
    title,
    content,
    createdAt: new Date(),
    kind,
    userId: session.user.id,
  });

  return Response.json('Saved', { status: 200 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const { timestamp }: { timestamp: string } = await request.json();

  const documents = await getDocumentsById({ id });
  const [document] = documents;
  if (document.userId !== session.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response('Deleted', { status: 200 });
}
