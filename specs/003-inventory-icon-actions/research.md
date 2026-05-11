# Research: 在庫一覧 アイコンボタンアクション

## 調査結果

### ConfirmDialog の再利用性

**Decision**: 既存の `ConfirmDialog` コンポーネントを削除・追加どちらにも使用する  
**Rationale**: `confirmLabel` / `cancelLabel` / `title` が props で渡せるため、ラベルを変えるだけで「追加」確認バナーとしても機能する  
**Alternatives considered**: 新規バナーコンポーネント作成 → 不要な重複になるため却下

### アイコン実装方法

**Decision**: インライン SVG で trash・shopping-cart アイコンを実装する  
**Rationale**: プロジェクトに外部アイコンライブラリが存在しない。BottomNav はテキスト絵文字を使用しているが、操作ボタンにはより明確な SVG アイコンが適切  
**Alternatives considered**: 絵文字（🗑️🛒）→ モバイルでレンダリングが不統一になるリスクあり

### SwipeableItem の扱い

**Decision**: `SwipeableItem.tsx` を削除し、`react-swipeable` の依存も確認の上削除する  
**Rationale**: `SwipeableItem` は `InventoryCard.tsx` のみで参照されており、アイコンボタン化後は完全に不要になる  
**Alternatives considered**: ファイルを残す → 未使用コードを残すべきでないため却下

### InventoryCard のレイアウト変更

**Decision**: 数量コントロール（−・数値・＋）の左側にゴミ箱・買い物リストアイコンボタンを並べる  
**Rationale**: アイテム名側（左）にはテキスト情報があるため、操作ボタンは右側にまとめるのが視認性・操作性の観点でよい  
**Alternatives considered**: 行の右端に縦に並べる、行の左端に置く → いずれも既存レイアウトとの整合性が悪い

### 買い物リスト追加の ConfirmDialog

**Decision**: 追加確認バナーの `description` prop は省略する  
**Rationale**: 削除と違いデータが失われるわけではないため「この操作は元に戻せません」のような警告文は不要  
**Alternatives considered**: 説明文を追加する → ユーザーへの情報過多になるため却下
