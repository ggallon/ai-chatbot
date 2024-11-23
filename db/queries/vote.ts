"server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db/db";
import { vote, type Chat, type Message, type Vote } from "@/db/schema";

export async function voteMessage({
  chatId,
  messageId,
  type,
}: {
  chatId: Chat["id"];
  messageId: Message["id"];
  type: "up" | "down";
}) {
  try {
    const isUpvoted = type === "up" ? true : false;
    const existingVote = await db.query.vote.findFirst({
      where: eq(vote.messageId, messageId),
    });

    if (existingVote) {
      await db
        .update(vote)
        .set({ isUpvoted })
        .where(and(eq(vote.messageId, messageId), eq(vote.chatId, chatId)));
    } else {
      await db.insert(vote).values({
        chatId,
        messageId,
        isUpvoted,
      });
    }
  } catch (error) {
    console.error("Failed to upvote message in database", error);
    throw error;
  }
}

export async function getVotesByChatId({
  id,
}: {
  id: Chat["id"];
}): Promise<Vote[] | null> {
  try {
    return await db.select().from(vote).where(eq(vote.chatId, id));
  } catch (error) {
    console.error("Failed to get votes by chat id from database", error);
    throw error;
  }
}
