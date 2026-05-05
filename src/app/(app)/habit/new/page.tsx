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
      <div className="mx-auto flex w-full max-w-115 flex-col gap-7 px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-2">
          <h1
            className="font-display text-3xl font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            start a new habit
          </h1>
          <p className="text-sm text-hc-ink">
            say{" "}
            <span className="font-display italic font-bold">
              &ldquo;i bet i won&rsquo;t…&rdquo;
            </span>{" "}
            and prove yourself wrong.
          </p>
        </div>

        <HabitForm mode="create" action={createHabitAction} />
      </div>
    </div>
  );
}
