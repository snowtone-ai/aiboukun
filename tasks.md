# tasks.md — アイボウくん 完全実装計画

> **目標**: 商用化レベルの完成版を段階的に構築する
> **設計原則**: シンプル・小さな変更前提・長期安定運用
> **フロントエンド方針**: 優秀な既存プロダクトをモデルにし、アイボウくん向けに最適化
> **Coordinator**: CEO Agent (Claude Code)
> **Executor**: Codex CLI (各タスク実行)

---

## 凡例

```
Status: proposed → ready → in_progress → done → verified
Owner: Codex | Human | Claude Code
```

---

## Phase 0: Project Bootstrap — ✅ 完了

### T-001: Next.js プロジェクト初期化 ✅
- **Status**: done
- **Evidence**: pnpm build OK, typecheck OK, lint OK (2026-05-31)
- **成果物**: package.json, tsconfig.json, next.config.ts, postcss.config.mjs, eslint.config.mjs, src/app/{layout,page,globals}.tsx

### T-016: .env.local 設定 ✅
- **Status**: done (Human)
- **Evidence**: .env.local 作成済み、Docker PostgreSQL 起動済み

---

## Phase 1: Infrastructure — 基盤構築

### T-002: Prisma スキーマ + PostgreSQL セットアップ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-001 ✅
- **Write Scope**: `prisma/schema.prisma`, `src/lib/prisma/client.ts`, `prisma/seed.ts`, `package.json`
- **Description**:
  - `pnpm add prisma @prisma/client && pnpm add -D tsx`
  - `context/aiboukun_ai_agent_requirements.md` Section 7.2 の Prisma スキーマをそのまま使用
  - `src/lib/prisma/client.ts` にシングルトン Prisma Client（Next.js hot reload 対応）
  - `prisma/seed.ts` に IndustryTemplate 初期データ（飲食、美容室、整体、小売）
  - `package.json` に `"prisma": { "seed": "tsx prisma/seed.ts" }` 追加
- **Acceptance**:
  - `pnpm exec prisma migrate dev --name init` が成功
  - `pnpm exec prisma db seed` が成功
  - 全テーブルが作成される
- **Verify**: `pnpm exec prisma migrate dev --name init && pnpm exec prisma db seed`

### T-003: Auth.js (NextAuth v5) + Google OAuth
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-002
- **Write Scope**: `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`, `package.json`
- **Description**:
  - `pnpm add next-auth@5 @auth/prisma-adapter`
  - `src/lib/auth.ts`: NextAuth config — Google Provider + Prisma Adapter
  - Google OAuth scopes: `openid, email, profile, https://www.googleapis.com/auth/business.manage`
  - Session strategy: database
  - Callbacks: session に userId, organizationId を含める
  - `src/middleware.ts`: `/app/*` を認証必須（`/`, `/api/auth/*`, `/(marketing)/*` 除外）
  - `src/app/api/auth/[...nextauth]/route.ts`: GET/POST export
- **Acceptance**:
  - `/api/auth/signin` で Google ログイン画面に遷移
  - ログイン後 session にユーザー情報が入る
  - 未認証で `/app/*` アクセスでリダイレクト
- **Verify**: `pnpm build`

### T-004: shadcn/ui + Tailwind v4 テーマ設定
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-001 ✅
- **Write Scope**: `src/app/globals.css`, `src/lib/utils.ts`, `components.json`, `package.json`, `src/components/ui/*`
- **Description**:
  - `pnpm add class-variance-authority clsx tailwind-merge`
  - `pnpm dlx shadcn@latest init`（Tailwind v4 CSS variables モード）
  - `src/lib/utils.ts` に `cn()` ヘルパー
  - shadcn/ui コンポーネント追加:
    - `button, card, input, textarea, badge, avatar, dialog, sheet`
    - `dropdown-menu, separator, skeleton, tabs, tooltip, popover`
    - `scroll-area, sonner, command, form`
  - globals.css にアイボウくんカラーテーマ（CSS variables）:
    ```
    --primary: #0F766E       /* メインティール */
    --accent: #14B8A6        /* CTA・強調 */
    --accent-light: #99F6E4  /* Hover・選択背景 */
    --background: #FFFDF8    /* 温かい背景 */
    --card: #FFFFFF
    --foreground: #1E293B    /* 本文 */
    --muted-foreground: #64748B
    --success: #22C55E
    --warning: #F59E0B
    --danger: #EF4444
    ```
  - ボタン角丸: `border-radius: 999px`
  - カード角丸: `border-radius: 20px`, 影: `0 4px 12px rgba(15,23,42,0.05)`
  - 入力欄角丸: `border-radius: 16px`
  - フォント: `Noto Sans JP` (Google Fonts) + system-ui fallback
- **Acceptance**:
  - shadcn/ui の Button, Card が正しいテーマで表示
  - 背景 #FFFDF8、ボタン #14B8A6
- **Verify**: `pnpm build && pnpm typecheck`

### T-005: 共有 TypeScript 型 + Zod スキーマ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-002
- **Write Scope**: `src/types/domain.ts`, `src/lib/validators/review.ts`, `src/lib/validators/chat.ts`, `src/lib/validators/common.ts`, `package.json`
- **Description**:
  - `pnpm add zod`
  - `src/types/domain.ts`: Prisma 生成型 re-export + ドメイン固有型
    - `ChatIntent`, `ParsedCommand`, `RiskClassification`, `ReplyDiffSummary`
    - `AgentRunInput`, `AgentRunResult`, `AibouPersona`
    - `ApiResponse<T>`, `ApiError`
  - Zod バリデーション: Review 関連、Chat 入力、共通（ページネーション、フィルター）
