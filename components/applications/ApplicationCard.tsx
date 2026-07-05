"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { ApplicationProgress } from "@/components/applications/ApplicationProgress";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { Button } from "@/components/ui/button";
import { removeApplication } from "@/lib/applications/actions";
import type { ApplicationWithRelations } from "@/lib/applications/types";
import { applicationPriorityLabels } from "@/lib/applications/types";
import { findNearestDeadline } from "@/lib/applications/utils";

export function ApplicationCard({
  application,
  userId,
}: {
  application: ApplicationWithRelations;
  userId: string;
}) {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const program = application.programs;
  const school = program?.schools;
  const nearestDeadline = findNearestDeadline(program?.program_deadlines);

  async function handleDelete() {
    const confirmed = window.confirm("确定要删除这个申请项目吗？相关任务也会删除。");

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    const result = await removeApplication(application.id, userId);
    setIsDeleting(false);
    setMessage(result.message);

    if (result.ok) {
      router.refresh();
    }
  }

  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{school?.name ?? "未知学校"}</p>
          <h2 className="mt-1 text-xl font-semibold">{program?.name ?? "未知项目"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {school?.country ?? "国家待核对"}
            {school?.city ? ` / ${school.city}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ApplicationStatusBadge status={application.status} />
          <span className="rounded-md border bg-background px-3 py-1 text-sm">
            优先级：{applicationPriorityLabels[application.priority ?? "medium"]}
          </span>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-md border bg-background p-4 text-sm">
          <span className="text-muted-foreground">最近 DDL：</span>
          {nearestDeadline?.deadline_date ?? "请以官网为准"}
        </div>
        <ApplicationProgress tasks={application.application_tasks} />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href={`/applications/${application.id}`}>查看详情</Link>
        </Button>
        <Button disabled={isDeleting} onClick={handleDelete} type="button" variant="outline">
          {isDeleting ? "删除中..." : "删除"}
        </Button>
      </div>
      {message ? <p className="mt-3 text-sm text-muted-foreground">{message}</p> : null}
    </article>
  );
}