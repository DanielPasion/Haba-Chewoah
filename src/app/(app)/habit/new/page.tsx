import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "~/server/auth";

import { createHabitAction } from "../_actions";
import { HabitForm } from "../_components/habit-form";

export const metadata: Metadata = { title: "new habit" };

export default async function NewHabitPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  return (
    <div className="-mx-5 -my-6 md:-mx-8 md:-my-8">
      <div className="mx-auto flex w-full max-w-130 flex-col gap-7 px-5 py-8 md:px-8 md:py-12">
        <header className="flex flex-col gap-2.5">
          <p className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            new habit
          </p>
          <h1
            className="font-display text-4xl font-extrabold leading-[0.95] text-hc-ink md:text-5xl"
            style={{ letterSpacing: "-0.05em" }}
          >
            What will you commit to?
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-hc-muted">
            name the habit, set the cadence, and the rest is showing up. you
            can make it private if you&rsquo;d rather not share.
          </p>
        </header>

        <HabitForm mode="create" action={createHabitAction} />
      </div>
    </div>
  );
}
