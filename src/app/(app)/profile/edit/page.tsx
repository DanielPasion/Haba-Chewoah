import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { EditProfileForm } from "./_components/edit-profile-form";

export const metadata: Metadata = { title: "edit profile" };

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const me = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      username: true,
      bio: true,
      timezone: true,
      image: true,
    },
  });

  // Defensive: session said we have a username, but the row vanished. Send
  // them through onboarding rather than render a half-empty form.
  if (!me?.username) redirect("/create-account");

  return (
    <div className="-mx-5 -my-6 md:-mx-8 md:-my-8">
      <div className="mx-auto flex w-full max-w-115 flex-col items-center gap-8 px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="font-display text-3xl font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            edit profile
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-hc-muted">
            @{me.username}
          </p>
        </div>

        <EditProfileForm
          username={me.username}
          defaultBio={me.bio ?? ""}
          defaultTimezone={me.timezone}
          defaultAvatarUrl={me.image}
        />
      </div>
    </div>
  );
}
