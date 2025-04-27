import 'server-only';

import { and, desc, eq, ne, or, sql } from 'drizzle-orm';

import { db } from '@/lib/db/neon';
import {
  chat,
  type Chat,
  type ChatVisibility,
  type ChatWithMessages,
  type ChatWithMessagesAndVote,
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

const preparedChatByIdWithMessagesAndVotes = db.query.chat
  .findFirst({
    where: and(
      eq(chat.id, sql.placeholder('id')),
      or(
        eq(chat.userId, sql.placeholder('sessionUserId')),
        and(
          ne(chat.userId, sql.placeholder('sessionUserId')),
          eq(chat.visibility, 'public'),
        ),
      ),
    ),
    with: {
      messages: {
        orderBy: (message, { asc }) => [asc(message.createdAt)],
        with: {
          vote: {
            columns: {
              isUpvoted: true,
            },
          },
        },
      },
    },
  })
  .prepare('query_chats');

export async function getChatByIdWithMessagesAndVotes({
  id,
  sessionUserId,
}: {
  id: Chat['id'];
  sessionUserId: Chat['userId'];
}): Promise<ChatWithMessagesAndVote | undefined> {
  try {
    return await preparedChatByIdWithMessagesAndVotes.execute({
      id,
      sessionUserId,
    });
  } catch (error) {
    console.error('Failed to get from database');
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
