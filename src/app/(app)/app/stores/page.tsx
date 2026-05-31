import { Store } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { StoreSummaryCard } from "@/components/stores/StoreSummaryCard";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";

export default async function StoresPage() {
  const session = await auth();
  const stores = session?.organizationId
    ? await prisma.store.findMany({
        where: { organizationId: session.organizationId },
        include: {
          _count: { select: { reviews: true, tasks: true, competitors: true } },
        },
        orderBy: { createdAt: "asc" },
      })
    : [];
  const enriched = await Promise.all(
    stores.map(async (store) => {
      const [average, lowRatingCount, unrepliedCount] = await Promise.all([
        prisma.review.aggregate({ where: { storeId: store.id }, _avg: { rating: true } }),
        prisma.review.count({ where: { storeId: store.id, rating: { lte: 3 } } }),
        prisma.review.count({ where: { storeId: store.id, replyStatus: "UNREPLIED" } }),
      ]);
      return { ...store, averageRating: average._avg.rating ?? 0, lowRatingCount, unrepliedCount };
    }),
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">店舗</h1>
        <p className="text-sm text-muted-foreground">全店舗の評価、未返信、低評価を横断して確認します。</p>
      </div>
      {enriched.length ? (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {enriched.map((store) => (
            <StoreSummaryCard key={store.id} store={store} />
          ))}
        </div>
      ) : (
        <EmptyState icon={Store} title="店舗がありません" description="店舗を作成し、Google Business Profileと紐付けると表示されます。" />
      )}
    </div>
  );
}
