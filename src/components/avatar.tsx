import { type CSSProperties } from "react";

type AvatarProps = {
  imageUrl: string | null | undefined;
  /** Used to seed both the initials and the fallback colour. */
  name: string;
  /** Optional secondary string (typically the username) used if `name` is empty. */
  fallbackName?: string;
  /** Outer diameter in px. */
  size: number;
  /** Pixel border that matches the page background — used by overlap layouts. */
  ringWidth?: number;
  /** Tailwind colour class for the ring border (defaults to page bg). */
  ringClassName?: string;
  alt?: string;
  className?: string;
};

// Six muted, editorial-friendly fills. The seed function below picks one
// deterministically per user so a person's avatar colour is stable across
// sessions and surfaces.
const PALETTE = [
  { bg: "#dde2d4", fg: "#2f3a26" }, // sage
  { bg: "#dcd3e2", fg: "#2c2542" }, // lavender
  { bg: "#e6d8c5", fg: "#3a2c18" }, // sand
  { bg: "#e2c9d2", fg: "#3a1f29" }, // rose
  { bg: "#cfdce0", fg: "#1f2f33" }, // mist
  { bg: "#dfd8c2", fg: "#2f2a16" }, // straw
];

function seedFromString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initialsFromName(name: string) {
  const cleaned = name.trim().replace(/^@/, "");
  if (!cleaned) return "·";
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return cleaned.slice(0, 2).toUpperCase();
  }
  return (parts[0]![0]! + parts[parts.length - 1]![0]!).toUpperCase();
}

/**
 * Avatar with an image-or-initials fallback. The fallback uses a deterministic
 * muted colour seeded by `name` (or `fallbackName`), so every viewer sees the
 * same avatar tile for a given user.
 *
 * Size is required and applied as inline width/height — the caller controls
 * the dimension explicitly so layouts that need pixel-perfect overlap (e.g.
 * the desktop profile banner) don't have to fight Tailwind classes.
 */
export function Avatar({
  imageUrl,
  name,
  fallbackName,
  size,
  ringWidth = 0,
  ringClassName,
  alt,
  className = "",
}: AvatarProps) {
  const seed = name?.trim() || fallbackName?.trim() || "?";
  const palette = PALETTE[seedFromString(seed) % PALETTE.length]!;
  const initials = initialsFromName(name?.trim() || fallbackName?.trim() || "?");

  const style: CSSProperties = {
    width: size,
    height: size,
    border: ringWidth ? `${ringWidth}px solid currentColor` : undefined,
  };

  const wrapperClass = `relative grid shrink-0 place-items-center overflow-hidden rounded-full ${
    ringClassName ?? "text-hc-bg"
  } ${className}`;

  if (imageUrl) {
    return (
      <span className={wrapperClass} style={style}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt ?? ""}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      </span>
    );
  }

  return (
    <span
      className={wrapperClass}
      style={{ ...style, background: palette.bg, color: palette.fg }}
      role="img"
      aria-label={alt ?? name}
    >
      <span
        className="font-display font-extrabold leading-none"
        style={{
          fontSize: Math.round(size * 0.4),
          letterSpacing: "-0.04em",
        }}
      >
        {initials}
      </span>
    </span>
  );
}
