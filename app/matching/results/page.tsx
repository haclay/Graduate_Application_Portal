import Link from "next/link";
import { redirect } from "next/navigation";

import { DataDisclaimer } from "@/components/common/DataDisclaimer";
import { MatchingTierGuide } from "@/components/matching/MatchingTierGuide";
import { RecommendationGroup } from "@/components/matching/RecommendationGroup";
import { AppShell } from "@/components/workspace/AppShell";
import { Button } from "@/components/ui/button";
import { generateRecommendations } from "@/lib/matching/rules";
import { tierOrder } from "@/lib/matching/types";
import type { Program, ProgramDeadline } from "@/lib/programs/types";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import type { StudentProfile } from "@/lib/profile/types";
import type { School } from "@/lib/schools/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MatchingResultsPage() {
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

  if (!profile) {
    redirect("/profile/edit");
  }

  const [schoolsResponse, programsResponse, deadlinesResponse] = await Promise.all([
    supabase
      .from("schools")
      .select("*")
      .eq("is_published", true)
      .returns<School[]>(),
    supabase
      .from("programs")
      .select("*")
      .eq("is_published", true)
      .returns<Program[]>(),
    supabase
      .from("program_deadlines")
      .select("*")
      .eq("is_published", true)
      .returns<ProgramDeadline[]>(),
  ]);

  const dataError =
    schoolsResponse.error?.message ??
    programsResponse.error?.message ??
    deadlinesResponse.error?.message ??
    null;

  if (dataError) {
    return <ErrorPage message={dataError} userEmail={user.email} />;
  }

  const schools = schoolsResponse.data ?? [];
  const programs = programsResponse.data ?? [];
  const deadlines = deadlinesResponse.data ?? [];
  const completion = calculateProfileCompletion(profile);
  const recommendations = generateRecommendations({
    deadlines,
    profile,
    programs,
    schools,
  });

  return (
    <AppShell userEmail={user.email} userName={profile.full_name ?? profile.nickname}>
      <section className="py-4">
        <Button asChild variant="ghost">
          <Link href="/matching">返回选校推荐</Link>
        </Button>
        <div className="mt-6 border-b pb-8">
          <p className="text-sm font-semibold text-primary">推荐结果</p>
          <h1 className="mt-2 text-3xl font-semibold">规则版选校推荐结果</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            当前推荐基于 MVP 规则系统生成，仅供规划参考，不代表真实录取概率。
          </p>
        </div>

        <div className="mt-6">
          <DataDisclaimer />
        </div>

        <MatchingTierGuide />

        <div className="mt-6 rounded-lg border bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">
          当前推荐基于 MVP 规则系统生成，仅供规划参考，不代表真实录取概率。
        </div>

        {programs.length === 0 ? (
          <EmptyState
            actionHref="/programs"
            actionLabel="查看项目库"
            message="没有项目数据。请先在 Supabase SQL Editor 运行 seed SQL。"
          />
        ) : completion.percentage < 50 ? (
          <EmptyState
            actionHref="/profile/edit"
            actionLabel="补充背景档案"
            message="你的背景档案还不完整。建议先补充 GPA、目标国家、目标专业和未来目标。"
          />
        ) : (
          <div className="mt-8 grid gap-6">
            {tierOrder.map((tier) => (
              <RecommendationGroup
                key={tier}
                results={recommendations.filter((result) => result.tier === tier)}
                tier={tier}
                userId={user.id}
              />
            ))}
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
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {message}
        </div>
      </section>
    </AppShell>
  );
}

function EmptyState({
  actionHref,
  actionLabel,
  message,
}: {
  actionHref: string;
  actionLabel: string;
  message: string;
}) {
  return (
    <div className="mt-8 rounded-lg border bg-card p-8 text-center">
      <h2 className="text-xl font-semibold">暂时无法生成推荐</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {message}
      </p>
      <Button asChild className="mt-6">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
