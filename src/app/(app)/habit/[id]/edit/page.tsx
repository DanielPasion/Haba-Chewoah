import { type Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import { auth } from "~/server/auth";
import { db } from "~/server/db";

import { updateHabitAction } from "../../_actions";
import {
  type HabitFormDefaults,
  HabitForm,
} from "../../_components/habit-form";

type Params = Promise<{ id: string }>;

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const metadata: Metadata = { title: "edit habit" };

export default async function EditHabitPage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/auth/signin");
  if (!session.user.username) redirect("/create-account");

  const { id } = await params;
  if (!UUID_RE.test(id)) notFound();

  const habit = await db.habit.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      name: true,
      description: true,
      icon: true,
      frequencyType: true,
      targetCount: true,
      periodDays: true,
      isPublic: true,
    },
  });
  if (!habit) notFound();
  if (habit.userId !== session.user.id) notFound();

  const defaults: HabitFormDefaults = {
    name: habit.name,
    description: habit.description ?? "",
    icon: habit.icon ?? "",
    frequencyType: habit.frequencyType,
    targetCount: habit.targetCount,
    periodDays: habit.periodDays ?? 7,
    isPublic: habit.isPublic,
  };

  const action = updateHabitAction.bind(null, habit.id);

  return (
    <div className="-mx-5 -my-6 md:-mx-8 md:-my-8">
      <div className="mx-auto flex w-full max-w-115 flex-col gap-7 px-5 py-8 md:px-8 md:py-10">
        <div className="flex flex-col gap-2">
          <h1
            className="font-display text-3xl font-extrabold leading-none text-hc-ink"
            style={{ letterSpacing: "-0.04em" }}
          >
            edit habit
          </h1>
          <p className="text-sm text-hc-ink">
            tweak the rule, the cadence, or who can see it.
          </p>
        </div>

        <HabitForm
          mode="edit"
          habitId={habit.id}
          defaults={defaults}
          action={action}
        />
      </div>
    </div>
  );
}
