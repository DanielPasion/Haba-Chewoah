// habit-detail.jsx — /habit/:id (own + others')
const { useState: uS_h } = React;

const HABIT_OWN = {
  id: 'h1', name: 'cold plunge', emoji: '❄️',
  ownerName: 'maya k.', ownerHandle: 'maya.k',
  startDate: 'sep 15', dayCount: 47,
  frequency: 'daily', target: '1× / day',
  completionRate: 96, longestStreak: 47, currentStreak: 47, totalLogs: 45,
  mood: 'celebrate', isPublic: true,
  description: '60 sec @ 38°F. before coffee, no excuses, no exceptions.',
  startMessage: 'i bet i won\u2019t make it to day 50.',
};
const HABIT_OTHER = {
  ...HABIT_OWN,
  ownerName: 'kira w.', ownerHandle: 'kira',
  name: 'no doomscroll', emoji: '📵',
  description: 'phone in another room before 9pm. no exceptions, no "just checking".',
  startMessage: 'i bet i can\u2019t go a month without infinite scroll.',
  dayCount: 119, longestStreak: 119, currentStreak: 119, completionRate: 100, totalLogs: 119,
  mood: 'smug',
};

// 8-week heatmap: 0 = none, 1 = miss, 2 = done, 3 = streak peak
const HEAT = (() => {
  const out = [];
  for (let w = 0; w < 8; w++) {
    const row = [];
    for (let d = 0; d < 7; d++) {
      const v = (w === 0 && d < 2) ? 0 : (w === 3 && d === 4 ? 1 : (Math.random() < 0.92 ? 2 : 1));
      row.push(v);
    }
    out.push(row);
  }
  // last week: only show through today
  out[7] = [2, 2, 2, 2, 2, 0, 0];
  return out;
})();

const HABIT_LOG_PREVIEWS = [
  { id: 'l1', day: 47, when: 'today · 6:42a', note: '47. mascot can shut up now.', mood: 'celebrate', media: 'photo', likes: 24 },
  { id: 'l2', day: 46, when: 'yesterday', note: '14 sec PR. legs went numb but in a fun way.', mood: 'celebrate', media: 'video', likes: 38 },
  { id: 'l3', day: 45, when: '2d ago', note: 'tap, plunge, scream, log. 60 seconds.', mood: 'sweat', media: 'note', likes: 11 },
  { id: 'l4', day: 44, when: '3d ago', note: 'thursday. raining. did it anyway.', mood: 'default', media: 'photo', likes: 7 },
];

// ─── Header (back + share + ⋯) ─────────────────────
function HDHeader({ onBack, isOwn }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 18px', position: 'sticky', top: 0, zIndex: 5,
      background: HC.bg,
    }}>
      <button onClick={onBack} aria-label="back" style={{
        background: HC.surface, border: `1px solid ${HC.line}`,
        borderRadius: 99, width: 36, height: 36, display: 'grid', placeItems: 'center',
        cursor: 'pointer', boxShadow: HC.shadow,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase' }}>
        /habit/{isOwn ? 'h1' : 'h2'}
      </span>
      <div style={{ display: 'flex', gap: 8 }}>
        <button aria-label="share" style={iconBtn()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4"/></svg>
        </button>
        <button aria-label="more" style={iconBtn()}>
          <span style={{ fontWeight: 700, fontSize: 14, color: HC.ink, lineHeight: 1 }}>⋯</span>
        </button>
      </div>
    </div>
  );
}
const iconBtn = () => ({
  background: HC.surface, border: `1px solid ${HC.line}`,
  borderRadius: 99, width: 36, height: 36,
  display: 'grid', placeItems: 'center', cursor: 'pointer',
  boxShadow: HC.shadow,
});

// ─── Hero card with day count + mascot ─────────────
function HeroCard({ habit, isOwn }) {
  return (
    <div style={{
      margin: '4px 18px 0', padding: 22, borderRadius: HC.r4,
      background: HC.surface, color: HC.ink,
      border: `1px solid ${HC.line}`, boxShadow: HC.shadow,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: HC.brand }} />
      <span style={{
        position: 'absolute', top: 14, right: 14,
        fontFamily: HC.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1.4,
        background: HC.ink, color: HC.brand, padding: '3px 8px', borderRadius: 99,
      }}>{habit.isPublic ? '· LIVE PUBLIC' : '🔒 FOLDER'}</span>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 28, lineHeight: 1 }}>{habit.emoji}</span>
        <div style={{ fontFamily: HC.mono, fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: `${HC.ink}aa` }}>
          {habit.frequency} · {habit.target}
        </div>
      </div>

      <div style={{
        fontFamily: HC.display, fontSize: 36, fontWeight: 800, letterSpacing: -1.5,
        lineHeight: 1, color: HC.ink, marginBottom: 14,
      }}>
        {habit.name}
      </div>

      {/* Day count */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontFamily: HC.display, fontSize: 92, fontWeight: 800, letterSpacing: -5, lineHeight: 0.85, color: HC.ink }}>
              {habit.dayCount}
            </span>
            <span style={{ fontFamily: HC.display, fontSize: 28, fontWeight: 800, letterSpacing: -1, color: HC.ink }}>days</span>
          </div>
          <div style={{ fontFamily: HC.mono, fontSize: 10, fontWeight: 600, color: `${HC.ink}aa`, letterSpacing: 1, textTransform: 'uppercase', marginTop: 4 }}>
            since {habit.startDate} · current streak: {habit.currentStreak}
          </div>
        </div>
        <div style={{ marginBottom: -8 }}>
          <Mascot size={84} mood={habit.mood} />
        </div>
      </div>

      {/* "i bet i won't" speech bubble — original promise */}
      <div style={{
        marginTop: 16, padding: '10px 14px', borderRadius: HC.r2,
        background: HC.ink, color: HC.bg,
        position: 'relative',
      }}>
        <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.accent, letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>
          {isOwn ? 'your dare to yourself' : `${habit.ownerName.split(' ')[0]}'s dare`}
        </div>
        <div style={{ fontFamily: HC.display, fontSize: 16, fontWeight: 700, fontStyle: 'italic', letterSpacing: -0.4 }}>
          "{habit.startMessage}"
        </div>
      </div>
    </div>
  );
}

