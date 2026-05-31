import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReplyDraftEditor } from "@/components/reviews/ReplyDraftEditor";
import { RiskBadge } from "@/components/reviews/RiskBadge";
import { StarRating } from "@/components/reviews/StarRating";
import { auth } from "@/lib/auth";
import { formatDateTime, replyStatusLabel } from "@/lib/formatters";
import { prisma } from "@/lib/prisma/client";

type ReviewDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ReviewDetailPage({ params }: ReviewDetailPageProps) {
  const [{ id }, session] = await Promise.all([params, auth()]);
  const review = session?.organizationId
    ? await prisma.review.findFirst({
        where: { id, store: { organizationId: session.organizationId } },
        include: {
          store: true,
          drafts: { orderBy: { createdAt: "desc" }, take: 1 },
          riskFlags: { orderBy: { createdAt: "desc" }, take: 3 },
        },
      })
    : null;

  if (!review) {
    notFound();
  }

  const draft = review.drafts[0];

  return (
    <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_420px]">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{review.authorName ?? "匿名ユーザー"}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {review.store.name}・{formatDateTime(review.postedAt)}
              </p>
            </div>
            <StarRating rating={review.rating} />
          </div>
          <div className="flex flex-wrap gap-2">
            <RiskBadge level={review.riskLevel} />
            <Badge variant="outline">{replyStatusLabel[review.replyStatus]}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="whitespace-pre-wrap text-sm leading-7">{review.text ?? "本文なし"}</p>
          <div className="flex flex-wrap gap-2">
            {review.topics.map((topic) => (
              <Badge key={topic} variant="secondary">
                {topic}
              </Badge>
            ))}
          </div>
          {review.riskFlags.length ? (
            <div className="rounded-2xl bg-danger/5 p-4 text-sm leading-6">
              <p className="font-medium text-danger">リスクメモ</p>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                {review.riskFlags.flatMap((flag) => flag.reasons).map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">返信エディタ</CardTitle>
        </CardHeader>
        <CardContent>
          <ReplyDraftEditor reviewId={review.id} initialDraft={draft} />
        </CardContent>
      </Card>
    </div>
  );
}
