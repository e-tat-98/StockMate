# StockMate

食品・日用品の在庫と買い物リストをまとめて管理する、スマホ向けの Web アプリ（PWA）。

**サイト:** https://stock-mate-sigma.vercel.app

## 主な機能

- **在庫管理**: 品目・数量・カテゴリを登録し、一覧で ＋ / − ボタンから数量を調整する
- **検索・絞り込み**: 品目名のインクリメンタルサーチと、カテゴリでのフィルタ
- **買い物リスト**: チェックリスト形式で管理。手動追加・削除のほか、在庫一覧のカートボタンから追加できる
- **常備品の自動補充**: 常備品フラグを付けた在庫が 0 になると、買い物リストに自動で追加される（重複はしない）
- **在庫との同期**: 在庫から追加した買い物リストのアイテムにチェックを入れると在庫が +1、外すと −1 される
- **PWA**: ホーム画面に追加してアプリのように使える

## 技術構成

| | |
|---|---|
| フレームワーク | [Next.js 16](https://nextjs.org/)（App Router） / React 19 |
| 言語 | TypeScript |
| スタイル | [Tailwind CSS 4](https://tailwindcss.com/) |
| データ取得 | [TanStack Query v5](https://tanstack.com/query) |
| フォーム | React Hook Form + Zod |
| 認証 | [Auth.js v5](https://authjs.dev/)（メールアドレス + パスワード、JWT セッション） |
| DB / ORM | PostgreSQL（[Neon](https://neon.tech/)） / [Prisma 7](https://www.prisma.io/)（`@prisma/adapter-pg`） |
| PWA | [Serwist](https://serwist.pages.dev/) |
| ホスティング | [Vercel](https://vercel.com/) |
| パッケージマネージャ | npm |

## ディレクトリ構成

```
.
├── prisma/
│   ├── schema.prisma          # DB スキーマ
│   └── migrations/            # マイグレーション
├── public/
│   ├── manifest.json          # PWA マニフェスト
│   └── icons/                 # PWA アイコン
├── specs/                     # 機能ごとの仕様・計画（Spec Kit）
├── src/
│   ├── app/
│   │   ├── (auth)/            # ログイン・サインアップ画面
│   │   ├── (protected)/       # ログイン必須の画面（在庫一覧・在庫登録・買い物リスト）
│   │   └── api/               # Route Handlers（REST API）
│   ├── components/            # UI コンポーネント（inventory / shopping-list / ui）
│   ├── lib/
│   │   ├── auth.ts            # Auth.js の設定
│   │   ├── db.ts              # Prisma クライアント
│   │   ├── hooks/             # TanStack Query のカスタムフック
│   │   └── validations/       # Zod スキーマ
│   ├── proxy.ts               # 未ログイン時のリダイレクト（旧 middleware）
│   ├── sw.ts                  # Service Worker のソース
│   └── types/
├── next.config.ts
└── prisma.config.ts
```

## 画面

| パス | 内容 |
|---|---|
| `/login` | ログイン |
| `/signup` | アカウント作成 |
| `/inventory` | 在庫一覧（`/` はここにリダイレクト） |
| `/inventory/new` | 在庫登録 |
| `/shopping-list` | 買い物リスト |

未ログインで `/login`・`/signup` 以外を開くと `/login` に、ログイン済みで `/login`・`/signup` を開くと `/inventory` にリダイレクトされる（`src/proxy.ts`）。

## API

`/api/auth/*` 以外はすべてログインが必要で、未ログインだと `401` を返す。データはログイン中のユーザーのものだけが対象になる。

| メソッド | パス | 内容 |
|---|---|---|
| `POST` | `/api/auth/signup` | ユーザー登録（パスワードは 8 文字以上） |
| `GET` / `POST` | `/api/inventory` | 在庫一覧の取得 / 在庫の登録 |
| `PATCH` / `DELETE` | `/api/inventory/[id]` | 在庫の更新 / 削除 |
| `GET` | `/api/inventory/suggestions?q=` | 品目名のサジェスト（最大 10 件） |
| `GET` / `POST` | `/api/categories` | カテゴリ一覧の取得 / 作成 |
| `GET` / `POST` | `/api/shopping-list` | 買い物リストの取得 / 追加 |
| `PATCH` / `DELETE` | `/api/shopping-list/[id]` | 購入済みフラグの切り替え / 削除 |

在庫登録時のカテゴリは名前で指定し、同名のカテゴリがなければ新規作成される。

## データモデル

| モデル | 内容 |
|---|---|
| `User` | ユーザー（パスワードは bcrypt でハッシュ化） |
| `Category` | カテゴリ。`isPreset: true` は全ユーザー共通、それ以外はユーザーごと |
| `InventoryItem` | 在庫。`isStaple` が常備品フラグ |
| `ShoppingListItem` | 買い物リストのアイテム。在庫から追加したものは `inventoryItemId` で在庫と紐づく |
| `Account` / `Session` / `VerificationToken` | Auth.js 用のテーブル |

## ローカル開発

Node.js 20 以上と PostgreSQL（Neon など）が必要。

```sh
npm install                 # postinstall で prisma generate も走る
# .env.local を作る（下記「環境変数」参照）
npx prisma migrate deploy   # DB にテーブルを作る
npm run dev                 # http://localhost:3000
```

| コマンド | 内容 |
|---|---|
| `npm run dev` | 開発サーバーを起動 |
| `npm run build` | 本番ビルド（Service Worker `public/sw.js` もここで生成される） |
| `npm run start` | ビルド結果を起動 |
| `npm run lint` | ESLint を実行 |
| `npx prisma migrate dev` | スキーマ変更からマイグレーションを作って適用 |
| `npx prisma studio` | DB の中身をブラウザで確認 |

Service Worker は開発中（`NODE_ENV=development`）は無効になっている。PWA の挙動を確認したいときは `npm run build && npm run start` で確認する。

## 環境変数

`.env.local` に置く（`.env*` は git 管理外）。`prisma.config.ts` も `.env.local` を読み込む。

| 変数名 | 説明 |
|---|---|
| `DATABASE_URL` | PostgreSQL の接続文字列 |
| `AUTH_SECRET` | Auth.js がセッションの JWT を暗号化するための秘密鍵。`npx auth secret` か `openssl rand -base64 32` で作る |

## デプロイ

`main` に push すると Vercel が自動でビルド・デプロイする。環境変数は Vercel の Project Settings → Environment Variables で設定する。マイグレーションは自動では流れないので、スキーマを変えたときは本番の `DATABASE_URL` に対して `npx prisma migrate deploy` を実行する。

## 開発の進め方

機能追加は [Spec Kit](https://github.com/github/spec-kit) で進めている。`specs/<番号>-<機能名>/` に仕様（`spec.md`）・計画（`plan.md`）・タスク（`tasks.md`）を置き、Claude Code の `/speckit-specify` → `/speckit-plan` → `/speckit-tasks` → `/speckit-implement` の順で作る。

| ディレクトリ | 内容 |
|---|---|
| `001-inventory-management` | 在庫管理アプリの初期実装 |
| `002-devtools-error-ui` | Next.js 開発ツールの非表示・API エラーのトースト通知 |
| `003-inventory-icon-actions` | 在庫カードの操作をスワイプからアイコンボタンに変更 |
| `004-remove-dark-mode` | 端末設定によるダークモード切り替えの削除 |
| `005-smart-inventory-sync` | 在庫同期のトースト通知・フォントサイズ調整 |

## メモ

- この Next.js は 16 系で、学習データの知識と API や規約が違うことがある。コードを書く前に `node_modules/next/dist/docs/` のガイドを確認する（`AGENTS.md` 参照）。middleware は `src/proxy.ts` になっている
- `package.json` と `prisma.config.ts` に seed（`tsx prisma/seed.ts`）が設定されているが、`prisma/seed.ts` はまだない。共通カテゴリ（`isPreset: true`）を用意したい場合は手で DB に入れる
- Prisma Client の生成先 `src/generated/prisma` は git 管理外
