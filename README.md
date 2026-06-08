# アイボウくん

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-darkblue?logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

> Googleマップの口コミ対応を、月1万円のAI担当者が代わりにこなすSaaS

個人店から多店舗チェーンまで、Googleマップの口コミ返信・低評価検知・競合比較・レポート作成をAIが担当します。スタッフが行っていた手間のかかる口コミ管理業務を自動化し、営業・マーケティング担当者の時間を解放します。

---

## 主な機能

- Googleの口コミに対してAIが返信案を生成し、人が確認・承認してからGoogleに投稿できる
- 低評価（星1〜3）や法的リスクのある口コミを自動検知してアラートを出せる
- テキストまたは音声でチャット操作し、レポート表示・口コミ管理などの主要操作が完結できる
- 企業・ブランド・エリア・店舗の階層で複数店舗をまとめて管理・比較できる
- 週次・月次レポートを自動生成・エクスポートできる

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | Next.js 16, Tailwind CSS, shadcn/ui |
| バックエンド | Next.js API Routes, Prisma 7 |
| データベース | PostgreSQL |
| インフラ | Vercel |
| AI / 外部連携 | Gemini API, Google Business Profile API, Google OAuth |

---

## 設計の工夫

- 複数のAIエージェント（返信生成・リスク検知・競合分析・レポートなど）を役割ごとに分割し、オーケストレーター（指揮役）が連携を制御する設計
- 星1〜3の低評価口コミや法的リスクがある返信は絶対に自動投稿しない安全設計（必ず人の承認が必要）
- 組織IDによるテナント分離（データ分離）を全クエリで強制し、他社のデータが混入しない構造

---

## セットアップ

必要なツール：Node.js 20以上、pnpm、PostgreSQL

```bash
# 依存パッケージのインストール
pnpm install

# 環境変数ファイルの作成
cp .env.example .env.local
# .env.local を編集（DATABASE_URL、NEXTAUTH_SECRET、Google OAuth、Gemini APIキーなど）

# データベースのセットアップ
npx prisma migrate dev
npx prisma db seed

# 開発サーバーの起動
pnpm dev
```

起動後は `http://localhost:3000` にアクセスしてください。

| コマンド | 内容 |
|---|---|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | 本番ビルド |
| `pnpm test` | ユニットテスト実行 |
| `pnpm lint` | コード品質チェック |
| `pnpm typecheck` | 型チェック |

---

## ライセンス

MIT
