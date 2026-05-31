# アイボウくん AIエージェント開発 要件定義・実装計画書

作成日：2026-05-31  
対象：Claude Code / Codex / フルスタック実装者  
プロダクト：アイボウくん  
定義：Googleマップ集客の営業・マーケティング担当AIエージェント

---

## 1. 要件定義書

### 1.1 プロダクト方針

アイボウくんは、Googleマップ集客・口コミ返信・低評価検知・競合比較・改善提案・週次/月次レポート作成に特化したAIエージェントである。  
「管理ツール」ではなく「月1万円で雇えるAI相棒」として設計する。

### 1.2 やること

- Google Business Profile連携
- Google口コミ取得・分類・返信
- 低評価・炎上・法務・医療リスク検知
- 返信案生成・承認・投稿
- 返信修正差分の学習
- 競合店舗比較
- 口コミ属性分析
- 改善タスク生成
- 週次/月次レポート自動生成
- 多店舗階層管理
- チャット/ボイスによる操作

### 1.3 やらないこと

- POS代替
- 予約台帳代替
- LINE公式運用全般
- CRM全機能
- 広告運用
- 在庫・勤怠・決済・会計

### 1.4 成功条件

- Google連携後3分以内に初回価値を提示
- 未返信口コミ数を可視化
- 低評価リスクを自動検知
- AI返信案を即生成
- 今週やるべきことを3つに絞る
- 店舗オーナーがスマホで1分以内に判断できる

---

## 2. システムアーキテクチャ

### 2.1 全体構成

```text
Client
├─ Web App: Next.js / React / TypeScript
├─ PWA: スマホ最適化
└─ Voice Input: Web Speech API

Backend
├─ Next.js Route Handlers
├─ Auth.js
├─ Prisma
├─ PostgreSQL
├─ Agent Orchestrator
├─ LLM Provider Adapter
├─ Google Business Profile Adapter
├─ Notification Service
└─ Report Generator

External
├─ Google OAuth
├─ Google Business Profile API
├─ Gemini API（開発時）
├─ OpenAI / Anthropic / Gemini Paid（商用切替）
└─ Email Provider
```

### 2.2 推奨技術スタック

```text
Frontend:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide Icons
- Recharts
- PWA

Backend:
- Next.js Route Handlers
- Prisma
- PostgreSQL
- Zod
- Auth.js

AI:
- Gemini API for development
- LLM Provider Adapter
- JSON Schema output
- prompt templates

Testing:
- Vitest
- React Testing Library
- Playwright
- MSW
```

### 2.3 ディレクトリ構成

```text
src/
  app/
    (marketing)/
      page.tsx
      pricing/page.tsx
      terms/page.tsx
      privacy/page.tsx
    (app)/
      home/page.tsx
      reviews/page.tsx
      insights/page.tsx
      competitors/page.tsx
      reports/page.tsx
      tasks/page.tsx
      stores/page.tsx
      settings/page.tsx
    api/
      auth/[...nextauth]/route.ts
      chat/route.ts
      reviews/route.ts
      reviews/[id]/draft/route.ts
      reviews/[id]/reply/route.ts
      reports/route.ts
      google/oauth/callback/route.ts
      google/sync/route.ts
  components/
    aibou/
    chat/
    reviews/
    reports/
    tasks/
    layout/
    ui/
  lib/
    auth/
    prisma/
    google/
    llm/
    agents/
    prompts/
    validators/
    security/
    rate-limit/
  server/
    services/
    jobs/
    notifications/
  types/
  prisma/
    schema.prisma
    seed.ts
```

---

## 3. AIエージェント設計書

### 3.1 表向きの人格

```ts
export type AibouPersona = {
  name: "アイボウくん";
  role: "Googleマップ集客の営業・マーケ担当";
  tone: "親しみやすいが、短く実務的";
  behavior: [
    "結論を先に言う",
    "重要な変化だけ伝える",
    "行動を3つ以内に絞る",
    "リスク時は落ち着いて警告する",
    "勝手に重要返信を投稿しない"
  ];
};
```

### 3.2 内部エージェント

| Agent | 責務 | 入力 | 出力 |
|---|---|---|---|
| Navigation Agent | チャット命令を意図解析 | userMessage | intent/action |
| Review Reply Agent | 口コミ返信案生成 | review/store/style | replyDraft |
| Risk Detection Agent | 低評価・炎上・法務検知 | review | riskFlag |
| Insight Agent | 口コミ要因分析 | reviews/metrics | insight |
| Competitor Agent | 競合比較 | store/competitors | competitorInsight |
| Report Agent | 週次/月次レポート | metrics/insights | report |
| Task Agent | 改善タスク生成 | risks/insights | tasks |
| Memory Agent | 修正差分学習 | draft/final | styleMemory |

