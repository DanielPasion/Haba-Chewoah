"use client";

import { useEffect, useRef, useState } from "react";

import {
  HabitIcon,
  ICON_CATEGORIES,
  type HabitIconCategory,
  isHabitIconKey,
} from "~/components/habit-icon";

type Props = {
  value: string;
  onChange: (next: string) => void;
};

/**
 * Curated icon picker for habits — the editorial replacement for the old
 * emoji grid. Opens as a popover anchored to the trigger button. Closes on
 * outside click, Escape, or selection.
 *
 * Backwards-compatible: legacy emoji values (anything not a registry key)
 * still render via `HabitIcon`'s emoji fallback, and the picker exposes a
 * "clear" affordance that resets the field. New picks always write a
 * registry key, so over time the data will normalise away from emoji.
 *
 * The hidden input named `icon` lives inside this component so the form
 * picks up the value without prop-drilling. Same field name as the old
 * EmojiPicker — server-side schema is unchanged.
 */
export function IconPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<HabitIconCategory>(
    "body",
  );
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

  function pick(key: string) {
    onChange(key);
    setOpen(false);
  }

  function clear() {
    onChange("");
    setOpen(false);
  }

  const isLegacyEmoji =
    !!value && value.length > 0 && !isHabitIconKey(value);

  return (
    <div ref={rootRef} className="relative">
      <input type="hidden" name="icon" value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="pick an icon"
        aria-expanded={open}
        className="group flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-hc-2 border border-hc-line-strong bg-hc-surface px-2 transition-colors hover:bg-hc-surface-alt focus:outline-none focus:ring-2 focus:ring-hc-ink/15"
      >
        <HabitIcon value={value || null} size={36} emphasis="strong" />
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className="text-hc-muted"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="icon picker"
          className="absolute left-0 top-14 z-30 flex w-80 flex-col rounded-hc-3 border border-hc-line bg-hc-surface shadow-hc-lg"
        >
          <div className="flex border-b border-hc-line">
            {ICON_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`flex-1 py-3 font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow transition-colors ${
                  activeCategory === c.id
                    ? "border-b-2 border-hc-ink text-hc-ink"
                    : "text-hc-muted hover:text-hc-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="px-3 pt-3 pb-1">
            <p className="font-sans text-xs text-hc-muted">
              {
                ICON_CATEGORIES.find((c) => c.id === activeCategory)?.hint
              }
            </p>
          </div>

          <div className="grid max-h-64 grid-cols-4 gap-1.5 overflow-y-auto p-3 pt-2">
            {ICON_CATEGORIES.find((c) => c.id === activeCategory)?.entries.map(
              (entry) => {
                const selected = entry.key === value;
                return (
                  <button
                    key={entry.key}
                    type="button"
                    onClick={() => pick(entry.key)}
                    aria-label={entry.label}
                    aria-pressed={selected}
                    className={`flex flex-col items-center gap-1.5 rounded-hc-2 border p-2 transition-colors ${
                      selected
                        ? "border-hc-ink bg-hc-surface-alt"
                        : "border-transparent hover:bg-hc-surface-alt"
                    }`}
                  >
                    <HabitIcon
                      value={entry.key}
                      size={36}
                      emphasis={selected ? "strong" : "soft"}
                    />
                    <span className="font-mono text-hc-tiny font-medium uppercase tracking-hc-eyebrow-narrow text-hc-muted">
                      {entry.label}
                    </span>
                  </button>
                );
              },
            )}
          </div>

          {(value || isLegacyEmoji) && (
            <div className="flex items-center justify-between border-t border-hc-line px-3 py-2.5">
              {isLegacyEmoji ? (
                <span className="font-mono text-hc-tiny font-semibold text-hc-muted">
                  legacy: {value}
                </span>
              ) : (
                <span className="font-mono text-hc-tiny font-semibold text-hc-muted">
                  selected
                </span>
              )}
              <button
                type="button"
                onClick={clear}
                className="font-mono text-hc-tiny font-bold uppercase tracking-hc-eyebrow text-hc-muted hover:text-hc-ink"
              >
                clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
