import { auth } from '@/app/(auth)/auth';
import {
  getVotesByChatId,
  voteMessage,
  type VoteMessage,
} from '@/lib/db/queries';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');
  if (!chatId) {
    return new Response('chatId is required', { status: 400 });
  }

  const votes = await getVotesByChatId({ chatId });

  return Response.json(votes, { status: 200 });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { chatId, messageId, type }: VoteMessage = await request.json();
  if (!chatId || !messageId || !type) {
    return new Response('messageId and type are required', { status: 400 });
  }

  await voteMessage({ chatId, messageId, type });

  return new Response('Message voted', { status: 200 });
}
