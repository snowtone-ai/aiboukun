import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AttributeScore({ average, lowRate }: { average: number; lowRate: number }) {
  const scores = [
    { label: "評価安定", value: Math.min(100, Math.round((average / 5) * 100)) },
    { label: "低評価リスク", value: Math.max(0, 100 - Math.round(lowRate * 100)) },
    { label: "返信優先度", value: Math.round(lowRate * 100) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">AIO 属性スコア</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {scores.map((score) => (
          <div key={score.label} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>{score.label}</span>
              <strong>{score.value}</strong>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-accent" style={{ width: `${score.value}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