- **Acceptance**:
  - 型定義が Prisma 生成型と整合
  - Zod スキーマで入力バリデーション可能
- **Verify**: `pnpm typecheck`

### T-006: API ユーティリティ + エラーハンドリング
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-005
- **Write Scope**: `src/lib/api/response.ts`, `src/lib/api/errors.ts`, `src/lib/api/middleware.ts`
- **Description**:
  - 統一 JSON レスポンス: `{ ok: true, data }` / `{ ok: false, error }`
  - `AppError` クラス（statusCode, errorCode, message）
  - ミドルウェア:
    - `withAuth(handler)`: セッション検証
    - `withOrg(handler)`: organizationId 注入（テナント分離）
    - `withValidation(schema, handler)`: Zod バリデーション
- **Acceptance**:
  - 認証切れ→401、権限不足→403、バリデーション失敗→400
  - 統一フォーマットで返却
- **Verify**: `pnpm typecheck`

### T-007: OAuth トークン暗号化ユーティリティ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-001 ✅
- **Write Scope**: `src/lib/crypto/token-encryption.ts`, `src/lib/crypto/__tests__/token-encryption.test.ts`
- **Description**:
  - Node.js `crypto` で AES-256-GCM 暗号化/復号化
  - 暗号化キー: `TOKEN_ENCRYPTION_KEY` 環境変数（32バイト hex）
  - `encryptToken(plaintext): string` → `iv:authTag:ciphertext`
  - `decryptToken(encrypted): string`
  - Vitest ユニットテスト
- **Acceptance**:
  - 暗号化→復号化で元値復元、異なるキーで失敗
  - テスト通過
- **Verify**: `pnpm test -- src/lib/crypto`

### T-008: アプリシェル（レイアウト・ナビゲーション）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-003, T-004
- **Write Scope**: `src/app/(app)/layout.tsx`, `src/components/layout/*`, `src/app/(marketing)/layout.tsx`, `package.json`
- **UI Model**: **Linear** サイドバー + **Notion** 温かみ
  - Linear: アイコン+ラベルのクリーンなサイドバー、セクション区切り
  - Notion: 柔らかいホバー、角丸、温かい配色
  - アイボウくん: ティールアクセント、#FFFDF8 背景
- **Description**:
  - `pnpm add lucide-react`
  - `Sidebar.tsx`: ナビ（ホーム/口コミ/分析/競合/レポート/タスク/店舗/設定）、Lucide Icons、モバイルは Sheet スライドイン、デスクトップ固定 240px
  - `Header.tsx`: モバイル=ハンバーガー+ロゴ+通知ベル、デスクトップ=店舗セレクター+Cmd+K+通知+ユーザーメニュー
  - `MobileNav.tsx`: 下部固定タブバー（ホーム/口コミ/チャットFAB/レポート/設定）
  - `(app)/layout.tsx`: 認証済みレイアウト
  - `(marketing)/layout.tsx`: LP 用レイアウト
- **Acceptance**:
  - デスクトップ: サイドバー+メインの 2 カラム
  - モバイル (<768px): 下部タブバー+スライドインメニュー
  - ナビ遷移スムーズ、アクティブページハイライト
- **Verify**: `pnpm build && pnpm dev` → ブラウザ確認

---

## Phase 2: Google Integration — Google 連携

### T-009: Google Business Profile API アダプター
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-007
- **Write Scope**: `src/lib/google/gbp-client.ts`, `src/lib/google/types.ts`, `package.json`
- **Description**:
  - `pnpm add googleapis`
  - `GoogleBusinessProfileClient` クラス
  - メソッド: `listAccounts`, `listLocations`, `listReviews`, `getReview`, `updateReviewReply`, `deleteReviewReply`
  - OAuth token 復号化 → Google API Client 初期化
  - エラー: 401→トークンリフレッシュ、403→スコープ不足通知、429→exponential backoff
- **Acceptance**:
  - 型定義が Google API レスポンスと一致
  - 401/403/429 ハンドリングあり
- **Verify**: `pnpm typecheck`

### T-010: Google OAuth 接続管理 API
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-003, T-009
- **Write Scope**: `src/app/api/google/connect/route.ts`, `src/app/api/google/callback/route.ts`, `src/app/api/google/accounts/route.ts`, `src/app/api/google/locations/route.ts`
- **Description**:
  - `/api/google/connect`: 追加スコープ要求（business.manage）
  - `/api/google/callback`: トークン受取→暗号化→GoogleConnection 保存
  - `/api/google/accounts`: アカウント一覧
  - `/api/google/locations`: GBP ロケーション一覧
  - 全 API に organizationId テナント分離
- **Acceptance**:
  - GBP 接続フロー完結、トークン暗号化保存、ロケーション取得可能
- **Verify**: `pnpm typecheck && pnpm build`

### T-011: Store ↔ GBP ロケーション紐付け API
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-010
- **Write Scope**: `src/app/api/stores/route.ts`, `src/app/api/stores/[id]/route.ts`, `src/app/api/google/connect-location/route.ts`
- **Description**:
  - Store CRUD API
  - `/api/google/connect-location`: Store と GBP を紐付け
  - 紐付け後に初回同期トリガー
