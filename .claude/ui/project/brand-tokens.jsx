// brand-tokens.jsx — Theme tokens + dark mode + global toggle
// Single source of truth for all mockups.

const HC_LIGHT = {
  bg: '#F6F3EB',          // slightly warmer, less yellow paper
  surface: '#FFFFFF',
  surfaceAlt: '#FBF8F1',  // hairline-different surface for stacked cards
  ink: '#1F1B2E',         // softened ink
  inkSoft: '#2D2840',
  muted: '#7A7388',
  mutedSoft: '#B8B2C2',
  brand: '#D8FF3C',       // neon lime — used sparingly as accent
  brandStrong: '#C7EE2B', // for hover / emphasis
  brandInk: '#1F1B2E',
  accent: '#E8769A',      // dustier pink — was hot (#FF4D8D)
  accentInk: '#FFFFFF',
  line: 'rgba(31, 27, 46, 0.08)',
  lineStrong: 'rgba(31, 27, 46, 0.16)',
  shadow: '0 1px 2px rgba(31,27,46,0.04), 0 6px 18px rgba(31,27,46,0.05)',
  shadowSoft: '0 1px 2px rgba(31,27,46,0.04)',
  shadowLg: '0 2px 4px rgba(31,27,46,0.05), 0 12px 32px rgba(31,27,46,0.08)',
};
const HC_DARK = {
  bg: '#13111C',
  surface: '#1C1A28',
  surfaceAlt: '#221F30',
  ink: '#EFEAE0',
  inkSoft: '#D6D0C2',
  muted: '#8A8398',
  mutedSoft: '#5C5668',
  brand: '#D8FF3C',
  brandStrong: '#E5FF5C',
  brandInk: '#13111C',
  accent: '#E8769A',
  accentInk: '#13111C',
  line: 'rgba(239, 234, 224, 0.08)',
  lineStrong: 'rgba(239, 234, 224, 0.16)',
  shadow: '0 1px 2px rgba(0,0,0,0.3), 0 6px 18px rgba(0,0,0,0.25)',
  shadowSoft: '0 1px 2px rgba(0,0,0,0.3)',
  shadowLg: '0 2px 4px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4)',
};
const HC_STATIC = {
  display: '"Bricolage Grotesque", system-ui, sans-serif',
  body: 'Inter, system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
  r1: 8, r2: 12, r3: 18, r4: 24, r5: 32,
  // Legacy refs
  darkBg: '#0F0B1A', darkSurface: '#1B1726', darkInk: '#F5F1E6',
};

// Theme state on window (persists across re-renders; localStorage for refresh persistence)
(function initTheme() {
  if (typeof window === 'undefined') return;
  if (window.__hc_theme_inited) return;
  window.__hc_theme_inited = true;
  let t;
  try { t = localStorage.getItem('hc-theme'); } catch (e) {}
  window.__hc_theme = t === 'dark' ? 'dark' : 'light';
  window.__hc_theme_listeners = new Set();
  window.__hc_setTheme = function (next) {
    window.__hc_theme = next === 'dark' ? 'dark' : 'light';
    try { localStorage.setItem('hc-theme', window.__hc_theme); } catch (e) {}
    document.documentElement.setAttribute('data-theme', window.__hc_theme);
    document.body && (document.body.style.background = (window.__hc_theme === 'dark' ? HC_DARK.bg : HC_LIGHT.bg));
    window.__hc_theme_listeners.forEach((fn) => { try { fn(); } catch (e) {} });
  };
  // Apply on init
  document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.setAttribute('data-theme', window.__hc_theme);
    if (document.body) document.body.style.background = (window.__hc_theme === 'dark' ? HC_DARK.bg : HC_LIGHT.bg);
  });
  if (document.readyState !== 'loading') {
    document.documentElement.setAttribute('data-theme', window.__hc_theme);
    if (document.body) document.body.style.background = (window.__hc_theme === 'dark' ? HC_DARK.bg : HC_LIGHT.bg);
  }
})();

