import Link from "next/link";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { buttonClass } from "~/components/ui";

import type { FrequencyType } from "../../../../../generated/prisma";

export type HabitDetailData = {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  frequencyType: FrequencyType;
  targetCount: number;
  periodDays: number | null;
  isPublic: boolean;
  startDate: Date | null;
  createdAt: Date;
  owner: {
    id: string;
    username: string;
    displayName: string;
    imageUrl: string | null;
  };
};

export function HabitDetailView({
  habit,
  isOwn,
}: {
  habit: HabitDetailData;
  isOwn: boolean;
}) {
  return (
    <div className="-mx-5 -my-6 flex flex-col gap-5 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <Header habitId={habit.id} />

      <div className="mx-auto flex w-full max-w-180 flex-col gap-5 px-5 md:px-8 md:gap-6">
        <HeroCard habit={habit} isOwn={isOwn} />
        <StatsRow />
        <Heatmap />
        {habit.description && <DescriptionCard description={habit.description} />}
        {!isOwn && <OwnerCard owner={habit.owner} />}
        <RecentLogsEmpty />
      </div>

      <StickyAction habitId={habit.id} isOwn={isOwn} />
    </div>
  );
}

function Header({ habitId }: { habitId: string }) {
  return (
    <header className="sticky top-14 z-10 flex items-center justify-between border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
      <Link
        href="/habits"
        aria-label="back to habits"
        className="grid size-9 place-items-center rounded-full border border-hc-line bg-hc-surface text-hc-ink shadow-hc-soft hover:bg-hc-surface-alt"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
      </Link>
      <span className="font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
        /habit/{habitId.slice(0, 8)}
      </span>
      <span className="size-9" aria-hidden />
    </header>
  );
}

function HeroCard({
  habit,
  isOwn,
}: {
  habit: HabitDetailData;
  isOwn: boolean;
}) {
  return (
    <section className="relative overflow-hidden rounded-hc-4 border-hc border-hc-line bg-hc-surface p-6 shadow-hc">
      <span
        className="absolute inset-x-0 top-0 h-1.5 bg-hc-brand"
        aria-hidden
      />
      <span className="absolute right-4 top-4 rounded-full bg-hc-ink px-2 py-1 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-brand dark:bg-hc-brand dark:text-hc-brand-ink">
        {habit.isPublic ? "· live public" : "🔒 folder"}
      </span>

      <div className="mb-2 flex items-center gap-3">
        <span className="text-3xl leading-none" aria-hidden>
          {habit.icon ?? "✨"}
        </span>
        <span className="font-mono text-hc-meta font-bold uppercase tracking-hc-eyebrow text-hc-ink/70">
          {frequencyLabel(habit)}
        </span>
      </div>

      <h1
        className="mb-4 font-display text-4xl font-extrabold leading-none text-hc-ink"
        style={{ letterSpacing: "-0.04em" }}
      >
        {habit.name}
      </h1>

      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-display text-7xl font-extrabold leading-none text-hc-ink tabular-nums"
              style={{ letterSpacing: "-0.05em" }}
            >
              0
            </span>
            <span
              className="font-display text-2xl font-extrabold text-hc-ink"
              style={{ letterSpacing: "-0.03em" }}
            >
              days
            </span>
          </div>
          <p className="mt-1 font-mono text-hc-eyebrow font-semibold uppercase tracking-hc-eyebrow text-hc-ink/70">
            {isOwn
              ? "log your first day to start the streak"
              : "tracking hasn't started yet"}
          </p>
        </div>
        <div className="-mb-2 shrink-0">
          <TwoFaceMascot size={84} mood="default" bg="#1B1726" />
        </div>
      </div>
    </section>
  );
}

function frequencyLabel(habit: HabitDetailData) {
  if (habit.frequencyType === "daily") return "daily · 1× / day";
  if (habit.frequencyType === "weekly") {
    return `weekly · ${habit.targetCount}× / week`;
  }
  return `${habit.targetCount}× / ${habit.periodDays ?? 7} days`;
}

