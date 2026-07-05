import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { MatchingTierGuide } from "@/components/matching/MatchingTierGuide";
import { ProfileSummary } from "@/components/matching/ProfileSummary";
import { AppShell } from "@/components/workspace/AppShell";
import { Button } from "@/components/ui/button";
import type { StudentProfile } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MatchingPage() {
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

  return (
    <AppShell userEmail={user.email} userName={profile?.full_name ?? profile?.nickname}>
      <section className="py-4">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">选校推荐</p>
          <h1 className="mt-2 text-3xl font-semibold">规则版选校推荐</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            根据你的背景档案、学校库和项目库，生成彩票、冲刺、匹配、稳妥四类初步项目建议。
          </p>
        </div>

        <div className="mt-6 rounded-lg border bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">
          推荐结果仅供申请规划参考，不代表录取概率，最终申请要求请以学校官网为准。
        </div>

        {!profile ? (
          <div className="mt-8 rounded-lg border bg-card p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl font-semibold">请先填写背景档案</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              选校推荐需要读取你的 GPA、语言成绩、目标国家、目标专业和经历信息。
            </p>
            <Button asChild className="mt-6">
              <Link href="/profile/edit">去填写背景档案</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-6">
            <ProfileSummary profile={profile} />
            <MatchingTierGuide />
            <section className="rounded-lg border bg-card p-5">
              <h2 className="text-lg font-semibold">推荐规则说明</h2>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
                <p>系统会参考 GPA、语言成绩、目标方向、目标国家和经历完整度。</p>
                <p>项目要求会参考专业方向、GRE/GMAT 文本、先修课和 DDL 数据。</p>
                <p>分档为彩票、冲刺、匹配、稳妥，仅代表 MVP 规则下的规划建议。</p>
                <p>后续阶段可继续加入项目难度、历史案例和人工审核。</p>
              </div>
              <Button asChild className="mt-6" size="lg">
                <Link href="/matching/results">生成选校推荐</Link>
              </Button>
            </section>
          </div>
        )}
      </section>
    </AppShell>
  );
}
