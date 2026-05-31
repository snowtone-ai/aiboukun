const faqs = [
  ["何ができますか？", "口コミ確認、返信案、低評価検知、競合比較、レポート、改善タスク作成ができます。"],
  ["勝手に返信投稿されますか？", "いいえ。Google投稿前に人の承認が必要です。低評価や高リスク内容は自動投稿しません。"],
  ["Google連携は必要ですか？", "口コミ同期と投稿にはGoogle Business Profileの連携が必要です。"],
  ["複数店舗に対応しますか？", "ブランド、エリア、店舗単位で管理できます。"],
  ["AIの文体は変えられますか？", "編集内容から返信スタイルを学習します。"],
  ["通知はありますか？", "アプリ内通知とメール通知に対応します。"],
  ["無料診断は何を見ますか？", "未返信、低評価、改善タスク、返信案の初回プレビューを表示します。"],
  ["法律や医療の口コミは？", "高リスクとして扱い、自動投稿せず人の確認を促します。"],
  ["データは分離されますか？", "組織IDで全クエリを分離します。"],
  ["問い合わせ先は？", "問い合わせページから送信できます。"],
];

export default function HelpPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold">ヘルプ / FAQ</h1>
      <div className="mt-8 divide-y rounded-lg border bg-white">
        {faqs.map(([question, answer]) => (
          <details key={question} className="group p-5">
            <summary className="cursor-pointer font-medium">{question}</summary>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
