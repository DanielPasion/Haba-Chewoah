// add-flows.jsx — + button: create habit log or create habit
const { useState: uS_a } = React;

// ─── Phone shell w/ feed-ish backdrop ─────────────
function PhoneShell({ children, dim = true }) {
  return (
    <div style={{
      background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column',
      overflow: 'hidden', position: 'relative',
    }}>
      {/* Faded backdrop hint of the feed underneath */}
      <div style={{
        position: 'absolute', inset: 0, padding: 18,
        display: 'flex', flexDirection: 'column', gap: 12,
        opacity: dim ? 0.35 : 1, filter: dim ? 'blur(1.5px)' : 'none',
        pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Wordmark size={0.32} />
          <div style={{ width: 36, height: 36, borderRadius: 18, background: HC.line }} />
        </div>
        {[0,1,2].map((i) => (
          <div key={i} style={{
            height: i === 0 ? 220 : 160, borderRadius: HC.r3,
            background: i === 1 ? HC.brand : HC.surface,
            border: `1.5px solid ${HC.ink}55`,
          }} />
        ))}
      </div>
      {/* Dim overlay */}
      {dim && (
        <div style={{
          position: 'absolute', inset: 0, background: 'rgba(15,11,26,0.42)',
          backdropFilter: 'blur(2px)',
        }}/>
      )}
      <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
}

// ─── Action sheet (the + chooser) ─────────────────
function AddSheet() {
  return (
    <PhoneShell>
      <div style={{ flex: 1 }} />
      <div style={{
        background: HC.bg, borderTopLeftRadius: HC.r5, borderTopRightRadius: HC.r5,
        border: `1px solid ${HC.line}`, borderBottom: 'none',
        boxShadow: `0 -6px 0 -2px ${HC.ink}33`,
        padding: '14px 18px 26px',
      }}>
        <div style={{ width: 48, height: 5, background: `${HC.ink}30`, borderRadius: 99, margin: '0 auto 14px' }}/>

        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 }}>
          <span style={{ fontFamily: HC.display, fontSize: 22, fontWeight: 800, letterSpacing: -0.6, color: HC.ink }}>
            what now?
          </span>
          <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>cancel</span>
        </div>

        {/* Primary: log a habit */}
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 16px', borderRadius: HC.r3,
          background: HC.brand, border: `1px solid ${HC.line}`,
          boxShadow: HC.shadow,
          textAlign: 'left', cursor: 'pointer', marginBottom: 12,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: HC.ink, display: 'grid', placeItems: 'center', flexShrink: 0,
          }}>
            <Mascot size={40} mood="celebrate" bg={HC.ink} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: HC.display, fontSize: 17, fontWeight: 800, color: HC.brandInk, letterSpacing: -0.4 }}>
              log a habit
            </div>
            <div style={{ fontFamily: HC.body, fontSize: 12, color: `${HC.brandInk}cc`, fontWeight: 500, marginTop: 2 }}>
              4 due today · cold plunge, journal, french, drink water
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        {/* Secondary: new habit */}
        <button style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 16px', borderRadius: HC.r3,
          background: HC.surface, border: `1px solid ${HC.line}`,
          textAlign: 'left', cursor: 'pointer', marginBottom: 18,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: HC.bg, border: `1.5px solid ${HC.ink}22`,
            display: 'grid', placeItems: 'center', flexShrink: 0,
            fontFamily: HC.display, fontSize: 26, fontWeight: 800, color: HC.ink, letterSpacing: -1,
          }}>
            ＋
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: HC.display, fontSize: 17, fontWeight: 800, color: HC.ink, letterSpacing: -0.4 }}>
              start a new habit
            </div>
            <div style={{ fontFamily: HC.body, fontSize: 12, color: HC.muted, fontWeight: 500, marginTop: 2 }}>
              say "i bet i won't…" and prove yourself wrong
            </div>
          </div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={HC.ink} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
        </button>

        {/* Mascot peek */}
        <div style={{
          padding: '10px 14px', borderRadius: HC.r2,
          background: HC.ink, color: HC.bg,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Mascot size={28} mood="wink" bg={HC.ink} />
          <span style={{ fontFamily: HC.body, fontSize: 12, fontWeight: 500, fontStyle: 'italic' }}>
            "you said you'd plunge today. it's <span style={{ color: HC.brand, fontWeight: 700, fontStyle: 'normal' }}>5:42pm</span>."
          </span>
        </div>
      </div>
    </PhoneShell>
  );
}

