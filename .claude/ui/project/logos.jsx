// logos.jsx — Haba-Chewoah logo system
// All marks are inline SVG so they're crisp at every size.
// Each concept exposes named pieces: Mascot, Wordmark, Horizontal, Stacked, Icon, Favicon, Monogram.

// ─────────────────────────────────────────────────────────────
// CONCEPT 1 — "Two-Face" — split-personality mascot
// One half is the disciplined doer (eyes-open, focused).
// The other half is the smug "I bet you won't" doubter (side-eye, smirk).
// Single chunky head, vertical seam down the middle.
// ─────────────────────────────────────────────────────────────

function TwoFaceMascot({ size = 200, brand = '#D8FF3C', ink = '#1B1726', accent = '#FF4D8D', mono = false }) {
  const left = mono ? ink : brand;
  const right = mono ? '#FFFFFF' : '#FFFFFF';
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      {/* head outer rounded square */}
      <rect x="20" y="24" width="160" height="160" rx="38" fill={ink} />
      {/* face inset — split */}
      <g>
        <path d="M 40 56 H 100 V 168 H 56 a 16 16 0 0 1 -16 -16 Z" fill={left} />
        <path d="M 100 56 H 160 V 152 a 16 16 0 0 1 -16 16 H 100 Z" fill={right} />
      </g>
      {/* seam */}
      <line x1="100" y1="56" x2="100" y2="168" stroke={ink} strokeWidth="3" />
      {/* LEFT FACE — disciplined: round open eye, neutral mouth */}
      <circle cx="68" cy="100" r="9" fill={ink} />
      <circle cx="71" cy="97" r="2.5" fill={left} />
      <path d="M 60 138 Q 76 138 84 138" stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* eyebrow — flat focused */}
      <path d="M 58 82 L 80 82" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      {/* RIGHT FACE — smug: side-eye, raised brow, smirk */}
      <ellipse cx="138" cy="102" rx="11" ry="8" fill={ink} />
      <circle cx="144" cy="100" r="3" fill={right} />
      {/* eyebrow — raised at outer edge */}
      <path d="M 122 78 Q 138 70 156 84" stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* smirk — asymmetric */}
      <path d="M 118 138 Q 136 148 156 134" stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* tongue dot — cheeky */}
      <circle cx="148" cy="142" r="3" fill={accent} />
    </svg>
  );
}

