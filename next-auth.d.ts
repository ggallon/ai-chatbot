import NextAuth, { DefaultSession } from '@auth/nextjs'

declare module '@auth/nextjs/types' {
  interface Session {
    user: {
      id: string
    } & DefaultSession['user']
  }
}
