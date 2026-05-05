// desktop.jsx — Haba-Chewoah desktop UI (1440 wide)
const { useState: uS_d } = React;

// Reuse mock data shapes inline so this file is standalone-ish
const D_FEED = [
  { id: 'd1', user: 'kira w.', handle: 'kira', mood: 'smug', habit: 'no doomscroll', day: 119, when: '12m', note: 'phone\u2019s been in the drawer since dinner. used to feel anxious. now i just feel\u2026 quiet?', media: 'photo', tone: 'ink', likes: 87, comments: 14, likedByMe: true, isMilestone: true },
  { id: 'd2', user: 'theo p.', handle: 'theo', mood: 'sweat', habit: 'duolingo french', day: 5, when: '34m', note: 'je suis fatigu\u00e9 mais je suis ici. mascot looks judgmental today.', media: 'note', tone: 'paper', likes: 12, comments: 3, likedByMe: false },
  { id: 'd3', user: 'maya k.', handle: 'maya.k', mood: 'celebrate', habit: 'cold plunge', day: 47, when: '1h', note: 'i bet i won\u2019t make it to day 50. day 47. mascot can shut up now \u2744\ufe0f', media: 'video', tone: 'lime', likes: 24, comments: 6, likedByMe: false, isMilestone: false },
  { id: 'd4', user: 'jules a.', handle: 'jules', mood: 'dead', habit: 'gym \u00b7 4x/week', day: 0, when: '2h', note: 'missed leg day. mascot is staring at me. anyway, restarting tomorrow.', media: 'note', tone: 'paper', likes: 8, comments: 11, likedByMe: false, isMiss: true },
  { id: 'd5', user: 'sam r.', handle: 'sam', mood: 'wink', habit: 'read \u00b7 20 pages', day: 31, when: '3h', note: 'one month. didn\u2019t open instagram once before bed.', media: 'photo', tone: 'pink', likes: 41, comments: 5, likedByMe: false, isMilestone: true },
];

