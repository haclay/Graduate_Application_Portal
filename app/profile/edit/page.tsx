import { redirect } from "next/navigation";

import { ProfileForm } from "@/components/profile/profile-form";
import { AppShell } from "@/components/workspace/AppShell";
import type { StudentProfile } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfileEditPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle<StudentProfile>();

  return (
    <AppShell userEmail={user.email} userName={profile?.full_name ?? profile?.nickname}>
      <section className="py-4">
        <div className="border-b pb-8">
          <p className="text-sm font-semibold text-primary">学生背景档案</p>
          <h1 className="mt-2 text-3xl font-semibold">
            {profile ? "编辑背景档案" : "填写背景档案"}
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            请先填写能影响选校判断的核心信息。后续阶段会基于这些字段建立推荐和申请管理。
          </p>
        </div>
        <div className="mt-8">
          <ProfileForm profile={profile} userId={user.id} />
        </div>
      </section>
    </AppShell>
  );
}
