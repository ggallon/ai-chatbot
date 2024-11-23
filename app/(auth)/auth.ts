import NextAuth, { type User, type Session } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { getUserByEmailWithPassword } from "@/db/queries/user";
import { isPasswordsMatch } from "@/lib/utils/hash";

import { authConfig } from "./auth.config";
import { authFormSchema } from "./auth.schema";

import type { JWT } from "next-auth/jwt";

interface ExtendedSession extends Session {
  user: User;
}

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const validatedFields = authFormSchema.safeParse(credentials);
        if (!validatedFields.success) {
          return null;
        }
        const { email, password } = validatedFields.data;
        const user = await getUserByEmailWithPassword(email);
        if (!user?.password) return null;
        const passwordsMatch = await isPasswordsMatch(password, user.password);
        if (passwordsMatch) {
          return {
            id: user.id,
            email: user.email,
          };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }

      return token;
    },
    async session({
      session,
      token,
    }: {
      session: ExtendedSession;
      token: JWT;
    }) {
      if (session.user) {
        session.user.id = token.id as string;
      }

      return session;
    },
  },
});
