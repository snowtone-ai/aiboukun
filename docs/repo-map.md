# Repo Map

## Purpose
アイボウくん — Google口コミ管理SaaS。Next.js App Router フルスタック (Web+PWA)。Prisma / shadcn/ui / Auth.js / API基盤 / LLM基盤 / 主要AIエージェント / Google Business Profile adapter / RBAC / 監査 / マーケLP / オンボーディング / SEO/PWA まで完了。

## Read First
1. `docs/state.md` — 現在フェーズ・ブロッカー・次タスク
2. `tasks.md` — 実行台帳（owner/scope/acceptance/evidence）
3. `docs/decisions.md` — 技術選択の根拠（D001–D012）

## Architecture
- **UI**: Next.js App Router (`src/app/`) + Tailwind CSS v4 + shadcn/ui (`src/components/ui/`)
- **Routing**: `src/app/(app)/app/` = 認証済み `/app` 配下、`src/app/(marketing)/` = LP (未作成)、`src/proxy.ts` で `/app/*` を入口保護
- **API**: `src/app/api/` Route Handlers、共通レスポンス/エラー/ミドルウェアは `src/lib/api/`
- **Domain**: `src/types/domain.ts` 共有型、`src/lib/validators/` Zod スキーマ、AIエージェント群は `src/lib/agents/`
- **App Shell**: `src/components/layout/`、ホーム/チャット UI は `src/components/aibou/`, `src/components/chat/`
- **Core Screens**: `src/app/(app)/app/reviews|analytics|competitors|reports|tasks|stores|settings|onboarding`、対応コンポーネントは `src/components/{reviews,analytics,competitors,reports,tasks,stores,settings,notifications,onboarding}/`
- **Marketing**: `src/app/(marketing)/` = LP/FAQ/contact/legal pages、`src/components/marketing/`
- **Data**: Prisma + PostgreSQL → `prisma/schema.prisma`, `prisma.config.ts`, `src/lib/prisma/client.ts`
- **External**: Google Business Profile API adapter (`src/lib/google/`), Google OAuth/Auth.js (`src/lib/auth.ts`), Gemini API adapter (`src/lib/llm/`), email sender (`src/lib/notifications/email-service.ts`)
- **Config**: `next.config.ts`, `tsconfig.json`, `.env.local` (never commit)
- **Tests**: `src/**/__tests__/` または `tests/`。現在 `src/lib/crypto/__tests__/token-encryption.test.ts`。

## Key Areas
| Area | Start Here | Verify |
|---|---|---|
| 現状ファイル | `src/app/layout.tsx`, `src/app/(app)/app/page.tsx` | `pnpm build` |
| DB スキーマ | `prisma/schema.prisma` (T-002後) | `prisma migrate dev` |
| 認証 | `src/lib/auth.ts` | `src/proxy.ts`, `/api/auth/[...nextauth]` |
| AI エージェント | `src/lib/agents/`, Orchestrator は `src/lib/agents/orchestrator.ts` | `pnpm test` |
| LLM 抽象層 | `src/lib/llm/` (T-014後) | interface: generateText/generateJson/classify |
| Google API | `src/lib/google/` | `pnpm typecheck`, `pnpm test` |
| タスク計画 | `tasks.md` | `docs/state.md` |

## Critical Flows
| Flow | Entry | Core Path | Risk |
|---|---|---|---|
| Google OAuth | `src/app/api/auth/[...nextauth]/route.ts` | Auth.js server callback → encrypted GoogleConnection → Session | high — token 暗号化必須、client token POST 禁止 (D004/D016) |
| 口コミ返信 | `src/agents/ReviewReplyAgent.ts` | LLM → human approval → GBP API | high — 1-3星は自動投稿禁止 (D006) |
| リスク検知 | `src/agents/RiskDetectionAgent.ts` | LLM classify → flag | med |
| テナント分離 | 全 DB クエリ | `organization_id` フィルタ必須 (D007) | high |
| チャット依頼 | `src/app/api/chat/route.ts` | Chat UI → `/api/agents` → AgentOrchestrator → AgentAction | med |
| 口コミ確認 | `src/app/(app)/app/reviews/` | Prisma Review → detail → ReplyDraft approval | high — Google投稿は未接続、承認必須 |
| Google同期 | `/api/google/sync` | GBP adapter → Review upsert → Store.nextSyncAt | high — token復号/tenant分離 |
| Google返信投稿 | `/api/reply-drafts/[id]/post` | RBAC → approval → risk/rating gate → GBP adapter → audit | high — 1-3星/高リスク自動投稿禁止 |
| 分析/レポート | `src/app/(app)/app/analytics`, `src/app/api/reports/generate/route.ts` | Review集計 → Insight/Report表示 | med |
| レポート生成 | `src/lib/agents/report-agent.ts` | LLM → Markdown | low |
| 設定/RBAC | `/app/settings`, `/api/settings` | session.role → ADMIN以上保存 | high |

## Change Routes
| Change Type | Start Here | Then Check |
|---|---|---|
| UI 画面 | `src/app/(app)/app/[page]/page.tsx` | `src/components/`, `pnpm build` |
| API | `src/app/api/[route]/route.ts`, `src/lib/api/` | 対応 agent/service, tests, organizationId 条件 |
| DB/schema | `prisma/schema.prisma` | `prisma/migrations/`, 型定義, RLS |
| Auth/security | `src/lib/auth.ts` | `src/proxy.ts`, token 暗号化, Auth.js session callback |
| AI エージェント | `src/lib/agents/[name].ts` | `src/lib/llm/`, human-approval ルール |
| Config/env | `.env.example` | `docs/decisions.md` D008/D009 |
| 共有型/Validator | `src/types/domain.ts`, `src/lib/validators/` | `pnpm typecheck` |
| Marketing/SEO/PWA | `src/app/(marketing)/`, `public/manifest.json`, `src/app/robots.ts`, `src/app/sitemap.ts` | `pnpm build` |

## Do Not Read First
- `.next/` — ビルド生成物
- `node_modules/` — pnpm 管理
- `pnpm-lock.yaml` — 自動生成
- `context/` — 初期要件ドキュメント（decisions.md に要点転記済み）
- `HANDOFF-JA.md` — セッション引継ぎ（最新 state.md を優先）

## Agent Rule
このファイルを最初に読む。次に `docs/state.md` → `tasks.md` の順。対象ファイルが不明な場合のみ CodeGraph または grep で補完。不要な広範探索をしない。
