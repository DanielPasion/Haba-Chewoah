"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { buttonClass } from "~/components/ui";

import {
  type HabitMutationResult,
  deleteHabitAction,
} from "../_actions";
import { IconPicker } from "./icon-picker";

type FrequencyType = "daily" | "weekly" | "n_per_period";

type FieldErrors = Partial<
  Record<
    | "name"
    | "description"
    | "icon"
    | "frequencyType"
    | "targetCount"
    | "periodDays"
    | "isPublic"
    | "form",
    string
  >
>;

export type HabitFormDefaults = {
  name: string;
  description: string;
  icon: string;
  frequencyType: FrequencyType;
  targetCount: number;
  periodDays: number;
  isPublic: boolean;
};

export const HABIT_FORM_BLANK_DEFAULTS: HabitFormDefaults = {
  name: "",
  description: "",
  icon: "",
  frequencyType: "daily",
  targetCount: 1,
  periodDays: 7,
  isPublic: true,
};

type Props = {
  mode: "create" | "edit";
  habitId?: string;
  defaults?: HabitFormDefaults;
  action: (formData: FormData) => Promise<HabitMutationResult>;
};

export function HabitForm({
  mode,
  habitId,
  defaults = HABIT_FORM_BLANK_DEFAULTS,
  action,
}: Props) {
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pending, startTransition] = useTransition();

  const [icon, setIcon] = useState(defaults.icon);
  const [frequency, setFrequency] = useState<FrequencyType>(
    defaults.frequencyType,
  );
  const [targetCount, setTargetCount] = useState(defaults.targetCount);
  const [periodDays, setPeriodDays] = useState(defaults.periodDays);
  const [isPublic, setIsPublic] = useState(defaults.isPublic);

  const [deleting, startDelete] = useTransition();

  function onSubmit(formData: FormData) {
    setErrors({});
    startTransition(async () => {
      const result = await action(formData);
      if (result.ok) {
        router.push(`/habit/${result.habitId}`);
        return;
      }
      if (result.field && result.field !== "form") {
        setErrors({ [result.field]: result.message });
      } else {
        setErrors({ form: result.message });
      }
    });
  }

  function onDelete() {
    if (!habitId) return;
    if (!confirm("delete this habit? this cannot be undone.")) return;
    startDelete(async () => {
      const result = await deleteHabitAction(habitId);
      if (result.ok) {
        router.push(result.redirectTo);
        return;
      }
      setErrors({ form: result.message });
    });
  }

  return (
    <form
      action={onSubmit}
      className="flex w-full flex-col gap-5"
      noValidate
    >
      <input type="hidden" name="frequencyType" value={frequency} />
      <input type="hidden" name="targetCount" value={targetCount} />
      <input
        type="hidden"
        name="periodDays"
        value={frequency === "n_per_period" ? periodDays : ""}
      />
      <input
        type="hidden"
        name="isPublic"
        value={isPublic ? "true" : "false"}
      />

      <Field label="habit name" error={errors.name}>
        <div className="flex items-stretch gap-2">
          <IconPicker value={icon} onChange={setIcon} />
          <input
            type="text"
            name="name"
            defaultValue={defaults.name}
            placeholder="cold plunge"
            maxLength={80}
            required
            className="min-w-0 flex-1 rounded-hc-2 border border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm font-semibold text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
          />
        </div>
      </Field>

      <Field
        label="the rule"
        hint="optional · what counts? what doesn't?"
        error={errors.description}
      >
        <textarea
          name="description"
          defaultValue={defaults.description}
          placeholder="60 sec @ 38°F. before coffee. no exceptions."
          maxLength={200}
          rows={3}
          className="w-full resize-none rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-4 py-3 font-sans text-sm text-hc-ink outline-none placeholder:text-hc-muted-soft focus:border-hc-ink"
        />
      </Field>

      <Field label="frequency" error={errors.frequencyType}>
        <div className="grid grid-cols-3 gap-2">
          {(
            [
              { id: "daily", label: "daily" },
              { id: "weekly", label: "weekly" },
              { id: "n_per_period", label: "N / period" },
            ] as const
          ).map((f) => {
            const selected = f.id === frequency;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFrequency(f.id)}
                className={`rounded-hc-2 border-hc px-3 py-3 font-sans text-hc-button font-bold transition-colors ${
                  selected
                    ? "border-hc-ink bg-hc-ink text-hc-brand dark:bg-hc-brand dark:text-hc-brand-ink"
                    : "border-hc-line-strong bg-hc-surface text-hc-ink hover:bg-hc-surface-alt"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </Field>

      {frequency !== "daily" && (
        <Field
          label={frequency === "weekly" ? "target per week" : "target"}
          error={errors.targetCount ?? errors.periodDays}
        >
          <div className="flex flex-wrap items-center gap-3 rounded-hc-2 border-hc border-hc-line-strong bg-hc-surface px-4 py-3">
            <span className="font-sans text-sm font-semibold text-hc-ink">
              at least
            </span>
            <Stepper
              value={targetCount}
              min={1}
              max={99}
              onChange={setTargetCount}
            />
            <span className="font-sans text-sm font-semibold text-hc-ink">
              {frequency === "weekly" ? "× per week" : "× per"}
            </span>
            {frequency === "n_per_period" && (
              <>
                <Stepper
                  value={periodDays}
                  min={2}
                  max={365}
                  onChange={setPeriodDays}
                />
                <span className="font-sans text-sm font-semibold text-hc-ink">
                  days
                </span>
              </>
            )}
          </div>
        </Field>
      )}

      <Field label="visibility" error={errors.isPublic}>
        <div className="grid grid-cols-2 gap-2">
          <VisibilityChip
            selected={isPublic}
            onClick={() => setIsPublic(true)}
            title="public"
            hint="shows in feed"
          />
          <VisibilityChip
            selected={!isPublic}
            onClick={() => setIsPublic(false)}
            title="private"
            hint="just for you"
          />
        </div>
      </Field>

      {errors.form && (
        <p className="font-mono text-hc-eyebrow uppercase tracking-hc-eyebrow text-hc-accent">
          {errors.form}
        </p>
      )}

      <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:justify-between">
        <Link
          href={mode === "edit" && habitId ? `/habit/${habitId}` : "/profile"}
          className={buttonClass({ variant: "ghost", size: "md" })}
        >
          cancel
        </Link>
        <button
          type="submit"
          disabled={pending || deleting}
          className={`${buttonClass({ variant: "primary", size: "md" })} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {pending
            ? mode === "edit"
              ? "saving…"
              : "starting…"
            : mode === "edit"
              ? "save changes"
              : "start habit"}
        </button>
      </div>

      {mode === "edit" && habitId && (
        <div className="mt-6 flex flex-col gap-3 rounded-hc-3 border-hc border-dashed border-hc-line-strong bg-hc-surface-alt px-4 py-4">
          <div className="flex flex-col gap-0.5">
            <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
              danger zone
            </span>
            <span className="font-mono text-hc-eyebrow text-hc-muted">
              deleting wipes the habit and every log, like, and comment on
              it. cannot be undone.
            </span>
          </div>
          <button
            type="button"
            onClick={onDelete}
            disabled={pending || deleting}
            className={`${buttonClass({ variant: "secondary", size: "md" })} disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {deleting ? "deleting…" : "delete habit"}
          </button>
        </div>
      )}
    </form>
  );
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="grid size-8 cursor-pointer place-items-center rounded-full border-hc border-hc-line-strong bg-hc-bg font-display text-base font-extrabold text-hc-ink hover:bg-hc-surface-alt"
        aria-label="decrease"
      >
        −
      </button>
      <span
        className="min-w-7 text-center font-display text-xl font-extrabold text-hc-ink tabular-nums"
        style={{ letterSpacing: "-0.03em" }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="grid size-8 cursor-pointer place-items-center rounded-full border-hc border-hc-line-strong bg-hc-bg font-display text-base font-extrabold text-hc-ink hover:bg-hc-surface-alt"
        aria-label="increase"
      >
        +
      </button>
    </div>
  );
}

function VisibilityChip({
  selected,
  onClick,
  title,
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-start gap-0.5 rounded-hc-2 border-hc px-4 py-3 text-left transition-colors ${
        selected
          ? "border-hc-ink bg-hc-ink text-hc-brand dark:bg-hc-brand dark:text-hc-brand-ink"
          : "border-hc-line-strong bg-hc-surface text-hc-ink hover:bg-hc-surface-alt"
      }`}
    >
      <span className="font-sans text-hc-button font-bold">{title}</span>
      <span
        className={`font-mono text-hc-tiny font-semibold ${
          selected
            ? "text-hc-brand/80 dark:text-hc-brand-ink/70"
            : "text-hc-muted"
        }`}
      >
        {hint}
      </span>
    </button>
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
    <div className="flex flex-col gap-1.5">
      <span className="font-mono text-hc-eyebrow font-bold uppercase tracking-hc-eyebrow text-hc-ink">
        {label}
      </span>
      {children}
      {error ? (
        <span className="font-mono text-hc-eyebrow text-hc-accent">
          {error}
        </span>
      ) : hint ? (
        <span className="font-mono text-hc-eyebrow text-hc-muted">{hint}</span>
      ) : null}
    </div>
  );
}