- **Acceptance**:
  - 店舗作成→GBP 紐付け可能
- **Verify**: `pnpm typecheck && pnpm build`

### T-012: 口コミ同期エンジン
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-009, T-011
- **Write Scope**: `src/lib/google/review-sync.ts`, `src/app/api/google/sync/route.ts`, `src/app/api/google/sync/status/route.ts`
- **Description**:
  - `syncReviewsForStore(storeId)`: Google API→DB upsert（googleReviewName 一意）
  - pageToken 分割取得
  - 同期後 Risk Detection Agent 呼び出しフック点
  - GoogleApiCallLog 記録、Store.nextSyncAt 更新
  - 手動同期 POST + 状態 GET
- **Acceptance**:
  - 口コミが Google→DB 同期、重複なし（upsert）、ログ記録
- **Verify**: `pnpm typecheck && pnpm build`

### T-013: Google API レートリミッター + コールログ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-009
- **Write Scope**: `src/lib/google/rate-limiter.ts`, `src/lib/google/call-logger.ts`
- **Description**:
  - 店舗ごと同期間隔制御、429 時 exponential backoff（初期 1s, 最大 60s, 3 回リトライ）
  - GoogleApiCallLog への全コール記録
- **Acceptance**:
  - 429 でリトライ、全コールがログ記録
- **Verify**: `pnpm typecheck`

---

## Phase 3: AI Engine — AI 基盤

### T-014: LLM Provider Adapter（インターフェース + Gemini）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-005
- **Write Scope**: `src/lib/llm/provider.ts`, `src/lib/llm/gemini-provider.ts`, `src/lib/llm/llm-router.ts`, `package.json`
- **Description**:
  - `pnpm add @google/generative-ai`
  - `LLMProvider` interface: `generateText`, `generateJson<T>`, `classify`
  - `gemini-provider.ts`: Gemini API 実装（デフォルト gemini-2.5-flash）
  - JSON モード対応、リトライ最大 3 回、Zod レスポンス検証
  - `llm-router.ts`: `LLM_PROVIDER` 環境変数でプロバイダ切替
  - TokenUsage 返却
- **Acceptance**:
  - `generateText` でテキスト生成可能
  - `generateJson` で Zod 検証済み JSON 返却
  - Provider 切替構造あり
- **Verify**: `pnpm typecheck`

### T-015: プロンプトテンプレート
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014
- **Write Scope**: `src/lib/prompts/risk-detection.ts`, `src/lib/prompts/review-reply.ts`, `src/lib/prompts/report.ts`, `src/lib/prompts/intent-parser.ts`, `src/lib/prompts/insight.ts`
- **Description**:
  - system prompt + user prompt テンプレート関数
  - テンプレート変数を関数引数で型安全に受取
  - 出力 JSON スキーマを Zod 定義、プロンプトにも形式指定
  - `context/aiboukun_ai_agent_requirements.md` Section 24 参考
- **Acceptance**:
  - 各テンプレートが型安全、出力 Zod スキーマ定義済み
- **Verify**: `pnpm typecheck`

### T-016-B: LLM 使用ログ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014, T-002
- **Write Scope**: `src/lib/llm/usage-logger.ts`
- **Description**:
  - LLM 呼び出し後に LLMUsageLog テーブル記録
  - provider, model, purpose, tokens, cost, organizationId
- **Acceptance**:
  - LLM 使用のたびにログ保存
- **Verify**: `pnpm typecheck`

### T-017: Risk Detection Agent
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014, T-015
- **Write Scope**: `src/lib/agents/risk-detection-agent.ts`, `src/lib/agents/__tests__/risk-detection-agent.test.ts`
- **Description**:
  - 入力: Review（rating, text, industry）
  - LLM → RiskClassification JSON
  - ルール: 星1-2→attention以上、返金/事故等→urgent以上、医療→medical検査、個人情報→privacy
  - RiskFlag テーブル保存
  - Vitest ユニットテスト（LLM モック）
- **Acceptance**:
  - 星1→attention以上、「返金」含む→urgent以上、テスト通過
- **Verify**: `pnpm test -- src/lib/agents/risk-detection`

### T-018: Review Reply Agent
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014, T-015, T-017
- **Write Scope**: `src/lib/agents/review-reply-agent.ts`, `src/lib/agents/__tests__/review-reply-agent.test.ts`
- **Description**:
  - 入力: Review + Store + AIStyleMemory + IndustryTemplate
  - LLM で返信案生成 → `{ reply, requiresApproval, riskNotes, tone }`
  - 星1-3 / 医療/法務/炎上リスク → `requiresApproval: true`
  - NG 表現チェック
  - ReplyDraft テーブル保存、Vitest テスト
- **Acceptance**:
  - 日本語返信案生成、星2→requiresApproval:true、テスト通過
- **Verify**: `pnpm test -- src/lib/agents/review-reply`

### T-019: Memory Agent（返信スタイル学習）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014, T-002
- **Write Scope**: `src/lib/agents/memory-agent.ts`
- **Description**:
  - 入力: ReplyDraft（AI 初回文 + オーナー最終文）
  - 差分分析→AIStyleMemory 更新（length, tone, apologyDepth, invitation, ngWords, preferredPhrases）
  - confidence 修正回数で上昇（0.0〜1.0）
  - ReplyRevision に差分保存
