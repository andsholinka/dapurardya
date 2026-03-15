import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/mongodb";

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
      // Simpan/update member di DB saat login Google
      try {
        const db = await getDb();
        await db.collection("members").updateOne(
          { email: user.email },
          {
            $set: { name: user.name, email: user.email, image: user.image, updatedAt: new Date() },
            $setOnInsert: { createdAt: new Date(), provider: "google", aiPlan: "free" },
          },
          { upsert: true }
        );
      } catch (e) {
        console.error("[NEXTAUTH] signIn error:", e);
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
