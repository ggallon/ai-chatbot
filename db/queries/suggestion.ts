"server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db/db";
import {
  suggestion,
  type Document,
  type Suggestion,
  type User,
} from "@/db/schema";

export async function saveSuggestions({
  suggestions,
}: {
  suggestions: Array<Suggestion>;
}) {
  try {
    return await db.insert(suggestion).values(suggestions);
  } catch (error) {
    console.error("Failed to save suggestions in database");
    throw error;
  }
}

export async function getSuggestionsByDocumentIdAndUserId({
  documentId,
  userId,
}: {
  documentId: Document["id"];
  userId: User["id"];
}): Promise<Suggestion[]> {
  try {
    return await db.query.suggestion.findMany({
      where: and(
        eq(suggestion.documentId, documentId),
        eq(suggestion.userId, userId)
      ),
    });
  } catch (error) {
    console.error(
      "Failed to get suggestions by document version from database"
    );
    throw error;
  }
}
