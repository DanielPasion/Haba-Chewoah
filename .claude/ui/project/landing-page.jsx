// landing-page.jsx — Haba-Chewoah landing page
// Two layouts: mobile (PWA install) + desktop (go to login)

const { useState, useEffect } = React;

// ─── Rotating titles ──────────────────────────────────
// Each entry is a full headline. Click the refresh-toggle to cycle through.
// The original setup is index 0; subsequent ones all play on "I betcha won't".
// Format: parts of the headline as JSX-friendly tokens.
//   { kind: 'plain', text }     normal ink, weight 500 muted, weight 800 ink
//   { kind: 'muted', text }     softer color
//   { kind: 'highlight', text } lime sticker highlight
//   { kind: 'pink', text }      hot-pink underline (the "I betcha won't" beat)
//   { kind: 'br' }              line break
const ROTATING_TITLES = [
  // 0 — the original
  [
    { kind: "ink", text: "share & track your" },
    { kind: "br" },
    { kind: "ink", text: "habits" },
    { kind: "muted", text: " until they’re" },
    { kind: "br" },
    { kind: "highlight", text: "habitual" },
    { kind: "ink", text: "." },
  ],
  // 1 — the user-requested one
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
// Keep old name exported for safety; not used.
const ROTATING_SENTENCES = ROTATING_TITLES;

function useDeviceDetect() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 720px)").matches
      : false,
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 720px)");
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return isMobile;
}

// ─────────────────────────────────────────────────────────────
// Rotating headline — clicking the toggle button shuffles to the next dare
// ─────────────────────────────────────────────────────────────
// Render a single token from a ROTATING_TITLES entry
function TitleToken({ token }) {
  if (token.kind === "br") return <br />;
  if (token.kind === "muted")
    return (
      <span style={{ color: HC.muted, fontWeight: 500 }}>{token.text}</span>
    );
  if (token.kind === "highlight")
    return (
      <span
        style={{
          background: HC.brand,
          color: HC.brandInk,
          padding: "0 0.18em",
          borderRadius: 6,
          display: "inline-block",
          transform: "rotate(-1.5deg)",
          marginTop: 6,
        }}
      >
        {token.text}
      </span>
    );
  if (token.kind === "pink")
    return (
      <span
        style={{
          position: "relative",
          display: "inline-block",
          color: HC.ink,
          whiteSpace: "nowrap",
        }}
      >
        <span style={{ position: "relative", zIndex: 1 }}>{token.text}</span>
        <span
          style={{
            position: "absolute",
            left: "-0.04em",
            right: "-0.04em",
            bottom: "0.08em",
            height: "32%",
            background: HC.accent,
            opacity: 0.9,
            zIndex: 0,
            borderRadius: 3,
          }}
        />
      </span>
    );
  return <span style={{ color: HC.ink }}>{token.text}</span>;
}

