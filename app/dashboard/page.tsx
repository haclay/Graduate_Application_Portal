import Link from "next/link";
import { ClipboardList, FileText, GraduationCap, ListChecks } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const dashboardSections = [
  {
    title: "学生背景档案",
    description: "第 2 阶段将接入表单和保存能力。",
    icon: GraduationCap,
  },
  {
    title: "申请清单",
    description: "第 5 阶段将管理目标项目、DDL 和状态。",
    icon: ClipboardList,
  },
  {
    title: "任务时间线",
    description: "用于展示近期申请任务和截止日期。",
    icon: ListChecks,
  },
  {
    title: "文书材料",
    description: "后续管理简历、文书和推荐信材料。",
    icon: FileText,
  },
];

export default function DashboardPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">学生工作台</p>
            <h1 className="mt-2 text-3xl font-semibold">申请规划占位总览</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              这里暂时只展示基础信息架构，不包含真实用户数据、推荐算法或任务逻辑。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">返回首页</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {dashboardSections.map((section) => {
            const Icon = section.icon;

            return (
              <article className="rounded-lg border bg-card p-5" key={section.title}>
                <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-lg font-semibold">{section.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {section.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