// HC proxy — resolves color tokens against current theme at access time
const HC = new Proxy({}, {
  get(_, key) {
    if (key in HC_STATIC) return HC_STATIC[key];
    const palette = (typeof window !== 'undefined' && window.__hc_theme === 'dark') ? HC_DARK : HC_LIGHT;
    if (key in palette) return palette[key];
    return undefined;
  },
  has(_, key) {
    return key in HC_STATIC || key in HC_LIGHT;
  },
  ownKeys() { return [...Object.keys(HC_STATIC), ...Object.keys(HC_LIGHT)]; },
  getOwnPropertyDescriptor(_, key) {
    if (key in HC_STATIC || key in HC_LIGHT) return { enumerable: true, configurable: true };
  },
});

// useTheme hook — re-renders consumers on theme change
function useTheme() {
  const [, setTick] = React.useState(0);
  React.useEffect(() => {
    const fn = () => setTick((t) => t + 1);
    window.__hc_theme_listeners.add(fn);
    return () => window.__hc_theme_listeners.delete(fn);
  }, []);
  return {
    theme: window.__hc_theme,
    isDark: window.__hc_theme === 'dark',
    toggle: () => window.__hc_setTheme(window.__hc_theme === 'dark' ? 'light' : 'dark'),
    set: window.__hc_setTheme,
  };
}

// Auto-wrap every ReactDOM.createRoot(...).render() so all apps re-render on theme change
(function patchReactDOM() {
  if (typeof window === 'undefined' || !window.ReactDOM || window.__hc_react_patched) return;
  window.__hc_react_patched = true;
  const orig = window.ReactDOM.createRoot;
  window.ReactDOM.createRoot = function (...args) {
    const root = orig.apply(this, args);
    const origRender = root.render.bind(root);
    root.render = function (children) {
      const Wrapper = function () {
        const { theme } = useTheme();
        // Clone with a new key per theme so the entire tree unmounts & remounts,
        // forcing every styled inline reference to re-read HC tokens.
        return React.isValidElement(children)
          ? React.cloneElement(children, { key: theme })
          : children;
      };
      return origRender(React.createElement(Wrapper));
    };
    return root;
  };
})();

