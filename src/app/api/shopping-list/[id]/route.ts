import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.shoppingListItem.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const nextPurchased = !existing.isPurchased;

  const updated = await db.$transaction(async (tx) => {
    const item = await tx.shoppingListItem.update({
      where: { id },
      data: { isPurchased: nextPurchased },
    });

    if (existing.inventoryItemId) {
      const inventoryItem = await tx.inventoryItem.findFirst({
        where: { id: existing.inventoryItemId, userId },
      });
      if (inventoryItem) {
        const delta = nextPurchased ? 1 : -1;
        await tx.inventoryItem.update({
          where: { id: existing.inventoryItemId },
          data: { quantity: Math.max(0, inventoryItem.quantity + delta) },
        });
      }
    }

    return item;
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.shoppingListItem.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.shoppingListItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
