// home-feed.jsx — / (authenticated home)
const { useState: uS_f } = React;

const FEED = [
  {
    id: 'f1', user: 'kira w.', handle: 'kira', mood: 'smug',
    habit: 'no doomscroll', day: 119, when: '12m',
    note: 'phone\u2019s been in the drawer since dinner. used to feel anxious. now i just feel\u2026 quiet?',
    media: 'photo', tone: 'ink',
    likes: 87, comments: 14, likedByMe: true, isMilestone: true,
  },
  {
    id: 'f2', user: 'theo p.', handle: 'theo', mood: 'sweat',
    habit: 'duolingo french', day: 5, when: '34m',
    note: 'je suis fatigué mais je suis ici. mascot looks judgmental today.',
    media: 'note', tone: 'paper',
    likes: 12, comments: 3, likedByMe: false,
  },
  {
    id: 'f3', user: 'maya k.', handle: 'maya.k', mood: 'celebrate',
    habit: 'cold plunge', day: 47, when: '1h',
    note: 'i bet i won\u2019t make it to day 50. day 47. mascot can shut up now ❄️',
    media: 'video', tone: 'lime',
    likes: 24, comments: 6, likedByMe: false,
  },
  {
    id: 'f4', user: 'jules a.', handle: 'jules', mood: 'dead',
    habit: 'gym · 4x/week', day: 0, when: '2h',
    note: 'missed leg day. mascot is staring at me. anyway, restarting the streak tomorrow.',
    media: 'note', tone: 'paper',
    likes: 8, comments: 11, likedByMe: false, isMiss: true,
  },
  {
    id: 'f5', user: 'sam r.', handle: 'sam', mood: 'wink',
    habit: 'read · 20 pages', day: 31, when: '3h',
    note: 'one month. didn\u2019t open instagram once before bed. small wins.',
    media: 'photo', tone: 'pink',
    likes: 41, comments: 5, likedByMe: false, isMilestone: true,
  },
  {
    id: 'f6', user: 'theo p.', handle: 'theo', mood: 'default',
    habit: 'walk 3 miles', day: 8, when: '5h',
    note: 'walked the long way home. listened to no podcast. just sounds.',
    media: 'note', tone: 'paper',
    likes: 7, comments: 1, likedByMe: false,
  },
];

// ─── Top bar ───────────────────────────────────
function FeedTopBar() {
  return (
    <div style={{
      padding: '12px 18px 10px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: HC.bg, position: 'sticky', top: 0, zIndex: 5,
      borderBottom: `1px solid ${HC.ink}10`,
    }}>
      <Wordmark size={0.36} />
      <div style={{ display: 'flex', gap: 10 }}>
        <button aria-label="search" style={topBtn}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
        </button>
        <button aria-label="notifications" style={{ ...topBtn, position: 'relative' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/></svg>
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 9, height: 9, borderRadius: 99,
            background: HC.accent, border: `1.5px solid ${HC.bg}`,
          }}/>
        </button>
      </div>
    </div>
  );
}
const topBtn = {
  background: 'transparent', border: 'none', cursor: 'pointer',
  width: 36, height: 36, display: 'grid', placeItems: 'center',
};

// ─── Filter pills ─────────────────────────────
function FilterRow() {
  const [active, setActive] = uS_f('all');
  const filters = [
    { id: 'all', label: 'all' },
    { id: 'today', label: 'today' },
    { id: 'milestones', label: '✦ milestones' },
    { id: 'misses', label: 'misses' },
    { id: 'close', label: 'closest friends' },
  ];
  return (
    <div style={{
      padding: '12px 18px', display: 'flex', gap: 8, overflowX: 'auto',
      background: HC.bg,
    }}>
      {filters.map((f) => (
        <button key={f.id} onClick={() => setActive(f.id)} style={{
          padding: '7px 14px', borderRadius: 99, whiteSpace: 'nowrap',
          fontFamily: HC.body, fontSize: 12, fontWeight: 700,
          background: active === f.id ? HC.ink : 'transparent',
          color: active === f.id ? HC.brand : HC.ink,
          border: `1.5px solid ${active === f.id ? HC.ink : `${HC.ink}33`}`,
          cursor: 'pointer', flexShrink: 0,
        }}>{f.label}</button>
      ))}
    </div>
  );
}

