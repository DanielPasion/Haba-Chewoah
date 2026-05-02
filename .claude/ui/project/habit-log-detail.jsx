// habit-log-detail.jsx — /habit-log/:id (own + others')
const { useState: uS_l } = React;

const LOG_OWN = {
  id: 'l1', habitName: 'cold plunge', habitId: 'h1',
  ownerName: 'maya k.', ownerHandle: 'maya.k', isOwn: true,
  day: 47, postedAt: 'today · 6:42a',
  mood: 'celebrate', media: 'photo',
  note: 'i bet i won\u2019t make it to day 50 — that\u2019s what i told myself. day 47. mascot can shut up now.\n\n38°F. 60 sec. before coffee.',
  likes: 24, likedByMe: false,
  duration: '00:60',
};

const LOG_OTHER = {
  id: 'l2', habitName: 'no doomscroll', habitId: 'h2',
  ownerName: 'kira w.', ownerHandle: 'kira', isOwn: false,
  day: 119, postedAt: '2h ago',
  mood: 'smug', media: 'photo',
  note: 'phone\u2019s been in the drawer since dinner. i used to feel anxious. now i just feel\u2026 quiet?\n\n119 days. weird flex but ok.',
  likes: 87, likedByMe: true,
};

const LIKERS = [
  { name: 'jules', mood: 'celebrate' },
  { name: 'theo', mood: 'wink' },
  { name: 'sam', mood: 'smug' },
];

const COMMENTS = [
  { id: 'c1', user: 'jules', mood: 'celebrate', when: '2h ago', text: 'absolute unit. i quit on day 4.', likes: 4, isMine: false, replies: [
    { id: 'c1r1', user: 'maya.k', mood: 'wink', when: '1h ago', text: 'come back. mascot needs the company.', likes: 1, isMine: true },
  ] },
  { id: 'c2', user: 'theo', mood: 'wink', when: '1h ago', text: 'ok now i\u2019m doing it. starting tomorrow @maya.k', likes: 2, isMine: false, replies: [] },
  { id: 'c3', user: 'sam', mood: 'sweat', when: '34m ago', text: '38°F is unhinged. proud of u', likes: 7, isMine: false, replies: [] },
];

// ─── Header ──────────────────────────────────
function LDHeader({ onBack, isOwn }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', position: 'sticky', top: 0, zIndex: 5,
      background: HC.bg,
    }}>
      <button onClick={onBack} aria-label="back" style={{
        background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: 99,
        width: 36, height: 36, display: 'grid', placeItems: 'center',
        cursor: 'pointer', boxShadow: HC.shadow,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase' }}>
        /habit-log/{isOwn ? 'l1' : 'l2'}
      </span>
      <button aria-label="more" style={{
        background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: 99,
        width: 36, height: 36, display: 'grid', placeItems: 'center',
        cursor: 'pointer', boxShadow: HC.shadow,
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: HC.ink, lineHeight: 1 }}>⋯</span>
      </button>
    </div>
  );
}

// ─── Author strip ──────────────────────────────
function AuthorStrip({ log, isOwn }) {
  return (
    <div style={{ padding: '6px 18px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 22,
        background: HC.ink, display: 'grid', placeItems: 'center',
        border: `1px solid ${HC.line}`, flexShrink: 0,
      }}>
        <Mascot size={40} bg={HC.ink} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: HC.body, fontSize: 14, fontWeight: 700, color: HC.ink }}>
          {log.ownerName} {isOwn && <span style={{ fontSize: 10, color: HC.muted, fontWeight: 500 }}>(you)</span>}
        </div>
        <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 500 }}>
          @{log.ownerHandle} · logged {log.postedAt}
        </div>
      </div>
      <button style={{
        background: HC.brand, color: HC.brandInk, border: `1px solid ${HC.line}`,
        padding: '6px 12px', borderRadius: 99,
        fontFamily: HC.mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
        cursor: 'pointer',
      }}>
        {log.habitName} · day {log.day}
      </button>
    </div>
  );
}

