import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { buttonClass } from "~/components/ui";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { HabitCard } from "./_components/habit-card";

export const metadata: Metadata = { title: "habits" };

export default async function HabitsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const habits = await db.habit.findMany({
    where: { userId: session.user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      icon: true,
      description: true,
      frequencyType: true,
      targetCount: true,
      periodDays: true,
      isPublic: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <p className="font-mono text-hc-meta font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            /habits
          </p>
          <h1
            className="font-display text-4xl font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            your habits
          </h1>
        </div>
        <Link
          href="/habit/new"
          className={buttonClass({ variant: "primary", size: "md" })}
        >
          + new habit
        </Link>
      </div>

      {habits.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {habits.map((h) => (
            <HabitCard key={h.id} habit={h} />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-12 text-center">
      <TwoFaceMascot size={84} mood="smug" bg="#1B1726" />
      <div className="flex flex-col items-center gap-1">
        <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
          no habits yet
        </p>
        <p className="max-w-sm text-sm text-hc-ink">
          start with one. say{" "}
          <span className="font-display italic font-bold">
            &ldquo;i bet i won&rsquo;t…&rdquo;
          </span>{" "}
          and prove yourself wrong.
        </p>
      </div>
      <Link
        href="/habit/new"
        className={buttonClass({ variant: "primary", size: "md" })}
      >
        start a new habit
      </Link>
    </div>
  );
}
