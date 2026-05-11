# Research: スマート在庫同期・UI改善

**Branch**: `005-smart-inventory-sync` | **Date**: 2026-05-11

## 調査結果

### Decision 1: isStaple フラグの存在確認

- **Decision**: `InventoryItem.isStaple: Boolean @default(false)` はDBスキーマ・TypeScript型ともに既存
- **Rationale**: 実装不要。フラグの読み取りのみで対応可能
- **Alternatives considered**: なし（確認のみ）

### Decision 2: inventoryItemId リンクの存在確認

- **Decision**: `ShoppingListItem.inventoryItemId: String?` はDBスキーマ・TypeScript型ともに既存
- **Rationale**: 在庫連携の追跡が可能。API レスポンスにも含まれている
- **Alternatives considered**: なし（確認のみ）

### Decision 3: バックエンドの自動処理ロジック

- **Decision**: 以下のバックエンドロジックはすでに実装済み
  - `PATCH /api/inventory/[id]`: `isStaple=true && quantity=0` のとき、未購入の同名アイテムが買い物リストになければ自動追加（`inventoryItemId` 付き）
  - `PATCH /api/shopping-list/[id]`: `isPurchased` をトグルする際、`inventoryItemId` があれば在庫数を `±1`（min 0）
- **Rationale**: APIへの変更不要。フロントエンドのみ変更する
- **Alternatives considered**: API にトースト表示用フラグを返す方式 → 不要（フロントで判定可能）

### Decision 4: Toast通知の実装方式

- **Decision**: 既存の `Toast.tsx` に `showInfo` メソッドを追加し、`showError` と共存させる。スタイルはカラーで区別（エラー=灰、情報=青系またはグリーン）
- **Rationale**: 既存の Toast インフラを再利用。新コンポーネント不要
- **Alternatives considered**: 
  - 新コンポーネント作成 → YAGNI 違反
  - `showError` をリネームして汎用化 → 既存の呼び出し箇所が多いためリスク大

### Decision 5: useInventory の staple 検知方法

- **Decision**: `updateItem.onSuccess(data)` で `data.isStaple && data.quantity === 0` を検知してトーストを表示
- **Rationale**: API レスポンスが更新後の `InventoryItem`（`include: { category: true }`）を返すため、クライアント側での判定が可能
- **Alternatives considered**: API 側でフラグを返す → 不要

### Decision 6: useShoppingList の在庫更新検知方法

- **Decision**: `toggleItem.onSuccess(data)` で `data.inventoryItemId && data.isPurchased` を検知してトーストを表示。アイテム名は `data.name` から取得
- **Rationale**: `PATCH /api/shopping-list/[id]` のレスポンスに `name`・`inventoryItemId`・`isPurchased` が含まれる
- **Alternatives considered**: なし

### Decision 7: フォントサイズの変更方法

- **Decision**: `globals.css` の `body` に `font-size: 1.0625rem`（17px 相当）を追加。Tailwind のデフォルト（16px）より 1px 大きく設定
- **Rationale**: 全コンポーネントに波及する最小変更。個別クラス変更は数が多すぎる
- **Alternatives considered**: Tailwind テーマの `fontSize` をオーバーライド → Tailwind v4 の設定ファイル構造を要確認、globals.css 直書きの方が確実

## 変更対象ファイルまとめ

| ファイル | 変更内容 |
|----------|----------|
| `src/components/ui/Toast.tsx` | `showInfo` メソッドを追加（緑系スタイル） |
| `src/lib/hooks/useInventory.ts` | `updateItem.onSuccess` で staple 検知トースト |
| `src/lib/hooks/useShoppingList.ts` | `toggleItem.onSuccess` で在庫更新検知トースト |
| `src/app/globals.css` | `body` にフォントサイズ追加 |

**API・DBへの変更なし**
