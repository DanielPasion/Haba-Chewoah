"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { HabitIcon } from "~/components/habit-icon";
import { HabitLogMediaPicker } from "~/components/habit-log-media-picker";
import { buttonClass } from "~/components/ui";

import {
  createHabitLogAction,
  getHabitLogMediaUploadUrl,
} from "../_actions";

type QuickLogSheetProps = {
  habitId: string;
  habitName: string;
  habitIcon: string | null;
  onClose: () => void;
};

export function QuickLogSheet({
  habitId,
  habitName,
  habitIcon,
  onClose,
}: QuickLogSheetProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notesLen, setNotesLen] = useState(0);

  // Lock body scroll while the sheet is open — same trick as the existing
  // <AddSheet>. Esc to close.
  useEffect(() => {
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

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await createHabitLogAction(formData);
      if (result.ok) {
        onClose();
        router.push(`/habit-log/${result.habitLogId}`);
      } else {
        setError(result.message);
      }
    });
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="log a habit"
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
          <div className="flex items-center gap-3">
            <HabitIcon value={habitIcon} size={44} emphasis="strong" />
            <div className="min-w-0">
              <p className="font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow text-hc-muted">
                logging
              </p>
              <h2
                className="truncate font-display text-xl font-extrabold text-hc-ink"
                style={{ letterSpacing: "-0.03em" }}
              >
                {habitName}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-sm font-semibold text-hc-muted hover:text-hc-ink"
          >
            cancel
          </button>
        </div>

        <form ref={formRef} action={onSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="habitId" value={habitId} />

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
              proof or note
            </span>
            <textarea
              name="notes"
              placeholder="38°F. 60 sec. before coffee."
              maxLength={2000}
              rows={3}
              onChange={(e) => setNotesLen(e.target.value.trim().length)}
              className="w-full resize-none rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
            />
            <span className="self-end font-mono text-hc-tiny text-hc-muted">
              {notesLen}/2000
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
              media · optional
            </span>
            <HabitLogMediaPicker
              getUploadUrlAction={getHabitLogMediaUploadUrl}
              habitId={habitId}
            />
          </div>

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
            {pending ? "logging…" : "log it"}
          </button>
        </form>
      </div>
    </div>
  );
}
