# Codex 実行プロンプト — アイボウくん

> このファイルは Codex CLI がタスクを実行する際のシステムプロンプトです。
> 各タスクの詳細は `tasks.md` を参照してください。

---

## 1. プロジェクト概要

**プロダクト名**: アイボウくん
**一言定義**: Googleマップ集客の営業・マーケティング担当AIエージェント
**コンセプト**: 「管理ツール」ではなく「月1万円で雇えるAI相棒」

### これは何か
店舗オーナーの代わりにGoogleマップ集客を見張り、口コミ返信・低評価検知・競合比較・改善提案・レポート作成を行うAIエージェントSaaS。

### これは何ではないか
POS、予約台帳、LINE配信、CRM、広告運用、在庫/勤怠/決済/会計ツールではない。

---

## 2. 技術スタック

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Icons | Lucide React |
| Charts | Recharts |
| ORM | Prisma |
| DB | PostgreSQL (Docker local / Supabase prod) |
| Auth | Auth.js (NextAuth v5) + Google OAuth |
| AI (dev) | Gemini API (@google/generative-ai) |
| AI (prod) | LLM Provider Adapter (切替可能) |
| Validation | Zod |
| Testing | Vitest + Playwright |
| Package Manager | pnpm |
| Hosting | Vercel |

### 重要な技術的注意
- Next.js 16 では `next lint` コマンドは廃止。ESLint は `eslint src` で直接実行
- Tailwind v4 は `@import "tailwindcss"` 構文。`@tailwind` ディレクティブは使わない
- Tailwind v4 の PostCSS プラグインは `@tailwindcss/postcss`
- ESLint flat config (`eslint.config.mjs`) を使用

---

## 3. ディレクトリ構成

```
src/
  app/
    (marketing)/          # LP・法的ページ（認証不要）
      page.tsx            # LP
      terms/page.tsx
      privacy/page.tsx
      tokushoho/page.tsx
      help/page.tsx
      contact/page.tsx
    (app)/                # 認証済みアプリ画面
      page.tsx            # ホーム / AI司令室
      reviews/
        page.tsx          # 口コミ一覧
        [id]/page.tsx     # 口コミ詳細 + 返信エディタ
      analytics/page.tsx  # 分析ダッシュボード
      competitors/page.tsx
      reports/
        page.tsx          # レポート一覧
        [id]/page.tsx     # レポート詳細
      tasks/page.tsx
      stores/page.tsx
      settings/           # 設定（タブ構成）
      onboarding/         # オンボーディングウィザード
    api/
      auth/[...nextauth]/route.ts
      chat/route.ts
      reviews/route.ts
      reviews/[id]/route.ts
      reviews/[id]/draft/route.ts
      reply-drafts/[id]/route.ts
      reply-drafts/[id]/approve/route.ts
      reply-drafts/[id]/post/route.ts
      reports/route.ts
      reports/generate/route.ts
      google/connect/route.ts
      google/callback/route.ts
      google/accounts/route.ts
      google/locations/route.ts
      google/connect-location/route.ts
      google/sync/route.ts
      agents/route.ts
      notifications/route.ts
      competitors/route.ts
      tasks/route.ts
      stores/route.ts
      organizations/route.ts
      me/route.ts
      home/summary/route.ts
      insights/summary/route.ts
      audit-logs/route.ts
      contact/route.ts
  components/
    ui/                   # shadcn/ui ベース
    layout/               # Sidebar, Header, MobileNav, StoreSwitcher, NotificationBell
    aibou/                # AibouAvatar, AibouMessageCard
    chat/                 # ChatContainer, MessageList, MessageBubble, CommandInput, VoiceInputButton, ActionCard
    reviews/              # ReviewCard, ReviewFilterBar, RiskBadge, StarRating, ReplyDraftEditor, ApprovalActionBar
    analytics/            # KpiCard, SentimentChart, TopicsRanking, RatingTrend, AttributeScore
    competitors/          # CompetitorCompareTable, CompetitorInsightCard
    reports/              # ReportMarkdownViewer
    tasks/                # TaskCard
    stores/               # StoreCard, StoreList
    settings/             # 各設定タブ
    notifications/        # NotificationList
    onboarding/           # ウィザードステップ
    marketing/            # LP セクション
  lib/
    prisma/client.ts      # Prisma シングルトン
    auth.ts               # Auth.js 設定
    auth/rbac.ts          # RBAC
    utils.ts              # cn() ヘルパー
    api/                  # response, errors, middleware
    crypto/               # token-encryption
    google/               # gbp-client, types, review-sync, rate-limiter, call-logger
    llm/                  # provider, gemini-provider, llm-router, usage-logger
    prompts/              # risk-detection, review-reply, report, intent-parser, insight
    agents/               # orchestrator, risk-detection-agent, review-reply-agent, memory-agent, navigation-agent, insight-agent, competitor-agent, report-agent, task-agent
    notifications/        # service, email-service, templates/
    audit/logger.ts
    security/             # rate-limit, headers
    validators/           # review, chat, common
  hooks/
    useVoiceInput.ts
  types/
    domain.ts
prisma/
  schema.prisma
  seed.ts
  migrations/
context/                  # 設計資料（実装参照用、デプロイ対象外）
docs/                     # pm-zero 管理ドキュメント
public/
  manifest.json
  icons/
  og-image.png
```

