# Repo Map

## Purpose
アイボウくん — Google口コミ管理SaaS。Next.js App Router フルスタック (Web+PWA)。Phase 0 完了、Phase 1 着手待ち。

## Read First
1. `docs/state.md` — 現在フェーズ・ブロッカー・次タスク
2. `tasks.md` — 実行台帳（owner/scope/acceptance/evidence）
3. `docs/decisions.md` — 技術選択の根拠（D001–D012）

## Architecture
- **UI**: Next.js App Router (`src/app/`) + Tailwind CSS + shadcn/ui (T-004 待ち)
- **Routing**: `src/app/(app)/` = 認証済み、`src/app/(marketing)/` = LP (未作成)
- **API**: `src/app/api/` Route Handlers (未作成)
- **Domain**: `src/agents/` AIエージェント群 (未作成)
- **Data**: Prisma + PostgreSQL → `prisma/schema.prisma` (T-002 待ち)
- **External**: Google Business Profile API, Google OAuth (Auth.js T-003), Gemini API (T-006)
- **Config**: `next.config.ts`, `tsconfig.json`, `.env.local` (never commit)
- **Tests**: `src/**/__tests__/` または `tests/` (未作成)

## Key Areas
| Area | Start Here | Verify |
|---|---|---|
| 現状ファイル | `src/app/layout.tsx` | `pnpm build` |
| DB スキーマ | `prisma/schema.prisma` (T-002後) | `prisma migrate dev` |
| 認証 | `src/lib/auth.ts` (T-003後) | `src/middleware.ts` |
| AI エージェント | `src/agents/` (T-008後) | `pnpm test agents` |
| LLM 抽象層 | `src/lib/llm/` (T-006後) | interface: generateText/generateJson/classify |
| Google API | `src/lib/google-business/` (T-010後) | `pnpm test:integration google` |
| タスク計画 | `tasks.md` | `docs/state.md` |

## Critical Flows
| Flow | Entry | Core Path | Risk |
|---|---|---|---|
| Google OAuth | `src/app/api/auth/[...nextauth]/route.ts` | Auth.js → Prisma → Session | high — token 暗号化必須 (D004) |
| 口コミ返信 | `src/agents/ReviewReplyAgent.ts` | LLM → human approval → GBP API | high — 1-3星は自動投稿禁止 (D006) |
| リスク検知 | `src/agents/RiskDetectionAgent.ts` | LLM classify → flag | med |
| テナント分離 | 全 DB クエリ | `organization_id` フィルタ必須 (D007) | high |
| レポート生成 | `src/agents/ReportAgent.ts` | LLM → PDF/HTML | low |

## Change Routes
| Change Type | Start Here | Then Check |
|---|---|---|
| UI 画面 | `src/app/(app)/[page]/page.tsx` | `src/components/`, `pnpm build` |
| API | `src/app/api/[route]/route.ts` | 対応 agent/service, tests |
| DB/schema | `prisma/schema.prisma` | `prisma/migrations/`, 型定義, RLS |
| Auth/security | `src/lib/auth.ts` | `src/middleware.ts`, token 暗号化 |
| AI エージェント | `src/agents/[Name]Agent.ts` | `src/lib/llm/`, human-approval ルール |
| Config/env | `.env.example` | `docs/decisions.md` D008/D009 |

## Do Not Read First
- `.next/` — ビルド生成物
- `node_modules/` — pnpm 管理
- `pnpm-lock.yaml` — 自動生成
- `context/` — 初期要件ドキュメント（decisions.md に要点転記済み）
- `HANDOFF-JA.md` — セッション引継ぎ（最新 state.md を優先）

## Agent Rule
このファイルを最初に読む。次に `docs/state.md` → `tasks.md` の順。対象ファイルが不明な場合のみ CodeGraph または grep で補完。不要な広範探索をしない。
