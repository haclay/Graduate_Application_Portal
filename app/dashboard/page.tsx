import Link from "next/link";
import { redirect } from "next/navigation";
import { ClipboardList, FileText, GraduationCap, ListChecks, Sparkles } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
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
    description: "未来将根据背景档案输出彩票、冲刺、匹配、稳妥分层。",
    href: "/matching",
    icon: Sparkles,
  },
  {
    title: "申请清单",
    description: "未来将管理目标项目、DDL 和申请状态。",
    href: "/applications",
    icon: ClipboardList,
  },
  {
    title: "任务时间线",
    description: "用于展示近期申请任务和截止日期。",
    href: "/dashboard",
    icon: ListChecks,
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