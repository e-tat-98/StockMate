"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInventorySchema, type CreateInventoryInput } from "@/lib/validations/inventory";
import { useCategories } from "@/lib/hooks/useCategories";

type Props = {
  onSubmit: (data: CreateInventoryInput) => Promise<void>;
  isLoading?: boolean;
};

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function InventoryForm({ onSubmit, isLoading }: Props) {
  const { data: categories = [] } = useCategories();
  const [nameInput, setNameInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedName = useDebounce(nameInput, 300);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  const today = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateInventoryInput>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: {
      purchaseDate: today,
      isStaple: false as boolean,
      quantity: 1,
    },
  });

  useEffect(() => {
    if (!debouncedName) {
      setSuggestions([]);
      return;
    }
    fetch(`/api/inventory/suggestions?q=${encodeURIComponent(debouncedName)}`)
      .then((r) => r.json())
      .then(setSuggestions)
      .catch(() => setSuggestions([]));
  }, [debouncedName]);

  function selectSuggestion(name: string) {
    setNameInput(name);
    setValue("name", name, { shouldValidate: true });
    setShowSuggestions(false);
  }

  async function onFormSubmit(data: CreateInventoryInput) {
    await onSubmit(data);
  }

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 px-4 py-6">
      {/* 品目 */}
      <div className="relative">
        <label className="block text-sm font-medium mb-1">
          品目 <span className="text-danger-600">*</span>
        </label>
        <input
          type="text"
          value={nameInput}
          onChange={(e) => {
            setNameInput(e.target.value);
            setValue("name", e.target.value, { shouldValidate: true });
            setShowSuggestions(true);
          }}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="例: 醤油"
        />
        <input type="hidden" {...register("name")} />
        {showSuggestions && suggestions.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg"
          >
            {suggestions.map((s) => (
              <li
                key={s}
                onMouseDown={() => selectSuggestion(s)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
        {errors.name && (
          <p className="text-xs text-danger-600 mt-1">{errors.name.message}</p>
        )}
      </div>

      {/* 数量 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          数量 <span className="text-danger-600">*</span>
        </label>
        <input
          type="number"
          min={1}
          {...register("quantity", { valueAsNumber: true })}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
        {errors.quantity && (
          <p className="text-xs text-danger-600 mt-1">
            {errors.quantity.message}
          </p>
        )}
      </div>

      {/* カテゴリ */}
      <div>
        <label className="block text-sm font-medium mb-1">
          カテゴリ <span className="text-danger-600">*</span>
        </label>
        <select
          {...register("categoryId")}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black bg-white"
        >
          <option value="">選択してください</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {errors.categoryId && (
          <p className="text-xs text-danger-600 mt-1">
            {errors.categoryId.message}
          </p>
        )}
      </div>

      {/* 購入日 */}
      <div>
        <label className="block text-sm font-medium mb-1">購入日</label>
        <input
          type="date"
          {...register("purchaseDate")}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* 期限 */}
      <div>
        <label className="block text-sm font-medium mb-1">
          賞味・消費期限（任意）
        </label>
        <input
          type="date"
          {...register("expiryDate")}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
        />
      </div>

      {/* 常備品 */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isStaple"
          {...register("isStaple")}
          className="w-4 h-4"
        />
        <label htmlFor="isStaple" className="text-sm">
          常備品（在庫0で買い物リストへ自動追加）
        </label>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-black text-white rounded-lg px-4 py-3 text-sm font-medium disabled:opacity-50"
      >
        {isLoading ? "登録中..." : "登録する"}
      </button>
    </form>
  );
}
