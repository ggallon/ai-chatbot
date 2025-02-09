import { auth } from '@/app/(auth)/auth';
import { deleteChatById } from '@/lib/db/queries/chat';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const [session, paramsValue] = await Promise.all([auth(), params]);
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 });
  }

  if (!paramsValue.id) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    await deleteChatById({ id: paramsValue.id, userId: session.user.id });
    return new Response('Chat deleted', { status: 200 });
  } catch (error) {
    return new Response('An error occurred while processing your request', {
      status: 500,
    });
  }
}
