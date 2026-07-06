import Link from "next/link";
import { Search } from "lucide-react";

import { DataDisclaimer } from "@/components/common/DataDisclaimer";
import { FilterSelect } from "@/components/data/filter-select";
import { SchoolDetailAccessButton } from "@/components/schools/SchoolDetailAccessButton";
import { Button } from "@/components/ui/button";
import { WorkspaceOrPublicShell } from "@/components/workspace/WorkspaceOrPublicShell";
import { formatOptional, formatQsRank, formatRank, visibleList } from "@/lib/schools/format";
import { getSchools } from "@/lib/schools/queries";
import type { School } from "@/lib/schools/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 30;

type SchoolsPageProps = {
  searchParams: Promise<{
    country?: string;
    page?: string;
    q?: string;
    schoolType?: string;
  }>;
};

export default async function SchoolsPage({ searchParams }: SchoolsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const allSchoolsResult = await getSchools();
  const schoolsResult = await getSchools({
    country: params.country,
    query: params.q,
    schoolType: params.schoolType,
  });
  const countries = Array.from(new Set(allSchoolsResult.data.map((school) => school.country).filter(Boolean))).sort();
  const schoolTypes = Array.from(new Set(allSchoolsResult.data.map((school) => school.school_type).filter(Boolean))).sort() as string[];

  const totalSchools = schoolsResult.data.length;
  const totalPages = Math.max(1, Math.ceil(totalSchools / PAGE_SIZE));
  const requestedPage = Number.parseInt(params.page ?? "1", 10);
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages);
  const paginatedSchools = schoolsResult.data.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <WorkspaceOrPublicShell>
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">学校数据库</p>
          <h1 className="mt-2 text-3xl font-semibold">QS 2027 学校数据库</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            默认展示已导入并启用的 QS 2027 学校数据，帮助你快速了解学校排名、优势方向和申请规划参考信息。
          </p>
        </div>

        <div className="mt-6">
          <DataDisclaimer />
        </div>

        <form className="mt-6 grid gap-4 rounded-lg border bg-card p-5 lg:grid-cols-[1fr_180px_180px_auto] lg:items-end">
          <label className="grid gap-2 text-sm font-medium">
            关键词
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                className="h-10 w-full rounded-md border bg-background px-9 text-sm outline-none focus:ring-2 focus:ring-ring"
                defaultValue={params.q ?? ""}
                name="q"
                placeholder="搜索学校、国家或城市"
              />
            </div>
          </label>
          <FilterSelect defaultValue={params.country} label="国家 / 地区" name="country" options={countries} placeholder="全部国家" />
          <FilterSelect defaultValue={params.schoolType} label="学校类型" name="schoolType" options={schoolTypes} placeholder="全部类型" />
          <Button type="submit">筛选</Button>
        </form>

        {schoolsResult.error ? (
          <ErrorState message={schoolsResult.error} />
        ) : totalSchools === 0 ? (
          <EmptyState label="暂时没有符合条件的学校。" />
        ) : (
          <>
            <div className="mt-6 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <p>共 {totalSchools} 所学校，每页 {PAGE_SIZE} 所。</p>
              <p>
                第 {currentPage} / {totalPages} 页
              </p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {paginatedSchools.map((school) => (
                <SchoolCard isAuthenticated={Boolean(user)} key={school.id} school={school} />
              ))}
            </div>
            <PaginationControls currentPage={currentPage} params={params} totalPages={totalPages} />
          </>
        )}
      </section>
    </WorkspaceOrPublicShell>
  );
}

function SchoolCard({ isAuthenticated, school }: { isAuthenticated: boolean; school: School }) {
  const strongSubjects = visibleList(school.strong_subjects);
  const shownSubjects = strongSubjects.slice(0, 3);
  const extraSubjects = strongSubjects.length - shownSubjects.length;
  const qsRank = formatQsRank(school);
  const usNewsRank = formatRank(school.us_news_rank);
  const theRank = formatRank(school.the_rank);
  const detailHref = `/schools/${school.slug}`;

  return (
    <article className="rounded-lg border bg-card p-5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{school.name}</h2>
          {school.name_en && school.name_en !== school.name ? <p className="mt-1 text-sm text-muted-foreground">{school.name_en}</p> : null}
        </div>
        <p className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">
          {school.country}
          {school.city ? ` / ${school.city}` : ""}
        </p>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <Meta label="QS 2027 排名" value={qsRank} />
        <Meta label="US News 排名" value={usNewsRank} />
        <Meta label="THE 排名" value={theRank} />
        <Meta label="学校类型" value={school.school_type} />
      </div>

      {shownSubjects.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {shownSubjects.map((subject) => (
            <span className="rounded-md border bg-background px-2 py-1 text-xs" key={subject}>
              {subject}
            </span>
          ))}
          {extraSubjects > 0 ? <span className="rounded-md border bg-background px-2 py-1 text-xs">+{extraSubjects} more</span> : null}
        </div>
      ) : null}

      <div className="mt-5">
        <SchoolDetailAccessButton href={detailHref} isAuthenticated={isAuthenticated} />
      </div>
    </article>
  );
}

function PaginationControls({
  currentPage,
  params,
  totalPages,
}: {
  currentPage: number;
  params: Awaited<SchoolsPageProps["searchParams"]>;
  totalPages: number;
}) {
  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  return (
    <div className="mt-8 flex flex-col gap-4 rounded-lg border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        {currentPage <= 1 ? (
          <Button disabled variant="outline">
            上一页
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={buildSchoolsHref(params, previousPage)}>上一页</Link>
          </Button>
        )}
        {currentPage >= totalPages ? (
          <Button disabled variant="outline">
            下一页
          </Button>
        ) : (
          <Button asChild variant="outline">
            <Link href={buildSchoolsHref(params, nextPage)}>下一页</Link>
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        当前第 {currentPage} / {totalPages} 页
      </p>

      <form action="/schools" className="flex items-center gap-2" method="get">
        {params.q ? <input name="q" type="hidden" value={params.q} /> : null}
        {params.country ? <input name="country" type="hidden" value={params.country} /> : null}
        {params.schoolType ? <input name="schoolType" type="hidden" value={params.schoolType} /> : null}
        <label className="text-sm text-muted-foreground" htmlFor="school-page-jump">
          跳转到
        </label>
        <input
          className="h-10 w-20 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          defaultValue={currentPage}
          id="school-page-jump"
          max={totalPages}
          min={1}
          name="page"
          type="number"
        />
        <Button type="submit" variant="outline">
          前往
        </Button>
      </form>
    </div>
  );
}

function buildSchoolsHref(params: Awaited<SchoolsPageProps["searchParams"]>, page: number) {
  const search = new URLSearchParams();

  if (params.q) {
    search.set("q", params.q);
  }

  if (params.country) {
    search.set("country", params.country);
  }

  if (params.schoolType) {
    search.set("schoolType", params.schoolType);
  }

  if (page > 1) {
    search.set("page", String(page));
  }

  const queryString = search.toString();
  return queryString ? `/schools?${queryString}` : "/schools";
}

function Meta({ label, value }: { label: string; value: string | null | undefined }) {
  const text = formatOptional(value);
  if (!text) {
    return null;
  }

  return (
    <div className="rounded-md border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{text}</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{message}</div>;
}

function EmptyState({ label }: { label: string }) {
  return <div className="mt-8 rounded-lg border bg-card p-8 text-center text-muted-foreground">{label}</div>;
}