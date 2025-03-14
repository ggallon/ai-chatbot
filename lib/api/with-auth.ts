import { auth } from '@/app/(auth)/auth';

import type { Params } from 'next/dist/server/request/params';
import type { NextRequest } from 'next/server';

interface NextAuthRequest extends NextRequest {
  auth: {
    user: {
      id: string;
      email: string;
      image: string | null;
    };
  };
}

interface DefaultContext {
  params: Promise<Params>;
}

type ApiAuthHandler<C = DefaultContext> = (
  request: NextAuthRequest,
  context: C,
) => Promise<Response>;

export function withAuth<C>(handler: ApiAuthHandler<C>): ApiAuthHandler<C> {
  return async (request, context) => {
    const session = await auth();
    if (!session?.user?.email || !session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    request.auth = {
      user: {
        id: session.user.id,
        email: session.user.email,
        image: session.user.image ?? null,
      },
    };

    // If authenticated, call the original handler
    return handler(request, context);
  };
}
