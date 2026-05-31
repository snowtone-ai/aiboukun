"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function GenerateReportButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "WEEKLY" }),
      });
      const payload = (await response.json()) as { ok: boolean; data?: { id: string } };
      if (payload.ok && payload.data) {
        router.push(`/app/reports/${payload.data.id}`);
      }
    });
  }

  return (
    <Button onClick={generate} disabled={isPending}>
      <Plus className="size-4" />
      レポート生成
    </Button>
  );
}
