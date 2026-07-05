import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/workspace/UserMenu";
import { createClient } from "@/lib/supabase/server";

type ProfileName = {
  full_name: string | null;
  nickname: string | null;
};

const authedNavItems = [
  { href: "/dashboard", label: "总览" },
  { href: "/schools", label: "学校库" },
  { href: "/programs", label: "项目库" },
  { href: "/about", label: "About" },
  { href: "/feedback", label: "Feedback" },
];

export async function AuthAwareHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <SiteHeader />;
  }

  const { data: profile } = await supabase
    .from("student_profiles")
    .select("full_name,nickname")
    .eq("user_id", user.id)
    .maybeSingle<ProfileName>();

  const userName = profile?.full_name ?? profile?.nickname ?? null;

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link className="flex shrink-0 items-center gap-2 font-semibold" href="/dashboard">
          <span className="flex h-9 w-9 items-center justify-center rounded-md border border-sky-200 bg-sky-100 text-sky-950">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>MyGrad</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {authedNavItems.map((item) => (
            <Button asChild key={item.href} variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-1 sm:flex lg:hidden">
            <Button asChild size="sm" variant="ghost">
              <Link href="/dashboard">总览</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href="/programs">项目库</Link>
            </Button>
          </div>
          <UserMenu userEmail={user.email} userName={userName} />
        </div>
      </div>
    </header>
  );
}
