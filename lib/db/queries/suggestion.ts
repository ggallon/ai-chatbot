import 'server-only';

import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db/neon';
import {
  suggestion,
  type Document,
  type Suggestion,
  type User,
} from '@/lib/db/schema';

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error('Failed to save suggestions in database');
    throw error;
  }
}

export async function getSuggestions({
  documentId,
  userId,
}: {
  documentId: Document['id'];
  userId: User['id'];
}) {
  try {
    return await db
      .select()
      .from(suggestion)
      .where(
        and(
          eq(suggestion.documentId, documentId),
          eq(suggestion.userId, userId),
        ),
      );
  } catch (error) {
    console.error(
      'Failed to get suggestions by document version from database',
    );
    throw error;
  }
}
