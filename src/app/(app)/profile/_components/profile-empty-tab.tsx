import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

type Kind = "habits" | "logs";

/**
 * Shared empty-state for the habits + logs tabs. Profile is the only piece of
 * the app implemented right now — these tabs intentionally don't render real
 * content. The dashed card is a placeholder shape that mirrors the future grid.
 */
export function ProfileEmptyTab({
  kind,
  hint,
  isOwn,
}: {
  kind: Kind;
  hint: string;
  isOwn: boolean;
}) {
  return (
    <div className="px-1 py-6 md:px-0 md:py-8">
      <div className="flex flex-col items-center justify-center gap-4 rounded-hc-3 border-[1.5px] border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-12 text-center">
        <TwoFaceMascot size={72} mood="default" bg="#1B1726" />
        <div className="flex flex-col items-center gap-1">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-hc-muted">
            {kind} · coming soon
          </p>
          <p className="max-w-xs text-sm text-hc-ink">
            {isOwn
              ? hint
              : `nothing here to show yet — ${kind} will appear once they're public.`}
          </p>
        </div>
      </div>
    </div>
  );
}
