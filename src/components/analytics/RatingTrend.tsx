import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function RatingTrend({ buckets }: { buckets: Array<{ rating: number; count: number }> }) {
  const max = Math.max(...buckets.map((bucket) => bucket.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">星評価の内訳</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {buckets
          .slice()
          .reverse()
          .map((bucket) => (
            <div key={bucket.rating} className="grid grid-cols-[48px_1fr_40px] items-center gap-3 text-sm">
              <span>星{bucket.rating}</span>
              <div className="h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${(bucket.count / max) * 100}%` }} />
              </div>
              <span className="text-right text-muted-foreground">{bucket.count}</span>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
