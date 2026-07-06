import Link from "next/link";
import { redirect } from "next/navigation";
import { Sparkles } from "lucide-react";

import { GenerateAiMatchingButton } from "@/components/ai-matching/GenerateAiMatchingButton";
import { MatchingTierGuide } from "@/components/matching/MatchingTierGuide";
import { ProfileSummary } from "@/components/matching/ProfileSummary";
import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/workspace/AppShell";
import type { StudentProfile } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AiMatchingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<StudentProfile>();

  if (profileError) {
    return <ErrorPage message={profileError.message} userEmail={user.email} />;
  }

  const isAiConfigured = Boolean(process.env.OPENAI_API_KEY);

  return (
    <AppShell userEmail={user.email} userName={profile?.full_name ?? profile?.nickname}>
      <section className="py-4">
        <Button asChild variant="ghost">
          <Link href="/matching">返回选校推荐</Link>
        </Button>

        <div className="mt-6 border-b pb-8">
          <p className="text-sm font-semibold text-primary">AI 选校推荐</p>
          <h1 className="mt-2 text-3xl font-semibold">生成 AI 学校推荐</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            {"AI \u4f1a\u6839\u636e\u4f60\u7684\u5b66\u751f\u80cc\u666f\u548c QS 2027 \u5b66\u6821\u5e93\uff0c\u628a\u5b66\u6821\u5206\u4e3a\u51b2\u523a\u3001\u5339\u914d\u548c\u4fdd\u5e95\u4e09\u6863\u3002\u7b2c\u4e00\u7248\u53ea\u63a8\u8350\u5b66\u6821\u548c\u65b9\u5411\uff0c\u4e0d\u751f\u6210\u9879\u76ee\u8be6\u60c5\uff0c\u4e0d\u6293\u53d6\u5b98\u7f51\u3002"}
          </p>
        </div>

        {!isAiConfigured ? (
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
            AI 功能尚未配置，请联系管理员。
          </div>
        ) : null}

        {!profile ? (
          <div className="mt-8 rounded-lg border bg-card p-8 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-primary" aria-hidden />
            <h2 className="mt-4 text-xl font-semibold">请先填写背景档案</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              AI 选校推荐需要读取你的本科背景、成绩、目标国家、目标专业和经历信息。
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
              <h2 className="text-lg font-semibold">AI 推荐说明</h2>
              <div className="mt-4 grid gap-3 text-sm leading-6 text-muted-foreground md:grid-cols-2">
                <p>候选学校来自 schools 表中已启用的 QS Top 学校数据，最多使用前 70 所。</p>
                <p>AI 只做学校层面的规划建议，不代表录取概率，也不替代官网申请要求。</p>
                <p>推荐项会包含推荐专业方向、理由、风险、匹配分数和下一步建议。</p>
                <p>如果你的背景信息不足，AI 会提示“不确定，需要进一步核对”。</p>
              </div>
              <div className="mt-6 rounded-md border bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">
                AI 推荐仅供申请规划参考，不代表录取概率。最终申请要求请以学校官网为准。
              </div>
              <div className="mt-6 max-w-sm">
                <GenerateAiMatchingButton disabled={!isAiConfigured} />
              </div>
            </section>
          </div>
        )}
      </section>
    </AppShell>
  );
}

function ErrorPage({ message, userEmail }: { message: string; userEmail: string | null | undefined }) {
  return (
    <AppShell userEmail={userEmail}>
      <section className="py-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{message}</div>
      </section>
    </AppShell>
  );
}