### 3.3 Orchestrator

```ts
export interface AgentOrchestrator {
  run(input: AgentRunInput): Promise<AgentRunResult>;
}

export type AgentRunInput = {
  organizationId: string;
  userId: string;
  message?: string;
  event?: "NEW_REVIEW" | "REPORT_REQUESTED" | "RISK_DETECTED" | "SYNC_COMPLETED";
  payload?: unknown;
};

export type AgentRunResult = {
  assistantMessage: string;
  actions: AgentActionResult[];
  requiresApproval: boolean;
};
```

### 3.4 Navigation Intent

```ts
export type ChatIntent =
  | "show_reviews"
  | "filter_reviews"
  | "generate_reply_drafts"
  | "approve_reply"
  | "generate_report"
  | "compare_competitors"
  | "show_tasks"
  | "create_task"
  | "navigate"
  | "unknown";

export type ParsedCommand = {
  intent: ChatIntent;
  storeId?: string;
  ratings?: number[];
  period?: "today" | "week" | "month" | "custom";
  action?: string;
  route?: string;
  filters?: Record<string, unknown>;
};
```

### 3.5 Human-in-the-loop

自動実行可：

- 星5短文の定型返信
- 口コミ分類
- レポート下書き
- 通知生成
- 内部タスク生成

承認必須：

- 星1〜3への返信
- 医療・法務・炎上リスク
- 個人情報・返金・事故・安全リスク
- Google Business Profile公開情報変更
- 外部送信

---

## 4. LLM Provider Adapter設計

### 4.1 インターフェース

```ts
export interface LLMProvider {
  generateText(input: GenerateTextInput): Promise<GenerateTextOutput>;
  generateJson<T>(input: GenerateJsonInput<T>): Promise<T>;
  classify(input: ClassifyInput): Promise<ClassifyOutput>;
}

export type GenerateTextInput = {
  system: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, string>;
};

export type GenerateTextOutput = {
  text: string;
  model: string;
  provider: string;
  usage: TokenUsage;
};

export type GenerateJsonInput<T> = GenerateTextInput & {
  schemaName: string;
  schema: unknown;
};

export type TokenUsage = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostJpy?: number;
};
```

### 4.2 Provider実装

```text
lib/llm/
  provider.ts
  gemini-provider.ts
  openai-provider.ts
  anthropic-provider.ts
  llm-router.ts
  usage-logger.ts
```

### 4.3 環境変数

```env
LLM_PROVIDER=gemini
LLM_MODEL=gemini-2.5-flash
GEMINI_API_KEY=
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

### 4.4 必須仕様

- プロバイダを環境変数で切替
- JSON出力はZodで検証
- 失敗時は最大3回リトライ
- LLMUsageLogにトークン・コスト・モデル・用途を保存
- 商用時は有料APIへ差し替え可能にする

---

## 5. Google Business Profile API連携設計

### 5.1 使う操作

- アカウント一覧取得
- ロケーション一覧取得
- 口コミ一覧取得
- 口コミ個別取得
- 口コミ返信作成/更新
- 口コミ返信削除
- 通知/同期ジョブ

### 5.2 Adapter

```ts
export interface GoogleBusinessProfileClient {
  listAccounts(userId: string): Promise<GoogleAccount[]>;
  listLocations(accountName: string): Promise<GoogleLocation[]>;
  listReviews(locationName: string, pageToken?: string): Promise<GoogleReviewPage>;
  getReview(reviewName: string): Promise<GoogleReview>;
  updateReviewReply(reviewName: string, comment: string): Promise<GoogleReviewReply>;
  deleteReviewReply(reviewName: string): Promise<void>;
}
```

### 5.3 同期設計

```text
Manual Sync:
ユーザーが「同期」ボタンを押す

Scheduled Sync:
1時間ごとに全接続店舗を同期

Event Sync:
Google通知が使える場合はWebhook/PubSubで新規口コミを検知

