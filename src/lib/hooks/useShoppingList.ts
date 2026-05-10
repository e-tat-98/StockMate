"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { ShoppingListItem } from "@/types";
import type { CreateShoppingListItemInput } from "@/lib/validations/shopping-list";

async function fetchShoppingList(): Promise<ShoppingListItem[]> {
  const res = await fetch("/api/shopping-list");
  if (!res.ok) throw new Error("Failed to fetch shopping list");
  return res.json();
}

async function addShoppingListItem(
  data: CreateShoppingListItemInput
): Promise<ShoppingListItem> {
  const res = await fetch("/api/shopping-list", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to add item");
  return res.json();
}

async function toggleShoppingListItem(id: string): Promise<ShoppingListItem> {
  const res = await fetch(`/api/shopping-list/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isPurchased: true }),
  });
  if (!res.ok) throw new Error("Failed to toggle item");
  return res.json();
}

async function deleteShoppingListItem(id: string): Promise<void> {
  const res = await fetch(`/api/shopping-list/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete item");
}

export function useShoppingList() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["shopping-list"],
    queryFn: fetchShoppingList,
  });

  const addItem = useMutation({
    mutationFn: addShoppingListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });

  const toggleItem = useMutation({
    mutationFn: toggleShoppingListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });

  const deleteItem = useMutation({
    mutationFn: deleteShoppingListItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shopping-list"] });
    },
  });

  return { query, addItem, toggleItem, deleteItem };
}
