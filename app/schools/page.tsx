import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";

import { FilterSelect } from "@/components/data/filter-select";
import { SourceNotice } from "@/components/data/source-notice";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getSchools } from "@/lib/schools/queries";

export const dynamic = "force-dynamic";

type SchoolsPageProps = {
  searchParams: Promise<{
    city?: string;
    country?: string;
    q?: string;
  }>;
};

export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  const params = await searchParams;
  const allSchoolsResult = await getSchools();
  const schoolsResult = await getSchools({
    city: params.city,
    country: params.country,
    query: params.q,
  });
  const countries = Array.from(
    new Set(allSchoolsResult.data.map((school) => school.country).filter(Boolean)),
  ).sort();
  const cities = Array.from(
    new Set(allSchoolsResult.data.map((school) => school.city).filter(Boolean)),
  ).sort() as string[];

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">学校库</p>
          <h1 className="mt-2 text-3xl font-semibold">学校数据库</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            浏览研究生申请相关学校信息，按关键词、国家和城市筛选。
          </p>
        </div>

        <div className="mt-6">
          <SourceNotice />
        </div>

        <form className="mt-6 grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[1fr_180px_180px_auto] md:items-end">
          <label className="grid gap-2 text-sm font-medium">
            关键词
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-md border bg-background px-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue={params.q ?? ""}
                name="q"
                placeholder="搜索学校、城市或国家"
              />
            </div>
          </label>
          <FilterSelect
            defaultValue={params.country}
            label="国家"
            name="country"
            options={countries}
            placeholder="全部国家"
          />
          <FilterSelect
            defaultValue={params.city}
            label="城市"
            name="city"
            options={cities}
            placeholder="全部城市"
          />
          <Button type="submit">筛选</Button>
        </form>

        {schoolsResult.error ? (
          <ErrorState message={schoolsResult.error} />
        ) : schoolsResult.data.length === 0 ? (
          <EmptyState label="没有找到匹配的学校。" />
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {schoolsResult.data.map((school) => (
              <article className="rounded-lg border bg-card p-5" key={school.id}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{school.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {school.name_en ?? school.name}
                    </p>
                  </div>
                  <p className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
                    {school.country}
                    {school.city ? ` / ${school.city}` : ""}
                  </p>
                </div>
                <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {school.description ?? "暂无简介。"}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(school.strengths ?? []).map((strength) => (
                    <span
                      className="rounded-md border bg-background px-2 py-1 text-xs"
                      key={strength}
                    >
                      {strength}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button asChild>
                    <Link href={`/schools/${school.slug}`}>查看详情</Link>
                  </Button>
                  {school.website_url ? (
                    <Button asChild variant="outline">
                      <a href={school.website_url} rel="noreferrer" target="_blank">
                        官网
                        <ExternalLink className="h-4 w-4" aria-hidden />
                      </a>
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
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
