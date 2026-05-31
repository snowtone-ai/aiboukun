import { AlertTriangle, ClipboardList, MessageSquareText, Send, Star } from "lucide-react";
import { ActionCard } from "@/components/aibou/ActionCard";
import { AibouMessageCard } from "@/components/aibou/AibouMessageCard";
import { HomeMetrics } from "@/components/aibou/HomeMetrics";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AppHomePage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <section className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <AibouMessageCard
          message="おはようございます。今日は低評価と未返信を先に片づけると、店舗の印象改善につながります。"
          tone="attention"
          actionLabel="口コミを確認"
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">低評価チェック</Badge>
            <Badge variant="secondary">返信案作成</Badge>
            <Badge variant="secondary">週次レポート</Badge>
          </div>
        </AibouMessageCard>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">今日の優先順位</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
              <span>未返信レビュー</span>
              <strong className="text-primary">確認</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
              <span>低評価レビュー</span>
              <strong className="text-warning">注意</strong>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
              <span>改善タスク</span>
              <strong>実行</strong>
            </div>
          </CardContent>
        </Card>
      </section>

      <HomeMetrics />

      <section className="grid gap-4 md:grid-cols-2">
        <ActionCard
          href="/app/reviews"
          title="口コミを確認"
          description="低評価、未返信、リスクありの口コミから優先して確認します。"
          icon={MessageSquareText}
        />
        <ActionCard
          href="/app/chat"
          title="アイボウくんに依頼"
          description="返信案作成、レポート作成、競合比較を自然文で依頼できます。"
          icon={Send}
        />
        <ActionCard
          href="/app/analytics"
          title="分析を見る"
          description="評価推移、頻出トピック、改善要因をまとめて確認します。"
          icon={Star}
        />
        <ActionCard
          href="/app/tasks"
          title="やることを進める"
          description="AIが提案した改善タスクを担当者と期限で管理します。"
          icon={ClipboardList}
        />
      </section>

      <Card>
        <CardContent className="flex items-start gap-3 p-4">
          <AlertTriangle className="mt-0.5 size-5 text-warning" />
          <div className="text-sm leading-6">
            <p className="font-medium">重要な安全ルール</p>
            <p className="text-muted-foreground">
              星1-3、法務・医療・個人情報・炎上リスクがある返信は、必ず人の承認後に投稿します。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
