import { withAuth } from '@/lib/api/with-auth';
import { getChatsByUserId } from '@/lib/db/queries/chat';

export const GET = withAuth(async function GET(request) {
  const chats = await getChatsByUserId({ id: request.auth.user.id });

  return Response.json(chats);
});
