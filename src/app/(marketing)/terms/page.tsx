export default function TermsPage() {
  const paragraphs = [
    "本規約はアイボウくんの利用条件を定めるドラフトです。正式公開前に専門家レビューを行ってください。",
    "AIが生成する返信案は利用者の確認と承認を前提とし、Google Business Profileへの投稿責任は利用者に帰属します。",
    "法務、医療、個人情報、炎上リスクを含む内容の自動投稿は禁止されます。",
  ];

  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">利用規約</h1>
      <div className="mt-8 space-y-5 text-sm leading-7 text-muted-foreground">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </main>
  );
}
