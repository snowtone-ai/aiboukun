import { Building2 } from "lucide-react";
import { CompetitorAgent } from "@/lib/agents/competitor-agent";
import { auth } from "@/lib/auth";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompetitorCompareTable } from "@/components/competitors/CompetitorCompareTable";
import { CompetitorInsightCard } from "@/components/competitors/CompetitorInsightCard";

export default async function CompetitorsPage() {
  const session = await auth();
  const result = session?.organizationId
    ? await new CompetitorAgent().compare({ organizationId: session.organizationId })
    : { summary: "ログイン後に表示します。", wins: [], losses: [], recommendedTasks: [], competitors: [] };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">競合</h1>
        <p className="text-sm text-muted-foreground">近隣店舗との違いを、勝てる点と注意点に分けて確認します。</p>
      </div>
      <CompetitorInsightCard summary={result.summary} wins={result.wins} losses={result.losses} tasks={result.recommendedTasks} />
      {result.competitors.length ? (
        <CompetitorCompareTable competitors={result.competitors} />
      ) : (
        <EmptyState icon={Building2} title="競合が未登録です" description="店舗ごとに競合を登録すると、評価や口コミ数を比較できます。" />
      )}
    </div>
  );
}
