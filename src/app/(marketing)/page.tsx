import Link from "next/link";
import { AlertTriangle, BarChart3, Bot, MapPinned } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PricingBand } from "@/components/marketing/PricingBand";

const features = [
  { icon: AlertTriangle, title: "低評価をすぐ検知", body: "星1-3や法務・医療・個人情報リスクを見逃さず、対応順を整理します。" },
  { icon: Bot, title: "返信案を作成", body: "店の言い回しを学びながら、承認前提の安全な返信案を作ります。" },
  { icon: BarChart3, title: "レポート自動化", body: "口コミ傾向、未返信、改善タスクを週次・月次でまとめます。" },
  { icon: MapPinned, title: "競合と比較", body: "近隣店舗との差を見える化し、Googleマップ集客の次の一手を出します。" },
];

export default function MarketingPage() {
  return (
    <main>
      <section className="relative min-h-[calc(100svh-4rem)] overflow-hidden bg-[linear-gradient(120deg,#0f766e,#155e75_45%,#fffdf8_45%)]">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 bg-[url('/og-image.svg')] bg-contain bg-center bg-no-repeat md:block" />
        <div className="mx-auto flex min-h-[calc(100svh-4rem)] max-w-6xl items-center px-4 py-14">
          <div className="max-w-xl text-white">
            <h1 className="text-4xl font-semibold leading-tight md:text-6xl">月1万円でAI相棒を雇う</h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-teal-50">
              アイボウくんは、Google口コミ管理、低評価検知、競合比較、レポート作成を担当する小さな店のマーケティング担当AIです。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/signin?callbackUrl=%2Fapp">無料診断を始める</Link>
              </Button>
              <Button asChild size="lg" variant="secondary">
                <Link href="/help">よくある質問</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="py-14">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-semibold">管理ツールではなく、担当者として動く</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            {features.map((feature) => (
              <article key={feature.title} className="rounded-lg border bg-white p-5">
                <feature.icon className="size-5 text-primary" />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <PricingBand />
    </main>
  );
}
