// pwa-screens.jsx — Mobile PWA / iOS PWA screens for Haba-Chewoah

// ─── Splash Screen ─────────────────────────────────────
function SplashScreen() {
  return (
    <div style={{
      width: '100%', height: '100%', background: HC.ink, color: HC.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: HC.body, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', background: `radial-gradient(circle at 50% 100%, ${HC.brand}22, transparent 60%)` }} />
      <Mascot size={140} />
      <div style={{ marginTop: 28 }}>
        <Wordmark size={0.55} color={HC.bg} accent={HC.brand} />
      </div>
      <div style={{
        marginTop: 14, fontFamily: HC.mono, fontSize: 11, letterSpacing: 2,
        opacity: 0.5, textTransform: 'uppercase',
      }}>i·bet·cha·won't</div>
      <div style={{ position: 'absolute', bottom: 80, display: 'flex', gap: 8 }}>
        {[0,1,2].map(i => (
          <div key={i} style={{ width: 8, height: 8, borderRadius: 4, background: i === 0 ? HC.brand : HC.muted, opacity: i === 0 ? 1 : 0.3 }} />
        ))}
      </div>
    </div>
  );
}

// ─── Feed (Home) ───────────────────────────────────────
function FeedHeader({ unread = 3 }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 20px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AppIcon size={36} />
        <div style={{ fontFamily: HC.display, fontSize: 22, fontWeight: 800, letterSpacing: -0.8, color: HC.ink }}>
          haba<span style={{ color: HC.accent }}>-</span>chewoah
        </div>
      </div>
      <div style={{ position: 'relative' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 20, background: HC.surface,
          border: `1px solid ${HC.line}`, display: 'grid', placeItems: 'center',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.5" strokeLinecap="round">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/>
          </svg>
        </div>
        {unread > 0 && (
          <div style={{
            position: 'absolute', top: -2, right: -2,
            background: HC.accent, color: '#fff',
            fontSize: 10, fontWeight: 700, fontFamily: HC.mono,
            padding: '2px 5px', borderRadius: 8, minWidth: 16, textAlign: 'center',
          }}>{unread}</div>
        )}
      </div>
    </div>
  );
}

function StreakBar() {
  return (
    <div style={{
      margin: '0 20px 16px', padding: '14px 16px', borderRadius: HC.r3,
      background: HC.brand, color: HC.brandInk,
      display: 'flex', alignItems: 'center', gap: 14, position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', right: -10, top: -10, opacity: 0.15 }}>
        <Mascot size={90} bg={HC.ink} />
      </div>
      <div style={{ flex: 1, position: 'relative' }}>
        <div style={{ fontFamily: HC.mono, fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.65, fontWeight: 600 }}>your streak</div>
        <div style={{ fontFamily: HC.display, fontSize: 36, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1 }}>day 47</div>
        <div style={{ fontSize: 12, marginTop: 4, fontWeight: 500 }}>cold plunge · log before 11pm</div>
      </div>
      <button style={{
        background: HC.ink, color: HC.brand, border: 'none',
        fontFamily: HC.body, fontWeight: 700, fontSize: 13,
        padding: '12px 16px', borderRadius: HC.r2, cursor: 'pointer',
        whiteSpace: 'nowrap', position: 'relative', zIndex: 1,
      }}>+ log</button>
    </div>
  );
}

function FeedCard({ name, day, habit, ago, photo, mood = 'default', betCount = 0, photoLabel }) {
  return (
    <div style={{
      margin: '0 20px 16px', borderRadius: HC.r4, background: HC.surface,
      border: `1px solid ${HC.line}`, overflow: 'hidden',
    }}>
      <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 20, background: HC.ink,
          display: 'grid', placeItems: 'center', color: HC.brand,
          fontFamily: HC.display, fontWeight: 800, fontSize: 16,
        }}>{name[0].toUpperCase()}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: HC.body, fontWeight: 700, fontSize: 14, color: HC.ink }}>
            {name} <span style={{ color: HC.muted, fontWeight: 500 }}>· day {day}</span>
          </div>
          <div style={{ fontSize: 12, color: HC.muted }}>{habit} · {ago}</div>
        </div>
        <div style={{
          fontFamily: HC.mono, fontSize: 10, fontWeight: 700,
          padding: '4px 8px', borderRadius: 99, background: HC.brand, color: HC.brandInk,
          letterSpacing: 0.5,
        }}>STREAK</div>
      </div>
      {/* photo */}
      <div style={{
        margin: '0 16px', height: 200, borderRadius: HC.r2,
        background: photo || `repeating-linear-gradient(135deg, ${HC.muted}22 0 8px, transparent 8px 16px), ${HC.bg}`,
        display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <Mascot size={70} mood={mood} />
        <div style={{
          position: 'absolute', bottom: 8, left: 8, fontFamily: HC.mono, fontSize: 9,
          padding: '3px 6px', borderRadius: 4, background: 'rgba(27,23,38,0.7)', color: HC.bg,
          textTransform: 'uppercase', letterSpacing: 1,
        }}>{photoLabel || 'photo · log'}</div>
      </div>
      <div style={{ padding: '12px 16px 14px' }}>
        <div style={{ fontSize: 13, color: HC.ink, lineHeight: 1.4, marginBottom: 12 }}>
          "I bet I won't" → <strong>I did.</strong> <span style={{ color: HC.muted }}>day {day}, baby ❄️</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{
            flex: 1, padding: '10px 12px', borderRadius: HC.r2, border: 'none',
            background: HC.accent, color: HC.accentInk,
            fontFamily: HC.body, fontWeight: 700, fontSize: 12, letterSpacing: 0.3, cursor: 'pointer',
          }}>i bet you won't {betCount > 0 && <span style={{ opacity: 0.85 }}>· {betCount}</span>}</button>
          <button style={{
            padding: '10px 14px', borderRadius: HC.r2,
            background: 'transparent', color: HC.ink,
            border: `1px solid ${HC.line}`,
            fontFamily: HC.body, fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}>👀</button>
          <button style={{
            padding: '10px 14px', borderRadius: HC.r2,
            background: 'transparent', color: HC.ink,
            border: `1px solid ${HC.line}`,
            fontFamily: HC.body, fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}>💬</button>
        </div>
      </div>
    </div>
  );
}

function TabBar({ active = 'feed' }) {
  const tabs = [
    { id: 'feed', label: 'feed', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z' },
    { id: 'streaks', label: 'streaks', d: 'M5 19l3-3 3 3 5-5 3 3M3 4h18M3 14h6' },
    { id: 'log', label: '', d: 'plus' },
    { id: 'bets', label: 'bets', d: 'M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83' },
    { id: 'me', label: 'me', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z' },
  ];
  return (
    <div style={{
      borderTop: `1px solid ${HC.line}`, background: HC.surface,
      padding: '10px 16px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {tabs.map(t => t.d === 'plus' ? (
        <button key={t.id} style={{
          width: 56, height: 56, borderRadius: 28,
          background: HC.brand, color: HC.brandInk,
          border: `1px solid ${HC.line}`,
          display: 'grid', placeItems: 'center',
          marginTop: -22, cursor: 'pointer',
          boxShadow: HC.shadow,
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </button>
      ) : (
        <div key={t.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, color: active === t.id ? HC.ink : HC.muted, opacity: active === t.id ? 1 : 0.6 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={t.d}/></svg>
          <span style={{ fontFamily: HC.mono, fontSize: 9, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{t.label}</span>
        </div>
      ))}
    </div>
  );
}

function FeedScreen() {
  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <FeedHeader />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <StreakBar />
        <FeedCard name="maya" day={47} habit="cold plunge" ago="12m" mood="celebrate" betCount={8} photoLabel="photo · maya in tub" />
        <FeedCard name="dev" day={3} habit="run 5k" ago="1h" mood="sweat" betCount={2} photoLabel="photo · trail selfie" />
        <FeedCard name="kira" day={119} habit="no doomscroll" ago="3h" mood="smug" betCount={31} photoLabel="photo · phone facedown" />
      </div>
      <TabBar active="feed" />
    </div>
  );
}

// ─── Profile ───────────────────────────────────────────
function ProfileScreen() {
  const habits = [
    { name: 'cold plunge', day: 47, mood: 'celebrate', mode: 'public' },
    { name: 'no doomscroll', day: 12, mood: 'smug', mode: 'public' },
    { name: 'journal · 1 page', day: 89, mood: 'default', mode: 'folder' },
    { name: 'duolingo french', day: 5, mood: 'sweat', mode: 'folder' },
  ];
  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontFamily: HC.mono, fontSize: 11, letterSpacing: 1.5, color: HC.muted, textTransform: 'uppercase', fontWeight: 600 }}>@maya</div>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <Mascot size={88} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: HC.display, fontSize: 28, fontWeight: 800, letterSpacing: -1, color: HC.ink }}>maya k.</div>
            <div style={{ fontSize: 13, color: HC.muted, marginTop: 2 }}>cold plunger · book reader · sworn enemy of tiktok</div>
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 8 }}>
            {[
              { n: '4', l: 'streaks' }, { n: '162', l: 'bets won' }, { n: '11', l: 'bets lost' }, { n: '47', l: 'top streak' },
            ].map(s => (
              <div key={s.l} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: HC.display, fontSize: 22, fontWeight: 800, color: HC.ink, letterSpacing: -0.5 }}>{s.n}</div>
                <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* habit grid */}
        <div style={{ padding: '0 20px', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: HC.display, fontSize: 18, fontWeight: 700, color: HC.ink, letterSpacing: -0.5 }}>habits</div>
          <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>4 active · 0 broken</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: '0 20px 24px' }}>
          {habits.map(h => (
            <div key={h.name} style={{
              borderRadius: HC.r3, padding: 14,
              background: h.mode === 'public' ? HC.brand : HC.surface,
              border: `1px solid ${HC.line}`,
              color: HC.ink,
              display: 'flex', flexDirection: 'column', gap: 8,
              boxShadow: HC.shadow,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Mascot size={36} mood={h.mood} />
                <div style={{
                  fontFamily: HC.mono, fontSize: 8, padding: '2px 6px', borderRadius: 4,
                  background: h.mode === 'public' ? HC.ink : HC.bg,
                  color: h.mode === 'public' ? HC.brand : HC.muted,
                  letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase',
                }}>{h.mode === 'public' ? '· PUBLIC' : '🔒 FOLDER'}</div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13, lineHeight: 1.2 }}>{h.name}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontFamily: HC.display, fontSize: 24, fontWeight: 800, letterSpacing: -1 }}>{h.day}</span>
                <span style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, textTransform: 'uppercase', fontWeight: 600 }}>days</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <TabBar active="me" />
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────
function EmptyStateScreen() {
  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <FeedHeader unread={0} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 40px', textAlign: 'center', gap: 18 }}>
        <Mascot size={120} mood="default" />
        <div style={{ fontFamily: HC.display, fontSize: 28, fontWeight: 800, letterSpacing: -1, color: HC.ink, lineHeight: 1.1 }}>
          no streaks yet.
        </div>
        <div style={{ fontSize: 14, color: HC.muted, lineHeight: 1.5, maxWidth: 280 }}>
          start one. dare a friend. or stay a coward<br/>— we won't tell anyone (we will).
        </div>
        <button style={{
          marginTop: 8, background: HC.brand, color: HC.brandInk,
          border: `1px solid ${HC.line}`, padding: '14px 24px',
          fontFamily: HC.body, fontWeight: 700, fontSize: 14,
          borderRadius: HC.r2, cursor: 'pointer',
          boxShadow: HC.shadow,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          + start a streak
          <span style={{ fontFamily: HC.mono, fontSize: 10, opacity: 0.7 }}>(I bet you will)</span>
        </button>
        <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, marginTop: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: 600 }}>
          ⌥ or import from Apple Health
        </div>
      </div>
      <TabBar active="feed" />
    </div>
  );
}

