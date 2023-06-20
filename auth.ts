import NextAuth, { type NextAuthConfig } from "@auth/nextjs";
import GitHub from "@auth/nextjs/providers/github"
import { NextResponse } from "next/server"

export const {
  handlers: { GET, POST },
  auth,
  CSRF_experimental
} = NextAuth({
  debug: process.env.NODE_ENV === "development",
  providers: [
    // @ts-expect-error
    GitHub,
  ],
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
    jwt({ token, profile, trigger }) {
      if (trigger === "signIn" && profile) {
        token.id = profile.id
        token.image = profile.avatar_url
      }
      return token
    },
    session({ session, token }) {
      return { ...session, user: { ...session.user, id: token.sub } };
    },
    authorized({ request, auth }) {
      console.log("#### authorized");
      const session = auth.user;
      const path = request.nextUrl.pathname;

      if (!session && path !== "/sign-in") {
        console.log("NO session && path !== /sign-in");
        return NextResponse.redirect(new URL("/sign-in", request.url));
      } else if (session && path === "/sign-in") {
        console.log("HAS session && path === /sign-in");
        return NextResponse.redirect(new URL("/", request.url));
      } else if (session) {
        console.log("HAS session");
        return true
      } else {
        console.log("NO session");
        return false
      }
    }
  },
  pages: {
    signIn: '/sign-in'
  }
});