// Global floating theme toggle — vanilla DOM, mounted once
(function mountThemeToggle() {
  if (typeof window === 'undefined') return;
  function mount() {
    if (document.getElementById('__hc_theme_toggle')) return;
    const btn = document.createElement('button');
    btn.id = '__hc_theme_toggle';
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.style.cssText = [
      'position:fixed', 'right:18px', 'bottom:18px',
      'z-index:99999',
      'width:48px', 'height:48px', 'border-radius:24px',
      'border:1.5px solid currentColor',
      'background:transparent',
      'cursor:pointer',
      'display:grid', 'place-items:center',
      'box-shadow:0 6px 18px rgba(0,0,0,0.18), 2px 2px 0 currentColor',
      'transition:transform .15s ease, background .2s ease, color .2s ease',
      'font-family:"JetBrains Mono", ui-monospace, monospace',
      'font-size:18px', 'font-weight:700',
      'padding:0',
    ].join(';');
    const updateLook = () => {
      const dark = window.__hc_theme === 'dark';
      btn.style.color = dark ? '#F5F1E6' : '#1B1726';
      btn.style.background = dark ? '#1B1726' : '#FAF7EE';
      btn.innerHTML = dark
        // sun
        ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>'
        // moon
        : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
    };
    btn.addEventListener('click', () => {
      window.__hc_setTheme(window.__hc_theme === 'dark' ? 'light' : 'dark');
      updateLook();
    });
    btn.addEventListener('mouseenter', () => { btn.style.transform = 'scale(1.08) rotate(-6deg)'; });
    btn.addEventListener('mouseleave', () => { btn.style.transform = 'scale(1) rotate(0deg)'; });
    document.body.appendChild(btn);
    updateLook();
    window.__hc_theme_listeners.add(updateLook);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();

// ─────────────────────────────────────────────────────────────
// Mascot (Two-Face) with expression variants
// ─────────────────────────────────────────────────────────────
function Mascot({ size = 200, mood = 'default', bg, accent }) {
  const ink = HC.ink, brand = HC.brand, pink = HC.accent;
  // Mascot uses fixed colors so it remains recognizable in dark mode
  const mInk = '#1B1726';
  const left = '#D8FF3C', right = '#FFFFFF';
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" style={{ display: 'block' }}>
      <rect x="20" y="24" width="160" height="160" rx="38" fill={bg || mInk} />
      <path d="M 40 56 H 100 V 168 H 56 a 16 16 0 0 1 -16 -16 Z" fill={left} />
      <path d="M 100 56 H 160 V 152 a 16 16 0 0 1 -16 16 H 100 Z" fill={right} />
      <line x1="100" y1="56" x2="100" y2="168" stroke={mInk} strokeWidth="3" />

      {/* LEFT FACE — disciplined */}
      {mood === 'wink' || mood === 'celebrate' ? (
        <path d="M 58 100 Q 68 92 80 100" stroke={mInk} strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : mood === 'dead' ? (
        <path d="M 60 94 L 76 106 M 76 94 L 60 106" stroke={mInk} strokeWidth="4" strokeLinecap="round" />
      ) : (
        <>
          <circle cx="68" cy="100" r="9" fill={mInk} />
          <circle cx="71" cy="97" r="2.5" fill={left} />
        </>
      )}
      <path d="M 58 82 L 80 82" stroke={mInk} strokeWidth="4" strokeLinecap="round" />
      {mood === 'celebrate' ? (
        <path d="M 56 132 Q 70 148 84 134" stroke={mInk} strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : mood === 'sweat' ? (
        <path d="M 60 140 Q 70 134 80 140" stroke={mInk} strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M 60 138 Q 76 138 84 138" stroke={mInk} strokeWidth="4" strokeLinecap="round" fill="none" />
      )}

      {/* RIGHT FACE — smug */}
      {mood === 'dead' ? (
        <path d="M 122 96 L 154 108 M 154 96 L 122 108" stroke={mInk} strokeWidth="4" strokeLinecap="round" />
      ) : (
        <>
          <ellipse cx="138" cy="102" rx="11" ry={mood === 'smug' ? 5 : 8} fill={mInk} />
          <circle cx={mood === 'smug' ? 142 : 144} cy="100" r="3" fill={right} />
        </>
      )}
      <path d="M 122 78 Q 138 70 156 84" stroke={mInk} strokeWidth="4" strokeLinecap="round" fill="none" />
      {mood === 'celebrate' ? (
        <path d="M 116 132 Q 136 152 158 130" stroke={mInk} strokeWidth="4" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M 118 138 Q 136 148 156 134" stroke={mInk} strokeWidth="4" strokeLinecap="round" fill="none" />
      )}
      <circle cx="148" cy="142" r="3" fill="#FF4D8D" />

      {/* Sweat drop */}
      {mood === 'sweat' && (
        <path d="M 38 60 Q 32 70 38 76 Q 44 70 38 60 Z" fill="#7CC2FF" stroke={mInk} strokeWidth="2" />
      )}
    </svg>
  );
}

// Wordmark
function Wordmark({ size = 1, color, accent }) {
  const ink = color || HC.ink;
  const brand = accent || HC.brand;
  const w = 520 * size, h = 80 * size;
  return (
    <svg width={w} height={h} viewBox="0 0 520 80" style={{ display: 'block' }}>
      <text x="0" y="58" style={{
        fontFamily: HC.display, fontSize: 60, fontWeight: 800, letterSpacing: -2, fill: ink,
      }}>haba</text>
      <rect x="138" y="38" width="20" height="8" fill={brand} rx="2" />
      <text x="166" y="58" style={{
        fontFamily: HC.display, fontSize: 60, fontWeight: 800, letterSpacing: -2, fill: ink,
      }}>chewoah</text>
    </svg>
  );
}

// App icon
function AppIcon({ size = 80, radius }) {
  const r = radius ?? size * 0.225;
  return (
    <div style={{
      width: size, height: size, borderRadius: r,
      background: HC.brand, display: 'grid', placeItems: 'center',
      boxShadow: '0 4px 14px rgba(0,0,0,0.18)', overflow: 'hidden',
      flexShrink: 0,
    }}>
      <Mascot size={size * 0.92} bg={'#1B1726'} />
    </div>
  );
}

Object.assign(window, { HC, Mascot, Wordmark, AppIcon, useTheme });
