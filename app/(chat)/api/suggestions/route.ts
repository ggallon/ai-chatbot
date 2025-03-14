import { withAuth } from '@/lib/api/with-auth';
import { getSuggestions } from '@/lib/db/queries/suggestion';

export const GET = withAuth(async function GET(request) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get('documentId');
  if (!documentId) {
    return new Response('Not Found', { status: 404 });
  }

  const suggestions = await getSuggestions({
    documentId,
    userId: request.auth.user.id,
  });

  return Response.json(suggestions, { status: 200 });
});
