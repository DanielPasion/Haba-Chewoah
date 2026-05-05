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
    isDesktop ? "text-2xl" : "text-lg"
  }`;
  const labelClass =
    "mt-1 font-mono text-hc-tiny font-semibold uppercase tracking-widest text-hc-muted";

  return (
    <>
      <div className={`flex flex-wrap ${isDesktop ? "gap-7" : "gap-5"}`}>
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
                className="cursor-pointer text-left transition-transform hover:-translate-y-[1px]"
              >
                <div
                  className={valueClass}
                  style={{ letterSpacing: "-0.02em" }}
                >
                  {s.value.toLocaleString()}
                </div>
                <div className={labelClass}>{s.label}</div>
              </button>
            );
          }
          return (
            <div key={s.label}>
              <div className={valueClass} style={{ letterSpacing: "-0.02em" }}>
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
