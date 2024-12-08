import NextAuth from 'next-auth';

import { authConfig } from '@/app/(auth)/auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - chat/p (APP routes) for public shared chat
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - .well-known/*, favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|chat/p|_next/static|_next/image|.well-known|favicon|fonts|sitemap|robots.txt).*)',
  ],
};
