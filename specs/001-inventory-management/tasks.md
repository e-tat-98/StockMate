# Tasks: 在庫管理アプリ（StockMate）

**Input**: Design documents from `specs/001-inventory-management/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.md ✅  
**Tests**: 未リクエストのためスキップ  
**Organization**: ユーザーストーリー別にグループ化し、各ストーリーが独立して実装・テスト・デモ可能

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: 並行実行可能（別ファイル・依存なし）
- **[Story]**: 対応するユーザーストーリー (US1〜US4)
- ファイルパスは全タスクに必須

---

## Phase 1: Setup（プロジェクト初期化）

**Purpose**: Next.js プロジェクトの骨格と開発環境を構築

- [ ] T001 Create Next.js 15 project with TypeScript using `npx create-next-app@latest stockmate --typescript --tailwind --app --src-dir --import-alias "@/*"`
- [ ] T002 Install dependencies: `prisma @prisma/client`, `@auth/prisma-adapter next-auth@beta`, `@tanstack/react-query`, `zod react-hook-form @hookform/resolvers`, `react-swipeable`, `@serwist/next serwist`, `bcryptjs @types/bcryptjs`
- [ ] T003 [P] Configure Tailwind CSS: extend theme with `danger-50` (#fef2f2) for expiry warning in `tailwind.config.ts`
- [ ] T004 [P] Configure TypeScript: set `strict: true`, add path alias `@/*` in `tsconfig.json`
- [ ] T005 Provision Neon PostgreSQL database and configure `.env.local` with `DATABASE_URL`, `AUTH_SECRET`

**Checkpoint**: `npm run dev` が起動し、`/` にアクセスできる状態

---

## Phase 2: Foundational（全 US に共通するブロッキング前提）

**Purpose**: 認証・DB・共通レイアウトが未完了では全ユーザーストーリーが進行不可

**⚠️ CRITICAL**: このフェーズ完了まで US 実装を開始しないこと

- [ ] T006 Define Prisma schema with User, Category, InventoryItem, ShoppingListItem, and Auth.js tables (Account, Session, VerificationToken) in `prisma/schema.prisma`
- [ ] T007 Run `npx prisma migrate dev --name init` and create Prisma Client singleton in `src/lib/db.ts`
- [ ] T008 Create category seed script in `prisma/seed.ts` with 7 presets (調味料, 冷凍食品, 日用品, 飲料, スナック菓子, 洗剤・掃除用品, ペーパー・衛生用品) and run `npx prisma db seed`
- [ ] T009 Configure Auth.js v5 Credentials Provider with bcrypt password verification in `src/lib/auth.ts`
- [ ] T010 [P] Implement Auth.js route handler in `src/app/api/auth/[...nextauth]/route.ts`
- [ ] T011 [P] Implement POST /api/auth/signup with Zod validation and bcrypt hashing in `src/app/api/auth/signup/route.ts`
- [ ] T012 [P] Create Zod validation schemas for inventory (name, quantity, categoryId, purchaseDate, expiryDate, isStaple) in `src/lib/validations/inventory.ts`
- [ ] T013 [P] Create Zod validation schemas for shopping list (name, inventoryItemId, isPurchased) in `src/lib/validations/shopping-list.ts`
- [ ] T014 Implement GET /api/categories returning presets + user categories in `src/app/api/categories/route.ts`
- [ ] T015 Configure TanStack Query Provider (`QueryClientProvider`) in root layout `src/app/layout.tsx`
- [ ] T016 [P] Create login page with email/password form in `src/app/(auth)/login/page.tsx`
- [ ] T017 [P] Create signup page with email/password/name form in `src/app/(auth)/signup/page.tsx`
- [ ] T018 [P] Create bottom navigation component (3 tabs: 在庫一覧 / 在庫登録 / 買い物リスト) in `src/components/ui/BottomNav.tsx`
- [ ] T019 Create protected layout with server-side auth guard and BottomNav in `src/app/(protected)/layout.tsx`
- [ ] T020 Create root redirect page `src/app/page.tsx` that redirects to `/inventory`

**Checkpoint**: ログイン・ログアウト・サインアップが動作し、未ログイン時は `/login` にリダイレクトされる

---

## Phase 3: User Story 1 - 在庫を登録する (Priority: P1) 🎯 MVP

**Goal**: ユーザーが在庫アイテムを登録でき、在庫一覧（簡易版）に表示される

**Independent Test**: フォームから「醤油 / 数量2 / 調味料」を登録し、一覧に表示されることを確認。在庫一覧のリッチ機能（スワイプ等）なしでも検証可能。

### Implementation for User Story 1

- [ ] T021 [US1] Implement GET /api/inventory (full list) and POST /api/inventory (create with Zod validation) in `src/app/api/inventory/route.ts`
- [ ] T022 [US1] Implement GET /api/inventory/suggestions?q= returning deduplicated name matches (max 10) in `src/app/api/inventory/suggestions/route.ts`
- [ ] T023 [US1] Create `useInventory` hook with TanStack Query (useQuery for list, useMutation for create) in `src/lib/hooks/useInventory.ts`
- [ ] T024 [P] [US1] Create `InventoryForm` component: fields (品目 with autocomplete, 数量, カテゴリ, 購入日 default today, 期限, 常備品チェック), react-hook-form + Zod validation in `src/components/inventory/InventoryForm.tsx`
- [ ] T025 [US1] Implement combobox autocomplete on 品目 field using `/api/inventory/suggestions` with 300ms debounce in `src/components/inventory/InventoryForm.tsx`
- [ ] T026 [US1] Create inventory registration page wiring `InventoryForm` with `useInventory.create` mutation and success redirect to `/inventory` in `src/app/(protected)/inventory/new/page.tsx`

**Checkpoint**: 在庫登録フォームから1件登録でき、`/inventory` に遷移後にアイテムが確認できる（一覧表示は最低限で可）

---

## Phase 4: User Story 2 - 在庫一覧を確認・管理する (Priority: P2)

**Goal**: 在庫一覧でインクリメンタルサーチ・数量±調整・スワイプ削除/追加・スケルトン・期限警告が動作する

**Independent Test**: 複数アイテムがある状態で「醤」と入力して絞り込み、＋/−で数量調整、右スワイプで削除、左スワイプで買い物リスト追加を確認

### Implementation for User Story 2

- [ ] T027 [US2] Implement PATCH /api/inventory/:id (partial update + staple auto-add transaction when quantity→0) and DELETE /api/inventory/:id in `src/app/api/inventory/[id]/route.ts`
- [ ] T028 [US2] Add `updateQuantity` and `deleteItem` mutations to `useInventory` hook in `src/lib/hooks/useInventory.ts`
- [ ] T029 [P] [US2] Create `SearchInput` component with controlled input and clear button in `src/components/ui/SearchInput.tsx`
- [ ] T030 [P] [US2] Create `SwipeableItem` wrapper using `react-swipeable` with left/right threshold and desktop fallback buttons in `src/components/ui/SwipeableItem.tsx`
- [ ] T031 [P] [US2] Create `InventoryCardSkeleton` component replicating card layout with Tailwind animate-pulse in `src/components/inventory/InventoryCardSkeleton.tsx`
- [ ] T032 [US2] Create `InventoryCard` component: quantity ±buttons, expiry warning (bg-red-50 when ≤7 days), swipe integration with `SwipeableItem`, delete confirmation dialog in `src/components/inventory/InventoryCard.tsx`
- [ ] T033 [US2] Create `InventoryList` component: client-side incremental search filter, skeleton display during fetch, empty state, renders `InventoryCard` list in `src/components/inventory/InventoryList.tsx`
- [ ] T034 [US2] Create inventory list page wiring `InventoryList` with `useInventory` query and `SearchInput` in `src/app/(protected)/inventory/page.tsx`
- [ ] T035 [US2] Implement optimistic update for quantity ±adjustment in `useInventory` hook to reflect within 1s (SC-003) in `src/lib/hooks/useInventory.ts`

**Checkpoint**: 在庫一覧でインクリメンタルサーチ・数量調整・スワイプ操作・スケルトン・期限ハイライトが全て動作する

---

## Phase 5: User Story 3 - 買い物リストを管理する (Priority: P3)

**Goal**: 買い物リストのチェックリスト管理・手動追加・削除・常備品自動追加・スワイプ追加が動作する

**Independent Test**: 手動でアイテムを追加し、チェックを入れて購入済みにし、削除する一連の操作が機能する。また常備品アイテムの在庫を0にすると自動でリストに追加されることを確認。

### Implementation for User Story 3

- [ ] T036 [US3] Implement GET /api/shopping-list and POST /api/shopping-list with dedup logic (same name + isPurchased=false check) in `src/app/api/shopping-list/route.ts`
- [ ] T037 [US3] Implement PATCH /api/shopping-list/:id (toggle isPurchased) and DELETE /api/shopping-list/:id in `src/app/api/shopping-list/[id]/route.ts`
- [ ] T038 [US3] Create `useShoppingList` hook with TanStack Query (useQuery, useMutation for add/toggle/delete) in `src/lib/hooks/useShoppingList.ts`
- [ ] T039 [US3] Add `invalidateQueries(['shopping-list'])` to `useInventory.updateQuantity` mutation so auto-added items appear immediately in `src/lib/hooks/useInventory.ts`
- [ ] T040 [P] [US3] Create `ShoppingListItem` component with checkbox toggle, item name, and delete button in `src/components/shopping-list/ShoppingListItem.tsx`
- [ ] T041 [US3] Create `ShoppingList` component: renders unchecked items first, then checked items; empty state in `src/components/shopping-list/ShoppingList.tsx`
- [ ] T042 [US3] Create shopping list page wiring `ShoppingList` with `useShoppingList` query in `src/app/(protected)/shopping-list/page.tsx`

**Checkpoint**: 買い物リスト画面で手動追加・チェック切替・削除が動作し、常備品在庫0時の自動追加も確認できる

---

## Phase 6: User Story 4 - ホーム画面にアプリを追加する (Priority: P4)

**Goal**: スマートフォンのブラウザで「ホーム画面に追加」でき、スタンドアロンモードで起動する

**Independent Test**: Android Chrome / iOS Safari でブラウザのメニューから「ホーム画面に追加」オプションが表示され、追加後にアイコンタップでアプリが起動する

### Implementation for User Story 4

- [ ] T043 [US4] Configure `@serwist/next` plugin in `next.config.ts` with NetworkFirst strategy for API routes and CacheFirst for static assets
- [ ] T044 [US4] Create `public/manifest.json` with name, short_name (StockMate), display: "standalone", theme_color, background_color, icons array pointing to `public/icons/`
- [ ] T045 [P] [US4] Add 192x192 and 512x512 PNG icons in `public/icons/` (可: placeholder icons for初期)
- [ ] T046 [US4] Add `<link rel="manifest">`, theme-color meta tag, and apple-mobile-web-app meta tags to root layout `src/app/layout.tsx`

**Checkpoint**: Lighthouse PWA 監査でインストール可能と判定される

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: UX 改善・エッジケース対応・全体整合性確認

- [ ] T047 [P] Add loading spinner / error boundary for auth redirect in `src/app/(protected)/layout.tsx`
- [ ] T048 [P] Add empty state illustrations (在庫なし・買い物リスト空) to `InventoryList` and `ShoppingList` components
- [ ] T049 Verify all acceptance scenarios from `specs/001-inventory-management/spec.md` User Stories 1〜4 on mobile browser (iPhone Safari + Android Chrome)
- [ ] T050 Add `robots.txt` and review Vercel deployment settings in `vercel.json`
- [ ] T051 Run `npm run build` to confirm zero TypeScript errors and successful production build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: 依存なし - 即座に開始可能
- **Phase 2 (Foundational)**: Phase 1 完了後 - **全 US をブロック**
- **Phase 3〜6 (US 1〜4)**: Phase 2 完了後 - 優先度順（P1 → P2 → P3 → P4）または並行実行
- **Phase 7 (Polish)**: 全 US 完了後

### User Story Dependencies

- **US1 (P1)**: Phase 2 完了後すぐ開始可能 - 他 US への依存なし
- **US2 (P2)**: Phase 2 完了後開始可能 - US1 の API（GET /api/inventory）を再利用するが独立テスト可能
- **US3 (P3)**: Phase 2 完了後開始可能 - US2 の PATCH 副作用（自動追加）を統合するため US2 後が自然だが、API レベルでは独立テスト可能
- **US4 (P4)**: US1〜3 と完全に独立 - いつでも着手可能

### Within Each User Story

- API ルート → TanStack Query フック → UI コンポーネント → ページの順
- [P] マークのタスクは前のタスクの完了を待たずに並行実行可能

### Parallel Opportunities

- Phase 1: T003, T004 を T001/T002 完了後に並行
- Phase 2: T010, T011, T012, T013 は T009 完了後に並行。T016, T017, T018 は T015 完了後に並行
- Phase 3: T024 は T023 着手と並行
- Phase 4: T029, T030, T031 はフェーズ開始後すぐ並行
- Phase 6: T045 は T044 と並行

---

## Parallel Example: User Story 2

```
# T027 完了後（PATCH/DELETE API 完成）:
並行 → T029 SearchInput コンポーネント
並行 → T030 SwipeableItem コンポーネント
並行 → T031 InventoryCardSkeleton コンポーネント
         ↓（T029〜T031 完了後）
     T032 InventoryCard（上記全て依存）
         ↓
     T033 InventoryList
         ↓
     T034 在庫一覧ページ
         ↓
     T035 楽観的更新の追加
```

---

## Implementation Strategy

### MVP First（US1 のみ）

1. Phase 1: Setup 完了
2. Phase 2: Foundational 完了（ログイン動作確認）
3. Phase 3: US1 完了（在庫登録 → 一覧表示）
4. **STOP & VALIDATE**: 在庫登録フローが完全に動作することを確認
5. Vercel にデプロイしてモバイルで動作確認

### Incremental Delivery

1. Setup + Foundational → 認証付きアプリの骨格
2. US1 → 在庫登録が動く MVP！デプロイ可能
3. US2 → 在庫一覧がリッチに。日常利用に耐える
4. US3 → 買い物リストで買い物サポート完成
5. US4 → PWA でホーム画面追加。ネイティブアプリ感
6. Polish → 細部を詰めて本番品質に

---

## Notes

- [P] タスク = 異なるファイル・依存なし → 並行実行可能
- [Story] ラベル = ユーザーストーリーへのトレーサビリティ
- 各 US は独立してデプロイ・デモ可能
- Phase 2 のチェックポイント（ログイン動作）まで US 実装を開始しない
- 楽観的更新（T035）は US2 の最後に追加してコア機能と分離