// ─── Log a habit (pick → log → mood + media + note) ──
const LOGGABLE = [
  { id: 'h1', name: 'cold plunge', day: 47, due: true, mood: 'celebrate', emoji: '❄️' },
  { id: 'h2', name: 'journal · 1 page', day: 89, due: true, mood: 'default', emoji: '✍️' },
  { id: 'h3', name: 'duolingo french', day: 5, due: true, mood: 'sweat', emoji: '🇫🇷' },
  { id: 'h4', name: 'drink water', day: 22, due: true, mood: 'wink', emoji: '💧' },
  { id: 'h5', name: 'no doomscroll', day: 12, due: false, mood: 'smug', emoji: '📵' },
];

function LogFlow() {
  const [picked, setPicked] = uS_a('h1');
  const [mood, setMood] = uS_a('celebrate');
  const [note, setNote] = uS_a('day 48 in the books. mascot was wrong. ❄️');
  const [media, setMedia] = uS_a('photo');

  const habit = LOGGABLE.find((h) => h.id === picked);

  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* sticky top */}
      <div style={{
        padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${HC.ink}10`, background: HC.bg,
      }}>
        <button style={chipBtn}>cancel</button>
        <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase' }}>
          new log
        </span>
        <button style={{ ...chipBtn, background: HC.ink, color: HC.brand, borderColor: HC.ink }}>post</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Habit picker */}
        <div>
          <Lbl>habit</Lbl>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {LOGGABLE.map((h) => {
              const sel = h.id === picked;
              return (
                <button key={h.id} onClick={() => setPicked(h.id)} style={{
                  flexShrink: 0, padding: '10px 14px',
                  background: sel ? HC.ink : (h.due ? HC.surface : 'transparent'),
                  color: sel ? HC.brand : HC.ink,
                  border: `1.5px solid ${sel ? HC.ink : `${HC.ink}33`}`,
                  borderRadius: HC.r2,
                  fontFamily: HC.body, fontSize: 13, fontWeight: 700,
                  display: 'flex', alignItems: 'center', gap: 6,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  opacity: !sel && !h.due ? 0.6 : 1,
                }}>
                  <span style={{ fontSize: 14 }}>{h.emoji}</span>
                  <span>{h.name}</span>
                  <span style={{
                    fontFamily: HC.mono, fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
                    padding: '1px 5px', borderRadius: 3,
                    background: sel ? HC.brand : HC.line,
                    color: sel ? HC.brandInk : HC.muted,
                  }}>{h.due ? `→ ${h.day + 1}` : 'done'}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Hero confirm */}
        <div style={{
          background: HC.surface, color: HC.ink,
          border: `1px solid ${HC.line}`, borderRadius: HC.r3,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          boxShadow: HC.shadow, position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, background: HC.brand }} />
          <div style={{ width: 52, height: 52, borderRadius: HC.r2, background: HC.ink, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Mascot size={48} mood={mood} bg={HC.ink} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: HC.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: HC.muted }}>
              you're about to mark
            </div>
            <div style={{ fontFamily: HC.display, fontSize: 20, fontWeight: 800, color: HC.ink, letterSpacing: -0.5, lineHeight: 1.1 }}>
              {habit?.name}
            </div>
            <div style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600, marginTop: 2 }}>
              streak: {habit?.day} → <span style={{ color: HC.ink, fontWeight: 800 }}>{(habit?.day || 0) + 1}</span>
            </div>
          </div>
        </div>

        {/* Mood */}
        <div>
          <Lbl>mood today</Lbl>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between' }}>
            {['celebrate', 'wink', 'default', 'sweat', 'dead'].map((m) => {
              const sel = m === mood;
              return (
                <button key={m} onClick={() => setMood(m)} style={{
                  flex: 1, padding: '10px 4px',
                  background: sel ? HC.surface : 'transparent',
                  border: `1.5px solid ${sel ? HC.ink : HC.lineStrong}`,
                  borderRadius: HC.r2, cursor: 'pointer',
                  display: 'grid', placeItems: 'center', gap: 4,
                }}>
                  <Mascot size={32} mood={m} />
                  <span style={{ fontFamily: HC.mono, fontSize: 8, color: HC.muted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {m === 'default' ? 'fine' : m}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Media */}
        <div>
          <Lbl>add proof <span style={{ color: HC.muted, fontWeight: 500 }}>(optional)</span></Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {[
              { id: 'photo', label: 'photo', d: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
              { id: 'video', label: 'video', d: 'M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z' },
              { id: 'note', label: 'note only', d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8' },
            ].map((m) => {
              const sel = m.id === media;
              return (
                <button key={m.id} onClick={() => setMedia(m.id)} style={{
                  padding: '14px 8px',
                  background: sel ? HC.ink : HC.surface,
                  color: sel ? HC.brand : HC.ink,
                  border: `1px solid ${HC.line}`, borderRadius: HC.r2,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  cursor: 'pointer',
                }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={m.d}/></svg>
                  <span style={{ fontFamily: HC.mono, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div>
          <Lbl>note</Lbl>
          <div style={{
            background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r2,
            padding: 14, minHeight: 100,
          }}>
            <textarea
              value={note} onChange={(e) => setNote(e.target.value)}
              placeholder="how did it go?"
              rows={3}
              style={{
                width: '100%', border: 'none', outline: 'none', background: 'transparent',
                resize: 'none', fontFamily: HC.body, fontSize: 14, color: HC.ink, lineHeight: 1.5,
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 600 }}>
              <span>{note.length}/280</span>
              <span>tap @ to mention</span>
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <Lbl>who sees this</Lbl>
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'public', label: '· public', desc: 'in feed' },
              { id: 'friends', label: 'friends', desc: 'mutuals only' },
              { id: 'private', label: '🔒 folder', desc: 'just you' },
            ].map((v, i) => (
              <button key={v.id} style={{
                flex: 1, padding: '10px 8px',
                background: i === 0 ? HC.ink : HC.surface,
                color: i === 0 ? HC.brand : HC.ink,
                border: `1px solid ${HC.line}`, borderRadius: HC.r2,
                cursor: 'pointer', textAlign: 'left',
              }}>
                <div style={{ fontFamily: HC.body, fontSize: 12, fontWeight: 700 }}>{v.label}</div>
                <div style={{ fontFamily: HC.mono, fontSize: 9, color: i === 0 ? `${HC.brand}cc` : HC.muted, fontWeight: 600, marginTop: 2 }}>{v.desc}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
const chipBtn = {
  padding: '8px 14px', borderRadius: 99,
  background: 'transparent', color: HC.ink,
  border: `1.5px solid ${HC.ink}33`,
  fontFamily: HC.mono, fontSize: 11, fontWeight: 700,
  letterSpacing: 0.5, textTransform: 'uppercase',
  cursor: 'pointer',
};
const Lbl = ({ children }) => (
  <div style={{
    fontFamily: HC.mono, fontSize: 10, color: HC.muted, fontWeight: 700,
    letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 8,
  }}>{children}</div>
);

// ─── New habit (creation form) ─────────────────
function NewHabitFlow() {
  const [name, setName] = uS_a('cold plunge');
  const [bet, setBet] = uS_a("i bet i won't make it past day 14");
  const [freq, setFreq] = uS_a('daily');
  const [count, setCount] = uS_a(3);
  const [end, setEnd] = uS_a('forever');
  const [vis, setVis] = uS_a('public');

  return (
    <div style={{ background: HC.bg, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{
        padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: `1px solid ${HC.ink}10`, background: HC.bg,
      }}>
        <button style={chipBtn}>cancel</button>
        <span style={{ fontFamily: HC.mono, fontSize: 10, color: HC.muted, letterSpacing: 1.5, fontWeight: 600, textTransform: 'uppercase' }}>
          new habit
        </span>
        <button style={{ ...chipBtn, background: HC.ink, color: HC.brand, borderColor: HC.ink }}>start</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Hero — the dare */}
        <div style={{
          background: HC.ink, color: HC.bg,
          borderRadius: HC.r4, padding: '18px 18px 16px',
          position: 'relative', overflow: 'hidden',
          border: `1px solid ${HC.line}`, boxShadow: HC.shadow,
        }}>
          <div style={{ position: 'absolute', top: -10, right: -16, opacity: 0.5 }}>
            <Mascot size={120} mood="smug" bg={HC.ink} />
          </div>
          <div style={{ fontFamily: HC.mono, fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: HC.accent, marginBottom: 10 }}>
            step 1 — the dare
          </div>
          <div style={{ fontFamily: HC.display, fontSize: 18, fontWeight: 700, color: HC.bg, lineHeight: 1.3, fontStyle: 'italic', maxWidth: '85%' }}>
            "
            <input
              value={bet} onChange={(e) => setBet(e.target.value)}
              style={{
                background: 'transparent', border: 'none', outline: 'none',
                fontFamily: HC.display, fontSize: 18, fontWeight: 700, color: HC.brand,
                fontStyle: 'italic', width: '100%', padding: 0,
              }}
            />
            "
          </div>
        </div>

        {/* Habit name */}
        <div>
          <Lbl>habit name</Lbl>
          <div style={{
            background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r2,
            padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <button style={{
              width: 36, height: 36, borderRadius: 8,
              background: HC.brand, border: `1px solid ${HC.line}`,
              display: 'grid', placeItems: 'center', cursor: 'pointer', fontSize: 16,
            }}>❄️</button>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="cold plunge"
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontFamily: HC.body, fontSize: 15, fontWeight: 600, color: HC.ink,
              }}
            />
          </div>
        </div>

        {/* Frequency */}
        <div>
          <Lbl>frequency</Lbl>
          <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
            {[
              { id: 'daily', label: 'daily' },
              { id: 'weekly', label: 'weekly' },
              { id: 'n_per_period', label: 'N per period' },
            ].map((f) => {
              const sel = f.id === freq;
              return (
                <button key={f.id} onClick={() => setFreq(f.id)} style={{
                  flex: 1, padding: '10px 6px',
                  background: sel ? HC.ink : HC.surface,
                  color: sel ? HC.brand : HC.ink,
                  border: `1px solid ${HC.line}`, borderRadius: HC.r2,
                  fontFamily: HC.body, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>{f.label}</button>
              );
            })}
          </div>
          {freq !== 'daily' && (
            <div style={{
              background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r2,
              padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ fontFamily: HC.body, fontSize: 13, color: HC.ink, fontWeight: 600 }}>at least</span>
              <button onClick={() => setCount(Math.max(1, count - 1))} style={pillBtn}>−</button>
              <span style={{ fontFamily: HC.display, fontSize: 22, fontWeight: 800, color: HC.ink, letterSpacing: -0.6, minWidth: 24, textAlign: 'center' }}>{count}</span>
              <button onClick={() => setCount(count + 1)} style={pillBtn}>+</button>
              <span style={{ fontFamily: HC.body, fontSize: 13, color: HC.ink, fontWeight: 600 }}>× per {freq === 'weekly' ? 'week' : '7 days'}</span>
            </div>
          )}
        </div>

        {/* Duration */}
        <div>
          <Lbl>how long?</Lbl>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6 }}>
            {[
              { id: '7', label: '7 days' },
              { id: '30', label: '30 days' },
              { id: '90', label: '90 days' },
              { id: 'forever', label: 'forever' },
            ].map((d) => {
              const sel = d.id === end;
              return (
                <button key={d.id} onClick={() => setEnd(d.id)} style={{
                  padding: '10px 4px',
                  background: sel ? HC.brand : HC.surface,
                  color: HC.ink,
                  border: `1px solid ${HC.line}`, borderRadius: HC.r2,
                  fontFamily: HC.body, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                }}>{d.label}</button>
              );
            })}
          </div>
        </div>

        {/* Reminder */}
        <div>
          <Lbl>reminder</Lbl>
          <div style={{
            background: HC.surface, border: `1px solid ${HC.line}`, borderRadius: HC.r2,
            padding: 12, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              padding: '6px 12px', borderRadius: 8,
              background: HC.ink, color: HC.bg,
              fontFamily: HC.mono, fontSize: 14, fontWeight: 700,
            }}>06:30</span>
            <span style={{ fontFamily: HC.body, fontSize: 12, color: HC.ink, fontWeight: 500 }}>every</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {['m','t','w','t','f','s','s'].map((d, i) => (
                <span key={i} style={{
                  width: 22, height: 22, borderRadius: 11,
                  background: i < 5 ? HC.brand : HC.line,
                  color: i < 5 ? HC.brandInk : HC.muted,
                  display: 'grid', placeItems: 'center',
                  fontFamily: HC.mono, fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  border: `1px solid ${i < 5 ? HC.ink : 'transparent'}`,
                }}>{d}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Visibility */}
        <div>
          <Lbl>visibility</Lbl>
          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: 'public', label: '· public', desc: 'shows in feed' },
              { id: 'friends', label: 'friends', desc: 'mutuals' },
              { id: 'folder', label: '🔒 folder', desc: 'private' },
            ].map((v) => {
              const sel = v.id === vis;
              return (
                <button key={v.id} onClick={() => setVis(v.id)} style={{
                  flex: 1, padding: '10px 8px',
                  background: sel ? HC.ink : HC.surface,
                  color: sel ? HC.brand : HC.ink,
                  border: `1px solid ${HC.line}`, borderRadius: HC.r2,
                  cursor: 'pointer', textAlign: 'left',
                }}>
                  <div style={{ fontFamily: HC.body, fontSize: 12, fontWeight: 700 }}>{v.label}</div>
                  <div style={{ fontFamily: HC.mono, fontSize: 9, color: sel ? `${HC.brand}cc` : HC.muted, fontWeight: 600, marginTop: 2 }}>{v.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
const pillBtn = {
  width: 30, height: 30, borderRadius: 99,
  background: HC.bg, border: `1px solid ${HC.line}`,
  fontFamily: HC.display, fontSize: 16, fontWeight: 800, color: HC.ink,
  cursor: 'pointer', display: 'grid', placeItems: 'center',
};

Object.assign(window, { AddSheet, LogFlow, NewHabitFlow });
