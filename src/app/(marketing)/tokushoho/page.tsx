const rows = [
  ["販売事業者", "正式公開前に記載"],
  ["所在地", "正式公開前に記載"],
  ["販売価格", "Starter 月額9,800円、Growth 月額19,800円〜"],
  ["支払方法", "正式公開前に記載"],
  ["解約", "管理画面または問い合わせ窓口から申請"],
];

export default function TokushohoPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">特定商取引法に基づく表記</h1>
      <dl className="mt-8 grid gap-4 text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="grid gap-1 border-b pb-3 md:grid-cols-[160px_1fr]">
            <dt className="font-medium">{label}</dt>
            <dd className="text-muted-foreground">{value}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