- **Acceptance**:
  - 差分記録、AIStyleMemory 更新、次回参照可能
- **Verify**: `pnpm typecheck`

---

## Phase 4: Core UX — コア画面

### T-020: ホーム / AI 司令室 UI
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-008, T-006
- **Write Scope**: `src/app/(app)/page.tsx`, `src/components/aibou/*`, `src/app/api/home/summary/route.ts`
- **UI Model**: **ChatGPT** 会話中心 + **Intercom** 親しみやすさ
  - ChatGPT: メッセージバブル、下部固定入力
  - Intercom: フレンドリーアバター、ステータス表示
  - アイボウくん: ティールアバター、温かい挨拶、アクションカード
- **Description**:
  - `AibouAvatar.tsx`: 状態別カラー（通常#14B8A6, 良好#22C55E, 注意#F59E0B, 危険#EF4444, 思考中#99F6E4）、パルスアニメーション
  - `AibouMessageCard.tsx`: メッセージ + アクションボタン（承認/詳細/あとで）
  - ホーム構成: 上部=Avatar+一言+チャット入力、中央=アラート+やるべき3つ+未返信+リスク、下部=依頼ボタン
  - `/api/home/summary`: サマリーデータ API
- **Acceptance**:
  - スマホでアバター+一言+アクションカード表示
  - アラートが目立つ、ボタンタップで各機能遷移
- **Verify**: `pnpm build`

### T-021: チャットインターフェース
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-020
- **Write Scope**: `src/components/chat/*`, `src/app/api/chat/route.ts`, `src/app/api/chat/history/route.ts`
- **UI Model**: **ChatGPT** チャット UX
  - メッセージリスト（上スクロール）、左右分け、下部固定入力+送信+マイク
- **Description**:
  - `ChatContainer.tsx`, `MessageList.tsx`, `MessageBubble.tsx`, `CommandInput.tsx`, `ActionCard.tsx`
  - `/api/chat`: メッセージ→AI レスポンス
  - `/api/chat/history`: 履歴取得
- **Acceptance**:
  - テキスト送信→AI 返答がチャット形式表示、アクションボタン含む
- **Verify**: `pnpm build`

### T-022: Navigation Agent（インテント解析）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014, T-015
- **Write Scope**: `src/lib/agents/navigation-agent.ts`
- **Description**:
  - 自然言語→ChatIntent 変換
  - Intent: show_reviews, filter_reviews, generate_reply_drafts, approve_reply, generate_report, compare_competitors, show_tasks, create_task, navigate, unknown
  - ParsedCommand: intent, storeId, ratings, period, action, route, filters
  - 例: 「新宿店の悪い口コミだけ見せて」→ `{ intent: "filter_reviews", ratings: [1,2] }`
- **Acceptance**:
  - 日本語から正しい intent + パラメータ抽出
- **Verify**: `pnpm typecheck`

### T-023: Agent Orchestrator
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-017, T-018, T-022
- **Write Scope**: `src/lib/agents/orchestrator.ts`, `src/app/api/agents/route.ts`
- **Description**:
  - `AgentOrchestrator.run(input)`: message→NavigationAgent→適切 Agent 呼出→AgentAction 記録→結果返却
  - event: NEW_REVIEW, REPORT_REQUESTED, RISK_DETECTED, SYNC_COMPLETED
  - `/api/agents/route.ts`: Orchestrator エンドポイント
- **Acceptance**:
  - メッセージ→適切 Agent 呼出、イベント処理、ログ記録
- **Verify**: `pnpm typecheck && pnpm build`

### T-024: 口コミ一覧ページ + フィルター
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-008, T-012
- **Write Scope**: `src/app/(app)/reviews/page.tsx`, `src/app/(app)/reviews/loading.tsx`, `src/components/reviews/*`, `src/app/api/reviews/route.ts`, `src/app/api/reviews/[id]/route.ts`
- **UI Model**: **Intercom** 会話リスト + **Linear** フィルター
  - カード形式口コミ、ステータスバッジ、フィルターバー
  - RiskBadge 色分け、温かいカード
- **Description**:
  - `ReviewCard.tsx`, `ReviewFilterBar.tsx`, `RiskBadge.tsx`, `StarRating.tsx`
  - GET `/api/reviews`（一覧+ページネーション+フィルター）
  - GET `/api/reviews/[id]`（詳細）
  - loading.tsx: Skeleton
- **Acceptance**:
  - 星評価/返信状態/リスクでフィルタ可能、モバイル快適
- **Verify**: `pnpm build`

### T-025: 口コミ詳細 + 返信エディタ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-024, T-018
- **Write Scope**: `src/app/(app)/reviews/[id]/page.tsx`, `src/components/reviews/ReplyDraftEditor.tsx`, `src/app/api/reviews/[id]/draft/route.ts`, `src/app/api/reply-drafts/[id]/route.ts`
- **UI Model**: **Notion** インラインエディタ + **Intercom** 返信 UX
- **Description**:
  - 口コミ詳細（原文、星、著者、日時、センチメント、トピックス）
  - `ReplyDraftEditor.tsx`: AI 返信案テキストエリア + リスクノート + 承認/修正/却下/再生成ボタン
  - POST `/api/reviews/[id]/draft`: AI 返信案生成
  - PATCH `/api/reply-drafts/[id]`: 下書き修正
- **Acceptance**:
  - AI 返信案の生成/表示/編集/保存/承認/却下/再生成
