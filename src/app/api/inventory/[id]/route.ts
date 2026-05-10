import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateInventorySchema } from "@/lib/validations/inventory";

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
  const body = await req.json();
  const parsed = updateInventorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const existing = await db.inventoryItem.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { quantity, ...rest } = parsed.data;

  const updated = await db.$transaction(async (tx) => {
    const item = await tx.inventoryItem.update({
      where: { id },
      data: {
        ...rest,
        ...(quantity !== undefined ? { quantity } : {}),
      },
      include: { category: true },
    });

    if (item.isStaple && item.quantity === 0) {
      const alreadyInList = await tx.shoppingListItem.findFirst({
        where: { userId, name: item.name, isPurchased: false },
      });
      if (!alreadyInList) {
        await tx.shoppingListItem.create({
          data: {
            name: item.name,
            userId,
            inventoryItemId: item.id,
          },
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

  const existing = await db.inventoryItem.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db.inventoryItem.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
