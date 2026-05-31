"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type HomeSummary = {
  storeCount: number;
  lowRatingCount: number;
  unrepliedCount: number;
  openTaskCount: number;
};

const initialSummary: HomeSummary = {
  storeCount: 0,
  lowRatingCount: 0,
  unrepliedCount: 0,
  openTaskCount: 0,
};

export function HomeMetrics() {
  const [summary, setSummary] = useState<HomeSummary>(initialSummary);

  useEffect(() => {
    let cancelled = false;

    fetch("/api/home/summary")
      .then((response) => response.json())
      .then((payload) => {
        if (!cancelled && payload.ok) {
          setSummary(payload.data);
        }
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="未返信" value={summary.unrepliedCount} description="返信待ちの口コミ" />
      <MetricCard label="低評価" value={summary.lowRatingCount} description="直近30日の星1-3" />
      <MetricCard label="タスク" value={summary.openTaskCount} description="未完了の改善活動" />
      <MetricCard label="店舗" value={summary.storeCount} description="管理対象店舗" />
    </section>
  );
}

function MetricCard({ label, value, description }: { label: string; value: number; description: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-3 text-3xl font-semibold">{value}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