function Headline({ idx, onShuffle, big }) {
  const tokens = ROTATING_TITLES[idx];
  const fontSize = big
    ? "clamp(54px, 7.6vw, 104px)"
    : "clamp(38px, 10vw, 64px)";
  const btnSize = big ? 60 : 48;
  return (
    <div
      style={{ position: "relative", display: "flex", flexDirection: "column" }}
    >
      <h1
        key={idx}
        style={{
          margin: 0,
          position: "relative",
          fontFamily: HC.display,
          fontSize,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          lineHeight: 1.0,
          color: HC.ink,
          textWrap: "balance",
          animation: "hcTitleFade 0.32s ease-out",
          paddingRight: big ? 80 : 60,
        }}
      >
        {tokens.map((t, i) => (
          <TitleToken key={i} token={t} />
        ))}
      </h1>

      {/* refresh toggle — floats top-right of the title block */}
      <button
        onClick={onShuffle}
        aria-label="next title"
        title="shuffle the title"
        style={{
          position: "absolute",
          top: big ? 4 : 0,
          right: big ? 0 : 0,
          border: `2px solid ${HC.ink}`,
          background: HC.accent,
          color: HC.accentInk,
          width: btnSize,
          height: btnSize,
          borderRadius: btnSize / 2,
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
          boxShadow: `3px 3px 0 ${HC.ink}`,
          transform: "rotate(8deg)",
          transition: "transform 0.15s, box-shadow 0.15s",
          zIndex: 3,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "rotate(20deg) scale(1.08)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "rotate(8deg)";
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "rotate(8deg) translate(2px, 2px)";
          e.currentTarget.style.boxShadow = `1px 1px 0 ${HC.ink}`;
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "rotate(20deg) scale(1.08)";
          e.currentTarget.style.boxShadow = `3px 3px 0 ${HC.ink}`;
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
        >
          <path d="M21 2v6h-6M3 12a9 9 0 0 1 15-6.7L21 8M3 22v-6h6M21 12a9 9 0 0 1-15 6.7L3 16" />
        </svg>
      </button>
      <style>{`@keyframes hcTitleFade{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CTAs — different on mobile vs desktop
// ─────────────────────────────────────────────────────────────
function MobileCTAs() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        width: "100%",
        maxWidth: 360,
      }}
    >
      <button
        style={{
          background: HC.ink,
          color: HC.brand,
          border: "none",
          padding: "18px 22px",
          fontFamily: HC.body,
          fontWeight: 700,
          fontSize: 16,
          borderRadius: HC.r2,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          textAlign: "left",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          install the app
        </span>
        <span
          style={{
            fontFamily: HC.mono,
            fontSize: 11,
            opacity: 0.55,
            fontWeight: 600,
          }}
        >
          ~2mb
        </span>
      </button>
      <button
        style={{
          background: "transparent",
          color: HC.ink,
          border: `1.5px solid ${HC.ink}`,
          padding: "14px 20px",
          fontFamily: HC.body,
          fontWeight: 600,
          fontSize: 14,
          borderRadius: HC.r2,
          cursor: "pointer",
        }}
      >
        i already have it · log in
      </button>
    </div>
  );
}

function DesktopCTAs() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <button
        style={{
          background: HC.ink,
          color: HC.brand,
          border: "none",
          padding: "18px 28px",
          fontFamily: HC.body,
          fontWeight: 700,
          fontSize: 16,
          borderRadius: HC.r2,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        log in
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontFamily: HC.mono,
          fontSize: 12,
          color: HC.muted,
          fontWeight: 500,
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke={HC.muted}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="5" y="2" width="14" height="20" rx="3" />
          <line x1="12" y1="18" x2="12" y2="18.01" />
        </svg>
        on your phone?{" "}
        <span
          style={{
            color: HC.ink,
            fontWeight: 700,
            textDecoration: "underline",
          }}
        >
          scan to install →
        </span>
      </div>
    </div>
  );
}

// QR placeholder (visual only)
function QRBlock() {
  // 13×13 dot pattern — fake but readable as a QR
  const cells = Array.from({ length: 169 }, (_, i) => {
    const x = i % 13,
      y = Math.floor(i / 13);
    const corner = (x < 3 && y < 3) || (x > 9 && y < 3) || (x < 3 && y > 9);
    if (corner)
      return (
        ((x === 0 || x === 2 || y === 0 || y === 2) &&
          !(x === 11 && y === 1)) ||
        (x >= 9 && x <= 11 && (y === 0 || y === 2)) ||
        ((x === 9 || x === 11) && y < 3)
      );
    // pseudo-noise
    return (x * 7 + y * 13 + (x ^ y) * 5) % 3 === 0;
  });
  return (
    <div
      style={{
        background: HC.surface,
        border: `1.5px solid ${HC.ink}`,
        borderRadius: HC.r3,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        boxShadow: `4px 4px 0 ${HC.ink}`,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(13, 1fr)",
          gap: 1,
          width: 130,
          height: 130,
          padding: 2,
          background: HC.surface,
        }}
      >
        {cells.map((on, i) => (
          <div
            key={i}
            style={{
              background: on ? HC.ink : "transparent",
              borderRadius: 0.5,
            }}
          />
        ))}
      </div>
      <div
        style={{
          fontFamily: HC.mono,
          fontSize: 9,
          color: HC.muted,
          letterSpacing: 1,
          fontWeight: 600,
          textTransform: "uppercase",
        }}
      >
        install · scan
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Mobile landing
// ─────────────────────────────────────────────────────────────
function MobileLanding() {
  const [idx, setIdx] = useState(0);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        background: HC.bg,
        fontFamily: HC.body,
        display: "flex",
        flexDirection: "column",
        padding: "20px 22px 32px",
        gap: 24,
      }}
    >
      {/* Top bar — logo */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <AppIcon size={36} radius={9} />
          <div
            style={{
              fontFamily: HC.display,
              fontSize: 18,
              fontWeight: 800,
              letterSpacing: -0.6,
              color: HC.ink,
            }}
          >
            haba<span style={{ color: HC.accent }}>-</span>chewoah
          </div>
        </div>
        <div
          style={{
            fontFamily: HC.mono,
            fontSize: 9,
            color: HC.muted,
            padding: "4px 8px",
            border: `1px solid ${HC.muted}55`,
            borderRadius: 99,
            letterSpacing: 1,
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          ·beta
        </div>
      </div>

      {/* Hero mascot */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 10 }}>
        <Mascot size={140} />
      </div>

      {/* Headline + rotating dare */}
      <Headline
        idx={idx}
        onShuffle={() => setIdx((i) => (i + 1) % ROTATING_SENTENCES.length)}
      />

      {/* CTAs */}
      <div
        style={{
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        <MobileCTAs />
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: 8,
          borderTop: `1px solid ${HC.ink}15`,
        }}
      >
        <span
          style={{
            fontFamily: HC.display,
            fontSize: 14,
            fontWeight: 700,
            color: HC.ink,
            letterSpacing: -0.3,
          }}
        >
          haba<span style={{ color: HC.accent }}>-</span>chewoah
        </span>
        <span
          style={{
            display: "flex",
            gap: 14,
            fontFamily: HC.mono,
            fontSize: 10,
            color: HC.muted,
            fontWeight: 500,
          }}
        >
          <span>privacy</span>
          <span>terms</span>
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Desktop landing
// ─────────────────────────────────────────────────────────────
function DesktopLanding() {
  const [idx, setIdx] = useState(0);
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        overflow: "auto",
        background: HC.bg,
        fontFamily: HC.body,
        color: HC.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "20px 48px",
          borderBottom: `1.5px solid ${HC.ink}11`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AppIcon size={40} radius={10} />
          <div
            style={{
              fontFamily: HC.display,
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: -0.7,
              color: HC.ink,
            }}
          >
            haba<span style={{ color: HC.accent }}>-</span>chewoah
          </div>
        </div>
        <button
          style={{
            background: HC.ink,
            color: HC.brand,
            border: "none",
            padding: "10px 20px",
            fontFamily: HC.body,
            fontWeight: 700,
            fontSize: 13,
            borderRadius: HC.r1,
            cursor: "pointer",
          }}
        >
          log in
        </button>
      </nav>

      {/* Hero */}
      <section
        style={{
          flex: 1,
          padding: "60px 48px 40px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 48,
          alignItems: "center",
          maxWidth: 1280,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <Headline
            big
            idx={idx}
            onShuffle={() => setIdx((i) => (i + 1) % ROTATING_SENTENCES.length)}
          />
          <DesktopCTAs />
        </div>

        {/* Right column — mascot + QR */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
            position: "relative",
          }}
        >
          <div
            style={{
              width: 320,
              height: 320,
              borderRadius: HC.r5,
              background: HC.brand,
              display: "grid",
              placeItems: "center",
              border: `2px solid ${HC.ink}`,
              boxShadow: `8px 8px 0 ${HC.ink}`,
              transform: "rotate(-2deg)",
              position: "relative",
            }}
          >
            <Mascot size={240} bg={HC.ink} />
            {/* sticker corner */}
            <div
              style={{
                position: "absolute",
                top: -16,
                right: -20,
                background: HC.accent,
                color: HC.accentInk,
                fontFamily: HC.mono,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "6px 12px",
                borderRadius: 99,
                border: `2px solid ${HC.ink}`,
                transform: "rotate(8deg)",
              }}
            >
              · public · or folder
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <QRBlock />
            <div
              style={{
                fontSize: 13,
                color: HC.muted,
                lineHeight: 1.45,
                maxWidth: 160,
              }}
            >
              <strong style={{ color: HC.ink }}>scan to install</strong>
              <br />
              installs as a PWA. no app store, no permissions theater.
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "20px 48px",
          borderTop: `1.5px solid ${HC.ink}11`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: HC.mono,
          fontSize: 11,
          color: HC.muted,
          fontWeight: 500,
        }}
      >
        <span
          style={{
            fontFamily: HC.display,
            fontSize: 14,
            fontWeight: 700,
            color: HC.ink,
            letterSpacing: -0.3,
          }}
        >
          haba<span style={{ color: HC.accent }}>-</span>chewoah
        </span>
        <span style={{ display: "flex", gap: 18 }}>
          <span>privacy</span>
          <span>terms</span>
        </span>
      </footer>
    </div>
  );
}

// Live preview — uses media query
function LiveLanding() {
  const isMobile = useDeviceDetect();
  return isMobile ? <MobileLanding /> : <DesktopLanding />;
}

Object.assign(window, {
  MobileLanding,
  DesktopLanding,
  LiveLanding,
  ROTATING_SENTENCES,
});
