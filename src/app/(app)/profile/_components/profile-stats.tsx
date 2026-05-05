"use client";

import { useState } from "react";

import { FollowListModal } from "./follow-list-modal";

type Stat = { label: string; value: number };

/**
 * Profile stats row. The first two stats (followers/following) open a
 * follow-list modal on click; the rest are read-only labels.
 *
 * Clickable stats are rendered as native `<button>`s so keyboard / screen
 * reader users get the same affordance.
 */
export function ProfileStats({
  stats,
  variant = "mobile",
  userId,
  username,
}: {
  stats: Stat[];
  variant?: "mobile" | "desktop";
  userId: string;
  username: string;
}) {
  const isDesktop = variant === "desktop";
  const [openModal, setOpenModal] = useState<
    "followers" | "following" | null
  >(null);

  const valueClass = `font-display font-extrabold leading-none text-hc-ink ${
    isDesktop ? "text-2xl" : "text-xl"
  }`;
  const labelClass =
    "mt-1 font-mono text-hc-tiny font-medium uppercase tracking-hc-eyebrow text-hc-muted";

  return (
    <>
      <div className={`flex flex-wrap ${isDesktop ? "gap-8" : "gap-6"}`}>
        {stats.map((s) => {
          const clickable =
            s.label === "followers" || s.label === "following";
          if (clickable) {
            return (
              <button
                key={s.label}
                type="button"
                onClick={() =>
                  setOpenModal(s.label as "followers" | "following")
                }
                className="cursor-pointer text-left"
              >
                <div className={valueClass} style={{ letterSpacing: "-0.03em" }}>
                  {s.value.toLocaleString()}
                </div>
                <div className={`${labelClass} hover:text-hc-ink`}>
                  {s.label}
                </div>
              </button>
            );
          }
          return (
            <div key={s.label}>
              <div className={valueClass} style={{ letterSpacing: "-0.03em" }}>
                {s.value.toLocaleString()}
              </div>
              <div className={labelClass}>{s.label}</div>
            </div>
          );
        })}
      </div>

      <FollowListModal
        open={openModal !== null}
        onClose={() => setOpenModal(null)}
        userId={userId}
        username={username}
        kind={openModal ?? "followers"}
      />
    </>
  );
}
