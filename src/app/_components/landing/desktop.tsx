import Link from "next/link";

import { AppIcon } from "~/components/brand/app-icon";
import { LogoText } from "~/components/brand/logo-text";
import { StickerCard } from "~/components/brand/sticker-card";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { ArrowRightIcon } from "~/components/icons";
import { buttonClass } from "~/components/ui";

import { Headline } from "./headline";

export function DesktopLanding({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="flex h-full w-full flex-col bg-hc-bg text-hc-ink">
      <nav
        className="flex items-center justify-between px-8 py-3 lg:px-12 lg:py-4"
        style={{ borderBottom: "1.5px solid var(--color-hc-line)" }}
      >
        <div className="flex items-center gap-3">
          <AppIcon size={36} radius={9} />
          <LogoText size={20} />
        </div>
        <Link
          href={signedIn ? "/feed" : "/auth/signin"}
          className={buttonClass({ variant: "primary", size: "sm" })}
        >
          {signedIn ? "open the app" : "log in"}
        </Link>
      </nav>

      <section
        className="mx-auto grid w-full min-h-0 max-w-7xl flex-1 items-center gap-8 px-8 py-4 lg:gap-12 lg:px-12"
        style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)" }}
      >
        <div className="flex min-h-0 flex-col gap-5 lg:gap-7">
          <Headline big />
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={signedIn ? "/feed" : "/auth/signin"}
              className={buttonClass({ variant: "primary", size: "lg" })}
            >
              {signedIn ? "open the app" : "log in"}
              <ArrowRightIcon size={18} />
            </Link>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-col items-center gap-4 lg:gap-5">
          <StickerCard
            size="clamp(180px, min(22vw, 38vh), 280px)"
            label="· public · or folder"
            shadowOffset={6}
            rotate={-2}
          >
            <TwoFaceMascot size={200} className="h-4/5 w-4/5" />
          </StickerCard>
        </div>
      </section>

      <footer
        className="flex items-center justify-between px-8 py-3 font-mono text-hc-meta font-medium text-hc-muted lg:px-12"
        style={{ borderTop: "1.5px solid var(--color-hc-line)" }}
      >
        <LogoText size={13} />
        <span className="flex gap-4">
          <span>privacy</span>
          <span>terms</span>
        </span>
      </footer>
    </div>
  );
}
