import { type CSSProperties, type SVGProps } from "react";

type IconPath = React.ReactNode;

export type HabitIconCategory = "body" | "mind" | "fuel" | "soul";

type Entry = {
  key: string;
  label: string;
  category: HabitIconCategory;
  path: IconPath;
};

const I = (
  ...children: React.ReactNode[]
): IconPath => <>{children.map((c, i) => <g key={i}>{c}</g>)}</>;

// Curated set of habit icons, grouped by life category. The visual style is
// uniform: 24×24 viewBox, 1.75 stroke, round caps + joins. New keys can be
// added freely — the form picker re-reads CATEGORIES on render. Legacy emoji
// strings still render via HabitIcon's fallback path, so adding/removing keys
// is safe for existing data.
const ENTRIES: readonly Entry[] = [
  // ───── body ─────
  {
    key: "run",
    label: "run",
    category: "body",
    path: I(
      <circle cx="16" cy="5" r="2" />,
      <path d="M14.5 9.5l-3.5 4 3 2.5L12 21" />,
      <path d="M11 13.5l-4 1 1-4 4-2.5 3.5 2.5 3 1" />,
    ),
  },
  {
    key: "walk",
    label: "walk",
    category: "body",
    path: I(
      <circle cx="13" cy="4.5" r="1.8" />,
      <path d="M11 9.5l3-1 2.5 4-2 1.5L17 21" />,
      <path d="M11 9.5L8.5 13l1.5 4-3 4" />,
    ),
  },
  {
    key: "bike",
    label: "cycle",
    category: "body",
    path: I(
      <circle cx="6" cy="17" r="3.5" />,
      <circle cx="18" cy="17" r="3.5" />,
      <path d="M6 17l4-7h6l2 7M10 10l-1-3h-2M16 10l-1.5-4.5" />,
    ),
  },
  {
    key: "swim",
    label: "swim",
    category: "body",
    path: I(
      <path d="M2 17c2 0 2 1.5 4 1.5S8 17 10 17s2 1.5 4 1.5S16 17 18 17s2 1.5 4 1.5" />,
      <path d="M2 13c2 0 2 1.5 4 1.5S8 13 10 13s2 1.5 4 1.5S16 13 18 13s2 1.5 4 1.5" />,
      <circle cx="17" cy="6" r="1.5" />,
      <path d="M5 9l4-2 3 1.5 4-1" />,
    ),
  },
  {
    key: "lift",
    label: "lift",
    category: "body",
    path: I(
      <path d="M3 9v6M6 7v10M9 10.5h6M18 7v10M21 9v6" />,
    ),
  },
  {
    key: "yoga",
    label: "yoga",
    category: "body",
    path: I(
      <circle cx="12" cy="5.5" r="2" />,
      <path d="M12 8.5v5" />,
      <path d="M5 18c2-2 4-3 7-3s5 1 7 3" />,
      <path d="M5 18l3-1M19 18l-3-1" />,
    ),
  },
  {
    key: "stretch",
    label: "stretch",
    category: "body",
    path: I(
      <circle cx="12" cy="4.5" r="1.8" />,
      <path d="M12 7v6M7 11l10 0M9 13l-2 7M15 13l2 7" />,
    ),
  },
  {
    key: "cold",
    label: "cold",
    category: "body",
    path: I(
      <path d="M12 2v20M5 6l14 12M19 6L5 18M2 12h20" />,
      <path d="M9 4l3 2 3-2M9 20l3-2 3 2M4 9l2 3-2 3M20 9l-2 3 2 3" />,
    ),
  },

  // ───── mind ─────
  {
    key: "read",
    label: "read",
    category: "mind",
    path: I(
      <path d="M3 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H3z" />,
      <path d="M21 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" />,
    ),
  },
  {
    key: "write",
    label: "write",
    category: "mind",
    path: I(
      <path d="M16 3l5 5-12 12H4v-5z" />,
      <path d="M14 5l5 5" />,
    ),
  },
  {
    key: "study",
    label: "study",
    category: "mind",
    path: I(
      <path d="M2 9l10-5 10 5-10 5z" />,
      <path d="M6 11v5c0 1 3 3 6 3s6-2 6-3v-5" />,
      <path d="M22 9v5" />,
    ),
  },
  {
    key: "meditate",
    label: "meditate",
    category: "mind",
    path: I(
      <circle cx="12" cy="6" r="2.2" />,
      <path d="M12 8.5v3" />,
      <path d="M3 19c1-3 5-5 9-5s8 2 9 5" />,
      <path d="M7 18l-2 2M17 18l2 2" />,
    ),
  },
  {
    key: "music",
    label: "music",
    category: "mind",
    path: I(
      <path d="M9 18V5l12-2v13" />,
      <circle cx="6" cy="18" r="3" />,
      <circle cx="18" cy="16" r="3" />,
    ),
  },
  {
    key: "draw",
    label: "draw",
    category: "mind",
    path: I(
      <path d="M12 2a10 10 0 1 0 0 20c1.5 0 2-1 2-2v-2c0-1 1-2 2-2h3c1 0 2-1 2-2 0-6-5-10-9-10z" />,
      <circle cx="7" cy="11" r="1" />,
      <circle cx="9.5" cy="7" r="1" />,
      <circle cx="14" cy="6.5" r="1" />,
      <circle cx="17.5" cy="9.5" r="1" />,
    ),
  },
  {
    key: "code",
    label: "code",
    category: "mind",
    path: I(
      <path d="M8 6l-6 6 6 6M16 6l6 6-6 6M14 4l-4 16" />,
    ),
  },
  {
    key: "learn",
    label: "learn",
    category: "mind",
    path: I(
      <path d="M9 20h6M10 17h4" />,
      <path d="M12 3a6 6 0 0 0-4 10.5c1 .9 1.5 1.7 1.5 3v.5h5V16.5c0-1.3.5-2.1 1.5-3A6 6 0 0 0 12 3z" />,
    ),
  },

  // ───── fuel ─────
  {
    key: "water",
    label: "water",
    category: "fuel",
    path: I(
      <path d="M12 3s7 8 7 13a7 7 0 0 1-14 0c0-5 7-13 7-13z" />,
      <path d="M9 16c0 1.5 1 2.5 2.5 2.5" />,
    ),
  },
  {
    key: "food",
    label: "eat",
    category: "fuel",
    path: I(
      <circle cx="12" cy="12" r="9" />,
      <circle cx="12" cy="12" r="4" />,
      <path d="M3 12h2M19 12h2M12 3v2M12 19v2" />,
    ),
  },
  {
    key: "coffee",
    label: "coffee",
    category: "fuel",
    path: I(
      <path d="M4 9h13v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z" />,
      <path d="M17 11h2a2 2 0 0 1 0 4h-2" />,
      <path d="M8 5c0 1 1 1 1 2s-1 1-1 2M12 5c0 1 1 1 1 2s-1 1-1 2" />,
    ),
  },
  {
    key: "cook",
    label: "cook",
    category: "fuel",
    path: I(
      <path d="M5 14a4 4 0 1 1 0-8 4 4 0 0 1 8-2 4 4 0 0 1 6 4 4 4 0 0 1 0 6z" />,
      <path d="M5 14h14v3a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z" />,
      <path d="M9 14v5M15 14v5" />,
    ),
  },
  {
    key: "fast",
    label: "fast",
    category: "fuel",
    path: I(
      <circle cx="12" cy="13" r="8" />,
      <path d="M12 9v4l2.5 1.5" />,
      <path d="M9 3h6" />,
    ),
  },
  {
    key: "no-vice",
    label: "abstain",
    category: "fuel",
    path: I(
      <circle cx="12" cy="12" r="9" />,
      <path d="M5.5 5.5l13 13" />,
    ),
  },

  // ───── soul ─────
  {
    key: "sleep",
    label: "sleep",
    category: "soul",
    path: I(
      <path d="M21 12.5A9 9 0 1 1 11.5 3 7 7 0 0 0 21 12.5z" />,
    ),
  },
  {
    key: "sunrise",
    label: "sunrise",
    category: "soul",
    path: I(
      <path d="M5 18h14" />,
      <path d="M8 14a4 4 0 1 1 8 0" />,
      <path d="M12 4v3M5 8l1.5 1.5M19 8l-1.5 1.5M2 14h2M20 14h2" />,
      <path d="M9 21h6" />,
    ),
  },
  {
    key: "journal",
    label: "journal",
    category: "soul",
    path: I(
      <path d="M5 4h12a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H5z" />,
      <path d="M9 9h7M9 13h5M5 4v16" />,
    ),
  },
  {
    key: "focus",
    label: "focus",
    category: "soul",
    path: I(
      <circle cx="12" cy="12" r="9" />,
      <circle cx="12" cy="12" r="5" />,
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />,
    ),
  },
  {
    key: "breathe",
    label: "breathe",
    category: "soul",
    path: I(
      <path d="M3 9h11a3 3 0 1 0-3-3" />,
      <path d="M3 13h15a3 3 0 1 1-3 3" />,
      <path d="M3 17h8a2 2 0 1 1-2 2" />,
    ),
  },
  {
    key: "gratitude",
    label: "gratitude",
    category: "soul",
    path: I(
      <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" />,
    ),
  },
];

