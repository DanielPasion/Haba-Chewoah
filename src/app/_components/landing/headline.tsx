"use client";

import { useState } from "react";

import { RefreshIcon } from "~/components/icons";

import { type TitleToken, ROTATING_TITLES } from "./data";

function Token({ token }: { token: TitleToken }) {
  if (token.kind === "br") return <br />;
  if (token.kind === "muted") {
    return <span className="font-medium text-hc-muted">{token.text}</span>;
  }
  if (token.kind === "highlight") {
    return (
      <span
        className="mt-1 inline-block rounded-md bg-hc-brand text-hc-brand-ink"
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

export function Headline({ big }: { big?: boolean }) {
  const [idx, setIdx] = useState(0);
  const onShuffle = () => setIdx((i) => (i + 1) % ROTATING_TITLES.length);
  const tokens = ROTATING_TITLES[idx]!;

  const fontSize = big
    ? "clamp(40px, min(6vw, 9vh), 88px)"
    : "clamp(30px, min(8vw, 7vh), 54px)";
  const btnSize = big
    ? "clamp(40px, 5vw, 56px)"
    : "clamp(36px, 11vw, 44px)";

  return (
    <div className="relative flex flex-col">
      <h1
        key={idx}
        className="relative m-0 font-display font-extrabold leading-hc-display text-hc-ink"
        style={{
          fontSize,
          letterSpacing: "-0.04em",
          textWrap: "balance",
          animation: "hc-title-fade 0.32s ease-out",
          paddingRight: big
            ? "clamp(56px, 6vw, 76px)"
            : "clamp(44px, 12vw, 60px)",
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
        className="absolute top-0 right-0 grid cursor-pointer place-items-center text-hc-accent-ink transition-transform"
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: "50%",
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
        <RefreshIcon size="46%" />
      </button>
    </div>
  );
}
