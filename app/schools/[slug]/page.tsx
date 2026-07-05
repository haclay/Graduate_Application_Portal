import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";

import { DataDisclaimer } from "@/components/common/DataDisclaimer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getProgramsBySchoolId, getSchoolBySlug } from "@/lib/schools/queries";

export const dynamic = "force-dynamic";

type SchoolDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function SchoolDetailPage({
  params,
}: SchoolDetailPageProps) {
  const { slug } = await params;
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
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Button asChild variant="ghost">
          <Link href="/schools">返回学校库</Link>
        </Button>
        <div className="mt-6 border-b pb-8">
          <p className="text-sm font-semibold text-primary">学校详情</p>
          <h1 className="mt-2 text-3xl font-semibold">{school.name}</h1>
          <p className="mt-2 text-muted-foreground">{school.name_en}</p>
        </div>

        <div className="mt-6">
          <DataDisclaimer />
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">基本信息</h2>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem label="国家" value={school.country} />
              <InfoItem label="城市" value={school.city} />
              <InfoItem label="地区" value={school.region} />
              <InfoItem label="学费范围" value={school.tuition_range} />
              <InfoItem label="生活成本" value={school.living_cost_range} />
              <InfoItem label="最后核对日期" value={school.last_verified_at} />
            </dl>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              {school.description ?? "暂无学校简介。"}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(school.strengths ?? []).map((strength) => (
                <span className="rounded-md border bg-background px-2 py-1 text-xs" key={strength}>
                  {strength}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="text-lg font-semibold">链接与来源</h2>
            <div className="mt-5 grid gap-3">
              {school.website_url ? (
                <Button asChild>
                  <a href={school.website_url} rel="noreferrer" target="_blank">
                    学校官网
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              ) : null}
              {school.source_url ? (
                <Button asChild variant="outline">
                  <a href={school.source_url} rel="noreferrer" target="_blank">
                    数据来源
                    <ExternalLink className="h-4 w-4" aria-hidden />
                  </a>
                </Button>
              ) : null}
            </div>
            <p className="mt-5 text-sm leading-6 text-muted-foreground">
              {school.ranking_summary ?? "暂无排名摘要。"}
            </p>
          </section>
        </div>

        <section className="mt-8 rounded-lg border bg-card p-5">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold">相关项目</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                当前学校下的研究生项目示例。
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href={`/programs?country=${encodeURIComponent(school.country)}`}>
                查看更多项目
              </Link>
            </Button>
          </div>

          {programsResult.error ? (
            <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              {programsResult.error}
            </p>
          ) : programsResult.data.length === 0 ? (
            <p className="mt-5 rounded-md border bg-background p-4 text-sm text-muted-foreground">
              暂无该学校项目数据。
            </p>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {programsResult.data.map((program) => (
                <article className="rounded-md border bg-background p-4" key={program.id}>
                  <h3 className="font-semibold">{program.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {program.degree_type ?? "学位待核对"} · {program.field ?? "方向待核对"}
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

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-md border bg-background p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-sm font-medium">{value ?? "未填写"}</dd>
    </div>
  );
}
