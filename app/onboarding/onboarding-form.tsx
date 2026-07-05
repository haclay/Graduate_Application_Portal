"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import type { StudentProfile, TestScore } from "@/lib/profile/types";
import { createClient } from "@/lib/supabase/client";

const countryOptions = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Singapore",
  "Hong Kong",
  "Europe",
  "Other",
];

const majorOptions = [
  "Computer Science",
  "Data Science",
  "Electrical and Computer Engineering",
  "Artificial Intelligence",
  "Business Analytics",
  "Finance",
  "Engineering Management",
  "Other",
];

const scoreTypes = ["IELTS", "TOEFL", "GRE", "GMAT", "Duolingo"];

type OnboardingState = {
  current_year: string;
  full_name: string;
  gpa: string;
  gpa_scale: string;
  nickname: string;
  target_countries: string[];
  target_majors: string[];
  test_scores: TestScore[];
  undergraduate_country: string;
  undergraduate_major: string;
  undergraduate_school: string;
};

const steps = [
  "姓名",
  "学校",
  "专业年级",
  "GPA",
  "考试成绩",
  "目标国家",
  "目标专业",
];

function toText(value: string | number | null | undefined) {
  return value === null || value === undefined ? "" : String(value);
}

function normalizeScores(value: unknown): TestScore[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object") {
        return null;
      }

      const record = item as Record<string, unknown>;
      const type = typeof record.type === "string" ? record.type : "";
      const score = typeof record.score === "string" ? record.score : "";

      return type.trim() && score.trim() ? { score: score.trim(), type: type.trim() } : null;
    })
    .filter((item): item is TestScore => Boolean(item));
}

function getInitialState(profile: StudentProfile | null): OnboardingState {
  return {
    current_year: toText(profile?.current_year),
    full_name: toText(profile?.full_name),
    gpa: toText(profile?.gpa),
    gpa_scale: toText(profile?.gpa_scale),
    nickname: toText(profile?.nickname),
    target_countries: profile?.target_countries ?? [],
    target_majors: profile?.target_majors ?? [],
    test_scores: normalizeScores(profile?.test_scores),
    undergraduate_country: toText(profile?.undergraduate_country),
    undergraduate_major: toText(profile?.undergraduate_major),
    undergraduate_school: toText(profile?.undergraduate_school),
  };
}

function optionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(value: string) {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? null : parsed;
}

function optionalArray(value: string[]) {
  return value.length > 0 ? value : null;
}

