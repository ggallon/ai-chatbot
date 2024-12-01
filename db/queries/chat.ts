"server-only";

import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/db";
import { chat, type Chat, type ChatWithMessages, type User } from "@/db/schema";

type SaveChat = Omit<typeof chat.$inferInsert, "createdAt"> & { id: string };

export async function saveChat({ id, userId, title }: SaveChat) {
  try {
    await db.insert(chat).values({
      id,
      userId,
      createdAt: new Date(),
      title,
    });
  } catch (error) {
    console.error("Failed to save chat in database");
    throw error;
  }
}

export async function deleteChatByIdAndUserId({
  id,
  userId,
}: {
  id: Chat["id"];
  userId: User["id"];
}) {
  try {
    await db.delete(chat).where(and(eq(chat.id, id), eq(chat.userId, userId)));
  } catch (error) {
    console.error("Failed to delete chat by id from database");
    throw error;
  }
}

export async function getChatById({
  id,
}: {
  id: Chat["id"];
}): Promise<Chat | undefined> {
  try {
    return await db.query.chat.findFirst({
      where: eq(chat.id, id),
    });
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function getChatByIdAndUserId({
  id,
  userId,
  withMessages = false,
}: {
  id: Chat["id"];
  userId: User["id"];
  withMessages?: boolean;
}): Promise<Chat | ChatWithMessages | undefined> {
  try {
    return await db.query.chat.findFirst({
      where: and(eq(chat.id, id), eq(chat.userId, userId)),
      ...(withMessages
        ? {
            with: {
              messages: {
                orderBy: (message, { asc }) => [asc(message.createdAt)],
              },
            },
          }
        : {}),
    });
  } catch (error) {
    console.error("Failed to get chat by id from database");
    throw error;
  }
}

export async function getChatsByUserId({
  id,
}: {
  id: User["id"];
}): Promise<Chat[] | undefined> {
  try {
    return await db.query.chat.findMany({
      where: eq(chat.userId, id),
      orderBy: desc(chat.createdAt),
    });
  } catch (error) {
    console.error("Failed to get chats by user from database");
    throw error;
  }
}
