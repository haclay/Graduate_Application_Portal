import Link from "next/link";
import { LogIn } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LogIn className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">登录 MyGrad</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                第 1 阶段占位页面，认证逻辑将在第 2 阶段接入。
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-medium">
              邮箱
              <input
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="student@example.com"
                type="email"
              />
            </label>
            <label className="grid gap-2 text-sm font-medium">
              密码
              <input
                className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                placeholder="第 2 阶段启用"
                type="password"
              />
            </label>
            <Button disabled type="button">
              登录功能待接入
            </Button>
            <Button asChild variant="outline">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
