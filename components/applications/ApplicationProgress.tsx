import type { ApplicationTask } from "@/lib/applications/types";
import { getTaskProgress } from "@/lib/applications/utils";

export function ApplicationProgress({
  tasks,
}: {
  tasks: ApplicationTask[] | null | undefined;
}) {
  const progress = getTaskProgress(tasks);

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">任务进度</span>
        <span className="font-medium">
          {progress.completed} / {progress.total}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
    </div>
  );
}
