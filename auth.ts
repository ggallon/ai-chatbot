import { NextResponse } from "next/server";
import NextAuth from 'next-auth'
import GitHub from 'next-auth/providers/github'

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental
  // @ts-ignore
} = NextAuth({
  // @ts-ignore
  debug: true,
  providers: [GitHub],
  session: {
    strategy: "jwt",
    // Seconds - How long until an idle session expires and is no longer valid.
    maxAge: 7 * 24 * 60 * 60, // 7 days
    // Seconds - Throttle how frequently to write to database to extend a session.
    // Use it to limit write operations. Set to 0 to always update the database.
    // Note: This option is ignored if using JSON Web Tokens
    updateAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    jwt(jwtdata) {
      const { token, profile, trigger } = jwtdata;
      if (trigger === "signIn" && profile?.id) {
        token.id = profile.id
        token.image = profile.avatar_url
      }
      return token
    },
    authorized({ request, auth }) {
      const session = auth.user;
      const path = request.nextUrl.pathname;

      if (!session && path !== "/sign-in") {
        return NextResponse.redirect(new URL("/sign-in", request.url));
      } else if (session && path === "/sign-in") {
        return NextResponse.redirect(new URL("/", req.url));
      }
    }
  },
  pages: {
    signIn: '/sign-in'
  }
})
