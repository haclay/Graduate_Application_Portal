import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/schools", label: "学校库" },
  { href: "/programs", label: "项目库" },
  { href: "/matching", label: "选校推荐" },
  { href: "/applications", label: "申请清单" },
  { href: "/tasks", label: "任务" },
  { href: "/calendar", label: "DDL" },
  { href: "/dashboard", label: "工作台" },
  { href: "/profile", label: "背景档案" },
  { href: "/register", label: "注册" },
  { href: "/login", label: "登录" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link className="flex items-center gap-2 font-semibold" href="/">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>MyGrad</span>
        </Link>
        <nav className="hidden items-center gap-1 2xl:flex">
          {navItems.map((item) => (
            <Button asChild key={item.href} variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
        <div className="flex gap-2 2xl:hidden">
          <Button asChild size="sm" variant="outline">
            <Link href="/applications">申请清单</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/matching">选校推荐</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}