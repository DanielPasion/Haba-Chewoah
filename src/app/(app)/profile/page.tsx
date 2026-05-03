import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

/**
 * Bare `/profile` always redirects to the canonical username-keyed URL so the
 * profile page itself only has to think about one shape: `/profile/[username]`.
 * Keeps the share/copy-link UX honest too.
 */
export default async function MyProfileRedirect() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");
  redirect(`/profile/${session.user.username}`);
}
