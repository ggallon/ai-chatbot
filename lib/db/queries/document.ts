import 'server-only';

import { and, asc, desc, eq, gt } from 'drizzle-orm';

import { db } from '@/lib/db/neon';
import {
  document,
  suggestion,
  type Document,
  type InsertDocument,
} from '@/lib/db/schema';

export async function getDocumentById({ id }: { id: Document['id'] }) {
  try {
    return await db.query.document.findFirst({
      where: eq(document.id, id),
      orderBy: desc(document.createdAt),
    });
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function getDocumentsById({ id }: { id: Document['id'] }) {
  try {
    return await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));
  } catch (error) {
    console.error('Failed to get document by id from database');
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: string;
  timestamp: Date;
}) {
  try {
    await db
      .delete(suggestion)
      .where(
        and(
          eq(suggestion.documentId, id),
          gt(suggestion.documentCreatedAt, timestamp),
        ),
      );

    return await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      'Failed to delete documents by id after timestamp from database',
    );
    throw error;
  }
}

export async function saveDocument({
  id,
  title,
  content,
  createdAt,
  kind,
  userId,
}: InsertDocument) {
  try {
    return await db.insert(document).values({
      id,
      title,
      content,
      userId,
      kind,
      createdAt,
    });
  } catch (error) {
    console.error('Failed to save document in database');
    throw error;
  }
}
