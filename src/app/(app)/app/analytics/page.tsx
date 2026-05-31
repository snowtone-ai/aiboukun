import { AlertTriangle, MessageSquareText, Star, TrendingUp } from "lucide-react";
import { KpiCard } from "@/components/analytics/KpiCard";
import { AttributeScore } from "@/components/analytics/AttributeScore";
import { RatingTrend } from "@/components/analytics/RatingTrend";
import { TopicsRanking } from "@/components/analytics/TopicsRanking";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { formatNumber } from "@/lib/formatters";
import { prisma } from "@/lib/prisma/client";

export default async function AnalyticsPage() {
  const session = await auth();
  const from = getDaysAgo(30);
  const reviews = session?.organizationId
    ? await prisma.review.findMany({
        where: { store: { organizationId: session.organizationId }, postedAt: { gte: from } },
        select: { rating: true, replyStatus: true, riskLevel: true, topics: true },
      })
    : [];
  const total = reviews.length;
  const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
  const low = reviews.filter((review) => review.rating <= 3).length;
  const unreplied = reviews.filter((review) => review.replyStatus === "UNREPLIED").length;
  const risk = reviews.filter((review) => review.riskLevel !== "NORMAL").length;
  const topics = countTopics(reviews.flatMap((review) => review.topics));
  const buckets = [1, 2, 3, 4, 5].map((rating) => ({ rating, count: reviews.filter((review) => review.rating === rating).length }));

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">分析</h1>
        <p className="text-sm text-muted-foreground">直近30日の口コミから、改善ポイントを読み解きます。</p>
      </div>
      <Card>
        <CardContent className="p-4 text-sm leading-6">
          {total
            ? `今月は口コミ${total}件、平均評価${average.toFixed(1)}です。低評価${low}件と未返信${unreplied}件を先に処理してください。`
            : "直近30日の口コミはまだありません。Google同期後にAI要約を表示します。"}
        </CardContent>
      </Card>
      <div className="grid gap-3 md:grid-cols-4">
        <KpiCard title="口コミ数" value={`${total}件`} note="直近30日" icon={MessageSquareText} />
        <KpiCard title="平均評価" value={formatNumber(average, 1)} note="星5点満点" icon={Star} />
        <KpiCard title="低評価" value={`${low}件`} note="星3以下" icon={AlertTriangle} />
        <KpiCard title="リスク" value={`${risk}件`} note="要確認" icon={TrendingUp} />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <RatingTrend buckets={buckets} />
        <TopicsRanking topics={topics} />
        <AttributeScore average={average} lowRate={total ? low / total : 0} />
      </div>
    </div>
  );
}

function getDaysAgo(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1_000);
}

function countTopics(values: string[]) {
  const map = new Map<string, number>();
  for (const value of values) {
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return [...map.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}