// ─── Hero media frame ──────────────────────────
function MediaHero({ log }) {
  const isVideo = log.media === 'video';
  return (
    <div style={{ margin: '0 18px', position: 'relative' }}>
      <div style={{
        aspectRatio: '4 / 5',
        borderRadius: HC.r4, overflow: 'hidden',
        background: `radial-gradient(circle at 30% 20%, #2C2640 0%, ${HC.ink} 60%)`,
        border: `1px solid ${HC.line}`, boxShadow: HC.shadow,
        position: 'relative', display: 'grid', placeItems: 'center',
      }}>
        {/* pretend photo: noisy stripes + mascot */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `repeating-linear-gradient(105deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)`,
        }}/>
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(ellipse at 70% 80%, ${HC.brand}33 0%, transparent 50%)`,
        }}/>
        <Mascot size={170} mood={log.mood} bg={HC.ink} />

        {/* day badge */}
        <div style={{
          position: 'absolute', top: 14, left: 14,
          background: HC.brand, color: HC.brandInk,
          padding: '6px 12px', borderRadius: 99,
          fontFamily: HC.display, fontSize: 14, fontWeight: 800, letterSpacing: -0.3,
          border: `1px solid ${HC.line}`,
        }}>
          day {log.day}
        </div>

        {/* media-type chip */}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          background: 'rgba(15,11,26,0.7)', color: HC.bg,
          padding: '4px 10px', borderRadius: 99,
          fontFamily: HC.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase',
          backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {isVideo ? '▶ video' : '📷 photo'} {log.duration && `· ${log.duration}`}
        </div>

        {/* progress meter */}
        <div style={{
          position: 'absolute', bottom: 16, left: 16, right: 16,
          background: 'rgba(15,11,26,0.7)', color: HC.bg,
          padding: '10px 14px', borderRadius: HC.r2,
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.brand, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>
              streak
            </div>
            <div style={{
              marginTop: 4, height: 5, background: 'rgba(255,255,255,0.15)',
              borderRadius: 99, overflow: 'hidden',
            }}>
              <div style={{ width: '94%', height: '100%', background: HC.brand }} />
            </div>
          </div>
          <span style={{ fontFamily: HC.display, fontSize: 18, fontWeight: 800, color: HC.bg, letterSpacing: -0.4 }}>
            {log.day}/50
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Note (caption) ────────────────────────────
function Caption({ log }) {
  return (
    <div style={{ padding: '18px 22px 4px', fontSize: 16, color: HC.ink, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
      {log.note}
    </div>
  );
}

// ─── Reactions bar ────────────────────────────
function Reactions({ log, isOwn }) {
  const [liked, setLiked] = uS_l(log.likedByMe);
  return (
    <div style={{ padding: '14px 22px 16px', display: 'flex', alignItems: 'center', gap: 16 }}>
      <button onClick={() => setLiked((v) => !v)} style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, padding: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24"
          fill={liked ? HC.accent : 'none'} stroke={liked ? HC.accent : HC.ink}
          strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span style={{ fontFamily: HC.mono, fontSize: 13, fontWeight: 700, color: HC.ink }}>
          {log.likes + (liked && !log.likedByMe ? 1 : 0)}
        </span>
      </button>
      <button style={{
        background: 'transparent', border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 6, padding: 0,
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span style={{ fontFamily: HC.mono, fontSize: 13, fontWeight: 700, color: HC.ink }}>
          {COMMENTS.length}
        </span>
      </button>
      {/* liker stack */}
      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 0 }}>
        {LIKERS.map((u, i) => (
          <div key={u.name} style={{
            width: 22, height: 22, borderRadius: 11, marginLeft: i === 0 ? 0 : -8,
            background: HC.ink, border: `1.5px solid ${HC.bg}`,
            display: 'grid', placeItems: 'center', overflow: 'hidden',
          }}>
            <Mascot size={20} mood={u.mood} bg={HC.ink} />
          </div>
        ))}
        <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600, marginLeft: 6 }}>
          +{log.likes - LIKERS.length}
        </span>
      </div>
    </div>
  );
}

// ─── Comment ─────────────────────────────────
function Comment({ c, depth = 0, isOwnPost }) {
  return (
    <div style={{ paddingLeft: depth * 36 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        <div style={{
          width: 32, height: 32, borderRadius: 16,
          background: HC.ink, display: 'grid', placeItems: 'center',
          border: `1px solid ${HC.line}`, flexShrink: 0,
        }}>
          <Mascot size={28} mood={c.mood} bg={HC.ink} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            background: c.isMine ? HC.brand : HC.surface,
            border: `1.5px solid ${c.isMine ? HC.ink : HC.lineStrong}`,
            borderRadius: HC.r2, padding: '8px 12px',
          }}>
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', marginBottom: 2 }}>
              <span style={{ fontFamily: HC.body, fontSize: 12, fontWeight: 700, color: HC.ink }}>@{c.user}</span>
              {c.user === 'maya.k' && isOwnPost && (
                <span style={{ fontFamily: HC.mono, fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: HC.ink, color: HC.brand, letterSpacing: 0.5, textTransform: 'uppercase' }}>OP</span>
              )}
              <span style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, fontWeight: 500 }}>{c.when}</span>
            </div>
            <div style={{ fontSize: 13, color: HC.ink, lineHeight: 1.4 }}>
              {c.text.split(/(@\w+(?:\.\w+)?)/g).map((p, i) =>
                p.startsWith('@')
                  ? <span key={i} style={{ color: HC.accent, fontWeight: 700 }}>{p}</span>
                  : <span key={i}>{p}</span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 14, marginTop: 4, padding: '0 4px',
            fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>
            <button style={cmtBtn}>♥ {c.likes}</button>
            <button style={cmtBtn}>reply</button>
            {c.isMine && <button style={cmtBtn}>delete</button>}
          </div>
          {c.replies && c.replies.map((r) => (
            <div key={r.id} style={{ marginTop: 8 }}>
              <Comment c={r} depth={1} isOwnPost={isOwnPost} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
const cmtBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
  fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', fontWeight: 'inherit',
};

// ─── Comment composer ─────────────────────────
function Composer() {
  const [v, setV] = uS_l('');
  return (
    <div style={{
      position: 'sticky', bottom: 0,
      background: HC.bg, padding: '12px 18px 14px',
      borderTop: `1px solid ${HC.ink}15`,
      display: 'flex', gap: 10, alignItems: 'center',
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 16,
        background: HC.ink, display: 'grid', placeItems: 'center',
        border: `1px solid ${HC.line}`, flexShrink: 0,
      }}>
        <Mascot size={28} bg={HC.ink} />
      </div>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', gap: 6,
        background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: 99,
        padding: '4px 4px 4px 14px',
      }}>
        <input
          value={v} onChange={(e) => setV(e.target.value)}
          placeholder="add a cheer or a roast…"
          style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontFamily: HC.body, fontSize: 13, color: HC.ink }}
        />
        <button style={{
          background: v ? HC.accent : HC.lineStrong,
          color: v ? HC.accentInk : HC.muted,
          border: 'none', borderRadius: 99,
          padding: '6px 14px', fontFamily: HC.mono, fontSize: 11, fontWeight: 700,
          cursor: 'pointer',
        }}>send</button>
      </div>
    </div>
  );
}

// ─── Habit-log Detail ─────────────────────────
function HabitLogDetail({ isOwn = true, onBack = () => {} }) {
  const log = isOwn ? LOG_OWN : LOG_OTHER;
  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <LDHeader onBack={onBack} isOwn={isOwn} />
        <AuthorStrip log={log} isOwn={isOwn} />
        <MediaHero log={log} />
        <Caption log={log} />
        <Reactions log={log} isOwn={isOwn} />
        <div style={{ padding: '4px 18px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontFamily: HC.display, fontSize: 16, fontWeight: 700, color: HC.ink, letterSpacing: -0.4 }}>
            {COMMENTS.length} comments
          </span>
          <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>most liked ▾</span>
        </div>
        <div style={{ padding: '8px 18px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {COMMENTS.map((c) => <Comment key={c.id} c={c} isOwnPost={isOwn} />)}
        </div>
      </div>
      <Composer />
    </div>
  );
}

Object.assign(window, { HabitLogDetail });