- **Verify**: `pnpm build`

### T-026: 返信承認 + Google 投稿フロー
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-025, T-009, T-019
- **Write Scope**: `src/app/api/reply-drafts/[id]/approve/route.ts`, `src/app/api/reply-drafts/[id]/post/route.ts`, `src/components/reviews/ApprovalActionBar.tsx`
- **Description**:
  - `/approve`: DraftStatus→APPROVED、承認者・日時記録
  - `/post`: Google API 投稿→ReviewReply 作成→Review.replyStatus=POSTED
  - 失敗→エラー通知、下書き保持
  - 差分→ReplyRevision 保存→Memory Agent で AIStyleMemory 更新
  - `ApprovalActionBar.tsx`: 下部固定承認バー（スマホ対応大ボタン）
- **Acceptance**:
  - 承認→投稿→状態更新→差分保存→Memory 更新が一貫動作
- **Verify**: `pnpm typecheck && pnpm build`

### T-027: アプリ内通知システム
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-006, T-002
- **Write Scope**: `src/lib/notifications/service.ts`, `src/app/api/notifications/route.ts`, `src/app/api/notifications/[id]/read/route.ts`, `src/components/layout/NotificationBell.tsx`, `src/components/notifications/NotificationList.tsx`
- **UI Model**: **Slack** 通知タイムライン
- **Description**:
  - `createNotification(params)`: DB 保存
  - 種別: NEW_REVIEW, LOW_RATING, UNREPLIED, RATING_DROP, COMPETITOR_CHANGE, REPORT_READY, TASK_DUE, GOOGLE_ERROR
  - `NotificationBell.tsx`: ベル+未読数、`NotificationList.tsx`: ドロップダウン一覧
- **Acceptance**:
  - 通知作成/一覧/既読、ベルに未読数、タップで遷移
- **Verify**: `pnpm build`

### T-028: 音声入力（Web Speech API）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-021
- **Write Scope**: `src/components/chat/VoiceInputButton.tsx`, `src/hooks/useVoiceInput.ts`
- **Description**:
  - `useVoiceInput` hook: SpeechRecognition ラッパー（ja-JP）
  - `VoiceInputButton.tsx`: マイクボタン、録音中パルスアニメーション
  - 非対応ブラウザでは非表示
- **Acceptance**:
  - マイクタップで音声認識→テキスト入力欄に反映
- **Verify**: `pnpm build`

---

## Phase 5: Intelligence — 分析・レポート

### T-029: Insight Agent（口コミ分析）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014, T-015
- **Write Scope**: `src/lib/agents/insight-agent.ts`
- **Description**:
  - 入力: 期間内口コミ一覧+店舗情報
  - LLM 分析: ポジネガ要因、頻出キーワード、評価低下原因、前期比、AIO 属性スコア
  - Insight テーブル保存
- **Acceptance**:
  - 要因分析 JSON 生成、Insight テーブル保存
- **Verify**: `pnpm typecheck`

### T-030: 分析ダッシュボード
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-029, T-008
- **Write Scope**: `src/app/(app)/analytics/page.tsx`, `src/components/analytics/*`, `src/app/api/insights/summary/route.ts`, `src/app/api/insights/reviews/route.ts`, `package.json`
- **UI Model**: **Stripe Dashboard** データ表示 + **Linear** 軽快さ
  - 上部に AI 要約テキスト、KPI カード+スパークライン、期間セレクター
- **Description**:
  - `pnpm add recharts`
  - `KpiCard.tsx`, `SentimentChart.tsx`, `TopicsRanking.tsx`, `RatingTrend.tsx`, `AttributeScore.tsx`
  - AI 要約「今月は…」を上部表示
- **Acceptance**:
  - KPI 表示、期間切替、AI 要約上部表示
- **Verify**: `pnpm build`

### T-031: 競合管理 CRUD
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-002, T-006
- **Write Scope**: `src/app/api/competitors/route.ts`, `src/app/api/competitors/[id]/route.ts`, `src/app/api/competitors/[id]/snapshot/route.ts`
- **Description**:
  - 競合 CRUD + スナップショット記録 API
  - 将来 Google Maps API 自動取得に差替可能
- **Acceptance**:
  - 競合 CRUD + スナップショット記録可能
- **Verify**: `pnpm typecheck && pnpm build`

### T-032: Competitor Agent + 比較 UI
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-031, T-014, T-008
- **Write Scope**: `src/lib/agents/competitor-agent.ts`, `src/app/(app)/competitors/page.tsx`, `src/components/competitors/*`
- **UI Model**: **Stripe** 比較テーブル（勝ち緑/負け赤）
- **Description**:
  - LLM 比較分析→`{ summary, wins, losses, recommendedTasks }`
  - `CompetitorCompareTable.tsx`, `CompetitorInsightCard.tsx`
- **Acceptance**:
  - 比較表示+AI サマリー+推奨タスク
- **Verify**: `pnpm build`

### T-033: Report Agent（週次/月次レポート）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014, T-015, T-029
- **Write Scope**: `src/lib/agents/report-agent.ts`, `src/app/api/reports/generate/route.ts`
- **Description**:
  - LLM で Markdown レポート生成
  - 構成: タイトル→結論→数字→良い点→注意点→原因仮説→やるべきこと 3 つ
  - Report テーブル保存（WEEKLY/MONTHLY/HQ/STORE_MANAGER）
