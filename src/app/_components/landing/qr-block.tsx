type QRBlockProps = {
  size?: number;
  caption?: string;
};

export function QRBlock({ size = 110, caption = "install · scan" }: QRBlockProps) {
  const cells = Array.from({ length: 169 }, (_, i) => {
    const x = i % 13;
    const y = Math.floor(i / 13);
    const corner = (x < 3 && y < 3) || (x > 9 && y < 3) || (x < 3 && y > 9);
    if (corner) {
      return (
        (x === 0 || x === 2 || y === 0 || y === 2) && !(x === 11 && y === 1)
      );
    }
    return (x * 7 + y * 13 + (x ^ y) * 5) % 3 === 0;
  });
  return (
    <div
      className="flex flex-col items-center gap-1.5 rounded-hc-3 bg-hc-surface p-2.5"
      style={{
        border: "1.5px solid var(--color-hc-ink)",
        boxShadow: "var(--shadow-hc-stamp)",
      }}
    >
      <div
        className="grid bg-hc-surface p-0.5"
        style={{
          gridTemplateColumns: "repeat(13, 1fr)",
          gap: 1,
          width: size,
          height: size,
        }}
      >
        {cells.map((on, i) => (
          <div
            key={i}
            style={{ background: on ? "var(--color-hc-ink)" : "transparent" }}
          />
        ))}
      </div>
      <div className="font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-hc-muted">
        {caption}
      </div>
    </div>
  );
}
