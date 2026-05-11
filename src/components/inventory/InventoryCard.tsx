"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import type { InventoryItem } from "@/types";

type Props = {
  item: InventoryItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onDelete: (id: string) => void;
  onAddToShoppingList: (id: string, name: string) => void;
};

export function InventoryCard({
  item,
  onUpdateQuantity,
  onDelete,
  onAddToShoppingList,
}: Props) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddConfirm, setShowAddConfirm] = useState(false);

  return (
    <>
      <div className="px-4 py-3 flex items-center justify-between gap-2 bg-white dark:bg-gray-900">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{item.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.category.name}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowAddConfirm(true)}
            className="w-11 h-11 flex items-center justify-center text-green-600 hover:bg-green-50 rounded-full"
            aria-label="買い物リストへ追加"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-11 h-11 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-full"
            aria-label="削除"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14H6L5 6"/>
              <path d="M10 11v6M14 11v6"/>
              <path d="M9 6V4h6v2"/>
            </svg>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 0}
              className="w-8 h-8 rounded-full border dark:border-gray-600 flex items-center justify-center text-lg font-bold disabled:opacity-30"
              aria-label="数量を減らす"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-full border dark:border-gray-600 flex items-center justify-center text-lg font-bold"
              aria-label="数量を増やす"
            >
              ＋
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={showDeleteConfirm}
        title={`「${item.name}」を削除しますか？`}
        description="この操作は元に戻せません"
        confirmLabel="削除"
        onConfirm={() => {
          onDelete(item.id);
          setShowDeleteConfirm(false);
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      <ConfirmDialog
        open={showAddConfirm}
        title={`「${item.name}」を買い物リストへ追加しますか？`}
        confirmLabel="追加"
        onConfirm={() => {
          onAddToShoppingList(item.id, item.name);
          setShowAddConfirm(false);
        }}
        onCancel={() => setShowAddConfirm(false)}
      />
    </>
  );
}
