// profile-page.jsx — /profile/:id (own + other people's)
const { useState } = React;

// ─── Mock data ─────────────────────────────────────────
const ME = {
  id: 'me', username: 'maya.k', display: 'maya k.',
  bio: 'cold plunger · book reader · sworn enemy of tiktok',
  followers: 384, following: 162,
  topStreak: 47, totalLogs: 612, betsWon: 162, betsLost: 11,
};
const STRANGER = {
  id: 'kira', username: 'kira', display: 'kira w.',
  bio: 'no doomscroll. ever. (i bet you won\'t either)',
  followers: 1284, following: 89,
  topStreak: 119, totalLogs: 1290, betsWon: 401, betsLost: 4,
  isFollowing: false,
};

const HABITS = [
  { id: 'h1', name: 'cold plunge', day: 47, freq: 'daily', mood: 'celebrate', mode: 'public', completion: 96, lastLog: '12m ago' },
  { id: 'h2', name: 'no doomscroll', day: 12, freq: 'daily', mood: 'smug', mode: 'public', completion: 100, lastLog: '2h ago' },
  { id: 'h3', name: 'journal · 1 page', day: 89, freq: 'daily', mood: 'default', mode: 'folder', completion: 88, lastLog: 'yesterday' },
  { id: 'h4', name: 'duolingo french', day: 5, freq: '5x/week', mood: 'sweat', mode: 'folder', completion: 71, lastLog: '3h ago' },
];

const LOGS = [
  { id: 'l1', habit: 'cold plunge', day: 47, when: '12m ago', note: '"I bet I won\'t" → I did. day 47 ❄️', mood: 'celebrate', media: 'photo', likes: 24, comments: 6 },
  { id: 'l2', habit: 'no doomscroll', day: 12, when: '2h ago', note: 'phone facedown all morning. small victories.', mood: 'smug', media: 'photo', likes: 11, comments: 2 },
  { id: 'l3', habit: 'duolingo french', day: 5, when: '3h ago', note: 'je suis fatiguée mais je suis ici', mood: 'sweat', media: 'note', likes: 4, comments: 1 },
  { id: 'l4', habit: 'cold plunge', day: 46, when: 'yesterday', note: '14 sec PR. mascot lied, it gets easier.', mood: 'celebrate', media: 'video', likes: 38, comments: 9 },
  { id: 'l5', habit: 'journal · 1 page', day: 89, when: 'yesterday', note: '🔒 private', mood: 'default', media: 'note', likes: 0, comments: 0, locked: true },
];

// ─── Avatar (uses Mascot for fallback, shows initial otherwise) ──
function Avatar({ user, size = 96 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: HC.brand, color: HC.brandInk,
      display: 'grid', placeItems: 'center',
      fontFamily: HC.display, fontWeight: 800, fontSize: size * 0.42,
      border: `1px solid ${HC.line}`, overflow: 'hidden', flexShrink: 0,
      boxShadow: HC.shadow,
    }}>
      <Mascot size={size * 0.92} bg={HC.ink} />
    </div>
  );
}

// ─── Search bar (fixed at top) ────────────────────────
function SearchBar() {
  const [q, setQ] = useState('');
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', borderRadius: HC.r3,
      background: HC.surface, border: `1.5px solid ${HC.ink}22`,
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={HC.muted} strokeWidth="2.2" strokeLinecap="round">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
      <input
        value={q} onChange={(e) => setQ(e.target.value)}
        placeholder="search users…"
        style={{
          flex: 1, border: 'none', outline: 'none', background: 'transparent',
          fontFamily: HC.body, fontSize: 14, color: HC.ink,
        }}
      />
      {q && (
        <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>
          ⌘K
        </span>
      )}
    </div>
  );
}

// ─── Header (username + settings/back) ───────────────
function ProfileHeader({ isOwn, onBack }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 20px',
    }}>
      {isOwn ? (
        <span style={{ fontFamily: HC.mono, fontSize: 11, letterSpacing: 1.5, color: HC.muted, textTransform: 'uppercase', fontWeight: 600 }}>
          /profile/me
        </span>
      ) : (
        <button onClick={onBack} style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6, fontFamily: HC.mono,
          fontSize: 11, color: HC.muted, fontWeight: 600, textTransform: 'uppercase',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          back
        </button>
      )}
      {isOwn ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
      ) : (
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontSize: 22, color: HC.ink, lineHeight: 1, padding: 0,
        }}>⋯</button>
      )}
    </div>
  );
}

