# Implementation Plan: 在庫一覧 アイコンボタンアクション

**Branch**: `003-inventory-icon-actions` | **Date**: 2026-05-11 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/003-inventory-icon-actions/spec.md`

## Summary

在庫一覧の各アイテム行にあるスワイプ操作（`SwipeableItem` + `react-swipeable`）を廃止し、常時表示のアイコンボタン（ゴミ箱・買い物リスト）に置き換える。削除・追加いずれも既存の `ConfirmDialog` コンポーネントで確認バナーを表示し、ユーザーが明示的に操作を確定する。APIエンドポイントへの変更は不要。

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+  
**Primary Dependencies**: Next.js 16（App Router）, Tailwind CSS 4, Prisma 7, TanStack Query v5  
**Storage**: PostgreSQL（Neon Serverless）  
**Testing**: 手動テスト（UIコンポーネント変更のため）  
**Target Platform**: Web（Vercel）+ モバイルブラウザ（PWA）  
**Project Type**: Full-stack Web Application  
**Performance Goals**: 既存と同等（変更対象はUIのみ）  
**Constraints**: モバイルファーストUIを維持。アイコンボタンはタップしやすいサイズ（最低 44×44px）  
**Scale/Scope**: `InventoryCard.tsx` と `SwipeableItem.tsx` のみ変更対象

## Constitution Check

Constitution は未設定（テンプレートのまま）のため制約チェックなし。

*Post-design re-check*: 変更範囲は UI コンポーネント 2 ファイルのみ。既存の `ConfirmDialog` を再利用し、新規の抽象化なし。YAGNI 原則に完全に沿っている。

## Project Structure

### Documentation (this feature)

```text
specs/003-inventory-icon-actions/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output（変更なしのため最小限）
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Phase 2 output (/speckit-tasks で生成)
```

### Source Code (変更対象ファイル)

```text
src/components/inventory/
└── InventoryCard.tsx        # SwipeableItem 削除 → アイコンボタン追加

src/components/ui/
└── SwipeableItem.tsx        # 削除（InventoryCard のみで使用）
```

**contracts/**: API エンドポイントの変更なし → 作成不要

## Complexity Tracking

Constitution が未設定のため記載なし。
