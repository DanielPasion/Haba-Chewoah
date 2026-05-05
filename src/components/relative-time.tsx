"use client";

import { useEffect, useState } from "react";

const RTF = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

function format(date: Date): string {
  const now = Date.now();
  const diffSec = Math.round((date.getTime() - now) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return RTF.format(diffSec, "second");
  if (abs < 3600) return RTF.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return RTF.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 7) return RTF.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 30)
    return RTF.format(Math.round(diffSec / (86400 * 7)), "week");
  return date.toLocaleDateString();
}

/**
 * Renders a relative timestamp ("3 minutes ago") that updates in place.
 *
 * Why a component (not a function): SSR computes `format()` at request
 * time, the client computes it again at hydration — and those two `now`s
 * differ by a few seconds, which is enough to flip "43 minutes ago" to
 * "44 minutes ago" and trigger a hydration mismatch.
 *
 * Fix: `suppressHydrationWarning` tells React the text is intentionally
 * timing-sensitive. Then a `useEffect` re-renders with the *current*
 * relative label and re-ticks every minute so users on a stale tab see
 * the time advance naturally.
 *
 * Accepts `Date` or ISO string so callers don't have to wrap dates that
 * arrived as JSON over the wire (e.g. from a server action response).
 */
export function RelativeTime({
  date,
  className,
}: {
  date: Date | string;
  className?: string;
}) {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const [label, setLabel] = useState(() => format(dateObj));

  useEffect(() => {
    setLabel(format(dateObj));
    const id = setInterval(() => setLabel(format(dateObj)), 60_000);
    return () => clearInterval(id);
  }, [dateObj]);

  return (
    <time
      dateTime={dateObj.toISOString()}
      className={className}
      suppressHydrationWarning
    >
      {label}
    </time>
  );
}