const REGISTRY = new Map(ENTRIES.map((e) => [e.key, e]));

export type IconPickerCategory = {
  id: HabitIconCategory;
  label: string;
  hint: string;
  entries: Entry[];
};

export const ICON_CATEGORIES: IconPickerCategory[] = [
  {
    id: "body",
    label: "body",
    hint: "training, motion, recovery",
    entries: ENTRIES.filter((e) => e.category === "body"),
  },
  {
    id: "mind",
    label: "mind",
    hint: "study, craft, reading",
    entries: ENTRIES.filter((e) => e.category === "mind"),
  },
  {
    id: "fuel",
    label: "fuel",
    hint: "food, drink, what you put in",
    entries: ENTRIES.filter((e) => e.category === "fuel"),
  },
  {
    id: "soul",
    label: "soul",
    hint: "rest, ritual, gratitude",
    entries: ENTRIES.filter((e) => e.category === "soul"),
  },
];

const TINT_BY_CATEGORY: Record<HabitIconCategory, string> = {
  body: "var(--color-hc-tint-body)",
  mind: "var(--color-hc-tint-mind)",
  fuel: "var(--color-hc-tint-fuel)",
  soul: "var(--color-hc-tint-soul)",
};

export function isHabitIconKey(value: string | null | undefined): value is string {
  if (!value) return false;
  return REGISTRY.has(value);
}

