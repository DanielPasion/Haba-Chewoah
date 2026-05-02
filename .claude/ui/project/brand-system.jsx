// brand-system.jsx — Color schemes + shared building blocks for Haba-Chewoah

// ─────────────────────────────────────────────────────────────
// Color Schemes — 3 directions, each with light + dark
// ─────────────────────────────────────────────────────────────

const SCHEMES = {
  // Direction 1: "Dare Citrus" — high-energy, playful, Gen Z
  // Yellow-lime as hero (the cheeky "dare" energy), inky purple-black as ground
  citrus: {
    name: 'Dare Citrus',
    tagline: 'High-voltage. Cheeky. Loud.',
    light: {
      bg: '#FAF7EE',
      surface: '#FFFFFF',
      ink: '#1B1726',
      muted: '#6B6478',
      brand: '#D8FF3C',          // electric lime — the "I bet you won't" zap
      brandInk: '#1B1726',
      accent: '#FF4D8D',         // hot pink — social/dare
      accentInk: '#FFFFFF',
      ring: '#1B1726',
    },
    dark: {
      bg: '#0F0B1A',
      surface: '#1B1726',
      ink: '#F5F1E6',
      muted: '#9A93A8',
      brand: '#D8FF3C',
      brandInk: '#1B1726',
      accent: '#FF4D8D',
      accentInk: '#FFFFFF',
      ring: '#D8FF3C',
    },
  },
  // Direction 2: "Habit Clay" — warm, grounded, friendly but still cheeky
  // Terracotta + cream — feels like a journal you actually want to open
  clay: {
    name: 'Habit Clay',
    tagline: 'Warm. Earnest. Sticker-book.',
    light: {
      bg: '#F4ECDD',
      surface: '#FCF7EC',
      ink: '#2A1810',
      muted: '#7A6552',
      brand: '#E8552B',          // terracotta-orange
      brandInk: '#FCF7EC',
      accent: '#2D5F4F',         // deep teal-green — accountability anchor
      accentInk: '#F4ECDD',
      ring: '#2A1810',
    },
    dark: {
      bg: '#1A100A',
      surface: '#2A1810',
      ink: '#F4ECDD',
      muted: '#A89380',
      brand: '#FF6F3D',
      brandInk: '#1A100A',
      accent: '#5FAE94',
      accentInk: '#1A100A',
      ring: '#FF6F3D',
    },
  },
  // Direction 3: "Ultraviolet" — cool, electric, late-night-scrolling energy
  // Deep indigo + bright cyan-violet — the "BeReal at midnight" vibe
  ultraviolet: {
    name: 'Ultraviolet',
    tagline: 'Cool. Electric. After-dark.',
    light: {
      bg: '#F2F0FF',
      surface: '#FFFFFF',
      ink: '#160B36',
      muted: '#6F6890',
      brand: '#5B3FFF',          // ultraviolet
      brandInk: '#FFFFFF',
      accent: '#00E5C7',         // cyber mint
      accentInk: '#160B36',
      ring: '#160B36',
    },
    dark: {
      bg: '#0A0820',
      surface: '#160B36',
      ink: '#F2F0FF',
      muted: '#9890B8',
      brand: '#8A6FFF',
      brandInk: '#0A0820',
      accent: '#00E5C7',
      accentInk: '#0A0820',
      ring: '#8A6FFF',
    },
  },
};

// ─────────────────────────────────────────────────────────────
// Color Swatch — small block that shows hex on hover
// ─────────────────────────────────────────────────────────────

function Swatch({ color, label, ink, big }) {
  const size = big ? 64 : 40;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-start' }}>
      <div style={{
        width: size, height: size, background: color,
        borderRadius: 6,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.08)',
        flexShrink: 0,
      }} />
      <div style={{ fontSize: 9, lineHeight: 1.2, color: ink, fontFamily: 'ui-monospace, "SF Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.4 }}>
        <div style={{ fontWeight: 600 }}>{label}</div>
        <div style={{ opacity: 0.6 }}>{color}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Color scheme card — shows full palette + sample app moment
// ─────────────────────────────────────────────────────────────

function SchemeCard({ scheme, mode }) {
  const c = scheme[mode];
  const isLight = mode === 'light';
  return (
    <div style={{
      width: '100%', height: '100%',
      background: c.bg,
      color: c.ink,
      fontFamily: '"Space Grotesk", system-ui, sans-serif',
      padding: 32,
      display: 'flex', flexDirection: 'column', gap: 24,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.55, fontWeight: 600, marginBottom: 4 }}>
            {scheme.name} · {isLight ? 'Light' : 'Dark'}
          </div>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1.1 }}>
            {scheme.tagline}
          </div>
        </div>
        <div style={{
          fontSize: 10, fontFamily: 'ui-monospace, monospace',
          padding: '4px 8px', borderRadius: 4,
          background: c.surface, color: c.muted,
          border: `1px solid ${c.muted}33`,
        }}>{isLight ? '☀ LIGHT' : '☾ DARK'}</div>
      </div>

      {/* hero swatches */}
      <div style={{ display: 'flex', gap: 12 }}>
        <Swatch color={c.brand} label="brand" ink={c.ink} big />
        <Swatch color={c.accent} label="accent" ink={c.ink} big />
        <Swatch color={c.ink} label="ink" ink={c.ink} big />
        <Swatch color={c.bg} label="bg" ink={c.ink} big />
        <Swatch color={c.surface} label="surface" ink={c.ink} big />
        <Swatch color={c.muted} label="muted" ink={c.ink} big />
      </div>

      {/* sample app moment — feed card */}
      <div style={{
        background: c.surface,
        borderRadius: 14,
        padding: 18,
        boxShadow: isLight ? '0 1px 0 rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)' : '0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)',
        display: 'flex', flexDirection: 'column', gap: 14,
        marginTop: 'auto',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 16, background: c.brand, display: 'grid', placeItems: 'center', color: c.brandInk, fontWeight: 800, fontSize: 14 }}>M</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.ink }}>maya · day 47</div>
            <div style={{ fontSize: 11, color: c.muted }}>cold plunge · 12 min ago</div>
          </div>
          <div style={{
            fontSize: 10, fontWeight: 700, padding: '4px 8px', borderRadius: 99,
            background: c.brand, color: c.brandInk, letterSpacing: 0.3,
          }}>STREAK</div>
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.5, color: c.ink }}>
          "I bet I won't" → I did. <span style={{ color: c.muted }}>day 47, baby ❄️</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, border: 'none',
            background: c.accent, color: c.accentInk, fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            letterSpacing: 0.3, cursor: 'pointer',
          }}>I bet you won't</button>
          <button style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'transparent', color: c.ink,
            border: `1.5px solid ${c.ink}`,
            fontSize: 12, fontWeight: 700, fontFamily: 'inherit', letterSpacing: 0.3, cursor: 'pointer',
          }}>👀 watching</button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { SCHEMES, Swatch, SchemeCard });
