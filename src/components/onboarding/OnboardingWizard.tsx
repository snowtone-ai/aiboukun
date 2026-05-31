"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  "ようこそ",
  "GBP連携",
  "店舗選択",
  "業種選択",
  "トーン選択",
  "自動返信ルール",
  "初回スキャン",
  "初回診断",
];

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;

  return (
    <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 md:grid-cols-[260px_1fr]">
      <aside className="space-y-2">
        {steps.map((label, index) => (
          <div key={label} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
            <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
              {index < step ? <Check className="size-4" /> : index + 1}
            </span>
            <span className={index === step ? "font-semibold" : "text-muted-foreground"}>{label}</span>
          </div>
        ))}
      </aside>
      <section className="rounded-lg border bg-white p-6">
        <p className="text-sm font-medium text-primary">Step {step + 1}</p>
        <h1 className="mt-2 text-2xl font-semibold">{steps[step]}</h1>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{copyForStep(step)}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          {isLast ? (
            <Button asChild>
              <Link href="/app/onboarding/diagnosis">
                初回診断を見る
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : (
            <Button onClick={() => setStep((current) => current + 1)}>
              次へ
              <ChevronRight className="size-4" />
            </Button>
          )}
          {step === 1 ? (
            <Button asChild variant="secondary">
              <Link href="/api/google/connect">Google連携へ</Link>
            </Button>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function copyForStep(step: number) {
  const messages = [
    "アイボウくんが口コミ、返信、競合、レポートを担当できるよう初期設定します。",
    "Google Business Profileの読み取り・返信権限を接続します。",
    "分析対象にする店舗を選びます。未登録の場合は設定画面で追加できます。",
    "業種を選ぶと返信ルールと評価項目が調整されます。",
    "温かい、丁寧、簡潔など、店の基本トーンを設定します。",
    "低評価や高リスク口コミは自動投稿しない安全ルールを確認します。",
    "連携済み店舗の口コミを同期し、未返信と低評価を抽出します。",
    "最初の診断レポートで、今日やるべきことを確認します。",
  ];
  return messages[step] ?? messages[0];
}
