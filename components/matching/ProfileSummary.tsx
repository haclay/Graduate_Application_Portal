import type { StudentProfile } from "@/lib/profile/types";

export function ProfileSummary({ profile }: { profile: StudentProfile }) {
  const items = [
    ["本科院校", profile.undergraduate_school],
    ["本科专业", profile.undergraduate_major],
    ["GPA", formatGpa(profile.gpa, profile.gpa_scale)],
    ["语言成绩", formatLanguage(profile.ielts, profile.toefl)],
    ["目标国家", profile.target_countries?.join("、")],
    ["目标专业", profile.target_majors?.join("、")],
    ["未来目标", profile.future_goal],
    ["计划入学年份", formatNumber(profile.planned_entry_year)],
  ];

  return (
    <section className="rounded-lg border bg-card p-5">
      <h2 className="text-lg font-semibold">当前背景摘要</h2>
      <dl className="mt-5 grid gap-4 md:grid-cols-2">
        {items.map(([label, value]) => (
          <div className="rounded-md border bg-background p-4" key={label}>
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6">
              {value && value.length > 0 ? value : "未填写"}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatGpa(gpa: number | null, scale: number | null) {
  if (!gpa || !scale) {
    return "";
  }

  return `${gpa} / ${scale}`;
}

function formatLanguage(ielts: number | null, toefl: number | null) {
  const values = [];

  if (ielts) {
    values.push(`IELTS ${ielts}`);
  }

  if (toefl) {
    values.push(`TOEFL ${toefl}`);
  }

  return values.join("，");
}

function formatNumber(value: number | null) {
  return value === null ? "" : String(value);
}
