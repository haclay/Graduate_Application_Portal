"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function SchoolDetailAccessButton({
  href,
  isAuthenticated,
}: {
  href: string;
  isAuthenticated: boolean;
}) {
  const router = useRouter();

  if (isAuthenticated) {
    return (
      <Button asChild>
        <Link href={href}>查看详情</Link>
      </Button>
    );
  }

  return (
    <Button
      onClick={() => {
        window.alert("请先登录后查看学校详情。");
        router.push(`/login?redirect=${encodeURIComponent(href)}&reason=school-detail-required`);
      }}
      type="button"
    >
      查看详情
    </Button>
  );
}