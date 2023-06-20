import type { NextAuthRequest } from "@auth/nextjs/lib";
import { NextResponse, type NextFetchEvent } from "next/server";
import { auth } from './auth'

export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api/ routes
     * 2. /_next/ (Next.js internals)
     * 3. /_proxy/, /_auth/, /_root/ (special pages for OG tags proxying, password protection, and placeholder _root pages)
     * 4. /_static (inside /public)
     * 5. /_vercel (Vercel internals)
     * 6. all root files inside /public (e.g. /favicon.ico)
     */
    "/((?!api/|_next/|_vercel|[\\w-]+\\.\\w+).*)",
  ],
};

// @ts-expect-error
export default auth((req: NextAuthRequest, ev: NextFetchEvent) => {
  const session = req.auth.user
  console.log("middleware (session, path): ", session, req.nextUrl.pathname)
  return NextResponse.next()
})
