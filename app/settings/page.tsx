import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, Languages, LifeBuoy, LockKeyhole, ShieldCheck, UserRound } from "lucide-react";

import { DeleteAccountCard } from "@/components/settings/DeleteAccountCard";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/workspace/AppShell";
import type { StudentProfile } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
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

  const displayName = profile?.full_name?.trim() || profile?.nickname?.trim() || user.email?.split("@")[0] || "同学";
  const avatarInitial = Array.from(displayName.trim() || user.email || "M")[0].toUpperCase();
  const provider = typeof user.app_metadata.provider === "string" ? user.app_metadata.provider : "email";
  const loginMethod = provider === "email" ? "邮箱登录" : provider;

  return (
    <AppShell userEmail={user.email} userName={profile?.full_name ?? profile?.nickname}>
      <section className="py-4">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">账户设置</p>
          <h1 className="mt-2 text-3xl font-semibold">管理你的 MyGrad 账户</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            查看基本账户信息、偏好设置、帮助入口和数据隐私说明。
          </p>
        </div>

        <section className="mt-8 rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-semibold text-primary-foreground">
                {avatarInitial}
              </span>
              <div>
                <h2 className="text-xl font-semibold">{displayName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{user.email ?? "未绑定邮箱"}</p>
              </div>
            </div>
            <div className="grid gap-2 text-sm sm:text-right">
              <p><span className="text-muted-foreground">角色：</span>学生</p>
              <p><span className="text-muted-foreground">账户状态：</span>账户正常</p>
              <p><span className="text-muted-foreground">登录方式：</span>{loginMethod}</p>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <SettingsCard icon={UserRound} title="基本信息">
            <InfoRow label="姓名" value={displayName} />
            <InfoRow label="邮箱地址" value={user.email ?? "未绑定"} />
            <InfoRow label="角色" value="学生" />
            <InfoRow label="登录方式" value={loginMethod} />
            <Button asChild className="mt-3" variant="outline">
              <Link href="/profile/edit">前往个人资料</Link>
            </Button>
          </SettingsCard>

          <SettingsCard icon={Languages} title="偏好设置">
            <InfoRow label="语言偏好" value="中文" />
            <InfoRow label="EN" value="Coming soon" />
            <div className="rounded-md border bg-background p-4">
              <div className="flex items-center gap-3">
                <Bell className="h-4 w-4 text-muted-foreground" aria-hidden={true} />
                <div>
                  <p className="text-sm font-medium">邮件通知</p>
                  <p className="mt-1 text-sm text-muted-foreground">暂时为静态选项，后续接入真实通知设置。</p>
                </div>
              </div>
            </div>
          </SettingsCard>

          <SettingsCard icon={LifeBuoy} title="帮助与支持">
            <SupportLink href="/help" label="帮助中心" />
            <SupportLink href="/feedback" label="报告问题" />
            <SupportLink href="/feedback" label="反馈建议" />
          </SettingsCard>

          <SettingsCard icon={ShieldCheck} title="数据与隐私">
            <InfoRow label="账户数据" value="后续支持导出" />
            <InfoRow label="隐私请求" value="后续支持申请删除个人数据" />
            <p className="rounded-md border bg-background p-4 text-sm leading-6 text-muted-foreground">
              <LockKeyhole className="mr-2 inline h-4 w-4" aria-hidden={true} />
              我们不会在前端暴露任何 service role key。
            </p>
          </SettingsCard>
        </div>

        <div className="mt-6">
          <DeleteAccountCard />
        </div>
      </section>
    </AppShell>
  );
}

function SettingsCard({
  children,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2">
        <Icon className="h-5 w-5 text-primary" aria-hidden={true} />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <div className="mt-5 grid gap-3">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border bg-background p-3 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function SupportLink({ href, label }: { href: string; label: string }) {
  return (
    <Button asChild variant="outline">
      <Link href={href}>{label}</Link>
    </Button>
  );
}
