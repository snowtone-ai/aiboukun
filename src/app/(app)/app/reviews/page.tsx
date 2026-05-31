import { MessageSquareText } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReviewCard } from "@/components/reviews/ReviewCard";
import { ReviewFilterBar } from "@/components/reviews/ReviewFilterBar";

type ReviewsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReviewsPage({ searchParams }: ReviewsPageProps) {
  const session = await auth();
  const params = (await searchParams) ?? {};
  const q = valueOf(params.q);
  const ratings = valueOf(params.ratings);
  const replyStatus = valueOf(params.replyStatus);
  const ratingList = ratings
    ?.split(",")
    .map((item) => Number(item))
    .filter((item) => Number.isInteger(item) && item >= 1 && item <= 5);
  const reviews = session?.organizationId
    ? await prisma.review.findMany({
        where: {
          store: { organizationId: session.organizationId },
          ...(ratingList?.length ? { rating: { in: ratingList } } : {}),
          ...(replyStatus ? { replyStatus: replyStatus as never } : {}),
          ...(q
            ? {
                OR: [
                  { text: { contains: q, mode: "insensitive" } },
                  { authorName: { contains: q, mode: "insensitive" } },
                ],
              }
            : {}),
        },
        include: { store: { select: { name: true } } },
        orderBy: { postedAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">口コミ</h1>
        <p className="text-sm text-muted-foreground">低評価、未返信、リスクありの順に確認します。</p>
      </div>
      <ReviewFilterBar q={q} rating={ratings} replyStatus={replyStatus} />
      {reviews.length ? (
        <div className="grid gap-3 md:grid-cols-2">
          {reviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <EmptyState icon={MessageSquareText} title="口コミがありません" description="Google同期後、ここに口コミが表示されます。" />
      )}
    </div>
  );
}

function valueOf(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
