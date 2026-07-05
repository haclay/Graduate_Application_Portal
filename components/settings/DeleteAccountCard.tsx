"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);

  function closeDialog() {
    setOpen(false);
    setConfirmed(false);
  }

  function handleRequestDelete() {
    setMessageVisible(true);
    closeDialog();
  }

  return (
    <section className="rounded-lg border border-destructive/30 bg-card p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
            <h2 className="text-lg font-semibold">危险区域</h2>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            删除账户会影响你的个人资料、申请清单和任务数据。当前版本先提供确认流程，真实删除功能暂未开放。
          </p>
          {messageVisible ? (
            <p className="mt-4 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              账户删除功能即将开放，如需删除请先通过反馈页面联系管理员。
            </p>
          ) : null}
        </div>
        <Button
          className="border-red-700 bg-red-600 text-white hover:bg-red-700 hover:text-white"
          onClick={() => setOpen(true)}
          type="button"
        >
          删除账户
        </Button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 px-4">
          <div className="w-full max-w-lg rounded-lg border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <span className="mt-1 rounded-full bg-destructive/10 p-2 text-destructive">
                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-xl font-semibold">确认删除账户？</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  删除账户会永久删除你的账户及相关数据，此操作不可撤销。
                </p>
              </div>
            </div>

            <label className="mt-5 flex items-start gap-3 rounded-md border bg-background p-3 text-sm">
              <input
                checked={confirmed}
                className="mt-1"
                onChange={(event) => setConfirmed(event.target.checked)}
                type="checkbox"
              />
              <span>我已了解此操作不可撤销，并希望继续。</span>
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button onClick={closeDialog} type="button" variant="outline">
                取消
              </Button>
              <Button
                className="border-red-700 bg-red-600 text-white hover:bg-red-700 hover:text-white"
                disabled={!confirmed}
                onClick={handleRequestDelete}
                type="button"
              >
                我已确认，联系管理员
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