// ─── Push Notification (lock screen) ───────────────────
function PushNotifScreen() {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(180deg, #1a0e2e 0%, #2a1a3a 100%)`,
      color: HC.bg, fontFamily: HC.body,
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ paddingTop: 68, textAlign: 'center', color: '#fff', fontWeight: 200 }}>
        <div style={{ fontSize: 80, fontFamily: '-apple-system, "SF Pro"', fontWeight: 200, lineHeight: 1 }}>9:41</div>
        <div style={{ fontSize: 18, fontWeight: 400, opacity: 0.9 }}>Thursday, May 1</div>
      </div>

      <div style={{ flex: 1, padding: '40px 14px 0', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Notification 1 — accountability dare */}
        <div style={{
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)',
          borderRadius: HC.r3, padding: '14px 16px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <AppIcon size={38} radius={9} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
              <span style={{ fontWeight: 600 }}>HABA-CHEWOAH</span>
              <span style={{ opacity: 0.65 }}>now</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>maya bet you won't 😈</div>
            <div style={{ fontSize: 13, opacity: 0.88, lineHeight: 1.35 }}>
              "no doomscroll · day 2" — log before 11pm or eat the L
            </div>
          </div>
        </div>
        {/* Notification 2 — streak reminder */}
        <div style={{
          background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(20px)',
          borderRadius: HC.r3, padding: '14px 16px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <AppIcon size={38} radius={9} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
              <span style={{ fontWeight: 600 }}>HABA-CHEWOAH</span>
              <span style={{ opacity: 0.65 }}>3h ago</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>day 47 is in jeopardy</div>
            <div style={{ fontSize: 13, opacity: 0.88, lineHeight: 1.35 }}>
              cold plunge · you've got 4h. don't make us send the smug face.
            </div>
          </div>
        </div>
        {/* Notification 3 — bet won */}
        <div style={{
          background: 'rgba(216,255,60,0.92)', color: HC.ink,
          borderRadius: HC.r3, padding: '14px 16px',
          display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: HC.ink, display: 'grid', placeItems: 'center', overflow: 'hidden' }}>
            <Mascot size={36} mood="celebrate" bg={HC.ink} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 2 }}>
              <span style={{ fontWeight: 700 }}>HABA-CHEWOAH</span>
              <span style={{ opacity: 0.55 }}>yesterday</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>you won 3 bets · +12 cred</div>
            <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.35 }}>
              dev, kira, and 1 other thought you'd quit. they were wrong.
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 0 40px', textAlign: 'center', color: '#fff', opacity: 0.7, fontSize: 13 }}>
        swipe up to open
      </div>
    </div>
  );
}

