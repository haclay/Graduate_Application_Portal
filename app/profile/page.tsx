import type { ComponentType } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenCheck, FileText, GraduationCap, Target } from "lucide-react";

import { AppShell } from "@/components/workspace/AppShell";
import { Button } from "@/components/ui/button";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import type { StudentProfile } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
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

  const completion = calculateProfileCompletion(profile);

  return (
    <AppShell userEmail={user.email}>
      <section className="py-4">
        <div className="flex flex-col justify-between gap-4 border-b pb-8 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">学生背景档案</p>
            <h1 className="mt-2 text-3xl font-semibold">申请背景总览</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              背景档案用于后续选校推荐、申请任务和材料准备。
            </p>
          </div>
          <Button asChild>
            <Link href="/profile/edit">
              {profile ? "编辑背景档案" : "填写背景档案"}
            </Link>
          </Button>
        </div>

        <div className="mt-6 rounded-lg border bg-card p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">完成度</p>
              <p className="text-2xl font-semibold">{completion.percentage}%</p>
            </div>
            <p className="text-sm text-muted-foreground">
              已完成 {completion.completedFields} / {completion.totalFields} 个关键字段
            </p>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${completion.percentage}%` }}
            />
          </div>
        </div>

        {!profile ? (
          <div className="mt-8 rounded-lg border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">还没有填写背景档案</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              先填写本科背景、成绩、经历和申请目标。后续选校推荐会基于这些信息工作。
            </p>
            <Button asChild className="mt-6">
              <Link href="/profile/edit">开始填写</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            <ProfileCard
              icon={GraduationCap}
              items={[
                ["姓名", profile.full_name],
                ["昵称", profile.nickname],
                ["本科院校", profile.undergraduate_school],
                ["本科国家/地区", profile.undergraduate_country],
                ["本科专业", profile.undergraduate_major],
                ["当前年级", profile.current_year],
              ]}
              title="基本信息"
            />
            <ProfileCard
              icon={BookOpenCheck}
              items={[
                ["GPA", formatScore(profile.gpa)],
                ["GPA 满分", formatScore(profile.gpa_scale)],
                ["IELTS", formatScore(profile.ielts)],
                ["TOEFL", formatScore(profile.toefl)],
                ["GRE", formatScore(profile.gre)],
                ["GMAT", formatScore(profile.gmat)],
                ["语言/标化考试", formatTestScores(profile.test_scores)],
              ]}
              title="学术背景与语言成绩"
            />
            <ProfileCard
              icon={FileText}
              items={[
                ["科研经历", profile.research_experience],
                ["实习经历", profile.internship_experience],
                ["项目经历", profile.project_experience],
                ["竞赛经历", profile.competition_experience],
              ]}
              title="科研 / 实习 / 项目经历"
            />
            <ProfileCard
              icon={Target}
              items={[
                ["目标国家/地区", profile.target_countries?.join("、")],
                ["目标专业", profile.target_majors?.join("、")],
                ["未来目标", profile.future_goal],
                ["预算范围", profile.budget_range],
                ["计划入学年份", formatScore(profile.planned_entry_year)],
              ]}
              title="申请目标"
            />
          </div>
        )}
      </section>
    </AppShell>
  );
}

function formatTestScores(value: StudentProfile["test_scores"]) {
  if (!value || value.length === 0) {
    return null;
  }

  return value
    .filter((item) => item.type?.trim() && item.score?.trim())
    .map((item) => `${item.type}: ${item.score}`)
    .join("\n");
}
function formatScore(value: number | null | undefined) {
  return value === null || value === undefined ? null : String(value);
}

function ProfileCard({
  icon: Icon,
  items,
  title,
}: {
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  items: Array<[string, string | null | undefined]>;
  title: string;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="mb-5 flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <dl className="grid gap-4 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div className="rounded-md border bg-background p-4" key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6">
              {value && value.trim().length > 0 ? value : "未填写"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
