import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters";

type CompetitorRow = {
  id: string;
  name: string;
  store: { name: string };
  snapshots: Array<{
    rating: number | null;
    reviewCount: number | null;
    strengths: string[];
    weaknesses: string[];
    capturedAt: Date;
  }>;
};

export function CompetitorCompareTable({ competitors }: { competitors: CompetitorRow[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">競合比較</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="text-left text-muted-foreground">
            <tr className="border-b">
              <th className="py-2">競合</th>
              <th>対象店舗</th>
              <th>評価</th>
              <th>口コミ数</th>
              <th>強み/弱み</th>
              <th>記録日</th>
            </tr>
          </thead>
          <tbody>
            {competitors.map((competitor) => {
              const latest = competitor.snapshots[0];
              return (
                <tr key={competitor.id} className="border-b last:border-0">
                  <td className="py-3 font-medium">{competitor.name}</td>
                  <td>{competitor.store.name}</td>
                  <td>{latest?.rating?.toFixed(1) ?? "-"}</td>
                  <td>{latest?.reviewCount ?? "-"}</td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {latest?.strengths.slice(0, 2).map((item) => (
                        <Badge key={item} className="bg-success text-white">
                          {item}
                        </Badge>
                      ))}
                      {latest?.weaknesses.slice(0, 2).map((item) => (
                        <Badge key={item} variant="secondary" className="bg-danger/10 text-danger">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td>{formatDate(latest?.capturedAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
