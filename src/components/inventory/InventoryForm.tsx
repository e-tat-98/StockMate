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

  // 品目サジェスト
  const [nameInput, setNameInput] = useState("");
  const [nameSuggestions, setNameSuggestions] = useState<string[]>([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const debouncedName = useDebounce(nameInput, 300);

  // カテゴリサジェスト
  const [categoryInput, setCategoryInput] = useState("");
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateInventoryInput>({
    resolver: zodResolver(createInventorySchema),
    defaultValues: {
      isStaple: false as boolean,
      quantity: 1,
    },
  });

  useEffect(() => {
    if (!debouncedName) {
      setNameSuggestions([]);
      return;
    }
    fetch(`/api/inventory/suggestions?q=${encodeURIComponent(debouncedName)}`)
      .then((r) => r.json())
      .then(setNameSuggestions)
      .catch(() => setNameSuggestions([]));
  }, [debouncedName]);

  const filteredCategories = categoryInput
    ? categories.filter((c) =>
        c.name.toLowerCase().includes(categoryInput.toLowerCase())
      )
    : categories;

  function selectNameSuggestion(name: string) {
    setNameInput(name);
    setValue("name", name, { shouldValidate: true });
    setShowNameSuggestions(false);
  }

  function selectCategory(name: string) {
    setCategoryInput(name);
    setValue("categoryName", name, { shouldValidate: true });
    setShowCategorySuggestions(false);
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
            setShowNameSuggestions(true);
          }}
          onBlur={() => setTimeout(() => setShowNameSuggestions(false), 150)}
          onFocus={() => nameSuggestions.length > 0 && setShowNameSuggestions(true)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="例: 醤油"
        />
        <input type="hidden" {...register("name")} />
        {showNameSuggestions && nameSuggestions.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg">
            {nameSuggestions.map((s) => (
              <li
                key={s}
                onMouseDown={() => selectNameSuggestion(s)}
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
      <div className="relative">
        <label className="block text-sm font-medium mb-1">
          カテゴリ <span className="text-danger-600">*</span>
        </label>
        <input
          type="text"
          value={categoryInput}
          onChange={(e) => {
            setCategoryInput(e.target.value);
            setValue("categoryName", e.target.value, { shouldValidate: true });
            setShowCategorySuggestions(true);
          }}
          onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 150)}
          onFocus={() => setShowCategorySuggestions(true)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
          placeholder="例: 調味料"
        />
        <input type="hidden" {...register("categoryName")} />
        {showCategorySuggestions && filteredCategories.length > 0 && (
          <ul className="absolute z-10 w-full bg-white border rounded-lg mt-1 shadow-lg max-h-48 overflow-y-auto">
            {filteredCategories.map((c) => (
              <li
                key={c.id}
                onMouseDown={() => selectCategory(c.name)}
                className="px-3 py-2 text-sm cursor-pointer hover:bg-gray-100"
              >
                {c.name}
              </li>
            ))}
          </ul>
        )}
        {errors.categoryName && (
          <p className="text-xs text-danger-600 mt-1">
            {errors.categoryName.message}
          </p>
        )}
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
