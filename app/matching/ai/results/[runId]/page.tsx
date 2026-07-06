import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Button } from "@/components/ui/button";
import { AppShell } from "@/components/workspace/AppShell";
import { AI_DYNAMIC_QUANTITY_NOTE, AI_RECOMMENDATION_DISCLAIMER, AI_TIER_LABELS, AI_TIER_ORDER } from "@/lib/ai-matching/types";
import type { AiRecommendationItem, AiRecommendationRun, AiSchoolCandidate } from "@/lib/ai-matching/types";
import { formatQsRank } from "@/lib/schools/format";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type AiMatchingResultsPageProps = {
  params: Promise<{ runId: string }>;
};

type RecommendationRow = Omit<AiRecommendationItem, "school"> & {
  schools: AiSchoolCandidate | AiSchoolCandidate[] | null;
};

const TEXT = {
  aiResult: "AI \u63a8\u8350\u7ed3\u679c",
  aiResearch: "AI \u8c03\u7814\u9879\u76ee Coming soon",
  back: "\u8fd4\u56de AI \u9009\u6821\u63a8\u8350",
  disclaimerTitle: "\u514d\u8d23\u58f0\u660e",
  empty: "\u6682\u65e0 AI \u63a8\u8350\u7ed3\u679c",
  emptyDescription: "\u5982\u679c\u521a\u521a\u751f\u6210\u5931\u8d25\uff0c\u8bf7\u8fd4\u56de AI \u9009\u6821\u63a8\u8350\u9875\u91cd\u65b0\u751f\u6210\u3002",
  fitScore: "\u5339\u914d\u5206\u6570",
  generatedStrategy: "\u63a8\u8350\u7b56\u7565\u5df2\u751f\u6210",
  major: "\u63a8\u8350\u4e13\u4e1a\u65b9\u5411",
  noTierItems: "\u8be5\u6863\u4f4d\u6682\u65e0\u63a8\u8350\u5b66\u6821\u3002",
  profileAnalysis: "AI \u7528\u6237\u753b\u50cf\u5206\u6790",
  profileAnalysisDescription: "AI \u4f1a\u5148\u5206\u6790\u4f60\u7684\u80cc\u666f\uff0c\u518d\u751f\u6210\u5b66\u6821\u5206\u6863\u5efa\u8bae\u3002",
  regenerate: "\u91cd\u65b0\u751f\u6210 AI \u9009\u6821\u63a8\u8350",
  schoolPending: "\u5b66\u6821\u4fe1\u606f\u5f85\u6838\u5bf9",
  schoolsUnit: "\u6240\u5b66\u6821",
  subtitle: "\u7cfb\u7edf\u4f1a\u7efc\u5408\u4f60\u7684\u80cc\u666f\u3001\u76ee\u6807\u65b9\u5411\u548c\u5b66\u6821\u5f3a\u52bf\u65b9\u5411\u751f\u6210\u63a8\u8350\u3002",
  threeTiers: "\u4e09\u6863\u63a8\u8350",
  title: "AI \u4e2a\u6027\u5316\u9009\u6821\u63a8\u8350\u7ed3\u679c",
  viewSchool: "\u67e5\u770b\u5b66\u6821",
  wishlist: "\u52a0\u5165\u9009\u6821\u5217\u8868 Coming soon",
};

const PROFILE_LABELS = {
  academicRisks: "\u7533\u8bf7\u98ce\u9669",
  academicStrengths: "\u5b66\u672f\u4f18\u52bf",
  academicWeaknesses: "\u5b66\u672f\u77ed\u677f",
  backgroundSummary: "\u80cc\u666f\u603b\u7ed3",
  improvement: "\u63d0\u5347\u5efa\u8bae",
  internship: "\u5b9e\u4e60\u4f18\u52bf",
  language: "\u8bed\u8a00/\u6807\u5316\u5206\u6790",
  project: "\u9879\u76ee\u4f18\u52bf",
  research: "\u79d1\u7814\u4f18\u52bf",
  strategy: "\u63a8\u8350\u7b56\u7565",
  strategyByTier: "\u5206\u6863\u7b56\u7565",
  targetSummary: "\u76ee\u6807\u65b9\u5411\u603b\u7ed3",
};

