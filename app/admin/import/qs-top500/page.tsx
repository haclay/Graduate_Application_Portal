import { redirect } from "next/navigation";

import { ImportQsTop500Form } from "@/app/admin/import/qs-top500/import-qs-top500-form";
import { AppShell } from "@/components/workspace/AppShell";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ImportQsTop500Page() {
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
          <h1 className="mt-2 text-3xl font-semibold">QS 2027 Top 500 同步</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            上传手工准备的 QS World University Rankings 2027 Top 500 CSV，匹配已有 schools 记录，补全排名字段，并把非 Top 500 学校标记为 inactive。
          </p>
        </div>

        <div className="mt-8">
          <ImportQsTop500Form />
        </div>
      </section>
    </AppShell>
  );
}