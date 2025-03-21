import { compare } from 'bcrypt-ts';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { ZodError } from 'zod';

import { getUserByEmail } from '@/lib/db/queries/user';
import { authFormSchema } from '@/lib/db/validations/auth';
import { authConfig } from './auth.config';

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
        try {
          const { email, password } =
            await authFormSchema.parseAsync(credentials);
          const user = await getUserByEmail(email);
          if (user?.password) {
            const { password: userPassword, ...userInfo } = user;
            const passwordsMatch = await compare(password, userPassword);
            if (passwordsMatch) {
              return userInfo;
            } else {
              throw new Error('Invalid credentials.');
            }
          } else {
            throw new Error('Invalid credentials.');
          }
        } catch (error) {
          // Return `null` to indicate that the credentials are invalid
          if (error instanceof ZodError) {
            return null;
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      return { ...token, id: token.id ?? user.id };
    },
    session({ session, token }) {
      return { ...session, user: { ...session.user, id: token.id } };
    },
  },
});
