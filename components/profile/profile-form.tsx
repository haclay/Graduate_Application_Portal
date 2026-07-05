"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import { profileFormSchema, type ProfileFormSchema } from "@/lib/profile/schema";
import type { StudentProfile, StudentProfileFormValues } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/client";

type ProfileFormProps = {
  profile: StudentProfile | null;
  userId: string;
};

const textInputClass =
  "h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring";
const textAreaClass =
  "min-h-28 rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring";

function toText(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function arrayToText(value: string[] | null | undefined) {
  return value?.join(", ") ?? "";
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? Number(trimmed) : null;
}

function optionalInteger(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? Number.parseInt(trimmed, 10) : null;
}

function textToArray(value: string) {
  const items = value
    .split(/[,，\n]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return items.length > 0 ? items : null;
}

function getDefaultValues(profile: StudentProfile | null): StudentProfileFormValues {
  return {
    full_name: toText(profile?.full_name),
    nickname: toText(profile?.nickname),
    undergraduate_school: toText(profile?.undergraduate_school),
    undergraduate_country: toText(profile?.undergraduate_country),
    undergraduate_major: toText(profile?.undergraduate_major),
    current_year: toText(profile?.current_year),
    gpa: toText(profile?.gpa),
    gpa_scale: toText(profile?.gpa_scale),
    ielts: toText(profile?.ielts),
    toefl: toText(profile?.toefl),
    gre: toText(profile?.gre),
    gmat: toText(profile?.gmat),
    research_experience: toText(profile?.research_experience),
    internship_experience: toText(profile?.internship_experience),
    project_experience: toText(profile?.project_experience),
    competition_experience: toText(profile?.competition_experience),
    target_countries: arrayToText(profile?.target_countries),
    target_majors: arrayToText(profile?.target_majors),
    future_goal: toText(profile?.future_goal),
    budget_range: toText(profile?.budget_range),
    planned_entry_year: toText(profile?.planned_entry_year),
  };
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormSchema>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: getDefaultValues(profile),
  });

  async function onSubmit(values: ProfileFormSchema) {
    setFormError(null);
    setIsSaving(true);

    const profilePayload = {
      user_id: userId,
      full_name: optionalText(values.full_name),
      nickname: optionalText(values.nickname),
      undergraduate_school: optionalText(values.undergraduate_school),
      undergraduate_country: optionalText(values.undergraduate_country),
      undergraduate_major: optionalText(values.undergraduate_major),
      current_year: optionalText(values.current_year),
      gpa: optionalNumber(values.gpa),
      gpa_scale: optionalNumber(values.gpa_scale),
      ielts: optionalNumber(values.ielts),
      toefl: optionalInteger(values.toefl),
      gre: optionalInteger(values.gre),
      gmat: optionalInteger(values.gmat),
      research_experience: optionalText(values.research_experience),
      internship_experience: optionalText(values.internship_experience),
      project_experience: optionalText(values.project_experience),
      competition_experience: optionalText(values.competition_experience),
      target_countries: textToArray(values.target_countries),
      target_majors: textToArray(values.target_majors),
      future_goal: optionalText(values.future_goal),
      budget_range: optionalText(values.budget_range),
      planned_entry_year: optionalInteger(values.planned_entry_year),
    };
    const completion = calculateProfileCompletion(profilePayload);

    const supabase = createClient();
    const { error } = await supabase.from("student_profiles").upsert(
      {
        ...profilePayload,
        profile_completed: completion.percentage === 100,
      },
      {
        onConflict: "user_id",
      },
    );

    setIsSaving(false);

    if (error) {
      setFormError(error.message);
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <form className="grid gap-8" onSubmit={handleSubmit(onSubmit)}>
      <ProfileSection title="基本信息">
        <TextField label="姓名" registration={register("full_name")} />
        <TextField label="昵称" registration={register("nickname")} />
        <TextField label="本科院校" registration={register("undergraduate_school")} />
        <TextField label="本科国家/地区" registration={register("undergraduate_country")} />
        <TextField label="本科专业" registration={register("undergraduate_major")} />
        <TextField label="当前年级" registration={register("current_year")} />
      </ProfileSection>

      <ProfileSection title="学术背景">
        <TextField error={errors.gpa?.message} label="GPA" registration={register("gpa")} />
        <TextField
          error={errors.gpa_scale?.message}
          label="GPA 满分"
          registration={register("gpa_scale")}
        />
      </ProfileSection>

      <ProfileSection title="语言与标化成绩">
        <TextField error={errors.ielts?.message} label="IELTS" registration={register("ielts")} />
        <TextField error={errors.toefl?.message} label="TOEFL" registration={register("toefl")} />
        <TextField error={errors.gre?.message} label="GRE" registration={register("gre")} />
        <TextField error={errors.gmat?.message} label="GMAT" registration={register("gmat")} />
      </ProfileSection>

      <ProfileSection title="经历">
        <TextAreaField label="科研经历" registration={register("research_experience")} />
        <TextAreaField label="实习经历" registration={register("internship_experience")} />
        <TextAreaField label="项目经历" registration={register("project_experience")} />
        <TextAreaField label="竞赛经历" registration={register("competition_experience")} />
      </ProfileSection>

      <ProfileSection title="申请目标">
        <TextAreaField
          description="多个国家或地区可用逗号或换行分隔。"
          label="目标国家/地区"
          registration={register("target_countries")}
        />
        <TextAreaField
          description="多个专业方向可用逗号或换行分隔。"
          label="目标专业"
          registration={register("target_majors")}
        />
        <TextAreaField label="未来目标" registration={register("future_goal")} />
        <TextField label="预算范围" registration={register("budget_range")} />
        <TextField
          error={errors.planned_entry_year?.message}
          label="计划入学年份"
          registration={register("planned_entry_year")}
        />
      </ProfileSection>

      {formError ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={isSaving} type="submit">
          {isSaving ? "保存中..." : "保存背景档案"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/profile">取消</Link>
        </Button>
      </div>
    </form>
  );
}

function ProfileSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function TextField({
  error,
  label,
  registration,
}: {
  error?: string;
  label: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input className={textInputClass} {...registration} />
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </label>
  );
}

function TextAreaField({
  description,
  label,
  registration,
}: {
  description?: string;
  label: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium md:col-span-2">
      {label}
      <textarea className={textAreaClass} {...registration} />
      {description ? (
        <span className="text-xs text-muted-foreground">{description}</span>
      ) : null}
    </label>
  );
}