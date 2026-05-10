# API Contract: StockMate

**Branch**: `001-inventory-management` | **Date**: 2026-05-10  
**Type**: REST API (Next.js App Router Route Handlers)  
**Auth**: Auth.js v5 セッション認証（Cookie ベース）  
**Base URL**: `/api`

---

## 共通仕様

### 認証
- 全エンドポイント（`/api/auth/*` を除く）にはセッションCookieが必要
- 未認証リクエスト: `401 Unauthorized`
- 他ユーザーのリソースへのアクセス: `403 Forbidden`

### エラーレスポンス形式
```json
{
  "error": "エラーメッセージ（日本語可）",
  "details": { }  // Zod バリデーションエラーの場合のみ
}
```

### 共通ステータスコード
| コード | 意味                        |
|-------|-----------------------------|
| 200   | 成功                         |
| 201   | 作成成功                     |
| 204   | 削除成功（ボディなし）         |
| 400   | バリデーションエラー           |
| 401   | 未認証                       |
| 403   | 権限なし                     |
| 404   | リソース未発見               |
| 409   | 競合（重複など）              |
| 500   | サーバーエラー               |

---

## 認証エンドポイント

### POST /api/auth/signup
新規アカウント作成。

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "田中 太郎"
}
```

**Validation** (Zod):
- `email`: 有効なメール形式、必須
- `password`: 8文字以上、必須
- `name`: 最大50文字、任意

**Response 201**:
```json
{
  "user": {
    "id": "clxxxxx",
    "email": "user@example.com",
    "name": "田中 太郎"
  }
}
```

**Error 409**: メールアドレス重複

---

### Auth.js 管理エンドポイント
以下は Auth.js が自動処理するため、コントラクト定義不要:
- `POST /api/auth/callback/credentials` — ログイン
- `GET /api/auth/session` — セッション取得
- `POST /api/auth/signout` — ログアウト

---

## 在庫 API

### GET /api/inventory
在庫一覧取得。クライアントサイドフィルタリングのため全件返す。

**Query Parameters**:
| パラメータ | 型     | 必須 | 説明                                 |
|-----------|--------|------|--------------------------------------|
| category  | string | 任意 | カテゴリIDでフィルタ（将来拡張用）    |

**Response 200**:
```json
{
  "items": [
    {
      "id": "clxxxxx",
      "name": "醤油",
      "quantity": 2,
      "category": { "id": "clyyy", "name": "調味料" },
      "purchaseDate": "2026-05-01T00:00:00.000Z",
      "expiryDate": "2026-12-31T00:00:00.000Z",
      "isStaple": true,
      "createdAt": "2026-05-01T12:00:00.000Z",
      "updatedAt": "2026-05-10T09:00:00.000Z"
    }
  ]
}
```

---

### POST /api/inventory
在庫アイテムを新規登録。

**Request Body**:
```json
{
  "name": "醤油",
  "quantity": 2,
  "categoryId": "clyyy",
  "purchaseDate": "2026-05-10",
  "expiryDate": "2026-12-31",
  "isStaple": true
}
```

**Validation** (Zod):
- `name`: 必須、1〜100文字
- `quantity`: 必須、整数、0以上
- `categoryId`: 必須、有効なカテゴリID
- `purchaseDate`: 必須、ISO 日付文字列
- `expiryDate`: 任意、`purchaseDate` 以降の日付
- `isStaple`: 任意、デフォルト false

**Response 201**:
```json
{
  "item": { /* InventoryItem オブジェクト（GET と同形式） */ }
}
```

---

### PATCH /api/inventory/:id
在庫アイテムを更新。数量変更時は常備品チェックも実行。

**Request Body** (部分更新可):
```json
{
  "quantity": 0,
  "name": "醤油（大）",
  "categoryId": "clyyy",
  "expiryDate": "2026-12-31",
  "isStaple": true
}
```

**Validation** (Zod):
- `quantity`: 整数、0以上
- `name`: 1〜100文字
- `expiryDate`: null（削除）または ISO 日付文字列

**Side Effect**:
- `quantity` が 0 になり、かつ `isStaple = true` の場合:
  - `name` + `isPurchased=false` のアイテムが買い物リストに存在しなければ自動追加
  - 上記処理はトランザクション内で実行

**Response 200**:
```json
{
  "item": { /* 更新後の InventoryItem */ },
  "shoppingListAdded": true  // 自動追加が発生した場合のみ true
}
```

**Error 404**: アイテム未発見  
**Error 403**: 他ユーザーのアイテム

---

### DELETE /api/inventory/:id
在庫アイテムを削除。

**Response 204**: ボディなし  
**Error 404**: アイテム未発見  
**Error 403**: 他ユーザーのアイテム

---

### GET /api/inventory/suggestions
品目名のサジェスト候補取得（登録フォーム用）。

**Query Parameters**:
| パラメータ | 型     | 必須 | 説明                 |
|-----------|--------|------|----------------------|
| q         | string | 必須 | 検索クエリ（前方一致） |

**Response 200**:
```json
{
  "suggestions": ["醤油", "醤油（大）", "醤油（減塩）"]
}
```

注: ログインユーザーの在庫 `name` から重複排除して返す（最大10件）。

---

## カテゴリ API

### GET /api/categories
カテゴリ一覧取得（プリセット + ユーザー作成）。

**Response 200**:
```json
{
  "categories": [
    { "id": "clyyy", "name": "調味料", "isPreset": true },
    { "id": "clzzz", "name": "冷凍食品", "isPreset": true }
  ]
}
```

---

## 買い物リスト API

### GET /api/shopping-list
買い物リスト取得。未購入アイテムを先頭に表示。

**Response 200**:
```json
{
  "items": [
    {
      "id": "claaa",
      "name": "醤油",
      "isPurchased": false,
      "inventoryItemId": "clxxxxx",
      "createdAt": "2026-05-10T10:00:00.000Z"
    }
  ]
}
```

---

### POST /api/shopping-list
買い物リストにアイテムを追加。重複チェックあり。

**Request Body**:
```json
{
  "name": "醤油",
  "inventoryItemId": "clxxxxx"
}
```

**Validation** (Zod):
- `name`: 必須、1〜100文字
- `inventoryItemId`: 任意、有効な InventoryItem ID

**Dedup Logic**:
- 同ユーザーで `name` が一致し `isPurchased = false` のアイテムが存在する場合: 追加せず既存アイテムを返す

**Response 201**:
```json
{
  "item": { /* ShoppingListItem */ },
  "created": false  // 重複でスキップされた場合 false
}
```

---

### PATCH /api/shopping-list/:id
購入済み/未購入フラグを切り替え。

**Request Body**:
```json
{
  "isPurchased": true
}
```

**Response 200**:
```json
{
  "item": { /* 更新後の ShoppingListItem */ }
}
```

---

### DELETE /api/shopping-list/:id
買い物リストからアイテムを削除。

**Response 204**: ボディなし  
**Error 404**: アイテム未発見  
**Error 403**: 他ユーザーのアイテム
