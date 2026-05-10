# Data Model: 在庫管理アプリ（StockMate）

**Branch**: `001-inventory-management` | **Date**: 2026-05-10

---

## エンティティ一覧

### 1. User（ユーザー）

認証用エンティティ。家族間で同一アカウントを共有する。

| フィールド  | 型        | 制約                    | 説明                   |
|------------|-----------|------------------------|------------------------|
| id         | String    | PK, cuid()             | 一意識別子              |
| email      | String    | UNIQUE, NOT NULL       | ログイン用メールアドレス |
| password   | String    | NOT NULL               | bcrypt ハッシュ済みPW   |
| name       | String?   | NULL 許容              | 表示名（任意）           |
| createdAt  | DateTime  | DEFAULT now()          | 作成日時                |
| updatedAt  | DateTime  | AUTO UPDATE            | 更新日時                |

**Relations**:
- `inventoryItems`: InventoryItem[] (one-to-many)
- `shoppingListItems`: ShoppingListItem[] (one-to-many)
- `sessions`: Session[] (one-to-many, Auth.js 管理)

**注意**: Auth.js の Prisma Adapter を使用するため、`Account` / `Session` / `VerificationToken` テーブルも自動生成されるが、アプリロジックからは直接操作しない。

---

### 2. Category（カテゴリ）

在庫アイテムを分類するラベル。システムプリセットとユーザー固有の両方を管理。

| フィールド  | 型        | 制約                   | 説明                               |
|------------|-----------|------------------------|------------------------------------|
| id         | String    | PK, cuid()             | 一意識別子                          |
| name       | String    | NOT NULL               | カテゴリ名（例: 調味料）             |
| isPreset   | Boolean   | DEFAULT false          | システムデフォルトの場合 true        |
| userId     | String?   | FK → User.id, NULL可   | null の場合はシステムプリセット      |
| createdAt  | DateTime  | DEFAULT now()          | 作成日時                            |

**Relations**:
- `user`: User? (many-to-one, nullable)
- `inventoryItems`: InventoryItem[] (one-to-many)

**プリセットデータ** (seed で投入):
`調味料`, `冷凍食品`, `日用品`, `飲料`, `スナック菓子`, `洗剤・掃除用品`, `ペーパー・衛生用品`

---

### 3. InventoryItem（在庫アイテム）

中核エンティティ。ユーザーが登録する食品・消耗品の在庫。

| フィールド   | 型        | 制約                   | 説明                                   |
|-------------|-----------|------------------------|----------------------------------------|
| id          | String    | PK, cuid()             | 一意識別子                              |
| name        | String    | NOT NULL               | 品目名（例: 醤油）                       |
| quantity    | Int       | NOT NULL, >= 0         | 在庫数（正の整数、0以上）                |
| categoryId  | String    | FK → Category.id       | カテゴリ                                |
| purchaseDate| DateTime  | NOT NULL               | 購入日（デフォルト: 登録当日）            |
| expiryDate  | DateTime? | NULL 許容              | 賞味期限・消費期限（未設定可）            |
| isStaple    | Boolean   | DEFAULT false          | 常備品フラグ                            |
| userId      | String    | FK → User.id, NOT NULL | 所有ユーザー                            |
| createdAt   | DateTime  | DEFAULT now()          | 作成日時                                |
| updatedAt   | DateTime  | AUTO UPDATE            | 更新日時                                |

**Relations**:
- `user`: User (many-to-one)
- `category`: Category (many-to-one)
- `shoppingListItems`: ShoppingListItem[] (one-to-many, optional link)

**バリデーションルール**:
- `quantity`: 整数、0以上（負値は不可）
- `name`: 空文字不可、最大100文字
- `expiryDate`: 購入日以降の日付

**状態遷移**:
```
quantity > 0
    │
    │ PATCH quantity = 0 かつ isStaple = true
    ▼
quantity = 0  ──────────────────────────────▶  ShoppingListItem 自動追加
                                               （同名の未購入アイテムが存在しない場合のみ）
    │
    │ PATCH quantity > 0
    ▼
quantity > 0
```

**期限警告トリガー**:
- `expiryDate` が現在日時から 7日以内: 警告状態（クライアントサイドで判定）
- `expiryDate` が null: 警告なし

---

### 4. ShoppingListItem（買い物リストアイテム）

買い物リストに追加されたアイテム。手動・スワイプ・自動追加の3経路で生成される。

| フィールド        | 型        | 制約                     | 説明                                       |
|------------------|-----------|--------------------------|---------------------------------------------|
| id               | String    | PK, cuid()               | 一意識別子                                   |
| name             | String    | NOT NULL                 | 品目名                                       |
| isPurchased      | Boolean   | DEFAULT false            | 購入済みフラグ                               |
| userId           | String    | FK → User.id, NOT NULL   | 所有ユーザー                                 |
| inventoryItemId  | String?   | FK → InventoryItem.id, NULL可 | 元の在庫アイテムへのリンク（自動追加時に設定）|
| createdAt        | DateTime  | DEFAULT now()            | 作成日時                                     |
| updatedAt        | DateTime  | AUTO UPDATE              | 更新日時                                     |

**Relations**:
- `user`: User (many-to-one)
- `inventoryItem`: InventoryItem? (many-to-one, nullable)

**重複追加防止ルール**:
- 同一ユーザーで `name` が一致し `isPurchased = false` のアイテムが存在する場合、追加をスキップ
- DB の UNIQUE 制約ではなくアプリロジックで制御（同名アイテムの複数購入を将来許容するため）

**状態遷移**:
```
isPurchased = false（未購入）
    │
    │ ユーザーがチェック
    ▼
isPurchased = true（購入済み）
    │
    │ ユーザーがチェック解除
    ▼
isPurchased = false（未購入）
    │
    │ ユーザーが削除
    ▼
（削除）
```

**生成経路**:
1. **手動追加**: ユーザーが買い物リスト画面から直接追加
2. **スワイプ追加**: 在庫一覧で左スワイプ → `POST /api/shopping-list`
3. **自動追加**: 常備品の `quantity` が 0 になった時 → サーバーサイドトランザクション

---

## ER 図（テキスト形式）

```
User (1) ──────────── (N) InventoryItem
  │                         │
  │                    (N)  │  (1)
  │                       Category
  │
  └──────────── (N) ShoppingListItem
                       │
                  (N)  │  (1, optional)
                    InventoryItem
```

---

## Auth.js 管理テーブル（自動生成）

Auth.js の Prisma Adapter が自動管理するため、アプリコードから直接操作しない。

| テーブル           | 用途                           |
|-------------------|-------------------------------|
| Account           | OAuth プロバイダー情報          |
| Session           | セッション管理（DB セッション時） |
| VerificationToken | メール確認トークン              |
