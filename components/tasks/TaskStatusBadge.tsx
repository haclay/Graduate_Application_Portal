export function TaskStatusBadge({ completed }: { completed: boolean | null }) {
  return (
    <span
      className={
        completed
          ? "rounded-md border border-emerald-200 bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-900"
          : "rounded-md border border-border bg-muted px-3 py-1 text-sm font-semibold text-foreground"
      }
    >
      {completed ? "已完成" : "未完成"}
    </span>
  );
}
