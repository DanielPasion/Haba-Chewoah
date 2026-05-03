import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

export default async function MyProfileRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");
  redirect(`/profile/${session.user.username}`);
}
