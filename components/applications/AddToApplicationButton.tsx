"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { addProgramToApplications } from "@/lib/applications/actions";

export function AddToApplicationButton({
  programId,
  userId,
}: {
  programId: string;
  userId: string | null;
}) {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    if (!userId) {
      router.push("/login");
      return;
    }

    setIsPending(true);
    const result = await addProgramToApplications(programId, userId);
    setIsPending(false);
    setMessage(result.message);

    if (result.applicationId) {
      setApplicationId(result.applicationId);
    }
  }

  return (
    <div className="grid gap-2">
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button disabled={isPending} onClick={handleClick} type="button">
          {isPending ? "添加中..." : "加入申请清单"}
        </Button>
        {applicationId ? (
          <Button asChild variant="outline">
            <Link href={`/applications/${applicationId}`}>查看申请详情</Link>
          </Button>
        ) : null}
      </div>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
    </div>
  );
}