const D_TODAY = [
  { habit: 'cold plunge', day: 47, done: true, mood: 'celebrate' },
  { habit: 'no doomscroll', day: 12, done: true, mood: 'smug' },
  { habit: 'journal', day: 89, done: false, mood: 'default' },
  { habit: 'french', day: 5, done: false, mood: 'sweat' },
];

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────
function DSidebar({ active = 'home' }) {
  const items = [
    { id: 'home', label: 'home', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z' },
    { id: 'discover', label: 'discover', d: 'M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z' },
    { id: 'chewouts', label: 'chew-outs', d: 'M13 2L3 14h9l-1 8 10-12h-9z', badge: 3 },
    { id: 'me', label: 'profile', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z' },
  ];
  return (
    <aside style={{
      width: 240, flexShrink: 0,
      background: HC.bg, borderRight: `1.5px solid ${HC.ink}10`,
      padding: '22px 16px 18px',
      display: 'flex', flexDirection: 'column', gap: 4,
    }}>
      <div style={{ padding: '4px 8px 22px' }}>
        <Wordmark size={0.34} />
      </div>

      {/* New post big CTA */}
      <button style={{
        margin: '0 0 16px', padding: '14px 16px', borderRadius: HC.r3,
        background: HC.brand, color: HC.brandInk,
        border: `1px solid ${HC.line}`, boxShadow: HC.shadow,
        display: 'flex', alignItems: 'center', gap: 10,
        fontFamily: HC.display, fontSize: 16, fontWeight: 800, letterSpacing: -0.3,
        cursor: 'pointer',
      }}>
        <span style={{
          width: 26, height: 26, borderRadius: 13,
          background: HC.ink, color: HC.brand,
          display: 'grid', placeItems: 'center', fontSize: 16, fontWeight: 800, lineHeight: 0,
        }}>＋</span>
        log or create
      </button>

      {items.map((it) => {
        const sel = it.id === active;
        return (
          <a key={it.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: HC.r2,
            background: sel ? HC.surface : 'transparent',
            border: sel ? `1.5px solid ${HC.ink}` : `1.5px solid transparent`,
            color: HC.ink, textDecoration: 'none', cursor: 'pointer',
            position: 'relative',
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={it.d}/></svg>
            <span style={{ fontFamily: HC.body, fontSize: 14, fontWeight: sel ? 700 : 600 }}>{it.label}</span>
            {it.badge && (
              <span style={{
                marginLeft: 'auto',
                background: HC.accent, color: HC.accentInk,
                fontFamily: HC.mono, fontSize: 10, fontWeight: 700,
                padding: '1px 7px', borderRadius: 99,
              }}>{it.badge}</span>
            )}
          </a>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Account */}
      <div style={{
        padding: 10, borderRadius: HC.r2, background: HC.surface,
        border: `1.5px solid ${HC.ink}22`,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ width: 36, height: 36, borderRadius: 18, background: HC.ink, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
          <Mascot size={32} bg={HC.ink} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: HC.body, fontSize: 13, fontWeight: 700, color: HC.ink }}>maya k.</div>
          <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 500 }}>@maya.k</div>
        </div>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: HC.muted, fontWeight: 700, fontSize: 14, lineHeight: 1, padding: 4 }}>⋯</button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Topbar (search + notifications)
// ─────────────────────────────────────────────
function DTopbar({ title, sub }) {
  return (
    <div style={{
      padding: '18px 32px 14px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      gap: 24, borderBottom: `1px solid ${HC.ink}10`, background: HC.bg,
      position: 'sticky', top: 0, zIndex: 5,
    }}>
      <div>
        <div style={{ fontFamily: HC.display, fontSize: 22, fontWeight: 800, color: HC.ink, letterSpacing: -0.5, lineHeight: 1.1 }}>
          {title}
        </div>
        {sub && <div style={{ fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 500, marginTop: 2 }}>{sub}</div>}
      </div>
      <div style={{ flex: 1, maxWidth: 460, display: 'flex', alignItems: 'center', gap: 10,
        background: HC.surface, border: `1.5px solid ${HC.ink}22`, borderRadius: 99,
        padding: '8px 14px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={HC.muted} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        <input placeholder="search habits, friends, dares…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: HC.body, fontSize: 13, color: HC.ink }} />
        <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, background: HC.bg, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>⌘K</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <button style={topIcon}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{ position: 'absolute', top: 6, right: 6, width: 9, height: 9, borderRadius: 99, background: HC.accent, border: `1.5px solid ${HC.bg}` }}/>
        </button>
      </div>
    </div>
  );
}
const topIcon = {
  position: 'relative',
  width: 38, height: 38, borderRadius: 19,
  background: HC.surface, border: `1.5px solid ${HC.ink}22`,
  display: 'grid', placeItems: 'center', cursor: 'pointer',
};

// ─────────────────────────────────────────────
// Right rail — today's progress + activity
// ─────────────────────────────────────────────
function DRightRail({ variant = 'home' }) {
  return (
    <aside style={{
      width: 320, flexShrink: 0, padding: '20px 24px 24px',
      borderLeft: `1px solid ${HC.ink}10`,
      display: 'flex', flexDirection: 'column', gap: 18,
      overflowY: 'auto',
    }}>
      {/* Today progress */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <span style={{ fontFamily: HC.display, fontSize: 14, fontWeight: 800, color: HC.ink, letterSpacing: -0.3 }}>today · 2 of 4</span>
          <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>fri · nov 8</span>
        </div>
        <div style={{
          height: 10, borderRadius: 99, background: HC.line, overflow: 'hidden',
          border: `1px solid ${HC.line}`,
        }}>
          <div style={{ width: '50%', height: '100%', background: HC.brand }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {D_TODAY.map((s, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px', borderRadius: HC.r2,
              background: s.done ? HC.brand : HC.surface,
              border: `1.5px solid ${s.done ? HC.ink : HC.lineStrong}`,
              cursor: 'pointer',
            }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: HC.ink, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Mascot size={26} mood={s.mood} bg={HC.ink} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: HC.body, fontSize: 13, fontWeight: 700, color: HC.ink }}>{s.habit}</div>
                <div style={{ fontFamily: HC.mono, fontSize: 9, color: s.done ? `${HC.brandInk}cc` : HC.muted, fontWeight: 600 }}>
                  day {s.day} {s.done ? '· done ✓' : '· due'}
                </div>
              </div>
              {!s.done && (
                <button style={{
                  padding: '5px 10px', borderRadius: 99,
                  background: HC.ink, color: HC.brand, border: 'none',
                  fontFamily: HC.mono, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                }}>log</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Active dares */}
      <section>
        <div style={{ fontFamily: HC.display, fontSize: 14, fontWeight: 800, color: HC.ink, letterSpacing: -0.3, marginBottom: 10 }}>
          your dares
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { dare: "make it to day 50", curr: 47, target: 50 },
            { dare: "go a month no scroll", curr: 12, target: 30 },
          ].map((d, i) => (
            <div key={i} style={{
              padding: 12, borderRadius: HC.r2,
              background: HC.ink, color: HC.bg,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{ fontFamily: HC.mono, fontSize: 9, fontWeight: 700, color: HC.accent, letterSpacing: 1, textTransform: 'uppercase' }}>
                you said
              </div>
              <div style={{ fontFamily: HC.display, fontSize: 14, fontWeight: 700, fontStyle: 'italic', marginTop: 2, lineHeight: 1.3 }}>
                "i bet i won't {d.dare}"
              </div>
              <div style={{
                marginTop: 10, height: 4, background: 'rgba(255,255,255,0.15)',
                borderRadius: 99, overflow: 'hidden',
              }}>
                <div style={{ width: `${(d.curr / d.target) * 100}%`, height: '100%', background: HC.brand }}/>
              </div>
              <div style={{ fontFamily: HC.mono, fontSize: 10, color: `${HC.bg}99`, fontWeight: 600, marginTop: 6 }}>
                {d.curr} / {d.target} days
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Activity */}
      <section>
        <div style={{ fontFamily: HC.display, fontSize: 14, fontWeight: 800, color: HC.ink, letterSpacing: -0.3, marginBottom: 10 }}>
          activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { who: 'jules', mood: 'celebrate', what: 'cheered your day-47 plunge', when: '6m', tone: 'cheer' },
            { who: 'theo', mood: 'wink', what: 'chewed you out about journal', when: '24m', tone: 'chewout' },
            { who: 'kira', mood: 'smug', what: 'started following you', when: '1h', tone: 'follow' },
            { who: 'sam', mood: 'celebrate', what: 'commented on your log', when: '2h', tone: 'comment' },
          ].map((a, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: HC.ink, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                <Mascot size={28} mood={a.mood} bg={HC.ink} />
              </div>
              <div style={{ flex: 1, minWidth: 0, fontFamily: HC.body, fontSize: 12, color: HC.ink, lineHeight: 1.35 }}>
                <span style={{ fontWeight: 700 }}>@{a.who}</span> {a.what} <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>· {a.when}</span>
              </div>
              {a.tone === 'chewout' && (
                <span style={{ fontFamily: HC.mono, fontSize: 9, fontWeight: 700, padding: '2px 6px', background: HC.accent, color: HC.accentInk, borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  ⚡
                </span>
              )}
            </div>
          ))}
        </div>
      </section>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Feed card (desktop, wider)
// ─────────────────────────────────────────────
function DFeedCard({ post }) {
  const [liked, setLiked] = uS_d(post.likedByMe);
  const isLime = post.tone === 'lime', isPink = post.tone === 'pink', isInk = post.tone === 'ink';
  const cardBg = isLime ? HC.brand : isPink ? HC.accent : isInk ? HC.ink : HC.surface;
  const cardInk = isInk || isPink ? HC.bg : HC.ink;
  const subtleInk = isInk || isPink ? `${HC.bg}cc` : HC.muted;
  const showMedia = post.media !== 'note';

  return (
    <article style={{
      background: cardBg, color: cardInk,
      border: `1px solid ${HC.line}`, borderRadius: HC.r3,
      boxShadow: HC.shadow,
      display: 'grid', gridTemplateColumns: showMedia ? '300px 1fr' : '1fr',
      overflow: 'hidden', position: 'relative',
    }}>
      {post.isMilestone && (
        <div style={{
          position: 'absolute', top: 14, right: -32, transform: 'rotate(35deg)',
          background: HC.ink, color: HC.brand,
          padding: '2px 36px', fontFamily: HC.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
          zIndex: 2, pointerEvents: 'none',
        }}>milestone</div>
      )}

      {showMedia && (
        <div style={{
          background: `radial-gradient(circle at 30% 25%, #2C2640 0%, ${HC.ink} 70%)`,
          minHeight: 220, position: 'relative',
          display: 'grid', placeItems: 'center',
          borderRight: `1px solid ${HC.line}`,
        }}>
          <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(105deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)` }}/>
          <Mascot size={110} mood={post.mood} bg={HC.ink} />
          <div style={{
            position: 'absolute', top: 12, left: 12,
            fontFamily: HC.mono, fontSize: 9, fontWeight: 700,
            padding: '3px 8px', borderRadius: 99,
            background: 'rgba(15,11,26,0.7)', color: HC.bg,
            letterSpacing: 0.8, textTransform: 'uppercase',
          }}>{post.media === 'video' ? '▶ video' : '📷 photo'}</div>
          <div style={{
            position: 'absolute', bottom: 12, left: 12,
            background: HC.brand, color: HC.brandInk,
            padding: '4px 10px', borderRadius: 99,
            fontFamily: HC.display, fontSize: 13, fontWeight: 800, letterSpacing: -0.2,
            border: `1px solid ${HC.line}`,
          }}>day {post.day}{post.isMilestone ? ' ✦' : ''}</div>
        </div>
      )}

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 10, minHeight: showMedia ? 220 : 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 38, height: 38, borderRadius: 19, background: HC.ink, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Mascot size={34} mood={post.mood} bg={HC.ink} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <span style={{ fontFamily: HC.body, fontSize: 14, fontWeight: 700, color: cardInk }}>{post.user}</span>
              <span style={{ fontFamily: HC.mono, fontSize: 11, color: subtleInk, fontWeight: 500 }}>@{post.handle} · {post.when}</span>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
              <span style={{
                fontFamily: HC.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
                padding: '2px 7px', borderRadius: 4,
                background: isLime || isPink ? HC.ink : HC.brand,
                color: isLime || isPink ? HC.brand : HC.brandInk,
                whiteSpace: 'nowrap',
              }}>{post.habit}</span>
              <span style={{ fontFamily: HC.mono, fontSize: 11, color: subtleInk, fontWeight: 600 }}>
                {post.isMiss ? 'streak reset' : `day ${post.day}`}
              </span>
            </div>
          </div>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: cardInk, fontWeight: 700, fontSize: 18, lineHeight: 1, padding: 4 }}>⋯</button>
        </div>

        <p style={{ margin: 0, fontSize: 14, color: cardInk, lineHeight: 1.5, flex: 1 }}>
          {post.note}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontFamily: HC.mono, fontSize: 12, color: subtleInk, fontWeight: 700 }}>
          <button onClick={() => setLiked((v) => !v)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, color: 'inherit', font: 'inherit', fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={liked ? HC.accent : 'none'} stroke={liked ? HC.accent : cardInk} strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {post.likes + (liked && !post.likedByMe ? 1 : 0)}
          </button>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, color: 'inherit', font: 'inherit', fontWeight: 700 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cardInk} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {post.comments}
          </button>
          <button style={{
            marginLeft: 'auto',
            background: 'transparent', border: `1.5px solid ${cardInk === HC.bg ? `${HC.bg}55` : HC.ink}`,
            borderRadius: 99, padding: '4px 12px',
            fontFamily: HC.mono, fontSize: 11, fontWeight: 700, color: cardInk, cursor: 'pointer',
          }}>
            {post.isMiss ? 'send hug' : 'cheer'}
          </button>
        </div>
      </div>
    </article>
  );
}

// ─────────────────────────────────────────────
// Filter bar (desktop)
// ─────────────────────────────────────────────
function DFilterBar() {
  const [active, setActive] = uS_d('all');
  const filters = ['all', 'today', '✦ milestones', 'misses', 'closest friends'];
  return (
    <div style={{
      padding: '14px 32px', display: 'flex', gap: 8,
      borderBottom: `1px solid ${HC.ink}10`, background: HC.bg,
      position: 'sticky', top: 78, zIndex: 4,
    }}>
      {filters.map((f) => (
        <button key={f} onClick={() => setActive(f)} style={{
          padding: '7px 14px', borderRadius: 99,
          fontFamily: HC.body, fontSize: 12, fontWeight: 700,
          background: active === f ? HC.ink : 'transparent',
          color: active === f ? HC.brand : HC.ink,
          border: `1.5px solid ${active === f ? HC.ink : `${HC.ink}33`}`,
          cursor: 'pointer', whiteSpace: 'nowrap',
        }}>{f}</button>
      ))}
      <div style={{ marginLeft: 'auto', fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 600, alignSelf: 'center' }}>
        sorted by · most recent
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Screen 1 — Home Feed
// ─────────────────────────────────────────────
function DHome() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: HC.bg, overflow: 'hidden' }}>
      <DSidebar active="home" />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DTopbar title="home" sub="6 logs from people you follow today" />
        <DFilterBar />
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 32px 40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {D_FEED.map((p) => <DFeedCard key={p.id} post={p} />)}
        </div>
      </main>
      <DRightRail variant="home" />
    </div>
  );
}

// ─────────────────────────────────────────────
// Screen 2 — Profile (own)
// ─────────────────────────────────────────────
const D_HABITS = [
  { id: 'h1', name: 'cold plunge', day: 47, freq: 'daily', mood: 'celebrate', mode: 'public', completion: 96, lastLog: '12m ago' },
  { id: 'h2', name: 'no doomscroll', day: 12, freq: 'daily', mood: 'smug', mode: 'public', completion: 100, lastLog: '2h ago' },
  { id: 'h3', name: 'journal · 1 page', day: 89, freq: 'daily', mood: 'default', mode: 'folder', completion: 88, lastLog: 'yesterday' },
  { id: 'h4', name: 'duolingo french', day: 5, freq: '5x/week', mood: 'sweat', mode: 'folder', completion: 71, lastLog: '3h ago' },
];

function DProfile({ isOwn = true }) {
  const [tab, setTab] = uS_d('habits');
  const user = isOwn
    ? { name: 'maya k.', handle: 'maya.k', bio: 'cold plunger · book reader · sworn enemy of tiktok', followers: 384, following: 162, topStreak: 47, betsWon: 162 }
    : { name: 'kira w.', handle: 'kira', bio: 'no doomscroll. ever. (i bet you won\u2019t either)', followers: 1284, following: 89, topStreak: 119, betsWon: 401 };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: HC.bg, overflow: 'hidden' }}>
      <DSidebar active={isOwn ? 'me' : 'home'} />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DTopbar title={isOwn ? 'your profile' : `@${user.handle}`} sub={`${user.bio}`} />
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Banner */}
          <div style={{
            height: 160, background: `linear-gradient(135deg, ${HC.brand} 0%, ${HC.brand} 60%, ${HC.accent} 100%)`,
            position: 'relative', borderBottom: `1px solid ${HC.line}`,
            overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(45deg, ${HC.ink}10 0 1px, transparent 1px 18px)`, opacity: 0.5 }}/>
            <div style={{ position: 'absolute', right: 32, bottom: -8 }}>
              <Mascot size={140} mood="celebrate" bg={HC.ink} />
            </div>
          </div>

          {/* Identity row */}
          <div style={{ padding: '0 32px', display: 'flex', alignItems: 'flex-end', gap: 20, marginTop: -54, position: 'relative', zIndex: 2 }}>
            <div style={{
              width: 120, height: 120, borderRadius: 60,
              background: HC.ink, border: `3px solid ${HC.bg}`,
              display: 'grid', placeItems: 'center', flexShrink: 0,
              boxShadow: HC.shadowSoft,
            }}>
              <Mascot size={108} mood={isOwn ? 'celebrate' : 'smug'} bg={HC.ink} />
            </div>
            <div style={{ flex: 1, paddingBottom: 14 }}>
              <div style={{ fontFamily: HC.display, fontSize: 28, fontWeight: 800, color: HC.ink, letterSpacing: -0.8, lineHeight: 1.05 }}>
                {user.name}
              </div>
              <div style={{ fontFamily: HC.mono, fontSize: 13, color: HC.muted, fontWeight: 500, marginTop: 4 }}>
                @{user.handle}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, paddingBottom: 14 }}>
              {isOwn ? (
                <>
                  <button style={btnDsk()}>edit profile</button>
                  <button style={btnDsk('icon')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
                  </button>
                </>
              ) : (
                <>
                  <button style={btnDsk('primary')}>+ follow</button>
                  <button style={btnDsk()}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>
                    chew out
                  </button>
                  <button style={btnDsk('icon')}>⋯</button>
                </>
              )}
            </div>
          </div>

          {/* bio + counts */}
          <div style={{ padding: '14px 32px 0' }}>
            <p style={{ margin: 0, fontSize: 14, color: HC.ink, lineHeight: 1.5, maxWidth: 620 }}>
              {user.bio}
            </p>
            <div style={{ display: 'flex', gap: 28, marginTop: 14 }}>
              {[
                { n: user.followers, l: 'followers' }, { n: user.following, l: 'following' },
                { n: user.topStreak, l: 'top streak' }, { n: user.betsWon, l: 'bets won' },
              ].map((s) => (
                <div key={s.l}>
                  <div style={{ fontFamily: HC.display, fontSize: 22, fontWeight: 800, color: HC.ink, letterSpacing: -0.5, lineHeight: 1 }}>
                    {s.n.toLocaleString()}
                  </div>
                  <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginTop: 2 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', padding: '0 32px', gap: 4, borderBottom: `1px solid ${HC.ink}15`, marginTop: 18 }}>
            {[
              { id: 'habits', label: 'habits', count: D_HABITS.length },
              { id: 'logs', label: 'logs', count: 32 },
              { id: 'dares', label: 'dares', count: 4 },
            ].map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                padding: '14px 14px 12px', position: 'relative',
                display: 'flex', alignItems: 'center', gap: 6,
                fontFamily: HC.body, fontSize: 14, fontWeight: 700,
                color: tab === t.id ? HC.ink : HC.muted,
              }}>
                {t.label}
                <span style={{
                  fontFamily: HC.mono, fontSize: 10, fontWeight: 700,
                  background: tab === t.id ? HC.brand : `${HC.muted}22`,
                  color: tab === t.id ? HC.brandInk : HC.muted,
                  padding: '1px 6px', borderRadius: 99,
                }}>{t.count}</span>
                {tab === t.id && <div style={{ position: 'absolute', bottom: -1, left: 8, right: 8, height: 3, background: HC.ink, borderRadius: 2 }}/>}
              </button>
            ))}
          </div>

          {/* Habits grid 4-up */}
          <div style={{ padding: '20px 32px 40px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {D_HABITS.map((h) => (
              <div key={h.id} style={{
                padding: 16, borderRadius: HC.r3,
                background: h.mode === 'public' ? HC.brand : HC.surface,
                border: `1px solid ${HC.line}`,
                boxShadow: HC.shadow,
                display: 'flex', flexDirection: 'column', gap: 12,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Mascot size={40} mood={h.mood} />
                  <span style={{
                    fontFamily: HC.mono, fontSize: 8, padding: '2px 6px', borderRadius: 4,
                    background: h.mode === 'public' ? HC.ink : HC.bg,
                    color: h.mode === 'public' ? HC.brand : HC.muted,
                    letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase', height: 'fit-content',
                  }}>{h.mode === 'public' ? '· PUBLIC' : '🔒 FOLDER'}</span>
                </div>
                <div style={{ fontFamily: HC.body, fontSize: 14, fontWeight: 700, color: HC.ink, lineHeight: 1.2 }}>{h.name}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span style={{ fontFamily: HC.display, fontSize: 32, fontWeight: 800, color: HC.ink, letterSpacing: -1, lineHeight: 1 }}>{h.day}</span>
                  <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, textTransform: 'uppercase', fontWeight: 600 }}>days</span>
                </div>
                <div style={{ fontFamily: HC.mono, fontSize: 9, color: h.mode === 'public' ? `${HC.ink}aa` : HC.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {h.freq} · {h.completion}% · last log {h.lastLog}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <DRightRail variant="profile" />
    </div>
  );
}
const btnDsk = (variant) => ({
  background: variant === 'primary' ? HC.ink : HC.surface,
  color: variant === 'primary' ? HC.brand : HC.ink,
  border: `1px solid ${HC.line}`,
  padding: variant === 'icon' ? '10px' : '10px 16px',
  borderRadius: HC.r2,
  fontFamily: HC.body, fontSize: 13, fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex', alignItems: 'center',
  width: variant === 'icon' ? 40 : 'auto',
  justifyContent: 'center',
});

// ─────────────────────────────────────────────
// Screen 3 — Habit detail (modal/page wide)
// ─────────────────────────────────────────────
const D_HEAT = (() => {
  const out = [];
  for (let w = 0; w < 12; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      const v = (w === 0 && d < 2) ? 0 : (Math.random() < 0.92 ? 2 : 1);
      row.push(v);
    }
    out.push(row);
  }
  return out;
})();

function DHabitDetail() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: HC.bg, overflow: 'hidden' }}>
      <DSidebar active="me" />
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <DTopbar title="cold plunge" sub="/habit/h1 · started sep 15 · daily" />
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px 40px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          {/* LEFT */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Hero */}
            <section style={{
              background: HC.surface, color: HC.ink,
              border: `1px solid ${HC.line}`, borderRadius: HC.r4, padding: 28,
              boxShadow: HC.shadow, position: 'relative', overflow: 'hidden',
              display: 'grid', gridTemplateColumns: '1fr auto', gap: 20, alignItems: 'center',
            }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, background: HC.brand }} />
              <div>
                <div style={{ fontFamily: HC.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: HC.muted, marginBottom: 4 }}>
                  ❄️ daily · 1× per day · live public
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontFamily: HC.display, fontSize: 110, fontWeight: 800, letterSpacing: -6, lineHeight: 0.85 }}>47</span>
                  <span style={{ fontFamily: HC.display, fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>days</span>
                </div>
                <div style={{ fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 600, marginTop: 2, letterSpacing: 0.5 }}>
                  current streak · longest 47 · 96% completion
                </div>
                <div style={{
                  marginTop: 16, padding: '12px 16px', borderRadius: HC.r2,
                  background: HC.ink, color: HC.bg, maxWidth: 440,
                }}>
                  <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.accent, letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase' }}>your dare</div>
                  <div style={{ fontFamily: HC.display, fontSize: 17, fontWeight: 700, fontStyle: 'italic', letterSpacing: -0.4, marginTop: 2 }}>
                    "i bet i won't make it to day 50."
                  </div>
                </div>
              </div>
              <Mascot size={170} mood="celebrate" />
            </section>

            {/* Heatmap (bigger, 12 weeks) */}
            <section style={{
              padding: 20, background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r3,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
                <span style={{ fontFamily: HC.display, fontSize: 18, fontWeight: 800, color: HC.ink, letterSpacing: -0.4 }}>last 12 weeks</span>
                <span style={{ fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 600 }}>2 misses · 82 hits · 94% rate</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingRight: 4 }}>
                  {['m', 'w', 'f'].map((d) => <span key={d} style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, fontWeight: 600 }}>{d}</span>)}
                </div>
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
                  {D_HEAT.map((week, wi) => (
                    <div key={wi} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: 6 }}>
                      {week.map((v, di) => (
                        <div key={di} style={{
                          aspectRatio: '1 / 1',
                          background: v === 2 ? HC.brand : v === 1 ? HC.accent : HC.line,
                          border: `1px solid ${v >= 1 ? HC.ink : 'transparent'}`,
                          borderRadius: 4,
                        }}/>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Recent logs */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
                <span style={{ fontFamily: HC.display, fontSize: 18, fontWeight: 800, color: HC.ink, letterSpacing: -0.4 }}>recent logs</span>
                <span style={{ fontFamily: HC.mono, fontSize: 11, color: HC.ink, fontWeight: 700, textDecoration: 'underline' }}>see all 45 →</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { day: 47, when: 'today · 6:42a', note: 'mascot can shut up now.', mood: 'celebrate', media: 'photo', likes: 24 },
                  { day: 46, when: 'yesterday', note: '14 sec PR. legs went numb.', mood: 'celebrate', media: 'video', likes: 38 },
                  { day: 45, when: '2d ago', note: 'tap, plunge, scream, log.', mood: 'sweat', media: 'note', likes: 11 },
                ].map((l, i) => (
                  <div key={i} style={{
                    background: HC.surface, border: `1.5px solid ${HC.ink}22`, borderRadius: HC.r2,
                    padding: 14, display: 'flex', flexDirection: 'column', gap: 10, cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mascot size={32} mood={l.mood} />
                      <div>
                        <div style={{ fontFamily: HC.mono, fontSize: 10, padding: '1px 6px', borderRadius: 4, background: HC.brand, color: HC.brandInk, fontWeight: 700, display: 'inline-block' }}>day {l.day}</div>
                        <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, fontWeight: 600, textTransform: 'uppercase', marginTop: 2 }}>{l.when}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: HC.ink, lineHeight: 1.4, flex: 1 }}>{l.note}</div>
                    <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>♥ {l.likes} · {l.media}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT — stats + actions */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <button style={{
              padding: '18px 20px', borderRadius: HC.r3,
              background: HC.ink, color: HC.brand, border: 'none',
              fontFamily: HC.display, fontSize: 18, fontWeight: 800, letterSpacing: -0.4,
              cursor: 'pointer', boxShadow: HC.shadow,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}>
              <span style={{ fontSize: 22 }}>＋</span> log day 48
            </button>

            <section style={{ padding: 18, background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r3 }}>
              <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>the rule</div>
              <p style={{ margin: 0, fontSize: 14, color: HC.ink, lineHeight: 1.5 }}>
                60 sec @ 38°F. before coffee, no excuses, no exceptions.
              </p>
            </section>

            <section style={{
              padding: 16, background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r3,
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0,
            }}>
              {[
                { n: '47', l: 'current' }, { n: '47', l: 'longest' },
                { n: '96%', l: 'completion' }, { n: '45', l: 'total logs' },
              ].map((s, i) => (
                <div key={s.l} style={{
                  padding: '10px 4px', textAlign: 'center',
                  borderRight: i % 2 === 0 ? `1px solid ${HC.ink}15` : 'none',
                  borderBottom: i < 2 ? `1px solid ${HC.ink}15` : 'none',
                }}>
                  <div style={{ fontFamily: HC.display, fontSize: 22, fontWeight: 800, color: HC.ink, letterSpacing: -0.5, lineHeight: 1 }}>{s.n}</div>
                  <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginTop: 4 }}>{s.l}</div>
                </div>
              ))}
            </section>

            <section style={{ padding: 16, background: HC.ink, color: HC.bg, borderRadius: HC.r3, position: 'relative', overflow: 'hidden' }}>
              <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.accent, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>cheering you on</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                {['celebrate', 'wink', 'smug', 'default'].map((m, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: 14, background: HC.ink, border: `1.5px solid ${HC.bg}`, display: 'grid', placeItems: 'center', marginLeft: i === 0 ? 0 : -8 }}>
                    <Mascot size={26} mood={m} bg={HC.ink} />
                  </div>
                ))}
                <span style={{ fontFamily: HC.mono, fontSize: 11, fontWeight: 700, marginLeft: 6 }}>+18 friends</span>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// Screen 4 — Log detail (lightbox over feed)
// ─────────────────────────────────────────────
const D_COMMENTS = [
  { user: 'jules', mood: 'celebrate', when: '2h ago', text: 'absolute unit. i quit on day 4.', likes: 4, isMine: false, replies: [{ user: 'maya.k', mood: 'wink', when: '1h ago', text: 'come back. mascot needs the company.', likes: 1, isMine: true }] },
  { user: 'theo', mood: 'wink', when: '1h ago', text: 'ok now i\u2019m doing it. starting tomorrow @maya.k', likes: 2, isMine: false },
  { user: 'sam', mood: 'sweat', when: '34m ago', text: '38\u00b0F is unhinged. proud of u', likes: 7, isMine: false },
];

function DLogDetail() {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: HC.bg, overflow: 'hidden', position: 'relative' }}>
      <DSidebar active="home" />
      <main style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {/* Faded feed behind */}
        <div style={{ position: 'absolute', inset: 0, padding: 32, opacity: 0.35, filter: 'blur(2px)' }}>
          <div style={{ height: 60, background: HC.line, borderRadius: HC.r2, marginBottom: 20 }}/>
          {[0, 1, 2].map((i) => <div key={i} style={{ height: 220, background: i === 1 ? HC.brand : HC.surface, border: `1.5px solid ${HC.ink}55`, borderRadius: HC.r3, marginBottom: 16 }}/>)}
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(15,11,26,0.4)', backdropFilter: 'blur(2px)' }}/>
        {/* Modal */}
        <div style={{
          position: 'absolute', inset: 0, padding: 28,
          display: 'grid', placeItems: 'center', zIndex: 2,
        }}>
          <div style={{
            width: '100%', maxWidth: 1080, height: '94%',
            background: HC.bg, border: `1px solid ${HC.line}`, borderRadius: HC.r4,
            boxShadow: HC.shadow, overflow: 'hidden',
            display: 'grid', gridTemplateColumns: '1.1fr 1fr',
          }}>
            {/* media */}
            <div style={{
              background: `radial-gradient(circle at 30% 25%, #2C2640 0%, ${HC.ink} 70%)`,
              position: 'relative', display: 'grid', placeItems: 'center',
              borderRight: `1px solid ${HC.line}`,
            }}>
              <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(105deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)` }}/>
              <Mascot size={240} mood="celebrate" bg={HC.ink} />
              <div style={{ position: 'absolute', top: 16, left: 16, background: HC.brand, color: HC.brandInk, padding: '6px 14px', borderRadius: 99, fontFamily: HC.display, fontSize: 16, fontWeight: 800, letterSpacing: -0.3, border: `1px solid ${HC.line}` }}>day 47</div>
              <div style={{ position: 'absolute', bottom: 20, left: 20, right: 20, padding: '12px 16px', background: 'rgba(15,11,26,0.7)', backdropFilter: 'blur(8px)', borderRadius: HC.r2, color: HC.bg, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.brand, letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase' }}>streak progress</div>
                  <div style={{ marginTop: 5, height: 5, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: '94%', height: '100%', background: HC.brand }}/>
                  </div>
                </div>
                <span style={{ fontFamily: HC.display, fontSize: 22, fontWeight: 800, letterSpacing: -0.4 }}>47 / 50</span>
              </div>
            </div>
            {/* details */}
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div style={{ padding: '16px 22px', borderBottom: `1px solid ${HC.ink}10`, display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: 22, background: HC.ink, display: 'grid', placeItems: 'center' }}>
                  <Mascot size={40} bg={HC.ink} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: HC.body, fontSize: 14, fontWeight: 700, color: HC.ink }}>maya k. <span style={{ fontSize: 11, color: HC.muted, fontWeight: 500 }}>(you)</span></div>
                  <div style={{ fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 500 }}>@maya.k · today · 6:42a · cold plunge · day 47</div>
                </div>
                <button style={{ background: HC.brand, color: HC.brandInk, border: `1px solid ${HC.line}`, padding: '6px 14px', borderRadius: 99, fontFamily: HC.mono, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>open habit</button>
                <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, fontWeight: 700, color: HC.ink, lineHeight: 1, padding: 4 }}>×</button>
              </div>
              <div style={{ padding: '20px 22px 0', fontSize: 16, color: HC.ink, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
                i bet i won't make it to day 50 — that's what i told myself. day 47. mascot can shut up now.{'\n\n'}38°F. 60 sec. before coffee.
              </div>
              <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 18, borderBottom: `1px solid ${HC.ink}10` }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: HC.mono, fontSize: 13, fontWeight: 700, color: HC.ink }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill={HC.accent} stroke={HC.accent} strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                  24
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: HC.mono, fontSize: 13, fontWeight: 700, color: HC.ink }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  4 comments
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center' }}>
                  {['celebrate', 'wink', 'smug'].map((m, i) => (
                    <div key={i} style={{ width: 24, height: 24, borderRadius: 12, marginLeft: i === 0 ? 0 : -8, background: HC.ink, border: `1.5px solid ${HC.bg}`, display: 'grid', placeItems: 'center' }}>
                      <Mascot size={22} mood={m} bg={HC.ink} />
                    </div>
                  ))}
                  <span style={{ fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 600, marginLeft: 8 }}>+21</span>
                </div>
              </div>
              {/* comments */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '14px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {D_COMMENTS.map((c, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 16, background: HC.ink, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        <Mascot size={28} mood={c.mood} bg={HC.ink} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ background: c.isMine ? HC.brand : HC.surface, border: `1.5px solid ${c.isMine ? HC.ink : HC.lineStrong}`, borderRadius: HC.r2, padding: '8px 12px' }}>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                            <span style={{ fontFamily: HC.body, fontSize: 12, fontWeight: 700, color: HC.ink }}>@{c.user}</span>
                            <span style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, fontWeight: 500 }}>{c.when}</span>
                          </div>
                          <div style={{ fontSize: 13, color: HC.ink, lineHeight: 1.4, marginTop: 2 }}>
                            {c.text.split(/(@\w+(?:\.\w+)?)/g).map((p, j) => p.startsWith('@') ? <span key={j} style={{ color: HC.accent, fontWeight: 700 }}>{p}</span> : <span key={j}>{p}</span>)}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 14, marginTop: 4, padding: '0 4px', fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>
                          <span>♥ {c.likes}</span>
                          <span>reply</span>
                        </div>
                        {c.replies && c.replies.map((r, k) => (
                          <div key={k} style={{ marginTop: 8, marginLeft: 30, display: 'flex', gap: 10 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 14, background: HC.ink, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                              <Mascot size={26} mood={r.mood} bg={HC.ink} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ background: r.isMine ? HC.brand : HC.surface, border: `1.5px solid ${r.isMine ? HC.ink : HC.lineStrong}`, borderRadius: HC.r2, padding: '6px 10px' }}>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                                  <span style={{ fontFamily: HC.body, fontSize: 11, fontWeight: 700, color: HC.ink }}>@{r.user}</span>
                                  <span style={{ fontFamily: HC.mono, fontSize: 8, color: HC.muted, fontWeight: 500 }}>{r.when}</span>
                                </div>
                                <div style={{ fontSize: 12, color: HC.ink, lineHeight: 1.4 }}>{r.text}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* composer */}
              <div style={{ padding: '12px 22px 16px', borderTop: `1px solid ${HC.ink}10`, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 15, background: HC.ink, display: 'grid', placeItems: 'center' }}>
                  <Mascot size={28} bg={HC.ink} />
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: 99, padding: '4px 4px 4px 14px' }}>
                  <input placeholder="add a cheer or a roast…" style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: HC.body, fontSize: 13, color: HC.ink }}/>
                  <button style={{ background: HC.accent, color: HC.accentInk, border: 'none', borderRadius: 99, padding: '6px 14px', fontFamily: HC.mono, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}>send</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

Object.assign(window, { DHome, DProfile, DHabitDetail, DLogDetail });
