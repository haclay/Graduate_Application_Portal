import Link from "next/link";
import { redirect } from "next/navigation";

import { ApplicationCard } from "@/components/applications/ApplicationCard";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { getUserApplications } from "@/lib/applications/queries";
import type { ApplicationStatus, ApplicationWithRelations } from "@/lib/applications/types";
import { applicationStatusLabels } from "@/lib/applications/types";
import { findNearestDeadline } from "@/lib/applications/utils";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type ApplicationsPageProps = {
  searchParams: Promise<{
    sort?: string;
    status?: string;
  }>;
};

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const applicationsResult = await getUserApplications(user.id);
  const filteredApplications = filterApplications(
    applicationsResult.data,
    params.status,
    params.sort,
  );

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">申请清单</p>
            <h1 className="mt-2 text-3xl font-semibold">我的申请项目</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              管理目标项目、申请状态、任务进度和关键 DDL。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/programs">去项目库添加</Link>
          </Button>
        </div>

        <form className="mt-6 grid gap-4 rounded-lg border bg-card p-5 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="grid gap-2 text-sm font-medium">
            状态筛选
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              defaultValue={params.status ?? ""}
              name="status"
            >
              <option value="">全部状态</option>
              {Object.entries(applicationStatusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium">
            排序
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              defaultValue={params.sort ?? ""}
              name="sort"
            >
              <option value="">默认排序</option>
              <option value="deadline">按 DDL 升序</option>
            </select>
          </label>
          <Button type="submit">应用筛选</Button>
        </form>

        {applicationsResult.error ? (
          <ErrorState message={applicationsResult.error} />
        ) : filteredApplications.length === 0 ? (
          <div className="mt-8 rounded-lg border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">你还没有添加申请项目</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
              可以先去项目库或选校推荐中，把感兴趣的项目加入申请清单。
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/programs">去项目库</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/matching">去选校推荐</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {filteredApplications.map((application) => (
              <ApplicationCard
                application={application}
                key={application.id}
                userId={user.id}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

function filterApplications(
  applications: ApplicationWithRelations[],
  status?: string,
  sort?: string,
) {
  let result = applications;

  if (status && status in applicationStatusLabels) {
    result = result.filter((application) => application.status === (status as ApplicationStatus));
  }

  if (sort === "deadline") {
    result = [...result].sort((a, b) => {
      const aDeadline = findNearestDeadline(a.programs?.program_deadlines)?.deadline_date ?? "9999-12-31";
      const bDeadline = findNearestDeadline(b.programs?.program_deadlines)?.deadline_date ?? "9999-12-31";
      return aDeadline.localeCompare(bDeadline);
    });
  }

  return result;
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
      {message}
    </div>
  );
}
