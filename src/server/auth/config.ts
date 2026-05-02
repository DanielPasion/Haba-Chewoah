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

const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

function seedToBase(seed: string | null | undefined): string {
  const slug = (seed ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .slice(0, 28) || "user";
  return slug.length < 3 ? `${slug}_user` : slug;
}

function isUniqueViolation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code: unknown }).code === "P2002"
  );
}

export const authConfig = {
  providers: [DiscordProvider],
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
  events: {
    /**
     * Backfill `discordId` and a unique `username` the first time a Discord
     * account links to a user. Concurrent first-time signups can collide on
     * the username unique index — we trust the DB, retrying on P2002 with
     * the next candidate (`name`, `name_1`, `name_2`, …) until success or
     * a timestamped fallback.
     */
    async linkAccount({ user, account, profile }) {
      if (account.provider !== "discord") return;

      const existing = await db.user.findUnique({
        where: { id: user.id },
        select: { discordId: true, username: true },
      });
      if (existing?.discordId && existing.username) return;

      const seed =
        (profile as { username?: string; global_name?: string } | undefined)
          ?.username ?? user.name;
      const base = seedToBase(seed);
      const discordId = existing?.discordId ?? account.providerAccountId;

      // If the username is already set, just backfill discordId.
      if (existing?.username) {
        await db.user.update({
          where: { id: user.id },
          data: { discordId },
        });
        return;
      }

      for (let i = 0; i < 20; i++) {
        const candidate = i === 0 ? base : `${base}_${i}`;
        if (!USERNAME_RE.test(candidate)) continue;
        try {
          await db.user.update({
            where: { id: user.id },
            data: { discordId, username: candidate },
          });
          return;
        } catch (err) {
          if (isUniqueViolation(err)) continue;
          throw err;
        }
      }

      // Final fallback — high-entropy suffix, virtually unguessable to collide.
      const fallback = `${base}_${Date.now().toString(36)}`;
      await db.user.update({
        where: { id: user.id },
        data: { discordId, username: fallback },
      });
    },
  },
} satisfies NextAuthConfig;
