"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";

export function GenerateAiMatchingButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleGenerate() {
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/matching", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const payload = (await response.json()) as { error?: string; run_id?: string };

      if (!response.ok || !payload.run_id) {
        throw new Error(payload.error ?? "AI 推荐生成失败，请稍后重试。");
      }

      router.push(`/matching/ai/results/${payload.run_id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "AI 推荐生成失败，请稍后重试。");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-3">
      <Button disabled={disabled || isLoading} onClick={handleGenerate} size="lg" type="button">
        <Sparkles className="h-4 w-4" aria-hidden />
        {isLoading ? "AI \u6b63\u5728\u5206\u6790\u4f60\u7684\u80cc\u666f\u548c\u5b66\u6821\u5f3a\u52bf\u65b9\u5411\uff0c\u901a\u5e38\u9700\u8981 20\u201360 \u79d2\u3002" : "\u751f\u6210 AI \u9009\u6821\u63a8\u8350"}
      </Button>
      {error ? <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
