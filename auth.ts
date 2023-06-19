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
  callbacks: {
    signIn(signIndata) {
      console.log("callbacks::signIn", signIndata);
      return true;
    },
    // @ts-ignore
    jwt: async (jwtdata) => {
      console.log("callbacks::jwt", jwtdata);
      const { token, profile } = jwtdata;
      if (profile?.id) {
        token.id = profile.id
        token.image = profile.picture
      }
      return token
    },
    session(sessionData) {
      console.log("callbacks::session", sessionData);
      return sessionData.session;
    },
    authorized({ request, auth }) {
      console.log("callbacks::authorized", auth);
      const domain = request.headers.get("host");
      console.log("domain", domain);

      return !!auth.user
    }
  },
  pages: {
    signIn: '/sign-in'
  }
})
