import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const db = new PrismaClient({ adapter });

const PRESET_CATEGORIES = [
  "調味料",
  "冷凍食品",
  "日用品",
  "飲料",
  "野菜・果物",
  "肉・魚",
  "お菓子",
  "掃除用品",
  "衛生用品",
];

async function main() {
  for (const name of PRESET_CATEGORIES) {
    await db.category.upsert({
      where: { id: `preset-${name}` },
      update: {},
      create: {
        id: `preset-${name}`,
        name,
        isPreset: true,
        userId: null,
      },
    });
  }
  console.log("Seeded preset categories");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
