import Link from "next/link";

import { AuthAwareHeader } from "@/components/auth-aware-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

const steps = [
  "背景评估：整理本科院校、专业、GPA、语言成绩和经历。",
  "选校定位：根据背景初步划分彩票、冲刺、匹配、稳妥项目。",
  "项目了解：查看学校、项目、DDL、材料要求和官网链接。",
  "申请清单：把目标项目加入工作台，跟踪申请状态。",
  "DDL 与任务：按截止日期拆解 CV、SOP、成绩单、推荐信和网申任务。",
  "文书材料：后续阶段会继续管理文书、简历和推荐信。",
  "Offer 与入学：比较项目、城市、费用、就业、签证和生活准备。",
];

export default function GuidePage() {
  return (
    <main className="min-h-screen">
      <AuthAwareHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">Guide</p>
          <h1 className="mt-2 text-3xl font-semibold">申请指南</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            用 MyGrad 把研究生申请拆成可执行的流程，从背景到入学一步步推进。
          </p>
        </div>
        <div className="mt-8 grid gap-4">
          {steps.map((step, index) => (
            <article className="rounded-lg border bg-card p-5" key={step}>
              <p className="text-sm font-semibold text-primary">{String(index + 1).padStart(2, "0")}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{step}</p>
            </article>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button asChild><Link href="/profile/edit">完善背景</Link></Button>
          <Button asChild variant="outline"><Link href="/programs">查看项目库</Link></Button>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
