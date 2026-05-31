# アイボウくん

> **Googleマップ集客の営業・マーケティング担当AIエージェント**

月1万円で雇えるAI相棒。管理ツールではなく、口コミ返信・低評価検知・競合比較・改善提案・週次/月次レポートまでを代わりにこなす「担当者型」SaaSです。

---

## プロダクト概要

| 項目 | 内容 |
|---|---|
| ターゲット | 個人店オーナー・店長・多店舗本部 |
| コア機能 | Google口コミ管理、低評価検知、AI返信案生成、競合比較、週次/月次レポート |
| AI | Gemini API（LLM Provider Adapter経由で切替可） |
| 主要連携 | Google Business Profile API + OAuth |
| 価格帯 | 月1万円（想定） |

### 主なユーザーフロー

1. **毎朝の確認（1分）** — アイボウくんの今日の報告 → 重要アラート → 未返信口コミに返信案を承認
2. **口コミ返信** — 通知 → AI返信案確認 → 承認/修正 → Googleに自動投稿
3. **チャット操作** — 「今月のレポート見せて」などテキスト/音声で主要操作が完結
4. **多店舗本部確認** — 全店舗サマリー → 要注意店舗フォーカス → 月次レポート自動生成・エクスポート

---

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) + React 19 |
| UI | Tailwind CSS v4 + shadcn/ui + Radix UI |
| 認証 | Auth.js (NextAuth v5 beta) + Google OAuth |
| DB | PostgreSQL + Prisma 7 |
| AI | Gemini API (`@google/generative-ai`) |
| バリデーション | Zod v4 |
| フォーム | React Hook Form |
| テスト | Vitest |
| パッケージ管理 | pnpm |

---

## 主要機能

- **AIエージェント群**: ReviewReplyAgent / RiskDetectionAgent / InsightAgent / ReportAgent / CompetitorAgent / TaskAgent / NavigationAgent / MemoryAgent / AgentOrchestrator
- **Google Business Profile連携**: OAuth接続管理・口コミ同期・返信投稿（Human-in-the-loop必須）
- **RBAC + 監査ログ**: 役割ベースアクセス制御、全操作の監査証跡
- **テナント分離**: 組織IDによる厳密なデータ分離
- **PWA対応**: スマホファーストのオフライン対応
- **音声入力**: Web Speech API によるボイス操作
- **多店舗ダッシュボード**: 企業 > ブランド > エリア > 店舗 の階層管理

---

## セットアップ

### 前提

- Node.js 20+
- pnpm
- PostgreSQL

### 手順

```bash
# 依存インストール
pnpm install

# 環境変数設定
cp .env.example .env.local
# .env.local を編集（DATABASE_URL, NEXTAUTH_SECRET, Google OAuth, Gemini APIキーなど）

# DBセットアップ
npx prisma migrate dev
npx prisma db seed

# 開発サーバー起動
pnpm dev
```

### 主要コマンド

```bash
pnpm dev        # 開発サーバー (http://localhost:3000)
pnpm build      # プロダクションビルド
pnpm test       # ユニットテスト (Vitest)
pnpm lint       # ESLint
pnpm typecheck  # TypeScript型チェック
```

---

## 必要な環境変数

`.env.example` を参照してください。主要な変数：

| 変数 | 説明 |
|---|---|
| `DATABASE_URL` | PostgreSQL接続URL |
| `NEXTAUTH_SECRET` | Auth.js署名シークレット |
| `NEXTAUTH_URL` | アプリのベースURL |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth クライアントシークレット |
| `GEMINI_API_KEY` | Gemini API キー |
| `TOKEN_ENCRYPTION_KEY` | OAuthトークン暗号化キー (32バイト hex) |

---

## ディレクトリ構成

```
src/
├── app/
│   ├── (app)/app/          # 認証済み画面（口コミ・分析・設定など）
│   ├── (marketing)/        # LP・FAQ・お問い合わせ・法的ページ
│   └── api/                # Route Handlers
├── components/
│   ├── aibou/              # ホーム/AI司令室
│   ├── chat/               # チャットUI
│   ├── reviews/            # 口コミ管理
│   ├── analytics/          # 分析ダッシュボード
│   ├── reports/            # レポートビューア
│   └── ui/                 # shadcn/ui コンポーネント
├── lib/
│   ├── agents/             # AIエージェント群
│   ├── google/             # GBP APIアダプター
│   ├── llm/                # LLM Provider Adapter
│   └── auth.ts             # 認証設定
└── types/domain.ts         # 共有ドメイン型
prisma/
└── schema.prisma           # DBスキーマ
```

---

## セキュリティ方針

- **自動投稿禁止**: 星1〜3の低評価口コミ・法務/医療/プライバシーリスクあり返信は絶対に自動投稿しない
- **Human-in-the-loop**: 重要な実行は必ず人の承認を挟む
- **OAuthトークン暗号化**: DBへの保存前にAES暗号化必須
- **テナント分離**: 全DBクエリで `organization_id` フィルタ必須
- **RBAC**: MANAGERロール以上のみGoogle投稿操作が可能

---

## ライセンス

Private — 無断複製・転用禁止
