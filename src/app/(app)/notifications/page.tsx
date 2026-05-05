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

  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
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
      <header className="sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-10 flex items-center gap-3 border-b border-hc-line bg-hc-bg/90 px-5 py-3 backdrop-blur md:top-0 md:px-8 md:py-4">
        <h1
          className="min-w-0 flex-1 truncate font-display text-base font-extrabold leading-none text-hc-ink"
          style={{ letterSpacing: "-0.02em" }}
        >
          notifications
        </h1>
        {unreadCount > 0 && (
          <span className="rounded-full border border-hc-line bg-hc-accent px-2.5 py-1 font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-accent-ink">
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
                  className="self-start rounded-full border border-hc-line bg-hc-surface px-4 py-1.5 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink hover:bg-hc-surface-alt"
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
    <div className="flex flex-col items-center gap-2 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-10 text-center">
      <span className="text-3xl" aria-hidden>
        🔔
      </span>
      <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
        all quiet
      </p>
      <p className="max-w-xs text-sm text-hc-ink">
        likes, comments, follows, mentions, and chew-outs land here.
      </p>
    </div>
  );
}
