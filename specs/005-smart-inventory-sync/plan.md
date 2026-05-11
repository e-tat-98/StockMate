# Implementation Plan: スマート在庫同期・UI改善

**Branch**: `005-smart-inventory-sync` | **Date**: 2026-05-11 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `specs/005-smart-inventory-sync/spec.md`

## Summary

常備品の在庫が0になったとき・買い物リストのチェックで在庫が+1されたときに、ユーザーへトースト通知を表示する。加えてアプリ全体のフォントサイズをスマホ向けに拡大する。バックエンドの自動処理ロジックはすでに実装済みのため、変更はフロントエンド4ファイルのみ。

## Technical Context

**Language/Version**: TypeScript 5+ / Node.js 20+  
**Primary Dependencies**: Next.js 16（App Router）, Tailwind CSS 4, TanStack Query v5  
**Storage**: 変更なし（PostgreSQL / Neon Serverless）  
**Testing**: 手動テスト（UIのみ）  
**Target Platform**: Web（Vercel）+ モバイルブラウザ（PWA）  
**Project Type**: Full-stack Web Application  
**Performance Goals**: 既存と同等  
**Constraints**: モバイルファーストUI維持  
**Scale/Scope**: フロントエンド4ファイルのみ変更

## Constitution Check

Constitution は未設定のため制約チェックなし。

*Post-design re-check*: 変更範囲はフロントエンド4ファイル。既存のToastインフラを再利用し新規抽象化なし。YAGNI原則に沿っている。

## Project Structure

### Documentation (this feature)

```text
specs/005-smart-inventory-sync/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks で生成)
```

### Source Code (変更対象ファイル)

```text
src/components/ui/
└── Toast.tsx                        # showInfo メソッド追加

src/lib/hooks/
├── useInventory.ts                  # updateItem.onSuccess でトースト呼び出し
└── useShoppingList.ts               # toggleItem.onSuccess でトースト呼び出し

src/app/
└── globals.css                      # body font-size 拡大
```

**DBスキーマ・API・型定義への変更なし**

## Complexity Tracking

Constitution が未設定のため記載なし。
