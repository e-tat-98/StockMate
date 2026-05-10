export type Category = {
  id: string;
  name: string;
  isPreset: boolean;
  userId: string | null;
  createdAt: Date;
};

export type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  categoryId: string;
  category: Category;
  purchaseDate: Date;
  expiryDate: Date | null;
  isStaple: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ShoppingListItem = {
  id: string;
  name: string;
  isPurchased: boolean;
  userId: string;
  inventoryItemId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
