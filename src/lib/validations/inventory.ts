import { z } from "zod";

export const createInventorySchema = z.object({
  name: z.string().min(1, "品目を入力してください"),
  quantity: z.number().int().min(1, "数量は1以上の整数を入力してください"),
  categoryId: z.string().min(1, "カテゴリを選択してください"),
  purchaseDate: z.string().min(1),
  expiryDate: z.string().optional().nullable(),
  isStaple: z.boolean(),
});

export const updateInventorySchema = z.object({
  name: z.string().min(1).optional(),
  quantity: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional().nullable(),
  isStaple: z.boolean().optional(),
});

export type CreateInventoryInput = z.infer<typeof createInventorySchema>;
export type UpdateInventoryInput = z.infer<typeof updateInventorySchema>;
