import type { ProgramDeadline, ProgramWithRelations } from "@/lib/programs/types";

export type ApplicationStatus =
  | "not_started"
  | "preparing"
  | "documents_ready"
  | "submitted"
  | "interview"
  | "accepted"
  | "rejected"
  | "waitlisted"
  | "withdrawn";

export type ApplicationPriority = "low" | "medium" | "high";

export type ApplicationTaskType =
  | "cv"
  | "sop"
  | "transcript"
  | "recommendation"
  | "language_score"
  | "application_form"
  | "fee"
  | "other";

export type Application = {
  id: string;
  user_id: string;
  program_id: string;
  status: ApplicationStatus;
  priority: ApplicationPriority | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ApplicationTask = {
  id: string;
  application_id: string;
  user_id: string;
  title: string;
  description: string | null;
  task_type: ApplicationTaskType | null;
  due_date: string | null;
  completed: boolean | null;
  completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type ApplicationWithRelations = Application & {
  application_tasks: ApplicationTask[] | null;
  programs: ProgramWithRelations | null;
};

export type TaskWithApplication = ApplicationTask & {
  applications:
    | (Application & {
        programs: ProgramWithRelations | null;
      })
    | null;
};

export type ApplicationDeadline = {
  application: ApplicationWithRelations;
  deadline: ProgramDeadline;
};

export type ActionResult = {
  applicationId?: string;
  message: string;
  ok: boolean;
};

export const applicationStatusLabels: Record<ApplicationStatus, string> = {
  not_started: "未开始",
  preparing: "准备中",
  documents_ready: "材料已准备",
  submitted: "已提交",
  interview: "面试中",
  accepted: "已录取",
  rejected: "被拒",
  waitlisted: "候补",
  withdrawn: "已撤回",
};

export const applicationPriorityLabels: Record<ApplicationPriority, string> = {
  low: "低",
  medium: "中",
  high: "高",
};
