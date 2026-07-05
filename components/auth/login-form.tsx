"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setIsSubmitting(false);
      setError("邮箱或密码不正确。如果你还没有账号，请先注册。");
      return;
    }

    const userId = data.user?.id;

    if (!userId) {
      setIsSubmitting(false);
      setError("登录成功，但无法读取用户信息。请刷新后重试。");
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("student_profiles")
      .select("full_name")
      .eq("user_id", userId)
      .maybeSingle<{ full_name: string | null }>();

    setIsSubmitting(false);

    if (profileError) {
      setError(profileError.message);
      return;
    }

    router.replace(profile?.full_name?.trim() ? "/dashboard" : "/onboarding");
    router.refresh();
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-medium">
        邮箱
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="student@example.com"
          required
          type="email"
          value={email}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        密码
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="请输入密码"
          required
          type="password"
          value={password}
        />
      </label>
      {error ? (
        <div className="grid gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-3 text-sm text-destructive">
          <p>{error}</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              className="border-destructive/30 bg-background text-destructive hover:bg-destructive/10"
              onClick={() => {
                setError(null);
                setPassword("");
              }}
              type="button"
              variant="outline"
            >
              重新输入
            </Button>
            <Button asChild variant="outline">
              <Link href="/register">去注册</Link>
            </Button>
          </div>
        </div>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "登录中..." : "登录"}
      </Button>
      <Button asChild variant="outline">
        <Link href="/register">还没有账号，去注册</Link>
      </Button>
    </form>
  );
}
