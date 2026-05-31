import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";

export function TopicsRanking({ topics }: { topics: Array<{ label: string; count: number }> }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">頻出トピック</CardTitle>
      </CardHeader>
      <CardContent>
        {topics.length ? (
          <div className="space-y-2">
            {topics.map((topic, index) => (
              <div key={topic.label} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm">
                <span>
                  {index + 1}. {topic.label}
                </span>
                <strong>{topic.count}</strong>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="トピックはまだありません" description="口コミ同期後に頻出語を表示します。" />
        )}
      </CardContent>
    </Card>
  );
}
