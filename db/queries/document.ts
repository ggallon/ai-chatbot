"server-only";

import { and, asc, desc, eq, gt } from "drizzle-orm";

import { db } from "@/db/db";
import { document, type Document } from "@/db/schema";

type SaveDocument = Omit<typeof document.$inferInsert, "createdAt"> & {
  id: string;
};

export async function saveDocument({
  id,
  title,
  content,
  userId,
}: SaveDocument) {
  try {
    await db.insert(document).values({
      id,
      title,
      content,
      userId,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to save document in database");
    throw error;
  }
}

export async function getDocumentById({
  id,
}: {
  id: Document["id"];
}): Promise<Document | undefined> {
  try {
    return await db.query.document.findFirst({
      where: eq(document.id, id),
      orderBy: desc(document.createdAt),
    });
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function getDocumentsById({
  id,
}: {
  id: Document["id"];
}): Promise<Document[] | []> {
  try {
    return await db
      .select()
      .from(document)
      .where(eq(document.id, id))
      .orderBy(asc(document.createdAt));
  } catch (error) {
    console.error("Failed to get document by id from database");
    throw error;
  }
}

export async function deleteDocumentsByIdAfterTimestamp({
  id,
  timestamp,
}: {
  id: Document["id"];
  timestamp: Date;
}) {
  try {
    await db
      .delete(document)
      .where(and(eq(document.id, id), gt(document.createdAt, timestamp)));
  } catch (error) {
    console.error(
      "Failed to delete documents by id after timestamp from database"
    );
    throw error;
  }
}
