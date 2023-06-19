import { NextResponse } from "next/server";
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

export default auth(async function middleware(
  req: NextAuthRequest,
  ev: NextFetchEvent
) {
  console.log("#### middleware");
  const domain = req.headers.get("host");
  const path = req.nextUrl.pathname;
  console.log("domain", domain);
  console.log("path", path);
  console.log("auth", req.auth);
  return NextResponse.next()
});
