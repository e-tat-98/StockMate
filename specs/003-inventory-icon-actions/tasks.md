# Tasks: 在庫一覧 アイコンボタンアクション

**Input**: Design documents from `specs/003-inventory-icon-actions/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

---

## Phase 1: Setup

**Purpose**: 既存プロジェクトへの変更のため、新規プロジェクト初期化は不要

*新規依存関係・設定変更なし。Phase 2 から開始。*

---

## Phase 2: Foundational (Blocking Prerequisite)

**Purpose**: スワイプUIの除去。US1・US2 どちらも着手前に完了が必要

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T001 src/components/inventory/InventoryCard.tsx の SwipeableItem import・ラッパーを削除し、アイテム行を plain div で包み直す（既存の quantity コントロールのレイアウトを維持）

**Checkpoint**: InventoryCard がスワイプなしで在庫一覧に表示されること

---

## Phase 3: User Story 1 - 削除アイコンボタン (Priority: P1) 🎯 MVP

**Goal**: ゴミ箱アイコンボタンをタップして削除確認ダイアログを経由し、アイテムを削除できる

**Independent Test**: 在庫一覧でゴミ箱アイコンをタップ → 確認バナー表示 → 「削除」で消える / 「キャンセル」で残る

### Implementation for User Story 1

- [x] T002 [US1] src/components/inventory/InventoryCard.tsx の item 行右側に inline SVG ゴミ箱アイコンボタンを追加し、タップで showDeleteConfirm=true をセットする（既存 ConfirmDialog と接続）

**Checkpoint**: ゴミ箱アイコンをタップすると「「{アイテム名}」を削除しますか？」確認ダイアログが表示され、削除・キャンセルが機能すること

---

## Phase 4: User Story 2 - 買い物リストアイコンボタン (Priority: P2)

**Goal**: 買い物リストアイコンボタンをタップして追加確認ダイアログを経由し、買い物リストへ追加できる

**Independent Test**: 在庫一覧で買い物リストアイコンをタップ → 確認バナー表示 → 「追加」で買い物リストに登録される / 「キャンセル」で何も変わらない

### Implementation for User Story 2

- [x] T003 [US2] src/components/inventory/InventoryCard.tsx に showAddConfirm state を追加し、item 行右側に inline SVG 買い物カートアイコンボタンを追加してタップで showAddConfirm=true をセットする
- [x] T004 [US2] src/components/inventory/InventoryCard.tsx に ConfirmDialog を追加する（title=「{item.name}」を買い物リストへ追加しますか？、confirmLabel=追加、description なし、onConfirm で onAddToShoppingList を呼び出し showAddConfirm=false）

**Checkpoint**: 買い物カートアイコンをタップすると追加確認ダイアログが表示され、追加・キャンセルが機能すること

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: 不要ファイル・依存の除去

- [x] T005 [P] src/components/ui/SwipeableItem.tsx を削除する（InventoryCard から参照されなくなったため）
- [x] T006 [P] react-swipeable が他ファイルで使われていないことを確認し、package.json の dependencies から react-swipeable を削除する

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: 依存なし - 即開始可能
- **User Story 1 (Phase 3)**: Phase 2 完了後に開始
- **User Story 2 (Phase 4)**: Phase 2 完了後に開始（Phase 3 と並列実行可能だが同一ファイルのため逐次推奨）
- **Polish (Phase 5)**: Phase 3 + Phase 4 完了後

### Parallel Opportunities

- T005, T006 は互いに並列実行可能
- T003, T004 は同一ファイルのため逐次実行

---

## Parallel Example: Polish Phase

```bash
# T005 と T006 を並列実行可能:
Task: "SwipeableItem.tsx を削除"
Task: "react-swipeable を package.json から削除"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational（SwipeableItem 除去）
2. Complete Phase 3: User Story 1（ゴミ箱アイコンボタン）
3. **STOP and VALIDATE**: ゴミ箱アイコンによる削除が機能することを確認
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 2 完了 → スワイプなしで在庫一覧が表示される
2. Phase 3 完了 → ゴミ箱アイコンで削除できる（MVP）
3. Phase 4 完了 → 買い物カートアイコンで買い物リストへ追加できる
4. Phase 5 完了 → 不要コード除去でクリーンな状態

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- ConfirmDialog コンポーネントは変更不要（confirmLabel/cancelLabel/title props で対応済み）
- SVG アイコンはインライン実装（外部ライブラリ不要）
- タップターゲットは最低 44×44px を確保すること
