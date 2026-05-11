"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { InventoryItem } from "@/types";
import type { CreateInventoryInput, UpdateInventoryInput } from "@/lib/validations/inventory";
import { useToast } from "@/components/ui/Toast";

async function fetchInventory(): Promise<InventoryItem[]> {
  const res = await fetch("/api/inventory");
  if (!res.ok) throw new Error("Failed to fetch inventory");
  return res.json();
}

async function createInventoryItem(
  data: CreateInventoryInput
): Promise<InventoryItem> {
  const res = await fetch("/api/inventory", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create item");
  return res.json();
}

async function updateInventoryItem(
  id: string,
  data: UpdateInventoryInput
): Promise<InventoryItem> {
  const res = await fetch(`/api/inventory/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update item");
  return res.json();
}

async function deleteInventoryItem(id: string): Promise<void> {
  const res = await fetch(`/api/inventory/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete item");
}

export function useInventory() {
  const queryClient = useQueryClient();
  const { showError, showInfo } = useToast();

  const query = useQuery({
    queryKey: ["inventory"],
    queryFn: fetchInventory,
  });

  const createItem = useMutation({
    mutationFn: createInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: () => showError("在庫の登録に失敗しました"),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInventoryInput }) =>
      updateInventoryItem(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
      if (data.isStaple && data.quantity === 0) {
        showInfo(`${data.name}を買い物リストへ自動追加しました`);
      }
    },
    onError: () => showError("在庫の更新に失敗しました"),
  });

  const deleteItem = useMutation({
    mutationFn: deleteInventoryItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
    },
    onError: () => showError("在庫の削除に失敗しました"),
  });

  return { query, createItem, updateItem, deleteItem };
}