---

## 4. コーディング規約

### 基本原則
- **シンプルさが最重要**。無駄に複雑にしない
- **小さな変更前提**のコード。将来の修正が容易な構造
- **長期安定運用**が目標。堅牢なエラーハンドリング
- 1 ファイル 300 行以下、1 関数 50 行以下を目標
- プレースホルダーコードや TODO は書かない。全関数が動作する状態で完成させる

### TypeScript
- `strict: true` を維持
- `any` は使用禁止。unknown + type guard を使う
- Path alias `@/*` → `./src/*` を使用
- 型は `src/types/domain.ts` に集約、Prisma 生成型は re-export

### React / Next.js
- Server Components をデフォルトで使用。`'use client'` は必要な箇所のみ
- App Router の規約に従う（page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx）
- データ取得は Server Component で直接 Prisma を呼ぶ。API Route は外部クライアント・mutation 用
- フォームは `react-hook-form` + `zod` resolver

### API Routes
- 全 API は統一レスポンス: `{ ok: true, data }` / `{ ok: false, error: { code, message } }`
- 全 mutation API に `withAuth` + `withOrg`（テナント分離）+ `withValidation`
- エラーは `AppError` を throw → ミドルウェアがキャッチして統一フォーマット返却

### Prisma
- 全クエリに `organizationId` フィルタ必須（テナント分離）
- `src/lib/prisma/client.ts` のシングルトンを使用
- マイグレーションは `prisma migrate dev` で生成。SQL 手動編集禁止

### セキュリティ（絶対遵守）
- **星1〜3の口コミへの返信は自動投稿禁止**。必ず `requiresApproval: true`
- **医療/法務/炎上/個人情報リスクの口コミ返信は自動投稿禁止**
- **Google Business Profile への投稿前に必ず人間の承認**
- **OAuth トークンは AES-256-GCM で暗号化保存**
- **テナント間のデータ漏洩は絶対に防ぐ**（organizationId フィルタ必須）
- `.env`, `.env.local` は読まない、コミットしない

### テスト
- Agent テスト: LLM をモックし、入出力の型と条件分岐をテスト
- Validator テスト: 正常/異常ケースを網羅
- API テスト: 認証あり/なし、権限あり/なし、正常/異常
- E2E: 主要ユーザーフロー

---

## 5. デザインシステム

### コンセプト
アイボウくんは管理ツールではなく「AI相棒」。UIの判断基準は「管理ツールに見えるか？」ではなく「本当に相棒に見えるか？」。

### デザインキーワード
Friendly / Trustworthy / Warm / Helpful / Calm / Human-like / Soft

### 禁止
AI感が強すぎる / SF感 / サイバー感 / 無機質 / 金融サービス感 / 監視ツール感 / 真っ青/紫/黒背景 / グラデーション乱用 / 過剰アニメーション

### UIトーン比重
親しみやすさ 40% / 信頼感 40% / かわいさ 20%

### カラーパレット

