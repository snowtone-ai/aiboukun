import Link from "next/link";
import { AlertTriangle, CheckCircle2, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DiagnosisReport({
  unrepliedCount,
  lowRatingCount,
  averageRating,
}: {
  unrepliedCount: number;
  lowRatingCount: number;
  averageRating: number;
}) {
  const tasks = [
    "星1-3の口コミから先に内容確認する",
    "未返信口コミへ返信案を作成する",
    "今月の改善テーマを1つ決める",
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-3xl font-semibold">初回診断</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Metric icon={MessageSquareText} label="未返信" value={`${unrepliedCount}件`} />
        <Metric icon={AlertTriangle} label="低評価" value={`${lowRatingCount}件`} />
        <Metric icon={CheckCircle2} label="平均評価" value={averageRating.toFixed(1)} />
      </div>
      <section className="mt-8 rounded-lg border bg-white p-6">
        <h2 className="font-semibold">今日やるべきこと</h2>
        <ul className="mt-4 grid gap-3 text-sm">
          {tasks.map((task) => (
            <li key={task} className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              {task}
            </li>
          ))}
        </ul>
        <Button className="mt-6" asChild>
          <Link href="/app">使い始める</Link>
        </Button>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof MessageSquareText; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-5">
      <Icon className="size-5 text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </div>
  );
}
