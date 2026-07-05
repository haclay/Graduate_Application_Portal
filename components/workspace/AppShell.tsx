"use client";

import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpenCheck,
  CalendarClock,
  ClipboardList,
  FileText,
  GraduationCap,
  HelpCircle,
  Home,
  Layers3,
  LetterText,
  LifeBuoy,
  ListChecks,
  MapPinned,
  Menu,
  MessageSquare,
  Plane,
  Settings,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

type NavItem = {
  href?: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  soon?: boolean;
};

type NavGroup = {
  items: NavItem[];
  title: string;
};

const navGroups: NavGroup[] = [
  {
    title: "概览",
    items: [{ href: "/dashboard", icon: Home, label: "总览" }],
  },
  {
    title: "申请规划",
    items: [
      { href: "/profile", icon: UserRound, label: "背景评估" },
      { href: "/matching", icon: Sparkles, label: "选校定位" },
      { href: "/schools", icon: GraduationCap, label: "学校库" },
      { href: "/programs", icon: BookOpenCheck, label: "项目库" },
    ],
  },
  {
    title: "申请管理",
    items: [
      { href: "/applications", icon: ClipboardList, label: "我的申请清单" },
      { href: "/calendar", icon: CalendarClock, label: "时间线与 DDL" },
      { href: "/tasks", icon: ListChecks, label: "任务管理" },
    ],
  },
  {
    title: "材料准备",
    items: [
      { icon: FileText, label: "文书与简历", soon: true },
      { icon: LetterText, label: "推荐信", soon: true },
    ],
  },
  {
    title: "录取与入学",
    items: [
      { icon: Layers3, label: "Offer 对比", soon: true },
      { icon: Plane, label: "入学准备", soon: true },
    ],
  },
  {
    title: "支持",
    items: [
      { icon: MessageSquare, label: "学长学姐 / Mentor", soon: true },
      { href: "/feedback", icon: HelpCircle, label: "帮助与反馈" },
    ],
  },
];

export function AppShell({
  children,
  userEmail,
  userName,
}: {
  children: ReactNode;
  userEmail: string | null | undefined;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const displayName = userName || userEmail?.split("@")[0] || "同学";
  const avatarInitial = useMemo(() => {
    const source = displayName || userEmail || "M";
    return source.trim().charAt(0).toUpperCase();
  }, [displayName, userEmail]);


  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);
  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleEnglishClick() {
    window.alert("English version coming soon");
    setMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-muted/35 text-foreground lg:grid lg:grid-cols-[280px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r bg-card lg:block">
        <SidebarContent pathname={pathname} />
      </aside>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="关闭工作台菜单"
            className="absolute inset-0 bg-foreground/30"
            onClick={() => setSidebarOpen(false)}
            type="button"
          />
          <aside className="relative h-full w-[86vw] max-w-80 overflow-y-auto border-r bg-card shadow-xl">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <GraduationCap className="h-5 w-5" aria-hidden="true" />
                </span>
                <span>MyGrad</span>
              </Link>
              <Button aria-label="关闭菜单" onClick={() => setSidebarOpen(false)} size="icon" variant="ghost">
                <X className="h-5 w-5" aria-hidden />
              </Button>
            </div>
            <SidebarNav pathname={pathname} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      ) : null}

      <div className="min-w-0">
        <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <Button aria-label="打开工作台菜单" onClick={() => setSidebarOpen(true)} size="icon" variant="outline" className="lg:hidden">
                <Menu className="h-5 w-5" aria-hidden />
              </Button>
              <div>
                <p className="text-sm font-semibold">MyGrad 工作台</p>
                <p className="hidden text-xs text-muted-foreground sm:block">选校、DDL、任务和材料进度集中管理</p>
              </div>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                className="flex items-center gap-2 rounded-full border bg-card py-1 pl-1 pr-3 text-sm font-medium shadow-sm transition-colors hover:bg-muted"
                onClick={() => setMenuOpen((open) => !open)}
                type="button"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {avatarInitial}
                </span>
                <span className="hidden max-w-40 truncate sm:inline">{displayName}</span>
              </button>

              {menuOpen ? (
                <div className="absolute right-0 mt-2 w-72 rounded-lg border bg-card p-2 shadow-lg">
                  <div className="border-b px-3 py-3">
                    <p className="font-semibold">{displayName}</p>
                    <p className="mt-1 truncate text-sm text-muted-foreground">{userEmail ?? "未绑定邮箱"}</p>
                  </div>
                  <MenuLink href="/profile" label="个人资料" icon={UserRound} onNavigate={() => setMenuOpen(false)} />
                  <MenuLink href="/profile" label="账号设置" icon={Settings} onNavigate={() => setMenuOpen(false)} />
                  <MenuLink href="/about" label="申请指南" icon={MapPinned} onNavigate={() => setMenuOpen(false)} />
                  <MenuLink href="/feedback" label="帮助与联系" icon={LifeBuoy} onNavigate={() => setMenuOpen(false)} />
                  <MenuLink href="/feedback" label="反馈问题" icon={MessageSquare} onNavigate={() => setMenuOpen(false)} />
                  <div className="my-1 border-t" />
                  <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm">
                    <span className="text-muted-foreground">语言切换</span>
                    <div className="flex items-center gap-2 font-semibold">
                      <span>中文</span>
                      <span className="text-border">|</span>
                      <button className="text-primary" onClick={handleEnglishClick} type="button">EN</button>
                    </div>
                  </div>
                  <Button className="mt-2 w-full" disabled={isSigningOut} onClick={handleSignOut} variant="outline">
                    {isSigningOut ? "退出中..." : "退出登录"}
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b px-5">
        <Link className="flex items-center gap-2 font-semibold" href="/dashboard">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>MyGrad</span>
        </Link>
      </div>
      <SidebarNav pathname={pathname} />
    </div>
  );
}

function SidebarNav({
  onNavigate,
  pathname,
}: {
  onNavigate?: () => void;
  pathname: string;
}) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      {navGroups.map((group) => (
        <div className="mb-5" key={group.title}>
          <p className="px-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {group.title}
          </p>
          <div className="mt-2 grid gap-1">
            {group.items.map((item) => (
              <SidebarItem item={item} key={item.label} onNavigate={onNavigate} pathname={pathname} />
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}

function SidebarItem({
  item,
  onNavigate,
  pathname,
}: {
  item: NavItem;
  onNavigate?: () => void;
  pathname: string;
}) {
  const Icon = item.icon;
  const isActive = item.href ? pathname === item.href || pathname.startsWith(`${item.href}/`) : false;
  const className = cn(
    "flex min-h-10 items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-primary text-primary-foreground"
      : item.soon
        ? "cursor-not-allowed text-muted-foreground"
        : "text-foreground hover:bg-muted",
  );
  const content = (
    <>
      <span className="flex min-w-0 items-center gap-3">
        <Icon className="h-4 w-4 shrink-0" aria-hidden />
        <span className="truncate">{item.label}</span>
      </span>
      {item.soon ? <span className="rounded-md border bg-background px-2 py-0.5 text-xs text-muted-foreground">Soon</span> : null}
    </>
  );

  if (!item.href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link className={className} href={item.href} onClick={onNavigate}>
      {content}
    </Link>
  );
}

function MenuLink({
  href,
  icon: Icon,
  label,
  onNavigate,
}: {
  href: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  label: string;
  onNavigate?: () => void;
}) {
  return (
    <Link className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted" href={href} onClick={onNavigate}>
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
