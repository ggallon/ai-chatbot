import { withAuth } from '@/lib/api/with-auth';
import {
  getVotesByChatIdAndUser,
  voteMessage,
  voteTypesEnum,
  type VoteMessage,
} from '@/lib/db/queries/vote';

export const GET = withAuth(async function GET(request) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const votes = await getVotesByChatIdAndUser({
    chatId,
    userId: request.auth.user.id,
  });

  return Response.json(votes, { status: 200 });
});

export const PATCH = withAuth(async function PATCH(request) {
  const { chatId, messageId, type }: VoteMessage = await request.json();
  if (!chatId || !messageId || !voteTypesEnum.includes(type)) {
    return new Response('messageId and type are required', { status: 400 });
  }

  await voteMessage({ chatId, messageId, type });

  return new Response('Message voted', { status: 200 });
});
