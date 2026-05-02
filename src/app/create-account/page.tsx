import { type Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { LogoText } from "~/components/brand/logo-text";
import { buttonClass } from "~/components/ui";
import { auth } from "~/server/auth";

import { AvatarPicker } from "./_components/avatar-picker";

export const metadata: Metadata = { title: "Create account" };

const TIMEZONES = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Toronto",
  "America/Mexico_City",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Madrid",
  "Europe/Amsterdam",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Asia/Seoul",
  "Australia/Sydney",
  "Pacific/Auckland",
] as const;

export default async function CreateAccountPage() {
  const session = await auth();

  if (!session?.user) redirect("/auth/signin");
  if (session.user.username) redirect("/feed");

  return (
    <main className="grid min-h-dvh w-full place-items-center bg-hc-bg px-6 py-10">
      <div className="flex w-full max-w-[460px] flex-col items-center gap-8">
        <Link href="/">
          <LogoText size={20} />
        </Link>

        <div className="flex flex-col items-center gap-2 text-center">
          <h1
            className="font-display text-4xl font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            claim your nickname{" "}
            <span className="text-hc-accent">→</span>
          </h1>
          <p className="max-w-[340px] text-sm text-hc-muted">
            Pick a handle, a vibe, and a timezone. You can change all of this
            later.
          </p>
        </div>

        <AvatarPicker />

        <form className="flex w-full flex-col gap-5">
          <Field
            label="nickname"
            hint="3–32 chars · letters, numbers, underscore"
          >
            <input
              name="username"
              type="text"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_]+"
              autoComplete="off"
              spellCheck={false}
              placeholder="cold_plunger"
              className="w-full rounded-hc-2 border-[1.5px] border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
            />
          </Field>

          <Field label="timezone" hint="we use this to roll over your day">
            <select
              name="timezone"
              defaultValue="UTC"
              className="w-full rounded-hc-2 border-[1.5px] border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none focus:border-hc-ink"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </Field>

          <Field label="bio" hint="optional · 160 chars max">
            <textarea
              name="bio"
              maxLength={160}
              rows={3}
              placeholder="i'm here to log my streaks and ignore my feelings."
              className="w-full resize-none rounded-hc-2 border-[1.5px] border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
            />
          </Field>

          <button
            type="submit"
            disabled
            className={`${buttonClass({ variant: "primary", size: "lg", fullWidth: true })} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            create account
          </button>
        </form>

        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-hc-muted">
          ui only · save not wired up yet
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-hc-ink">
        {label}
      </span>
      {children}
      {hint && (
        <span className="font-mono text-[10px] text-hc-muted">{hint}</span>
      )}
    </label>
  );
}
