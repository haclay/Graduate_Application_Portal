import { RecommendationCard } from "@/components/matching/RecommendationCard";
import type { MatchingResult, MatchingTier } from "@/lib/matching/types";
import { tierLabels } from "@/lib/matching/types";

export function RecommendationGroup({
  results,
  tier,
}: {
  results: MatchingResult[];
  tier: MatchingTier;
}) {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex flex-col justify-between gap-2 border-b pb-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-semibold">{tierLabels[tier]}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            MVP 规则系统分组结果
          </p>
        </div>
        <span className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
          {results.length} 个项目
        </span>
      </div>

      {results.length === 0 ? (
        <p className="mt-5 rounded-md border bg-background p-4 text-sm text-muted-foreground">
          当前分组暂无项目。
        </p>
      ) : (
        <div className="mt-5 grid gap-4">
          {results.map((result) => (
            <RecommendationCard key={result.program.id} result={result} />
          ))}
        </div>
      )}
    </section>
  );
}
