import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { ProfileView } from "../_components/profile-view";

type Params = Promise<{ username: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function UserProfilePage({ params }: { params: Params }) {
  // Re-check auth here even though the (app) layout already gated it — a leak
  // here would expose private content.
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const { username } = await params;

  const user = await db.user.findFirst({
    where: { username: { equals: username, mode: "insensitive" } },
    select: {
      id: true,
      username: true,
      bio: true,
      image: true,
    },
  });

  if (!user?.username) notFound();

  const isOwn = user.id === session.user.id;

  return (
    <ProfileView
      isOwn={isOwn}
      user={{
        username: user.username,
        bio: user.bio,
        imageUrl: user.image,
      }}
    />
  );
}
