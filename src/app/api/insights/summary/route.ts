import { prisma } from "@/lib/prisma/client";
import { createRouteHandler, withOrg, withValidation } from "@/lib/api/middleware";
import { insightQuerySchema } from "@/lib/validators/workflows";

export const GET = createRouteHandler(
  withOrg(
    withValidation(
      insightQuerySchema,
      async (_request, context) => {
        const days = context.input.period === "180d" ? 180 : context.input.period === "90d" ? 90 : 30;
        const periodEnd = new Date();
        const periodStart = new Date(periodEnd.getTime() - days * 24 * 60 * 60 * 1_000);
        const baseWhere = {
          store: { organizationId: context.organizationId },
          ...(context.input.storeId ? { storeId: context.input.storeId } : {}),
          postedAt: { gte: periodStart, lte: periodEnd },
        };

        const [reviews, latestInsight] = await Promise.all([
          prisma.review.findMany({
            where: baseWhere,
            select: { rating: true, replyStatus: true, riskLevel: true, topics: true, postedAt: true },
            orderBy: { postedAt: "asc" },
          }),
          prisma.insight.findFirst({
            where: {
              organizationId: context.organizationId,
              ...(context.input.storeId ? { storeId: context.input.storeId } : {}),
            },
            orderBy: { createdAt: "desc" },
          }),
        ]);

        const total = reviews.length;
        const average = total ? reviews.reduce((sum, review) => sum + review.rating, 0) / total : 0;
        const lowRatingCount = reviews.filter((review) => review.rating <= 3).length;
        const unrepliedCount = reviews.filter((review) => review.replyStatus === "UNREPLIED").length;
        const riskCount = reviews.filter((review) => review.riskLevel !== "NORMAL").length;
        const ratingBuckets = [1, 2, 3, 4, 5].map((rating) => ({
          rating,
          count: reviews.filter((review) => review.rating === rating).length,
        }));
        const topicCounts = new Map<string, number>();
        for (const review of reviews) {
          for (const topic of review.topics) {
            topicCounts.set(topic, (topicCounts.get(topic) ?? 0) + 1);
          }
        }
        const topics = [...topicCounts.entries()]
          .map(([label, count]) => ({ label, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 8);

        return {
          periodStart,
          periodEnd,
          summary:
            latestInsight?.summary ??
            (total ? `対象期間の口コミは${total}件、平均評価は${average.toFixed(1)}です。` : "対象期間の口コミはまだありません。"),
          metrics: { total, average, lowRatingCount, unrepliedCount, riskCount },
          ratingBuckets,
          topics,
          trend: buildTrend(reviews),
        };
      },
      "query",
    ),
  ),
);

function buildTrend(reviews: Array<{ postedAt: Date; rating: number }>) {
  const buckets = new Map<string, { count: number; total: number }>();
  for (const review of reviews) {
    const key = review.postedAt.toISOString().slice(0, 10);
    const bucket = buckets.get(key) ?? { count: 0, total: 0 };
    bucket.count += 1;
    bucket.total += review.rating;
    buckets.set(key, bucket);
  }

  return [...buckets.entries()].map(([date, bucket]) => ({
    date,
    average: bucket.total / bucket.count,
    count: bucket.count,
  }));
}