// ─── Identity card (avatar + name + bio + counts + CTA) ──
function IdentityCard({ user, isOwn }) {
  const [following, setFollowing] = useState(user.isFollowing || false);
  return (
    <div style={{ padding: '8px 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
        <Avatar user={user} size={88} />
        <div style={{ flex: 1, paddingTop: 4 }}>
          <div style={{ fontFamily: HC.display, fontSize: 24, fontWeight: 800, letterSpacing: -0.8, color: HC.ink, lineHeight: 1.1 }}>
            {user.display}
          </div>
          <div style={{ fontFamily: HC.mono, fontSize: 12, color: HC.muted, fontWeight: 500, marginTop: 2 }}>
            @{user.username}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 14, color: HC.ink, lineHeight: 1.45, marginTop: 12 }}>
        {user.bio}
      </div>

      {/* counts */}
      <div style={{ display: 'flex', gap: 18, marginTop: 14, flexWrap: 'wrap' }}>
        <Stat n={user.followers} l="followers" />
        <Stat n={user.following} l="following" />
        <Stat n={user.topStreak} l="top streak" />
        <Stat n={user.betsWon} l="bets won" />
      </div>

      {/* CTA */}
      <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
        {isOwn ? (
          <>
            <button style={btnSecondary({ flex: 1 })}>edit profile</button>
            <button style={btnSecondary()} aria-label="share">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13"/></svg>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setFollowing((v) => !v)}
              style={following ? btnSecondary({ flex: 1 }) : btnPrimary({ flex: 1 })}
            >
              {following ? '✓ following' : '+ follow'}
            </button>
            <button style={btnSecondary()}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </button>
            <button style={btnSecondary()} aria-label="chew out before EOD" title="chew out before end of day">
              <span style={{ fontFamily: HC.mono, fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>
                chew out
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const btnPrimary = (extra = {}) => ({
  background: HC.ink, color: HC.brand, border: 'none',
  fontFamily: HC.body, fontWeight: 700, fontSize: 13,
  padding: '11px 16px', borderRadius: HC.r2, cursor: 'pointer',
  ...extra,
});
const btnSecondary = (extra = {}) => ({
  background: 'transparent', color: HC.ink,
  border: `1px solid ${HC.line}`,
  fontFamily: HC.body, fontWeight: 700, fontSize: 13,
  padding: '10px 14px', borderRadius: HC.r2, cursor: 'pointer',
  ...extra,
});

function Stat({ n, l }) {
  return (
    <div>
      <div style={{ fontFamily: HC.display, fontSize: 18, fontWeight: 800, color: HC.ink, letterSpacing: -0.4, lineHeight: 1 }}>
        {n.toLocaleString()}
      </div>
      <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>{l}</div>
    </div>
  );
}

// ─── Tabs ───────────────────────────────────────────
function Tabs({ tab, setTab }) {
  return (
    <div style={{
      display: 'flex', padding: '0 20px', gap: 4,
      borderBottom: `1px solid ${HC.ink}15`,
    }}>
      {[
        { id: 'habits', label: 'habits', count: HABITS.length },
        { id: 'logs', label: 'logs', count: LOGS.length },
      ].map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          style={{
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
          {tab === t.id && (
            <div style={{
              position: 'absolute', bottom: -1, left: 8, right: 8,
              height: 3, background: HC.ink, borderRadius: 2,
            }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Habit card ────────────────────────────────────
function HabitCard({ h, isOwn }) {
  return (
    <div style={{
      borderRadius: HC.r3, padding: 14,
      background: h.mode === 'public' ? HC.brand : HC.surface,
      border: `1px solid ${HC.line}`, color: HC.ink,
      display: 'flex', flexDirection: 'column', gap: 10,
      boxShadow: HC.shadow, position: 'relative',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <Mascot size={36} mood={h.mood} />
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={{
            fontFamily: HC.mono, fontSize: 8, padding: '2px 6px', borderRadius: 4,
            background: h.mode === 'public' ? HC.ink : HC.bg,
            color: h.mode === 'public' ? HC.brand : HC.muted,
            letterSpacing: 1, fontWeight: 700, textTransform: 'uppercase',
          }}>{h.mode === 'public' ? '· PUBLIC' : '🔒 FOLDER'}</span>
          {isOwn && (
            <button aria-label="more" style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '0 4px', fontSize: 14, color: HC.ink, lineHeight: 1, fontWeight: 700,
            }}>⋯</button>
          )}
        </div>
      </div>
      <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{h.name}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{ fontFamily: HC.display, fontSize: 26, fontWeight: 800, letterSpacing: -1, lineHeight: 1 }}>{h.day}</span>
            <span style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, textTransform: 'uppercase', fontWeight: 600 }}>days</span>
          </div>
          <div style={{ fontFamily: HC.mono, fontSize: 9, color: h.mode === 'public' ? `${HC.ink}aa` : HC.muted, marginTop: 2, fontWeight: 600 }}>
            {h.freq.toUpperCase()} · {h.completion}% rate
          </div>
        </div>
        <div style={{ fontFamily: HC.mono, fontSize: 9, color: h.mode === 'public' ? `${HC.ink}99` : HC.muted, fontWeight: 600, textAlign: 'right' }}>
          last log<br/>{h.lastLog}
        </div>
      </div>
    </div>
  );
}

// ─── Log card ───────────────────────────────────────
function LogCard({ log, isOwn }) {
  if (log.locked && !isOwn) return null;
  return (
    <div style={{
      background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r3,
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
    }}>
      <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <Mascot size={28} mood={log.mood} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: HC.body, fontSize: 13, fontWeight: 700, color: HC.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {log.habit} <span style={{ color: HC.muted, fontWeight: 500 }}>· day {log.day}</span>
            </div>
            <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
              {log.when}
            </div>
          </div>
        </div>
        {log.locked && (
          <span style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>🔒 folder</span>
        )}
      </div>
      {log.media !== 'note' && !log.locked && (
        <div style={{
          margin: '0 14px', height: 140, borderRadius: HC.r2,
          background: `repeating-linear-gradient(135deg, ${HC.muted}1f 0 8px, transparent 8px 16px), ${HC.bg}`,
          display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <Mascot size={56} mood={log.mood} />
          <div style={{
            position: 'absolute', bottom: 6, left: 8, fontFamily: HC.mono, fontSize: 9,
            padding: '2px 6px', borderRadius: 4, background: 'rgba(27,23,38,0.7)', color: HC.bg,
            textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600,
          }}>{log.media}</div>
        </div>
      )}
      <div style={{ padding: '10px 14px 12px', fontSize: 13, color: HC.ink, lineHeight: 1.4 }}>
        {log.note}
      </div>
      {!log.locked && (
        <div style={{
          padding: '0 14px 12px', display: 'flex', alignItems: 'center', gap: 14,
          fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 600,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={HC.accent} stroke={HC.accent} strokeWidth="1.6"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            {log.likes}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            {log.comments}
          </span>
          {isOwn && (
            <button style={{
              marginLeft: 'auto', background: 'transparent', border: 'none', cursor: 'pointer',
              fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 600,
            }}>delete</button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Tab content ─────────────────────────────────
function HabitsGrid({ isOwn }) {
  return (
    <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {HABITS.map((h) => <HabitCard key={h.id} h={h} isOwn={isOwn} />)}
      {isOwn && (
        <button style={{
          gridColumn: '1 / -1',
          padding: '14px', borderRadius: HC.r3,
          border: `1.5px dashed ${HC.ink}55`, background: 'transparent',
          fontFamily: HC.body, fontWeight: 700, fontSize: 14, color: HC.muted,
          cursor: 'pointer',
        }}>
          + new habit
        </button>
      )}
    </div>
  );
}

function LogsList({ isOwn }) {
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {LOGS.map((l) => <LogCard key={l.id} log={l} isOwn={isOwn} />)}
    </div>
  );
}

// ─── Bottom tab bar ─────────────────────────────
function ProfileTabBar({ active = 'me' }) {
  return (
    <div style={{
      borderTop: `1px solid ${HC.line}`, background: HC.surface,
      padding: '10px 16px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {[
        { id: 'feed', label: 'home', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z' },
        { id: 'log', label: '', plus: true },
        { id: 'me', label: 'me', d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z' },
      ].map((t) => t.plus ? (
        <button key={t.id} style={{
          width: 56, height: 56, borderRadius: 28,
          background: HC.brand, border: `1px solid ${HC.line}`,
          marginTop: -22, cursor: 'pointer', display: 'grid', placeItems: 'center',
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

// ─── Profile page (composed) ────────────────────
function ProfilePage({ isOwn = true, defaultTab = 'habits' }) {
  const [tab, setTab] = useState(defaultTab);
  const user = isOwn ? ME : STRANGER;
  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <ProfileHeader isOwn={isOwn} />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ padding: '0 20px 14px' }}>
          <SearchBar />
        </div>
        <IdentityCard user={user} isOwn={isOwn} />
        <Tabs tab={tab} setTab={setTab} />
        {tab === 'habits' ? <HabitsGrid isOwn={isOwn} /> : <LogsList isOwn={isOwn} />}
        <div style={{ height: 40 }} />
      </div>
      <ProfileTabBar />
    </div>
  );
}

Object.assign(window, { ProfilePage });
