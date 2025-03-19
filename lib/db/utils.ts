import type { Document } from '@/lib/db/schema';

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (documents.length === 0) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}
