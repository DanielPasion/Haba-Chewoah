import { TwoFaceMascot } from "./two-face-mascot";

type AppIconProps = {
  size?: number;
  radius?: number;
  className?: string;
};

export function AppIcon({ size = 80, radius, className }: AppIconProps) {
  const r = radius ?? size * 0.225;
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: r,
        background: "var(--color-hc-brand)",
        display: "grid",
        placeItems: "center",
        boxShadow: "0 4px 14px rgba(0,0,0,0.18)",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <TwoFaceMascot size={size * 0.92} />
    </div>
  );
}
