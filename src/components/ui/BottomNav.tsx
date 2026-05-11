"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/inventory", label: "在庫一覧", icon: "📦" },
  { href: "/inventory/new", label: "在庫登録", icon: "➕" },
  { href: "/shopping-list", label: "買い物リスト", icon: "🛒" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center py-2 text-xs gap-1 ${
              isActive ? "text-black dark:text-white font-semibold" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
