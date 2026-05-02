// lockups.jsx — All required logo lockups for each concept
// Versions: Horizontal, Stacked, App Icon, Favicon, Monogram, Wordmark, Animated

// ─────────────────────────────────────────────────────────────
// Universal artboard frame — gives every lockup a consistent surround
// ─────────────────────────────────────────────────────────────

function LockupFrame({ bg, ink, label, children, height = 240 }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: bg, color: ink,
      display: 'flex', flexDirection: 'column',
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      position: 'relative',
    }}>
      <div style={{
        padding: '14px 20px',
        fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.6,
        fontWeight: 600, opacity: 0.55, fontFamily: 'ui-monospace, monospace',
      }}>{label}</div>
      <div style={{ flex: 1, display: 'grid', placeItems: 'center', padding: 16 }}>
        {children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Horizontal Lockup — mascot on the left, wordmark on the right
// ─────────────────────────────────────────────────────────────

function HorizontalLockup({ concept, scheme }) {
  const c = scheme.light;
  return (
    <LockupFrame bg={c.bg} ink={c.ink} label="Horizontal">
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, padding: '0 12px' }}>
        <concept.Mascot size={76} brand={c.brand} ink={c.ink} accent={c.accent} />
        <concept.Wordmark size={0.42} ink={c.ink} brand={c.brand} accent={c.accent} />
      </div>
    </LockupFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Stacked Lockup — mascot on top, wordmark below
// ─────────────────────────────────────────────────────────────

function StackedLockup({ concept, scheme }) {
  const c = scheme.light;
  return (
    <LockupFrame bg={c.bg} ink={c.ink} label="Stacked / Vertical">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <concept.Mascot size={96} brand={c.brand} ink={c.ink} accent={c.accent} />
        <concept.Wordmark size={0.42} ink={c.ink} brand={c.brand} accent={c.accent} />
      </div>
    </LockupFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// App Icon — 1024×1024-ratio rounded square, mascot full-bleed
// ─────────────────────────────────────────────────────────────

function AppIconLockup({ concept, scheme }) {
  const c = scheme.light;
  return (
    <LockupFrame bg={c.bg} ink={c.ink} label="App Icon · 1024×1024">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 168, height: 168,
          background: c.brand,
          borderRadius: 38,
          display: 'grid', placeItems: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          overflow: 'hidden',
        }}>
          <concept.Mascot size={140} brand={c.brand} ink={c.ink} accent={c.accent} />
        </div>
        {/* mock home-screen glance */}
        <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
          {[44, 32, 24].map((s, i) => (
            <div key={i} style={{
              width: s, height: s, borderRadius: s * 0.22,
              background: c.brand, display: 'grid', placeItems: 'center',
              boxShadow: '0 2px 6px rgba(0,0,0,0.12)',
              overflow: 'hidden',
            }}>
              <concept.Mascot size={s * 0.85} brand={c.brand} ink={c.ink} accent={c.accent} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 10, fontFamily: 'ui-monospace, monospace', opacity: 0.55, letterSpacing: 1, marginTop: 4 }}>
          @3X · @2X · @1X
        </div>
      </div>
    </LockupFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Favicon — 16×16 / 32×32 simplified mark
// ─────────────────────────────────────────────────────────────

function FaviconLockup({ concept, scheme }) {
  const c = scheme.light;
  const sizes = [16, 24, 32, 48, 64, 96];
  return (
    <LockupFrame bg={c.bg} ink={c.ink} label="Favicon Sizes">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14 }}>
          {sizes.map((s) => (
            <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: s, height: s, borderRadius: Math.max(2, s * 0.2),
                background: c.brand, display: 'grid', placeItems: 'center',
                overflow: 'hidden',
                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              }}>
                <concept.Mascot size={s * 0.92} brand={c.brand} ink={c.ink} accent={c.accent} />
              </div>
              <div style={{ fontSize: 9, fontFamily: 'ui-monospace, monospace', opacity: 0.6 }}>{s}px</div>
            </div>
          ))}
        </div>
        {/* browser-tab mock */}
        <div style={{
          marginTop: 8, padding: '6px 10px 6px 8px', background: c.surface,
          borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 8,
          border: `1px solid ${c.muted}33`, borderBottom: 'none',
          fontSize: 12, color: c.muted,
        }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: c.brand, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            <concept.Mascot size={13} brand={c.brand} ink={c.ink} accent={c.accent} />
          </div>
          <span>haba-chewoah.app</span>
          <span style={{ opacity: 0.4 }}>×</span>
        </div>
      </div>
    </LockupFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Monogram — single-letter mark "h" (or concept-specific)
// ─────────────────────────────────────────────────────────────

function MonogramLockup({ concept, scheme }) {
  const c = scheme.light;
  return (
    <LockupFrame bg={c.bg} ink={c.ink} label="Monogram">
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{
          width: 140, height: 140, borderRadius: 32,
          background: c.brand, color: c.brandInk,
          display: 'grid', placeItems: 'center',
          fontFamily: '"Bricolage Grotesque", "Archivo Black", sans-serif',
          fontSize: 96, fontWeight: 900, letterSpacing: -4,
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
        }}>h</div>
        <div style={{
          width: 140, height: 140, borderRadius: 32,
          background: c.ink, color: c.brand,
          display: 'grid', placeItems: 'center',
          fontFamily: '"Bricolage Grotesque", "Archivo Black", sans-serif',
          fontSize: 96, fontWeight: 900, letterSpacing: -4,
        }}>h</div>
        <div style={{
          width: 140, height: 140, borderRadius: 32,
          background: 'transparent', color: c.ink,
          border: `4px solid ${c.ink}`,
          display: 'grid', placeItems: 'center',
          fontFamily: '"Bricolage Grotesque", "Archivo Black", sans-serif',
          fontSize: 96, fontWeight: 900, letterSpacing: -4,
        }}>h</div>
      </div>
    </LockupFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Wordmark only — no mascot, in three weights/treatments
// ─────────────────────────────────────────────────────────────

function WordmarkLockup({ concept, scheme }) {
  const c = scheme.light;
  return (
    <LockupFrame bg={c.bg} ink={c.ink} label="Wordmark · Standalone">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <concept.Wordmark size={0.62} ink={c.ink} brand={c.brand} accent={c.accent} />
        <div style={{ width: 80, height: 1, background: c.muted, opacity: 0.3 }} />
        <div style={{
          padding: '10px 20px', borderRadius: 999,
          background: c.brand, color: c.brandInk,
        }}>
          <concept.Wordmark size={0.36} ink={c.brandInk} brand={c.ink} accent={c.accent} />
        </div>
        <div style={{ width: 80, height: 1, background: c.muted, opacity: 0.3 }} />
        <concept.Wordmark size={0.28} ink={c.muted} brand={c.muted} accent={c.muted} />
      </div>
    </LockupFrame>
  );
}

// ─────────────────────────────────────────────────────────────
// Animated / loading version — mascot blinks/winks on a loop
// ─────────────────────────────────────────────────────────────

function AnimatedLockup({ concept, scheme }) {
  const c = scheme.light;
  const [pulse, setPulse] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setPulse((p) => (p + 1) % 4), 600);
    return () => clearInterval(t);
  }, []);
  return (
    <LockupFrame bg={c.bg} ink={c.ink} label="Loading / Animated">
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
        <div style={{
          width: 140, height: 140, borderRadius: 32,
          display: 'grid', placeItems: 'center',
          background: c.surface,
          transform: `scale(${1 + (pulse === 0 ? 0.06 : 0)})`,
          transition: 'transform 0.3s cubic-bezier(.2,.8,.3,1.2)',
          boxShadow: pulse === 0 ? `0 0 0 6px ${c.brand}55` : `0 0 0 0 ${c.brand}00`,
        }}>
          <concept.Mascot size={120} brand={c.brand} ink={c.ink} accent={c.accent} />
        </div>
        {/* dot loader */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} style={{
              width: 12, height: 12, borderRadius: 6,
              background: i === pulse ? c.brand : c.muted,
              opacity: i === pulse ? 1 : 0.3,
              transition: 'all 0.2s',
              transform: i === pulse ? 'scale(1.3)' : 'scale(1)',
            }} />
          ))}
        </div>
        <div style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', letterSpacing: 1.5, opacity: 0.65, textTransform: 'uppercase' }}>
          logging your bet{'.'.repeat(pulse + 1)}
        </div>
      </div>
    </LockupFrame>
  );
}

Object.assign(window, {
  HorizontalLockup, StackedLockup, AppIconLockup,
  FaviconLockup, MonogramLockup, WordmarkLockup, AnimatedLockup,
});
