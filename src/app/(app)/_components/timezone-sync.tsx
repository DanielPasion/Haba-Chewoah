"use client";

import { useEffect } from "react";

import { syncDetectedTimezoneAction } from "../_actions";

// Mounted once at the (app) layout level. On first render after auth,
// it asks the browser for its IANA zone and — if it differs from what we
// have stored — pushes the new value through `syncDetectedTimezoneAction`.
//
// Why client-side (not in the auth callback): Discord OAuth doesn't surface
// the user's timezone, so first-login users keep the schema default of
// "UTC" and any habit logged before they hit /profile/edit lands in the
// wrong day bucket. Detecting once on mount fixes the silent-default case.
export function TimezoneSync({ serverTimezone }: { serverTimezone: string }) {
  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected || detected === serverTimezone) return;
    // Fire-and-forget: a transient failure shouldn't bubble to the UI;
    // the next session-mount will retry.
    void syncDetectedTimezoneAction(detected).catch(() => {});
  }, [serverTimezone]);

  return null;
}
