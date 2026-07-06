import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";

import { DataDisclaimer } from "@/components/common/DataDisclaimer";
import { Button } from "@/components/ui/button";
import { WorkspaceOrPublicShell } from "@/components/workspace/WorkspaceOrPublicShell";
import { formatOptional, formatQsRank as formatSchoolQsRank, formatRank, visibleList } from "@/lib/schools/format";
import { getProgramsBySchoolId, getSchoolBySlug } from "@/lib/schools/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type SchoolDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { slug } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const detailPath = `/schools/${slug}`;
    redirect(`/login?redirect=${encodeURIComponent(detailPath)}&reason=school-detail-required`);
  }

  const schoolResult = await getSchoolBySlug(slug);

  if (schoolResult.error) {
    return <DetailError message={schoolResult.error} />;
  }

  if (!schoolResult.data) {
    notFound();
  }

  const school = schoolResult.data;
  const programsResult = await getProgramsBySchoolId(school.id);

  return (
    <WorkspaceOrPublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Button asChild variant="ghost">
          <Link href="/schools">返回学校库</Link>
        </Button>
        <div className="mt-6 border-b pb-8">
          <p className="text-sm font-semibold text-primary">学校详情</p>
          <h1 className="mt-2 text-3xl font-semibold">{school.name}</h1>
          {school.name_en && school.name_en !== school.name ? <p className="mt-2 text-muted-foreground">{school.name_en}</p> : null}
        </div>

        <div className="mt-6">
          <DataDisclaimer />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          <DetailSection
            items={[
              ["学校名称", school.name],
              ["国家 / 地区", school.country],
              ["城市", school.city],
              ["学校类型", school.school_type],
            ]}
            title="基础信息"
          >
            {school.website_url ? (
              <Button asChild className="mt-5">
                <a href={school.website_url} rel="noreferrer" target="_blank">
                  官网
                  <ExternalLink className="h-4 w-4" aria-hidden />
                </a>
              </Button>
            ) : null}
          </DetailSection>

          <DetailSection
            items={[
              ["QS 2027 排名", formatSchoolQsRank(school)],
              ["US News 排名", formatRank(school.us_news_rank)],
              ["THE 排名", formatRank(school.the_rank)],
            ]}
            title="排名信息"
          />
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <ArraySection
            groups={[
              ["强势学科", school.strong_subjects],
              ["热门项目", school.popular_programs],
            ]}
            title="学术优势"
          />
          <DetailSection
            items={[
              ["师生比", school.student_faculty_ratio],
              ["国际学生比例", school.international_student_ratio],
              ["预估年费用", school.estimated_annual_cost],
            ]}
            title="学生与费用"
          />
        </div>

        <section className="mt-5 rounded-lg border bg-card p-5">
          <h2 className="text-lg font-semibold">数据说明</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            以上信息用于研究生申请规划参考，排名、费用和学校信息可能变化，请以学校官网为准。
          </p>
          {school.ranking_source_url ? (
            <Button asChild className="mt-4" variant="outline">
              <a href={school.ranking_source_url} rel="noreferrer" target="_blank">
                QS 数据来源
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          ) : null}
        </section>

        <section className="mt-8 rounded-lg border bg-card p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">相关项目</h2>
              <p className="mt-1 text-sm text-muted-foreground">查看该学校下已整理的研究生项目。</p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/programs?country=${encodeURIComponent(school.country)}`}>浏览项目库</Link>
            </Button>
          </div>

          {programsResult.error ? (
            <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {programsResult.error}
            </p>
          ) : programsResult.data.length === 0 ? (
            <p className="mt-5 rounded-md border bg-background p-4 text-sm text-muted-foreground">暂时没有该学校的项目数据。</p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {programsResult.data.map((program) => (
                <article className="rounded-md border bg-background p-4" key={program.id}>
                  <h3 className="font-semibold">{program.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {program.degree_type ?? "学位待补充"} / {program.field ?? "方向待补充"}
                  </p>
                  <Button asChild className="mt-4" size="sm" variant="outline">
                    <Link href={`/programs/${program.slug}`}>查看项目</Link>
                  </Button>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </WorkspaceOrPublicShell>
  );
}

function DetailSection({
  children,
  items,
  title,
}: {
  children?: ReactNode;
  items: Array<[string, string | null | undefined]>;
  title: string;
}) {
  const visibleItems = items.filter(([, value]) => formatOptional(value));

  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      {visibleItems.length > 0 ? (
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {visibleItems.map(([label, value]) => (
            <div className="rounded-md border bg-background p-4" key={label}>
              <dt className="text-sm text-muted-foreground">{label}</dt>
              <dd className="mt-2 text-sm font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">暂无数据</p>
      )}
      {children}
    </section>
  );
}

function ArraySection({ groups, title }: { groups: Array<[string, string[] | null | undefined]>; title: string }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid gap-5">
        {groups.map(([label, values]) => {
          const visibleValues = visibleList(values);
          return (
            <div key={label}>
              <h3 className="text-sm font-medium text-muted-foreground">{label}</h3>
              {visibleValues.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {visibleValues.map((value) => (
                    <span className="rounded-md border bg-background px-2 py-1 text-xs" key={value}>
                      {value}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">暂无数据</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DetailError({ message }: { message: string }) {
  return (
    <WorkspaceOrPublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{message}</div>
      </section>
    </WorkspaceOrPublicShell>
  );
}