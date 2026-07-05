"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  removeApplication,
  updateApplicationNotes,
  updateApplicationStatus,
} from "@/lib/applications/actions";
import type { ApplicationStatus } from "@/lib/applications/types";
import { applicationStatusLabels } from "@/lib/applications/types";

const statuses = Object.keys(applicationStatusLabels) as ApplicationStatus[];

export function ApplicationDetailControls({
  applicationId,
  initialNotes,
  initialStatus,
  userId,
}: {
  applicationId: string;
  initialNotes: string | null;
  initialStatus: ApplicationStatus;
  userId: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<ApplicationStatus>(initialStatus);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleStatusSave() {
    setIsPending(true);
    const result = await updateApplicationStatus(applicationId, userId, status);
    setIsPending(false);
    setMessage(result.message);

    if (result.ok) {
      router.refresh();
    }
  }

  async function handleNotesSave() {
    setIsPending(true);
    const result = await updateApplicationNotes(applicationId, userId, notes);
    setIsPending(false);
    setMessage(result.message);

    if (result.ok) {
      router.refresh();
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("确定删除整个申请项目吗？相关任务也会删除。");

    if (!confirmed) {
      return;
    }

    setIsPending(true);
    const result = await removeApplication(applicationId, userId);
    setIsPending(false);
    setMessage(result.message);

    if (result.ok) {
      router.push("/applications");
      router.refresh();
    }
  }

  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">申请管理</h2>
      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-sm font-medium">
          当前申请状态
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setStatus(event.target.value as ApplicationStatus)}
            value={status}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {applicationStatusLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <Button disabled={isPending} onClick={handleStatusSave} type="button">
          保存状态
        </Button>
        <label className="grid gap-2 text-sm font-medium">
          备注
          <textarea
            className="min-h-32 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            onChange={(event) => setNotes(event.target.value)}
            placeholder="记录网申账号、材料备注、项目偏好等信息。"
            value={notes}
          />
        </label>
        <Button disabled={isPending} onClick={handleNotesSave} type="button" variant="outline">
          保存备注
        </Button>
        <Button disabled={isPending} onClick={handleDelete} type="button" variant="destructive">
          删除整个申请项目
        </Button>
        {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      </div>
    </section>
  );
}