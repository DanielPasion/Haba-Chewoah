"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppIcon } from "~/components/brand/app-icon";
import { LogoText } from "~/components/brand/logo-text";
import { TwoFaceMascot } from "~/components/brand/two-face-mascot";

type TitleToken =
  | { kind: "ink"; text: string }
  | { kind: "muted"; text: string }
  | { kind: "highlight"; text: string }
  | { kind: "pink"; text: string }
  | { kind: "br" };

const ROTATING_TITLES: TitleToken[][] = [
  [
    { kind: "ink", text: "share & track your" },
    { kind: "br" },
    { kind: "ink", text: "habits" },
    { kind: "muted", text: " until they’re" },
    { kind: "br" },
    { kind: "highlight", text: "habitual" },
    { kind: "ink", text: "." },
  ],
  [
    { kind: "ink", text: "cause " },
    { kind: "pink", text: "“i betcha won’t”" },
    { kind: "br" },
    { kind: "muted", text: "ever have to use" },
    { kind: "br" },
    { kind: "ink", text: "another habit tracker" },
    { kind: "muted", text: " again" },
    { kind: "ink", text: "." },
  ],
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

function Token({ token }: { token: TitleToken }) {
  if (token.kind === "br") return <br />;
  if (token.kind === "muted") {
    return (
      <span className="font-medium text-hc-muted">{token.text}</span>
    );
  }
  if (token.kind === "highlight") {
    return (
      <span
        className="mt-1.5 inline-block rounded-md bg-hc-brand text-hc-brand-ink"
        style={{ padding: "0 0.18em", transform: "rotate(-1.5deg)" }}
      >
        {token.text}
      </span>
    );
  }
  if (token.kind === "pink") {
    return (
      <span className="relative inline-block whitespace-nowrap text-hc-ink">
        <span className="relative z-10">{token.text}</span>
        <span
          aria-hidden
          className="absolute z-0 rounded-sm bg-hc-accent opacity-90"
          style={{
            left: "-0.04em",
            right: "-0.04em",
            bottom: "0.08em",
            height: "32%",
          }}
        />
      </span>
    );
  }
  return <span className="text-hc-ink">{token.text}</span>;
}

function Headline({
  idx,
  big,
  onShuffle,
}: {
  idx: number;
  big?: boolean;
  onShuffle: () => void;
}) {
  const tokens = ROTATING_TITLES[idx]!;
  const fontSize = big ? "clamp(54px, 7.6vw, 104px)" : "clamp(38px, 10vw, 64px)";
  const btnSize = big ? 60 : 48;

  return (
    <div className="relative flex flex-col">
      <h1
        key={idx}
        className="relative m-0 font-display font-extrabold leading-none text-hc-ink"
        style={{
          fontSize,
          letterSpacing: "-0.04em",
          textWrap: "balance",
          animation: "hc-title-fade 0.32s ease-out",
          paddingRight: big ? 80 : 60,
        }}
      >
        {tokens.map((t, i) => (
          <Token key={i} token={t} />
        ))}
      </h1>
      <button
        type="button"
        onClick={onShuffle}
        aria-label="next title"
        title="shuffle the title"
        className="absolute right-0 grid place-items-center cursor-pointer text-hc-accent-ink transition-transform"
        style={{
          top: big ? 4 : 0,
          width: btnSize,
          height: btnSize,
          borderRadius: btnSize / 2,
          background: "var(--color-hc-accent)",
          border: "2px solid var(--color-hc-ink)",
          boxShadow: "3px 3px 0 var(--color-hc-ink)",
          transform: "rotate(8deg)",
          zIndex: 3,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "rotate(20deg) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "rotate(8deg)";
        }}
      >
        <svg
          width={btnSize * 0.46}
          height={btnSize * 0.46}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
      </button>
    </div>
  );
}

function QRBlock() {
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
      className="flex flex-col items-center gap-2 rounded-hc-3 bg-hc-surface p-3.5"
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
          width: 130,
          height: 130,
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
        install · scan
      </div>
    </div>
  );
}

