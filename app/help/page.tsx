import Link from "next/link";

import { AuthAwareHeader } from "@/components/auth-aware-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default function HelpPage() {
  return (
    <main className="min-h-screen">
      <AuthAwareHeader />
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">Help</p>
          <h1 className="mt-2 text-3xl font-semibold">帮助与联系</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            如果你发现数据不准确、页面问题或有功能建议，可以通过反馈页面告诉我们。
          </p>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">报告问题</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">适合反馈数据错误、页面异常或无法正常使用的功能。</p>
          </section>
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">提出建议</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">如果你希望 MyGrad 增加新模块、新学校或新工作流，也可以发送反馈。</p>
          </section>
        </div>
        <Button asChild className="mt-8"><Link href="/feedback">前往反馈页面</Link></Button>
      </section>
      <SiteFooter />
    </main>
  );
}
