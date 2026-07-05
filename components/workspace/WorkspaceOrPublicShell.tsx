import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AppShell } from "@/components/workspace/AppShell";
import { createClient } from "@/lib/supabase/server";

export async function WorkspaceOrPublicShell({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    return <AppShell userEmail={user.email}>{children}</AppShell>;
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />
      {children}
      <SiteFooter />
    </main>
  );
}
