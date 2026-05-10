export function InventoryCardSkeleton() {
  return (
    <div className="px-4 py-3 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
          <div className="h-6 w-8 bg-gray-200 rounded" />
          <div className="h-8 w-8 bg-gray-200 rounded-full" />
        </div>
      </div>
    </div>
  );
}
