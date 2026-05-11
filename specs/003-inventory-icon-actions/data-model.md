# Data Model: 在庫一覧 アイコンボタンアクション

## 変更なし

このフィーチャーはUIの操作方法を変更するものであり、データモデルへの変更はない。

- `InventoryItem` エンティティ: 変更なし
- 買い物リストへの追加処理: `addItem.mutate({ name, inventoryItemId })` を既存通り呼び出す
- 削除処理: `deleteItem.mutate(id)` を既存通り呼び出す
- APIエンドポイント: 変更なし

## UIコンポーネント状態

### InventoryCard（変更後）

| 状態 | 型 | 説明 |
|------|----|------|
| `showDeleteConfirm` | `boolean` | 削除確認ダイアログの表示フラグ |
| `showAddConfirm` | `boolean` | 買い物リスト追加確認ダイアログの表示フラグ |
