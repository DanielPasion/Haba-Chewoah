import Link from "next/link";

import { Avatar } from "~/components/avatar";
import { HabitIcon } from "~/components/habit-icon";
import { RelativeTime } from "~/components/relative-time";

import type { NotificationType } from "../../../../generated/prisma";

export type ActivityRowVM = {
  id: string;
  type: NotificationType;
  createdAt: Date;
  isRead: boolean;
  actor: {
    username: string | null;
    displayName: string;
    imageUrl: string | null;
  } | null;
  habit: { id: string; name: string; icon: string | null } | null;
  habitLogId: string | null;
};

type Decoration = {
  verb: React.ReactNode;
  href: string;
  /** Optional accent badge sitting at the right edge — used for chewouts,
   *  milestones, and other "this needs attention" notifications. */
  badge: { kind: "chewout" | "milestone" | "alert" | "mention" | "succeeded" } | null;
};

function decorate(n: ActivityRowVM): Decoration {
  const habitName = n.habit?.name ?? "your habit";
  const actorHandle = n.actor?.username ?? null;

  switch (n.type) {
    case "like":
      return {
        verb: "liked your log",
        href: n.habitLogId ? `/habit-log/${n.habitLogId}` : "#",
        badge: null,
      };
    case "comment":
      return {
        verb: "commented on your log",
        href: n.habitLogId ? `/habit-log/${n.habitLogId}` : "#",
        badge: null,
      };
    case "mention":
      return {
        verb: "mentioned you in a comment",
        href: n.habitLogId ? `/habit-log/${n.habitLogId}` : "#",
        badge: { kind: "mention" },
      };
    case "follow":
      return {
        verb: "started following you",
        href: actorHandle ? `/profile/${actorHandle}` : "#",
        badge: null,
      };
    case "chewout":
      return {
        verb: (
          <>
            chewed you out about <span className="italic">&ldquo;{habitName}&rdquo;</span>
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: { kind: "chewout" },
      };
    case "reminder":
      return {
        verb: (
          <>
            time to log <span className="italic">&ldquo;{habitName}&rdquo;</span>
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: null,
      };
    case "streak_at_risk":
      return {
        verb: (
          <>
            your <span className="italic">&ldquo;{habitName}&rdquo;</span> streak ends at midnight
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: { kind: "alert" },
      };
    case "streak_milestone":
      return {
        verb: (
          <>
            milestone hit on <span className="italic">&ldquo;{habitName}&rdquo;</span>
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: { kind: "milestone" },
      };
    case "habit_succeeded":
      return {
        verb: (
          <>
            you finished <span className="italic">&ldquo;{habitName}&rdquo;</span>
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: { kind: "succeeded" },
      };
    default:
      return { verb: "had activity", href: "#", badge: null };
  }
}

const BADGE_GLYPH: Record<NonNullable<Decoration["badge"]>["kind"], React.ReactNode> = {
  chewout: (
    <path d="M13 2L3 14h9l-1 8 10-12h-9z" fill="currentColor" />
  ),
  milestone: (
    <path
      d="M12 2l2.5 5.5L20 8.5l-4 4 1 6L12 15l-5 3.5 1-6-4-4 5.5-1z"
      fill="currentColor"
    />
  ),
  alert: <path d="M12 4v10M12 18.5v1.5" />,
  mention: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M16 12v1.5a2.5 2.5 0 0 1-5 0V8M8 12a4 4 0 1 1 8 0" />
    </>
  ),
  succeeded: <path d="M5 12l5 5 9-11" />,
};

const BADGE_CLASS: Record<NonNullable<Decoration["badge"]>["kind"], string> = {
  chewout: "bg-hc-accent text-hc-accent-ink",
  milestone: "bg-hc-brand text-hc-brand-ink",
  alert: "bg-hc-accent text-hc-accent-ink",
  mention: "bg-hc-ink text-hc-bg",
  succeeded: "bg-hc-ink text-hc-bg",
};

/**
 * Single source of truth for "render one notification". Used by both the
 * desktop right-rail and the /notifications page so verbs/icons stay
 * in sync.
 *
 * System notifs (reminder/streak/milestone/habit_succeeded) have no actor —
 * we show the related habit's icon as the avatar slot so the row still
 * feels anchored to a recognisable thing.
 */
export function ActivityRow({
  notification: n,
  variant = "compact",
}: {
  notification: ActivityRowVM;
  variant?: "compact" | "full";
}) {
  const d = decorate(n);
  const isFull = variant === "full";
  const showHabitIcon = !n.actor && n.habit;

  return (
    <Link
      href={d.href}
      className={`flex items-center gap-3 transition-colors ${
        isFull
          ? `rounded-hc-2 border border-hc-line bg-hc-surface px-3 py-3 hover:bg-hc-surface-alt ${
              !n.isRead ? "border-hc-line-strong" : ""
            }`
          : "rounded-hc-2 px-2 py-1.5 hover:bg-hc-surface"
      }`}
    >
      {showHabitIcon ? (
        <HabitIcon value={n.habit!.icon} size={isFull ? 38 : 32} />
      ) : (
        <Avatar
          imageUrl={n.actor?.imageUrl ?? null}
          name={n.actor?.displayName ?? "someone"}
          fallbackName={n.actor?.username ?? undefined}
          size={isFull ? 38 : 32}
          alt={n.actor?.displayName ?? "system"}
        />
      )}

      <div
        className={`min-w-0 flex-1 leading-snug text-hc-ink ${
          isFull ? "text-sm" : "text-xs"
        }`}
      >
        {n.actor && (
          <>
            <span className="font-bold">
              {n.actor.username ? `@${n.actor.username}` : n.actor.displayName}
            </span>{" "}
          </>
        )}
        <span className={n.actor ? "" : "text-hc-ink/85"}>{d.verb}</span>{" "}
        <span className="font-mono text-hc-tiny font-medium text-hc-muted">
          · <RelativeTime date={n.createdAt} />
        </span>
      </div>

      {d.badge && (
        <span
          aria-hidden
          className={`grid size-6 shrink-0 place-items-center rounded-full ${BADGE_CLASS[d.badge.kind]}`}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.85"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {BADGE_GLYPH[d.badge.kind]}
          </svg>
        </span>
      )}

      {isFull && !n.isRead && !d.badge && (
        <span
          aria-label="unread"
          className="size-2 shrink-0 rounded-full bg-hc-accent"
        />
      )}
    </Link>
  );
}
