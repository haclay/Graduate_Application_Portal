import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function FeedbackPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">Feedback</p>
          <h1 className="mt-2 text-3xl font-semibold">反馈问题</h1>
          <p className="mt-3 text-muted-foreground">
            反馈功能当前为早期版本，后续会接入后台管理系统。
          </p>
        </div>

        <form className="mt-8 grid gap-5 rounded-lg border bg-card p-5">
          <label className="grid gap-2 text-sm font-medium">
            问题类型
            <select className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" defaultValue="data">
              <option value="data">数据不准确</option>
              <option value="missing">缺少学校或项目</option>
              <option value="ux">页面体验问题</option>
              <option value="other">其他问题</option>
            </select>
          </label>

          <label className="grid gap-2 text-sm font-medium">
            相关学校或项目
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="例如：UCLA MSCS"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            问题描述
            <textarea
              className="min-h-32 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="请描述你发现的问题、建议或需要补充的信息。"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            正确来源链接，可选
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="https://..."
              type="url"
            />
          </label>

          <label className="grid gap-2 text-sm font-medium">
            联系邮箱，可选
            <input
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="you@example.com"
              type="email"
            />
          </label>

          <div className="rounded-md border bg-muted/50 p-4 text-sm leading-6 text-muted-foreground">
            当前表单仅作为 UI 占位，不会真正提交到数据库。后续后台管理系统完成后会接入真实反馈流程。
          </div>

          <Button disabled type="button">提交反馈，即将开放</Button>
        </form>
      </section>
      <SiteFooter />
    </main>
  );
}
