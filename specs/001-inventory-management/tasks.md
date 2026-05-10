# Tasks: 在庫管理アプリ（StockMate）

**Input**: Design documents from `specs/001-inventory-management/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅  
**Tests**: 未リクエストのためスキップ  
**Organization**: ユーザーストーリー別にグループ化し、各ストーリーが独立して実装・テスト・デモ可能

## 実際のスタック（設計書との差異メモ）

| 設計書記載 | 実際のバージョン | 影響 |
|-----------|----------------|------|
| Next.js 15 | **Next.js 16.2.6** | App Router パターンは同一 |
| Prisma 5 | **Prisma 7.8.0** | provider: `prisma-client`、output: `src/generated/prisma` |
| Zod 3 | **Zod 4.4.3** | 基本 API は同一、一部 enum/discriminated union に差異あり |
| Tailwind CSS 3 | **Tailwind CSS 4** | `tailwind.config.ts` 不要、`globals.css` の `@theme` で管理 |

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 並行実行可能（別ファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー (US1〜US4)
- ファイルパスは全タスクに必須

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: Next.js プロジェクトの骨格と開発環境を構築

- [x] T001 Create Next.js 16 project with TypeScript in worktree root (already done via `npx create-next-app@latest`)
- [x] T002 Install dependencies: `prisma @prisma/client`, `next-auth@beta @auth/prisma-adapter`, `@tanstack/react-query`, `zod react-hook-form @hookform/resolvers`, `react-swipeable`, `@serwist/next serwist`, `bcryptjs @types/bcryptjs`
- [x] T003 [P] Configure Tailwind CSS 4: add `--color-danger-50`, `--color-danger-100`, `--color-danger-600` to `@theme` block in `src/app/globals.css` (no tailwind.config.ts needed in v4)
- [x] T004 [P] Verify TypeScript `strict: true` and `@/*` path alias in `tsconfig.json` (already set by create-next-app)
- [ ] T005 Create `.env.local` from `.env.local.example` with Neon PostgreSQL `DATABASE_URL` and `AUTH_SECRET` (run `openssl rand -base64 32` for secret)

**Checkpoint**: `npm run dev` が起動し、`/` にアクセスできる状態

---

## Phase 2: Foundational（全 US に共通するブロッキング前提）

**Purpose**: 認証・DB・共通レイアウトが未完了では全ユーザーストーリーが進行不可

**⚠️ CRITICAL**: このフェーズ完了まで US 実装を開始しないこと

- [x] T006 Define Prisma schema with User, Category, InventoryItem, ShoppingListItem, and Auth.js tables in `prisma/schema.prisma` — use `provider = "prisma-client-js"` (standard, no custom output path needed)
- [x] T007a Create Prisma Client singleton in `src/lib/db.ts` — import from `@prisma/client`
- [ ] T007b Run `npx prisma migrate dev --name init` to create DB tables (requires `.env.local` with valid `DATABASE_URL`)
- [x] T008 Create category seed script in `prisma/seed.ts` with 7 presets: 調味料, 冷凍食品, 日用品, 飲料, スナック菓子, 洗剤・掃除用品, ペーパー・衛生用品; add `"prisma": {"seed": "ts-node prisma/seed.ts"}` to `package.json`
- [ ] T008b Run `npx prisma db seed` after T007b to insert preset categories (requires DB connection)
- [ ] T009 Configure Auth.js v5 Credentials Provider with bcrypt password verification in `src/lib/auth.ts`
- [ ] T010 [P] Implement Auth.js route handler in `src/app/api/auth/[...nextauth]/route.ts`
- [ ] T011 [P] Implement POST /api/auth/signup with Zod v4 validation and bcrypt hashing in `src/app/api/auth/signup/route.ts`
- [ ] T012 [P] Create Zod v4 validation schemas for inventory (name, quantity, categoryId, purchaseDate, expiryDate, isStaple) in `src/lib/validations/inventory.ts`
- [ ] T013 [P] Create Zod v4 validation schemas for shopping list (name, inventoryItemId, isPurchased) in `src/lib/validations/shopping-list.ts`
- [ ] T014 [P] Create shared `src/types/index.ts` with TypeScript types matching Prisma models
- [ ] T015 Implement GET /api/categories returning presets in `src/app/api/categories/route.ts`
- [ ] T016 Configure TanStack Query v5 Provider (`QueryClientProvider`) in `src/app/providers.tsx` and import in root layout `src/app/layout.tsx`
- [ ] T017 [P] Create login page with email/password form (Server Action or fetch to Auth.js) in `src/app/(auth)/login/page.tsx`
- [ ] T018 [P] Create signup page with email/password/name form calling `/api/auth/signup` in `src/app/(auth)/signup/page.tsx`
- [ ] T019 [P] Create bottom navigation component (3 tabs: 在庫一覧 / 在庫登録 / 買い物リスト) in `src/components/ui/BottomNav.tsx`
- [ ] T020 Create protected layout with `auth()` server-side guard and BottomNav in `src/app/(protected)/layout.tsx`
- [ ] T021 Create `src/middleware.ts` using Auth.js middleware to redirect unauthenticated users to `/login`
- [ ] T022 Create root page `src/app/page.tsx` that redirects to `/inventory`

**Checkpoint**: ログイン・ログアウト・サインアップが動作し、未ログイン時は `/login` にリダイレクトされる

---

## Phase 3: User Story 1 - 在庫を登録する (Priority: P1) 🎯 MVP

**Goal**: ユーザーが在庫アイテムを登録でき、在庫一覧（簡易版）に表示される

**Independent Test**: フォームから「醤油 / 数量2 / 調味料」を登録し、一覧ページに表示されることを確認。一覧のリッチ機能（スワイプ等）なしでも検証可能。

### Implementation for User Story 1

- [ ] T023 [US1] Implement GET /api/inventory (full list) and POST /api/inventory (create with Zod v4 validation, auth check) in `src/app/api/inventory/route.ts`
- [ ] T024 [US1] Implement GET /api/inventory/suggestions?q= returning deduplicated name matches from current user's items (max 10) in `src/app/api/inventory/suggestions/route.ts`
- [ ] T025 [US1] Create `useInventory` TanStack Query v5 hook: `useQuery` for list, `useMutation` for create in `src/lib/hooks/useInventory.ts`
- [ ] T026 [US1] Create `useCategories` hook for fetching category list in `src/lib/hooks/useCategories.ts`
- [ ] T027 [P] [US1] Create `InventoryForm` client component: fields (品目 with autocomplete combobox, 数量 integer, カテゴリ select, 購入日 default today, 期限 optional, 常備品 checkbox), react-hook-form + Zod v4 validation in `src/components/inventory/InventoryForm.tsx`
- [ ] T028 [US1] Implement 300ms debounce autocomplete on 品目 field calling `/api/inventory/suggestions` in `src/components/inventory/InventoryForm.tsx`
- [ ] T029 [US1] Create inventory registration page wiring `InventoryForm` with create mutation and success redirect to `/inventory` in `src/app/(protected)/inventory/new/page.tsx`
- [ ] T030 [US1] Create minimal inventory list page that renders fetched items (text list only) in `src/app/(protected)/inventory/page.tsx` — will be enhanced in US2

**Checkpoint**: 在庫登録フォームから1件登録でき、`/inventory` に遷移後にアイテムが表示される

---

## Phase 4: User Story 2 - 在庫一覧を確認・管理する (Priority: P2)

**Goal**: 在庫一覧でインクリメンタルサーチ・数量±調整・スワイプ削除/追加・スケルトン・期限警告が動作する

**Independent Test**: 複数アイテムがある状態で「醤」と入力して絞り込み、＋/−で数量調整、右スワイプで削除確認、左スワイプで買い物リスト追加を確認

### Implementation for User Story 2

- [ ] T031 [US2] Implement PATCH /api/inventory/:id (partial update; if isStaple && quantity→0 then add to shopping list in Prisma transaction) and DELETE /api/inventory/:id in `src/app/api/inventory/[id]/route.ts`
- [ ] T032 [US2] Add `updateItem` (optimistic update) and `deleteItem` mutations to `useInventory` hook in `src/lib/hooks/useInventory.ts`
- [ ] T033 [P] [US2] Create `SearchInput` client component with controlled input and clear button in `src/components/ui/SearchInput.tsx`
- [ ] T034 [P] [US2] Create `SwipeableItem` client component using `react-swipeable` with configurable left/right handlers and desktop button fallback in `src/components/ui/SwipeableItem.tsx`
- [ ] T035 [P] [US2] Create `InventoryCardSkeleton` component with Tailwind v4 `animate-pulse` matching card layout in `src/components/inventory/InventoryCardSkeleton.tsx`
- [ ] T036 [US2] Create `InventoryCard` client component: quantity ±buttons, expiry warning (`bg-danger-50` when ≤7 days from now), swipe via `SwipeableItem`, confirmation dialog for delete in `src/components/inventory/InventoryCard.tsx`
- [ ] T037 [US2] Create `InventoryList` client component: client-side name filter (incremental search), skeleton rows during `isFetching`, empty state, renders `InventoryCard` list in `src/components/inventory/InventoryList.tsx`
- [ ] T038 [US2] Replace minimal inventory list page with full `InventoryList` + `SearchInput` wiring in `src/app/(protected)/inventory/page.tsx`

**Checkpoint**: 在庫一覧でインクリメンタルサーチ・数量調整・スワイプ操作・スケルトン・期限ハイライトが全て動作する

---

## Phase 5: User Story 3 - 買い物リストを管理する (Priority: P3)

**Goal**: 買い物リストのチェックリスト管理・手動追加・削除・常備品自動追加・スワイプ追加が動作する

**Independent Test**: 手動でアイテムを追加し、チェックを入れて購入済みにし、削除する一連の操作が機能する。常備品在庫0時の自動追加も確認。

### Implementation for User Story 3

- [ ] T039 [US3] Implement GET /api/shopping-list and POST /api/shopping-list with dedup logic (skip if same name + isPurchased=false exists) in `src/app/api/shopping-list/route.ts`
- [ ] T040 [US3] Implement PATCH /api/shopping-list/:id (toggle isPurchased) and DELETE /api/shopping-list/:id in `src/app/api/shopping-list/[id]/route.ts`
- [ ] T041 [US3] Create `useShoppingList` TanStack Query v5 hook (useQuery, useMutation for add/toggle/delete) in `src/lib/hooks/useShoppingList.ts`
- [ ] T042 [US3] Add `queryClient.invalidateQueries({ queryKey: ['shopping-list'] })` to `updateItem` mutation callback in `src/lib/hooks/useInventory.ts` so auto-added items appear immediately
- [ ] T043 [P] [US3] Create `ShoppingListItem` client component with checkbox, item name (strikethrough when purchased), and delete button in `src/components/shopping-list/ShoppingListItem.tsx`
- [ ] T044 [US3] Create `ShoppingList` client component: unchecked items first, then checked; empty state message in `src/components/shopping-list/ShoppingList.tsx`
- [ ] T045 [US3] Create shopping list page wiring `ShoppingList` with `useShoppingList` query in `src/app/(protected)/shopping-list/page.tsx`

**Checkpoint**: 買い物リスト画面で手動追加・チェック切替・削除が動作し、常備品在庫0時の自動追加も確認できる

---

## Phase 6: User Story 4 - ホーム画面にアプリを追加する (Priority: P4)

**Goal**: スマートフォンのブラウザで「ホーム画面に追加」でき、スタンドアロンモードで起動する

**Independent Test**: iOS Safari / Android Chrome でブラウザメニューから「ホーム画面に追加」が表示され、追加後スタンドアロン起動する

### Implementation for User Story 4

- [ ] T046 [US4] Configure `@serwist/next` plugin in `next.config.ts`: add `withSerwist` wrapper with `swSrc: "src/sw.ts"`, `swDest: "public/sw.js"`, `disable: process.env.NODE_ENV === "development"`
- [ ] T047 [US4] Create service worker entry `src/sw.ts` using serwist's `defaultCache` (NetworkFirst for API routes, CacheFirst for static assets)
- [ ] T048 [US4] Create `public/manifest.json` with `name: "StockMate"`, `short_name: "StockMate"`, `display: "standalone"`, `theme_color: "#ffffff"`, `background_color: "#ffffff"`, `start_url: "/inventory"`, icons array
- [ ] T049 [P] [US4] Add 192×192 and 512×512 PNG placeholder icons in `public/icons/` (可: solid color PNGs as placeholders)
- [ ] T050 [US4] Add `<link rel="manifest">`, `<meta name="theme-color">`, and Apple touch icon meta tags to root layout `src/app/layout.tsx`

**Checkpoint**: Lighthouse PWA 監査でインストール可能と判定される（`display: standalone`, manifest, service worker）

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UX 改善・エッジケース対応・本番品質

- [ ] T051 [P] Add loading state to auth pages (spinner while sign-in / sign-up is processing) in `src/app/(auth)/login/page.tsx` and `src/app/(auth)/signup/page.tsx`
- [ ] T052 [P] Add confirmation dialog component (reusable) for swipe-delete action in `src/components/ui/ConfirmDialog.tsx`
- [ ] T053 Update `package.json` name from `stockmate-init` to `stockmate`
- [ ] T054 Run `npm run build` to verify zero TypeScript errors and successful production build
- [ ] T055 Verify all acceptance scenarios from `specs/001-inventory-management/spec.md` US1〜US4 on mobile browser (iOS Safari + Android Chrome)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: T005 は DB プロビジョニングが必要（手動ステップ）
- **Phase 2 (Foundational)**: T007b/T008b は T005 完了後 (DB 接続要)。残りのタスクは DB 不要で先行実装可能
- **Phase 3〜6 (US 1〜4)**: Phase 2 完了後 — 優先度順（P1→P2→P3→P4）
- **Phase 7 (Polish)**: 全 US 完了後

### User Story Dependencies

- **US1 (P1)**: Phase 2 完了後すぐ開始可能 — T030 は最低限の一覧表示で可
- **US2 (P2)**: US1 の API（GET/POST /api/inventory）を前提とするが独立実装可能
- **US3 (P3)**: Phase 2 完了後開始可能 — US2 の PATCH 副作用（T031）完了後が望ましい
- **US4 (P4)**: 完全独立 — T005〜T022 完了後いつでも着手可能

### Within Each User Story

- API ルート → TanStack Query フック → UI コンポーネント → ページ の順
- [P] マークのタスクは前のタスクの完了を待たずに並行実行可能

---

## Parallel Example: User Story 2

```
T031 完了後（PATCH/DELETE API）:
並行 → T033 SearchInput
並行 → T034 SwipeableItem
並行 → T035 InventoryCardSkeleton
         ↓（全て完了後）
     T036 InventoryCard（上記3つを使用）
         ↓
     T037 InventoryList
         ↓
     T038 在庫一覧ページ更新
```

---

## Implementation Strategy

### MVP First（US1 のみ）

1. T005: `.env.local` 設定（Neon DB プロビジョニング）
2. T007b: `npx prisma migrate dev --name init`
3. T008b: `npx prisma db seed`
4. T009〜T022: 認証・共通レイアウト
5. T023〜T030: 在庫登録 + 簡易一覧
6. **STOP & VALIDATE**: `/inventory/new` から登録 → `/inventory` に表示を確認
7. Vercel デプロイ → モバイルで動作確認

### Incremental Delivery

1. MVP (US1) → 在庫登録が動く → デプロイ可能
2. US2 → 在庫一覧がリッチに → 日常利用可能
3. US3 → 買い物リスト完成 → 買い物サポート
4. US4 → PWA → ネイティブアプリ感
5. Polish → 本番品質

---

## Notes

- T001〜T004 は `[x]` （実装済み）
- T006, T007a, T008 は `[x]` （ファイル作成済み、DB マイグレーションは T007b/T008b で別途）
- T005 は Neon DB プロビジョニングが必要（手動ステップ、CI/CD に影響）
- [P] タスク = 異なるファイル・依存なし → 並行実行可能
- Tailwind v4: `bg-danger-50` は `globals.css` の `@theme` で定義済み（T003 完了済み）
- Prisma 7: `provider = "prisma-client-js"` で通常の `@prisma/client` インポートが使える
