import Image from 'next/image'
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BottomNav } from "@/components/ui/BottomNav";
import { LogoutButton } from "@/components/ui/LogoutButton";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="flex flex-col min-h-full pb-16">
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-white dark:bg-gray-900 dark:border-gray-700">
          <span>StockMate</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-[180px]">
              {session.user.name ?? session.user.email}
            </span>
            <LogoutButton />
          </div>
      </div>
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
