"use client";

import { useRouter } from "next/navigation";
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
  Record<"username" | "bio" | "timezone" | "avatar" | "form", string>
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
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result: UpdateProfileResult = await updateProfile(formData);
      if (result.ok) {
        router.push(`/profile/${result.username}`);
        router.refresh();
        return;
      }
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
          hint="3–32 chars · letters, numbers, underscore"
          error={errors.username}
        >
          <div className="flex items-stretch overflow-hidden rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface focus-within:border-hc-ink">
            <span className="grid place-items-center bg-hc-surface-alt px-3 font-mono text-sm font-bold text-hc-muted">
              @
            </span>
            <input
              type="text"
              name="username"
              defaultValue={username}
              required
              minLength={3}
              maxLength={32}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              pattern="[A-Za-z0-9_]{3,32}"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-sm font-semibold text-hc-ink outline-none placeholder:text-hc-muted-soft"
            />
          </div>
        </Field>

        <Field
          label="timezone"
          hint="we use this to roll over your day"
          error={errors.timezone}
        >
          <select
            name="timezone"
            defaultValue={defaultTimezone}
            className="w-full rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none focus:border-hc-ink"
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
            className="w-full resize-none rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
          />
        </Field>

        {errors.avatar && (
          <p className="font-mono text-hc-eyebrow uppercase tracking-hc-eyebrow text-hc-accent">
            avatar · {errors.avatar}
          </p>
        )}
        {errors.form && (
          <p className="font-mono text-hc-eyebrow uppercase tracking-hc-eyebrow text-hc-accent">
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
      <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
        {label}
      </span>
      {children}
      {error ? (
        <span className="font-mono text-hc-eyebrow text-hc-accent">{error}</span>
      ) : hint ? (
        <span className="font-mono text-hc-eyebrow text-hc-muted">{hint}</span>
      ) : null}
    </label>
  );
}
