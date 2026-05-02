import { BRAND } from "./colors";

type Mood = "default" | "wink" | "sweat" | "smug" | "dead" | "celebrate";

type TwoFaceMascotProps = {
  size?: number;
  mood?: Mood;
  bg?: string;
  brand?: string;
  ink?: string;
  accent?: string;
  className?: string;
};

export function TwoFaceMascot({
  size = 200,
  mood = "default",
  bg,
  brand = BRAND.brand,
  ink = BRAND.inkLegacy,
  accent = BRAND.mascotTongue,
  className,
}: TwoFaceMascotProps) {
  const left = brand;
  const right = BRAND.white;
  const headFill = bg ?? ink;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={className}
      style={{ display: "block" }}
      aria-hidden
    >
      <rect x="20" y="24" width="160" height="160" rx="38" fill={headFill} />
      <path
        d="M 40 56 H 100 V 168 H 56 a 16 16 0 0 1 -16 -16 Z"
        fill={left}
      />
      <path
        d="M 100 56 H 160 V 152 a 16 16 0 0 1 -16 16 H 100 Z"
        fill={right}
      />
      <line x1="100" y1="56" x2="100" y2="168" stroke={ink} strokeWidth="3" />

      {mood === "wink" || mood === "celebrate" ? (
        <path
          d="M 58 100 Q 68 92 80 100"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      ) : mood === "dead" ? (
        <path
          d="M 60 94 L 76 106 M 76 94 L 60 106"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : (
        <>
          <circle cx="68" cy="100" r="9" fill={ink} />
          <circle cx="71" cy="97" r="2.5" fill={left} />
        </>
      )}
      <path
        d="M 58 82 L 80 82"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {mood === "celebrate" ? (
        <path
          d="M 56 132 Q 70 148 84 134"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      ) : mood === "sweat" ? (
        <path
          d="M 60 140 Q 70 134 80 140"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M 60 138 Q 76 138 84 138"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      )}

      {mood === "dead" ? (
        <path
          d="M 122 96 L 154 108 M 154 96 L 122 108"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : (
        <>
          <ellipse
            cx="138"
            cy="102"
            rx="11"
            ry={mood === "smug" ? 5 : 8}
            fill={ink}
          />
          <circle
            cx={mood === "smug" ? 142 : 144}
            cy="100"
            r="3"
            fill={right}
          />
        </>
      )}
      <path
        d="M 122 78 Q 138 70 156 84"
        stroke={ink}
        strokeWidth="4"
        strokeLinecap="round"
        fill="none"
      />
      {mood === "celebrate" ? (
        <path
          d="M 116 132 Q 136 152 158 130"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <path
          d="M 118 138 Q 136 148 156 134"
          stroke={ink}
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      )}
      <circle cx="148" cy="142" r="3" fill={accent} />

      {mood === "sweat" && (
        <path
          d="M 38 60 Q 32 70 38 76 Q 44 70 38 60 Z"
          fill="#7CC2FF"
          stroke={ink}
          strokeWidth="2"
        />
      )}
    </svg>
  );
}
