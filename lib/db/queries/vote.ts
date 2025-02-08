import 'server-only';

import { eq } from 'drizzle-orm';

import { db } from '@/lib/db/neon';
import { vote, type Chat, type Vote } from '@/lib/db/schema';

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

export async function getVotesByChatId({
  chatId,
}: {
  chatId: Chat['id'];
}): Promise<Array<Vote>> {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, chatId));
  } catch (error) {
    console.error('Failed to get votes by chat id from database', error);
    throw error;
  }
}
