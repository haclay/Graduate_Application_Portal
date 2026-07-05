"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createCustomTask } from "@/lib/applications/actions";
import type { ApplicationTaskType } from "@/lib/applications/types";

const taskTypes: Array<{ label: string; value: ApplicationTaskType }> = [
  { label: "CV / Resume", value: "cv" },
  { label: "SOP / 文书", value: "sop" },
  { label: "成绩单", value: "transcript" },
  { label: "推荐信", value: "recommendation" },
  { label: "语言成绩", value: "language_score" },
  { label: "网申表格", value: "application_form" },
  { label: "申请费", value: "fee" },
  { label: "其他", value: "other" },
];

export function CustomTaskForm({
  applicationId,
  userId,
}: {
  applicationId: string;
  userId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [taskType, setTaskType] = useState<ApplicationTaskType>("other");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setMessage("任务标题不能为空。");
      return;
    }

    setIsPending(true);
    const result = await createCustomTask(applicationId, userId, {
      description,
      due_date: dueDate,
      task_type: taskType,
      title,
    });
    setIsPending(false);
    setMessage(result.message);

    if (result.ok) {
      setTitle("");
      setDescription("");
      setDueDate("");
      setTaskType("other");
      router.refresh();
    }
  }

  return (
    <form className="rounded-lg border bg-card p-5" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold">新增自定义任务</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          任务标题
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setTitle(event.target.value)}
            required
            value={title}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          任务类型
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setTaskType(event.target.value as ApplicationTaskType)}
            value={taskType}
          >
            {taskTypes.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-medium">
          截止日期
          <input
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setDueDate(event.target.value)}
            type="date"
            value={dueDate}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium md:col-span-2">
          任务描述
          <textarea
            className="min-h-24 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setDescription(event.target.value)}
            value={description}
          />
        </label>
      </div>
      <Button className="mt-5" disabled={isPending} type="submit">
        {isPending ? "创建中..." : "创建任务"}
      </Button>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </form>
  );
}