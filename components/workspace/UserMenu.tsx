"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LifeBuoy,
  MapPinned,
  MessageSquare,
  Settings,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ProfileName = {
  full_name: string | null;
  nickname: string | null;
};

export function UserMenu({
  userEmail,
  userName,
}: {
  userEmail: string | null | undefined;
  userName?: string | null;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(
    userName?.trim() || null,
  );

  useEffect(() => {
    let ignore = false;

    async function loadProfileName() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return;
      }

      const { data } = await supabase
        .from("student_profiles")
        .select("full_name,nickname")
        .eq("user_id", user.id)
        .maybeSingle<ProfileName>();

      if (ignore) {
        return;
      }

      const preferredName = data?.full_name?.trim() || data?.nickname?.trim();
      if (preferredName) {
        setProfileName(preferredName);
      }
    }

    loadProfileName();

    return () => {
      ignore = true;
    };
  }, []);

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

  const emailPrefix = userEmail?.split("@")[0] ?? "同学";
  const displayName = profileName || emailPrefix;
  const avatarInitial = useMemo(() => {
    const [firstChar] = Array.from(displayName.trim() || "M");
    return firstChar.toUpperCase();
  }, [displayName]);

  async function handleSignOut() {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    setMenuOpen(false);
    router.push("/login");
    router.refresh();
  }

  function handleEnglishClick() {
    window.alert("English version coming soon");
    setMenuOpen(false);
  }

  return (
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
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {userEmail ?? "未绑定邮箱"}
            </p>
          </div>
          <MenuLink
            href="/profile"
            icon={UserRound}
            label="个人资料"
            onNavigate={() => setMenuOpen(false)}
          />
          <MenuLink
            href="/settings"
            icon={Settings}
            label="账号设置"
            onNavigate={() => setMenuOpen(false)}
          />
          <MenuLink
            href="/guide"
            icon={MapPinned}
            label="申请指南"
            onNavigate={() => setMenuOpen(false)}
          />
          <MenuLink
            href="/help"
            icon={LifeBuoy}
            label="帮助与联系"
            onNavigate={() => setMenuOpen(false)}
          />
          <MenuLink
            href="/feedback"
            icon={MessageSquare}
            label="反馈问题"
            onNavigate={() => setMenuOpen(false)}
          />
          <div className="my-1 border-t" />
          <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm">
            <span className="text-muted-foreground">语言切换</span>
            <div className="flex items-center gap-2 font-semibold">
              <span>中文</span>
              <span className="text-border">|</span>
              <button className="text-primary" onClick={handleEnglishClick} type="button">
                EN
              </button>
            </div>
          </div>
          <Button
            className="mt-2 w-full"
            disabled={isSigningOut}
            onClick={handleSignOut}
            variant="outline"
          >
            {isSigningOut ? "退出中..." : "退出登录"}
          </Button>
        </div>
      ) : null}
    </div>
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
    <Link
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
      href={href}
      onClick={onNavigate}
    >
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      <span>{label}</span>
    </Link>
  );
}
