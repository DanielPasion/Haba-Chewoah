import { redirect } from "next/navigation";

import { env } from "~/env";
import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { ActivityRow, type ActivityRowVM } from "../_components/activity-row";
import { PushToggle } from "../_components/push-toggle";
import { markAllNotificationsReadOnView } from "./_actions";
import { AutoMarkRead } from "./_components/auto-mark-read";

const PAGE_LIMIT = 60;

/**
 * `/notifications` — full activity log with push-permission toggle on top.
 * Marking-as-read happens via a fire-and-forget action dispatched from
 * `<AutoMarkRead />` on mount; doing it inline at render time would mutate
 * inside an RSC pass, which Next.js disallows. The visible "mark all read"
 * button is a fallback for cases where the auto-fire didn't land (e.g.
 * client JS disabled, or the user wants an explicit acknowledgement).
 */
export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");

  // §9: hide notifications from blocked actors. The fanout helper already
  // suppresses NEW notifications when a block exists, but rows created
  // BEFORE the block was put in place stay in the table — read-side
  // filtering handles those. Either-direction block hides the actor
  // (matches the symmetric rule used by ensureLogVisible / feed).
  const [blocksByMe, blocksOfMe] = await Promise.all([
    db.block.findMany({
      where: { blockerId: session.user.id },
      select: { blockedId: true },
    }),
    db.block.findMany({
      where: { blockedId: session.user.id },
      select: { blockerId: true },
    }),
  ]);
  const hiddenActorIds = [
    ...blocksByMe.map((b) => b.blockedId),
    ...blocksOfMe.map((b) => b.blockerId),
  ];

  const notifications = await db.notification.findMany({
    where: {
      userId: session.user.id,
      ...(hiddenActorIds.length > 0
        ? { OR: [{ actorId: null }, { actorId: { notIn: hiddenActorIds } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: PAGE_LIMIT,
    select: {
      id: true,
      type: true,
      createdAt: true,
      isRead: true,
      habitLogId: true,
      actor: {
        select: { username: true, name: true, image: true },
      },
      habit: { select: { id: true, name: true, icon: true } },
    },
  });

  const vms: ActivityRowVM[] = notifications.map((n) => ({
    id: n.id,
    type: n.type,
    createdAt: n.createdAt,
    isRead: n.isRead,
    habitLogId: n.habitLogId,
    actor: n.actor
      ? {
          username: n.actor.username,
          displayName: n.actor.name ?? n.actor.username ?? "someone",
          imageUrl: n.actor.image,
        }
      : null,
    habit: n.habit,
  }));

  const unreadCount = vms.filter((n) => !n.isRead).length;

  return (
    <div className="-mx-5 -my-6 flex flex-col gap-5 pb-2 md:-mx-8 md:-my-8 md:gap-6">
      <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/85 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
        <h1
          className="min-w-0 flex-1 truncate font-display text-xl font-extrabold text-hc-ink"
          style={{ letterSpacing: "-0.04em" }}
        >
          notifications
        </h1>
        {unreadCount > 0 && (
          <span className="rounded-full bg-hc-accent px-2.5 py-1 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-accent-ink">
            {unreadCount} new
          </span>
        )}
      </header>

      <div className="mx-auto flex w-full max-w-180 flex-col gap-4 px-5 md:px-8">
        <PushToggle vapidPublicKey={env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? null} />
        {unreadCount > 0 && <AutoMarkRead />}

        {vms.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <ul className="flex flex-col gap-2">
              {vms.map((n) => (
                <li key={n.id}>
                  <ActivityRow notification={n} variant="full" />
                </li>
              ))}
            </ul>
            {unreadCount > 0 && (
              // The form posts to a server action that flips is_read = true
              // for every unread row, then revalidates the layout so the
              // bell badge clears on the next render. Using <form> instead
              // of useEffect keeps it server-only — no client JS needed.
              <form action={markAllNotificationsReadOnView}>
                <input type="hidden" name="t" value={Date.now()} />
                <button
                  type="submit"
                  className="self-start rounded-full border border-hc-line bg-hc-surface px-4 py-1.5 font-sans text-xs font-semibold text-hc-ink hover:bg-hc-surface-alt"
                >
                  mark all read
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-hc-3 border border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-12 text-center">
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        className="text-hc-muted"
      >
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <p className="font-display text-base font-extrabold text-hc-ink">
        all quiet
      </p>
      <p className="max-w-xs text-sm text-hc-muted">
        likes, comments, follows, mentions, and logs from people you follow
        will land here.
      </p>
    </div>
  );
}
