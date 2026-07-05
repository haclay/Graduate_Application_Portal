import { TaskItem } from "@/components/tasks/TaskItem";
import type { TaskWithApplication } from "@/lib/applications/types";

export function TaskList({
  emptyLabel,
  tasks,
  title,
  userId,
}: {
  emptyLabel: string;
  tasks: TaskWithApplication[];
  title: string;
  userId: string;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          {tasks.length}
        </span>
      </div>
      {tasks.length === 0 ? (
        <p className="mt-5 rounded-md border bg-background p-4 text-sm text-muted-foreground">
          {emptyLabel}
        </p>
      ) : (
        <div className="mt-5 grid gap-3">
          {tasks.map((task) => (
            <TaskItem key={task.id} task={task} userId={userId} />
          ))}
        </div>
      )}
    </section>
  );
}
