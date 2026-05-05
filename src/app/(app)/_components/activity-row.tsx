import Link from "next/link";

import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
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
  /** Right-side accent badge (the ⚡ on chew-outs, ✦ on milestones). */
  badge: { label: string; tone: "accent" | "brand" | "ink" } | null;
  /** Override the default avatar with an icon (system notifs have no actor). */
  systemIcon: string | null;
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
        systemIcon: null,
      };
    case "comment":
      return {
        verb: "commented on your log",
        href: n.habitLogId ? `/habit-log/${n.habitLogId}` : "#",
        badge: null,
        systemIcon: null,
      };
    case "mention":
      return {
        verb: "mentioned you in a comment",
        href: n.habitLogId ? `/habit-log/${n.habitLogId}` : "#",
        badge: { label: "@", tone: "ink" },
        systemIcon: null,
      };
    case "follow":
      return {
        verb: "started following you",
        href: actorHandle ? `/profile/${actorHandle}` : "#",
        badge: null,
        systemIcon: null,
      };
    case "chewout":
      return {
        verb: (
          <>
            chewed you out about <span className="italic">"{habitName}"</span>
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: { label: "⚡", tone: "accent" },
        systemIcon: null,
      };
    case "reminder":
      return {
        verb: (
          <>
            time to log <span className="italic">"{habitName}"</span>
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: null,
        systemIcon: n.habit?.icon ?? "⏰",
      };
    case "streak_at_risk":
      return {
        verb: (
          <>
            your <span className="italic">"{habitName}"</span> streak ends at midnight
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: { label: "!", tone: "accent" },
        systemIcon: n.habit?.icon ?? "⏳",
      };
    case "streak_milestone":
      return {
        verb: (
          <>
            milestone hit on <span className="italic">"{habitName}"</span>
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: { label: "✦", tone: "brand" },
        systemIcon: n.habit?.icon ?? "✦",
      };
    case "habit_succeeded":
      return {
        verb: (
          <>
            you finished <span className="italic">"{habitName}"</span>
          </>
        ),
        href: n.habit ? `/habit/${n.habit.id}` : "#",
        badge: { label: "✓", tone: "brand" },
        systemIcon: n.habit?.icon ?? "🏁",
      };
    default:
      return { verb: "had activity", href: "#", badge: null, systemIcon: null };
  }
}

/**
 * Single source of truth for "render one notification" — used by both the
 * desktop right-rail and the /notifications page so the verbs/icons stay
 * in sync. Variant `compact` strips bullets the right-rail can't fit.
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

  // System notifs (reminder/streak/milestone/habit_succeeded) have no actor;
  // show the habit's icon instead of an avatar so the row still feels
  // anchored to a thing the user can recognize.
  const showSystemIcon = !n.actor && d.systemIcon;

  return (
    <Link
      href={d.href}
      className={`flex items-center gap-2.5 transition-colors hover:opacity-90 ${
        isFull
          ? `rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-3 py-3 hover:bg-hc-surface-alt ${
              !n.isRead ? "border-hc-ink shadow-hc-soft" : ""
            }`
          : ""
      }`}
    >
      <span
        className={`grid shrink-0 place-items-center overflow-hidden rounded-full border border-hc-line bg-hc-ink ${
          isFull ? "size-10" : "size-8"
        }`}
      >
        {showSystemIcon ? (
          <span className="text-base" aria-hidden>
            {d.systemIcon}
          </span>
        ) : n.actor?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={n.actor.imageUrl} alt="" className="size-full object-cover" />
        ) : (
          <TwoFaceMascot size={isFull ? 36 : 28} bg="#1B1726" />
        )}
      </span>
      <div
        className={`min-w-0 flex-1 font-sans leading-snug text-hc-ink ${
          isFull ? "text-sm" : "text-xs"
        }`}
      >
        {n.actor ? (
          <span className="font-bold">
            {n.actor.username ? `@${n.actor.username}` : n.actor.displayName}
          </span>
        ) : null}
        {n.actor ? " " : null}
        {d.verb}{" "}
        <span className="font-mono text-hc-tiny font-semibold text-hc-muted">
          · <RelativeTime date={n.createdAt} />
        </span>
      </div>
      {d.badge && (
        <span
          aria-hidden
          className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-hc-tiny font-bold ${
            d.badge.tone === "accent"
              ? "bg-hc-accent text-hc-accent-ink"
              : d.badge.tone === "brand"
                ? "bg-hc-brand text-hc-brand-ink"
                : "bg-hc-ink text-hc-brand"
          }`}
        >
          {d.badge.label}
        </span>
      )}
      {isFull && !n.isRead && (
        <span
          aria-label="unread"
          className="size-2 shrink-0 rounded-full bg-hc-accent"
        />
      )}
    </Link>
  );
}