// ─── Stats row ───────────────────────────────────
function StatsRow({ habit }) {
  const stats = [
    { n: `${habit.completionRate}%`, l: 'completion' },
    { n: habit.longestStreak, l: 'longest' },
    { n: habit.currentStreak, l: 'current' },
    { n: habit.totalLogs, l: 'total logs' },
  ];
  return (
    <div style={{
      margin: '14px 18px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
      background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r3,
      overflow: 'hidden',
    }}>
      {stats.map((s, i) => (
        <div key={s.l} style={{
          padding: '12px 8px', textAlign: 'center',
          borderRight: i < 3 ? `1px solid ${HC.ink}15` : 'none',
        }}>
          <div style={{ fontFamily: HC.display, fontSize: 20, fontWeight: 800, color: HC.ink, letterSpacing: -0.6, lineHeight: 1 }}>{s.n}</div>
          <div style={{ fontFamily: HC.mono, fontSize: 8, color: HC.muted, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginTop: 4 }}>{s.l}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Heatmap ─────────────────────────────────────
function Heatmap({ data }) {
  const cellColor = (v) => v === 2 ? HC.brand : v === 1 ? HC.accent : v === 3 ? HC.brand : HC.line;
  const cellBorder = (v) => v >= 1 ? HC.ink : 'transparent';
  return (
    <div style={{ margin: '20px 18px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
        <span style={{ fontFamily: HC.display, fontSize: 16, fontWeight: 700, color: HC.ink, letterSpacing: -0.4 }}>
          last 8 weeks
        </span>
        <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>
          1 miss · 47 hits
        </span>
      </div>
      <div style={{
        background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r3,
        padding: 14, display: 'flex', gap: 8,
      }}>
        {/* day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around', paddingRight: 4 }}>
          {['m', 'w', 'f'].map((d) => (
            <span key={d} style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, fontWeight: 600 }}>{d}</span>
          ))}
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 5 }}>
          {data.map((week, wi) => (
            <div key={wi} style={{ display: 'grid', gridTemplateRows: 'repeat(7, 1fr)', gap: 5 }}>
              {week.map((v, di) => (
                <div key={di} style={{
                  aspectRatio: '1 / 1',
                  background: cellColor(v),
                  border: `1px solid ${cellBorder(v)}`,
                  borderRadius: 4,
                  position: 'relative',
                }}>
                  {v === 1 && (
                    <span style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: 8, color: HC.bg, fontWeight: 700 }}>×</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, fontFamily: HC.mono, fontSize: 9, color: HC.muted, fontWeight: 600 }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Sw c={HC.brand} /> done</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Sw c={HC.accent} /> missed</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Sw c={HC.line} /> n/a</span>
      </div>
    </div>
  );
}
const Sw = ({ c }) => <span style={{ width: 10, height: 10, background: c, border: `1px solid ${HC.ink}40`, borderRadius: 2, display: 'inline-block' }} />;

// ─── Description card ──────────────────────────
function DescCard({ habit }) {
  return (
    <div style={{
      margin: '20px 18px 0', padding: 16,
      background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r3,
    }}>
      <div style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, letterSpacing: 1.5, fontWeight: 700, textTransform: 'uppercase', marginBottom: 6 }}>
        the rule
      </div>
      <div style={{ fontSize: 15, color: HC.ink, lineHeight: 1.5 }}>
        {habit.description}
      </div>
    </div>
  );
}

// ─── Recent logs preview ────────────────────────
function RecentLogs({ logs, isOwn }) {
  return (
    <div style={{ margin: '20px 0 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0 18px 10px' }}>
        <span style={{ fontFamily: HC.display, fontSize: 16, fontWeight: 700, color: HC.ink, letterSpacing: -0.4 }}>
          recent logs
        </span>
        <button style={{
          background: 'transparent', border: 'none', cursor: 'pointer',
          fontFamily: HC.mono, fontSize: 11, color: HC.ink, fontWeight: 700,
          textDecoration: 'underline', textUnderlineOffset: 3,
        }}>see all →</button>
      </div>
      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {logs.map((l) => (
          <div key={l.id} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: 12, borderRadius: HC.r2,
            background: HC.surface, border: `1.5px solid ${HC.ink}22`,
            cursor: 'pointer',
          }}>
            <div style={{
              width: 50, height: 50, borderRadius: HC.r2,
              background: HC.bg, display: 'grid', placeItems: 'center',
              border: `1px solid ${HC.ink}22`, flexShrink: 0,
            }}>
              <Mascot size={38} mood={l.mood} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.brandInk, background: HC.brand, padding: '1px 6px', borderRadius: 4, fontWeight: 700 }}>day {l.day}</span>
                <span style={{ fontFamily: HC.mono, fontSize: 9, color: HC.muted, fontWeight: 600, textTransform: 'uppercase' }}>{l.when}</span>
              </div>
              <div style={{
                fontSize: 13, color: HC.ink, marginTop: 4,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{l.note}</div>
            </div>
            <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 3 }}>
              ♥ {l.likes}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Owner card (shown on others' habits) ────────
function OwnerCard({ habit }) {
  return (
    <div style={{
      margin: '20px 18px 0', padding: 14,
      background: HC.surface, border: `1.5px solid ${HC.ink}22`, borderRadius: HC.r3,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 22,
        background: HC.ink, display: 'grid', placeItems: 'center',
        border: `1px solid ${HC.line}`,
      }}>
        <Mascot size={40} bg={HC.ink} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: HC.body, fontSize: 14, fontWeight: 700, color: HC.ink }}>
          {habit.ownerName}
        </div>
        <div style={{ fontFamily: HC.mono, fontSize: 11, color: HC.muted, fontWeight: 500 }}>
          @{habit.ownerHandle}
        </div>
      </div>
      <button style={{
        background: 'transparent', color: HC.ink,
        border: `1px solid ${HC.line}`,
        padding: '8px 14px', borderRadius: 99,
        fontFamily: HC.body, fontSize: 12, fontWeight: 700, cursor: 'pointer',
      }}>view profile</button>
    </div>
  );
}

// ─── Sticky bottom action bar ──────────────────
function StickyAction({ isOwn }) {
  return (
    <div style={{
      position: 'sticky', bottom: 0, zIndex: 5,
      background: `linear-gradient(to top, ${HC.bg} 60%, transparent)`,
      padding: '20px 18px 18px',
      display: 'flex', gap: 10,
    }}>
      {isOwn ? (
        <>
          <button style={{
            flex: 1, background: HC.ink, color: HC.brand, border: 'none',
            padding: '16px', borderRadius: HC.r3,
            fontFamily: HC.display, fontSize: 17, fontWeight: 800, letterSpacing: -0.4,
            cursor: 'pointer', boxShadow: `3px 3px 0 ${HC.ink}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            <span style={{ fontSize: 20 }}>＋</span> log day 48
          </button>
          <button style={{
            background: HC.surface, color: HC.ink, border: `1px solid ${HC.line}`,
            padding: '16px', borderRadius: HC.r3, cursor: 'pointer',
            display: 'grid', placeItems: 'center',
          }} aria-label="edit habit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
        </>
      ) : (
        <>
          <button style={{
            flex: 1, background: HC.accent, color: HC.accentInk, border: 'none',
            padding: '16px', borderRadius: HC.r3,
            fontFamily: HC.display, fontSize: 16, fontWeight: 800, letterSpacing: -0.4,
            cursor: 'pointer', boxShadow: `3px 3px 0 ${HC.ink}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9z"/></svg>
            chew out before EOD
          </button>
          <button style={{
            background: HC.surface, color: HC.ink, border: `1px solid ${HC.line}`,
            padding: '16px 20px', borderRadius: HC.r3, cursor: 'pointer',
            fontFamily: HC.body, fontSize: 13, fontWeight: 700,
          }}>
            cheer
          </button>
        </>
      )}
    </div>
  );
}

// ─── Habit Detail page ─────────────────────────
function HabitDetail({ isOwn = true, onBack = () => {} }) {
  const habit = isOwn ? HABIT_OWN : HABIT_OTHER;
  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <HDHeader onBack={onBack} isOwn={isOwn} />
        <HeroCard habit={habit} isOwn={isOwn} />
        <StatsRow habit={habit} />
        <Heatmap data={HEAT} />
        <DescCard habit={habit} />
        {!isOwn && <OwnerCard habit={habit} />}
        <RecentLogs logs={HABIT_LOG_PREVIEWS} isOwn={isOwn} />
        <div style={{ height: 24 }} />
      </div>
      <StickyAction isOwn={isOwn} />
    </div>
  );
}

Object.assign(window, { HabitDetail });
