/**
 * Single source of truth for hardcoded brand color hex values.
 *
 * The CSS layer (`globals.css`) drives interactive UI through `--color-hc-*`
 * vars. SVG attributes (`fill`, `stroke`) and `next/og` rendering can't read
 * CSS vars, so they import these constants instead. Keep these in sync with
 * the `:root` light theme defaults in `globals.css`.
 */
export const BRAND = {
  ink: "#1F1B2E",
  inkLegacy: "#1B1726", // mascot was originally drawn against this; preserved on the mascot itself for character consistency.
  brand: "#D8FF3C",
  brandStrong: "#C7EE2B",
  accent: "#E8769A",
  accentInk: "#FFFFFF",
  /**
   * The mascot's tongue dot uses the original hot pink (#FF4D8D), not the
   * refined dustier accent. Keeping it for character recognition.
   */
  mascotTongue: "#FF4D8D",
  white: "#FFFFFF",
  bg: "#F6F3EB",
} as const;
