"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { auth } from "~/server/auth";
import { db } from "~/server/db";
import {
  deleteHabitLogMediaObject,
  ownedHabitLogMediaKeyFromPublicUrl,
} from "~/server/r2";

import { FrequencyType } from "../../../../generated/prisma";

const FREQUENCY_VALUES = [
  FrequencyType.daily,
  FrequencyType.weekly,
  FrequencyType.n_per_period,
] as const;

const HabitFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "habit needs a name")
    .max(80, "name is too long"),
  description: z
    .string()
    .trim()
    .max(200, "description is too long")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  icon: z
    .string()
    .trim()
    .max(8, "use a single emoji")
    .optional()
    .transform((v) => (v && v.length > 0 ? v : null)),
  frequencyType: z.enum(FREQUENCY_VALUES),
  targetCount: z.coerce
    .number()
    .int()
    .min(1, "target must be at least 1")
    .max(99, "target is too high"),
  periodDays: z.coerce
    .number()
    .int()
    .min(2, "period must be at least 2 days")
    .max(365, "period is too long")
    .nullable()
    .optional(),
  isPublic: z.coerce.boolean(),
});

type ParsedHabit = z.infer<typeof HabitFormSchema>;
type HabitField = keyof ParsedHabit | "form";

export type HabitMutationResult =
  | { ok: true; habitId: string }
  | { ok: false; field?: HabitField; message: string };

function readFormData(formData: FormData) {
  // `isPublic` rides as "true"/"false" because hidden inputs always send
  // strings — coerce explicitly so the schema's boolean stays honest.
  // periodDays comes through as "" when frequency != n_per_period; the
  // schema's `z.coerce.number()` would turn "" into 0 and fail the .min,
  // so collapse empties to null up front.
  const rawIsPublic = formData.get("isPublic");
  const rawPeriodDays = formData.get("periodDays");
  return {
    name: formData.get("name"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    frequencyType: formData.get("frequencyType"),
    targetCount: formData.get("targetCount") ?? 1,
    periodDays:
      rawPeriodDays == null || rawPeriodDays === "" ? null : rawPeriodDays,
    isPublic: rawIsPublic === "true" || rawIsPublic === "on",
  };
}

// Daily forces target=1, no period; weekly has count but no period;
// n_per_period needs both. Keeping this in one spot so create + update agree.
function normalize(parsed: ParsedHabit) {
  if (parsed.frequencyType === FrequencyType.daily) {
    return { ...parsed, targetCount: 1, periodDays: null as number | null };
  }
  if (parsed.frequencyType === FrequencyType.weekly) {
    return { ...parsed, periodDays: null as number | null };
  }
  return { ...parsed, periodDays: parsed.periodDays ?? 7 };
}

function firstIssueField(error: z.ZodError): HabitField | undefined {
  const path = error.issues[0]?.path[0];
  if (typeof path !== "string") return undefined;
  return path as HabitField;
}

export async function createHabitAction(
  formData: FormData,
): Promise<HabitMutationResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    return { ok: false, message: "finish creating your account first" };
  }

  const parsed = HabitFormSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      field: firstIssueField(parsed.error),
      message: parsed.error.issues[0]?.message ?? "invalid input",
    };
  }

  const data = normalize(parsed.data);

  const habit = await db.habit.create({
    data: {
      userId: session.user.id,
      name: data.name,
      description: data.description,
      icon: data.icon,
      frequencyType: data.frequencyType,
      targetCount: data.targetCount,
      periodDays: data.periodDays,
      isPublic: data.isPublic,
      startDate: new Date(),
    },
    select: { id: true },
  });

  revalidatePath("/habits");
  revalidatePath(`/profile/${session.user.username}`);
  redirect(`/habit/${habit.id}`);
}

export async function updateHabitAction(
  habitId: string,
  formData: FormData,
): Promise<HabitMutationResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };
  if (!session.user.username) {
    return { ok: false, message: "finish creating your account first" };
  }

  // Confirm ownership before doing the work — `updateMany` would silently
  // no-op for non-owners, but we want to surface "not found" semantics.
  const existing = await db.habit.findUnique({
    where: { id: habitId },
    select: { userId: true },
  });
  if (!existing || existing.userId !== session.user.id) {
    return { ok: false, message: "habit not found" };
  }

  const parsed = HabitFormSchema.safeParse(readFormData(formData));
  if (!parsed.success) {
    return {
      ok: false,
      field: firstIssueField(parsed.error),
      message: parsed.error.issues[0]?.message ?? "invalid input",
    };
  }

  const data = normalize(parsed.data);

  await db.habit.update({
    where: { id: habitId },
    data: {
      name: data.name,
      description: data.description,
      icon: data.icon,
      frequencyType: data.frequencyType,
      targetCount: data.targetCount,
      periodDays: data.periodDays,
      isPublic: data.isPublic,
    },
  });

  revalidatePath("/habits");
  revalidatePath(`/habit/${habitId}`);
  revalidatePath(`/profile/${session.user.username}`);
  redirect(`/habit/${habitId}`);
}

export type DeleteHabitResult =
  | { ok: true }
  | { ok: false; message: string };

export async function deleteHabitAction(
  habitId: string,
): Promise<DeleteHabitResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, message: "not signed in" };

  // Enumerate media URLs first — once the habit row is gone the cascade
  // wipes habit_logs and we lose the URLs needed to find the R2 keys.
  // NOTES.md §17 cleanup contract: habit deletion must enumerate child
  // log media and delete the R2 objects in the same action.
  const mediaUrls = (
    await db.habitLog.findMany({
      where: { habitId, userId: session.user.id, mediaUrl: { not: null } },
      select: { mediaUrl: true },
    })
  )
    .map((l) => l.mediaUrl)
    .filter((u): u is string => u !== null);

  // `deleteMany` instead of `delete` so a missing/foreign row is a no-op
  // rather than P2025. The where-clause enforces ownership.
  const result = await db.habit.deleteMany({
    where: { id: habitId, userId: session.user.id },
  });
  if (result.count === 0) {
    return { ok: false, message: "habit not found" };
  }

  // Best-effort R2 cleanup after the DB commit. A storage failure here
  // must not flip the user's "habit deleted" outcome (matches the
  // avatar/log delete contract).
  for (const url of mediaUrls) {
    const key = ownedHabitLogMediaKeyFromPublicUrl(url, session.user.id);
    if (key) await deleteHabitLogMediaObject(key);
  }

  revalidatePath("/habits");
  if (session.user.username) {
    revalidatePath(`/profile/${session.user.username}`);
  }
  redirect("/habits");
}
