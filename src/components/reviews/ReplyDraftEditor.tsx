"use client";

import { useState, useTransition } from "react";
import { RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApprovalActionBar } from "./ApprovalActionBar";

type Draft = {
  id: string;
  aiInitialText: string;
  ownerFinalText: string | null;
  status: string;
  requiresApproval: boolean;
};

export function ReplyDraftEditor({ reviewId, initialDraft }: { reviewId: string; initialDraft?: Draft }) {
  const [draft, setDraft] = useState<Draft | undefined>(initialDraft);
  const [text, setText] = useState(initialDraft?.ownerFinalText ?? initialDraft?.aiInitialText ?? "");
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      const response = await fetch(`/api/reviews/${reviewId}/draft`, { method: "POST" });
      const payload = (await response.json()) as { ok: boolean; data?: Draft };
      if (payload.ok && payload.data) {
        setDraft(payload.data);
        setText(payload.data.aiInitialText);
      }
    });
  }

  function save() {
    if (!draft) {
      return;
    }
    startTransition(async () => {
      const response = await fetch(`/api/reply-drafts/${draft.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const payload = (await response.json()) as { ok: boolean; data?: Draft };
      if (payload.ok && payload.data) {
        setDraft(payload.data);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Button onClick={generate} disabled={isPending} variant={draft ? "outline" : "default"}>
          <RefreshCw className="size-4" />
          {draft ? "再生成" : "返信案を作る"}
        </Button>
        <Button onClick={save} disabled={!draft || isPending} variant="outline">
          <Save className="size-4" />
          保存
        </Button>
      </div>
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder="AI返信案がここに表示されます"
        className="min-h-44 leading-7"
      />
      {draft?.requiresApproval ? <p className="text-sm text-danger">この返信は投稿前に人の承認が必要です。</p> : null}
      {draft ? <ApprovalActionBar draftId={draft.id} onApproved={() => setDraft({ ...draft, status: "APPROVED" })} /> : null}
    </div>
  );
}
