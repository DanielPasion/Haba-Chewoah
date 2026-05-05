"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { deleteHabitLogAction } from "../_actions";

export function LogActions({
  logId,
  habitId,
  isOwn,
}: {
  logId: string;
  habitId: string;
  isOwn: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close on outside-click — cheaper than a backdrop element since the
  // menu is anchored, not modal.
  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function onDelete() {
    if (!confirm("delete this log? this can't be undone.")) return;
    startTransition(async () => {
      const result = await deleteHabitLogAction(logId);
      if (result.ok) {
        router.push(`/habit/${habitId}`);
      } else {
        alert(result.message);
      }
    });
  }

  if (!isOwn) return null;

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="more"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full text-hc-ink hover:bg-hc-surface"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <circle cx="5" cy="12" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="19" cy="12" r="1.7" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-hc-2 border border-hc-line bg-hc-surface shadow-hc-lg">
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="block w-full px-4 py-2.5 text-left font-sans text-sm font-semibold text-hc-accent hover:bg-hc-surface-alt disabled:opacity-60"
          >
            {pending ? "deleting…" : "delete log"}
          </button>
        </div>
      )}
    </div>
  );
}
