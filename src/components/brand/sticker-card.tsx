import { type ReactNode } from "react";

import { TwoFaceMascot } from "./two-face-mascot";

type Mood = Parameters<typeof TwoFaceMascot>[0]["mood"];

type StickerCardProps = {
  size?: number | string;
  mascotSize?: number;
  mood?: Mood;
  rotate?: number;
  shadowOffset?: number;
  label?: string;
  labelTilt?: number;
  className?: string;
  children?: ReactNode;
};

export function StickerCard({
  size = 220,
  mascotSize,
  mood = "default",
  rotate = -2,
  shadowOffset = 6,
  label,
  labelTilt = 8,
  className,
  children,
}: StickerCardProps) {
  const innerMascotSize = mascotSize ?? (typeof size === "number" ? Math.round(size * 0.78) : 200);
  return (
    <div
      className={`relative grid place-items-center rounded-hc-5 bg-hc-brand ${className ?? ""}`}
      style={{
        width: size,
        height: typeof size === "number" ? size : undefined,
        aspectRatio: typeof size === "number" ? undefined : "1",
        border: "2px solid var(--color-hc-ink)",
        boxShadow: `${shadowOffset}px ${shadowOffset}px 0 var(--color-hc-ink)`,
        transform: `rotate(${rotate}deg)`,
      }}
    >
      {children ?? <TwoFaceMascot size={innerMascotSize} mood={mood} />}
      {label && (
        <span
          className="absolute font-mono text-hc-meta font-bold uppercase tracking-hc-eyebrow-narrow text-hc-accent-ink"
          style={{
            top: -14,
            right: -16,
            background: "var(--color-hc-accent)",
            padding: "5px 10px",
            borderRadius: 99,
            border: "2px solid var(--color-hc-ink)",
            transform: `rotate(${labelTilt}deg)`,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
