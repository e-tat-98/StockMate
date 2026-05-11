# Data Model: スマート在庫同期・UI改善

**Branch**: `005-smart-inventory-sync` | **Date**: 2026-05-11

## 変更なし

本フィーチャーはDBスキーマ・TypeScript型・APIコントラクトへの変更を一切行わない。
すべての自動処理ロジックはすでにバックエンドに実装済み。

## 既存の関連エンティティ（参照のみ）

### InventoryItem

```prisma
model InventoryItem {
  id         String   @id @default(cuid())
  name       String
  quantity   Int
  categoryId String
  isStaple   Boolean  @default(false)   // 常備品フラグ（今回の条件判定に使用）
  userId     String
  ...
  shoppingListItems ShoppingListItem[]  // 買い物リストとのリレーション
}
```

### ShoppingListItem

```prisma
model ShoppingListItem {
  id              String   @id @default(cuid())
  name            String
  isPurchased     Boolean  @default(false)
  userId          String
  inventoryItemId String?  // 在庫アイテムとのリンク（NULLなら手動追加）
  ...
  inventoryItem InventoryItem? @relation(...)
}
```

## 自動処理ロジックの流れ（既実装）

```
[在庫一覧] 数量「−」ボタン
  └→ PATCH /api/inventory/:id { quantity: n-1 }
       └→ isStaple=true && quantity=0 ?
            YES → ShoppingListItem 作成（inventoryItemId 付き）
            NO  → スキップ

[買い物リスト] チェックボックス ON
  └→ PATCH /api/shopping-list/:id
       └→ isPurchased を true に更新
       └→ inventoryItemId あり ?
            YES → InventoryItem.quantity += 1
            NO  → スキップ
```

## フロントエンドの追加（今回の変更）

既実装のバックエンドロジックに対応する **ユーザー通知** のみを追加する：

| トリガー | トースト内容 | 判定条件（クライアント側） |
|----------|-------------|--------------------------|
| 在庫更新成功 | 「〔名前〕を買い物リストへ自動追加しました」 | `data.isStaple && data.quantity === 0` |
| 買い物リスト toggle 成功 | 「〔名前〕の在庫数を自動で+1しました」 | `data.inventoryItemId && data.isPurchased` |
