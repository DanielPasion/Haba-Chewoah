// SVG attributes and `next/og` can't read CSS vars, so they import these
// constants. Keep in sync with the `:root` light theme in `globals.css`.
export const BRAND = {
  ink: "#1F1B2E",
  inkLegacy: "#1B1726",
  brand: "#F5D76E",
  brandStrong: "#E8C456",
  accent: "#E8769A",
  accentInk: "#FFFFFF",
  // Original hot pink, kept distinct from the dustier accent for character recognition.
  mascotTongue: "#FF4D8D",
  white: "#FFFFFF",
  bg: "#F6F3EB",
} as const;
