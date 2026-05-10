"use client";

import { useState } from "react";
import { ShoppingListItem } from "./ShoppingListItem";
import { useShoppingList } from "@/lib/hooks/useShoppingList";

export function ShoppingList() {
  const { query, addItem, toggleItem, deleteItem } = useShoppingList();
  const [newItemName, setNewItemName] = useState("");

  const items = query.data ?? [];
  const unchecked = items.filter((i) => !i.isPurchased);
  const checked = items.filter((i) => i.isPurchased);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemName.trim()) return;
    await addItem.mutateAsync({ name: newItemName.trim() });
    setNewItemName("");
  }

  if (query.isLoading) {
    return (
      <div className="px-4 py-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <form onSubmit={handleAdd} className="flex gap-2 px-4 py-3 border-b">
        <input
          type="text"
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          placeholder="アイテムを追加..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          disabled={!newItemName.trim() || addItem.isPending}
          className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-50"
        >
          追加
        </button>
      </form>

      {items.length === 0 ? (
        <p className="text-center text-gray-500 py-16">買い物リストは空です</p>
      ) : (
        <ul className="divide-y">
          {unchecked.map((item) => (
            <li key={item.id}>
              <ShoppingListItem
                item={item}
                onToggle={(id) => toggleItem.mutate(id)}
                onDelete={(id) => deleteItem.mutate(id)}
              />
            </li>
          ))}
          {checked.length > 0 && unchecked.length > 0 && (
            <li className="px-4 py-2 text-xs text-gray-400 bg-gray-50">
              購入済み
            </li>
          )}
          {checked.map((item) => (
            <li key={item.id}>
              <ShoppingListItem
                item={item}
                onToggle={(id) => toggleItem.mutate(id)}
                onDelete={(id) => deleteItem.mutate(id)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
