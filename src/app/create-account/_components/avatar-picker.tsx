"use client";

import { useState } from "react";

const SWATCHES = [
  "#d8ff3c",
  "#e8769a",
  "#1f1b2e",
  "#fbf8f1",
  "#7a7388",
  "#2d2840",
] as const;

export function AvatarPicker() {
  const [color, setColor] = useState<string>(SWATCHES[0]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="grid size-28 place-items-center rounded-full border-[1.5px] border-hc-ink shadow-hc"
        style={{ background: color }}
        aria-label="profile picture preview"
      >
        <span
          className="font-display text-3xl font-extrabold leading-none text-hc-ink"
          style={{ letterSpacing: "-0.04em" }}
        >
          ✦
        </span>
      </div>

      <div className="flex items-center gap-2">
        {SWATCHES.map((c) => {
          const active = c === color;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`pick color ${c}`}
              aria-pressed={active}
              className={`size-7 rounded-full border-[1.5px] transition-transform ${
                active
                  ? "scale-110 border-hc-ink"
                  : "border-hc-line-strong hover:scale-105"
              }`}
              style={{ background: c }}
            />
          );
        })}
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-hc-muted">
        avatar · visual placeholder
      </p>
    </div>
  );
}
