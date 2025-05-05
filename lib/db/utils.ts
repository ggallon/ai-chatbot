import type { Document, MessageWithVote, Vote } from '@/lib/db/schema';

export function extractVotes(messages: Array<MessageWithVote>): Array<Vote> {
  return messages.reduce<Array<Vote>>((votes, message) => {
    if (message.vote?.isUpvoted) {
      votes.push({
        chatId: message.chatId,
        messageId: message.id,
        isUpvoted: message.vote.isUpvoted,
      });
    }

    return votes;
  }, []);
}

export function getDocumentTimestampByIndex(
  documents: Array<Document>,
  index: number,
) {
  if (documents.length === 0) return new Date();
  if (index > documents.length) return new Date();

  return documents[index].createdAt;
}
