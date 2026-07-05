const tiers = [
  { title: "彩票", description: "难度较高，适合作为尝试项目" },
  { title: "冲刺", description: "有一定机会，但需要重点打磨材料" },
  { title: "匹配", description: "背景与项目要求较接近" },
  { title: "稳妥", description: "相对更符合当前背景，但不代表保证录取" },
];

export function MatchingTierGuide() {
  return (
    <section className="rounded-lg border bg-card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">推荐分层说明</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            当前结果由 MVP 规则系统生成，不代表真实录取概率。
          </p>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-4">
        {tiers.map((tier) => (
          <article className="rounded-md border bg-background p-4" key={tier.title}>
            <h3 className="font-semibold">{tier.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{tier.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
