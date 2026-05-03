import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

import { db } from "~/server/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      username: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    username?: string | null;
    discordId?: string | null;
  }
}

// NextAuth's own `profile` type is `unknown` because providers shape it differently.
type DiscordProfile = {
  id: string;
  username?: string | null;
  global_name?: string | null;
  email?: string | null;
  avatar?: string | null;
};

function discordAvatarUrl(p: DiscordProfile): string | null {
  if (!p.avatar) return null;
  const ext = p.avatar.startsWith("a_") ? "gif" : "png";
  return `https://cdn.discordapp.com/avatars/${p.id}/${p.avatar}.${ext}`;
}

export const authConfig = {
  providers: [
    DiscordProvider({
      // Setting discordId here lets PrismaAdapter.createUser's first INSERT
      // satisfy the NOT NULL constraint without a backfill step. `username`
      // is intentionally left NULL — it's set later by /create-account, and
      // `username IS NULL` is the canonical "needs onboarding" signal.
      profile(profile: DiscordProfile) {
        return {
          id: profile.id,
          name: profile.global_name ?? profile.username ?? null,
          email: profile.email ?? null,
          image: discordAvatarUrl(profile),
          discordId: profile.id,
        };
      },
    }),
  ],
  adapter: PrismaAdapter(db),
  trustHost: true,
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        username: user.username ?? null,
      },
    }),
  },
} satisfies NextAuthConfig;
