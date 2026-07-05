"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import type {
  ActionResult,
  ApplicationStatus,
  ApplicationTaskType,
} from "@/lib/applications/types";
import { buildDefaultTasks } from "@/lib/applications/taskTemplates";
import { findNearestDeadline } from "@/lib/applications/utils";
import type { ProgramDeadline } from "@/lib/programs/types";
import { createClient } from "@/lib/supabase/server";

const revalidateTargets = [
  "/applications",
  "/tasks",
  "/calendar",
  "/dashboard",
  "/matching/results",
  "/programs",
];

async function assertCurrentUser(userId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  if (user.id !== userId) {
    throw new Error("当前登录用户无权执行此操作。");
  }

  return { supabase, user };
}

function revalidateApplicationPages(applicationId?: string) {
  revalidateTargets.forEach((path) => revalidatePath(path));

  if (applicationId) {
    revalidatePath(`/applications/${applicationId}`);
  }
}

export async function createDefaultTasks(
  applicationId: string,
  userId: string,
  nearestDeadline: ProgramDeadline | null,
): Promise<ActionResult> {
  const { supabase } = await assertCurrentUser(userId);
  const tasks = buildDefaultTasks(applicationId, userId, nearestDeadline);
  const { error } = await supabase.from("application_tasks").insert(tasks);

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "默认申请任务已创建。" };
}

export async function addProgramToApplications(
  programId: string,
  userId: string,
): Promise<ActionResult> {
  const { supabase } = await assertCurrentUser(userId);
  const { data: existing, error: existingError } = await supabase
    .from("applications")
    .select("id")
    .eq("program_id", programId)
    .eq("user_id", userId)
    .maybeSingle<{ id: string }>();

  if (existingError) {
    return { ok: false, message: existingError.message };
  }

  if (existing) {
    return {
      applicationId: existing.id,
      ok: true,
      message: "该项目已在申请清单中。",
    };
  }

  const { data: application, error: insertError } = await supabase
    .from("applications")
    .insert({
      program_id: programId,
      user_id: userId,
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError || !application) {
    return { ok: false, message: insertError?.message ?? "添加申请项目失败。" };
  }

  const { data: deadlines } = await supabase
    .from("program_deadlines")
    .select("*")
    .eq("program_id", programId)
    .eq("is_published", true)
    .returns<ProgramDeadline[]>();
  const nearestDeadline = findNearestDeadline(deadlines ?? []);
  const taskResult = await createDefaultTasks(application.id, userId, nearestDeadline);

  revalidateApplicationPages(application.id);

  if (!taskResult.ok) {
    return {
      applicationId: application.id,
      ok: true,
      message: "已加入申请清单，但默认任务创建失败，请稍后手动添加任务。",
    };
  }

  return {
    applicationId: application.id,
    ok: true,
    message: "已加入申请清单。",
  };
}

export async function updateApplicationStatus(
  applicationId: string,
  userId: string,
  status: ApplicationStatus,
) {
  const { supabase } = await assertCurrentUser(userId);
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .eq("user_id", userId);

  revalidateApplicationPages(applicationId);
  return { ok: !error, message: error?.message ?? "申请状态已更新。" };
}

export async function updateApplicationNotes(
  applicationId: string,
  userId: string,
  notes: string,
) {
  const { supabase } = await assertCurrentUser(userId);
  const { error } = await supabase
    .from("applications")
    .update({ notes })
    .eq("id", applicationId)
    .eq("user_id", userId);

  revalidateApplicationPages(applicationId);
  return { ok: !error, message: error?.message ?? "备注已更新。" };
}

export async function toggleTaskCompleted(taskId: string, userId: string) {
  const { supabase } = await assertCurrentUser(userId);
  const { data: task, error: taskError } = await supabase
    .from("application_tasks")
    .select("application_id, completed")
    .eq("id", taskId)
    .eq("user_id", userId)
    .single<{ application_id: string; completed: boolean | null }>();

  if (taskError || !task) {
    return { ok: false, message: taskError?.message ?? "任务不存在。" };
  }

  const nextCompleted = !task.completed;
  const { error } = await supabase
    .from("application_tasks")
    .update({
      completed: nextCompleted,
      completed_at: nextCompleted ? new Date().toISOString() : null,
    })
    .eq("id", taskId)
    .eq("user_id", userId);

  revalidateApplicationPages(task.application_id);
  return { ok: !error, message: error?.message ?? "任务状态已更新。" };
}

export async function createCustomTask(
  applicationId: string,
  userId: string,
  taskData: {
    description?: string;
    due_date?: string;
    task_type?: ApplicationTaskType;
    title: string;
  },
) {
  const { supabase } = await assertCurrentUser(userId);
  const { error } = await supabase.from("application_tasks").insert({
    application_id: applicationId,
    description: taskData.description?.trim() || null,
    due_date: taskData.due_date?.trim() || null,
    task_type: taskData.task_type ?? "other",
    title: taskData.title,
    user_id: userId,
  });

  revalidateApplicationPages(applicationId);
  return { ok: !error, message: error?.message ?? "自定义任务已创建。" };
}

export async function createCustomTaskFromForm(formData: FormData) {
  const applicationId = String(formData.get("applicationId") ?? "");
  const userId = String(formData.get("userId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "");
  const dueDate = String(formData.get("dueDate") ?? "");
  const taskType = String(formData.get("taskType") ?? "other") as ApplicationTaskType;

  if (!title) {
    return { ok: false, message: "任务标题不能为空。" };
  }

  return createCustomTask(applicationId, userId, {
    description,
    due_date: dueDate,
    task_type: taskType,
    title,
  });
}

export async function deleteTask(taskId: string, userId: string) {
  const { supabase } = await assertCurrentUser(userId);
  const { data: task } = await supabase
    .from("application_tasks")
    .select("application_id")
    .eq("id", taskId)
    .eq("user_id", userId)
    .maybeSingle<{ application_id: string }>();
  const { error } = await supabase
    .from("application_tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId);

  revalidateApplicationPages(task?.application_id);
  return { ok: !error, message: error?.message ?? "任务已删除。" };
}

export async function removeApplication(applicationId: string, userId: string) {
  const { supabase } = await assertCurrentUser(userId);
  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", applicationId)
    .eq("user_id", userId);

  revalidateApplicationPages(applicationId);
  return { ok: !error, message: error?.message ?? "申请项目已删除。" };
}