function MobileLanding({ idx, onShuffle, signedIn }: { idx: number; onShuffle: () => void; signedIn: boolean }) {
  return (
    <div className="flex h-full w-full flex-col gap-6 overflow-auto bg-hc-bg px-[22px] pt-5 pb-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AppIcon size={36} radius={9} />
          <LogoText size={18} />
        </div>
        <span className="rounded-full border border-hc-line-strong px-2 py-1 font-mono text-[9px] font-semibold uppercase tracking-[0.1em] text-hc-muted">
          ·beta
        </span>
      </header>

      <div className="mt-2 flex justify-center">
        <TwoFaceMascot size={140} />
      </div>

      <Headline idx={idx} onShuffle={onShuffle} />

      <div className="mt-auto flex w-full flex-col items-center gap-4">
        <div className="flex w-full max-w-[360px] flex-col gap-2.5">
          <button
            type="button"
            className="flex cursor-pointer items-center justify-between gap-2.5 rounded-hc-2 bg-hc-ink px-[22px] py-[18px] text-left font-sans text-base font-bold text-hc-brand"
          >
            <span className="flex items-center gap-3">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>
              install the app
            </span>
            <span className="font-mono text-[11px] font-semibold opacity-55">
              ~2mb
            </span>
          </button>
          <Link
            href={signedIn ? "/feed" : "/auth/signin"}
            className="rounded-hc-2 border-[1.5px] border-hc-ink px-5 py-3.5 text-center font-sans text-sm font-semibold text-hc-ink"
          >
            {signedIn ? "open the app" : "i already have it · log in"}
          </Link>
          <div className="mt-1.5 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.15em] text-hc-muted">
            works offline · no app store · no ads
          </div>
        </div>
      </div>

      <footer className="flex items-center justify-between border-t border-hc-line pt-2">
        <LogoText size={14} />
        <span className="flex gap-3.5 font-mono text-[10px] font-medium text-hc-muted">
          <span>privacy</span>
          <span>terms</span>
        </span>
      </footer>
    </div>
  );
}

function DesktopLanding({ idx, onShuffle, signedIn }: { idx: number; onShuffle: () => void; signedIn: boolean }) {
  return (
    <div className="flex h-full min-h-screen w-full flex-col bg-hc-bg text-hc-ink">
      <nav
        className="flex items-center justify-between px-12 py-5"
        style={{ borderBottom: "1.5px solid var(--color-hc-line)" }}
      >
        <div className="flex items-center gap-3">
          <AppIcon size={40} radius={10} />
          <LogoText size={22} />
        </div>
        <Link
          href={signedIn ? "/feed" : "/auth/signin"}
          className="cursor-pointer rounded-hc-1 bg-hc-ink px-5 py-2.5 font-sans text-[13px] font-bold text-hc-brand"
        >
          {signedIn ? "open the app" : "log in"}
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-[1280px] flex-1 items-center gap-12 px-12 py-[60px]" style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)" }}>
        <div className="flex flex-col gap-9">
          <Headline big idx={idx} onShuffle={onShuffle} />
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={signedIn ? "/feed" : "/auth/signin"}
              className="flex cursor-pointer items-center gap-3 rounded-hc-2 bg-hc-ink px-7 py-[18px] font-sans text-base font-bold text-hc-brand"
            >
              {signedIn ? "open the app" : "log in"}
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <div className="flex items-center gap-2.5 font-mono text-xs font-medium text-hc-muted">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <line x1="12" y1="18" x2="12" y2="18.01" />
              </svg>
              on your phone?{" "}
              <span className="font-bold text-hc-ink underline">
                scan to install →
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex flex-col items-center gap-7">
          <div
            className="relative grid place-items-center rounded-hc-5 bg-hc-brand"
            style={{
              width: 320,
              height: 320,
              border: "2px solid var(--color-hc-ink)",
              boxShadow: "8px 8px 0 var(--color-hc-ink)",
              transform: "rotate(-2deg)",
            }}
          >
            <TwoFaceMascot size={240} />
            <div
              className="absolute font-mono text-[11px] font-bold uppercase tracking-[0.08em] text-hc-accent-ink"
              style={{
                top: -16,
                right: -20,
                background: "var(--color-hc-accent)",
                padding: "6px 12px",
                borderRadius: 99,
                border: "2px solid var(--color-hc-ink)",
                transform: "rotate(8deg)",
              }}
            >
              · public · or folder
            </div>
          </div>
          <div className="flex items-center gap-3.5">
            <QRBlock />
            <div className="max-w-[160px] text-[13px] leading-relaxed text-hc-muted">
              <strong className="text-hc-ink">scan to install</strong>
              <br />
              installs as a PWA. no app store, no permissions theater.
            </div>
          </div>
        </div>
      </section>

      <footer
        className="flex items-center justify-between px-12 py-5 font-mono text-[11px] font-medium text-hc-muted"
        style={{ borderTop: "1.5px solid var(--color-hc-line)" }}
      >
        <LogoText size={14} />
        <span className="flex gap-[18px]">
          <span>privacy</span>
          <span>terms</span>
        </span>
      </footer>
    </div>
  );
}

export function Landing({ signedIn }: { signedIn: boolean }) {
  const [idx, setIdx] = useState(0);
  const isMobile = useIsMobile();
  const onShuffle = () => setIdx((i) => (i + 1) % ROTATING_TITLES.length);

  return (
    <main className="min-h-screen w-full bg-hc-bg">
      {isMobile ? (
        <MobileLanding idx={idx} onShuffle={onShuffle} signedIn={signedIn} />
      ) : (
        <DesktopLanding idx={idx} onShuffle={onShuffle} signedIn={signedIn} />
      )}
    </main>
  );
}
