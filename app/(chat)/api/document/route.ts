import { withAuth } from '@/lib/api/with-auth';
import {
  deleteDocumentsByIdAfterTimestamp,
  getDocumentsById,
  saveDocument,
} from '@/lib/db/queries/document';

import type { Document } from '@/lib/db/schema';

export const GET = withAuth(async function GET(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const documents = await getDocumentsById({ id });
  if (documents.length === 0) {
    return new Response('Not Found', { status: 404 });
  }

  if (documents[0].userId !== request.auth.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  return Response.json(documents, { status: 200 });
});

export const POST = withAuth(async function POST(request) {
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
    userId: request.auth.user.id,
  });

  return Response.json('Saved', { status: 200 });
});

export const PATCH = withAuth(async function PATCH(request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const { timestamp }: { timestamp: string } = await request.json();

  const documents = await getDocumentsById({ id });
  if (documents[0].userId !== request.auth.user.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  await deleteDocumentsByIdAfterTimestamp({
    id,
    timestamp: new Date(timestamp),
  });

  return new Response('Deleted', { status: 200 });
});