- **Acceptance**:
  - Markdown レポート生成、結論先、やるべきこと 3 つ
- **Verify**: `pnpm typecheck`

### T-034: レポートビューア + エクスポート
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-033, T-008
- **Write Scope**: `src/app/(app)/reports/page.tsx`, `src/app/(app)/reports/[id]/page.tsx`, `src/components/reports/*`, `src/app/api/reports/route.ts`, `package.json`
- **UI Model**: **Notion** ドキュメントビューア
- **Description**:
  - `pnpm add react-markdown remark-gfm`
  - `ReportMarkdownViewer.tsx`: Markdown レンダリング
  - 一覧（カード）+ 詳細（Markdown 表示+テキストコピー）
- **Acceptance**:
  - レポート一覧+見やすい Markdown 表示+コピーエクスポート
- **Verify**: `pnpm build`

### T-035: Task Agent + タスク管理 UI
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-014, T-029, T-008
- **Write Scope**: `src/lib/agents/task-agent.ts`, `src/app/(app)/tasks/page.tsx`, `src/components/tasks/*`, `src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`
- **UI Model**: **Linear** タスクリスト
  - ステータス列、優先度バッジ、期限、フィルター
- **Description**:
  - LLM で改善タスク生成（最大 5 件、優先度付き）→Task テーブル保存
  - `TaskCard.tsx`: 優先度バッジ+種別+期限+店舗
  - 状態更新 TODO→DOING→DONE
- **Acceptance**:
  - AI タスク生成+一覧表示+状態変更+優先度ソート
- **Verify**: `pnpm build`

---

## Phase 6: Scale — スケール機能

### T-036: Organization + Brand + Area 階層管理
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-002, T-006
- **Write Scope**: `src/app/api/organizations/route.ts`, `src/app/api/brands/route.ts`, `src/app/api/areas/route.ts`, `src/app/api/me/route.ts`
- **Description**:
  - Organization, Brand, Area CRUD API
  - `/api/me`: プロフィール+所属組織+ロール
  - `/api/organizations/current`: 組織情報 GET/PATCH
  - organizationId テナント分離
- **Acceptance**:
  - 階層（企業>ブランド>エリア>店舗）管理可能、テナント分離
- **Verify**: `pnpm typecheck && pnpm build`

### T-037: 多店舗ダッシュボード + StoreSwitcher
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-036, T-008
- **Write Scope**: `src/app/(app)/stores/page.tsx`, `src/components/stores/*`, `src/components/layout/StoreSwitcher.tsx`
- **UI Model**: **Stripe** アカウント切替 + **Linear** プロジェクト切替
- **Description**:
  - `StoreSwitcher.tsx`: ヘッダー内ドロップダウン（ブランド>エリア>店舗ツリー）
  - 全店舗サマリー、要注意ハイライト、ランキング（評価/口コミ/低評価率/返信漏れ）
- **Acceptance**:
  - 店舗切替で全画面データ変更、全店舗比較、要注意ハイライト
- **Verify**: `pnpm build`

### T-038: RBAC ミドルウェア
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-003, T-036
- **Write Scope**: `src/lib/auth/rbac.ts`, `src/lib/api/middleware.ts`（更新）
- **Description**:
  - OWNER/ADMIN/MANAGER/STAFF/VIEWER
  - `checkPermission()`, `withRole(requiredRole, handler)`
  - 返信投稿=MANAGER以上、組織設定=ADMIN以上
- **Acceptance**:
  - VIEWER→投稿=403、MANAGER=担当店舗のみ
- **Verify**: `pnpm typecheck`

### T-039: 監査ログシステム
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-002, T-006
- **Write Scope**: `src/lib/audit/logger.ts`, `src/app/api/audit-logs/route.ts`
- **Description**:
  - `logAudit()`: 返信案生成/修正/承認/投稿/レポート生成/権限変更/Google連携
  - AuditLog テーブル（Prisma スキーマに追加、必要なら T-002 のスキーマに含める）
  - API: GET（ADMIN 以上）
- **Acceptance**:
  - 重要操作が全ログ記録、ADMIN 以上が閲覧
- **Verify**: `pnpm typecheck && pnpm build`

### T-040: 設定ページ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-008, T-036, T-038
- **Write Scope**: `src/app/(app)/settings/*`, `src/components/settings/*`
- **UI Model**: **Notion** 設定画面（セクション分割、トグル、インライン保存）
- **Description**:
  - タブ: 店舗情報 / Google連携 / AI設定（トーン、自動返信ルール）/ 通知設定 / 組織管理 / プラン
  - ロールに応じてタブ表示/非表示
- **Acceptance**:
  - 各設定保存可能、ロール別表示制御
- **Verify**: `pnpm build`

### T-041: メール通知サービス
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-027
- **Write Scope**: `src/lib/notifications/email-service.ts`, `src/lib/notifications/templates/*`
- **Description**:
  - `pnpm add resend`
  - テンプレート: 低評価アラート / 週次レポート完成 / Google連携エラー
  - 開発時はコンソールログ（SMTP 未設定時）
- **Acceptance**:
  - 低評価→メール通知（開発=ログ出力）
- **Verify**: `pnpm typecheck`

---

## Phase 7: Go-to-Market — 商品化

