import { DefaultSession } from '@auth/nextjs'

declare module '@auth/nextjs/types' {
  interface Session {
    user: {
      /** The user's id. */
      id: string
    } & DefaultSession['user']
  }
}
