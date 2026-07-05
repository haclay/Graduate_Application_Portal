import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  FileText,
  Layers3,
  ListChecks,
  Sparkles,
} from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const painPoints = [
  "项目要求散落在不同官网",
  "DDL、语言要求、推荐信要求经常记不清",
  "选校时很难判断彩票、冲刺、匹配、稳妥",
  "文书、简历、推荐信、网申进度容易混在一起",
  "拿到 offer 后仍然需要比较城市、费用、就业和生活环境",
];

const processSteps = [
  "填写背景",
  "获取选校分层",
  "查看学校和项目",
  "加入申请清单",
  "管理 DDL 和任务",
  "准备文书、简历和推荐信",
  "Offer 对比、签证和生活准备",
];

const featureCards = [
  {
    title: "学生背景档案",
    description: "集中整理 GPA、语言成绩、目标方向、科研实习和申请偏好。",
    icon: FileText,
  },
  {
    title: "学校与项目库",
    description: "按国家、方向和学位类型查看学校与项目基础信息。",
    icon: BookOpenCheck,
  },
  {
    title: "选校推荐",
    description: "用 MVP 规则系统生成彩票、冲刺、匹配、稳妥分层。",
    icon: Sparkles,
  },
  {
    title: "申请清单",
    description: "把目标项目加入工作台，跟踪状态、优先级和备注。",
    icon: ClipboardList,
  },
  {
    title: "任务与 DDL",
    description: "自动生成默认任务，集中查看近期待办和截止日期。",
    icon: CalendarClock,
  },
];

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section
        className="relative overflow-hidden bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-campus-application.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/45" />
        <div className="absolute inset-0 bg-background/20" />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
          <div className="max-w-3xl">
            <p className="hero-fade-up mb-4 text-sm font-semibold text-primary" style={{ animationDelay: "80ms" }}>研究生申请工作台</p>
            <h1 className="hero-fade-up text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl" style={{ animationDelay: "220ms" }}>
              像学长学姐一样陪伴，像专业顾问一样规划
            </h1>
            <p className="hero-fade-up mt-5 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl" style={{ animationDelay: "360ms" }}>
              MyGrad 陪你规划好从选校到入学的每一步，让研究生申请不再一个人摸索
            </p>
            <div className="hero-fade-up mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap" style={{ animationDelay: "520ms" }}>
              <Button asChild size="lg">
                <Link href="/profile/edit">
                  开始填写背景
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild className="bg-background/85 backdrop-blur hover:bg-background" size="lg" variant="outline">
                <Link href="/programs">查看学校项目库</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">为什么需要一个工作台</p>
            <h2 className="mt-2 text-2xl font-semibold">研究生申请为什么容易混乱？</h2>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {painPoints.map((point) => (
              <div className="flex gap-3 rounded-lg border bg-card p-4" key={point}>
                <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <p className="text-sm leading-6 text-muted-foreground">{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-primary">申请流程</p>
          <h2 className="mt-2 text-2xl font-semibold">申请流程 7 步</h2>
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-7">
          {processSteps.map((step, index) => (
            <article className="rounded-lg border bg-card p-4" key={step}>
              <p className="text-sm font-semibold text-primary">{index + 1}</p>
              <h3 className="mt-2 text-sm font-medium leading-6">{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">核心模块</p>
            <h2 className="mt-2 text-2xl font-semibold">从信息收集到申请推进</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {featureCards.map((feature) => {
              const Icon = feature.icon;

              return (
                <article className="rounded-lg border bg-card p-5" key={feature.title}>
                  <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="text-base font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
          <div className="mt-8 rounded-lg border bg-card p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">下一步：把目标项目加入申请工作台</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  从项目库或选校推荐中添加项目后，MyGrad 会自动生成默认申请任务。
                </p>
              </div>
              <Button asChild>
                <Link href="/programs">
                  浏览项目库
                  <Layers3 className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
