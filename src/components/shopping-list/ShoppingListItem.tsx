"use client";

import type { ShoppingListItem as ShoppingListItemType } from "@/types";

type Props = {
  item: ShoppingListItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function ShoppingListItem({ item, onToggle, onDelete }: Props) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <input
        type="checkbox"
        checked={item.isPurchased}
        onChange={() => onToggle(item.id)}
        className="w-5 h-5 rounded"
      />
      <span
        className={`flex-1 text-sm ${
          item.isPurchased ? "line-through text-gray-400" : ""
        }`}
      >
        {item.name}
      </span>
      <button
        onClick={() => onDelete(item.id)}
        className="text-gray-400 hover:text-danger-600 text-sm px-1"
        aria-label="削除"
      >
        ✕
      </button>
    </div>
  );
}
