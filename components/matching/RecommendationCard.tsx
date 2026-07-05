import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { AddToApplicationButton } from "@/components/applications/AddToApplicationButton";
import { Button } from "@/components/ui/button";
import type { MatchingResult } from "@/lib/matching/types";
import { tierLabels } from "@/lib/matching/types";

export function RecommendationCard({
  result,
  userId,
}: {
  result: MatchingResult;
  userId: string;
}) {
  const { nearestDeadline, program, school } = result;

  return (
    <article className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            {school?.name ?? "未知学校"}
          </p>
          <h3 className="mt-1 text-xl font-semibold">{program.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {school?.country ?? "国家待核对"}
            {school?.city ? ` / ${school.city}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
            {tierLabels[result.tier]}
          </span>
          <span className="rounded-md border bg-background px-3 py-1 text-sm font-medium">
            {result.score} 分
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-md border bg-background p-3 text-sm">
        <span className="text-muted-foreground">最近 DDL：</span>
        {nearestDeadline?.deadline_date ?? "请以官网为准"}
        {nearestDeadline?.intake_term ? ` · ${nearestDeadline.intake_term}` : ""}
      </div>

      <FeedbackList items={result.reasons} title="推荐理由" />
      <FeedbackList items={result.risks} title="风险提示" />
      <FeedbackList items={result.improvements} title="补强建议" />

      <div className="mt-5 grid gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href={`/programs/${program.slug}`}>查看项目详情</Link>
          </Button>
          {program.official_url ? (
            <Button asChild variant="outline">
              <a href={program.official_url} rel="noreferrer" target="_blank">
                官网
                <ExternalLink className="h-4 w-4" aria-hidden />
              </a>
            </Button>
          ) : null}
        </div>
        <AddToApplicationButton programId={program.id} userId={userId} />
      </div>
    </article>
  );
}

function FeedbackList({ items, title }: { items: string[]; title: string }) {
  return (
    <section className="mt-4">
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li
            className="rounded-md border bg-background px-3 py-2 text-sm leading-6 text-muted-foreground"
            key={item}
          >
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}