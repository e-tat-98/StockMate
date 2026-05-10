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
      <div className="flex items-center justify-between px-4 py-2.5 border-b bg-white">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gray-900 text-white text-xs font-semibold flex items-center justify-center shrink-0">
            {(session.user.name ?? session.user.email ?? "?")[0].toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 truncate max-w-[180px]">
            {session.user.name ?? session.user.email}
          </span>
        </div>
        <LogoutButton />
      </div>
      <main className="flex-1">{children}</main>
      <BottomNav />
    </div>
  );
}
