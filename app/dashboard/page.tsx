import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  ListChecks,
} from "lucide-react";

import { AppShell } from "@/components/workspace/AppShell";
import { Button } from "@/components/ui/button";
import {
  getUserApplicationDeadlines,
  getUserApplications,
  getUserTasks,
} from "@/lib/applications/queries";
import { applicationStatusLabels } from "@/lib/applications/types";
import { daysUntil } from "@/lib/applications/utils";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import type { StudentProfile } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<StudentProfile>();

  if (!profile?.full_name?.trim()) {
    redirect("/onboarding");
  }

  const completion = calculateProfileCompletion(profile);
  const [applicationsResult, tasksResult, deadlinesResult] = await Promise.all([
    getUserApplications(user.id),
    getUserTasks(user.id),
    getUserApplicationDeadlines(user.id),
  ]);
  const applications = applicationsResult.data;
  const tasks = tasksResult.data;
  const deadlines = deadlinesResult.data;
  const openTasks = tasks.filter((task) => !task.completed);
  const sevenDayTasks = openTasks.filter((task) => {
    const days = daysUntil(task.due_date);
    return days !== null && days >= 0 && days <= 7;
  });
  const thirtyDayDeadlines = deadlines.filter(({ deadline }) => {
    const days = daysUntil(deadline.deadline_date);
    return days !== null && days >= 0 && days <= 30;
  });
  const recentTasks = [...openTasks]
    .sort((a, b) => (a.due_date ?? "9999-12-31").localeCompare(b.due_date ?? "9999-12-31"))
    .slice(0, 5);
  const recentDeadlines = deadlines
    .filter(({ deadline }) => {
      const days = daysUntil(deadline.deadline_date);
      return days === null || days >= 0;
    })
    .slice(0, 5);
  const statusEntries = Object.entries(applicationStatusLabels).map(([status, label]) => ({
    count: applications.filter((application) => application.status === status).length,
    label,
    status,
  }));
  const displayName = profile?.full_name ?? profile?.nickname ?? user.email?.split("@")[0] ?? "\u540c\u5b66";

  return (
    <AppShell userEmail={user.email} userName={profile?.full_name ?? profile?.nickname}>
      <section className="py-4">
        <div className="flex flex-col justify-between gap-4 border-b pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">工作台首页</p>
            <h1 className="mt-2 text-3xl font-semibold">你好，{displayName}</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              这里是你的研究生申请工作台。你可以从这里查看背景完成度、目标项目、近期待办任务和关键 DDL。
            </p>
          </div>
          <Button asChild>
            <Link href="/profile/edit">
              {profile ? "编辑背景档案" : "填写背景档案"}
            </Link>
          </Button>
        </div>

        <section className="mt-8 rounded-lg border bg-card p-5">
          <div className="flex flex-col justify-between gap-3 border-b pb-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold text-primary">当前背景摘要</p>
              <h2 className="mt-1 text-xl font-semibold">申请画像</h2>
            </div>
            <Button asChild variant="outline">
              <Link href="/profile">查看完整档案</Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileSummaryItem label="本科学校" value={profile?.undergraduate_school} />
            <ProfileSummaryItem label="本科专业" value={profile?.undergraduate_major} />
            <ProfileSummaryItem label="GPA" value={profile?.gpa && profile?.gpa_scale ? `${profile.gpa} / ${profile.gpa_scale}` : null} />
            <ProfileSummaryItem label="目标国家" value={formatArray(profile?.target_countries)} />
            <ProfileSummaryItem label="目标专业" value={formatArray(profile?.target_majors)} />
            <ProfileSummaryItem label="计划入学年份" value={profile?.planned_entry_year ? String(profile.planned_entry_year) : null} />
          </div>
        </section>

        <div className="mt-8 rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">背景完成度</p>
              <p className="text-3xl font-semibold">{completion.percentage}%</p>
            </div>
            <p className="text-sm text-muted-foreground">
              已完成 {completion.completedFields} / {completion.totalFields} 个关键字段
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>
        </div>

        <NextStepCard
          applicationsCount={applications.length}
          completionPercentage={completion.percentage}
          recentDeadlines={recentDeadlines.slice(0, 3)}
          recentTasks={recentTasks.slice(0, 3)}
        />

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard icon={ClipboardList} label="我的申请" value={applications.length} />
          <MetricCard icon={ListChecks} label="未完成任务" value={openTasks.length} />
          <MetricCard icon={CheckCircle2} label="7 天内任务" value={sevenDayTasks.length} />
          <MetricCard icon={CalendarClock} label="30 天内 DDL" value={thirtyDayDeadlines.length} />
        </div>

        {(applicationsResult.error || tasksResult.error || deadlinesResult.error) ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {applicationsResult.error ?? tasksResult.error ?? deadlinesResult.error}
          </div>
        ) : applications.length === 0 ? (
          <div className="mt-8 rounded-lg border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">你还没有申请项目</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              你还没有申请项目，可以先去项目库或选校推荐添加。
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/programs">去项目库</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/matching">去选校推荐</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <section className="rounded-lg border bg-card p-5">
              <h2 className="text-lg font-semibold">最近 5 个待办任务</h2>
              <div className="mt-5 grid gap-3">
                {recentTasks.length === 0 ? (
                  <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                    暂无未完成任务。
                  </p>
                ) : (
                  recentTasks.map((task) => (
                    <Link
                      className="rounded-md border bg-background p-4 text-sm transition-colors hover:bg-muted"
                      href={`/applications/${task.application_id}`}
                      key={task.id}
                    >
                      <p className="font-medium">{task.title}</p>
                      <p className="mt-1 text-muted-foreground">
                        {task.applications?.programs?.schools?.name ?? "未知学校"} · {task.due_date ?? "无截止日期"}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg border bg-card p-5">
              <h2 className="text-lg font-semibold">最近 5 个 DDL</h2>
              <div className="mt-5 grid gap-3">
                {recentDeadlines.length === 0 ? (
                  <p className="rounded-md border bg-background p-4 text-sm text-muted-foreground">
                    暂无 DDL，请前往项目官网确认。
                  </p>
                ) : (
                  recentDeadlines.map(({ application, deadline }) => (
                    <Link
                      className="rounded-md border bg-background p-4 text-sm transition-colors hover:bg-muted"
                      href={`/applications/${application.id}`}
                      key={deadline.id}
                    >
                      <p className="font-medium">{deadline.deadline_date ?? "DDL 待核对"}</p>
                      <p className="mt-1 text-muted-foreground">
                        {application.programs?.schools?.name ?? "未知学校"} · {application.programs?.name ?? "未知项目"}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </section>

            <section className="rounded-lg border bg-card p-5 lg:col-span-2">
              <h2 className="text-lg font-semibold">申请状态分布</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {statusEntries.map((entry) => (
                  <div className="rounded-md border bg-background p-4" key={entry.status}>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">{entry.label}</span>
                      <span className="text-lg font-semibold">{entry.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

      </section>
    </AppShell>
  );
}

function ProfileSummaryItem({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="rounded-md border bg-background p-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value ?? "待完善"}</p>
    </div>
  );
}

function formatArray(value: string[] | null | undefined) {
  return value && value.length > 0 ? value.join("、") : null;
}
function NextStepCard({
  applicationsCount,
  completionPercentage,
  recentDeadlines,
  recentTasks,
}: {
  applicationsCount: number;
  completionPercentage: number;
  recentDeadlines: Array<{
    application: {
      id: string;
      programs?: {
        name?: string | null;
        schools?: { name?: string | null } | null;
      } | null;
    };
    deadline: { deadline_date: string | null; id: string };
  }>;
  recentTasks: Array<{
    application_id: string;
    due_date: string | null;
    id: string;
    title: string;
  }>;
}) {
  const profileIncomplete = completionPercentage < 100;
  const noApplications = applicationsCount === 0;

  return (
    <section className="mt-8 rounded-lg border bg-card p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <p className="text-sm font-semibold text-primary">下一步建议</p>
          <h2 className="mt-2 text-xl font-semibold">
            {profileIncomplete
              ? "先完善学生背景档案"
              : noApplications
                ? "去项目库或选校推荐添加目标项目"
                : recentTasks.length > 0
                  ? "先处理最近的待办任务"
                  : "检查近期 DDL 和申请状态"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            MyGrad 会根据你的背景、申请清单、待办任务和 DDL，优先提示最值得处理的下一步。
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-wrap lg:justify-end">
          <Button asChild variant="outline">
            <Link href="/profile/edit">完善背景</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/matching">查看选校推荐</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/applications">查看申请清单</Link>
          </Button>
          <Button asChild>
            <Link href="/tasks">查看任务</Link>
          </Button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="rounded-md border bg-background p-4">
          <h3 className="font-medium">最近 3 个待办任务</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            {recentTasks.length === 0 ? (
              <p>暂无未完成任务。</p>
            ) : (
              recentTasks.map((task) => (
                <Link className="transition-colors hover:text-foreground" href={`/applications/${task.application_id}`} key={task.id}>
                  {task.title} · {task.due_date ?? "无截止日期"}
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="rounded-md border bg-background p-4">
          <h3 className="font-medium">最近 3 个 DDL</h3>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            {recentDeadlines.length === 0 ? (
              <p>暂无 DDL，请前往项目官网确认。</p>
            ) : (
              recentDeadlines.map(({ application, deadline }) => (
                <Link className="transition-colors hover:text-foreground" href={`/applications/${application.id}`} key={deadline.id}>
                  {deadline.deadline_date ?? "DDL 待核对"} · {application.programs?.schools?.name ?? "未知学校"} · {application.programs?.name ?? "未知项目"}
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  value: number;
}) {
  return (
    <article className="rounded-lg border bg-card p-5">
      <Icon className="h-5 w-5 text-primary" aria-hidden />
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
    </article>
  );
}
