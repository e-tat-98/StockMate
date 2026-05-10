"use client";

import { useRouter } from "next/navigation";
import { InventoryForm } from "@/components/inventory/InventoryForm";
import { useInventory } from "@/lib/hooks/useInventory";
import type { CreateInventoryInput } from "@/lib/validations/inventory";

export default function NewInventoryPage() {
  const router = useRouter();
  const { createItem } = useInventory();

  async function handleSubmit(data: CreateInventoryInput) {
    await createItem.mutateAsync(data);
    router.push("/inventory");
  }

  return (
    <div>
      <header className="px-4 py-4 border-b">
        <h1 className="text-lg font-semibold">在庫登録</h1>
      </header>
      <InventoryForm
        onSubmit={handleSubmit}
        isLoading={createItem.isPending}
      />
    </div>
  );
}
