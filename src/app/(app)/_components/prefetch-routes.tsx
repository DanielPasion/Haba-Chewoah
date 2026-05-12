"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Eagerly warm the client router cache for the top-level (app) routes as
// soon as the shell mounts. Combined with `experimental.staleTimes.dynamic`
// in next.config.js, the result is: every primary page is loaded in the
// background at app start and the cached RSC payload is reused on every
// tab-bar tap until the next mutation or pull-to-refresh.
//
// Per-detail routes (habit/[id], habit-log/[id], profile/[other-user]) are
// not prefetched here — those load on demand and are prefetched naturally
// by the in-viewport <Link> elements that point at them.
export function PrefetchRoutes({
  username,
  habitIds,
}: {
  username: string;
  habitIds: string[];
}) {
  const router = useRouter();
  useEffect(() => {
    const targets = [
      "/feed",
      "/explore",
      "/notifications",
      `/profile/${username}`,
      ...habitIds.map((id) => `/habit/${id}`),
    ];
    for (const href of targets) {
      try {
        router.prefetch(href);
      } catch {
        // prefetch is best-effort; a single failure shouldn't break the
        // others or surface to the user.
      }
    }
  }, [router, username, habitIds]);
  return null;
}
