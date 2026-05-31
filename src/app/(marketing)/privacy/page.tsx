export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">プライバシーポリシー</h1>
      <div className="mt-8 space-y-5 text-sm leading-7 text-muted-foreground">
        <p>Google連携データ、口コミ、返信案、分析結果はサービス提供、品質改善、セキュリティ確保のために利用します。</p>
        <p>OAuthトークンは暗号化して保存し、組織ごとのテナント境界を越えて利用しません。</p>
        <p>AI処理に送信する情報は目的に必要な範囲へ最小化します。正式公開前に専門家レビューを行ってください。</p>
      </div>
    </main>
  );
}