| Token | Hex | 用途 |
|-------|-----|------|
| `--primary` | `#0F766E` | ヘッダー、ナビ、タイトル、ロゴ |
| `--accent` | `#14B8A6` | CTA、強調、アバター、選択状態 |
| `--accent-light` | `#99F6E4` | Hover、選択背景、バッジ |
| `--background` | `#FFFDF8` | 全体背景（温かいオフホワイト）|
| `--card` | `#FFFFFF` | カード、モーダル、チャット |
| `--foreground` | `#1E293B` | 本文、見出し |
| `--muted-foreground` | `#64748B` | 補足説明、ラベル |
| `--success` | `#22C55E` | 成功、良い状態 |
| `--warning` | `#F59E0B` | 注意、要確認 |
| `--danger` | `#EF4444` | 緊急、リスク、エラー |

### コンポーネントスタイル

| Component | Style |
|-----------|-------|
| ボタン | `border-radius: 999px` (完全角丸) |
| カード | `border-radius: 20px`, `box-shadow: 0 4px 12px rgba(15,23,42,0.05)` |
| 入力欄 | `border-radius: 16px` |
| フォント | `Noto Sans JP` + system-ui fallback |

### アイボウくんアバター状態別カラー

| State | Background | 表情 |
|-------|-----------|------|
| 通常 | `#14B8A6` | にこやか |
| 良好 | `#22C55E` | うれしそう |
| 注意 | `#F59E0B` | 少し真剣 |
| 危険 | `#EF4444` | 焦らず警告 |
| 思考中 | `#99F6E4` | 考えている |

### UI モデル参照マップ

各画面を実装する際は、以下の既存プロダクトの UI パターンを参考にし、アイボウくんのデザインシステムに適用する。**完全模倣は禁止**。エッセンスを取り入れてアイボウくんのコンセプト（温かい・親しみやすい・信頼できる）に変換する。

| 画面 | Primary Model | 取り入れるパターン | アイボウくん適用 |
|------|--------------|-------------------|----------------|
| アプリシェル / ナビ | **Linear** | アイコン+ラベルのサイドバー、セクション区切り、軽快な遷移 | ティールアクセント、#FFFDF8 背景、丸みを帯びたホバー |
| ホーム / チャット | **ChatGPT** | メッセージバブル、下部固定入力、ストリーミング | アイボウくんアバター、温かい挨拶、アクションカード |
| 口コミカード / リスト | **Intercom** | 会話カード形式、ステータスバッジ、クイックアクション | RiskBadge 色分け、温かいカードデザイン |
| フィルター / ソート | **Linear** | フィルターバー、ドロップダウン、チップ | アクセントカラーの選択状態 |
| 分析 / KPI | **Stripe Dashboard** | 上部 KPI、スパークライン、期間セレクター | 数字より先に AI 結論テキスト |
| レポート閲覧 | **Notion** | Markdown レンダリング、余白のある読みやすいレイアウト | 温かい見出しスタイル |
| タスク管理 | **Linear** | ステータス列、優先度バッジ、期限表示 | 温かい配色、大きめタップ領域 |
| 設定 | **Notion** | セクション分割、トグル、インライン保存 | 分かりやすい日本語ラベル |
| 通知 | **Slack** | タイムライン、グループ化、クイックアクション | 未読バッジ、遷移リンク |
| オンボーディング | **Stripe** | ステップバイステップ、プログレスバー | アイボウくんが案内役 |
| 店舗切替 | **Stripe** | ヘッダードロップダウン | ブランド>エリア>店舗ツリー |
| LP | **Intercom** | ヒーロー+課題+解決+CTA | 温かい配色、管理ツール感なし |
| コマンドパレット | **Raycast** | Cmd+K、ファジー検索、クイックアクション | 将来実装 |

---

## 6. AIエージェント設計

### アイボウくんの人格
```
名前: アイボウくん
役割: Googleマップ集客の営業・マーケ担当
口調: 丁寧だが堅すぎない。短く実務的。結論を先に言う。
行動: 重要な変化だけ伝える / 行動を3つ以内に絞る / リスク時は落ち着いて警告 / 勝手に重要返信を投稿しない
```

### 内部エージェント一覧

