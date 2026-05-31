import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CompetitorInsightCard({
  summary,
  wins,
  losses,
  tasks,
}: {
  summary: string;
  wins: string[];
  losses: string[];
  tasks: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AI比較メモ</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm leading-6 md:grid-cols-3">
        <div className="md:col-span-3">{summary}</div>
        <List title="勝てる点" items={wins} />
        <List title="注意点" items={losses} />
        <List title="推奨タスク" items={tasks} />
      </CardContent>
    </Card>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        {(items.length ? items : ["まだ材料がありません"]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
