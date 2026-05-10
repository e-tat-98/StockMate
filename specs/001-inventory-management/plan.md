# Implementation Plan: 在庫管理アプリ（StockMate）

**Branch**: `001-inventory-management` | **Date**: 2026-05-10 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/001-inventory-management/spec.md`

## Summary

食品・消耗品の在庫を管理し、家族間で共有できる PWA 対応 Web アプリ。Next.js App Router で構築し、在庫登録・一覧管理（インクリメンタルサーチ・インライン数量調整・スワイプ操作）・買い物リスト（常備品自動追加）の 3 画面を実装する。Auth.js v5 でメール/パスワード認証を提供し、Prisma + Neon（PostgreSQL）でデータ永続化、Vercel にデプロイする。

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+  
**Primary Dependencies**: Next.js 15（App Router）, Tailwind CSS 3, Zod 3, Prisma 5, Auth.js v5, TanStack Query v5, `@serwist/next`, `react-swipeable`  
**Storage**: PostgreSQL（Neon Serverless）  
**Testing**: Jest + React Testing Library（Unit/Component）, Playwright（E2E）  
**Target Platform**: Web（Vercel）+ モバイルブラウザ（PWA）  
**Project Type**: Full-stack Web Application  
**Performance Goals**: 検索結果 <500ms, 数量更新反映 <1s, PWA 起動 <3s  
**Constraints**: モバイルファースト、家族間データ共有（同一アカウント）、v1 ではオフライン動作不要  
**Scale/Scope**: 家族単位（〜10人/アカウント）、在庫アイテム数百件程度

## Constitution Check

Constitution は未設定（テンプレートのまま）のため、制約チェックなし。

*Post-design re-check*: データモデルおよびAPI設計はシンプルで YAGNI 原則に沿っている。単一の Next.js プロジェクト構成を選択し、不要な複雑性を排除した。

## Project Structure

### Documentation (this feature)

```text
specs/001-inventory-management/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output (REST API contract)
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks で生成)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx         # ログイン画面
│   │   └── signup/
│   │       └── page.tsx         # アカウント作成画面
│   ├── (protected)/
│   │   ├── layout.tsx           # 認証ガード（未ログインはログインへリダイレクト）
│   │   ├── inventory/
│   │   │   ├── page.tsx         # 在庫一覧画面
│   │   │   └── new/
│   │   │       └── page.tsx     # 在庫登録画面
│   │   └── shopping-list/
│   │       └── page.tsx         # 買い物リスト画面
│   ├── api/
│   │   ├── auth/
│   │   │   ├── signup/route.ts  # POST /api/auth/signup
│   │   │   └── [...nextauth]/route.ts  # Auth.js ハンドラ
│   │   ├── inventory/
│   │   │   ├── route.ts         # GET（一覧）, POST（作成）
│   │   │   ├── [id]/route.ts    # PATCH（更新）, DELETE（削除）
│   │   │   └── suggestions/route.ts  # GET（品目名サジェスト）
│   │   ├── shopping-list/
│   │   │   ├── route.ts         # GET（一覧）, POST（追加）
│   │   │   └── [id]/route.ts    # PATCH（チェック切替）, DELETE（削除）
│   │   └── categories/
│   │       └── route.ts         # GET（カテゴリ一覧）
│   ├── layout.tsx               # Root layout（TanStack Query Provider）
│   └── page.tsx                 # / → /inventory リダイレクト
├── components/
│   ├── inventory/
│   │   ├── InventoryForm.tsx    # 在庫登録フォーム（react-hook-form + Zod）
│   │   ├── InventoryList.tsx    # 在庫一覧（検索・フィルタ含む）
│   │   ├── InventoryCard.tsx    # 在庫アイテムカード（スワイプ対応）
│   │   └── InventoryCardSkeleton.tsx  # スケルトン表示
│   ├── shopping-list/
│   │   ├── ShoppingList.tsx     # 買い物リスト全体
│   │   └── ShoppingListItem.tsx # 個々のアイテム（チェックボックス）
│   └── ui/
│       ├── SearchInput.tsx      # インクリメンタルサーチ入力欄
│       └── SwipeableItem.tsx    # スワイプジェスチャー共通コンポーネント
├── lib/
│   ├── db.ts                    # Prisma Client シングルトン
│   ├── auth.ts                  # Auth.js 設定（Credentials Provider）
│   ├── validations/
│   │   ├── inventory.ts         # 在庫関連 Zod スキーマ
│   │   └── shopping-list.ts     # 買い物リスト関連 Zod スキーマ
│   └── hooks/
│       ├── useInventory.ts      # TanStack Query hooks（在庫 CRUD）
│       └── useShoppingList.ts   # TanStack Query hooks（買い物リスト CRUD）
└── types/
    └── index.ts                 # 共通型定義

prisma/
├── schema.prisma                # DB スキーマ（User, Category, InventoryItem, ShoppingListItem + Auth.js テーブル）
└── seed.ts                      # カテゴリプリセットデータ投入

public/
├── manifest.json                # PWA マニフェスト
└── icons/
    ├── icon-192x192.png         # PWA アイコン
    └── icon-512x512.png         # PWA アイコン
```

**Structure Decision**: 単一 Next.js プロジェクト（Option 1 相当）。フロントエンド・バックエンドを同一リポジトリで管理し、API Route Handlers でサーバーロジックを実装。Route Groups `(auth)` と `(protected)` でレイアウトを分離。

## Complexity Tracking

> 全項目 Constitution Check 通過。違反なし。

## Key Design Decisions（Referenceable）

| テーマ                | 決定事項                    | 根拠                                        |
|----------------------|----------------------------|---------------------------------------------|
| 認証                 | Auth.js v5 Credentials     | Next.js 統合・拡張容易性                     |
| ORM                  | Prisma 5                   | 型安全・マイグレーション管理                  |
| DB ホスティング      | Neon（Serverless PG）      | Vercel 統合・無料プラン十分                  |
| データフェッチ        | TanStack Query v5          | 楽観的更新・スケルトン表示の容易な実装         |
| スワイプ             | react-swipeable            | 軽量・TypeScript 対応                        |
| PWA                  | @serwist/next              | next-pwa 後継・Next.js 15 対応              |
| 検索                 | クライアントサイドフィルタ  | 数百件規模はクライアントで十分（SC-002 達成） |
| 自動追加ロジック      | PATCH トランザクション内    | 整合性保証・アトミック処理                   |
