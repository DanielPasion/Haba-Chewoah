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
}

const USERNAME_RE = /^[a-zA-Z0-9_]{3,32}$/;

async function deriveUsername(seed: string | null | undefined): Promise<string> {
  const slug = (seed ?? "").toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 28) || "user";
  const base = slug.length < 3 ? `${slug}_user` : slug;

  for (let i = 0; i < 20; i++) {
    const candidate = i === 0 ? base : `${base}_${i}`;
    if (!USERNAME_RE.test(candidate)) continue;
    const taken = await db.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `${base}_${Date.now().toString(36)}`;
}

export const authConfig = {
  providers: [DiscordProvider],
  adapter: PrismaAdapter(db),
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
        username: (user as typeof user & { username: string | null }).username ?? null,
      },
    }),
  },
  events: {
    async linkAccount({ user, account, profile }) {
      if (account.provider !== "discord") return;
      const existing = await db.user.findUnique({
        where: { id: user.id },
        select: { discordId: true, username: true },
      });
      if (existing?.discordId && existing.username) return;

      const username =
        existing?.username ??
        (await deriveUsername(
          (profile as { username?: string; global_name?: string } | undefined)?.username ??
            user.name,
        ));

      await db.user.update({
        where: { id: user.id },
        data: {
          discordId: existing?.discordId ?? account.providerAccountId,
          username,
        },
      });
    },
  },
} satisfies NextAuthConfig;
