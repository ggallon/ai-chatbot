import 'server-only';

import { and, eq } from 'drizzle-orm';

import { db } from '@/lib/db/neon';
import { chat, vote, type Chat, type Vote, type User } from '@/lib/db/schema';

export const voteTypesEnum = ['up', 'down'] as const;
export type voteTypes = (typeof voteTypesEnum)[number];

export type VoteMessage = Omit<Vote, 'isUpvoted'> & {
  type: 'up' | 'down';
};

export async function voteMessage({ chatId, messageId, type }: VoteMessage) {
  try {
    const isUpvoted = type === 'up';
    await db
      .insert(vote)
      .values({ chatId, messageId, isUpvoted })
      .onConflictDoUpdate({
        target: [vote.chatId, vote.messageId],
        set: { isUpvoted },
      });
  } catch (error) {
    console.error('Failed to upvote message in database', error);
    throw error;
  }
}

export async function getVotesByChatIdAndUser({
  chatId,
  userId,
}: {
  chatId: Chat['id'];
  userId: User['id'];
}): Promise<Array<Vote>> {
  try {
    return await db
      .select({
        chatId: vote.chatId,
        messageId: vote.messageId,
        isUpvoted: vote.isUpvoted,
      })
      .from(vote)
      .innerJoin(chat, eq(vote.chatId, chat.id))
      .where(and(eq(chat.id, chatId), eq(chat.userId, userId)));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}
