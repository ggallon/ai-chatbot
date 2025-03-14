import { withAuth } from '@/lib/api/with-auth';
import { deleteChatById } from '@/lib/db/queries/chat';

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async function DELETE(request, { params }) {
    const paramsValue = await params;
    if (!paramsValue.id) {
      return new Response('Not Found', { status: 404 });
    }

    try {
      await deleteChatById({
        id: paramsValue.id,
        userId: request.auth.user.id,
      });
      return new Response('Chat deleted', { status: 200 });
    } catch (error) {
      return new Response('An error occurred while processing your request', {
        status: 500,
      });
    }
  },
);