### T-042: ランディングページ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-004, T-008
- **Write Scope**: `src/app/(marketing)/page.tsx`, `src/components/marketing/*`
- **UI Model**: **Intercom** LP + **Stripe** 信頼感
- **Description**:
  - ファーストビュー「月1万円でAI相棒を雇う」+CTA
  - 課題→解決→機能4つ→料金（9,800円/19,800円〜）→CTA
  - モバイルファースト、温かいデザイン
- **Acceptance**:
  - モバイルで見やすい、管理ツール感なし、CTA→ログイン遷移
- **Verify**: `pnpm build`

### T-043: オンボーディングウィザード
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-010, T-011, T-012
- **Write Scope**: `src/app/(app)/onboarding/*`, `src/components/onboarding/*`
- **UI Model**: **Stripe** オンボーディング（ステップバイステップ）
- **Description**:
  - 8 ステップ: ようこそ→GBP連携→店舗選択→業種選択→トーン選択→自動返信ルール→初回スキャン→初回診断
  - 初回ログイン時にリダイレクト
  - Google 連携後 3 分以内に初回価値提示
- **Acceptance**:
  - 新規ユーザーがスムーズに完了、口コミ同期、初回診断表示
- **Verify**: `pnpm build`

### T-044: 無料診断 + 初回レポート
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-043, T-033
- **Write Scope**: `src/app/(app)/onboarding/diagnosis/page.tsx`, `src/components/onboarding/DiagnosisReport.tsx`
- **Description**:
  - 未返信口コミ数 / 低評価一覧 / 評価変化 / AI 返信案3件プレビュー / やるべきこと3つ
  - 「使い始める」ボタンでホームへ
- **Acceptance**:
  - インパクトある初回診断、未返信+低評価強調、CTA→ホーム
- **Verify**: `pnpm build`

### T-045: 法的ページ（利用規約・プライバシー・特商法）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-004
- **Write Scope**: `src/app/(marketing)/terms/page.tsx`, `src/app/(marketing)/privacy/page.tsx`, `src/app/(marketing)/tokushoho/page.tsx`
- **Description**:
  - ドラフト版（最終的に弁護士レビュー必要）
  - 利用規約: Google API、AI 生成文責任、自動返信、禁止事項、解約、免責
  - プライバシー: Google 連携データ、口コミ、token 保管、AI 処理、第三者 API
  - 特商法: プレースホルダー
- **Acceptance**:
  - 3 ページ表示、モバイル読みやすい
- **Verify**: `pnpm build`

### T-046: ヘルプ / FAQ + 問い合わせ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-004
- **Write Scope**: `src/app/(marketing)/help/page.tsx`, `src/app/(marketing)/contact/page.tsx`, `src/app/api/contact/route.ts`
- **Description**:
  - FAQ アコーディオン 10 問、問い合わせフォーム（名前/メール/件名/本文→送信）
- **Acceptance**:
  - FAQ 表示+問い合わせ送信可能
- **Verify**: `pnpm build`

### T-047: PWA セットアップ
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-001 ✅
- **Write Scope**: `public/manifest.json`, `public/icons/*`, `src/app/layout.tsx`（更新）, `next.config.ts`（更新）
- **Description**:
  - manifest.json: theme_color=#0F766E, background_color=#FFFDF8, display=standalone
  - アイコン 192x192, 512x512（プレースホルダー）
  - layout.tsx に link rel=manifest + meta tags
- **Acceptance**:
  - PWA チェック通過、ホーム追加可能
- **Verify**: `pnpm build`

### T-048: SEO + OGP
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-042
- **Write Scope**: `src/app/(marketing)/layout.tsx`（更新）, `public/og-image.png`
- **Description**:
  - Metadata API で title/description/og:image/twitter:card
  - robots.txt, sitemap.xml
  - (app) = noindex、(marketing) = index
- **Acceptance**:
  - OGP タグ設定、SNS プレビュー表示
- **Verify**: `pnpm build`

---

## Phase 8: Quality — 品質保証

### T-049: ユニットテスト
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-017, T-018, T-005, T-007
- **Write Scope**: `src/lib/agents/__tests__/*`, `src/lib/validators/__tests__/*`, `vitest.config.ts`
- **Description**:
  - vitest.config.ts セットアップ（path alias）
  - Agent テスト（LLM モック）: Risk/Reply/Navigation
  - Validator テスト: Zod 正常/異常
  - カバレッジ: Agent 80%+, Validator 90%+
- **Acceptance**:
  - `pnpm test` 全通過
- **Verify**: `pnpm test`

### T-050: API インテグレーションテスト
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-049
- **Write Scope**: `src/app/api/**/__tests__/*`, `tests/helpers/*`
- **Description**:
  - テストヘルパー（DB setup/cleanup、認証モック）
  - Review CRUD、承認→投稿フロー、Chat→intent、Report 生成、401/403
- **Acceptance**:
  - 全 API テスト通過、認証/権限エラーカバー
- **Verify**: `pnpm test`

### T-051: E2E テスト（Playwright）
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-050
- **Write Scope**: `e2e/*`, `playwright.config.ts`, `package.json`
- **Description**:
  - `pnpm add -D @playwright/test`
  - シナリオ: LP→ログイン→オンボーディング、口コミフィルター→詳細、返信生成→承認、レポート、モバイル表示
- **Acceptance**:
  - 主要フロー E2E 通過、モバイル viewport テスト
- **Verify**: `pnpm exec playwright test`

