import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createInventorySchema } from "@/lib/validations/inventory";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const items = await db.inventoryItem.findMany({
    where: { userId: session.user.id },
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createInventorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, quantity, categoryName, isStaple } = parsed.data;
  const userId = session.user.id;

  const userExists = await db.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!userExists) {
    return NextResponse.json({ error: "User not found" }, { status: 401 });
  }

  try {
    const existingCategory = await db.category.findFirst({
      where: {
        name: categoryName,
        OR: [{ isPreset: true }, { userId }],
      },
    });

    const category =
      existingCategory ??
      (await db.category.create({
        data: { name: categoryName, userId, isPreset: false },
      }));

    const item = await db.inventoryItem.create({
      data: {
        name,
        quantity,
        categoryId: category.id,
        isStaple: isStaple ?? false,
        userId,
      },
      include: { category: true },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (e) {
    console.error("[POST /api/inventory]", e);
    return NextResponse.json(
      { error: "Internal server error", details: String(e) },
      { status: 500 }
    );
  }
}
