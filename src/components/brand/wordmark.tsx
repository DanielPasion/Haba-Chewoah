type WordmarkProps = {
  size?: number;
  ink?: string;
  brand?: string;
  className?: string;
};

export function Wordmark({
  size = 1,
  ink = "#1B1726",
  brand = "#D8FF3C",
  className,
}: WordmarkProps) {
  const w = 520 * size;
  const h = 80 * size;
  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 520 80"
      className={className}
      style={{ display: "block" }}
      aria-label="Haba-Chewoah"
    >
      <text
        x="0"
        y="58"
        style={{
          fontFamily:
            '"Bricolage Grotesque", system-ui, sans-serif',
          fontSize: 60,
          fontWeight: 800,
          letterSpacing: -2,
          fill: ink,
        }}
      >
        haba
      </text>
      <rect x="138" y="38" width="20" height="8" fill={brand} rx="2" />
      <text
        x="166"
        y="58"
        style={{
          fontFamily:
            '"Bricolage Grotesque", system-ui, sans-serif',
          fontSize: 60,
          fontWeight: 800,
          letterSpacing: -2,
          fill: ink,
        }}
      >
        chewoah
      </text>
    </svg>
  );
}
