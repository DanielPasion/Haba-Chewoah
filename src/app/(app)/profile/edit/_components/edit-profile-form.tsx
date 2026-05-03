"use client";

import { useState, useTransition } from "react";

import { AvatarUploader } from "~/components/avatar-uploader";
import { buttonClass } from "~/components/ui";
import { TIMEZONES } from "~/lib/timezones";

import {
  getAvatarUploadUrl,
  updateProfile,
  type UpdateProfileResult,
} from "../_actions";

type FieldErrors = Partial<
  Record<"bio" | "timezone" | "avatar" | "form", string>
>;

type Props = {
  username: string;
  defaultBio: string;
  defaultTimezone: string;
  defaultAvatarUrl: string | null;
};

export function EditProfileForm({
  username,
  defaultBio,
  defaultTimezone,
  defaultAvatarUrl,
}: Props) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result: UpdateProfileResult = await updateProfile(formData);
      if (result.ok) return; // server redirected; unreachable in practice
      if (result.field) setErrors({ [result.field]: result.message });
      else setErrors({ form: result.message });
    });
  }

  return (
    <form
      action={onSubmit}
      className="flex w-full flex-col items-center gap-8"
    >
      <AvatarUploader
        getUploadUrlAction={getAvatarUploadUrl}
        initialUrl={defaultAvatarUrl}
      />

      <div className="flex w-full flex-col gap-5">
        <Field
          label="username"
          hint="locked — usernames stay tied to your share-links"
        >
          <input
            type="text"
            value={`@${username}`}
            disabled
            readOnly
            aria-readonly
            className="w-full cursor-not-allowed rounded-hc-2 border-[1.5px] border-hc-line-strong bg-hc-surface-alt px-4 py-3 font-mono text-sm font-medium text-hc-muted outline-none"
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

        <Field
          label="bio"
          hint="optional · 160 chars max"
          error={errors.bio}
        >
          <textarea
            name="bio"
            maxLength={160}
            rows={3}
            defaultValue={defaultBio}
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

        <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:justify-between">
          <a
            href={`/profile/${username}`}
            className={buttonClass({ variant: "ghost", size: "md" })}
          >
            cancel
          </a>
          <button
            type="submit"
            disabled={pending}
            className={`${buttonClass({ variant: "primary", size: "md" })} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {pending ? "saving…" : "save changes"}
          </button>
        </div>
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
