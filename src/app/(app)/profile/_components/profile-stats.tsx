type Stat = { label: string; value: number };

export function ProfileStats({
  stats,
  variant = "mobile",
}: {
  stats: Stat[];
  variant?: "mobile" | "desktop";
}) {
  const isDesktop = variant === "desktop";
  return (
    <div className={`flex flex-wrap ${isDesktop ? "gap-7" : "gap-5"}`}>
      {stats.map((s) => (
        <div key={s.label}>
          <div
            className={`font-display font-extrabold leading-none text-hc-ink ${
              isDesktop ? "text-2xl" : "text-lg"
            }`}
            style={{ letterSpacing: "-0.02em" }}
          >
            {s.value.toLocaleString()}
          </div>
          <div className="mt-1 font-mono text-hc-tiny font-semibold uppercase tracking-widest text-hc-muted">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
