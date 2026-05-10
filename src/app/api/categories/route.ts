import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await db.category.findMany({
    where: {
      OR: [{ isPreset: true }, { userId: session.user.id }],
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(categories);
}

const createCategorySchema = z.object({
  name: z.string().min(1, "カテゴリ名を入力してください"),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const parsed = createCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name } = parsed.data;
  const userId = session.user.id;

  const existing = await db.category.findFirst({
    where: { name, OR: [{ isPreset: true }, { userId }] },
  });

  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  const category = await db.category.create({
    data: { name, userId, isPreset: false },
  });

  return NextResponse.json(category, { status: 201 });
}
