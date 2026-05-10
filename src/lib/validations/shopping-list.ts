import { z } from "zod";

export const createShoppingListItemSchema = z.object({
  name: z.string().min(1, "アイテム名を入力してください"),
  inventoryItemId: z.string().optional().nullable(),
});

export const updateShoppingListItemSchema = z.object({
  isPurchased: z.boolean().optional(),
});

export type CreateShoppingListItemInput = z.infer<
  typeof createShoppingListItemSchema
>;
export type UpdateShoppingListItemInput = z.infer<
  typeof updateShoppingListItemSchema
>;
