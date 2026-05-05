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

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="more"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-full border border-hc-line bg-hc-surface text-hc-ink shadow-hc-soft hover:bg-hc-surface-alt"
      >
        <span className="text-base font-bold leading-none">⋯</span>
      </button>
      {open && (
        <div className="absolute right-0 top-11 z-20 w-44 overflow-hidden rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface shadow-hc">
          {isOwn ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="block w-full px-4 py-2.5 text-left font-sans text-sm font-semibold text-hc-accent hover:bg-hc-surface-alt disabled:opacity-60"
            >
              {pending ? "deleting…" : "delete log"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                alert("reports are coming soon");
              }}
              className="block w-full px-4 py-2.5 text-left font-sans text-sm font-semibold text-hc-ink hover:bg-hc-surface-alt"
            >
              report (soon)
            </button>
          )}
        </div>
      )}
    </div>
  );
}
