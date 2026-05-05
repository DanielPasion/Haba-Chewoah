"use client";

import { useEffect, useRef } from "react";

import { markAllNotificationsReadOnView } from "../_actions";

/**
 * Fires the mark-all-read server action exactly once when the page mounts.
 * Doing this in an effect (rather than inline at render) is the only way
 * to mutate from an RSC page — server-side mutations during render are
 * disallowed by Next.js. The `useRef` guard prevents the dev-mode double-
 * effect from sending the action twice.
 */
export function AutoMarkRead() {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void markAllNotificationsReadOnView();
  }, []);
  return null;
}
