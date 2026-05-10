import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  if (!q) return NextResponse.json([]);

  const items = await db.inventoryItem.findMany({
    where: {
      userId: session.user.id,
      name: { contains: q, mode: "insensitive" },
    },
    select: { name: true },
    take: 50,
  });

  const names = [...new Set(items.map((i) => i.name))].slice(0, 10);
  return NextResponse.json(names);
}
