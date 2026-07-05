import Link from "next/link";

const productLinks = [
  { href: "/schools", label: "学校库" },
  { href: "/programs", label: "项目库" },
  { href: "/matching", label: "选校推荐" },
  { href: "/applications", label: "申请工作台" },
];

const supportLinks = [
  { href: "/about", label: "About" },
  { href: "/feedback", label: "Feedback" },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <section>
          <h2 className="text-sm font-semibold">Product</h2>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            {productLinks.map((link) => (
              <Link className="transition-colors hover:text-foreground" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Support</h2>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            {supportLinks.map((link) => (
              <Link className="transition-colors hover:text-foreground" href={link.href} key={link.href}>
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold">Trust</h2>
          <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
            <p>数据来自平台整理和示例 seed，需持续核对。</p>
            <p>MyGrad 不是录取保证，也不是留学中介。</p>
            <p>申请要求、DDL、学费和材料最终请以学校官网为准。</p>
          </div>
        </section>
      </div>
    </footer>
  );
}
