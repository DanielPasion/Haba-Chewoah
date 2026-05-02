"use client";

import { useState, useTransition } from "react";

import { buttonClass } from "~/components/ui";

import { createProfile, type CreateProfileResult } from "../_actions";
import { AvatarUploader } from "./avatar-uploader";

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

type FieldErrors = Partial<Record<"username" | "bio" | "timezone" | "avatar" | "form", string>>;

export function ProfileForm({
  defaultTimezone,
}: {
  defaultTimezone: string;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result: CreateProfileResult = await createProfile(formData);
      if (result.ok) return; // server redirected; this branch effectively unreachable
      if (result.field) setErrors({ [result.field]: result.message });
      else setErrors({ form: result.message });
    });
  }

  return (
    <form
      action={onSubmit}
      className="flex w-full flex-col items-center gap-8"
    >
      <AvatarUploader />

      <div className="flex w-full flex-col gap-5">
        <Field
          label="username"
          hint="3–32 chars · letters, numbers, underscore"
          error={errors.username}
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

        <Field
          label="timezone"
          hint="we use this to roll over your day"
          error={errors.timezone}
        >
          <select
            name="timezone"
            defaultValue={defaultTimezone}
            className="w-full rounded-hc-2 border-[1.5px] border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none focus:border-hc-ink"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </Field>

        <Field label="bio" hint="optional · 160 chars max" error={errors.bio}>
          <textarea
            name="bio"
            maxLength={160}
            rows={3}
            placeholder="i'm here to log my streaks and ignore my feelings."
            className="w-full resize-none rounded-hc-2 border-[1.5px] border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
          />
        </Field>

        {errors.avatar && (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-hc-accent">
            avatar · {errors.avatar}
          </p>
        )}
        {errors.form && (
          <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-hc-accent">
            {errors.form}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className={`${buttonClass({ variant: "primary", size: "lg", fullWidth: true })} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {pending ? "creating…" : "create account"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-hc-ink">
        {label}
      </span>
      {children}
      {error ? (
        <span className="font-mono text-[10px] text-hc-accent">{error}</span>
      ) : hint ? (
        <span className="font-mono text-[10px] text-hc-muted">{hint}</span>
      ) : null}
    </label>
  );
}