// ─── iOS Home Screen with app icon ─────────────────────
function HomeScreenScreen() {
  const apps = [
    { c: '#34C759', label: 'Messages', g: '💬' },
    { c: '#007AFF', label: 'Mail', g: '✉️' },
    { c: '#FF9500', label: 'Phone', g: '📞' },
    { c: '#5856D6', label: 'Calendar', g: '📅' },
    { c: '#FF3B30', label: 'Music', g: '♪' },
    { c: '#000', label: 'X', g: '𝕏' },
    { c: 'haba', label: 'Haba-Chewoah', g: '' },
    { c: '#FF2D55', label: 'Health', g: '♥' },
  ];
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(170deg, #6B4FB8 0%, #B85FA8 50%, #FF9F6F 100%)',
      fontFamily: '-apple-system, "SF Pro", system-ui',
      display: 'flex', flexDirection: 'column', position: 'relative',
    }}>
      <div style={{ paddingTop: 16, textAlign: 'center', color: '#fff', fontWeight: 300 }}>
        <div style={{ fontSize: 56, fontWeight: 200, lineHeight: 1 }}>9:41</div>
        <div style={{ fontSize: 14, opacity: 0.95 }}>Thursday, May 1</div>
      </div>
      <div style={{ flex: 1, padding: '28px 22px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18, alignContent: 'flex-start' }}>
        {apps.map((a, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            {a.c === 'haba' ? (
              <AppIcon size={62} radius={14} />
            ) : (
              <div style={{ width: 62, height: 62, borderRadius: 14, background: a.c, display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', color: '#fff', fontSize: 28, fontWeight: 700 }}>
                {a.g}
              </div>
            )}
            <div style={{ fontSize: 11, color: '#fff', textShadow: '0 1px 2px rgba(0,0,0,0.4)', textAlign: 'center', maxWidth: 70, lineHeight: 1.1, fontWeight: a.c === 'haba' ? 700 : 400 }}>
              {a.label}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        margin: '0 18px 18px', padding: 12, borderRadius: HC.r4,
        background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(20px)',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18,
      }}>
        {[
          { c: '#34C759', g: '📞' },
          { c: '#0099FF', g: '🌐' },
          { c: '#FF3B30', g: '📷' },
          { c: '#000', g: '♪' },
        ].map((a, i) => (
          <div key={i} style={{ width: 54, height: 54, borderRadius: 12, background: a.c, display: 'grid', placeItems: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.2)', color: '#fff', fontSize: 24 }}>
            {a.g}
          </div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { SplashScreen, FeedScreen, ProfileScreen, EmptyStateScreen, PushNotifScreen, HomeScreenScreen });
