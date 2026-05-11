# Tasks: スマート在庫同期・UI改善

**Input**: Design documents from `specs/005-smart-inventory-sync/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅

**Tests**: 仕様に手動テストの記載があるため、テストタスクは含まない  
**Organization**: ユーザーストーリー別に整理（US1・US2 は Toast 拡張が共通前提）

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 並列実行可能（異なるファイル、依存なし）
- **[Story]**: 対応ユーザーストーリー（US1・US2・US3）

---

## Phase 1: Setup（スキップ）

既存プロジェクトへの追加変更のみ。新規セットアップ不要。

---

## Phase 2: Foundational（Toast 拡張）

**Purpose**: US1・US2 が使う `showInfo` メソッドを Toast に追加する。この変更が完了するまで US1・US2 は実装できない。

**⚠️ CRITICAL**: T001 完了後に US1・US2 を並列で進められる

- [x] T001 `showInfo` メソッドを `src/components/ui/Toast.tsx` に追加する。既存の `showError`（灰色スタイル）と共存させ、`showInfo` は緑系（例: `bg-green-700`）スタイルで表示する。`ToastContextValue` 型と `ToastProvider` 実装・`useToast` 返り値すべてに追加すること

**Checkpoint**: `useToast()` から `showInfo` が呼び出せる状態になること

---

## Phase 3: User Story 1 — 常備品の在庫切れで買い物リストへ自動追加（Priority: P1）🎯 MVP

**Goal**: 常備品アイテムの在庫が「−」ボタンで 0 になったとき、画面上部に「〔アイテム名〕を買い物リストへ自動追加しました」トーストを表示する

**Independent Test**: 常備品フラグ付きアイテムの在庫を 1→0 にしたとき、買い物リストに自動追加されトースト通知が表示されること。常備品フラグなしのアイテムでは通知が表示されないこと

### Implementation for User Story 1

- [x] T002 [US1] `src/lib/hooks/useInventory.ts` の `updateItem` ミューテーションの `onSuccess` コールバックを更新する。`data.isStaple === true && data.quantity === 0` のとき、`showInfo(\`${data.name}を買い物リストへ自動追加しました\`)` を呼び出す。`showError` と同様に `useToast()` から `showInfo` を取得して使うこと（T001 完了後に着手）

**Checkpoint**: 常備品アイテムの在庫が 0 になったとき、トーストが表示されること

---

## Phase 4: User Story 2 — 買い物リストのチェックで在庫を自動補充（Priority: P2）

**Goal**: 買い物リストで在庫連携アイテム（`inventoryItemId` あり）をチェックしたとき、「〔アイテム名〕の在庫数を自動で+1しました」トーストを表示する

**Independent Test**: 在庫一覧から追加されたアイテムのチェックをオンにしたとき、トースト通知が表示されること。手動で追加したアイテムでは通知が表示されないこと

### Implementation for User Story 2

- [x] T003 [US2] `src/lib/hooks/useShoppingList.ts` の `toggleItem` ミューテーションの `onSuccess` コールバックを更新する。`data.inventoryItemId && data.isPurchased === true` のとき、`showInfo(\`${data.name}の在庫数を自動で+1しました\`)` を呼び出す。`useToast()` から `showInfo` を取得して使うこと（T001 完了後に着手）

**Checkpoint**: 在庫連携アイテムをチェックしたとき、トーストが表示されること

---

## Phase 5: User Story 3 — フォントサイズ拡大（Priority: P3）

**Goal**: アプリ全体のフォントサイズをスマートフォンで読みやすいサイズに引き上げる

**Independent Test**: スマートフォン（375px 幅）でアプリを表示し、在庫一覧・買い物リスト・在庫登録のすべての画面でテキストが読みやすいサイズで表示されること

### Implementation for User Story 3

- [x] T004 [P] [US3] `src/app/globals.css` の `body` ブロックに `font-size: 1.0625rem;` を追加する（Tailwind デフォルトの 16px から 17px に拡大）。既存の `background` と `color` の記述は変更しないこと

**Checkpoint**: スマートフォン表示でフォントが一回り大きく見えること。既存レイアウトが崩れていないこと

---

## Phase 6: Polish & 手動検証

**Purpose**: 全ユーザーストーリーの動作確認と細部調整

- [ ] T005 在庫一覧で常備品アイテムの数量を 1→0 にして US1 のトーストが表示されること、かつ非常備品では表示されないことを確認する
- [ ] T006 買い物リストで在庫連携アイテムをチェックして US2 のトーストが表示されること、かつ手動追加アイテムでは表示されないことを確認する
- [ ] T007 スマートフォン（または DevTools の 375px ビュー）で全画面を確認し、フォントサイズの可読性と既存レイアウトの崩れがないことを確認する
- [ ] T008 エラートースト（`showError`）が引き続き正しく表示されることを確認する（Toast の変更が既存機能を壊していないこと）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: 即時開始可能
- **US1 (Phase 3)**: T001（Toast 拡張）完了後に開始
- **US2 (Phase 4)**: T001（Toast 拡張）完了後に開始（US1 と並列可能）
- **US3 (Phase 5)**: 他フェーズと完全独立。即時開始可能
- **Polish (Phase 6)**: 全フェーズ完了後

### User Story Dependencies

- **US1**: T001 に依存
- **US2**: T001 に依存（US1 と並列実行可能）
- **US3**: 依存なし（全フェーズと並列実行可能）

---

## Parallel Example

```bash
# T001 完了後、以下を並列実行：
Task T002: useInventory.ts に showInfo 追加（US1）
Task T003: useShoppingList.ts に showInfo 追加（US2）

# T001 と完全並列：
Task T004: globals.css にフォントサイズ追加（US3）
```

---

## Implementation Strategy

### MVP（US1 のみ）

1. T001 — Toast に `showInfo` 追加
2. T002 — useInventory に常備品トースト追加
3. T005 — 手動検証
4. **STOP & VALIDATE**: US1 が単独で動作することを確認

### Incremental Delivery

1. T001（Foundational）→ T002（US1）→ T003（US2）→ T004（US3）→ T005〜T008（Polish）
2. US3（T004）は他タスクと並列で進められる

---

## Notes

- [P] タスクは異なるファイルを扱うため並列実行可能
- T001 は US1・US2 共通の前提。Toast 変更が既存の `showError` を壊さないこと
- Toast のスタイル（`showInfo` の色）は実装時に調整可能（緑系推奨）
- `data.name` は API レスポンスに含まれるためクライアント側での追加取得は不要
