"use client";

import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApprovalActionBar({ draftId, onApproved }: { draftId: string; onApproved?: () => void }) {
  async function approve() {
    const response = await fetch(`/api/reply-drafts/${draftId}/approve`, { method: "POST" });
    if (response.ok) {
      onApproved?.();
    }
  }

  return (
    <div className="sticky bottom-4 z-20 flex gap-2 rounded-2xl border bg-card p-2 shadow-lg">
      <Button className="flex-1" onClick={approve}>
        <Check className="size-4" />
        承認
      </Button>
      <Button className="flex-1" variant="outline" disabled title="Google連携実装後に有効化">
        <Send className="size-4" />
        投稿
      </Button>
    </div>
  );
}
