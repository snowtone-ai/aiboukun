import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, replyStatusLabel } from "@/lib/formatters";
import { RiskBadge } from "./RiskBadge";
import { StarRating } from "./StarRating";

type ReviewCardProps = {
  review: {
    id: string;
    rating: number;
    authorName: string | null;
    text: string | null;
    postedAt: Date;
    replyStatus: string;
    riskLevel: string;
    store: { name: string };
  };
};

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <Link href={`/app/reviews/${review.id}`}>
      <Card className="transition hover:border-primary/40 hover:shadow-sm">
        <CardContent className="space-y-3 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium">{review.authorName ?? "匿名ユーザー"}</p>
              <p className="text-xs text-muted-foreground">
                {review.store.name}・{formatDate(review.postedAt)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={review.rating} compact />
              <RiskBadge level={review.riskLevel} />
            </div>
          </div>
          <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">{review.text ?? "本文なし"}</p>
          <Badge variant="outline" className="rounded-full">
            {replyStatusLabel[review.replyStatus] ?? review.replyStatus}
          </Badge>
        </CardContent>
      </Card>
    </Link>
  );
}
