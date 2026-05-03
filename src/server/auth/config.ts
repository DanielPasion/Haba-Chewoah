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

/**
 * Discord-provided fields we read off the OAuth profile. NextAuth's own type
 * for `profile` is `unknown` because providers shape it differently.
 */
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
      /**
       * Map Discord's OAuth profile onto our User model. Setting `discordId`
       * here means the very first INSERT done by PrismaAdapter.createUser
       * already satisfies the NOT NULL constraint — no backfill step needed.
       *
       * `username` is intentionally NOT set: it stays NULL until the user
       * picks one through /create-account, which is the canonical signal
       * that onboarding is complete.
       */
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
