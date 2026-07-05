import type {
  ApplicationDeadline,
  ApplicationTask,
  ApplicationWithRelations,
} from "@/lib/applications/types";
import type { ProgramDeadline } from "@/lib/programs/types";

export function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateString(date: Date | null) {
  if (!date) {
    return null;
  }

  return date.toISOString().slice(0, 10);
}

export function dateFromString(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00`);
}

export function daysUntil(dateValue: string | null | undefined) {
  const date = dateFromString(dateValue);

  if (!date) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - today.getTime()) / 86_400_000);
}

export function findNearestDeadline(deadlines: ProgramDeadline[] | null | undefined) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dated = (deadlines ?? [])
    .filter((deadline) => deadline.deadline_date)
    .map((deadline) => ({
      date: dateFromString(deadline.deadline_date),
      deadline,
    }))
    .filter((item): item is { date: Date; deadline: ProgramDeadline } => Boolean(item.date))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    dated.find((item) => item.date >= today)?.deadline ??
    dated[0]?.deadline ??
    (deadlines ?? [])[0] ??
    null
  );
}

export function getTaskProgress(tasks: ApplicationTask[] | null | undefined) {
  const total = tasks?.length ?? 0;
  const completed = (tasks ?? []).filter((task) => task.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return { completed, percentage, total };
}

export function getApplicationDeadlines(applications: ApplicationWithRelations[]) {
  const items: ApplicationDeadline[] = [];

  applications.forEach((application) => {
    application.programs?.program_deadlines?.forEach((deadline) => {
      items.push({ application, deadline });
    });
  });

  return items.sort((a, b) => {
    const aDate = a.deadline.deadline_date ?? "9999-12-31";
    const bDate = b.deadline.deadline_date ?? "9999-12-31";
    return aDate.localeCompare(bDate);
  });
}

export function groupTasksByDueDate<T extends ApplicationTask>(tasks: T[]) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    completed: tasks.filter((task) => task.completed),
    dueIn30Days: tasks.filter((task) => {
      const days = daysUntil(task.due_date);
      return !task.completed && days !== null && days > 7 && days <= 30;
    }),
    dueIn7Days: tasks.filter((task) => {
      const days = daysUntil(task.due_date);
      return !task.completed && days !== null && days >= 0 && days <= 7;
    }),
    noDueDate: tasks.filter((task) => !task.completed && !task.due_date),
    overdue: tasks.filter((task) => {
      const days = daysUntil(task.due_date);
      return !task.completed && days !== null && days < 0;
    }),
  };
}
