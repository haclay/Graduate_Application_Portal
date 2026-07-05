import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { ApplicationDetailControls } from "@/components/applications/ApplicationDetailControls";
import { ApplicationProgress } from "@/components/applications/ApplicationProgress";
import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { DeadlineList } from "@/components/calendar/DeadlineList";
import { AppShell } from "@/components/workspace/AppShell";
import { CustomTaskForm } from "@/components/tasks/CustomTaskForm";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Button } from "@/components/ui/button";
import { getApplicationById } from "@/lib/applications/queries";
import type { TaskWithApplication } from "@/lib/applications/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const applicationResult = await getApplicationById(id, user.id);

  if (applicationResult.error) {
    return <ErrorPage message={applicationResult.error} userEmail={user.email} />;
  }

  if (!applicationResult.data) {
    notFound();
  }

  const application = applicationResult.data;
  const program = application.programs;
  const school = program?.schools;
  const detailTasks: TaskWithApplication[] = (application.application_tasks ?? []).map(
    (task) => ({
      ...task,
      applications: application,
    }),
  );

  return (
    <AppShell userEmail={user.email}>
      <section className="py-4">
        <Button asChild variant="ghost">
          <Link href="/applications">返回申请清单</Link>
        </Button>
        <div className="mt-6 flex flex-col justify-between gap-4 border-b pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">申请项目详情</p>
            <h1 className="mt-2 text-3xl font-semibold">
              {program?.name ?? "未知项目"}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {school?.name ?? "未知学校"}
              {school?.country ? ` · ${school.country}` : ""}
              {school?.city ? ` / ${school.city}` : ""}
            </p>
          </div>
          <ApplicationStatusBadge status={application.status} />
        </div>

        <div className="mt-6 rounded-lg border bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">
          DDL 和申请要求请以学校官网为准。
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">项目信息</h2>
            <dl className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoItem label="学校" value={school?.name} />
              <InfoItem label="项目" value={program?.name} />
              <InfoItem label="国家 / 城市" value={`${school?.country ?? "待核对"} / ${school?.city ?? "待核对"}`} />
              <InfoItem label="专业方向" value={program?.field} />
              <InfoItem label="学位类型" value={program?.degree_type} />
              <InfoItem label="项目时长" value={program?.duration} />
            </dl>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {program?.official_url ? (
                <Button asChild>
                  <a href={program.official_url} rel="noreferrer" target="_blank">
                    项目官网
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              ) : null}
              {program?.slug ? (
                <Button asChild variant="outline">
                  <Link href={`/programs/${program.slug}`}>查看项目库详情</Link>
                </Button>
              ) : null}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">任务完成进度</h2>
            <div className="mt-5">
              <ApplicationProgress tasks={application.application_tasks} />
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <ApplicationDetailControls
            applicationId={application.id}
            initialNotes={application.notes}
            initialStatus={application.status}
            userId={user.id}
          />
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">DDL 列表</h2>
            <div className="mt-5">
              <DeadlineList
                deadlines={(program?.program_deadlines ?? []).map((deadline) => ({
                  application,
                  deadline,
                }))}
              />
            </div>
          </section>
        </div>

        <div className="mt-8 grid gap-5">
          <CustomTaskForm applicationId={application.id} userId={user.id} />
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">任务清单</h2>
            {detailTasks.length === 0 ? (
              <p className="mt-5 rounded-md border bg-background p-4 text-sm text-muted-foreground">
                暂无任务。
              </p>
            ) : (
              <div className="mt-5 grid gap-3">
                {detailTasks.map((task) => (
                  <TaskItem key={task.id} task={task} userId={user.id} />
                ))}
              </div>
            )}
          </section>
        </div>
      </section>
    </AppShell>
  );
}

function ErrorPage({ message, userEmail }: { message: string; userEmail: string | null | undefined }) {
  return (
    <AppShell userEmail={userEmail}>
      <section className="py-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {message}
        </div>
      </section>
    </AppShell>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-md border bg-background p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-sm font-medium">{value ?? "请以官网为准"}</dd>
    </div>
  );
}
