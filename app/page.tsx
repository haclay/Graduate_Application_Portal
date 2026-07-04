import Link from "next/link";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  FileText,
  MapPinned,
  Sparkles,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const pillars = [
  {
    title: "背景档案",
    description: "整理院校、专业、GPA、语言成绩、科研和实习经历。",
    icon: FileText,
  },
  {
    title: "选校规划",
    description: "为后续彩票、冲刺、匹配、稳妥分层打好页面基础。",
    icon: Sparkles,
  },
  {
    title: "申请任务",
    description: "预留 DDL、材料、推荐信和申请进度管理入口。",
    icon: CalendarClock,
  },
  {
    title: "学校数据库",
    description: "为学校、专业、官网链接和申请要求展示建立入口。",
    icon: BookOpenCheck,
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm font-semibold text-primary">
            研究生申请决策平台
          </p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl">
            MyGrad
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
            面向本科生的研究生申请规划入口，当前阶段提供网站骨架、导航和核心模块占位，为后续用户系统、选校推荐和申请管理打基础。
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/dashboard">
                进入工作台
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">查看登录页</Link>
            </Button>
          </div>
        </div>

        <div className="relative min-h-[380px] overflow-hidden rounded-lg border bg-card p-5 shadow-sm">
          <div className="absolute inset-x-0 top-0 h-2 bg-[linear-gradient(90deg,var(--primary),var(--secondary),var(--accent))]" />
          <div className="mt-4 flex items-center justify-between border-b pb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                申请规划总览
              </p>
              <p className="mt-1 text-2xl font-semibold">2027 Fall</p>
            </div>
            <MapPinned className="h-8 w-8 text-primary" aria-hidden="true" />
          </div>
          <div className="mt-6 grid gap-4">
            {["背景评估", "学校筛选", "材料准备", "Offer 对比"].map(
              (item, index) => (
                <div
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-md border bg-background p-4"
                  key={item}
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{item}</p>
                    <p className="text-sm text-muted-foreground">占位模块</p>
                  </div>
                  <span className="text-sm text-muted-foreground">待开发</span>
                </div>
              ),
            )}
          </div>
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto grid max-w-6xl gap-4 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article className="rounded-lg border bg-card p-5" key={pillar.title}>
                <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h2 className="text-base font-semibold">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
