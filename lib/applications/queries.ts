import type {
  ApplicationDeadline,
  ApplicationTask,
  ApplicationWithRelations,
  TaskWithApplication,
} from "@/lib/applications/types";
import { getApplicationDeadlines } from "@/lib/applications/utils";
import { createClient } from "@/lib/supabase/server";

const applicationSelect = `
  *,
  programs(
    *,
    schools(id, name, name_en, slug, country, city),
    program_deadlines(*)
  ),
  application_tasks(*)
`;

const taskSelect = `
  *,
  applications(
    *,
    programs(
      *,
      schools(id, name, name_en, slug, country, city),
      program_deadlines(*)
    )
  )
`;

export async function getUserApplications(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(applicationSelect)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .returns<ApplicationWithRelations[]>();

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function getApplicationById(applicationId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(applicationSelect)
    .eq("id", applicationId)
    .eq("user_id", userId)
    .maybeSingle<ApplicationWithRelations>();

  return {
    data,
    error: error?.message ?? null,
  };
}

export async function getUserTasks(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_tasks")
    .select(taskSelect)
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .returns<TaskWithApplication[]>();

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}

export async function getUserApplicationDeadlines(userId: string) {
  const applications = await getUserApplications(userId);

  return {
    data: getApplicationDeadlines(applications.data) satisfies ApplicationDeadline[],
    error: applications.error,
  };
}

export async function getApplicationTasks(applicationId: string, userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("application_tasks")
    .select("*")
    .eq("application_id", applicationId)
    .eq("user_id", userId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .returns<ApplicationTask[]>();

  return {
    data: data ?? [],
    error: error?.message ?? null,
  };
}
