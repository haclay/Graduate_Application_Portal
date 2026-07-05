import Link from "next/link";
import { redirect } from "next/navigation";

import { SiteHeader } from "@/components/site-header";
import { TaskList } from "@/components/tasks/TaskList";
import { Button } from "@/components/ui/button";
import { getUserTasks } from "@/lib/applications/queries";
import type { TaskWithApplication } from "@/lib/applications/types";
import { groupTasksByDueDate } from "@/lib/applications/utils";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type TasksPageProps = {
  searchParams: Promise<{
    status?: string;
  }>;
};

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const tasksResult = await getUserTasks(user.id);
  const filteredTasks = filterTasks(tasksResult.data, params.status);
  const grouped = groupTasksByDueDate(filteredTasks);

  return (
    <main className="min-h-screen">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col justify-between gap-4 border-b pb-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold text-primary">任务管理</p>
            <h1 className="mt-2 text-3xl font-semibold">申请任务列表</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              按逾期、近期、无截止日期和已完成状态管理所有申请任务。
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/applications">查看申请清单</Link>
          </Button>
        </div>

        <form className="mt-6 flex flex-col gap-3 rounded-lg border bg-card p-5 sm:flex-row sm:items-end">
          <label className="grid gap-2 text-sm font-medium sm:w-56">
            完成状态
            <select
              className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              defaultValue={params.status ?? "all"}
              name="status"
            >
              <option value="all">全部任务</option>
              <option value="open">未完成</option>
              <option value="completed">已完成</option>
            </select>
          </label>
          <Button type="submit">筛选</Button>
        </form>

        {tasksResult.error ? (
          <div className="mt-8 rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {tasksResult.error}
          </div>
        ) : tasksResult.data.length === 0 ? (
          <div className="mt-8 rounded-lg border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">暂无任务</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
              加入申请项目后，系统会自动生成默认任务。
            </p>
            <Button asChild className="mt-6">
              <Link href="/programs">去项目库添加</Link>
            </Button>
          </div>
        ) : (
          <div className="mt-8 grid gap-5">
            <TaskList
              emptyLabel="没有逾期任务。"
              tasks={grouped.overdue}
              title="已逾期"
              userId={user.id}
            />
            <TaskList
              emptyLabel="7 天内没有待办任务。"
              tasks={grouped.dueIn7Days}
              title="7 天内"
              userId={user.id}
            />
            <TaskList
              emptyLabel="30 天内没有其他待办任务。"
              tasks={grouped.dueIn30Days}
              title="30 天内"
              userId={user.id}
            />
            <TaskList
              emptyLabel="没有无截止日期任务。"
              tasks={grouped.noDueDate}
              title="无截止日期"
              userId={user.id}
            />
            <TaskList
              emptyLabel="暂无已完成任务。"
              tasks={grouped.completed}
              title="已完成"
              userId={user.id}
            />
          </div>
        )}
      </section>
    </main>
  );
}

function filterTasks(tasks: TaskWithApplication[], status?: string) {
  if (status === "completed") {
    return tasks.filter((task) => task.completed);
  }

  if (status === "open") {
    return tasks.filter((task) => !task.completed);
  }

  return tasks;
}
