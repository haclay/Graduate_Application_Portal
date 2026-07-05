import Link from "next/link";
import { redirect } from "next/navigation";
import type { ComponentType } from "react";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { ApplicationStatusBadge } from "@/components/applications/ApplicationStatusBadge";
import { LogoutButton } from "@/components/auth/logout-button";
import { SiteHeader } from "@/components/site-header";
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

const dashboardSections = [
  {
    title: "学生背景档案",
    description: "填写本科背景、成绩、经历和申请目标。",
    href: "/profile",
    icon: GraduationCap,
  },
  {
    title: "选校推荐",
    description: "根据背景档案输出彩票、冲刺、匹配、稳妥分层。",
    href: "/matching",
    icon: Sparkles,
  },
  {
    title: "申请清单",
    description: "管理目标项目、DDL、任务和申请状态。",
    href: "/applications",
    icon: ClipboardList,
  },
  {
    title: "任务管理",
    description: "查看近期申请任务和完成进度。",
    href: "/tasks",
    icon: ListChecks,
  },
  {
    title: "DDL 列表",
    description: "按截止日期查看申请清单里的项目 DDL。",
    href: "/calendar",
    icon: CalendarClock,
  },
  {
    title: "文书材料",
    description: "后续管理简历、文书和推荐信材料。",
    href: "/dashboard",
    icon: FileText,
  },
];

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

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">学生工作台</p>
            <h1 className="mt-2 text-3xl font-semibold">申请规划总览</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              当前登录账号：{user.email ?? "未知邮箱"}
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/profile/edit">
                {profile ? "编辑背景档案" : "填写背景档案"}
              </Link>
            </Button>
            <LogoutButton />
          </div>
        </div>

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
              可以先去项目库或选校推荐添加。
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

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dashboardSections.map((section) => {
            const Icon = section.icon;

            return (
              <article className="rounded-lg border bg-card p-5" key={section.title}>
                <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">
                  {section.description}
                </p>
                <Button asChild className="mt-5" variant="outline">
                  <Link href={section.href}>进入</Link>
                </Button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
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