| Agent | 責務 | 入力 | 出力 |
|-------|------|------|------|
| NavigationAgent | チャット命令→意図解析 | userMessage | intent, route, filters |
| ReviewReplyAgent | 口コミ返信案生成 | review, store, style | replyDraft |
| RiskDetectionAgent | 低評価・炎上・法務検知 | review | riskFlag |
| InsightAgent | 口コミ要因分析 | reviews, metrics | insight |
| CompetitorAgent | 競合比較 | store, competitors | competitorInsight |
| ReportAgent | 週次/月次レポート | metrics, insights | report (markdown) |
| TaskAgent | 改善タスク生成 | risks, insights | tasks |
| MemoryAgent | 修正差分学習 | draft, final | styleMemory |

### Orchestrator パターン
```
User Message → NavigationAgent (intent) → 適切な Agent 呼出 → AgentAction 記録 → Response
System Event → Agent 直接呼出 → AgentAction 記録 → Notification
```

### Human-in-the-loop ルール

**自動実行OK**:
- 星5短文の定型返信（設定でON/OFF）
- 口コミ分類
- レポート下書き
- 通知生成
- 内部タスク生成

**承認必須**:
- 星1〜3への返信
- 医療/法務/炎上/個人情報リスク
- Google Business Profile 公開情報変更
- 外部送信

---

## 7. DB スキーマ参照

Prisma スキーマは `context/aiboukun_ai_agent_requirements.md` Section 7.2 をそのまま使用する。主要テーブル:

Organization, User, OrganizationMember, Brand, Area, Store, GoogleConnection, GoogleBusinessProfile, Review, ReplyDraft, ReplyRevision, ReviewReply, RiskFlag, Competitor, CompetitorSnapshot, Insight, Task, Report, Notification, AgentAction, AIStyleMemory, IndustryTemplate, LLMUsageLog, GoogleApiCallLog

AuditLog テーブルを追加:
```prisma
model AuditLog {
  id             String   @id @default(cuid())
  organizationId String
  actorUserId    String?
  action         String
  targetType     String
  targetId       String
  before         Json?
  after          Json?
  ip             String?
  userAgent      String?
  createdAt      DateTime @default(now())
}
```

---

## 8. タスク実行方法

### Codex への指示形式

タスクを実行する際は以下の形式で指示する:

```
tasks.md の T-XXX を実行してください。

追加コンテキスト:
- [必要に応じてタスク固有の補足情報]

参照ファイル:
- prompt.md（コーディング規約・デザインシステム）
- context/aiboukun_ai_agent_requirements.md（詳細仕様）
- context/aiboukun_product_design.md（プロダクト設計）
- docs/decisions.md（技術的意思決定）
```

### 各タスク完了時の確認

1. Write Scope 内のファイルが全て作成/更新されたか
2. Acceptance 条件を全て満たしているか
3. Verify コマンドが成功するか
4. 型チェック (`pnpm typecheck`) が通るか
5. 既存テストが壊れていないか (`pnpm test`)

### コマンド一覧

| Command | Description |
|---------|-------------|
| `pnpm install` | 依存関係インストール |
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | プロダクションビルド |
| `pnpm lint` | ESLint 実行 (`eslint src`) |
| `pnpm typecheck` | TypeScript 型チェック |
| `pnpm test` | Vitest 実行 |
| `pnpm exec prisma migrate dev` | DB マイグレーション |
| `pnpm exec prisma db seed` | シードデータ投入 |
| `pnpm exec prisma generate` | Prisma Client 生成 |
| `pnpm exec prisma studio` | Prisma Studio（DB GUI）|

---

## 9. 環境変数

以下の環境変数が必要（`.env.example` 参照）:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/aiboukun"

# Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Token Encryption
TOKEN_ENCRYPTION_KEY="64-char-hex-string"

# LLM Provider
LLM_PROVIDER="gemini"
LLM_MODEL="gemini-2.5-flash"
GEMINI_API_KEY="your-gemini-api-key"

# Email (optional, dev uses console log)
RESEND_API_KEY=""
```

---

## 10. 品質基準

- セキュリティ > 信頼性 > 監視 > 保守性 > スケーラビリティ > UX polish
- 全ファイル 300 行以下、全関数 50 行以下
- 300 行超の diff は分割するか `docs/decisions.md` で説明
- Auth/Billing/DB schema/RLS/deploy/security/300行超diff/新規外部API はクロスレビュー必須
- 3 回連続同一エラー → `docs/issues.md` に記録して一時停止
- プレースホルダーコード禁止。全コミット時点で動作するコード
