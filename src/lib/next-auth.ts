import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { handleGoogleSignIn, setAuthCookie } from "@/lib/auth-v2";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  secret: process.env.AUTH_SECRET,
  callbacks: {
    async signIn({ user }) {
      try {
        // Create JWT session for Google login
        const session = await handleGoogleSignIn(user.email!, user.name!, user.image || undefined);
        await setAuthCookie(session);
      } catch (e) {
        console.error("[NEXTAUTH] signIn error:", e);
        return false;
      }
      return true;
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/member/auth",
  },
});
