import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

type Kind = "habits" | "logs";

export function ProfileEmptyTab({
  kind,
  hint,
  isOwn,
  cta,
}: {
  kind: Kind;
  hint: string;
  isOwn: boolean;
  cta?: React.ReactNode;
}) {
  return (
    <div className="px-1 py-6 md:px-0 md:py-8">
      <div className="flex flex-col items-center justify-center gap-4 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-12 text-center">
        <TwoFaceMascot size={72} mood="default" bg="#1B1726" />
        <div className="flex flex-col items-center gap-1">
          <p className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted">
            no {kind} yet
          </p>
          <p className="max-w-xs text-sm text-hc-ink">
            {isOwn
              ? hint
              : `nothing here to show — ${kind} will appear once they're public.`}
          </p>
        </div>
        {cta}
      </div>
    </div>
  );
}
