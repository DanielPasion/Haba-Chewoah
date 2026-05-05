import { type Metadata } from "next";
import { redirect } from "next/navigation";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
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
      <div className="mx-auto flex w-full max-w-130 flex-col gap-6 px-5 py-6 md:px-8 md:py-10">
        <section className="relative overflow-hidden rounded-hc-4 border-hc border-hc-line bg-hc-ink p-6 shadow-hc">
          <span
            className="absolute inset-x-0 top-0 h-1.5 bg-hc-brand"
            aria-hidden
          />
          <div
            className="absolute -right-3 -top-3 opacity-90"
            aria-hidden
          >
            <TwoFaceMascot size={120} mood="smug" bg="#1B1726" />
          </div>
          <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-accent">
            step 1 — the dare
          </p>
          <h1
            className="mt-3 max-w-[78%] font-display text-3xl font-extrabold leading-tight text-hc-bg"
            style={{ letterSpacing: "-0.04em" }}
          >
            i bet i won&rsquo;t&hellip;
          </h1>
          <p className="mt-2 max-w-[78%] font-sans text-sm font-medium text-hc-bg/70">
            name the habit, set the rules, prove yourself wrong.
          </p>
        </section>

        <HabitForm mode="create" action={createHabitAction} />
      </div>
    </div>
  );
}
