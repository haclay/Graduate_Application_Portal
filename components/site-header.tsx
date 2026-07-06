import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/about", label: "About" },
  { href: "/feedback", label: "Feedback" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link className="flex shrink-0 items-center gap-2 font-semibold" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-sky-200 bg-sky-100 text-sky-950">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>MyGrad</span>
        </Link>

        <div className="flex items-center gap-6 sm:gap-8">
          <nav className="hidden items-center gap-6 sm:flex lg:gap-8">
            {navItems.map((item) => (
              <Link className="text-sm font-medium text-foreground/80 transition hover:text-foreground" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <Button asChild size="sm" variant="outline">
            <Link href="/login">登录</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
