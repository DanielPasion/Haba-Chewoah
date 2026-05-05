"use client";

import { useState, useTransition } from "react";

import { chewOutAction } from "../_actions";

type Status = "idle" | "sent" | "cooldown" | "error";

/**
 * Chew-out button for someone else's active habit. Optimistic-ish: we flip
 * to "sent" the moment the server confirms, and show a one-line reason on
 * any failure (cooldown, blocked, already logged today). Mirrors the
 * mockup ⚡ + chew-out label in `.claude/ui/project/habit-detail.jsx`.
 */
export function ChewOutButton({
  habitId,
  recipientHandle,
}: {
  habitId: string;
  recipientHandle: string;
}) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);

  function onClick() {
    if (pending || status === "sent") return;
    startTransition(async () => {
      const result = await chewOutAction(habitId);
      if (result.ok) {
        setStatus("sent");
        setMessage(`@${recipientHandle} got the buzz`);
      } else if (result.cooldown) {
        setStatus("cooldown");
        setMessage(result.message);
      } else {
        setStatus("error");
        setMessage(result.message);
      }
    });
  }

  const disabled = pending || status === "sent" || status === "cooldown";
  const label =
    status === "sent"
      ? "chewed ⚡"
      : status === "cooldown"
        ? "buzzed today ✓"
        : pending
          ? "chewing…"
          : "chew out";

  return (
    <div className="flex flex-1 flex-col gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={`chew out @${recipientHandle}`}
        className={`flex flex-1 items-center justify-center gap-2 rounded-hc-3 border border-hc-line px-4 py-4 text-center font-display text-base font-extrabold shadow-hc-stamp transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${
          status === "sent"
            ? "bg-hc-brand text-hc-brand-ink"
            : "bg-hc-accent text-hc-accent-ink"
        }`}
        style={{ letterSpacing: "-0.02em" }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9z" />
        </svg>
        {label}
      </button>
      {message && (
        <p
          className={`px-1 font-mono text-hc-tiny font-semibold uppercase tracking-hc-eyebrow ${
            status === "error" ? "text-hc-accent" : "text-hc-muted"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
