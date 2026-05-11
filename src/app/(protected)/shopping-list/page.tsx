import { ShoppingList } from "@/components/shopping-list/ShoppingList";

export default function ShoppingListPage() {
  return (
    <div>
      <header className="px-4 py-4 border-b dark:border-gray-700">
        <h1 className="text-lg font-semibold">買い物リスト</h1>
      </header>
      <ShoppingList />
    </div>
  );
}
