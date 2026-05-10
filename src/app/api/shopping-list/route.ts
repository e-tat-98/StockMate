import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createShoppingListItemSchema } from "@/lib/validations/shopping-list";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.shoppingListItem.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPurchased: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createShoppingListItemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, inventoryItemId } = parsed.data;

  const existing = await db.shoppingListItem.findFirst({
    where: { userId: session.user.id, name, isPurchased: false },
  });
  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const item = await db.shoppingListItem.create({
    data: {
      name,
      userId: session.user.id,
      inventoryItemId: inventoryItemId ?? null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
