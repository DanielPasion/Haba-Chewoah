"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";

import { buttonClass } from "~/components/ui";

import { updateHabitLogAction } from "../_actions";

type EditLogSheetProps = {
  logId: string;
  initialCompletedAt: Date;
  initialNotes: string | null;
  onClose: () => void;
};

// Wall-clock representation of a Date in the viewer's local zone, suitable
// for `<input type="date">` and `<input type="time">`. Both inputs round-
// trip in the *browser's* zone, so we read them back the same way before
// shipping the value to the server.
function toLocalDateTimeParts(d: Date): { date: string; time: string } {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return {
    date: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`,
    time: `${pad(d.getHours())}:${pad(d.getMinutes())}`,
  };
}

export function EditLogSheet({
  logId,
  initialCompletedAt,
  initialNotes,
  onClose,
}: EditLogSheetProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const initial = toLocalDateTimeParts(initialCompletedAt);
  const [date, setDate] = useState(initial.date);
  const [time, setTime] = useState(initial.time);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    // Combine the two inputs in local time, then ISO-encode. The server
    // doesn't care about the viewer's tz at this point — `new Date(iso)`
    // gives the same instant whatever zone parses it.
    const local = new Date(`${date}T${time || "00:00"}`);
    if (Number.isNaN(local.getTime())) {
      setError("invalid date or time");
      return;
    }
    const fd = new FormData();
    fd.set("habitLogId", logId);
    fd.set("completedAt", local.toISOString());
    fd.set("notes", notes);

    startTransition(async () => {
      const result = await updateHabitLogAction(fd);
      if (result.ok) {
        router.refresh();
        onClose();
      } else {
        setError(result.message);
      }
    });
  }

  // Portal to <body> so the fixed-position modal escapes any backdrop-filter
  // ancestor (e.g. the sticky page header) — those create a containing block
  // for fixed descendants and clip the sheet on mobile.
  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="edit log"
      className="fixed inset-0 z-50 flex flex-col justify-end"
    >
      <button
        type="button"
        aria-label="close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-hc-ink/40 backdrop-blur-sm"
      />

      <div
        className="relative max-h-[92vh] w-full overflow-y-auto rounded-t-hc-5 border border-b-0 border-hc-line bg-hc-bg px-5 pb-7 pt-3.5 shadow-hc-lg md:mx-auto md:max-w-180 md:rounded-hc-5 md:border-b md:px-7"
        style={{ animation: "hc-sheet-up 220ms cubic-bezier(.2,.9,.3,1)" }}
      >
        <div
          className="mx-auto mb-3.5 h-1.5 w-12 rounded-full bg-hc-line-strong md:hidden"
          aria-hidden
        />

        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
              editing log
            </p>
            <h2
              className="font-display text-xl font-extrabold text-hc-ink"
              style={{ letterSpacing: "-0.03em" }}
            >
              fix the day or note
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-sm font-semibold text-hc-muted hover:text-hc-ink"
          >
            cancel
          </button>
        </div>

        <form ref={formRef} onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
                date
              </span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-3 py-2.5 font-sans text-sm text-hc-ink outline-none focus:border-hc-ink"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
                time
              </span>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                className="w-full rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-3 py-2.5 font-sans text-sm text-hc-ink outline-none focus:border-hc-ink"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
              note
            </span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={2000}
              rows={3}
              placeholder="what happened?"
              className="w-full resize-none rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
            />
            <span className="self-end font-mono text-hc-tiny text-hc-muted">
              {notes.trim().length}/2000
            </span>
          </label>

          {error && (
            <p className="rounded-hc-2 border border-hc-accent/40 bg-hc-accent/10 px-3 py-2 text-sm text-hc-accent">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className={`${buttonClass({ variant: "primary", size: "lg", fullWidth: true })} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {pending ? "saving…" : "save changes"}
          </button>
        </form>
      </div>
    </div>,
    document.body,
  );
}
