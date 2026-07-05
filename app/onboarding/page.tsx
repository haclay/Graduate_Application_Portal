import { redirect } from "next/navigation";

import { OnboardingForm } from "@/app/onboarding/onboarding-form";
import { AppShell } from "@/components/workspace/AppShell";
import type { StudentProfile } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
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

  if (profile?.full_name?.trim()) {
    redirect("/dashboard");
  }

  return (
    <AppShell userEmail={user.email}>
      <OnboardingForm initialProfile={profile} userId={user.id} />
    </AppShell>
  );
}