function TwoFaceWordmark({ size = 1, ink = '#1B1726', brand = '#D8FF3C' }) {
  // Chunky display wordmark — "HABA" stacked over "CHEWOAH" with hyphen accent
  const w = 520 * size, h = 140 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 520 140" style={{ display: 'block' }}>
      <text x="0" y="62" style={{
        fontFamily: '"Bricolage Grotesque", "Space Grotesk", sans-serif',
        fontSize: 64, fontWeight: 800, letterSpacing: -2, fill: ink,
      }}>HABA</text>
      <rect x="180" y="48" width="22" height="10" fill={brand} rx="2" />
      <text x="210" y="62" style={{
        fontFamily: '"Bricolage Grotesque", "Space Grotesk", sans-serif',
        fontSize: 64, fontWeight: 800, letterSpacing: -2, fill: ink,
      }}>CHEWOAH</text>
      <text x="0" y="118" style={{
        fontFamily: 'ui-monospace, "SF Mono", monospace',
        fontSize: 14, fontWeight: 500, letterSpacing: 4, fill: ink, opacity: 0.55,
      }}>HABITUAL · I·BET·CHA·WON'T</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CONCEPT 2 — "Speech Bubble" — the dare made visible
// A speech bubble with two eyes peeking out from inside.
// The bubble itself is the brand mark; the eyes give it personality.
// Reads as: someone in there is talking trash about you.
// ─────────────────────────────────────────────────────────────

function BubbleMascot({ size = 200, brand = '#D8FF3C', ink = '#1B1726', accent = '#FF4D8D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      {/* bubble */}
      <path d="M 28 40
               Q 28 24 44 24
               H 156
               Q 172 24 172 40
               V 124
               Q 172 140 156 140
               H 88
               L 64 168
               L 70 140
               H 44
               Q 28 140 28 124
               Z"
        fill={brand} stroke={ink} strokeWidth="6" strokeLinejoin="round" />
      {/* eyes — both side-eye-glancing right, smug */}
      <ellipse cx="74" cy="78" rx="14" ry="18" fill="#FFF" stroke={ink} strokeWidth="4" />
      <ellipse cx="124" cy="78" rx="14" ry="18" fill="#FFF" stroke={ink} strokeWidth="4" />
      <circle cx="80" cy="84" r="6" fill={ink} />
      <circle cx="130" cy="84" r="6" fill={ink} />
      {/* tiny pink smirk */}
      <path d="M 88 110 Q 100 118 112 108" stroke={ink} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="118" cy="108" r="3" fill={accent} />
    </svg>
  );
}

function BubbleWordmark({ size = 1, ink = '#1B1726', brand = '#D8FF3C' }) {
  const w = 520 * size, h = 100 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 520 100" style={{ display: 'block' }}>
      <text x="0" y="64" style={{
        fontFamily: '"Bricolage Grotesque", "Space Grotesk", sans-serif',
        fontSize: 60, fontWeight: 800, letterSpacing: -1.8, fill: ink,
      }}>haba</text>
      <text x="142" y="64" style={{
        fontFamily: '"Bricolage Grotesque", "Space Grotesk", sans-serif',
        fontSize: 60, fontWeight: 400, fontStyle: 'italic', letterSpacing: -1.8, fill: ink,
      }}>-</text>
      <text x="170" y="64" style={{
        fontFamily: '"Bricolage Grotesque", "Space Grotesk", sans-serif',
        fontSize: 60, fontWeight: 800, letterSpacing: -1.8, fill: ink,
      }}>chewoah</text>
      {/* underline tilde — "you sure about that?" energy */}
      <path d="M 4 84 Q 130 70 260 84 T 516 84" stroke={brand} strokeWidth="4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CONCEPT 3 — "Sticker Stack" — the ledger meets the dare
// A stack of three offset rounded squares (like swiped cards / log entries),
// top one has a checkmark, middle has dots, bottom has an "X" — the gambit.
// Implies: log → log → bet · the system in one mark.
// ─────────────────────────────────────────────────────────────

function StackMascot({ size = 200, brand = '#D8FF3C', ink = '#1B1726', accent = '#FF4D8D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      {/* bottom card (peeks left, accent) */}
      <g transform="translate(34 88) rotate(-8)">
        <rect width="120" height="84" rx="14" fill={accent} stroke={ink} strokeWidth="5" />
        <text x="20" y="56" style={{ fontFamily: '"Bricolage Grotesque", sans-serif', fontSize: 44, fontWeight: 900, fill: ink }}>×</text>
      </g>
      {/* middle card */}
      <g transform="translate(46 60) rotate(2)">
        <rect width="120" height="84" rx="14" fill="#FFFFFF" stroke={ink} strokeWidth="5" />
        <circle cx="36" cy="42" r="6" fill={ink} />
        <circle cx="60" cy="42" r="6" fill={ink} />
        <circle cx="84" cy="42" r="6" fill={ink} />
      </g>
      {/* top card (brand) — the win */}
      <g transform="translate(58 32) rotate(-4)">
        <rect width="120" height="84" rx="14" fill={brand} stroke={ink} strokeWidth="5" />
        <path d="M 32 46 L 50 62 L 88 28" stroke={ink} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}

function StackWordmark({ size = 1, ink = '#1B1726', brand = '#D8FF3C' }) {
  const w = 580 * size, h = 110 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 580 110" style={{ display: 'block' }}>
      <text x="0" y="76" style={{
        fontFamily: '"Archivo Black", "Bricolage Grotesque", sans-serif',
        fontSize: 76, fontWeight: 900, letterSpacing: -2.5, fill: ink,
      }}>HABA</text>
      <circle cx="218" cy="56" r="8" fill={brand} stroke={ink} strokeWidth="3" />
      <text x="240" y="76" style={{
        fontFamily: '"Archivo Black", "Bricolage Grotesque", sans-serif',
        fontSize: 76, fontWeight: 900, letterSpacing: -2.5, fill: ink,
      }}>CHEWOAH</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CONCEPT 4 — "Eyebrow" — pure typographic
// The wordmark IS the logo. A single raised eyebrow above the "C" of CHEWOAH
// embodies "I bet you won't" without a literal mascot.
// Perfect for adults / minimal-leaning users.
// ─────────────────────────────────────────────────────────────

function EyebrowMascot({ size = 200, brand = '#D8FF3C', ink = '#1B1726', accent = '#FF4D8D' }) {
  // For app-icon contexts: just the letter "h" with the eyebrow swoop
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      <rect x="0" y="0" width="200" height="200" rx="44" fill={brand} />
      {/* the chunky lowercase h */}
      <path d="M 56 40 V 160 H 80 V 110 Q 80 92 96 92 Q 112 92 112 110 V 160 H 136 V 104 Q 136 76 110 72 Q 92 70 80 80 V 40 Z"
        fill={ink} />
      {/* eyebrow swoop above */}
      <path d="M 100 28 Q 130 14 158 28" stroke={ink} strokeWidth="6" strokeLinecap="round" fill="none" />
      {/* tiny dot — eye */}
      <circle cx="124" cy="50" r="5" fill={ink} />
    </svg>
  );
}

function EyebrowWordmark({ size = 1, ink = '#1B1726', brand = '#D8FF3C', accent = '#FF4D8D' }) {
  const w = 600 * size, h = 130 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 600 130" style={{ display: 'block' }}>
      {/* eyebrow */}
      <path d="M 250 22 Q 280 8 312 24" stroke={accent} strokeWidth="5" strokeLinecap="round" fill="none" />
      <text x="0" y="100" style={{
        fontFamily: '"Bricolage Grotesque", "Space Grotesk", sans-serif',
        fontSize: 84, fontWeight: 700, letterSpacing: -3, fill: ink,
      }}>haba-chewoah</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// CONCEPT 5 — "Ledger Eye" — the ballot is watching
// A ballot/checkbox whose checkmark is a single eye peering at you.
// Combines the LEDGER (habitual) with the GAZE (social bet).
// ─────────────────────────────────────────────────────────────

function LedgerEyeMascot({ size = 200, brand = '#D8FF3C', ink = '#1B1726', accent = '#FF4D8D' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      {/* checkbox frame */}
      <rect x="32" y="32" width="136" height="136" rx="20" fill={brand} stroke={ink} strokeWidth="6" />
      {/* big eye filling the box */}
      <ellipse cx="100" cy="100" rx="52" ry="36" fill="#FFFFFF" stroke={ink} strokeWidth="5" />
      {/* iris — looking right (side-eye) */}
      <circle cx="116" cy="100" r="22" fill={ink} />
      <circle cx="124" cy="94" r="6" fill="#FFFFFF" />
      {/* lash flicks */}
      <path d="M 56 78 L 50 70" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      <path d="M 100 64 L 100 56" stroke={ink} strokeWidth="4" strokeLinecap="round" />
      <path d="M 144 78 L 150 70" stroke={ink} strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function LedgerEyeWordmark({ size = 1, ink = '#1B1726', brand = '#D8FF3C' }) {
  const w = 540 * size, h = 110 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 540 110" style={{ display: 'block' }}>
      <text x="0" y="74" style={{
        fontFamily: '"Bricolage Grotesque", sans-serif',
        fontSize: 64, fontWeight: 800, letterSpacing: -1.5, fill: ink,
      }}>haba</text>
      {/* hyphen as an eye */}
      <ellipse cx="158" cy="56" rx="12" ry="6" fill={brand} stroke={ink} strokeWidth="2.5" />
      <circle cx="160" cy="56" r="3" fill={ink} />
      <text x="180" y="74" style={{
        fontFamily: '"Bricolage Grotesque", sans-serif',
        fontSize: 64, fontWeight: 800, letterSpacing: -1.5, fill: ink,
      }}>chewoah</text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────
// Concept registry
// ─────────────────────────────────────────────────────────────

const CONCEPTS = [
  {
    id: 'two-face', name: 'Two-Face', tagline: 'Disciplined doer × smug doubter — one head, two halves.',
    Mascot: TwoFaceMascot, Wordmark: TwoFaceWordmark,
  },
  {
    id: 'bubble', name: 'Eavesdropper', tagline: 'A speech bubble watching you. Public, social, cheeky.',
    Mascot: BubbleMascot, Wordmark: BubbleWordmark,
  },
  {
    id: 'stack', name: 'Sticker Stack', tagline: 'Three log-cards stacked: × → ··· → ✓. The whole loop in one mark.',
    Mascot: StackMascot, Wordmark: StackWordmark,
  },
  {
    id: 'eyebrow', name: 'Eyebrow', tagline: 'Pure typographic. The raised brow IS the dare.',
    Mascot: EyebrowMascot, Wordmark: EyebrowWordmark,
  },
  {
    id: 'ledger-eye', name: 'Ledger Eye', tagline: 'The ballot is watching. Habit-tracker × social gaze.',
    Mascot: LedgerEyeMascot, Wordmark: LedgerEyeWordmark,
  },
];

Object.assign(window, {
  CONCEPTS,
  TwoFaceMascot, TwoFaceWordmark,
  BubbleMascot, BubbleWordmark,
  StackMascot, StackWordmark,
  EyebrowMascot, EyebrowWordmark,
  LedgerEyeMascot, LedgerEyeWordmark,
});
