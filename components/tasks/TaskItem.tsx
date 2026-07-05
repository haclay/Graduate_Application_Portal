"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { Button } from "@/components/ui/button";
import { deleteTask, toggleTaskCompleted } from "@/lib/applications/actions";
import type { TaskWithApplication } from "@/lib/applications/types";

export function TaskItem({
  task,
  userId,
}: {
  task: TaskWithApplication;
  userId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const application = task.applications;
  const program = application?.programs;
  const school = program?.schools;

  async function handleToggle() {
    setIsPending(true);
    const result = await toggleTaskCompleted(task.id, userId);
    setIsPending(false);
    setMessage(result.message);

    if (result.ok) {
      router.refresh();
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("确定删除这个任务吗？");

    if (!confirmed) {
      return;
    }

    setIsPending(true);
    const result = await deleteTask(task.id, userId);
    setIsPending(false);
    setMessage(result.message);

    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <article className="rounded-md border bg-background p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h3 className="font-semibold">{task.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {school?.name ?? "未知学校"} · {program?.name ?? "未知项目"}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            截止日期：{task.due_date ?? "无截止日期"}
          </p>
          {task.description ? (
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {task.description}
            </p>
          ) : null}
        </div>
        <TaskStatusBadge completed={task.completed} />
      </div>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Button disabled={isPending} onClick={handleToggle} size="sm" type="button">
          {task.completed ? "标记未完成" : "标记完成"}
        </Button>
        {application ? (
          <Button asChild size="sm" variant="outline">
            <Link href={`/applications/${application.id}`}>查看申请</Link>
          </Button>
        ) : null}
        <Button
          disabled={isPending}
          onClick={handleDelete}
          size="sm"
          type="button"
          variant="outline"
        >
          删除任务
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </article>
  );
}