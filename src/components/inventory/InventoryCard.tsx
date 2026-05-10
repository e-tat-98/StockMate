"use client";

import { useState } from "react";
import { SwipeableItem } from "@/components/ui/SwipeableItem";
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
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <SwipeableItem
        rightLabel="削除"
        leftLabel="買い物リスト"
        onSwipeRight={() => setShowConfirm(true)}
        onSwipeLeft={() => onAddToShoppingList(item.id, item.name)}
      >
        <div className="px-4 py-3 flex items-center justify-between gap-2 bg-white">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <p className="text-xs text-gray-500">{item.category.name}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 0}
              className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-bold disabled:opacity-30"
              aria-label="数量を減らす"
            >
              −
            </button>
            <span className="w-8 text-center font-semibold tabular-nums">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="w-8 h-8 rounded-full border flex items-center justify-center text-lg font-bold"
              aria-label="数量を増やす"
            >
              ＋
            </button>
          </div>
        </div>
      </SwipeableItem>

      <ConfirmDialog
        open={showConfirm}
        title={`「${item.name}」を削除しますか？`}
        description="この操作は元に戻せません"
        confirmLabel="削除"
        onConfirm={() => {
          onDelete(item.id);
          setShowConfirm(false);
        }}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}
