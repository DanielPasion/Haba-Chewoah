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
    <div className="px-5 py-6 md:px-0 md:py-8">
      <div className="flex flex-col items-center justify-center gap-4 rounded-hc-3 border border-dashed border-hc-line-strong bg-hc-surface-alt px-6 py-14 text-center">
        <TwoFaceMascot size={56} mood="default" bg="#1B1726" />
        <div className="flex flex-col items-center gap-1.5">
          <p className="font-display text-base font-extrabold text-hc-ink">
            no {kind} yet
          </p>
          <p className="max-w-xs text-sm text-hc-muted">
            {isOwn
              ? hint
              : `nothing here yet — ${kind} appear once they're public.`}
          </p>
        </div>
        {cta}
      </div>
    </div>
  );
}
