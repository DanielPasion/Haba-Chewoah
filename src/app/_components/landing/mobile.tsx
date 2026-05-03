import Link from "next/link";

import { AppIcon } from "~/components/brand/app-icon";
import { LogoText } from "~/components/brand/logo-text";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { buttonClass } from "~/components/ui";

import { Headline } from "./headline";
import { InstallButton } from "./install-button";

export function MobileLanding({ signedIn }: { signedIn: boolean }) {
  return (
    <div
      className="flex h-full w-full flex-col bg-hc-bg px-5"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))",
      }}
    >
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AppIcon size={32} radius={8} />
          <LogoText size={17} />
        </div>
        <span className="rounded-full border border-hc-line-strong px-2 py-1 font-mono text-hc-tiny font-semibold uppercase tracking-widest text-hc-muted">
          ·beta
        </span>
      </header>

      <div
        className="flex justify-center"
        style={{ paddingTop: "min(3vh, 16px)" }}
      >
        <div style={{ width: "min(28vh, 120px)", height: "min(28vh, 120px)" }}>
          <TwoFaceMascot size={120} className="h-full w-full" />
        </div>
      </div>

      <div className="mt-3">
        <Headline />
      </div>

      <div className="flex flex-1 flex-col items-center justify-end gap-3">
        <div className="flex w-full max-w-90 flex-col gap-2">
          <InstallButton />
          <Link
            href={signedIn ? "/feed" : "/auth/signin"}
            className={buttonClass({
              variant: "secondary",
              size: "sm",
              fullWidth: true,
            })}
          >
            {signedIn ? "open the app" : "i already have it · log in"}
          </Link>
        </div>
      </div>

      <footer className="mt-3 flex items-center justify-between border-t border-hc-line pt-2">
        <LogoText size={13} />
        <span className="flex gap-3 font-mono text-hc-eyebrow font-medium text-hc-muted">
          <span>privacy</span>
          <span>terms</span>
        </span>
      </footer>
    </div>
  );
}