export function OnboardingForm({
  initialProfile,
  userId,
}: {
  initialProfile: StudentProfile | null;
  userId: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<OnboardingState>(() => getInitialState(initialProfile));
  const [scoreDraft, setScoreDraft] = useState<TestScore>({ score: "", type: "IELTS" });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const progress = useMemo(() => Math.round(((step + 1) / steps.length) * 100), [step]);

  function updateField<K extends keyof OnboardingState>(field: K, value: OnboardingState[K]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function toggleArray(field: "target_countries" | "target_majors", item: string) {
    setValues((current) => {
      const existing = current[field];
      return {
        ...current,
        [field]: existing.includes(item)
          ? existing.filter((value) => value !== item)
          : [...existing, item],
      };
    });
  }

  function validateStep() {
    if (step === 0 && !values.full_name.trim()) {
      setError("请先填写姓名，之后你可以在个人资料中修改。");
      return false;
    }

    setError(null);
    return true;
  }

  function goNext() {
    if (!validateStep()) {
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function skipStep() {
    if (step === 0) {
      setError("姓名是必填项，填写后才能继续。");
      return;
    }

    setError(null);
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  function addScore() {
    const type = scoreDraft.type.trim();
    const score = scoreDraft.score.trim();

    if (!type || !score) {
      setError("请填写考试类型和成绩，或直接跳过这一步。");
      return;
    }

    setValues((current) => ({
      ...current,
      test_scores: [...current.test_scores, { score, type }],
    }));
    setScoreDraft({ score: "", type });
    setError(null);
  }

  function removeScore(index: number) {
    setValues((current) => ({
      ...current,
      test_scores: current.test_scores.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function finish() {
    if (!values.full_name.trim()) {
      setStep(0);
      setError("请先填写姓名，之后你可以在个人资料中修改。");
      return;
    }

    setIsSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: saveError } = await supabase.from("student_profiles").upsert(
      {
        current_year: optionalText(values.current_year),
        full_name: values.full_name.trim(),
        gpa: optionalNumber(values.gpa),
        gpa_scale: optionalNumber(values.gpa_scale),
        nickname: optionalText(values.nickname),
        target_countries: optionalArray(values.target_countries),
        target_majors: optionalArray(values.target_majors),
        test_scores: values.test_scores,
        undergraduate_country: optionalText(values.undergraduate_country),
        undergraduate_major: optionalText(values.undergraduate_major),
        undergraduate_school: optionalText(values.undergraduate_school),
        user_id: userId,
      },
      { onConflict: "user_id" },
    );

    setIsSaving(false);

    if (saveError) {
      setError(saveError.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <section className="mx-auto max-w-3xl py-4">
      <div className="border-b pb-8">
        <p className="text-sm font-semibold text-primary">第 {step + 1} / {steps.length} 步</p>
        <h1 className="mt-2 text-3xl font-semibold">一起来设置你的工作区</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          几个简单的问题，帮助 MyGrad 为你推荐下一步。所有内容之后都可以修改。
        </p>
        <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-6 shadow-sm">
        {step === 0 ? (
          <StepShell description="姓名用于工作台显示，你之后可以修改。" title="首先，我们怎么称呼你？">
            <TextInput
              label="full_name"
              onChange={(value) => updateField("full_name", value)}
              placeholder="请输入姓名"
              required
              value={values.full_name}
            />
            <TextInput
              label="nickname，可选"
              onChange={(value) => updateField("nickname", value)}
              placeholder="例如：Yuyang"
              value={values.nickname}
            />
          </StepShell>
        ) : null}

        {step === 1 ? (
          <StepShell title="介绍一下你的学校">
            <TextInput
              label="undergraduate_country"
              onChange={(value) => updateField("undergraduate_country", value)}
              placeholder="例如：China / United States"
              value={values.undergraduate_country}
            />
            <TextInput
              label="undergraduate_school"
              onChange={(value) => updateField("undergraduate_school", value)}
              placeholder="请输入本科学校"
              value={values.undergraduate_school}
            />
          </StepShell>
        ) : null}

        {step === 2 ? (
          <StepShell title="你现在的专业和年级是？">
            <TextInput
              label="undergraduate_major"
              onChange={(value) => updateField("undergraduate_major", value)}
              placeholder="例如：Computer Science"
              value={values.undergraduate_major}
            />
            <TextInput
              label="current_year"
              onChange={(value) => updateField("current_year", value)}
              placeholder="例如：大三 / Senior / 已毕业"
              value={values.current_year}
            />
          </StepShell>
        ) : null}

        {step === 3 ? (
          <StepShell title="你的成绩大概是多少？">
            <TextInput
              label="gpa"
              onChange={(value) => updateField("gpa", value)}
              placeholder="例如：3.7"
              type="number"
              value={values.gpa}
            />
            <TextInput
              label="gpa_scale"
              onChange={(value) => updateField("gpa_scale", value)}
              placeholder="4.0 / 5.0 / 100 / 其他数字"
              type="number"
              value={values.gpa_scale}
            />
          </StepShell>
        ) : null}

        {step === 4 ? (
          <StepShell title="你有哪些语言或标准化考试成绩？">
            <div className="grid gap-3 sm:grid-cols-[180px_1fr_auto] sm:items-end">
              <label className="grid gap-2 text-sm font-medium">
                type
                <select
                  className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
                  onChange={(event) => setScoreDraft((current) => ({ ...current, type: event.target.value }))}
                  value={scoreDraft.type}
                >
                  {scoreTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </label>
              <TextInput
                label="score"
                onChange={(value) => setScoreDraft((current) => ({ ...current, score: value }))}
                placeholder="例如：7.0 / 100 / 320"
                value={scoreDraft.score}
              />
              <Button onClick={addScore} type="button">添加</Button>
            </div>
            <div className="mt-4 grid gap-2">
              {values.test_scores.length === 0 ? (
                <p className="rounded-md border bg-background p-3 text-sm text-muted-foreground">还没有添加考试成绩，可以跳过。</p>
              ) : (
                values.test_scores.map((score, index) => (
                  <div className="flex items-center justify-between gap-3 rounded-md border bg-background p-3" key={`${score.type}-${index}`}>
                    <span className="text-sm font-medium">{score.type}: {score.score}</span>
                    <Button onClick={() => removeScore(index)} size="sm" type="button" variant="outline">删除</Button>
                  </div>
                ))
              )}
            </div>
          </StepShell>
        ) : null}

        {step === 5 ? (
          <StepShell title="你想申请哪些国家或地区？">
            <OptionGrid
              options={countryOptions}
              selected={values.target_countries}
              onToggle={(item) => toggleArray("target_countries", item)}
            />
          </StepShell>
        ) : null}

        {step === 6 ? (
          <StepShell title="你感兴趣的研究生方向是？">
            <OptionGrid
              options={majorOptions}
              selected={values.target_majors}
              onToggle={(item) => toggleArray("target_majors", item)}
            />
          </StepShell>
        ) : null}

        {error ? (
          <p className="mt-5 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </p>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button disabled={step === 0 || isSaving} onClick={skipStep} type="button" variant="ghost">
            跳过
          </Button>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button disabled={step === 0 || isSaving} onClick={() => setStep((current) => Math.max(current - 1, 0))} type="button" variant="outline">
              上一步
            </Button>
            {step === steps.length - 1 ? (
              <Button disabled={isSaving} onClick={finish} type="button">
                {isSaving ? "保存中..." : "完成并进入工作台"}
              </Button>
            ) : (
              <Button disabled={isSaving} onClick={goNext} type="button">下一步</Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StepShell({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description?: string;
  title: string;
}) {
  return (
    <div>
      <h2 className="text-2xl font-semibold">{title}</h2>
      {description ? <p className="mt-2 text-sm text-muted-foreground">{description}</p> : null}
      <div className="mt-6 grid gap-4">{children}</div>
    </div>
  );
}

function TextInput({
  label,
  onChange,
  placeholder,
  required,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}{required ? <span className="text-destructive"> *</span> : null}
      <input
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        value={value}
      />
    </label>
  );
}

function OptionGrid({
  onToggle,
  options,
  selected,
}: {
  onToggle: (item: string) => void;
  options: string[];
  selected: string[];
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const active = selected.includes(option);

        return (
          <button
            className={active
              ? "rounded-md border border-blue-300 bg-blue-100 px-4 py-3 text-left text-sm font-semibold text-slate-950"
              : "rounded-md border bg-background px-4 py-3 text-left text-sm font-medium hover:bg-muted"}
            key={option}
            onClick={() => onToggle(option)}
            type="button"
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
