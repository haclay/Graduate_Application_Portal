import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

const whatItIs = [
  "一个研究生申请规划工作台",
  "一个学校和项目数据库",
  "一个申请任务和 DDL 管理工具",
  "一个帮助学生整理选校和材料思路的平台",
];

const whatItIsNot = [
  "不是留学中介",
  "不承诺录取结果",
  "不替代学校官网",
  "不代写文书",
  "不保证所有数据实时准确",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">About</p>
          <h1 className="mt-2 text-3xl font-semibold">MyGrad 是什么</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            MyGrad 希望把研究生申请中分散的信息、任务和决策整理到一个清晰的工作台里。
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">MyGrad 是什么</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-muted-foreground">
              {whatItIs.map((item) => (
                <li className="rounded-md border bg-background p-3" key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">MyGrad 不是什么</h2>
            <ul className="mt-5 grid gap-3 text-sm leading-6 text-muted-foreground">
              {whatItIsNot.map((item) => (
                <li className="rounded-md border bg-background p-3" key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <section className="mt-8 rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">当前阶段</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
            当前项目仍在早期开发阶段，已完成项目规划、基础框架、用户系统、学校与项目库、规则版选校推荐、申请清单和任务管理。后续数据和功能会持续更新。
          </p>
          <Button asChild className="mt-5">
            <Link href="/feedback">反馈问题</Link>
          </Button>
        </section>
      </section>
      <SiteFooter />
    </main>
  );
}