export function getHabitIconCategory(value: string | null | undefined) {
  if (!value) return null;
  return REGISTRY.get(value)?.category ?? null;
}

type HabitIconProps = {
  /** Stored habit icon — can be a registry key, a legacy emoji, or null. */
  value: string | null | undefined;
  /** Outer chip diameter in px. The glyph scales to ~55%. */
  size?: number;
  /** Override the auto-tint with a CSS color. */
  tint?: string;
  /** Render without the rounded chip background. Useful inline. */
  bare?: boolean;
  className?: string;
  /** Strength of the chip background — `strong` is the active picker state. */
  emphasis?: "soft" | "strong";
};

/**
 * Single source of truth for "render a habit's icon". Three branches:
 *
 *  - Registry key → curated SVG, tinted by category.
 *  - Legacy emoji string → render as text inside a neutral chip.
 *  - Empty → render the default `spark` glyph so cards never look empty.
 *
 * `bare` skips the chip wrapper for inline placements (e.g. small list rows).
 */
export function HabitIcon({
  value,
  size = 36,
  tint,
  bare = false,
  className = "",
  emphasis = "soft",
}: HabitIconProps) {
  const entry = value ? REGISTRY.get(value) : null;
  const isLegacyEmoji = !entry && value !== null && value !== undefined && value.length > 0;

  const glyphSize = Math.round(size * 0.56);
  const chipStyle: CSSProperties = {
    width: size,
    height: size,
    background:
      tint ??
      (entry
        ? TINT_BY_CATEGORY[entry.category]
        : "var(--color-hc-tint-default)"),
  };

  if (entry) {
    if (bare) return renderSvg(entry.path, glyphSize, className);
    return (
      <span
        className={`inline-grid shrink-0 place-items-center rounded-full text-hc-ink ${
          emphasis === "strong" ? "ring-1 ring-hc-ink/15" : ""
        } ${className}`}
        style={chipStyle}
        aria-hidden
      >
        {renderSvg(entry.path, glyphSize)}
      </span>
    );
  }

  if (isLegacyEmoji) {
    return (
      <span
        className={`inline-grid shrink-0 place-items-center rounded-full ${className}`}
        style={chipStyle}
        aria-hidden
      >
        <span style={{ fontSize: Math.round(size * 0.5), lineHeight: 1 }}>
          {value}
        </span>
      </span>
    );
  }

  // Default sparkle — used when the user hasn't picked one. Neutral tint.
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full text-hc-ink/55 ${className}`}
      style={chipStyle}
      aria-hidden
    >
      {renderSvg(
        <path d="M12 3v6M12 15v6M3 12h6M15 12h6M5.5 5.5l4 4M14.5 14.5l4 4M18.5 5.5l-4 4M9.5 14.5l-4 4" />,
        glyphSize,
      )}
    </span>
  );
}

function renderSvg(path: IconPath, size: number, className?: string) {
  const props: SVGProps<SVGSVGElement> = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };
  return (
    <svg {...props} aria-hidden className={className}>
      {path}
    </svg>
  );
}

export type HabitIconEntry = Entry;
