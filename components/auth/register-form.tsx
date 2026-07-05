"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (password !== confirmPassword) {
      setError("两次输入的密码不一致。");
      return;
    }

    setIsSubmitting(true);

    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError.message);
      return;
    }

    if (data.session) {
      setSuccess("注册成功。你现在可以进入工作台，也可以先完善背景档案。");
      return;
    }

    setSuccess("注册成功。请检查邮箱完成验证，然后回到登录页登录。");
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
          placeholder="至少 6 位"
          required
          type="password"
          value={password}
        />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        确认密码
        <input
          className="h-10 rounded-md border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          minLength={6}
          onChange={(event) => setConfirmPassword(event.target.value)}
          placeholder="再次输入密码"
          required
          type="password"
          value={confirmPassword}
        />
      </label>
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-md border border-secondary bg-secondary/70 px-3 py-2 text-sm text-secondary-foreground">
          {success}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit">
        {isSubmitting ? "注册中..." : "注册"}
      </Button>
      <Button asChild variant="outline">
        <Link href="/login">已有账号，去登录</Link>
      </Button>
    </form>
  );
}