// ─── Streak strip (your in-progress habits today) ─────
const TODAY_STREAKS = [
  { habit: 'cold plunge', day: 47, done: true, mood: 'celebrate' },
  { habit: 'no doomscroll', day: 12, done: true, mood: 'smug' },
  { habit: 'journal', day: 89, done: false, mood: 'default' },
  { habit: 'french', day: 5, done: false, mood: 'sweat' },
];
function MyStreaks() {
  return (
    <div style={{ padding: '6px 0 14px' }}>
      <div style={{ padding: '0 18px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontFamily: HC.display, fontSize: 14, fontWeight: 800, color: HC.ink, letterSpacing: -0.3, whiteSpace: 'nowrap' }}>
          today · 2 of 4
        </span>
        <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600, whiteSpace: 'nowrap' }}>tap to log →</span>
      </div>
      <div style={{ padding: '0 18px', display: 'flex', gap: 10, overflowX: 'auto' }}>
        {TODAY_STREAKS.map((s, i) => (
          <div key={i} style={{
            flexShrink: 0, width: 100, minHeight: 124,
            padding: '12px 8px 10px',
            background: s.done ? HC.brand : HC.surface,
            border: `1px solid ${HC.line}`, borderRadius: HC.r3,
            display: 'grid', gridTemplateRows: 'auto 1fr auto', justifyItems: 'center',
            rowGap: 6,
            position: 'relative', cursor: 'pointer',
          }}>
            <Mascot size={40} mood={s.mood} />
            <div style={{ fontFamily: HC.body, fontSize: 11, fontWeight: 700, color: s.done ? HC.brandInk : HC.ink, textAlign: 'center', lineHeight: 1.2, alignSelf: 'start' }}>
              {s.habit}
            </div>
            <div style={{
              fontFamily: HC.mono, fontSize: 10, fontWeight: 700,
              color: s.done ? HC.brandInk : HC.muted,
              letterSpacing: 0.5, whiteSpace: 'nowrap',
            }}>
              {s.done ? `✓ day ${s.day}` : `day ${s.day}`}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feed card ────────────────────────────────
function FeedCard({ post }) {
  const [liked, setLiked] = uS_f(post.likedByMe);
  const showMedia = post.media !== 'note';

  // tone variants
  const isLime = post.tone === 'lime';
  const isPink = post.tone === 'pink';
  const isInk = post.tone === 'ink';

  const cardBg = isLime ? HC.brand : isPink ? HC.accent : isInk ? HC.ink : HC.surface;
  const cardInk = isInk || isPink ? HC.bg : HC.ink;
  const subtleInk = isInk || isPink ? `${HC.bg}cc` : HC.muted;

  return (
    <div style={{
      margin: '0 16px',
      background: cardBg, color: cardInk,
      border: `1px solid ${HC.line}`, borderRadius: HC.r3,
      boxShadow: HC.shadow,
      overflow: 'hidden', position: 'relative',
    }}>
      {/* milestone ribbon — sits above author row, doesn't overlap ⋯ */}
      {post.isMilestone && (
        <div style={{
          position: 'absolute', top: 14, right: -32, transform: 'rotate(35deg)',
          background: HC.ink, color: HC.brand,
          padding: '2px 36px', fontFamily: HC.mono, fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase',
          zIndex: 2, pointerEvents: 'none',
        }}>milestone</div>
      )}

      {/* author */}
      <div style={{ padding: '12px 14px 10px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 19,
          background: HC.ink, border: `1.5px solid ${cardInk === HC.bg ? HC.bg : HC.ink}`,
          display: 'grid', placeItems: 'center', flexShrink: 0,
        }}>
          <Mascot size={34} mood={post.mood} bg={HC.ink} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: HC.body, fontSize: 13, fontWeight: 700, color: cardInk }}>{post.user}</span>
            <span style={{ fontFamily: HC.mono, fontSize: 10, color: subtleInk, fontWeight: 500 }}>· {post.when}</span>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4, minWidth: 0 }}>
            <span style={{
              fontFamily: HC.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
              padding: '2px 7px', borderRadius: 4,
              background: isLime || isPink ? HC.ink : HC.brand,
              color: isLime || isPink ? HC.brand : HC.brandInk,
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              maxWidth: '100%', minWidth: 0, flexShrink: 1,
            }}>
              {post.habit}
            </span>
            <span style={{ fontFamily: HC.mono, fontSize: 10, color: subtleInk, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}>
              {post.isMiss ? 'streak reset' : `day ${post.day}`}
            </span>
          </div>
        </div>
        <button aria-label="more" style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          color: cardInk, fontWeight: 700, fontSize: 18, lineHeight: 1, padding: 4,
          flexShrink: 0, position: 'relative', zIndex: 3,
        }}>⋯</button>
      </div>

      {/* media */}
      {showMedia && (
        <div style={{ margin: '0 14px', position: 'relative' }}>
          <div style={{
            aspectRatio: '4 / 3', borderRadius: HC.r2, overflow: 'hidden',
            background: `radial-gradient(circle at 30% 25%, #2C2640 0%, ${HC.ink} 70%)`,
            border: `1px solid ${HC.line}`,
            display: 'grid', placeItems: 'center', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', inset: 0,
              background: `repeating-linear-gradient(105deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 6px)`,
            }}/>
            <Mascot size={88} mood={post.mood} bg={HC.ink} />
            <div style={{
              position: 'absolute', top: 8, left: 8,
              fontFamily: HC.mono, fontSize: 9, fontWeight: 700,
              padding: '3px 8px', borderRadius: 99,
              background: 'rgba(15,11,26,0.7)', color: HC.bg,
              letterSpacing: 0.8, textTransform: 'uppercase',
              backdropFilter: 'blur(6px)',
            }}>{post.media === 'video' ? '▶ video' : '📷 photo'}</div>
            {post.isMilestone && (
              <div style={{
                position: 'absolute', bottom: 8, left: 8,
                background: HC.brand, color: HC.brandInk,
                padding: '3px 10px', borderRadius: 99,
                fontFamily: HC.display, fontSize: 12, fontWeight: 800, letterSpacing: -0.2,
                border: `1px solid ${HC.line}`,
              }}>day {post.day} ✦</div>
            )}
          </div>
        </div>
      )}

      {/* note */}
      <div style={{ padding: '12px 16px 10px', fontSize: 14, color: cardInk, lineHeight: 1.45 }}>
        {post.note}
      </div>

      {/* actions */}
      <div style={{
        padding: '0 16px 12px', display: 'flex', alignItems: 'center', gap: 18,
        fontFamily: HC.mono, fontSize: 11, color: subtleInk, fontWeight: 700,
      }}>
        <button onClick={() => setLiked((v) => !v)} style={{
          background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
          display: 'flex', alignItems: 'center', gap: 5, color: 'inherit', font: 'inherit', fontWeight: 700,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24"
            fill={liked ? HC.accent : 'none'} stroke={liked ? HC.accent : cardInk}
            strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          {post.likes + (liked && !post.likedByMe ? 1 : 0)}
        </button>
        <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 5, color: 'inherit', font: 'inherit', fontWeight: 700 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={cardInk} strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          {post.comments}
        </button>
        <button style={{
          marginLeft: 'auto',
          background: 'transparent', border: `1.5px solid ${cardInk === HC.bg ? `${HC.bg}55` : HC.ink}`,
          borderRadius: 99, padding: '4px 10px',
          fontFamily: HC.mono, fontSize: 10, fontWeight: 700, color: cardInk,
          cursor: 'pointer',
        }}>
          {post.isMiss ? 'send hug' : 'cheer'}
        </button>
      </div>
    </div>
  );
}

// ─── Bottom tab bar (re-decl, isolated) ───────
function FeedTabBar({ active = 'feed' }) {
  return (
    <div style={{
      borderTop: `1px solid ${HC.line}`, background: HC.surface,
      padding: '10px 16px 8px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-around',
    }}>
      {[
        { id: 'feed', label: 'home', d: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z' },
        { id: 'log', plus: true },
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

// ─── Home Feed ────────────────────────────────
function HomeFeed() {
  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <FeedTopBar />
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <MyStreaks />
        <FilterRow />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 24 }}>
          {FEED.map((p) => <FeedCard key={p.id} post={p} />)}
        </div>
      </div>
      <FeedTabBar active="feed" />
    </div>
  );
}

Object.assign(window, { HomeFeed });