function StatsRow() {
  const stats = [
    { value: "0%", label: "completion" },
    { value: "0", label: "longest" },
    { value: "0", label: "current" },
    { value: "0", label: "total logs" },
  ];
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-hc-3 border-hc border-hc-line bg-hc-line sm:grid-cols-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex flex-col items-center gap-1 bg-hc-surface px-2 py-3 text-center"
        >
          <span
            className="font-display text-xl font-extrabold leading-none text-hc-ink tabular-nums"
            style={{ letterSpacing: "-0.03em" }}
          >
            {s.value}
          </span>
          <span className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function Heatmap() {
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2
          className="font-display text-base font-bold text-hc-ink"
          style={{ letterSpacing: "-0.02em" }}
        >
          last 8 weeks
        </h2>
        <span className="font-mono text-hc-eyebrow font-semibold text-hc-muted">
          no logs yet
        </span>
      </div>
      <div className="flex gap-2 rounded-hc-3 border-hc border-hc-line bg-hc-surface p-3.5">
        <div
          className="flex flex-col justify-around pr-1 font-mono text-hc-tiny font-semibold text-hc-muted"
          aria-hidden
        >
          {["m", "w", "f"].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="grid flex-1 grid-cols-8 gap-1.5">
          {Array.from({ length: 8 }).map((_, w) => (
            <div key={w} className="grid grid-rows-7 gap-1.5">
              {Array.from({ length: 7 }).map((_, d) => (
                <div
                  key={d}
                  className="aspect-square rounded-sm bg-hc-line"
                  aria-hidden
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex flex-wrap gap-3 font-mono text-hc-tiny font-semibold text-hc-muted">
        <Legend color="bg-hc-brand">done</Legend>
        <Legend color="bg-hc-accent">missed</Legend>
        <Legend color="bg-hc-line">n/a</Legend>
      </div>
    </section>
  );
}

function Legend({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`size-2.5 rounded-sm border border-hc-line-strong ${color}`}
        aria-hidden
      />
      {children}
    </span>
  );
}

function DescriptionCard({ description }: { description: string }) {
  return (
    <section className="rounded-hc-3 border-hc border-hc-line bg-hc-surface p-4">
      <p className="mb-1.5 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
        the rule
      </p>
      <p className="text-sm leading-relaxed text-hc-ink">{description}</p>
    </section>
  );
}

function OwnerCard({ owner }: { owner: HabitDetailData["owner"] }) {
  return (
    <section className="flex items-center gap-3 rounded-hc-3 border-hc border-hc-line-strong bg-hc-surface p-3.5">
      <div className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink">
        {owner.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={owner.imageUrl}
            alt={`@${owner.username} avatar`}
            className="size-full object-cover"
          />
        ) : (
          <TwoFaceMascot size={36} bg="#1B1726" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-sans text-sm font-bold text-hc-ink">
          {owner.displayName}
        </p>
        <p className="truncate font-mono text-hc-meta text-hc-muted">
          @{owner.username}
        </p>
      </div>
      <Link
        href={`/profile/${owner.username}`}
        className={buttonClass({ variant: "secondary", size: "sm" })}
      >
        view profile
      </Link>
    </section>
  );
}

function RecentLogsEmpty() {
  return (
    <section>
      <h2
        className="mb-2 font-display text-base font-bold text-hc-ink"
        style={{ letterSpacing: "-0.02em" }}
      >
        recent logs
      </h2>
      <div className="flex flex-col items-center gap-2 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-8 text-center">
        <TwoFaceMascot size={56} mood="wink" bg="#1B1726" />
        <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
          logs · coming soon
        </p>
        <p className="max-w-xs text-sm text-hc-ink">
          every check-in shows up here once habit logging ships.
        </p>
      </div>
    </section>
  );
}

function StickyAction({
  habitId,
  isOwn,
}: {
  habitId: string;
  isOwn: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 mx-auto w-full max-w-180 px-5 pb-4 pt-2 md:px-8">
      <div className="flex gap-2">
        {isOwn ? (
          <>
            <button
              type="button"
              disabled
              title="logging coming soon"
              className="grid flex-1 cursor-not-allowed place-items-center gap-1 rounded-hc-3 border border-hc-line bg-hc-ink/90 px-4 py-4 font-display text-base font-extrabold text-hc-brand opacity-90 shadow-hc-stamp dark:bg-hc-brand/80 dark:text-hc-brand-ink"
              style={{ letterSpacing: "-0.02em" }}
            >
              + log day 1 (soon)
            </button>
            <Link
              href={`/habit/${habitId}/edit`}
              aria-label="edit habit"
              className="grid place-items-center rounded-hc-3 border border-hc-line bg-hc-surface px-4 py-4 text-hc-ink hover:bg-hc-surface-alt"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </Link>
          </>
        ) : (
          <button
            type="button"
            disabled
            title="cheering coming soon"
            className="flex-1 cursor-not-allowed rounded-hc-3 border border-hc-line bg-hc-accent px-4 py-4 font-display text-base font-extrabold text-hc-accent-ink opacity-90 shadow-hc-stamp"
            style={{ letterSpacing: "-0.02em" }}
          >
            cheer (soon)
          </button>
        )}
      </div>
    </div>
  );
}
