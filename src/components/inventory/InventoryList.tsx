"use client";

import { useMemo } from "react";
import { InventoryCard } from "./InventoryCard";
import { InventoryCardSkeleton } from "./InventoryCardSkeleton";
import { useInventory } from "@/lib/hooks/useInventory";
import { useShoppingList } from "@/lib/hooks/useShoppingList";
import type { InventoryItem } from "@/types";

type Props = {
  search: string;
};

export function InventoryList({ search }: Props) {
  const { query, updateItem, deleteItem } = useInventory();
  const { addItem } = useShoppingList();

  const filtered = useMemo(() => {
    const items: InventoryItem[] = query.data ?? [];
    if (!search) return items;
    const lower = search.toLowerCase();
    return items.filter((i) => i.name.toLowerCase().includes(lower));
  }, [query.data, search]);

  if (query.isLoading) {
    return (
      <ul className="divide-y dark:divide-gray-700">
        {[...Array(5)].map((_, i) => (
          <li key={i}>
            <InventoryCardSkeleton />
          </li>
        ))}
      </ul>
    );
  }

  if (filtered.length === 0) {
    return (
      <p className="text-center text-gray-500 dark:text-gray-400 py-16">
        {search ? "該当する在庫がありません" : "在庫がありません"}
      </p>
    );
  }

  return (
    <ul className="divide-y dark:divide-gray-700">
      {filtered.map((item) => (
        <li key={item.id}>
          <InventoryCard
            item={item}
            onUpdateQuantity={(id, quantity) =>
              updateItem.mutate({ id, data: { quantity } })
            }
            onDelete={(id) => deleteItem.mutate(id)}
            onAddToShoppingList={(_id, name) =>
              addItem.mutate({ name, inventoryItemId: _id })
            }
          />
        </li>
      ))}
    </ul>
  );
}
