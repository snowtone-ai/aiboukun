# decisions.md -- Permanent Decisions

## D001: フロントエンドフレームワーク = Next.js App Router
- Date: 2026-05-31
- Decision: Next.js App Router + TypeScript + Tailwind CSS + shadcn/ui
- Reason: フルスタック(SSR/SSG/API Routes)を一元管理、PWA対応しやすい、shadcn/uiで高品質UIを素早く構築できる
- Alternative considered: Remix, Vite+React
- Rejected because: Next.jsはGCP/Vercel両対応でデプロイ先柔軟性が高い

## D002: バックエンド = Next.js Route Handlers (not NestJS)
- Date: 2026-05-31
- Decision: Next.js Route Handlers を使用。NestJSは使わない（MVP段階）
- Reason: コードベースを1リポジトリに集約しトークン消費を抑える。スケールアウト必要時はNestJSに分離可能
- Escalation condition: API複雑度が増大し Route Handlers では管理困難になった場合に再検討

## D003: ORM = Prisma + PostgreSQL
- Date: 2026-05-31
- Decision: Prisma ORM + PostgreSQL
- Reason: TypeScriptとの親和性が高い。マイグレーション管理が明確。テナント分離もRow Level Securityで対応可
- Note: 開発時はローカルPostgreSQL or Supabase無料枠を使用

## D004: 認証 = Auth.js + Google OAuth
- Date: 2026-05-31
- Decision: Auth.js (NextAuth v5) + Google OAuth
- Reason: Google Business Profile APIへのOAuth連携が必須であり、Auth.jsはGoogle providerを標準サポート
- Security note: OAuthトークンはDB暗号化保存必須

## D005: AI Provider = Gemini API（開発時）/ LLM Provider Adapter（商用時）
- Date: 2026-05-31
- Decision: 開発時はGemini API無料枠。LLM Provider Adapterで抽象化し商用時に有料API切替
- Reason: 追加金銭コスト0制約。ベンダーロックイン回避
- Adapter interface: LLMProvider { generateText, generateJson<T>, classify }

## D006: Human-in-the-loop 承認ルール
- Date: 2026-05-31
- Decision: 星1〜3、医療/法務/炎上/個人情報/返金/事故リスクフラグ付き口コミへの返信は自動投稿禁止
- Reason: ブランドリスク・法務リスク回避。一度投稿したGoogle口コミ返信は削除が難しい
- Auto-reply allowed: 星5短文定型返信のみ（設定でON/OFFできる）

## D007: テナント分離方針
- Date: 2026-05-31
- Decision: 全クエリに organization_id フィルタを必須とする。RLS候補
- Reason: 多店舗SaaSとして他社データへのアクセスを絶対に防ぐ

## D008: 技術スタック追加コスト0制約
- Date: 2026-05-31
- Decision: 開発・検証フェーズは無料枠中心で進める
- Constraint: Claude Pro / ChatGPT Plus は開発支援には使えるが、顧客向けSaaSの裏側APIとして直接使う前提にはしない
- Escalation: 商用運用時に正式有料APIへ切替

## D009: ホスティング = Vercel
- Date: 2026-05-31
- Decision: Vercel にデプロイ。GitHub: snowtone-ai/aiboukun リポジトリと連携済み
- Reason: Next.jsとの親和性が最高。プレビューデプロイ・環境変数管理が容易
- Note: Vercel環境変数に本番用シークレットを設定する

## D010: DB = ローカルDocker（開発）→ Supabase（商用）
- Date: 2026-05-31
- Decision: 開発時はDockerローカルPostgreSQL。商用時はSupabaseに移行
- Migration: .env.local の DATABASE_URL 変更 + `prisma migrate deploy` のみで移行可
- Reason: Prismaを使うためスキーマ再作成不要。pg_dumpでデータ移行可

## D011: 対応業種MVP = デフォルトパック（飲食・美容室等）
- Date: 2026-05-31
- Decision: MVP段階は医療・美容クリニック等の特殊パックを除いた「デフォルトパック」のみ実装
- Default pack対象: 飲食、美容室、整体・接骨院、小売・サービス業
- Deferred: 歯科・美容クリニック・ホテルの専用パック（医療広告ガイドライン対応が必要なため後回し）
- Reason: 法務リスク対応を後回しにすることで開発速度を優先

## D012: UI言語 = 日本語のみ
- Date: 2026-05-31
- Decision: UI・コピー・通知・レポートすべて日本語のみ
- Deferred: 英語・多言語対応は事業拡大時に検討

## D013: Auth.js v5 は beta 明示、Edge 入口保護は proxy.ts
- Date: 2026-05-31
- Decision: npm の `next-auth@5` stable tag は未提供のため `next-auth@5.0.0-beta.31` を明示採用。Next.js 16 では `src/proxy.ts` で `/app/*` の入口保護を行う。
- Reason: タスク指定は NextAuth v5。DB session の検証はサーバー側 `auth()` / API middleware で行い、Edge Runtime の proxy には Prisma を持ち込まない。
- Security note: proxy はセッションCookie有無による入口制御のみ。認可判断と organizationId 注入は Route Handler 側で必ず行う。

## D014: Google Business Profile adapter は fetch ベース
- Date: 2026-05-31
- Decision: `googleapis` SDK 依存を追加せず、`src/lib/google/gbp-client.ts` で fetch ベースの薄い adapter を実装する。
- Reason: ネットワーク制限下で依存追加を避け、既存の暗号化・レート制御・監査ログと小さく統合するため。
- Review note: GBP API path/response shape と OAuth refresh flow はクロスベンダーレビューおよび実Google環境で確認する。

## D015: Playwright E2E はシナリオ整理まで
- Date: 2026-05-31
- Decision: 現環境では Playwright 依存を追加せず、`e2e/README.md` に主要E2Eシナリオを整理する。
- Reason: restricted network で依存追加が不確実。typecheck/lint/test/build を壊さず、依存導入可能環境で自動化できる受け入れシナリオを残す。

## D016: セキュリティレビュー是正方針
- Date: 2026-05-31
- Decision: OAuth トークン保存は Auth.js のサーバー側 callback だけに限定し、クライアント token POST は廃止。GoogleConnection は暗号化保存し、Auth.js Account の OAuth token 列は保存しない。
- Decision: 返信投稿は ReplyDraft.status を `APPROVED` から `POSTING` へ CAS 更新してから GBP API を呼び、並行投稿と承認取消レースを防ぐ。
- Decision: GBP 接続/同期 API は RBAC を追加し、ロケーション紐付けは ADMIN 以上、アカウント/ロケーション取得と同期は MANAGER 以上に制限する。
- Decision: AIStyleMemory は PII らしきフレーズを保存せず、TTL と store 単位の一意制約で肥大化を抑える。
- Decision: DB には最低限の RLS policy を追加する。ただし Prisma アプリ接続ユーザーの完全な FORCE RLS 運用は、本番 DB ロール設計と `app.organization_id` セッション変数適用の検証後に切り替える。
- Reason: レビューで指摘された即時修正可能な security / reliability リスクを、既存設計を壊さない最小差分で閉じるため。

## D017: 大規模初期実装差分の扱い
- Date: 2026-05-31
- Decision: 初期実装一式とセキュリティレビュー是正を同一履歴として commit する。
- Reason: 既存ワークツリーは全タスク実装済みだが未コミットで、ユーザー依頼がレビュー是正後の履歴化と push までを含んでいるため。機能単位の追跡は `tasks.md`、構造把握は `docs/repo-map.md`、リスク判断は本ファイルに分離して残す。
