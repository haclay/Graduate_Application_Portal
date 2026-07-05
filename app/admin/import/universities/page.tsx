import { redirect } from "next/navigation";

import { ImportUniversitiesForm } from "@/app/admin/import/universities/import-universities-form";
import { AppShell } from "@/components/workspace/AppShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ImportUniversitiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell userEmail={user.email}>
      <section className="py-4">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">开发期数据导入</p>
          <h1 className="mt-2 text-3xl font-semibold">学校基础数据导入</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            从公开大学列表数据源导入学校基础信息到 schools 表。当前不会导入 programs、DDL、语言要求、GRE、学费或其他研究生项目申请要求。
          </p>
        </div>

        <div className="mt-8">
          <ImportUniversitiesForm />
        </div>
      </section>
    </AppShell>
  );
}
