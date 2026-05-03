import { StickerCard } from "~/components/brand/sticker-card";

export default function Loading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-hc-bg px-6">
      <div className="flex flex-col items-center gap-7 text-center">
        <StickerCard size={160} mascotSize={120} rotate={-2} shadowOffset={4} />

        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-2.5">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className="h-2 w-2 rounded-full bg-hc-ink"
                style={{
                  animation: `hc-dot-pulse 1.2s ease-in-out ${i * 0.15}s infinite`,
                }}
              />
            ))}
          </div>
          <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-hc-muted">
            Haba-Haba
          </div>
        </div>
      </div>

      <style>{`@keyframes hc-dot-pulse { 0%, 80%, 100% { transform: scale(0.5); opacity: 0.3 } 40% { transform: scale(1.3); opacity: 1 } }`}</style>
    </main>
  );
}
