export function TaskStatusBadge({ completed }: { completed: boolean | null }) {
  return (
    <span
      className={
        completed
          ? "rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground"
          : "rounded-md bg-muted px-3 py-1 text-sm font-medium text-muted-foreground"
      }
    >
      {completed ? "已完成" : "未完成"}
    </span>
  );
}
