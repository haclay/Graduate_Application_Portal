import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { SourceNotice } from "@/components/data/source-notice";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getProgramBySlug } from "@/lib/programs/queries";

export const dynamic = "force-dynamic";

type ProgramDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ProgramDetailPage({
  params,
}: ProgramDetailPageProps) {
  const { slug } = await params;
  const programResult = await getProgramBySlug(slug);

  if (programResult.error) {
    return <DetailError message={programResult.error} />;
  }

  if (!programResult.data) {
    notFound();
  }

  const program = programResult.data;

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Button asChild variant="ghost">
          <Link href="/programs">返回项目库</Link>
        </Button>
        <div className="mt-6 border-b pb-8">
          <p className="text-sm font-semibold text-primary">项目详情</p>
          <h1 className="mt-2 text-3xl font-semibold">{program.name}</h1>
          <p className="mt-3 text-muted-foreground">
            {program.schools?.name ?? "未知学校"}
            {program.schools?.country ? ` · ${program.schools.country}` : ""}
            {program.schools?.city ? ` / ${program.schools.city}` : ""}
          </p>
        </div>

        <div className="mt-6">
          <SourceNotice />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1fr]">
          <DetailSection
            items={[
              ["所属学校", program.schools?.name],
              ["所属学院", program.faculty],
              ["学位类型", program.degree_type],
              ["项目层级", program.program_level],
              ["项目时长", program.duration],
              ["专业方向", program.field],
              ["最后核对日期", program.last_verified_at],
            ]}
            title="基本信息"
          />
          <DetailSection
            items={[
              ["语言要求", program.language_requirements],
              ["GRE / GMAT 要求", program.gre_gmat_requirements],
              ["GPA 偏好", program.gpa_preference],
              ["先修课要求", program.prerequisites],
              ["推荐信数量", formatNumber(program.recommendation_letters_count)],
            ]}
            title="申请要求"
          />
        </div>

        <div className="mt-5 grid gap-5">
          <TextBlock label="项目简介" value={program.description} />
          <ArrayBlock label="申请材料" values={program.application_materials} />
          <DetailSection
            items={[
              ["学费", program.tuition],
              ["奖学金", program.scholarship_info],
              ["课程设置", program.curriculum_summary],
              ["就业方向", program.career_outcomes],
              ["适合人群", program.suitable_for],
              ["不适合人群", program.not_suitable_for],
            ]}
            title="项目与职业信息"
          />
          <DeadlineBlock deadlines={program.program_deadlines ?? []} />
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">官网与来源</h2>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              {program.official_url ? (
                <Button asChild>
                  <a href={program.official_url} rel="noreferrer" target="_blank">
                    项目官网
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              ) : null}
              {program.source_url ? (
                <Button asChild variant="outline">
                  <a href={program.source_url} rel="noreferrer" target="_blank">
                    数据来源
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              ) : null}
              {program.schools?.slug ? (
                <Button asChild variant="outline">
                  <Link href={`/schools/${program.schools.slug}`}>查看学校</Link>
                </Button>
              ) : null}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function DetailError({ message }: { message: string }) {
  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
          {message}
        </div>
      </section>
    </main>
  );
}

function DetailSection({
  items,
  title,
}: {
  items: Array<[string, string | null | undefined]>;
  title: string;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <dl className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div className="rounded-md border bg-background p-4" key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6">
              {value ?? "请以官网为准"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TextBlock({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">{label}</h2>
      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {value ?? "请以官网为准。"}
      </p>
    </section>
  );
}

function ArrayBlock({
  label,
  values,
}: {
  label: string;
  values: string[] | null | undefined;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">{label}</h2>
      {values && values.length > 0 ? (
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {values.map((value) => (
            <li className="rounded-md border bg-background p-3 text-sm" key={value}>
              {value}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">请以官网为准。</p>
      )}
    </section>
  );
}

function DeadlineBlock({
  deadlines,
}: {
  deadlines: Array<{
    deadline_date: string | null;
    intake_term: string | null;
    notes: string | null;
    round_name: string | null;
    source_url: string | null;
  }>;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">DDL 列表</h2>
      {deadlines.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          暂无 DDL 数据，请以学校官网为准。
        </p>
      ) : (
        <div className="mt-4 grid gap-3">
          {deadlines.map((deadline, index) => (
            <div className="rounded-md border bg-background p-4" key={index}>
              <p className="font-medium">{deadline.round_name ?? "申请轮次待核对"}</p>
              <p className="mt-2 text-sm text-muted-foreground">
                {deadline.deadline_date ?? "DDL 待核对"} ·{" "}
                {deadline.intake_term ?? "入学季待核对"}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {deadline.notes ?? "请以官网为准。"}
              </p>
              {deadline.source_url ? (
                <a
                  className="mt-2 inline-flex text-sm font-medium text-primary"
                  href={deadline.source_url}
                  rel="noreferrer"
                  target="_blank"
                >
                  查看来源
                </a>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function formatNumber(value: number | null | undefined) {
  return value === null || value === undefined ? null : String(value);
}
