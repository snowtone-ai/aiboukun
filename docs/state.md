# state.md

## Current
- Branch: main
- Active task: なし（tasks.md の実装タスクは全完了。外部レビュー/Humanタスクのみ残）
- Current executor: none
- Write lock: none
- Coordinator: Claude Code (CEO Agent)
- Latest verification pointer: Security review remediation done by Codex (2026-05-31)
- Verification mode: standard

## Completed
- T-001: Next.js プロジェクト初期化 ✅ (2026-05-31)
- T-002: Prisma スキーマ + PostgreSQL セットアップ ✅ (2026-05-31)
- T-004: shadcn/ui + Tailwind v4 テーマ設定 ✅ (2026-05-31)
- T-005: 共有 TypeScript 型 + Zod スキーマ ✅ (2026-05-31)
- T-006: API ユーティリティ + エラーハンドリング ✅ (2026-05-31)
- T-007: OAuth トークン暗号化ユーティリティ ✅ (2026-05-31)
- T-003: Auth.js (NextAuth v5 beta) + Google OAuth ✅ (2026-05-31)
- T-014: LLM Provider Adapter（インターフェース + Gemini）✅ (2026-05-31)
- T-015: プロンプトテンプレート ✅ (2026-05-31)
- T-016-B: LLM 使用ログ ✅ (2026-05-31)
- T-017: Risk Detection Agent ✅ (2026-05-31)
- T-018: Review Reply Agent ✅ (2026-05-31)
- T-022: Navigation Agent ✅ (2026-05-31)
- T-029: Insight Agent ✅ (2026-05-31)
- T-031: 競合管理 CRUD ✅ (2026-05-31)
- T-036: Organization + Brand + Area 階層管理 ✅ (2026-05-31)
- T-008: アプリシェル（レイアウト・ナビゲーション）✅ (2026-05-31)
- T-020: ホーム / AI 司令室 UI ✅ (2026-05-31)
- T-021: チャットインターフェース ✅ (2026-05-31)
- T-023: Agent Orchestrator ✅ (2026-05-31)
- T-024: 口コミ一覧ページ + フィルター ✅ (2026-05-31)
- T-025: 口コミ詳細 + 返信エディタ ✅ (2026-05-31)
- T-027: アプリ内通知システム ✅ (2026-05-31)
- T-028: 音声入力（Web Speech API）✅ (2026-05-31)
- T-030: 分析ダッシュボード ✅ (2026-05-31)
- T-032: Competitor Agent + 比較 UI ✅ (2026-05-31)
- T-033: Report Agent（週次/月次レポート）✅ (2026-05-31)
- T-034: レポートビューア + エクスポート ✅ (2026-05-31)
- T-035: Task Agent + タスク管理 UI ✅ (2026-05-31)
- T-037: 多店舗ダッシュボード + StoreSwitcher ✅ (2026-05-31)
- T-054: エラーバウンダリ + Loading / Empty State ✅ (2026-05-31)
- T-016: .env.local 設定 ✅ (2026-05-31)
- B001: Google OAuth 設定 ✅ (2026-05-31)
- T-009: Google Business Profile API アダプター ✅ (2026-05-31)
- T-010: Google OAuth 接続管理 API ✅ (2026-05-31)
- T-011: Store ↔ GBP ロケーション紐付け API ✅ (2026-05-31)
- T-012: 口コミ同期エンジン ✅ (2026-05-31)
- T-013: Google API レートリミッター + コールログ ✅ (2026-05-31)
- T-019: Memory Agent ✅ (2026-05-31)
- T-026: 返信承認 + Google 投稿フロー ✅ (2026-05-31)
- T-038: RBAC ミドルウェア ✅ (2026-05-31)
- T-039: 監査ログシステム ✅ (2026-05-31)
- T-040: 設定ページ ✅ (2026-05-31)
- T-041: メール通知サービス ✅ (2026-05-31)
- T-042: ランディングページ ✅ (2026-05-31)
- T-043: オンボーディングウィザード ✅ (2026-05-31)
- T-044: 無料診断 + 初回レポート ✅ (2026-05-31)
- T-045: 法的ページ ✅ (2026-05-31)
- T-046: ヘルプ / FAQ + 問い合わせ ✅ (2026-05-31)
- T-047: PWA セットアップ ✅ (2026-05-31)
- T-048: SEO + OGP ✅ (2026-05-31)
- T-049: ユニットテスト ✅ (2026-05-31)
- T-050: API インテグレーションテスト ✅ (2026-05-31)
- T-051: E2E テスト整理 ✅ (2026-05-31; Playwright自動実行は依存導入環境で拡張)
- T-052: パフォーマンス最適化 ✅ (2026-05-31)
- T-053: セキュリティ強化 ✅ (2026-05-31)
- Security review remediation: OAuth token POST 廃止、Auth.js Account token 平文保存抑止、GBP API RBAC、返信投稿 CAS lock、CSP/HSTS、RLS policy、PII memory filter、監査ログ pagination、同期 page cap ✅ (2026-05-31)

## Current Blocker
- `.env.local` の既存 `DATABASE_URL` はローカル 5432 の PostgreSQL 認証に失敗する。Codex 検証では別途 `localhost:55432` の開発用 PostgreSQL を起動して migrate/seed 済み。

## Next
- 次に必要: Playwright依存導入可能環境でのE2E自動化、本番Google OAuth/法務/本番環境変数、分散Rate Limiter用KV/Redis、Prisma FORCE RLS本番運用設計などHuman/Infraタスク。
- Google投稿はMANAGER以上、人の承認、星4-5かつ高リスクでない返信案のみGBP adapterで投稿する。星1-3/LEGAL/MEDICAL/PRIVACY/SAFETYは自動投稿禁止。
- T-003/T-009/T-010/T-012/T-014/T-017/T-018/T-020/T-021/T-023-T-026/T-030-T-040/T-053 は auth/security/DBアクセス/API接続/新規外部APIのため、別ベンダーによるまとめレビューが必要。
- 全 54 タスクの詳細は tasks.md を参照
