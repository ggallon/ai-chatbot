import 'server-only';

import { and, desc, eq } from 'drizzle-orm';

import { db } from '@/lib/db/neon';
import {
  chat,
  type Chat,
  type ChatVisibility,
  type ChatWithMessages,
  type InsertChat,
} from '@/lib/db/schema';

export async function deleteChatById({
  id,
  userId,
}: {
  id: Chat['id'];
  userId: Chat['userId'];
}) {
  try {
    await db.delete(chat).where(and(eq(chat.id, id), eq(chat.userId, userId)));
  } catch (error) {
    console.error('Failed to delete chat by id from database');
    throw error;
  }
}

const chatQueryFilter = (id: Chat['id'], visibility?: ChatVisibility) =>
  visibility
    ? and(eq(chat.id, id), eq(chat.visibility, visibility))
    : eq(chat.id, id);

export async function getChatById({
  id,
  visibility,
}: {
  id: Chat['id'];
  visibility?: ChatVisibility;
}): Promise<Chat | undefined> {
  try {
    return await db.query.chat.findFirst({
      where: chatQueryFilter(id, visibility),
    });
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function getChatByIdWithMessages({
  id,
  visibility,
}: {
  id: Chat['id'];
  visibility?: ChatVisibility;
}): Promise<ChatWithMessages | undefined> {
  try {
    return await db.query.chat.findFirst({
      where: chatQueryFilter(id, visibility),
      with: {
        messages: {
          orderBy: (message, { asc }) => [asc(message.createdAt)],
        },
      },
    });
  } catch (error) {
    console.error('Failed to get chat by id from database');
    throw error;
  }
}

export async function getChatsByUserId({ id }: { id: string }) {
  try {
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, id))
      .orderBy(desc(chat.createdAt));
  } catch (error) {
    console.error('Failed to get chats by user from database');
    throw error;
  }
}

export async function saveChat(chatValues: InsertChat) {
  try {
    await db.insert(chat).values(chatValues);
  } catch (error) {
    console.error('Failed to save chat in database');
    throw error;
  }
}

export async function updateChatVisibilityById({
  chatId,
  visibility,
}: {
  chatId: Chat['id'];
  visibility: ChatVisibility;
}) {
  try {
    return await db.update(chat).set({ visibility }).where(eq(chat.id, chatId));
  } catch (error) {
    console.error('Failed to update chat visibility in database');
    throw error;
  }
}
