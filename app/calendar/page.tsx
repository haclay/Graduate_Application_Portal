import Link from "next/link";
import { redirect } from "next/navigation";

import { DeadlineList } from "@/components/calendar/DeadlineList";
import { DataDisclaimer } from "@/components/common/DataDisclaimer";
import { AppShell } from "@/components/workspace/AppShell";
import { Button } from "@/components/ui/button";
import { getUserApplicationDeadlines } from "@/lib/applications/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function CalendarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const deadlinesResult = await getUserApplicationDeadlines(user.id);

  return (
    <AppShell userEmail={user.email}>
      <section className="py-4">
        <div className="flex flex-col justify-between gap-4 border-b pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">DDL</p>
            <h1 className="mt-2 text-3xl font-semibold">申请截止日期列表</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              第一版先以列表形式展示申请清单中的项目 DDL。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/applications">查看申请清单</Link>
          </Button>
        </div>

        <div className="mt-6 rounded-lg border bg-accent/40 p-4 text-sm leading-6 text-accent-foreground">
          DDL 数据来自项目库或 seed 示例，最终请以学校官网为准。
        </div>

        <div className="mt-6">
          <DataDisclaimer />
        </div>

        <div className="mt-8">
          {deadlinesResult.error ? (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
              {deadlinesResult.error}
            </div>
          ) : (
            <DeadlineList deadlines={deadlinesResult.data} />
          )}
        </div>
      </section>
    </AppShell>
  );
}
