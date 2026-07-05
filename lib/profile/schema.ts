import { z } from "zod";

const optionalNumberText = z.string().refine(
  (value) => value.trim() === "" || !Number.isNaN(Number(value)),
  {
    message: "请输入有效数字。",
  },
);

const optionalIntegerText = z.string().refine(
  (value) => value.trim() === "" || Number.isInteger(Number(value)),
  {
    message: "请输入有效整数。",
  },
);

export const profileFormSchema = z.object({
  full_name: z.string().max(120),
  nickname: z.string().max(80),
  undergraduate_school: z.string().max(160),
  undergraduate_country: z.string().max(80),
  undergraduate_major: z.string().max(160),
  current_year: z.string().max(80),
  gpa: optionalNumberText,
  gpa_scale: optionalNumberText,
  ielts: optionalNumberText,
  toefl: optionalIntegerText,
  gre: optionalIntegerText,
  gmat: optionalIntegerText,
  research_experience: z.string().max(4000),
  internship_experience: z.string().max(4000),
  project_experience: z.string().max(4000),
  competition_experience: z.string().max(4000),
  target_countries: z.string(),
  target_majors: z.string(),
  future_goal: z.string().max(2000),
  budget_range: z.string().max(120),
  planned_entry_year: optionalIntegerText,
});

export type ProfileFormSchema = z.infer<typeof profileFormSchema>;