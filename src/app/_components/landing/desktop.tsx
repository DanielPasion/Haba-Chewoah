import Link from "next/link";

import { AppIcon } from "~/components/brand/app-icon";
import { LogoText } from "~/components/brand/logo-text";
import { StickerCard } from "~/components/brand/sticker-card";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";
import { ArrowRightIcon, PhoneIcon } from "~/components/icons";
import { buttonClass } from "~/components/ui";

import { Headline } from "./headline";
import { QRBlock } from "./qr-block";

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
        className="mx-auto grid w-full min-h-0 max-w-[1280px] flex-1 items-center gap-8 px-8 py-4 lg:gap-12 lg:px-12"
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
            <div className="flex items-center gap-2 font-mono text-[11px] font-medium text-hc-muted">
              <PhoneIcon size={18} />
              on your phone?{" "}
              <span className="font-bold text-hc-ink underline">
                scan to install →
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex min-h-0 flex-col items-center gap-4 lg:gap-5">
          <StickerCard
            size="clamp(180px, min(22vw, 38vh), 280px)"
            label="· public · or folder"
            shadowOffset={6}
            rotate={-2}
          >
            <TwoFaceMascot size={200} className="h-[80%] w-[80%]" />
          </StickerCard>
          <div className="flex items-center gap-3">
            <QRBlock size={96} />
            <div className="max-w-[150px] text-[12px] leading-snug text-hc-muted">
              <strong className="text-hc-ink">scan to install</strong>
              <br />
              installs as a PWA. no app store, no permissions theater.
            </div>
          </div>
        </div>
      </section>

      <footer
        className="flex items-center justify-between px-8 py-3 font-mono text-[11px] font-medium text-hc-muted lg:px-12"
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
