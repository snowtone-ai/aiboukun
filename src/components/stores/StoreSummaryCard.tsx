import Link from "next/link";
import { AlertTriangle, MessageSquareText, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/formatters";

type StoreSummaryCardProps = {
  store: {
    id: string;
    name: string;
    status: string;
    averageRating: number;
    lowRatingCount: number;
    unrepliedCount: number;
    _count: { reviews: number; tasks: number; competitors: number };
  };
};

export function StoreSummaryCard({ store }: StoreSummaryCardProps) {
  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link href={`/app/reviews?storeId=${store.id}`} className="font-medium hover:text-primary">
              {store.name}
            </Link>
            <p className="text-xs text-muted-foreground">{store.status}</p>
          </div>
          {store.lowRatingCount > 0 ? <Badge className="bg-warning text-white">要注意</Badge> : <Badge variant="secondary">安定</Badge>}
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Metric icon={Star} label="評価" value={formatNumber(store.averageRating, 1)} />
          <Metric icon={MessageSquareText} label="口コミ" value={`${store._count.reviews}`} />
          <Metric icon={AlertTriangle} label="低評価" value={`${store.lowRatingCount}`} />
        </div>
        <p className="text-xs text-muted-foreground">未返信 {store.unrepliedCount}件 / タスク {store._count.tasks}件</p>
      </CardContent>
    </Card>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof Star; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted p-2">
      <Icon className="mb-1 size-4 text-primary" />
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
