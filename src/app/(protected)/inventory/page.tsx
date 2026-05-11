"use client";

import { useState } from "react";
import { SearchInput } from "@/components/ui/SearchInput";
import { InventoryList } from "@/components/inventory/InventoryList";

export default function InventoryPage() {
  const [search, setSearch] = useState("");

  return (
    <div>
      <header className="px-4 pt-4 pb-3 border-b space-y-3 sticky top-0 bg-white dark:bg-gray-900 dark:border-gray-700 z-10">
        <h1 className="text-lg font-semibold">在庫一覧</h1>
        <SearchInput value={search} onChange={setSearch} placeholder="品目で検索..." />
      </header>
      <InventoryList search={search} />
    </div>
  );
}
