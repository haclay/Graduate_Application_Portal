import Link from "next/link";

import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { Button } from "@/components/ui/button";
import type { ApplicationDeadline } from "@/lib/applications/types";
import { daysUntil } from "@/lib/applications/utils";

export function DeadlineList({ deadlines }: { deadlines: ApplicationDeadline[] }) {
  if (deadlines.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        暂无 DDL，请前往项目官网确认。
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {deadlines.map(({ application, deadline }) => {
        const program = application.programs;
        const school = program?.schools;
        const days = daysUntil(deadline.deadline_date);

        return (
          <article className="rounded-lg border bg-card p-5" key={deadline.id}>
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {deadline.round_name ?? "申请轮次待核对"} ·{" "}
                  {deadline.intake_term ?? "入学季待核对"}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {deadline.deadline_date ?? "DDL 待核对"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {school?.name ?? "未知学校"} · {program?.name ?? "未知项目"}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-md border bg-background px-3 py-1 text-sm">
                  {days === null
                    ? "天数待核对"
                    : days < 0
                      ? `已逾期 ${Math.abs(days)} 天`
                      : `还有 ${days} 天`}
                </span>
                <ApplicationStatusBadge status={application.status} />
              </div>
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href={`/applications/${application.id}`}>查看申请详情</Link>
              </Button>
              {program?.official_url ? (
                <Button asChild variant="outline">
                  <a href={program.official_url} rel="noreferrer" target="_blank">
                    项目官网
                  </a>
                </Button>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
