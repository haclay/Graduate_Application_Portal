import type { ApplicationTaskType } from "@/lib/applications/types";
import { addDays, dateFromString, toDateString } from "@/lib/applications/utils";
import type { ProgramDeadline } from "@/lib/programs/types";

export type DefaultTaskTemplate = {
  description: string;
  offsetDays: number | null;
  task_type: ApplicationTaskType;
  title: string;
};

export const defaultTaskTemplates: DefaultTaskTemplate[] = [
  {
    description: "整理一页或两页版本，突出教育背景、项目、科研和实习经历。",
    offsetDays: -21,
    task_type: "cv",
    title: "准备 CV / Resume",
  },
  {
    description: "围绕项目匹配度、目标方向和关键经历准备 SOP / Personal Statement。",
    offsetDays: -14,
    task_type: "sop",
    title: "准备 SOP / Personal Statement",
  },
  {
    description: "确认中英文成绩单、在读证明或毕业证明等材料是否齐全。",
    offsetDays: -10,
    task_type: "transcript",
    title: "准备成绩单",
  },
  {
    description: "联系推荐人，说明申请项目、截止日期和推荐信提交方式。",
    offsetDays: -30,
    task_type: "recommendation",
    title: "联系推荐人",
  },
  {
    description: "确认 IELTS / TOEFL / GRE / GMAT 是否满足项目官网要求。",
    offsetDays: -10,
    task_type: "language_score",
    title: "检查语言成绩是否满足要求",
  },
  {
    description: "核对项目官网 DDL、申请材料和最新要求。",
    offsetDays: -10,
    task_type: "other",
    title: "核对项目官网 DDL 和申请材料",
  },
  {
    description: "进入学校官网完成网申表格填写和材料上传。",
    offsetDays: -3,
    task_type: "application_form",
    title: "完成官网网申",
  },
  {
    description: "确认申请费金额、支付方式和付款状态。",
    offsetDays: -3,
    task_type: "fee",
    title: "支付申请费",
  },
];

export function buildDefaultTasks(
  applicationId: string,
  userId: string,
  nearestDeadline: ProgramDeadline | null,
) {
  const deadlineDate = dateFromString(nearestDeadline?.deadline_date);

  return defaultTaskTemplates.map((template) => ({
    application_id: applicationId,
    description: template.description,
    due_date:
      deadlineDate && template.offsetDays !== null
        ? toDateString(addDays(deadlineDate, template.offsetDays))
        : null,
    task_type: template.task_type,
    title: template.title,
    user_id: userId,
  }));
}
