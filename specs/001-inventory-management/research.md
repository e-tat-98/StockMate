# Research: 在庫管理アプリ（StockMate）

**Branch**: `001-inventory-management` | **Date**: 2026-05-10

---

## 1. 認証ライブラリ

**Decision**: Auth.js v5（NextAuth v5）+ Credentials Provider（email/password）

**Rationale**:
- Next.js App Router と公式統合されており、セットアップが最も簡単
- Credentials Provider でメール・パスワード認証を実装できる
- セッションは JWT または DB セッション両対応。今回は DB セッション（PostgreSQL）を使用
- 将来的に OAuth（Google 等）追加が容易

**Alternatives considered**:
- Clerk: 認証 UI ごと提供されるが有料プランに依存しやすい。過剰
- Supabase Auth: Supabase のデータベースと密結合になる。今回は Prisma + Neon を使うため不採用
- 自前実装: bcrypt + JWT 管理のコスト大。ライブラリ採用が妥当

---

## 2. ORM / データベースクライアント

**Decision**: Prisma 5

**Rationale**:
- TypeScript との相性が最も良く、型安全なクエリが自動生成される
- マイグレーション管理が組み込まれており、スキーマ変更が追跡可能
- Vercel + PostgreSQL（Neon）との組み合わせが公式ドキュメントで推奨されている
- Auth.js の Prisma Adapter が公式提供されており、認証テーブルの管理が自動化される

**Alternatives considered**:
- Drizzle ORM: 軽量で高速だが、まだ成熟度がやや低い。Auth.js との公式 adapter もある
- raw `pg`: 型安全性がなく保守コストが高い。不採用

---

## 3. PostgreSQL ホスティング（Vercel 向け）

**Decision**: Neon（Serverless PostgreSQL）

**Rationale**:
- Vercel Marketplace から直接プロビジョニング可能
- Serverless Driver が提供されており、Vercel Edge Functions / Serverless Functions と相性良好
- 無料プランで個人・家族ユースに十分なスペック（0.5 GB storage, 計算時間制限あり）
- Prisma との組み合わせが公式ドキュメントで推奨されている

**Alternatives considered**:
- Supabase: 機能が豊富だが、Auth や Storage など不要な機能が多い
- Railway: シンプルだが Vercel 統合が Neon ほどではない
- PlanetScale（MySQL）: PostgreSQL 指定のため不採用

---

## 4. データフェッチ・キャッシュ戦略

**Decision**: TanStack Query v5（React Query）

**Rationale**:
- クライアントサイドのデータ取得・キャッシュ・楽観的更新・ローディング状態管理を一括処理
- `isFetching` 状態でスケルトン表示のトリガーが自然に実装できる
- 在庫数の±調整で楽観的更新（Optimistic Update）を使い即座にUIを反映できる（SC-003 達成）
- Mutation 後の自動再フェッチで常備品→買い物リスト自動追加の整合性を維持できる

**Alternatives considered**:
- SWR: 軽量だが楽観的更新の実装が TanStack Query より複雑
- Next.js Server Actions + `useOptimistic`: App Router ネイティブだが、複雑な状態管理には TanStack Query が有利
- 状態管理なし（fetch のみ）: スケルトン・楽観的更新の実装が煩雑になる

---

## 5. スワイプジェスチャー

**Decision**: `react-swipeable`

**Rationale**:
- 軽量（~3KB gzip）でモバイルブラウザのタッチイベントを正確に処理
- 閾値・速度・方向の設定が柔軟で、誤検知を防げる
- TypeScript 型定義が組み込み
- デスクトップではボタン UI に切り替えるため（`md:` breakpoint）、ライブラリの依存は許容範囲

**Alternatives considered**:
- `@use-gesture/react`: 高機能だが今回の用途には過剰
- Framer Motion: アニメーションも含めた実装が可能だが、バンドルサイズが大きい
- 自前実装: touch イベントのハンドリングは edge case が多く、既存ライブラリが安全

---

## 6. PWA 実装

**Decision**: `@serwist/next`（serwist の Next.js プラグイン）

**Rationale**:
- `next-pwa` は現在メンテナンス停止。serwist はそのフォーク版で Next.js 14/15 対応
- Service Worker のキャッシュ戦略を設定でき、静的アセットのキャッシュで起動速度向上（SC-005）
- v1 ではオフライン動作は不要なため、`NetworkFirst` 戦略で実装しシンプルに保つ
- Web App Manifest の設定で `display: "standalone"` を指定してアプリ様起動を実現

**Alternatives considered**:
- `next-pwa`（@ducanh2912/next-pwa）: community fork は存在するが serwist の方がメンテ状況良好
- 手動 Service Worker: 複雑で保守コスト大。ライブラリ採用が妥当

---

## 7. インクリメンタルサーチの実装方針

**Decision**: クライアントサイドフィルタリング（在庫一覧のみ）+ デバウンス不要

**Rationale**:
- 在庫一覧: 家族規模では数十〜数百件程度。全件取得後にクライアントでフィルタリングすれば SC-002（500ms以内）を達成可能
- 品目入力サジェスト（登録画面）: `/api/inventory/suggestions?q=` に対して `useQuery` でフェッチ。デバウンス 300ms を設定
- サーバー側検索（DB LIKE クエリ）は件数が増えた場合の将来対応

**Alternatives considered**:
- サーバーサイドリアルタイム検索: APIリクエストが毎キー入力で発生し、Vercel の呼び出し回数が増加。現スケールでは不要

---

## 8. 自動追加ロジック（常備品 × 在庫0 → 買い物リスト）

**Decision**: API サーバーサイドで `PATCH /api/inventory/:id` の処理内にトランザクションで実装

**Rationale**:
- 在庫更新と買い物リスト追加をアトミックに処理し、整合性を保証（Prisma transaction）
- クライアント側で Mutation 後に ShoppingList クエリを `invalidateQueries` して即反映
- 重複チェック: `ShoppingListItem` の `name` + `isPurchased=false` で UNIQUE 的に確認（DB UNIQUE 制約は張らず、アプリロジックで制御）

---

## 解決済みの NEEDS CLARIFICATION

| 項目 | 決定 |
|------|------|
| 認証・複数ユーザー対応 | Auth.js v5 + email/password。同一アカウントを家族で共有（同一 userId のデータが共有） |
| 期限警告閾値 | 7日以内（Spec で決定済み） |
| オフライン対応 | v1 スコープ外。ホーム画面追加のみ |