export default async function AiMatchingResultsPage({ params }: AiMatchingResultsPageProps) {
  const { runId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("full_name, nickname")
    .eq("user_id", user.id)
    .maybeSingle<{ full_name: string | null; nickname: string | null }>();

  const { data: run, error: runError } = await supabase
    .from("ai_recommendation_runs")
    .select("*")
    .eq("id", runId)
    .eq("user_id", user.id)
    .maybeSingle<AiRecommendationRun>();

  if (runError) {
    return <ErrorPage message={runError.message} userEmail={user.email} userName={profile?.full_name ?? profile?.nickname} />;
  }

  if (!run) {
    notFound();
  }

  const { data: recommendations, error: recommendationsError } = await supabase
    .from("ai_school_recommendations")
    .select(
      "id, run_id, user_id, school_id, tier, recommended_major, recommended_program_keywords, ai_reason, ai_risks, next_steps, evidence_from_profile, evidence_from_school, fit_score, created_at, schools(id, name, name_en, slug, country, city, qs_rank_2027, qs_rank_display, us_news_rank, the_rank, strong_subjects, popular_programs, school_type, student_faculty_ratio, international_student_ratio, estimated_annual_cost)",
    )
    .eq("run_id", runId)
    .eq("user_id", user.id)
    .returns<RecommendationRow[]>();

  if (recommendationsError) {
    return <ErrorPage message={recommendationsError.message} userEmail={user.email} userName={profile?.full_name ?? profile?.nickname} />;
  }

  const items = (recommendations ?? []).map((item) => ({ ...item, school: normalizeSchoolRelation(item.schools) }));
  const disclaimer = run.disclaimer ?? AI_RECOMMENDATION_DISCLAIMER;

  return (
    <AppShell userEmail={user.email} userName={profile?.full_name ?? profile?.nickname}>
      <section className="py-4">
        <Button asChild variant="ghost">
          <Link href="/matching/ai">{TEXT.back}</Link>
        </Button>

        <div className="mt-6 border-b pb-8">
          <p className="text-sm font-semibold text-primary">{TEXT.aiResult}</p>
          <h1 className="mt-2 text-3xl font-semibold">{TEXT.title}</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">{TEXT.subtitle}</p>
        </div>

        {run.status === "failed" ? (
          <div className="mt-6 rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">
            {run.error_message ?? TEXT.emptyDescription}
          </div>
        ) : null}

        {run.user_profile_analysis ? <ProfileAnalysisSection run={run} /> : null}

        {items.length === 0 ? (
          <div className="mt-8 rounded-lg border bg-card p-8 text-center">
            <h2 className="text-xl font-semibold">{TEXT.empty}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">{TEXT.emptyDescription}</p>
            <Button asChild className="mt-6">
              <Link href="/matching/ai">{TEXT.regenerate}</Link>
            </Button>
          </div>
        ) : (
          <section className="mt-8 grid gap-6">
            <div>
              <h2 className="text-2xl font-semibold">{TEXT.threeTiers}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{run.recommendation_plan?.quantity_note ?? AI_DYNAMIC_QUANTITY_NOTE}</p>
            </div>
            {AI_TIER_ORDER.map((tier) => {
              const tierItems = items.filter((item) => item.tier === tier);
              return <AiTierGroup items={tierItems} key={tier} tier={tier} />;
            })}
          </section>
        )}

        <section className="mt-8 rounded-lg border bg-accent/40 p-5 text-sm leading-6 text-accent-foreground">
          <h2 className="font-semibold">{TEXT.disclaimerTitle}</h2>
          <p className="mt-2">{disclaimer}</p>
        </section>
      </section>
    </AppShell>
  );
}

function ProfileAnalysisSection({ run }: { run: AiRecommendationRun }) {
  const analysis = run.user_profile_analysis;
  if (!analysis) {
    return null;
  }

  return (
    <section className="mt-8 rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{TEXT.profileAnalysis}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{TEXT.profileAnalysisDescription}</p>
        </div>
        {run.recommendation_plan?.strategy_summary ? (
          <span className="rounded-md bg-secondary px-3 py-1 text-sm text-secondary-foreground">{TEXT.generatedStrategy}</span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <TextPanel label={PROFILE_LABELS.backgroundSummary} value={analysis.overall_summary} />
        <TextPanel label={PROFILE_LABELS.targetSummary} value={analysis.target_direction_summary} />
        <TextPanel label={PROFILE_LABELS.strategy} value={analysis.recommended_strategy} />
        <TextPanel label={PROFILE_LABELS.strategyByTier} value={run.recommendation_plan?.strategy_summary ?? null} />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <ListPanel label={PROFILE_LABELS.academicStrengths} values={analysis.academic_strengths} />
        <ListPanel label={PROFILE_LABELS.academicWeaknesses} values={analysis.academic_weaknesses} />
        <ListPanel label={PROFILE_LABELS.research} values={analysis.research_strengths} />
        <ListPanel label={PROFILE_LABELS.internship} values={analysis.internship_strengths} />
        <ListPanel label={PROFILE_LABELS.project} values={analysis.project_strengths} />
        <ListPanel label={PROFILE_LABELS.language} values={analysis.language_test_analysis} />
        <ListPanel label={PROFILE_LABELS.academicRisks} values={analysis.application_risks} />
        <ListPanel label={PROFILE_LABELS.improvement} values={analysis.improvement_suggestions} />
      </div>
    </section>
  );
}

function AiTierGroup({ items, tier }: { items: Array<AiRecommendationItem>; tier: (typeof AI_TIER_ORDER)[number] }) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{AI_TIER_LABELS[tier]}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {TEXT.schoolsUnit}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-5 rounded-md border bg-background p-4 text-sm text-muted-foreground">{TEXT.noTierItems}</p>
      ) : (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <AiRecommendationCard item={item} key={item.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function AiRecommendationCard({ item }: { item: AiRecommendationItem }) {
  const school = item.school;
  const qsRank = school ? formatQsRank(school) : null;

  return (
    <article className="rounded-lg border bg-background p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">{school?.name ?? TEXT.schoolPending}</h3>
          {school ? (
            <p className="mt-1 text-sm text-muted-foreground">
              {school.country}
              {school.city ? ` / ${school.city}` : ""}
            </p>
          ) : null}
        </div>
        {item.fit_score !== null ? <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium">{TEXT.fitScore} {item.fit_score}</span> : null}
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        {qsRank ? <Info label="QS 2027" value={qsRank} /> : null}
        <Info label={TEXT.major} value={item.recommended_major} />
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {school ? (
          <Button asChild>
            <Link href={`/schools/${school.slug}`}>{TEXT.viewSchool}</Link>
          </Button>
        ) : null}
        <Button disabled variant="outline">
          {TEXT.aiResearch}
        </Button>
        <Button disabled variant="outline">
          {TEXT.wishlist}
        </Button>
      </div>
    </article>
  );
}

function TextPanel({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-md border bg-background p-4">
      <h3 className="font-semibold">{label}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  );
}

function ListPanel({ label, values }: { label: string; values: string[] }) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border bg-background p-4">
      <h3 className="font-semibold">{label}</h3>
      <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted-foreground">
        {values.map((value) => (
          <li key={value}>- {value}</li>
        ))}
      </ul>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) {
    return null;
  }

  return (
    <div className="rounded-md border bg-card p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function normalizeSchoolRelation(value: AiSchoolCandidate | AiSchoolCandidate[] | null) {
  return Array.isArray(value) ? value[0] ?? null : value;
}

function ErrorPage({ message, userEmail, userName }: { message: string; userEmail: string | null | undefined; userName?: string | null }) {
  return (
    <AppShell userEmail={userEmail} userName={userName}>
      <section className="py-4">
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-sm text-destructive">{message}</div>
      </section>
    </AppShell>
  );
}
