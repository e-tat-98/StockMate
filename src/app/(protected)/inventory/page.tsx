"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { InventoryList } from "@/components/inventory/InventoryList";
import { useCategories } from "@/lib/hooks/useCategories";

export default function InventoryPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const { data: categories } = useCategories();

  return (
    <div>
      <header className="px-4 pt-4 pb-3 border-b space-y-3 sticky top-0 bg-white dark:bg-gray-900 dark:border-gray-700 z-10">
        <h1 className="text-lg font-semibold">在庫一覧</h1>
        <SearchInput value={search} onChange={setSearch} placeholder="品目で検索..." />
        {categories && categories.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setCategoryId(null)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                categoryId === null
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              すべて
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryId(cat.id === categoryId ? null : cat.id)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  categoryId === cat.id
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </header>
      <InventoryList search={search} categoryId={categoryId} />
    </div>
  );
}
