import Link from "next/link";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
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
      <section className="mx-auto flex max-w-6xl items-center justify-center px-4 py-16 sm:px-6">
        <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <LogIn className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold">登录 MyGrad</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                登录后可以进入工作台并管理学生背景档案。
              </p>
            </div>
          </div>
          <LoginForm />
          <div className="mt-4">
            <Button asChild className="w-full" variant="ghost">
              <Link href="/">返回首页</Link>
            </Button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}