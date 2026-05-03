type LogoTextProps = {
  size?: number;
  className?: string;
};

export function LogoText({ size = 22, className }: LogoTextProps) {
  return (
    <span
      className={`font-display font-extrabold tracking-hc-display-tight leading-none text-hc-ink ${className ?? ""}`}
      style={{ fontSize: size }}
    >
      haba<span className="text-hc-accent">-</span>chewoah
    </span>
  );
}