Sync Flow:
1. OAuth token確認
2. Google locations取得
3. reviews list取得
4. DB upsert
5. Risk Detection Agent実行
6. Reply Draft生成
7. Notification生成
```

### 5.4 Rate Limit対応

- 店舗ごとに同期間隔を制御
- 429時はexponential backoff
- `google_api_call_logs`に記録
- `nextSyncAt`をStoreごとに保持
- pageToken同期で分割取得
- 失敗時はユーザーへ「Google連携エラー」通知

---

## 6. OAuth / 認証設計

### 6.1 認証

- Auth.js + Google Provider
- Email loginは後回し
- DBセッションはPrisma Adapter
- 組織/店舗権限は独自RBAC

### 6.2 OAuth Scope

Google Business Profileの口コミ返信では、Google側で `business.manage` または関連スコープが必要。  
Google側の仕様変更に備え、scopeは設定ファイル化する。

```ts
export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/business.manage",
];
```

### 6.3 Token保管

```text
- access_token: AES-GCMで暗号化
- refresh_token: AES-GCMで暗号化
- expires_at: 平文
- scope: 平文
- token失効時は再認証通知
```

---

## 7. DB設計書

### 7.1 主要テーブル

| Table | 用途 |
|---|---|
| users | ユーザー |
| organizations | 企業/契約単位 |
| organization_members | 権限 |
| brands | ブランド |
| areas | エリア |
| stores | 店舗 |
| google_connections | OAuth接続 |
| google_business_profiles | GBP拠点 |
| reviews | 口コミ |
| review_replies | 投稿済返信 |
| reply_drafts | AI返信案 |
| reply_revisions | 修正差分 |
| risk_flags | リスク検知 |
| competitors | 競合 |
| competitor_snapshots | 競合指標 |
| insights | 分析結果 |
| tasks | 改善タスク |
| reports | レポート |
| notifications | 通知 |
| agent_actions | AI実行ログ |
| audit_logs | 監査ログ |
| ai_style_memories | 返信スタイル学習 |
| industry_templates | 業種パック |
| llm_usage_logs | LLM利用ログ |
| google_api_call_logs | Google APIログ |

### 7.2 Prismaスキーマ案

```prisma
model Organization {
  id        String   @id @default(cuid())
  name      String
  plan      String   @default("starter")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  members   OrganizationMember[]
  brands    Brand[]
  stores    Store[]
}

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  image     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  memberships OrganizationMember[]
}

model OrganizationMember {
  id             String @id @default(cuid())
  organizationId String
  userId         String
  role           Role

  organization Organization @relation(fields: [organizationId], references: [id])
  user         User         @relation(fields: [userId], references: [id])

  @@unique([organizationId, userId])
}

enum Role {
  OWNER
  ADMIN
  MANAGER
  STAFF
  VIEWER
}

model Brand {
  id             String @id @default(cuid())
  organizationId String
  name           String
  organization   Organization @relation(fields: [organizationId], references: [id])
  areas          Area[]
  stores         Store[]
}

model Area {
  id      String @id @default(cuid())
  brandId String
  name    String
  brand   Brand  @relation(fields: [brandId], references: [id])
  stores  Store[]
}

model Store {
  id             String   @id @default(cuid())
  organizationId String
  brandId        String?
  areaId         String?
  name           String
  industry       Industry
  address        String?
  phone          String?
  status         StoreStatus @default(ACTIVE)
  nextSyncAt     DateTime?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  organization Organization @relation(fields: [organizationId], references: [id])
  brand        Brand?       @relation(fields: [brandId], references: [id])
  area         Area?        @relation(fields: [areaId], references: [id])
  gbp          GoogleBusinessProfile?
  reviews      Review[]
  competitors  Competitor[]
  tasks        Task[]
}

enum Industry {
  RESTAURANT
  BEAUTY_SALON
  DENTAL
  BEAUTY_CLINIC
  BODY_CARE
  HOTEL
  RETAIL
  OTHER
}

enum StoreStatus {
  ACTIVE
  PAUSED
  DISCONNECTED
}

