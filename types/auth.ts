// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used for declared module
import { JWT } from 'next-auth/jwt';

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    idToken?: string;
    id?: string;
  }
}
