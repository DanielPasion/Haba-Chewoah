// Curated short-list — kept small enough that the <select> stays scannable.
export const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export type Timezone = (typeof TIMEZONES)[number];

/**
 * Returns true iff `tz` is a real IANA timezone the JS runtime knows about.
 * The cron loop calls `Intl.DateTimeFormat({ timeZone })` per habit; an
 * invalid value throws `RangeError` and (without per-iteration try/catch)
 * would halt the entire run. We validate at write time so bad strings
 * never enter the DB. `supportedValuesOf` is the spec source of truth —
 * the curated `TIMEZONES` list is a UX subset, not a full validator.
 */
export function isValidTimezone(tz: string): boolean {
  if (typeof tz !== "string" || tz.length === 0 || tz.length > 64) {
    return false;
  }
  try {
    // The throwing path: `Intl.DateTimeFormat({ timeZone: "AAAA" })` raises
    // RangeError. Wrapping it lets us return false without crashing.
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}
