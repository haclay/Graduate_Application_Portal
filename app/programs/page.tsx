import Link from "next/link";
import { Search } from "lucide-react";

import { FilterSelect } from "@/components/data/filter-select";
import { DataDisclaimer } from "@/components/common/DataDisclaimer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getProgramFilterOptions, getPrograms } from "@/lib/programs/queries";

export const dynamic = "force-dynamic";

type ProgramsPageProps = {
  searchParams: Promise<{
    country?: string;
    degreeType?: string;
    field?: string;
    q?: string;
  }>;
};

export default async function ProgramsPage({ searchParams }: ProgramsPageProps) {
  const params = await searchParams;
  const [filterOptionsResult, programsResult] = await Promise.all([
    getProgramFilterOptions(),
    getPrograms({
      country: params.country,
      degreeType: params.degreeType,
      field: params.field,
      query: params.q,
    }),
  ]);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">项目库</p>
          <h1 className="mt-2 text-3xl font-semibold">研究生项目数据库</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            浏览研究生项目，按关键词、国家、专业方向和学位类型筛选。
          </p>
        </div>

        <div className="mt-6">
          <DataDisclaimer />
        </div>

        <form className="mt-6 grid gap-4 rounded-lg border bg-card p-5 lg:grid-cols-[1fr_160px_190px_160px_auto] lg:items-end">
          <label className="grid gap-2 text-sm font-medium">
            关键词
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-md border bg-background px-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue={params.q ?? ""}
                name="q"
                placeholder="搜索项目、学院或方向"
              />
            </div>
          </label>
          <FilterSelect
            defaultValue={params.country}
            label="国家"
            name="country"
            options={filterOptionsResult.data.countries}
            placeholder="全部国家"
          />
          <FilterSelect
            defaultValue={params.field}
            label="专业方向"
            name="field"
            options={filterOptionsResult.data.fields}
            placeholder="全部方向"
          />
          <FilterSelect
            defaultValue={params.degreeType}
            label="学位类型"
            name="degreeType"
            options={filterOptionsResult.data.degreeTypes}
            placeholder="全部类型"
          />
          <Button type="submit">筛选</Button>
        </form>

        {filterOptionsResult.error ? (
          <ErrorState message={filterOptionsResult.error} />
        ) : programsResult.error ? (
          <ErrorState message={programsResult.error} />
        ) : programsResult.data.length === 0 ? (
          <EmptyState label="没有找到匹配的项目。" />
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {programsResult.data.map((program) => (
              <article className="rounded-lg border bg-card p-5" key={program.id}>
                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-semibold">{program.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {program.schools?.name ?? "未知学校"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {program.schools?.country ?? "国家待核对"}
                    {program.schools?.city ? ` / ${program.schools.city}` : ""}
                  </p>
                </div>
                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <Meta label="学位类型" value={program.degree_type} />
                  <Meta label="项目时长" value={program.duration} />
                  <Meta label="专业方向" value={program.field} />
                  <Meta label="语言要求" value={program.language_requirements} />
                  <Meta label="GRE / GMAT" value={program.gre_gmat_requirements} />
                </div>
                <Button asChild className="mt-5">
                  <Link href={`/programs/${program.slug}`}>查看详情</Link>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
      <SiteFooter />
    </main>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 line-clamp-2 font-medium">{value ?? "请以官网为准"}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
      {message}
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mt-8 rounded-lg border bg-card p-8 text-center text-muted-foreground">
      {label}
    </div>
  );
}