### T-052: パフォーマンス最適化
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-042, T-024, T-020
- **Write Scope**: 各ページファイル（更新）
- **Description**:
  - ISR: LP/ヘルプ/法的ページ
  - Dynamic Import: チャート lazy loading
  - next/image 使用
  - バンドル 300kB 以下目標
  - N+1 回避、select 最適化
  - Skeleton/Suspense 全ページ
- **Acceptance**:
  - LP Lighthouse 90+、口コミ一覧初回 2 秒以内
- **Verify**: `pnpm build` → バンドルサイズ確認

### T-053: セキュリティ強化
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-038, T-039
- **Write Scope**: `src/middleware.ts`（更新）, `next.config.ts`（更新）, `src/lib/security/*`
- **Description**:
  - CSP ヘッダー、API Rate Limiting、XSS 防止
  - セキュリティヘッダー（X-Frame-Options, X-Content-Type-Options, Referrer-Policy）
  - 環境変数必須チェック（起動時）
  - LLM 送信データの個人情報最小化
- **Acceptance**:
  - セキュリティヘッダー設定、Rate Limiting 機能、環境変数不足→起動エラー
- **Verify**: `pnpm build`

### T-054: エラーバウンダリ + Loading / Empty State
- **Status**: ready
- **Owner**: Codex
- **Depends**: T-020, T-024, T-030
- **Write Scope**: `src/app/(app)/error.tsx`, `src/app/(app)/not-found.tsx`, `src/components/ui/EmptyState.tsx`, `src/components/ui/ErrorFallback.tsx`
- **Description**:
  - error.tsx: リトライ付きエラーバウンダリ
  - not-found.tsx: アイボウくん「見つかりませんでした」
  - EmptyState.tsx: データなし状態（メッセージ+CTA）
  - 全ページに loading.tsx + Empty State
- **Acceptance**:
  - エラー時フレンドリー画面、データなし時 Empty State、全ページ loading
- **Verify**: `pnpm build`

---

## 依存関係サマリー

```
Phase 0 (✅)
  T-001 ✅ ─┬─→ T-004 ───────→ T-008
             │                   ↑
             ├─→ T-002 ──→ T-003 ┘
             │     ↓
             │   T-005 ──→ T-006
             │
             └─→ T-007

Phase 2 (Google)
  T-007 ──→ T-009 ──→ T-010 ──→ T-011 ──→ T-012
                  └──→ T-013

Phase 3 (AI)
  T-005 ──→ T-014 ──→ T-015
               ↓
             T-016-B
               ↓
    T-014 + T-015 ──→ T-017 ──→ T-018
                                   ↓
                                 T-019

Phase 4 (Core UX)
  T-008 ──→ T-020 ──→ T-021 ──→ T-028
  T-014 ──→ T-022
  T-017 + T-018 + T-022 ──→ T-023
  T-012 + T-008 ──→ T-024 ──→ T-025 ──→ T-026
  T-002 + T-006 ──→ T-027

Phase 5 (Intelligence)
  T-014 ──→ T-029 ──→ T-030
  T-002 ──→ T-031 ──→ T-032
  T-029 ──→ T-033 ──→ T-034
  T-029 ──→ T-035

Phase 6 (Scale)
  T-002 ──→ T-036 ──→ T-037
  T-003 + T-036 ──→ T-038
  T-002 ──→ T-039
  T-008 + T-036 + T-038 ──→ T-040
  T-027 ──→ T-041

Phase 7 (Go-to-Market)
  T-004 ──→ T-042 ──→ T-048
  T-010 + T-011 ──→ T-043 ──→ T-044
  T-004 ──→ T-045, T-046
  T-001 ──→ T-047

Phase 8 (Quality)
  全フェーズ完了 ──→ T-049 ──→ T-050 ──→ T-051
  T-042 + T-024 ──→ T-052
  T-038 + T-039 ──→ T-053
  T-020 + T-024 ──→ T-054
```

---

## 並行実行可能グループ

| Group | Tasks | Condition |
|-------|-------|-----------|
| A | T-002, T-004, T-007 | T-001 完了後すぐ着手可 |
| B | T-005, T-014 | T-002 完了後 |
| C | T-009, T-013 | T-007 完了後 |
| D | T-017, T-018 | T-014 + T-015 完了後 |
| E | T-024, T-020 | T-008 完了後（UI 別ページ）|
| F | T-029, T-031, T-036 | Phase 3 完了後 |
| G | T-042, T-045, T-046, T-047 | T-004 完了後（マーケ系独立）|

---

## Human タスク

| ID | Task | When |
|---|---|---|
| H-001 | Google Cloud OAuth 同意画面の本番申請 | Phase 2 後 |
| H-002 | 法的文書の弁護士レビュー | T-045 後 |
| H-003 | Vercel 環境変数設定（本番シークレット）| デプロイ前 |
| H-004 | ドメイン設定 + SSL | デプロイ前 |
| H-005 | Supabase 本番 DB | 商用運用移行時 |
| H-006 | 有料 LLM API キー取得 | 商用運用移行時 |
| H-007 | メール送信サービス設定 | T-041 テスト時 |
| H-008 | OG 画像 / アイコン正式デザイン | T-047, T-048 前 |

---

## Blockers (Resolved)
| ID | Task | Blocker | Resolution |
|---|---|---|---|
| ~~B001~~ | ~~T-016~~ | ~~Google Cloud OAuth 設定未完了~~ | ~~解決 2026-05-31~~ |
