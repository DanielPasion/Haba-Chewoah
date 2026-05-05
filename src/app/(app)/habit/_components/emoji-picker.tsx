"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Curated emoji set for habit icons. Habit-relevant only — not the full
 * Unicode set, which would bloat the bundle and overwhelm the user. Grouped
 * loosely by theme; the order inside each group is intentional and surfaces
 * the most-likely picks first.
 */
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "body",
    emojis: [
      "💪", "🏃", "🚶", "🚴", "🏊", "🧘", "🏋️", "⛷️", "🏄", "🥊",
      "🤸", "⚽", "🏀", "🎾", "🏓", "❄️", "🥶", "🧊", "💦", "🛌",
    ],
  },
  {
    label: "mind",
    emojis: [
      "📚", "📖", "✍️", "📝", "✏️", "🧠", "💡", "🎓", "🔬", "🧮",
      "🗒️", "📒", "📓", "🎨", "🎸", "🎹", "🎤", "🎬", "📷", "🧩",
    ],
  },
  {
    label: "fuel",
    emojis: [
      "🥗", "🥦", "🍎", "🍌", "🥑", "🥩", "🍗", "🍵", "☕", "💧",
      "🥛", "🍳", "🍚", "🍜", "🌯", "🚭", "🚫", "📵", "🍷", "🍺",
    ],
  },
  {
    label: "spirit",
    emojis: [
      "🙏", "🧘‍♀️", "🌅", "🌙", "⭐", "🌱", "🌿", "🌳", "🌊", "🔥",
      "⚡", "✨", "🎯", "🏆", "💎", "🎉", "💰", "💸", "📈", "🧹",
    ],
  },
];

const ALL_EMOJIS = EMOJI_GROUPS.flatMap((g) => g.emojis);

type Props = {
  value: string;
  onChange: (next: string) => void;
};

/**
 * Emoji picker — opens a popover anchored to the trigger button. Closes on
 * outside click, Escape, or selection. Falls back to a typed input inside
 * the popover so power users can still paste anything (server schema caps
 * at 8 chars to allow ZWJ sequences like 🧘‍♀️).
 *
 * The hidden input named `icon` lives inside this component so the form
 * picks up the value without prop-drilling. Same field name as before.
 */
export function EmojiPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(emoji: string) {
    onChange(emoji);
    setOpen(false);
    setQuery("");
  }

  function clear() {
    onChange("");
    setOpen(false);
  }

  const trimmedQuery = query.trim();
  const filtered = trimmedQuery
    ? ALL_EMOJIS.filter((e) => e.includes(trimmedQuery))
    : null;

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name="icon" value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="pick an emoji"
        aria-expanded={open}
        className="grid size-12 shrink-0 cursor-pointer place-items-center rounded-hc-2 border-hc border-hc-line-strong bg-hc-brand text-2xl transition-transform hover:-translate-y-[1px]"
      >
        <span aria-hidden className={value ? "" : "opacity-50"}>
          {value || "❄️"}
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="emoji picker"
          className="absolute left-0 top-14 z-30 flex w-72 flex-col gap-2 rounded-hc-3 border-hc border-hc-ink bg-hc-surface p-3 shadow-hc-stamp"
        >
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value.slice(0, 8))}
              placeholder="paste or type…"
              aria-label="custom emoji"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              className="min-w-0 flex-1 rounded-hc-2 border border-hc-line-strong bg-hc-bg px-3 py-2 font-sans text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
            />
            {trimmedQuery && (
              <button
                type="button"
                onClick={() => pick(trimmedQuery)}
                className="rounded-hc-2 border-hc border-hc-ink bg-hc-ink px-3 py-2 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-brand"
              >
                use
              </button>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto">
            {filtered ? (
              <div className="grid grid-cols-7 gap-1 py-1">
                {filtered.length === 0 ? (
                  <p className="col-span-7 px-2 py-3 text-center font-mono text-hc-eyebrow text-hc-muted">
                    no matches · paste any emoji above
                  </p>
                ) : (
                  filtered.map((e, i) => (
                    <EmojiButton
                      key={`${e}-${i}`}
                      emoji={e}
                      selected={e === value}
                      onClick={() => pick(e)}
                    />
                  ))
                )}
              </div>
            ) : (
              EMOJI_GROUPS.map((g) => (
                <div key={g.label} className="flex flex-col gap-1 py-1">
                  <span className="px-1 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                    {g.label}
                  </span>
                  <div className="grid grid-cols-7 gap-1">
                    {g.emojis.map((e, i) => (
                      <EmojiButton
                        key={`${e}-${i}`}
                        emoji={e}
                        selected={e === value}
                        onClick={() => pick(e)}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          {value && (
            <button
              type="button"
              onClick={clear}
              className="rounded-hc-2 border border-hc-line-strong bg-hc-bg px-3 py-2 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-muted hover:text-hc-ink"
            >
              clear emoji
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function EmojiButton({
  emoji,
  selected,
  onClick,
}: {
  emoji: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`select ${emoji}`}
      aria-pressed={selected}
      className={`grid size-9 cursor-pointer place-items-center rounded-hc-2 text-xl transition-colors ${
        selected
          ? "border-hc border-hc-ink bg-hc-brand"
          : "border border-hc-line bg-hc-bg hover:bg-hc-surface-alt"
      }`}
    >
      <span aria-hidden>{emoji}</span>
    </button>
  );
}
