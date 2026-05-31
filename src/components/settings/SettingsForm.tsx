"use client";

import { useState, useTransition } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export function SettingsForm({ organizationName, role }: { organizationName: string; role: string }) {
  const [name, setName] = useState(organizationName);
  const [tone, setTone] = useState("warm");
  const [isPending, startTransition] = useTransition();
  const canEditOrganization = role === "OWNER" || role === "ADMIN";

  function save() {
    startTransition(async () => {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName: name, replyTone: tone, notificationTypes: ["LOW_RATING", "REPORT_READY"] }),
      });
    });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">組織</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium">組織名</span>
            <Input value={name} disabled={!canEditOrganization} onChange={(event) => setName(event.target.value)} />
          </label>
          {!canEditOrganization ? <p className="text-xs text-muted-foreground">組織設定の保存はADMIN以上に制限されています。</p> : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">AI返信</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="space-y-1 text-sm">
            <span className="font-medium">基本トーン</span>
            <select value={tone} onChange={(event) => setTone(event.target.value)} className="h-10 w-full rounded-full border bg-background px-3">
              <option value="warm">温かい</option>
              <option value="polite">丁寧</option>
              <option value="concise">簡潔</option>
            </select>
          </label>
          <p className="text-xs leading-5 text-muted-foreground">星1-3、法務、医療、個人情報リスクのある返信は常に承認が必要です。</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Google連携</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-muted-foreground">口コミ同期と返信投稿にはBusiness Profile権限が必要です。</p>
          <Button asChild variant="secondary">
            <a href="/api/google/connect">Google連携を確認</a>
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">通知</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            低評価アラート
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" defaultChecked />
            レポート完成通知
          </label>
        </CardContent>
      </Card>
      <div className="lg:col-span-2">
        <Button onClick={save} disabled={isPending || !canEditOrganization}>
          <Save className="size-4" />
          保存
        </Button>
      </div>
    </div>
  );
}