model GoogleConnection {
  id             String   @id @default(cuid())
  organizationId String
  userId         String
  provider       String   @default("google")
  accessTokenEnc String
  refreshTokenEnc String?
  expiresAt      DateTime?
  scopes         String[]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model GoogleBusinessProfile {
  id                 String @id @default(cuid())
  storeId            String @unique
  googleAccountName  String
  googleLocationName String @unique
  placeId            String?
  title              String?
  verified           Boolean @default(false)
  raw                Json?

  store Store @relation(fields: [storeId], references: [id])
}

model Review {
  id              String @id @default(cuid())
  storeId         String
  googleReviewName String @unique
  rating          Int
  authorName      String?
  text            String?
  postedAt        DateTime
  updatedAt       DateTime?
  sentiment       Sentiment?
  topics          String[]
  attributes      String[]
  replyStatus     ReplyStatus @default(UNREPLIED)
  riskLevel       RiskLevel   @default(NORMAL)
  raw             Json?
  createdAt       DateTime @default(now())

  store        Store @relation(fields: [storeId], references: [id])
  drafts       ReplyDraft[]
  replies      ReviewReply[]
  riskFlags    RiskFlag[]
}

enum Sentiment {
  POSITIVE
  NEUTRAL
  NEGATIVE
}

enum ReplyStatus {
  UNREPLIED
  DRAFTED
  APPROVED
  POSTED
  SKIPPED
}

enum RiskLevel {
  NORMAL
  ATTENTION
  URGENT
  LEGAL
  MEDICAL
  PRIVACY
  SAFETY
}

model ReplyDraft {
  id            String @id @default(cuid())
  reviewId      String
  aiInitialText String
  ownerFinalText String?
  status        DraftStatus @default(DRAFT)
  riskLevel     RiskLevel
  requiresApproval Boolean @default(true)
  generatedByActionId String?
  approvedByUserId String?
  approvedAt    DateTime?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  review Review @relation(fields: [reviewId], references: [id])
  revisions ReplyRevision[]
}

enum DraftStatus {
  DRAFT
  EDITED
  APPROVED
  POSTED
  REJECTED
}

model ReplyRevision {
  id            String @id @default(cuid())
  draftId       String
  beforeText    String
  afterText     String
  diffSummary   Json
  createdByUserId String
  createdAt     DateTime @default(now())

  draft ReplyDraft @relation(fields: [draftId], references: [id])
}

model ReviewReply {
  id             String @id @default(cuid())
  reviewId       String
  googleReplyName String?
  text           String
  postedByUserId String?
  postedAt       DateTime
  raw            Json?

  review Review @relation(fields: [reviewId], references: [id])
}

model RiskFlag {
  id          String @id @default(cuid())
  reviewId    String
  level       RiskLevel
  reasons     String[]
  autoReplyAllowed Boolean
  approvalRequired Boolean
  recommendedAction String
  createdAt   DateTime @default(now())

  review Review @relation(fields: [reviewId], references: [id])
}

model Competitor {
  id        String @id @default(cuid())
  storeId   String
  name      String
  placeId   String?
  mapUrl    String?
  notes     String?
  createdAt DateTime @default(now())

  store Store @relation(fields: [storeId], references: [id])
  snapshots CompetitorSnapshot[]
}

model CompetitorSnapshot {
  id           String @id @default(cuid())
  competitorId String
  rating       Float?
  reviewCount  Int?
  recentReviewCount Int?
  photoCount   Int?
  strengths    String[]
  weaknesses   String[]
  capturedAt   DateTime @default(now())

  competitor Competitor @relation(fields: [competitorId], references: [id])
}

model Insight {
  id             String @id @default(cuid())
  organizationId String
  storeId        String?
  type           String
  periodStart    DateTime
  periodEnd      DateTime
  summary        String
  data           Json
  createdAt      DateTime @default(now())
}

model Task {
  id        String @id @default(cuid())
  storeId   String
  title     String
  detail    String?
  type      TaskType
  priority  Priority @default(MEDIUM)
  status    TaskStatus @default(TODO)
  dueDate   DateTime?
  assigneeUserId String?
  sourceAgentActionId String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  store Store @relation(fields: [storeId], references: [id])
}

enum TaskType {
  REVIEW_REPLY
  RISK_RESPONSE
  PROFILE_UPDATE
  PHOTO_ADD
  REVIEW_REQUEST
  SERVICE_IMPROVEMENT
  COMPETITOR_ACTION
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  TODO
  DOING
  DONE
  DISMISSED
}

model Report {
  id             String @id @default(cuid())
  organizationId String
  storeId        String?
  type           ReportType
  title          String
  markdown       String
  summary        String
  periodStart    DateTime
  periodEnd      DateTime
  createdAt      DateTime @default(now())
}

enum ReportType {
  WEEKLY
  MONTHLY
  HQ
  STORE_MANAGER
}

model Notification {
  id             String @id @default(cuid())
  organizationId String
  userId         String?
  type           String
  title          String
  body           String
  status         NotificationStatus @default(UNREAD)
  actionUrl      String?
  createdAt      DateTime @default(now())
}

enum NotificationStatus {
  UNREAD
  READ
  ARCHIVED
}

model AgentAction {
  id             String @id @default(cuid())
  organizationId String
  userId         String?
  agent          String
  actionType     String
  input          Json
  output         Json?
  status         AgentActionStatus
  requiresApproval Boolean @default(false)
  errorMessage   String?
  createdAt      DateTime @default(now())
}

enum AgentActionStatus {
  PENDING
  RUNNING
  COMPLETED
  FAILED
  CANCELLED
}

model AIStyleMemory {
  id             String @id @default(cuid())
  organizationId String
  storeId        String?
  scope          String
  key            String
  value          Json
  confidence     Float @default(0.5)
  updatedAt      DateTime @updatedAt
}

model IndustryTemplate {
  id        String @id @default(cuid())
  industry  Industry
  name      String
  replyRules Json
  ngWords   String[]
  attributes String[]
  createdAt DateTime @default(now())
}

model LLMUsageLog {
  id             String @id @default(cuid())
  organizationId String?
  provider       String
  model          String
  purpose        String
  inputTokens    Int
  outputTokens   Int
  estimatedCostJpy Float?
  createdAt      DateTime @default(now())
}

model GoogleApiCallLog {
  id             String @id @default(cuid())
  organizationId String?
  endpoint       String
  method         String
  statusCode     Int?
  errorCode      String?
  retryCount     Int @default(0)
  createdAt      DateTime @default(now())
}
```

---

## 8. API設計書

### 8.1 認証/組織

| Method | Path | 概要 |
|---|---|---|
| GET | `/api/me` | 自分のユーザー/組織情報 |
| GET | `/api/organizations/current` | 現在の組織 |
| PATCH | `/api/organizations/current` | 組織設定更新 |

### 8.2 Google連携

| Method | Path | 概要 |
|---|---|---|
| GET | `/api/google/accounts` | Googleアカウント一覧 |
| GET | `/api/google/locations` | GBP店舗一覧 |
| POST | `/api/google/connect-location` | 店舗とGBP紐付け |
| POST | `/api/google/sync` | 手動同期 |
| GET | `/api/google/sync/status` | 同期状態 |

### 8.3 口コミ

| Method | Path | 概要 |
|---|---|---|
| GET | `/api/reviews` | 口コミ一覧 |
| GET | `/api/reviews/:id` | 口コミ詳細 |
| POST | `/api/reviews/:id/draft` | AI返信案生成 |
| PATCH | `/api/reply-drafts/:id` | 返信案修正 |
| POST | `/api/reply-drafts/:id/approve` | 承認 |
| POST | `/api/reply-drafts/:id/post` | Googleへ投稿 |

### 8.4 分析/レポート

| Method | Path | 概要 |
|---|---|---|
| GET | `/api/insights/summary` | サマリー |
| GET | `/api/insights/reviews` | 口コミ分析 |
| GET | `/api/competitors` | 競合一覧 |
| POST | `/api/competitors` | 競合登録 |
| POST | `/api/reports/generate` | レポート生成 |
| GET | `/api/reports` | レポート一覧 |

### 8.5 チャット

| Method | Path | 概要 |
|---|---|---|
| POST | `/api/chat` | アイボウくんに依頼 |
| GET | `/api/chat/history` | 履歴 |

### 8.6 JSONレスポンス例

```json
{
  "ok": true,
  "data": {
    "assistantMessage": "新宿店の星1〜2口コミを3件見つけました。返信が必要なものは2件です。",
    "actions": [
      {
        "type": "NAVIGATE",
        "route": "/reviews?storeId=store_001&ratings=1,2"
      },
      {
        "type": "GENERATE_REPLY_DRAFTS",
        "reviewIds": ["review_001", "review_002"]
      }
    ],
    "requiresApproval": true
  }
}
```

---

## 9. UI/UX設計書

### 9.1 画面一覧

1. LP
2. 無料診断ページ
3. ログイン
4. Google連携オンボーディング
5. 初回診断レポート
6. ホーム / AI司令室
7. 口コミ返信
8. 口コミ分析
9. 競合比較
10. レポート
11. 改善タスク
12. 多店舗管理
13. 通知
14. 設定
15. 権限管理
16. 請求/プラン
17. ヘルプ
18. 利用規約
19. プライバシーポリシー
20. 特商法表記

### 9.2 ホーム / AI司令室

```text
上部:
- アイボウくんアバター
- 今日の一言
- 音声入力
- チャット入力

中央:
- 重要アラート
- 今やるべきこと3つ
- 未返信口コミ
- 低評価リスク
- 競合変化

下部:
- 今月のレポート
- 未返信口コミ
- 悪い口コミまとめ
- 競合比較
- 改善タスク
```

### 9.3 スマホ最適化

- 1画面1判断
- 長文表よりカード
- CTAは「承認」「修正」「あとで」「詳しく」
- 下部固定チャット入力
- 通知から返信承認に直行
- PWAでホーム画面追加

### 9.4 UIコンポーネント

```text
AibouAvatar
AibouMessageCard
CommandInput
VoiceInputButton
ImportantAlertCard
ReviewCard
ReplyDraftEditor
RiskBadge
InsightSummaryCard
CompetitorCompareTable
ReportMarkdownViewer
TaskCard
StoreSwitcher
ApprovalActionBar
```

---

## 10. チャット/ボイス操作仕様

### 10.1 入力例と処理

| 入力 | intent | 結果 |
|---|---|---|
| 今月のレポート見せて | generate_report | 月次レポート生成/表示 |
| 悪い口コミだけまとめて | filter_reviews | 星1〜2/negative抽出 |
| 新宿店と渋谷店を比較して | compare_stores | 店舗比較 |
| 未返信口コミに返信案作って | generate_reply_drafts | 下書き生成 |
| 評価が下がっている店舗を教えて | show_risk_stores | 要注意店舗表示 |

### 10.2 Voice

- Web Speech APIで音声→テキスト
- `/api/chat`へ同じ形式で送信
- AI返答は短文
- 将来的にTTS対応

---

## 11. 口コミ返信AI仕様

### 11.1 入力

```json
{
  "storeName": "新宿店",
  "industry": "restaurant",
  "rating": 2,
  "reviewText": "待ち時間が長く、説明も少なかったです。",
  "riskLevel": "attention",
  "styleMemory": {
    "length": "short",
    "tone": "polite",
    "emoji": false,
    "apologyDepth": "strong"
  }
}
```

### 11.2 出力

```json
{
  "reply": "この度は長くお待たせしてしまい、またご案内が十分でなかったとのこと、申し訳ございません。いただいたご意見をもとに、混雑時のご案内方法を見直してまいります。",
  "requiresApproval": true,
  "riskNotes": ["低評価のため承認必須"],
  "tone": "polite"
}
```

### 11.3 禁止

- 医療効果の断定
- 法的責任の断定的認定
- 個人情報への言及
- 感情的反論
- 返金確約
- スタッフ個人攻撃への同調

---

## 12. 返信修正差分学習仕様

### 12.1 Flow

```text
AI初回文
→ ユーザー修正
→ final text保存
→ 差分抽出
→ AIStyleMemory更新
```

### 12.2 差分分類

```ts
export type ReplyDiffSummary = {
  length: "shorter" | "longer" | "same";
  tone: "more_polite" | "more_casual" | "more_human" | "same";
  apologyDepth: "stronger" | "weaker" | "same";
  invitation: "added" | "removed" | "same";
  ngWordsAdded: string[];
  preferredPhrases: string[];
  removedPhrases: string[];
};
```

---

## 13. 低評価・炎上リスク検知仕様

### 13.1 分類

```ts
export type RiskClassification = {
  riskLevel: "normal" | "attention" | "urgent" | "legal" | "medical" | "privacy" | "safety";
  riskReasons: string[];
  autoReplyAllowed: boolean;
  approvalRequired: boolean;
  recommendedAction: string;
};
```

### 13.2 ルール

- 星1〜2は最低attention
- 返金/事故/怪我/個人名/訴える/詐欺/炎上はurgent以上
- 医療/美容医療はmedical表現を追加検査
- 個人情報があればprivacy
- 自動返信は原則禁止

---

## 14. 競合比較仕様

### 14.1 比較項目

- 評価
- 口コミ数
- 直近口コミ数
- 低評価率
- 返信率
- 写真数
- 頻出キーワード
- 強み/弱み属性
- Googleマップ表示順位（手動/将来API）

### 14.2 出力例

```json
{
  "summary": "渋谷店は評価は高い一方、直近30日の口コミ数で競合Aに負けています。",
  "wins": ["平均評価", "清潔感"],
  "losses": ["直近口コミ数", "待ち時間"],
  "recommendedTasks": [
    "会計時の口コミ依頼QRを設置",
    "土日午後の待ち時間説明を改善"
  ]
}
```

---

## 15. 週次/月次レポート生成仕様

### 15.1 週次

```markdown
# 今週のGoogleマップ集客レポート

## 結論
...

## 数字
- 新規口コミ
- 平均評価
- 未返信
- 低評価

## 注意点
...

## 今週やるべきこと
1.
2.
3.
```

### 15.2 月次

```markdown
# 月次Googleマップ集客レポート

## 今月の総評
...

## 主要指標
...

## 低評価理由ランキング
...

## 来月の改善提案
1.
2.
3.
```

---

## 16. 通知仕様

### 16.1 通知種別

- 新規口コミ
- 低評価口コミ
- 返信漏れ
- 評価急落
- 競合変化
- 週次レポート完成
- 月次レポート完成
- 改善タスク期限
- Google連携エラー

### 16.2 優先実装

1. アプリ内通知
2. メール
3. LINE
4. Slack
5. ブラウザPush

---

## 17. 権限管理仕様

| Role | 権限 |
|---|---|
| OWNER | 全権限 |
| ADMIN | 店舗/ユーザー管理 |
| MANAGER | 担当店舗の確認/返信承認 |
| STAFF | 閲覧/下書き修正 |
| VIEWER | 閲覧のみ |

---

## 18. セキュリティ設計

- テナント分離: organizationId必須
- OAuth token暗号化
- RBAC
- 監査ログ
- CSRF/XSS対策
- Zod入力検証
- Rate Limit
- Secretは環境変数
- 返信投稿はサーバー側のみ
- LLMへ送る個人情報は最小化

---

## 19. 監査ログ設計

保存対象：

- AIが生成した返信案
- ユーザー修正
- 承認者
- 投稿日時
- Google API結果
- レポート生成
- 権限変更
- Google連携/解除

```ts
export type AuditLog = {
  actorUserId?: string;
  organizationId: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  userAgent?: string;
};
```

---

## 20. エラーハンドリング

| エラー | 対応 |
|---|---|
| Google token expired | 再認証通知 |
| 403 insufficient scope | 連携やり直し |
| 429 rate limit | exponential backoff |
| LLM JSON parse error | 再生成→失敗通知 |
| DB constraint error | 重複upsert |
| Reply post failed | 下書き保持、再試行 |
| Unauthorized | ログインへ |

---

## 21. テスト設計

### 21.1 Unit

- LLM Provider Adapter
- Risk Detection rules
- Reply Approval rules
- Diff summary
- RBAC
- Google Adapter mock

### 21.2 Integration

- Google sync flow
- review→risk→draft→approve→post
- report generation
- chat intent routing

### 21.3 E2E

- signup
- Google connect
- first scan
- reply approve
- report view
- mobile PWA flow

---

## 22. 実装計画書

### 22.1 実装順序

1. Next.js/Prisma/Auth.js基盤
2. Organization/User/RBAC
3. Google OAuth接続
4. Store/GBP紐付け
5. Review同期
6. Risk Detection Agent
7. LLM Provider Adapter
8. Reply Draft生成
9. 承認/投稿フロー
10. ホーム/AI司令室
11. Chat Navigation
12. Insight/Task生成
13. Report生成
14. Competitor管理
15. 多店舗画面
16. 通知
17. LP/オンボーディング/規約
18. PWA最適化
19. 監査ログ/セキュリティ
20. テスト整備

### 22.2 最初に作るファイル

```text
package.json
.env.example
prisma/schema.prisma
src/lib/prisma/client.ts
src/lib/auth/auth-options.ts
src/lib/llm/provider.ts
src/lib/llm/gemini-provider.ts
src/lib/google/gbp-client.ts
src/lib/agents/orchestrator.ts
src/lib/agents/risk-detection-agent.ts
src/lib/agents/review-reply-agent.ts
src/lib/prompts/review-reply.ts
src/lib/prompts/risk-detection.ts
src/types/domain.ts
src/app/api/chat/route.ts
src/app/api/reviews/route.ts
src/app/(app)/home/page.tsx
src/components/aibou/AibouAvatar.tsx
src/components/chat/CommandInput.tsx
```

---

## 23. Claude Code / Codex向け実装タスク分解

### Task 1: 基盤作成

```markdown
Next.js App Router + TypeScript + Tailwind + shadcn/ui + Prisma + PostgreSQL + Auth.jsの基盤を作成してください。
`prisma/schema.prisma`にはOrganization/User/Store/Review/ReplyDraft/AgentAction/AuditLogを含めてください。
すべてのAPIはorganizationIdによるテナント分離を前提にしてください。
```

### Task 2: LLM Provider Adapter

```markdown
Gemini APIを初期実装とするLLM Provider Adapterを実装してください。
`generateText`, `generateJson`, `classify`を共通interfaceにし、ZodによるJSON検証、3回リトライ、LLMUsageLog保存を実装してください。
将来OpenAI/Anthropicへ差し替えられる構造にしてください。
```

### Task 3: Google Business Profile連携

```markdown
Google OAuthとGoogle Business Profile API連携を実装してください。
アカウント一覧、ロケーション一覧、口コミ一覧取得、口コミ返信更新、返信削除をAdapter化してください。
OAuth tokenは暗号化して保存してください。
429/401/403へのエラーハンドリングを実装してください。
```

### Task 4: 口コミ同期

```markdown
Google Business Profileから店舗ごとの口コミを同期し、Reviewテーブルへupsertしてください。
同期後、Risk Detection Agentを実行し、必要な通知を作成してください。
同期ログはGoogleApiCallLogに保存してください。
```

### Task 5: 口コミ返信AI

```markdown
Review Reply Agentを実装してください。
業種、店舗名、星評価、口コミ本文、リスク、AIStyleMemoryを入力に、返信案JSONを生成してください。
星1〜3、医療/法務/炎上/個人情報リスクは必ずrequiresApproval=trueにしてください。
```

### Task 6: 承認/投稿フロー

```markdown
ReplyDraftの編集、承認、Google投稿フローを実装してください。
投稿成功後はReviewReplyを作成し、Review.replyStatusをPOSTEDに更新してください。
AI初回文と最終文の差分をReplyRevisionに保存し、AIStyleMemoryを更新してください。
```

### Task 7: AI司令室UI

```markdown
スマホファーストのホーム画面を作ってください。
上部にアイボウくんアバター、今日の報告、チャット/音声入力。
中央に重要アラート、今やるべきこと3つ、未返信口コミ、低評価リスク。
下部によく使う依頼ボタンを配置してください。
```

### Task 8: Chat Navigation

```markdown
`/api/chat`を実装し、自然言語をintentに変換してください。
例：「新宿店の悪い口コミだけ見せて」→ reviews画面へrating=1,2で遷移するactionを返してください。
```

### Task 9: Report Agent

```markdown
週次/月次レポート生成を実装してください。
単なる数字の羅列ではなく、結論、重要変化、良かった点、注意点、改善タスク3つをMarkdownで生成してください。
```

### Task 10: 商品化導線

```markdown
LP、無料診断、Googleログイン、オンボーディング、利用規約、プライバシーポリシー、特商法表記、問い合わせフォーム、解約導線を作成してください。
Google連携後3分以内に初回診断結果を表示するUXにしてください。
```

---

## 24. 主要プロンプトテンプレート

### 24.1 Risk Detection

```text
あなたはGoogle口コミのリスク分類AIです。
以下の口コミを分類してください。

業種: {{industry}}
星評価: {{rating}}
口コミ本文: {{reviewText}}

出力はJSONのみ:
{
  "riskLevel": "normal | attention | urgent | legal | medical | privacy | safety",
  "riskReasons": string[],
  "autoReplyAllowed": boolean,
  "approvalRequired": boolean,
  "recommendedAction": string
}

ルール:
- 星1〜2は最低attention
- 返金、事故、怪我、個人名、訴訟、詐欺、炎上はurgent以上
- 医療・美容医療は効果断定や症状表現に注意
- 個人情報を含む場合はprivacy
```

### 24.2 Review Reply

```text
あなたは「アイボウくん」です。
Google口コミへの返信案を作成してください。

店舗名: {{storeName}}
業種: {{industry}}
星評価: {{rating}}
口コミ本文: {{reviewText}}
リスク: {{riskLevel}}
過去の返信スタイル: {{styleMemory}}
NG表現: {{ngWords}}

条件:
- 短く、自然で、丁寧
- 低評価には謝意と改善姿勢
- 医療効果、返金、法的責任を断定しない
- 個人情報に触れない
- 星1〜3は承認必須

JSONのみ:
{
  "reply": string,
  "requiresApproval": boolean,
  "riskNotes": string[],
  "tone": string
}
```

### 24.3 Report

```text
あなたはGoogleマップ集客のAI担当者です。
以下のデータから意思決定用レポートをMarkdownで作成してください。

対象期間: {{period}}
店舗: {{storeScope}}
指標: {{metrics}}
口コミ分析: {{insights}}
競合比較: {{competitorInsights}}
リスク: {{risks}}

構成:
# タイトル
## 結論
## 数字
## 良かった点
## 注意点
## 原因仮説
## やるべきこと3つ

数字の羅列ではなく、店舗オーナーがすぐ判断できる内容にしてください。
```

---

## 25. 商品化設計

### 25.1 LP

構成：

1. ファーストビュー  
   「Googleマップ集客のAI相棒を月1万円で雇う」
2. 課題  
   口コミ返信、低評価対応、競合比較、レポート作成が後回し
3. 解決  
   アイボウくんが監視・返信案・改善提案
4. デモ  
   スマホ画面のAI司令室
5. 機能  
   口コミ返信/低評価検知/競合比較/レポート
6. 料金  
   個人店9,800円、小規模多店舗19,800円〜
7. CTA  
   Google連携して無料診断

### 25.2 オンボーディング

```text
1. Googleログイン
2. Google Business Profile連携
3. 店舗選択
4. 業種選択
5. 返信トーン選択
6. 自動返信ルール
7. 初回スキャン
8. 初回診断表示
```

### 25.3 規約/ポリシーに入れる要点

利用規約：

- Google API利用
- AI生成文の最終責任
- 自動返信設定
- 禁止業種/禁止利用
- 解約
- 免責

プライバシーポリシー：

- Google連携データ
- 口コミデータ
- OAuth token保管
- AI処理
- 第三者API
- データ削除

---

## 26. リスクと未決定事項

### 26.1 技術リスク

- Google Business Profile APIの利用審査/制限
- 口コミ返信APIの権限/スコープ変更
- Gemini無料枠の制限変更
- LLM JSON出力の不安定性
- 多店舗同期時のレート制限

### 26.2 法務/運用リスク

- 医療/美容医療の広告表現
- 口コミ返信による炎上
- 自動返信の責任範囲
- 個人情報を含む口コミ処理
- AI生成内容の監査性

### 26.3 未決定事項

- 商用時のLLM Provider
- 本番インフラ
- 決済プロバイダ
- LINE通知の範囲
- 競合データ取得方法
- Google API審査要件
- 医療業種を初期対応に含めるか
